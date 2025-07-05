import { getDocs, collection, query, orderBy, FirestoreError, getDoc, doc } from 'firebase/firestore';
import type { SetFull } from '$data/models/Set';
import { parseSetData } from '$data/models/Set';
import { createCache } from '$utils/cacheStorage';
import { db } from '$data/firebase/firebaseClient';

/**
 * セットデータのリポジトリクラス
 * セットデータの取得や操作を担当する
 */
export class SetRepository {
	// キャッシュの設定（24時間）
	private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000;
	private static readonly setsCache = createCache<SetFull[]>(
		'sets',
		SetRepository.CACHE_EXPIRY
	);

	// メモリキャッシュ
	private static sets: SetFull[] = [];

	// データ取得時のエラーを保持するストア
	private static lastError: Error | null = null;

	/**
	 * 全てのセットデータを取得する
	 * @param forceRefresh 強制的に再取得するかどうか
	 * @returns セットデータの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getSets(forceRefresh = false): Promise<SetFull[]> {
		// 強制更新でない場合はキャッシュをチェック
		if (!forceRefresh) {
			// まずローカルストレージキャッシュをチェック
			const cachedSets = this.setsCache.get();
			if (cachedSets) {
				// メモリキャッシュも更新
				this.sets.length = 0;
				this.sets.push(...cachedSets);
				return cachedSets;
			}

			// メモリキャッシュがある場合はそれを返す
			if (this.sets.length) {
				// 前回エラーがあった場合は投げる
				if (this.lastError) {
					throw this.lastError;
				}
				// メモリキャッシュをローカルストレージに保存
				this.setsCache.set([...this.sets]);
				return this.sets;
			}
		} else {
			// 強制更新の場合はメモリキャッシュをクリア
			this.sets.length = 0;
		}

		try {
			// Firestoreからセットデータを取得
			const qu = query(collection(db, 'sets'), orderBy('order', 'asc'));
			const snapshot = await getDocs(qu);

			// 取得したデータを処理
			const fetchedSets: SetFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 型安全な変換関数を使用
				const set = parseSetData(data, doc.id);
				fetchedSets.push(set);
			});

			// キャッシュを更新
			this.setsCache.set(fetchedSets);

			// メモリキャッシュも更新
			this.sets.length = 0;
			this.sets.push(...fetchedSets);

			// エラー状態をクリア
			this.lastError = null;
			return fetchedSets;
		} catch (error) {
			// エラーをより具体的に変換
			let errorMessage = 'セットデータの取得に失敗しました';

			if (error instanceof FirestoreError) {
				switch (error.code) {
					case 'permission-denied':
						errorMessage = 'データへのアクセス権限がありません';
						break;
					case 'unavailable':
						errorMessage = 'サーバーに接続できません。ネットワーク接続を確認してください';
						break;
					case 'not-found':
						errorMessage = 'セットデータが見つかりませんでした';
						break;
					default:
						errorMessage = `データ取得エラー: ${error.message}`;
				}
			}

			// エラーを保存して再スロー
			const enhancedError = new Error(errorMessage, { cause: error });
			this.lastError = enhancedError;
			console.error('セットデータ取得エラー:', error);
			throw enhancedError;
		}
	}

	/**
	 * 特定のセットデータを取得する
	 * @param id セットのID
	 * @returns セットデータまたはnull（見つからない場合）
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getSetById(id: string): Promise<SetFull | null> {
		try {
			// まずキャッシュから探す
			const cachedSets = this.setsCache.get();
			if (cachedSets) {
				const set = cachedSets.find((set) => set.id === id);
				if (set) {
					return set;
				}
			}

			// キャッシュにない場合は単一ドキュメント取得
			const docRef = doc(db, 'sets', id);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				return parseSetData(data, docSnap.id);
			}

			return null;
		} catch (error) {
			console.error(`セットデータ(ID: ${id})の取得エラー:`, error);
			throw new Error(
				`セットデータの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
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
		try {
			const allSets = await this.getSets();
			return allSets.filter((set) => set.tuneIds.includes(tuneId));
		} catch (error) {
			console.error(`曲ID(${tuneId})のセット取得エラー:`, error);
			throw new Error(
				`セットデータの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * キャッシュをクリアして強制的に再取得する
	 * @returns 最新のセットデータ
	 */
	public static async refreshSets(): Promise<SetFull[]> {
		// キャッシュをクリア
		this.setsCache.clear();
		this.sets.length = 0;
		this.lastError = null;

		// 強制的に再取得
		return this.getSets(true);
	}
}

// 互換性のために従来の関数もエクスポート
export const getSets = SetRepository.getSets.bind(SetRepository);
export const refreshSets = SetRepository.refreshSets.bind(SetRepository);
export const getSetsByTuneId = SetRepository.getSetsByTuneId.bind(SetRepository);