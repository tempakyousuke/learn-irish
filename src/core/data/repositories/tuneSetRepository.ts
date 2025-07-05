import { getDocs, collection, query, where, orderBy, FirestoreError } from 'firebase/firestore';
import type { TuneSetFull } from '$data/models/TuneSet';
import { parseTuneSetData } from '$data/models/TuneSet';
import { createCache } from '$utils/cacheStorage';
import { db } from '$data/firebase/firebaseClient';

/**
 * 曲-セット関係性データのリポジトリクラス
 * 曲とセットの関係性データの取得や操作を担当する
 */
export class TuneSetRepository {
	// キャッシュの設定（24時間）
	private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000;
	private static readonly tuneSetsCache = createCache<TuneSetFull[]>(
		'tuneSets',
		TuneSetRepository.CACHE_EXPIRY
	);

	// メモリキャッシュ
	private static tuneSets: TuneSetFull[] = [];

	// データ取得時のエラーを保持するストア
	private static lastError: Error | null = null;

	/**
	 * 全ての曲-セット関係性データを取得する
	 * @param forceRefresh 強制的に再取得するかどうか
	 * @returns 曲-セット関係性データの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTuneSets(forceRefresh = false): Promise<TuneSetFull[]> {
		// 強制更新でない場合はキャッシュをチェック
		if (!forceRefresh) {
			// まずローカルストレージキャッシュをチェック
			const cachedTuneSets = this.tuneSetsCache.get();
			if (cachedTuneSets) {
				// メモリキャッシュも更新
				this.tuneSets.length = 0;
				this.tuneSets.push(...cachedTuneSets);
				return cachedTuneSets;
			}

			// メモリキャッシュがある場合はそれを返す
			if (this.tuneSets.length) {
				// 前回エラーがあった場合は投げる
				if (this.lastError) {
					throw this.lastError;
				}
				// メモリキャッシュをローカルストレージに保存
				this.tuneSetsCache.set([...this.tuneSets]);
				return this.tuneSets;
			}
		} else {
			// 強制更新の場合はメモリキャッシュをクリア
			this.tuneSets.length = 0;
		}

		try {
			// Firestoreから曲-セット関係性データを取得
			const qu = query(collection(db, 'tuneSets'), orderBy('setId', 'asc'), orderBy('position', 'asc'));
			const snapshot = await getDocs(qu);

			// 取得したデータを処理
			const fetchedTuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 型安全な変換関数を使用
				const tuneSet = parseTuneSetData(data, doc.id);
				fetchedTuneSets.push(tuneSet);
			});

			// キャッシュを更新
			this.tuneSetsCache.set(fetchedTuneSets);

			// メモリキャッシュも更新
			this.tuneSets.length = 0;
			this.tuneSets.push(...fetchedTuneSets);

			// エラー状態をクリア
			this.lastError = null;
			return fetchedTuneSets;
		} catch (error) {
			// エラーをより具体的に変換
			let errorMessage = '曲-セット関係性データの取得に失敗しました';

			if (error instanceof FirestoreError) {
				switch (error.code) {
					case 'permission-denied':
						errorMessage = 'データへのアクセス権限がありません';
						break;
					case 'unavailable':
						errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
						break;
					case 'not-found':
						errorMessage = '曲-セット関係性データが見つかりませんでした';
						break;
					default:
						errorMessage = `データ取得エラー: ${error.message}`;
				}
			}

			// エラーを保存して再スロー
			const enhancedError = new Error(errorMessage, { cause: error });
			this.lastError = enhancedError;
			console.error('曲-セット関係性データ取得エラー:', error);
			throw enhancedError;
		}
	}

	/**
	 * 特定の曲に関連するセット関係性を取得する
	 * @param tuneId 曲のID
	 * @returns その曲に関連するセット関係性の配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTuneSetsByTuneId(tuneId: string): Promise<TuneSetFull[]> {
		try {
			// まずキャッシュから探す
			const cachedTuneSets = this.tuneSetsCache.get();
			if (cachedTuneSets) {
				return cachedTuneSets.filter((tuneSet) => tuneSet.tuneId === tuneId);
			}

			// キャッシュにない場合はクエリで取得
			const qu = query(
				collection(db, 'tuneSets'),
				where('tuneId', '==', tuneId),
				orderBy('setId', 'asc'),
				orderBy('position', 'asc')
			);
			const snapshot = await getDocs(qu);

			const tuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				const tuneSet = parseTuneSetData(data, doc.id);
				tuneSets.push(tuneSet);
			});

			return tuneSets;
		} catch (error) {
			console.error(`曲ID(${tuneId})のセット関係性取得エラー:`, error);
			throw new Error(
				`曲-セット関係性データの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 特定のセットに関連する曲関係性を取得する
	 * @param setId セットのID
	 * @returns そのセットに関連する曲関係性の配列（位置順）
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getTuneSetsBySetId(setId: string): Promise<TuneSetFull[]> {
		try {
			// まずキャッシュから探す
			const cachedTuneSets = this.tuneSetsCache.get();
			if (cachedTuneSets) {
				return cachedTuneSets
					.filter((tuneSet) => tuneSet.setId === setId)
					.sort((a, b) => a.position - b.position);
			}

			// キャッシュにない場合はクエリで取得
			const qu = query(
				collection(db, 'tuneSets'),
				where('setId', '==', setId),
				orderBy('position', 'asc')
			);
			const snapshot = await getDocs(qu);

			const tuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				const tuneSet = parseTuneSetData(data, doc.id);
				tuneSets.push(tuneSet);
			});

			return tuneSets;
		} catch (error) {
			console.error(`セットID(${setId})の曲関係性取得エラー:`, error);
			throw new Error(
				`曲-セット関係性データの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * キャッシュをクリアして強制的に再取得する
	 * @returns 最新の曲-セット関係性データ
	 */
	public static async refreshTuneSets(): Promise<TuneSetFull[]> {
		// キャッシュをクリア
		this.tuneSetsCache.clear();
		this.tuneSets.length = 0;
		this.lastError = null;

		// 強制的に再取得
		return this.getTuneSets(true);
	}
}

// 互換性のために従来の関数もエクスポート
export const getTuneSets = TuneSetRepository.getTuneSets.bind(TuneSetRepository);
export const refreshTuneSets = TuneSetRepository.refreshTuneSets.bind(TuneSetRepository);
export const getTuneSetsByTuneId = TuneSetRepository.getTuneSetsByTuneId.bind(TuneSetRepository);
export const getTuneSetsBySetId = TuneSetRepository.getTuneSetsBySetId.bind(TuneSetRepository);