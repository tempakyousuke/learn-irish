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

const db = getFirestore();

/**
 * ユーザーのお気に入りに曲が登録されているか確認する
 * @param {string} userId - ユーザーID
 * @param {string} tuneId - 曲ID
 */
export async function checkFavorite(userId: string, tuneId: string) {
	try {
		const favoriteRef = doc(db, `users/${userId}/favorites/${tuneId}`);
		const docSnap = await getDoc(favoriteRef);
		return docSnap.exists();
	} catch (error) {
		console.error('お気に入り確認エラー:', error);
		return false;
	}
}
/**
 * ユーザーのお気に入りの曲IDの一覧を取得する
 * @param {string} userId - ユーザーID
 */
export async function getFavorites(userId: string) {
	try {
		const favoritesRef = collection(db, `users/${userId}/favorites`);
		const snapshot = await getDocs(favoritesRef);
		const favorites: string[] = [];
		snapshot.forEach((doc) => {
			favorites.push(doc.id);
		});
		return favorites;
	} catch (error) {
		console.error('お気に入り取得エラー:', error);
		return [];
	}
}

/**
 * ユーザーのお気に入りに曲を追加する
 * @param {string} userId - ユーザーID
 * @param {string} tuneId - 曲ID
 */
export async function addFavorite(userId: string, tuneId: string) {
	try {
		const favoriteRef = doc(collection(db, `users/${userId}/favorites`), tuneId);
		await setDoc(favoriteRef, {
			tuneId: tuneId,
			addedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('お気に入り追加エラー:', error);
	}
}

/**
 * ユーザーのお気に入りから曲を削除する
 * @param {string} userId - ユーザーID
 * @param {string} tuneId - 曲ID
 */
export async function removeFavorite(userId: string, tuneId: string) {
	try {
		const favoriteRef = doc(db, `users/${userId}/favorites/${tuneId}`);
		await deleteDoc(favoriteRef);
	} catch (error) {
		console.error('お気に入り削除エラー:', error);
	}
}
