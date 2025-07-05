/**
 * アイリッシュ音楽のセット（複数曲の組み合わせ）に関する型定義
 */

/**
 * セットの基本情報に関するインターフェース
 */
export interface SetBase {
	/** セットのID（ドキュメントID） */
	id: string;
	/** セット名 */
	name: string;
	/** セット動画のYouTubeリンク */
	videoLink: string;
}

/**
 * セットのメタ情報に関するインターフェース
 */
export interface SetMetadata {
	/** セット番号（Google SheetsのSet Noに対応） */
	setNo?: string;
	/** セットの説明 */
	description?: string;
	/** 作成日 */
	createdAt?: string;
	/** 更新日 */
	updatedAt?: string;
}

/**
 * セットに含まれる曲の情報に関するインターフェース
 */
export interface SetComposition {
	/** セットに含まれる曲のID配列 */
	tuneIds: string[];
	/** セット内の曲の総数 */
	tuneCount: number;
}

/**
 * 完全なセット情報を表すインターフェース
 */
export interface SetFull extends SetBase, SetMetadata, SetComposition {}

/**
 * セットの基本的な表示に必要な情報
 */
export interface SetDisplay extends SetBase {
	setNo?: string;
	tuneCount: number;
	description?: string;
}

/**
 * セットのIDのみを参照する型
 */
export type SetReference = Pick<SetBase, 'id'>;

/**
 * 必須フィールドを指定してセットオブジェクトを作成する関数
 */
export function createSet(
	base: SetBase,
	composition: SetComposition,
	metadata: Partial<SetMetadata> = {}
): SetFull {
	return {
		...base,
		...composition,
		...metadata
	};
}

/**
 * セットが必須フィールドを持っているか確認する型ガード
 */
export function isValidSet(set: Partial<SetFull>): set is SetFull {
	return (
		typeof set.id === 'string' &&
		typeof set.name === 'string' &&
		typeof set.videoLink === 'string' &&
		Array.isArray(set.tuneIds) &&
		typeof set.tuneCount === 'number'
	);
}

/**
 * Firestoreから取得したデータをSet型に変換する
 * @param data Firestoreから取得した生データ
 * @param id ドキュメントID
 * @returns 変換されたSet型データ
 */
export function parseSetData(data: Record<string, unknown>, id: string): SetFull {
	const tuneIds = Array.isArray(data.tuneIds) ? data.tuneIds.filter((id): id is string => typeof id === 'string') : [];
	
	return createSet(
		{
			id,
			name: typeof data.name === 'string' ? data.name : 'Unknown Set',
			videoLink: typeof data.videoLink === 'string' ? data.videoLink : ''
		},
		{
			tuneIds,
			tuneCount: tuneIds.length
		},
		{
			setNo: typeof data.setNo === 'string' ? data.setNo : undefined,
			description: typeof data.description === 'string' ? data.description : undefined,
			createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
			updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined
		}
	);
}