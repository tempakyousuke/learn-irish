/**
 * 問い合わせシステムに関する型定義
 */

/**
 * 問い合わせのステータス
 */
export type InquiryStatus = 'unconfirmed' | 'in_progress' | 'completed' | 'not_required';

/**
 * 問い合わせの種類
 */
export type InquiryType = 'opinion' | 'request' | 'bug_report';

/**
 * 問い合わせの基本情報に関するインターフェース
 */
export interface InquiryBase {
	/** 問い合わせのID（ドキュメントID） */
	id: string;
	/** 問い合わせ内容 */
	content: string;
	/** 送信者のユーザーID */
	userId: string;
	/** 作成日時 */
	createdAt: Date;
	/** 問い合わせのステータス */
	status: InquiryStatus;
}

/**
 * 問い合わせの追加情報に関するインターフェース
 */
export interface InquiryMetadata {
	/** 問い合わせの種類 */
	type?: InquiryType;
}

/**
 * 完全な問い合わせ情報を表すインターフェース
 */
export interface InquiryFull extends InquiryBase, InquiryMetadata {}

/**
 * 問い合わせ作成時に必要な情報（IDを除く）
 */
export type InquiryCreate = Omit<InquiryFull, 'id'>;

/**
 * 問い合わせ一覧表示用の型
 */
export interface InquiryListView extends InquiryFull {
	/** 送信者の表示名（将来的な拡張用） */
	userDisplayName?: string;
}

/**
 * 既存のInquiry型との後方互換性を維持するための型
 */
export type Inquiry = InquiryFull;

/**
 * 問い合わせのIDのみを参照する型
 */
export type InquiryReference = Pick<InquiryBase, 'id'>;

/**
 * 必須フィールドを指定して問い合わせオブジェクトを作成する関数
 */
export function createInquiry(
	base: Omit<InquiryBase, 'id'>,
	metadata: Partial<InquiryMetadata> = {}
): InquiryCreate {
	return {
		...base,
		...metadata
	};
}

/**
 * 問い合わせが必須フィールドを持っているか確認する型ガード
 */
export function isValidInquiry(inquiry: Partial<InquiryFull>): inquiry is InquiryFull {
	return (
		typeof inquiry.id === 'string' &&
		typeof inquiry.content === 'string' &&
		typeof inquiry.userId === 'string' &&
		inquiry.createdAt instanceof Date &&
		typeof inquiry.status === 'string' &&
		['unconfirmed', 'in_progress', 'completed', 'not_required'].includes(inquiry.status)
	);
}

/**
 * Firestoreから取得したデータをInquiry型に変換する
 * @param data Firestoreから取得した生データ
 * @param id ドキュメントID
 * @returns 変換されたInquiry型データ
 */
export function parseInquiryData(data: Record<string, unknown>, id: string): InquiryFull {
	// createdAtの変換処理
	let createdAt: Date;
	if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt) {
		// Firestore Timestampの場合
		createdAt = (data.createdAt as { toDate(): Date }).toDate();
	} else if (data.createdAt instanceof Date) {
		createdAt = data.createdAt;
	} else if (typeof data.createdAt === 'string') {
		createdAt = new Date(data.createdAt);
	} else {
		createdAt = new Date(); // フォールバック
	}

	return {
		id,
		content: typeof data.content === 'string' ? data.content : '',
		userId: typeof data.userId === 'string' ? data.userId : '',
		createdAt,
		status: isValidStatus(data.status) ? data.status : 'unconfirmed',
		type: isValidType(data.type) ? data.type : undefined
	};
}

/**
 * ステータスが有効かどうかをチェックする型ガード
 */
function isValidStatus(status: unknown): status is InquiryStatus {
	return (
		typeof status === 'string' &&
		['unconfirmed', 'in_progress', 'completed', 'not_required'].includes(status)
	);
}

/**
 * 問い合わせタイプが有効かどうかをチェックする型ガード
 */
function isValidType(type: unknown): type is InquiryType {
	return typeof type === 'string' && ['opinion', 'request', 'bug_report'].includes(type);
}

/**
 * InquiryFullをFirestore保存用のデータに変換する
 * @param inquiry 問い合わせデータ
 * @returns Firestore保存用データ
 */
export function inquiryToFirestoreData(inquiry: InquiryCreate): Record<string, unknown> {
	return {
		content: inquiry.content,
		userId: inquiry.userId,
		createdAt: inquiry.createdAt,
		status: inquiry.status,
		...(inquiry.type && { type: inquiry.type })
	};
}
