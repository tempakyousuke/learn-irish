import {
	getFirestore,
	getDoc,
	getDocs,
	doc,
	collection,
	setDoc,
	deleteDoc,
	serverTimestamp
} from 'firebase/firestore';
import { getFirebaseErrorMessage } from '$lib/utils/errorHandling';

const db = getFirestore();

/**
 * お気に入り情報の型
 */
interface FavoriteData {
	tuneId: string;
	addedAt: ReturnType<typeof serverTimestamp>;
	note?: string;
}

/**
 * ユーザーのお気に入りに曲が登録されているか確認する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @returns 登録されているかどうか
 */
export async function checkFavorite(userId: string, tuneId: string): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('お気に入り確認: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const favoriteRef = doc(db, `users/${userId}/favorites/${tuneId}`);
		const docSnap = await getDoc(favoriteRef);
		return docSnap.exists();
	} catch (error) {
		console.error('お気に入り確認エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}

/**
 * ユーザーのお気に入りの曲IDの一覧を取得する
 * @param userId ユーザーID
 * @returns お気に入りの曲IDの配列
 */
export async function getFavorites(userId: string): Promise<string[]> {
	if (!userId) {
		console.warn('お気に入り取得: ユーザーIDが指定されていません');
		return [];
	}

	try {
		const favoritesRef = collection(db, `users/${userId}/favorites`);
		const snapshot = await getDocs(favoritesRef);
		const favorites: string[] = [];
		snapshot.forEach((doc) => {
			favorites.push(doc.id);
		});
		return favorites;
	} catch (error) {
		console.error('お気に入り取得エラー:', getFirebaseErrorMessage(error));
		return [];
	}
}

/**
 * ユーザーのお気に入りに曲を追加する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @param note メモ（オプション）
 * @returns 成功したかどうか
 */
export async function addFavorite(userId: string, tuneId: string, note?: string): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('お気に入り追加: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const favoriteRef = doc(collection(db, `users/${userId}/favorites`), tuneId);
		const favoriteData: FavoriteData = {
			tuneId: tuneId,
			addedAt: serverTimestamp()
		};

		if (note) {
			favoriteData.note = note;
		}

		await setDoc(favoriteRef, favoriteData);
		return true;
	} catch (error) {
		console.error('お気に入り追加エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}

/**
 * ユーザーのお気に入りから曲を削除する
 * @param userId ユーザーID
 * @param tuneId 曲ID
 * @returns 成功したかどうか
 */
export async function removeFavorite(userId: string, tuneId: string): Promise<boolean> {
	if (!userId || !tuneId) {
		console.warn('お気に入り削除: ユーザーIDまたは曲IDが指定されていません');
		return false;
	}

	try {
		const favoriteRef = doc(db, `users/${userId}/favorites/${tuneId}`);
		await deleteDoc(favoriteRef);
		return true;
	} catch (error) {
		console.error('お気に入り削除エラー:', getFirebaseErrorMessage(error));
		return false;
	}
}
