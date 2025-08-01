import {
	getDocs,
	collection,
	query,
	orderBy,
	FirestoreError,
	doc,
	getDoc,
	setDoc,
	serverTimestamp
} from 'firebase/firestore';
import type { TuneFull, TuneListView } from '$core/data/models/Tune';
import { parseTuneData, parseTuneListViewData } from '$core/data/models/Tune';
import type { SetFull } from '$core/data/models/Set';
import { createCache } from '$core/utils/cacheStorage';
import { db } from '$core/data/firebase/firebaseClient';
import type { UserTuneFull } from '../models/UserTune';
import { SetRepository } from './setRepository';
import type { TuneListViewCache } from '../models/Cache';
import { CACHE_CONFIG } from '../models/Cache';

/**
 * 曲データのリポジトリクラス
 * 曲データの取得や操作を担当する
 */
export class TuneRepository {
	// キャッシュの設定（24時間）
	private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000;
	private static readonly tunesCache = createCache<TuneFull[]>(
		'tunes',
		TuneRepository.CACHE_EXPIRY
	);
	// 軽量キャッシュ（トップページ用）
	private static readonly tunesListViewCache = createCache<TuneListView[]>(
		'tunes-list-view',
		TuneRepository.CACHE_EXPIRY
	);

	// メモリキャッシュ（後方互換性のため保持）
	private static tunes: TuneFull[] = [];

	// データ取得時のエラーを保持するストア
	private static lastError: Error | null = null;

	/**
	 * 全ての曲データを取得する
	 * @param forceRefresh 強制的に再取得するかどうか
	 * @returns 曲データの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTunes(forceRefresh = false): Promise<TuneFull[]> {
		// 強制更新でない場合はキャッシュをチェック
		if (!forceRefresh) {
			// まずローカルストレージキャッシュをチェック
			const cachedTunes = this.tunesCache.get();
			if (cachedTunes) {
				// メモリキャッシュも更新（後方互換性のため）
				this.tunes.length = 0;
				this.tunes.push(...cachedTunes);
				return cachedTunes;
			}

			// 後方互換性: メモリキャッシュがある場合はそれを返す
			if (this.tunes.length) {
				// 前回エラーがあった場合は投げる
				if (this.lastError) {
					throw this.lastError;
				}
				// メモリキャッシュをローカルストレージに保存
				this.tunesCache.set([...this.tunes]);
				return this.tunes;
			}
		} else {
			// 強制更新の場合はメモリキャッシュをクリア
			this.tunes.length = 0;
		}

		try {
			// Firestoreから曲データを取得
			const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
			const snapshot = await getDocs(qu);

			// 取得したデータを処理
			const fetchedTunes: TuneFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 型安全な変換関数を使用
				const tune = parseTuneData(data, doc.id);

				fetchedTunes.push(tune);
			});

			// キャッシュを更新
			this.tunesCache.set(fetchedTunes);

			// メモリキャッシュも更新（後方互換性のため）
			this.tunes.length = 0;
			this.tunes.push(...fetchedTunes);

			// エラー状態をクリア
			this.lastError = null;
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
			this.lastError = enhancedError;
			console.error('曲データ取得エラー:', error);
			throw enhancedError;
		}
	}

	/**
	 * 特定の曲データを取得する
	 * @param id 曲のID
	 * @returns 曲データまたはnull（見つからない場合）
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTuneById(id: string): Promise<TuneFull | null> {
		try {
			// まずキャッシュから探す
			const cachedTunes = this.tunesCache.get();
			if (cachedTunes) {
				const tune = cachedTunes.find((tune) => tune.id === id);
				if (tune) {
					return tune;
				}
			}

			// キャッシュにない場合は全曲取得（将来的には単一ドキュメント取得の最適化も検討）
			const allTunes = await this.getTunes();
			return allTunes.find((tune) => tune.id === id) || null;
		} catch (error) {
			console.error(`曲データ(ID: ${id})の取得エラー:`, error);
			throw new Error(
				`曲データの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 特定の曲が含まれるセットを取得する
	 * @param tuneId 曲のID
	 * @returns その曲が含まれるセットの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getSetsByTuneId(tuneId: string): Promise<SetFull[]> {
		return SetRepository.getSetsByTuneId(tuneId);
	}

	/**
	 * トップページ用の軽量な曲データを取得する
	 * キャッシュドキュメントから優先的に取得し、読み取り回数を大幅削減
	 * @param forceRefresh 強制的に再取得するかどうか
	 * @returns 軽量な曲データの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTunesForListView(forceRefresh = false): Promise<TuneListView[]> {
		// 強制更新でない場合はまずlocalstorageキャッシュをチェック
		if (!forceRefresh) {
			const cachedTunes = this.tunesListViewCache.get();
			if (cachedTunes) {
				return cachedTunes;
			}
		}

		// Firestoreキャッシュドキュメントから取得を試行
		if (!forceRefresh) {
			try {
				const cacheDocRef = doc(
					db,
					CACHE_CONFIG.COLLECTION_NAME,
					CACHE_CONFIG.TUNE_LIST_VIEW_DOC_ID
				);
				const cacheDoc = await getDoc(cacheDocRef);

				if (cacheDoc.exists()) {
					const cacheData = cacheDoc.data() as TuneListViewCache;

					// データ整合性チェック
					if (cacheData.data && Array.isArray(cacheData.data) && cacheData.data.length > 0) {
						// console.log(`キャッシュから楽曲データを取得: ${cacheData.totalCount}件`);

						// localstorageにも保存して次回高速化
						this.tunesListViewCache.set(cacheData.data);

						// エラー状態をクリア
						this.lastError = null;
						return cacheData.data;
					} else {
						console.warn('キャッシュドキュメントのデータが無効です');
					}
				} else {
					console.warn('キャッシュドキュメントが存在しません。通常の方法で取得します');
				}
			} catch (error) {
				console.warn('キャッシュドキュメント取得エラー、通常の方法で取得します:', error);
			}
		}

		// キャッシュが無い場合は従来の方法でフォールバック
		return this.getTunesFromCollection();
	}

	/**
	 * 従来の方法でFirestoreのtunesコレクションから直接取得
	 * @returns 軽量な曲データの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	private static async getTunesFromCollection(): Promise<TuneListView[]> {
		try {
			console.log('tunesコレクションから直接取得します');

			// Firestoreから曲データを取得
			const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
			const snapshot = await getDocs(qu);

			// 取得したデータを軽量版に変換
			const fetchedTunes: TuneListView[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 軽量版変換関数を使用
				const tune = parseTuneListViewData(data, doc.id);
				fetchedTunes.push(tune);
			});

			// 軽量キャッシュを更新
			this.tunesListViewCache.set(fetchedTunes);

			// エラー状態をクリア
			this.lastError = null;
			console.log(`tunesコレクションから取得完了: ${fetchedTunes.length}件`);
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
			this.lastError = enhancedError;
			console.error('曲データ取得エラー:', error);
			throw enhancedError;
		}
	}

	/**
	 * キャッシュをクリアして強制的に再取得する
	 * @returns 最新の曲データ
	 */
	public static async refreshTunes(): Promise<TuneFull[]> {
		// キャッシュをクリア
		this.tunesCache.clear();
		this.tunesListViewCache.clear();
		this.tunes.length = 0;
		this.lastError = null;

		// 強制的に再取得
		return this.getTunes(true);
	}

