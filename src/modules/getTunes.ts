import { db } from '$modules/firebase';
import { getDocs, collection, query, orderBy, FirestoreError } from 'firebase/firestore';
import type { Tune } from '../types/tune';
import { createCache } from '$lib/utils/cacheStorage';

// キャッシュの設定
// 1日 = 24時間 × 60分 × 60秒 × 1000ミリ秒
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
const tunesCache = createCache<Tune[]>('tunes', CACHE_EXPIRY);

// メモリキャッシュ（後方互換性のため保持）
const tunes: Tune[] = [];

// データ取得時のエラーを保持するストア
let lastError: Error | null = null;

/**
 * 全ての曲データを取得する
 * @param forceRefresh 強制的に再取得するかどうか
 * @returns 曲データの配列
 * @throws {Error} データ取得に失敗した場合
 */
export const getTunes = async (forceRefresh = false): Promise<Tune[]> => {
	// 強制更新でない場合はキャッシュをチェック
	if (!forceRefresh) {
		// まずローカルストレージキャッシュをチェック
		const cachedTunes = tunesCache.get();
		if (cachedTunes) {
			// メモリキャッシュも更新（後方互換性のため）
			tunes.length = 0;
			tunes.push(...cachedTunes);
			return cachedTunes;
		}
		
		// 後方互換性: メモリキャッシュがある場合はそれを返す
		if (tunes.length) {
			// 前回エラーがあった場合は投げる
			if (lastError) {
				throw lastError;
			}
			// メモリキャッシュをローカルストレージに保存
			tunesCache.set([...tunes]);
			return tunes;
		}
	} else {
		// 強制更新の場合はメモリキャッシュをクリア
		tunes.length = 0;
	}

	try {
		// Firestoreから曲データを取得
		const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
		const snapshot = await getDocs(qu);
		
		// 取得したデータを処理
		const fetchedTunes: Tune[] = [];
		snapshot.forEach((doc) => {
			const data = doc.data();
			const tune = {
				id: doc.id,
				...data
			} as Tune;
			fetchedTunes.push(tune);
		});
		
		// キャッシュを更新
		tunesCache.set(fetchedTunes);
		
		// メモリキャッシュも更新（後方互換性のため）
		tunes.length = 0;
		tunes.push(...fetchedTunes);

		// エラー状態をクリア
		lastError = null;
		return fetchedTunes;
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

/**
 * キャッシュをクリアして強制的に再取得する
 * @returns 最新の曲データ
 */
export const refreshTunes = async (): Promise<Tune[]> => {
	// キャッシュをクリア
	tunesCache.clear();
	tunes.length = 0;
	lastError = null;
	
	// 強制的に再取得
	return getTunes(true);
};
