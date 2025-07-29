import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	query,
	orderBy,
	FirestoreError,
	Timestamp
} from 'firebase/firestore';
import type { InquiryFull, InquiryCreate, InquiryStatus } from '../models/Inquiry';
import { parseInquiryData, inquiryToFirestoreData } from '../models/Inquiry';
import { db } from '../firebase/firebaseClient';
import {
	getInquiryCreationErrorMessage,
	getInquiryFetchErrorMessage,
	getInquiryStatusUpdateErrorMessage
} from '../../utils/inquiryErrorHandling';

/**
 * 問い合わせデータのリポジトリクラス
 * 問い合わせデータの取得や操作を担当する
 */
export class InquiryRepository {
	private static readonly COLLECTION_NAME = 'inquiries';

	/**
	 * 新しい問い合わせを作成する
	 * @param inquiry 問い合わせデータ（IDを除く）
	 * @returns 作成された問い合わせのID
	 * @throws {Error} 問い合わせの作成に失敗した場合
	 */
	public static async create(inquiry: InquiryCreate): Promise<string> {
		try {
			// Firestoreに保存するためのデータに変換
			const firestoreData = inquiryToFirestoreData(inquiry);

			// createdAtをFirestore Timestampに変換
			firestoreData.createdAt = Timestamp.fromDate(inquiry.createdAt);

			// Firestoreに問い合わせを追加
			const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);

			return docRef.id;
		} catch (error) {
			console.error('問い合わせ作成エラー:', error);
			const errorMessage = getInquiryCreationErrorMessage(error);
			throw new Error(errorMessage);
		}
	}

	/**
	 * すべての問い合わせを取得する（管理者用）
	 * @returns 問い合わせデータの配列（作成日時の降順）
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getAll(): Promise<InquiryFull[]> {
		try {
			// 作成日時の降順で問い合わせを取得
			const qu = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
			const snapshot = await getDocs(qu);

			// 取得したデータを処理
			const inquiries: InquiryFull[] = [];
			snapshot.forEach((doc) => {
				const data = doc.data();
				// 型安全な変換関数を使用
				const inquiry = parseInquiryData(data, doc.id);
				inquiries.push(inquiry);
			});

			return inquiries;
		} catch (error) {
			console.error('問い合わせデータ取得エラー:', error);
			const errorMessage = getInquiryFetchErrorMessage(error);
			throw new Error(errorMessage);
		}
	}

	/**
	 * 問い合わせのステータスを更新する（管理者用）
	 * @param id 問い合わせのID
	 * @param status 新しいステータス
	 * @throws {Error} ステータス更新に失敗した場合
	 */
	public static async updateStatus(id: string, status: InquiryStatus): Promise<void> {
		try {
			// ドキュメント参照を取得
			const docRef = doc(db, this.COLLECTION_NAME, id);

			// ステータスのみを更新
			await updateDoc(docRef, {
				status: status
			});
		} catch (error) {
			console.error(`問い合わせステータス更新エラー (ID: ${id}):`, error);
			const errorMessage = getInquiryStatusUpdateErrorMessage(error);
			throw new Error(errorMessage);
		}
	}

	/**
	 * 特定のユーザーの問い合わせを取得する
	 * @param userId ユーザーID
	 * @returns そのユーザーの問い合わせデータの配列
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getByUserId(userId: string): Promise<InquiryFull[]> {
		try {
			// 全ての問い合わせを取得してフィルタリング
			// 将来的にはFirestoreクエリでフィルタリングすることも検討
			const allInquiries = await this.getAll();
			return allInquiries.filter((inquiry) => inquiry.userId === userId);
		} catch (error) {
			console.error(`ユーザー問い合わせ取得エラー (UserID: ${userId}):`, error);
			throw new Error(
				`ユーザーの問い合わせ取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	/**
	 * 特定の問い合わせを取得する
	 * @param id 問い合わせのID
	 * @returns 問い合わせデータまたはnull（見つからない場合）
	 * @throws {Error} データ取得に失敗した場合
	 */
	public static async getById(id: string): Promise<InquiryFull | null> {
		try {
			// 全ての問い合わせを取得して該当するものを探す
			// 将来的には単一ドキュメント取得の最適化も検討
			const allInquiries = await this.getAll();
			return allInquiries.find((inquiry) => inquiry.id === id) || null;
		} catch (error) {
			console.error(`問い合わせ取得エラー (ID: ${id}):`, error);
			throw new Error(
				`問い合わせの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
}

// 互換性のために従来の関数もエクスポート
export const createInquiry = InquiryRepository.create.bind(InquiryRepository);
export const getAllInquiries = InquiryRepository.getAll.bind(InquiryRepository);
export const updateInquiryStatus = InquiryRepository.updateStatus.bind(InquiryRepository);
export const getInquiriesByUserId = InquiryRepository.getByUserId.bind(InquiryRepository);
export const getInquiryById = InquiryRepository.getById.bind(InquiryRepository);
