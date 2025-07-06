import { doc, getDoc, setDoc, FirestoreError } from 'firebase/firestore';
import { db } from '$core/data/firebase/firebaseClient';

/**
 * ユーザーの作成時刻を設定する
 * @param uid ユーザーID
 * @param creationTime 作成時刻（省略時は現在時刻）
 * @returns 成功時はPromise<void>、失敗時はエラー
 */
export const setCreationTime = async (uid: string, creationTime?: string): Promise<void> => {
	if (!uid) {
		console.error('ユーザー情報保存エラー: ユーザーIDが指定されていません');
		throw new Error('ユーザーIDが指定されていません');
	}

	try {
		const userDocRef = doc(db, `users/${uid}`);
		const userDoc = await getDoc(userDocRef);

		if (!userDoc.exists() || userDoc.data()?.creationTime === undefined) {
			if (!creationTime) {
				const date = new Date();
				creationTime = date.toISOString();
			}
			await setDoc(userDocRef, { creationTime: creationTime }, { merge: true });
		}
	} catch (error) {
		let errorMessage = 'ユーザー情報の保存に失敗しました';

		if (error instanceof FirestoreError) {
			switch (error.code) {
				case 'permission-denied':
					errorMessage = 'ユーザー情報へのアクセス権限がありません';
					break;
				case 'unavailable':
					errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
					break;
				default:
					errorMessage = `ユーザー情報保存エラー: ${error.message}`;
			}
		}

		console.error('ユーザー情報保存エラー:', error);
		throw new Error(errorMessage, { cause: error });
	}
};

/**
 * ユーザー情報を取得する
 * @param uid ユーザーID
 * @returns ユーザーデータまたはnull（存在しない場合）
 * @throws {Error} データ取得に失敗した場合
 */
export const getUser = async (uid: string) => {
	if (!uid) {
		console.error('ユーザー情報取得エラー: ユーザーIDが指定されていません');
		throw new Error('ユーザーIDが指定されていません');
	}

	try {
		const userDocRef = doc(db, `users/${uid}`);
		const userDoc = await getDoc(userDocRef);

		if (userDoc.exists()) {
			return userDoc.data();
		} else {
			return null;
		}
	} catch (error) {
		let errorMessage = 'ユーザー情報の取得に失敗しました';

		if (error instanceof FirestoreError) {
			switch (error.code) {
				case 'permission-denied':
					errorMessage = 'ユーザー情報へのアクセス権限がありません';
					break;
				case 'unavailable':
					errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
					break;
				default:
					errorMessage = `ユーザー情報取得エラー: ${error.message}`;
			}
		}

		console.error('ユーザー情報取得エラー:', error);
		throw new Error(errorMessage, { cause: error });
	}
};
