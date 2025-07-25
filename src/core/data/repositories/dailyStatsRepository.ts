import {
	getFirestore,
	getDoc,
	doc,
	setDoc
} from 'firebase/firestore';
import { getFirebaseErrorMessage } from '$lib/utils/errorHandling';

const db = getFirestore();

/**
 * 日次統計データの型
 */
export interface DailyStatsData {
	[tuneId: string]: number;
}

/**
 * ユーザーの日次統計データを取得する
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 * @returns 日次統計データ
 */
export async function getDailyStats(userId: string, date: string): Promise<DailyStatsData> {
	if (!userId || !date) {
		console.warn('日次統計取得: ユーザーIDまたは日付が指定されていません');
		return {};
	}

	try {
		const docRef = doc(db, `users/${userId}/daily/${date}`);
		const docSnap = await getDoc(docRef);
		
		if (!docSnap.exists()) {
			return {};
		}

		return docSnap.data() as DailyStatsData;
	} catch (error) {
		console.error('日次統計取得エラー:', getFirebaseErrorMessage(error));
		return {};
	}
}

/**
 * 特定の曲の日次演奏回数を取得する
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 * @param tuneId 曲ID
 * @returns その日の演奏回数
 */
export async function getDailyTunePlayCount(userId: string, date: string, tuneId: string): Promise<number> {
	if (!userId || !date || !tuneId) {
		console.warn('日次曲演奏回数取得: 必要なパラメータが指定されていません');
		return 0;
	}

	try {
		const dailyStats = await getDailyStats(userId, date);
		return dailyStats[tuneId] || 0;
	} catch (error) {
		console.error('日次曲演奏回数取得エラー:', getFirebaseErrorMessage(error));
		return 0;
	}
}

/**
 * 日次統計を更新する
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 * @param tuneId 曲ID
 * @param playCount 演奏回数
 * @returns 成功したかどうか
 */
export async function updateDailyStats(
	userId: string,
	date: string,
	tuneId: string,
	playCount: number
): Promise<boolean> {
	if (!userId || !date || !tuneId) {
		console.warn('日次統計更新: 必要なパラメータが指定されていません');
		return false;
	}

	try {
		const docRef = doc(db, `users/${userId}/daily/${date}`);
		await setDoc(docRef, { [tuneId]: playCount }, { merge: true });
		return true;
	} catch (error) {
		console.error('日次統計更新エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}

/**
 * 日次統計の演奏回数を増やす
 * @param userId ユーザーID
 * @param date 日付（YYYY-MM-DD形式）
 * @param tuneId 曲ID
 * @param increment 増加数（デフォルト1）
 * @returns 新しい演奏回数、エラーの場合は-1
 */
export async function incrementDailyPlayCount(
	userId: string,
	date: string,
	tuneId: string,
	increment: number = 1
): Promise<number> {
	if (!userId || !date || !tuneId) {
		console.warn('日次演奏回数増加: 必要なパラメータが指定されていません');
		return -1;
	}

	try {
		const currentCount = await getDailyTunePlayCount(userId, date, tuneId);
		const newCount = currentCount + increment;
		
		const success = await updateDailyStats(userId, date, tuneId, newCount);
		return success ? newCount : -1;
	} catch (error) {
		console.error('日次演奏回数増加エラー:', getFirebaseErrorMessage(error));
		return -1;
	}
}