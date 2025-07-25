import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '$lib/utils/errorHandling';
import type { UserTuneFull } from '$core/data/models/UserTune';
import { createUserTune, incrementPlayCount } from '$core/data/models/UserTune';

const db = getFirestore();

/**
 * ユーザーの曲データを取得する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @returns ユーザーの曲データ、存在しない場合はデフォルト値
 */
export async function getUserTuneData(
	userId: string,
	tuneId: string
): Promise<UserTuneFull | null> {
	if (!userId || !tuneId) {
		console.warn('ユーザー曲データ取得: ユーザーIDまたは曲IDが指定されていません');
		return null;
	}

	try {
		const docRef = doc(db, `users/${userId}/tunes/${tuneId}`);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		const data = docSnap.data();
		return createUserTune(
			{
				id: tuneId,
				rememberName: data.rememberName || false,
				rememberMelody: data.rememberMelody || false,
				playCount: data.playCount || 0,
				lastPlayedDate: data.lastPlayedDate
			},
			{
				note: data.note || '',
				playHistory: data.playHistory || {}
			}
		);
	} catch (error) {
		console.error('ユーザー曲データ取得エラー:', getFirebaseErrorMessage(error));
		return null;
	}
}

/**
 * ユーザーの曲の覚えた状態を更新する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @param rememberName 曲名を覚えたか
 * @param rememberMelody メロディーを覚えたか
 * @returns 成功したかどうか
 */
export async function updateMemoryStatus(
	userId: string,
	tuneId: string,
	rememberName?: boolean,
	rememberMelody?: boolean
): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('記憶状態更新: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const docRef = doc(db, `users/${userId}/tunes/${tuneId}`);
		const updateData: { [key: string]: any } = {};

		if (rememberName !== undefined) {
			updateData.rememberName = rememberName;
		}
		if (rememberMelody !== undefined) {
			updateData.rememberMelody = rememberMelody;
		}

		await setDoc(docRef, updateData, { merge: true });
		return true;
	} catch (error) {
		console.error('記憶状態更新エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}

/**
 * ユーザーの曲の演奏回数を増やす
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @param date 日付（YYYY-MM-DD形式、デフォルトは今日）
 * @param count 増やす回数（デフォルトは1）
 * @returns 成功したかどうか
 */
export async function incrementUserTunePlayCount(
	userId: string,
	tuneId: string,
	date?: string,
	count: number = 1
): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('演奏回数増加: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const today = date || new Date().toISOString().split('T')[0];

		// 現在のデータを取得
		const currentData = await getUserTuneData(userId, tuneId);

		// データが存在しない場合は新規作成
		const userTune =
			currentData ||
			createUserTune({
				id: tuneId,
				rememberName: false,
				rememberMelody: false,
				playCount: 0
			});

		// 演奏回数を増やす
		const updatedUserTune = incrementPlayCount(userTune, today, count);

		// Firestoreに保存
		const docRef = doc(db, `users/${userId}/tunes/${tuneId}`);
		await setDoc(
			docRef,
			{
				playCount: updatedUserTune.playCount,
				playHistory: updatedUserTune.playHistory,
				lastPlayedDate: updatedUserTune.lastPlayedDate,
				rememberName: updatedUserTune.rememberName,
				rememberMelody: updatedUserTune.rememberMelody,
				note: updatedUserTune.note
			},
			{ merge: true }
		);

		return true;
	} catch (error) {
		console.error('演奏回数増加エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}

/**
 * ユーザーの曲のメモを更新する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @param note メモ
 * @returns 成功したかどうか
 */
export async function updateUserTuneNote(
	userId: string,
	tuneId: string,
	note: string
): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('メモ更新: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const docRef = doc(db, `users/${userId}/tunes/${tuneId}`);
		await setDoc(docRef, { note }, { merge: true });
		return true;
	} catch (error) {
		console.error('メモ更新エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}
