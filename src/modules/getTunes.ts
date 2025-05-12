import { db } from '$modules/firebase';
import { getDocs, collection, query, orderBy, FirestoreError } from 'firebase/firestore';
import type { Tune } from '../types/tune';

// キャッシュされた曲データ
const tunes: Tune[] = [];

// データ取得時のエラーを保持するストア
let lastError: Error | null = null;

/**
 * 全ての曲データを取得する
 * @returns 曲データの配列
 * @throws {Error} データ取得に失敗した場合
 */
export const getTunes = async (): Promise<Tune[]> => {
	// キャッシュがある場合はそれを返す
	if (tunes.length) {
		// 前回エラーがあった場合は投げる
		if (lastError) {
			throw lastError;
		}
		return tunes;
	}

	try {
		// Firestoreから曲データを取得
		const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
		const snapshot = await getDocs(qu);
		
		// 取得したデータを処理
		snapshot.forEach((doc) => {
			const data = doc.data();
			const tune = {
				id: doc.id,
				...data
			} as Tune;
			tunes.push(tune);
		});

		// エラー状態をクリア
		lastError = null;
		return tunes;
	} catch (error) {
		// エラーをより具体的に変換
		let errorMessage = '曲データの取得に失敗しました';
		
		if (error instanceof FirestoreError) {
			switch (error.code) {
				case 'permission-denied':
					errorMessage = 'データへのアクセス権限がありません';
					break;
				case 'unavailable':
					errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
					break;
				case 'not-found':
					errorMessage = '曲データが見つかりませんでした';
					break;
				default:
					errorMessage = `データ取得エラー: ${error.message}`;
			}
		}
		
		// エラーを保存して再スロー
		const enhancedError = new Error(errorMessage, { cause: error });
		lastError = enhancedError;
		console.error('曲データ取得エラー:', error);
		throw enhancedError;
	}
};
