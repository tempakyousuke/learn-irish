import {
	getDocs,
	collection,
	query,
	where,
	orderBy,
	FirestoreError,
	setDoc,
	doc,
	deleteDoc,
	writeBatch
} from 'firebase/firestore';
import type { TuneSetFull, TuneSetBase, TuneSetMetadata } from '$core/data/models/TuneSet';
import { parseTuneSetData, createTuneSet, generateTuneSetId } from '$core/data/models/TuneSet';
import { createCache } from '$utils/cacheStorage';
import { db } from '$core/data/firebase/firebaseClient';

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
			const qu = query(
				collection(db, 'tuneSets')
			);
			const snapshot = await getDocs(qu);

			// 取得したデータを処理
			const fetchedTuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 型安全な変換関数を使用
				const tuneSet = parseTuneSetData(data, doc.id);
				fetchedTuneSets.push(tuneSet);
			});

			// クライアントサイドでソート
			fetchedTuneSets.sort((a, b) => {
				if (a.setId !== b.setId) {
					return a.setId.localeCompare(b.setId);
				}
				return a.position - b.position;
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
				where('tuneId', '==', tuneId)
			);
			const snapshot = await getDocs(qu);

			const tuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				const tuneSet = parseTuneSetData(data, doc.id);
				tuneSets.push(tuneSet);
			});

			// クライアントサイドでソート
			return tuneSets.sort((a, b) => {
				if (a.setId !== b.setId) {
					return a.setId.localeCompare(b.setId);
				}
				return a.position - b.position;
			});
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
				where('setId', '==', setId)
			);
			const snapshot = await getDocs(qu);

			const tuneSets: TuneSetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				const tuneSet = parseTuneSetData(data, doc.id);
				tuneSets.push(tuneSet);
			});

			// クライアントサイドでソート
			return tuneSets.sort((a, b) => a.position - b.position);
		} catch (error) {
			console.error(`セットID(${setId})の曲関係性取得エラー:`, error);
			throw new Error(
				`曲-セット関係性データの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 新しい曲-セット関係性を追加する
	 * @param tuneSetData 曲-セット関係性の基本データ
	 * @param metadata 曲-セット関係性のメタデータ
	 * @returns 作成された関係性のID
	 * @throws {Error} 関係性作成に失敗した場合
	 */
	public static async addTuneSet(
		tuneSetData: TuneSetBase,
		metadata: Partial<TuneSetMetadata> = {}
	): Promise<string> {
		try {
			const now = new Date().toISOString();
			const tuneSetToCreate = createTuneSet(tuneSetData, {
				...metadata,
				createdAt: now,
				updatedAt: now
			});

			const docRef = doc(db, 'tuneSets', tuneSetData.id);
			await setDoc(docRef, tuneSetToCreate);

			// キャッシュをクリア
			this.refreshTuneSets();
			return tuneSetData.id;
		} catch (error) {
			console.error('曲-セット関係性作成エラー:', error);
			throw new Error(
				`曲-セット関係性の作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * セットに曲を一括追加する
	 * @param setId セットのID
	 * @param tuneIds 追加する曲のID配列
	 * @throws {Error} 一括追加に失敗した場合
	 */
	public static async addTunesToSet(setId: string, tuneIds: string[]): Promise<void> {
		try {
			const batch = writeBatch(db);
			const now = new Date().toISOString();

			tuneIds.forEach((tuneId, index) => {
				const tuneSetId = generateTuneSetId(tuneId, setId);
				const tuneSetData = createTuneSet(
					{
						id: tuneSetId,
						tuneId,
						setId,
						position: index + 1
					},
					{
						createdAt: now,
						updatedAt: now
					}
				);

				const docRef = doc(db, 'tuneSets', tuneSetId);
				batch.set(docRef, tuneSetData);
			});

			await batch.commit();

			// キャッシュをクリア
			this.refreshTuneSets();
		} catch (error) {
			console.error('曲の一括追加エラー:', error);
			throw new Error(
				`曲の一括追加に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * セットから曲を削除する
	 * @param tuneId 曲のID
	 * @param setId セットのID
	 * @throws {Error} 曲削除に失敗した場合
	 */
	public static async removeTuneFromSet(tuneId: string, setId: string): Promise<void> {
		try {
			const tuneSetId = generateTuneSetId(tuneId, setId);
			const docRef = doc(db, 'tuneSets', tuneSetId);
			await deleteDoc(docRef);

			// キャッシュをクリア
			this.refreshTuneSets();
		} catch (error) {
			console.error('曲削除エラー:', error);
			throw new Error(
				`曲の削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * セットに関連する全ての曲関係性を削除する
	 * @param setId セットのID
	 * @throws {Error} 削除に失敗した場合
	 */
	public static async removeAllTunesFromSet(setId: string): Promise<void> {
		try {
			const tuneSets = await this.getTuneSetsBySetId(setId);
			const batch = writeBatch(db);

			tuneSets.forEach((tuneSet) => {
				const docRef = doc(db, 'tuneSets', tuneSet.id);
				batch.delete(docRef);
			});

			await batch.commit();

			// キャッシュをクリア
			this.refreshTuneSets();
		} catch (error) {
			console.error('セットの全曲削除エラー:', error);
			throw new Error(
				`セットの全曲削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`
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
