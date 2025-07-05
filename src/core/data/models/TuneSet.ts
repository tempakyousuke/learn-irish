/**
 * 曲とセットの関係性を表すモデル
 * 多対多の関係を管理するためのジョインテーブル的な役割
 */

/**
 * 曲とセットの関係性の基本インターフェース
 */
export interface TuneSetBase {
	/** 関係性のID（ドキュメントID） */
	id: string;
	/** 曲のID */
	tuneId: string;
	/** セットのID */
	setId: string;
	/** セット内での演奏順序 */
	position: number;
}

/**
 * 曲とセットの関係性のメタ情報
 */
export interface TuneSetMetadata {
	/** 作成日 */
	createdAt?: string;
	/** 更新日 */
	updatedAt?: string;
	/** 備考 */
	note?: string;
}

/**
 * 完全な曲-セット関係性情報
 */
export interface TuneSetFull extends TuneSetBase, TuneSetMetadata {}

/**
 * 曲-セット関係性の表示用情報
 */
export interface TuneSetDisplay extends TuneSetBase {
	/** セット名（結合時に使用） */
	setName?: string;
	/** 曲名（結合時に使用） */
	tuneName?: string;
}

/**
 * 必須フィールドを指定して曲-セット関係性オブジェクトを作成する関数
 */
export function createTuneSet(
	base: TuneSetBase,
	metadata: Partial<TuneSetMetadata> = {}
): TuneSetFull {
	return {
		...base,
		...metadata
	};
}

/**
 * 曲-セット関係性が必須フィールドを持っているか確認する型ガード
 */
export function isValidTuneSet(tuneSet: Partial<TuneSetFull>): tuneSet is TuneSetFull {
	return (
		typeof tuneSet.id === 'string' &&
		typeof tuneSet.tuneId === 'string' &&
		typeof tuneSet.setId === 'string' &&
		typeof tuneSet.position === 'number'
	);
}

/**
 * Firestoreから取得したデータをTuneSet型に変換する
 * @param data Firestoreから取得した生データ
 * @param id ドキュメントID
 * @returns 変換されたTuneSet型データ
 */
export function parseTuneSetData(data: Record<string, unknown>, id: string): TuneSetFull {
	return createTuneSet(
		{
			id,
			tuneId: typeof data.tuneId === 'string' ? data.tuneId : '',
			setId: typeof data.setId === 'string' ? data.setId : '',
			position: typeof data.position === 'number' ? data.position : 0
		},
		{
			createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
			updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
			note: typeof data.note === 'string' ? data.note : undefined
		}
	);
}

/**
 * 曲-セット関係性のドキュメントIDを生成する関数
 * @param tuneId 曲のID
 * @param setId セットのID
 * @returns ドキュメントID
 */
export function generateTuneSetId(tuneId: string, setId: string): string {
	return `${tuneId}_${setId}`;
}