	/**
	 * 楽曲一覧キャッシュドキュメントを手動で更新する
	 * tunesコレクションの全データを取得してcacheコレクションに保存
	 * @returns 更新されたキャッシュデータ
	 * @throws {Error} キャッシュ更新に失敗した場合
	 */
	public static async updateTuneListViewCache(): Promise<TuneListViewCache> {
		try {
			console.log('楽曲一覧キャッシュを更新開始...');

			// tunesコレクションから最新データを取得
			const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
			const snapshot = await getDocs(qu);

			// TuneListView形式に変換
			const tuneData: TuneListView[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				const tune = parseTuneListViewData(data, doc.id);
				tuneData.push(tune);
			});

			// キャッシュドキュメントを作成
			const cacheData: TuneListViewCache = {
				data: tuneData,
				lastUpdated: serverTimestamp() as any,
				version: CACHE_CONFIG.CURRENT_VERSION,
				totalCount: tuneData.length
			};

			// Firestoreのcacheコレクションに保存
			const cacheDocRef = doc(db, CACHE_CONFIG.COLLECTION_NAME, CACHE_CONFIG.TUNE_LIST_VIEW_DOC_ID);
			await setDoc(cacheDocRef, cacheData);

			// ローカルキャッシュも更新
			this.tunesListViewCache.set(tuneData);

			console.log(`楽曲一覧キャッシュ更新完了: ${tuneData.length}件`);
			return cacheData;
		} catch (error) {
			console.error('楽曲一覧キャッシュ更新エラー:', error);

			let errorMessage = '楽曲一覧キャッシュの更新に失敗しました';
			if (error instanceof FirestoreError) {
				switch (error.code) {
					case 'permission-denied':
						errorMessage = 'キャッシュ更新の権限がありません';
						break;
					case 'unavailable':
						errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
						break;
					default:
						errorMessage = `キャッシュ更新エラー: ${error.message}`;
				}
			}

			throw new Error(errorMessage, { cause: error });
		}
	}
}

// 互換性のために従来の関数もエクスポート
export const getTunes = TuneRepository.getTunes.bind(TuneRepository);
export const getTunesForListView = TuneRepository.getTunesForListView.bind(TuneRepository);
export const refreshTunes = TuneRepository.refreshTunes.bind(TuneRepository);
export const updateTuneListViewCache = TuneRepository.updateTuneListViewCache.bind(TuneRepository);

/**
 * 指定ユーザーのUserTune（習得状況）一覧を取得する
 * @param uid ユーザーID
 * @returns UserTuneFull[]
 */
export async function getUserTunes(uid: string): Promise<UserTuneFull[]> {
	if (!uid) return [];
	const tunesCollectionRef = collection(db, `users/${uid}/tunes`);
	const querySnapshot = await getDocs(tunesCollectionRef);
	return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UserTuneFull);
}
