import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '$core/utils/errorHandling';

const db = getFirestore();

/**
 * テーブルヘッダー設定のインターフェース
 */
export interface TableHeaderSettings {
	rhythm: boolean;
	key: boolean;
	mode: boolean;
	playCount: boolean;
	todaysPlays: boolean;
	lastPlayedDate: boolean;
}

/**
 * デフォルトのモバイル表示設定
 */
const DEFAULT_MOBILE_COLUMNS: TableHeaderSettings = {
	rhythm: true,
	key: false,
	mode: false,
	playCount: true,
	todaysPlays: true,
	lastPlayedDate: false
};

/**
 * ユーザーのテーブルヘッダー設定を取得する
 * @param uid ユーザーID
 * @returns テーブルヘッダー設定、存在しない場合はnull
 */
export async function getSettings(uid: string): Promise<TableHeaderSettings | null> {
	if (!uid) {
		console.warn('テーブルヘッダー設定取得: ユーザーIDが指定されていません');
		return null;
	}

	try {
		const docRef = doc(db, `users/${uid}`);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		const data = docSnap.data();
		const tableHeaderSettings = data.tableHeaderSettings;

		if (!tableHeaderSettings) {
			return null;
		}

		// 設定データの検証と型安全性の確保
		return {
			rhythm: Boolean(tableHeaderSettings.rhythm),
			key: Boolean(tableHeaderSettings.key),
			mode: Boolean(tableHeaderSettings.mode),
			playCount: Boolean(tableHeaderSettings.playCount),
			todaysPlays: Boolean(tableHeaderSettings.todaysPlays),
			lastPlayedDate: Boolean(tableHeaderSettings.lastPlayedDate)
		};
	} catch (error) {
		console.error('テーブルヘッダー設定取得エラー:', getFirebaseErrorMessage(error));
		throw new Error(`テーブルヘッダー設定の取得に失敗しました: ${getFirebaseErrorMessage(error)}`);
	}
}

/**
 * ユーザーのテーブルヘッダー設定を更新する
 * @param uid ユーザーID
 * @param settings 更新する設定
 */
export async function updateSettings(uid: string, settings: TableHeaderSettings): Promise<void> {
	if (!uid) {
		console.warn('テーブルヘッダー設定更新: ユーザーIDが指定されていません');
		throw new Error('ユーザーIDが指定されていません');
	}

	if (!settings) {
		console.warn('テーブルヘッダー設定更新: 設定データが指定されていません');
		throw new Error('設定データが指定されていません');
	}

	try {
		const docRef = doc(db, `users/${uid}`);
		
		// 設定データの検証
		const validatedSettings: TableHeaderSettings = {
			rhythm: Boolean(settings.rhythm),
			key: Boolean(settings.key),
			mode: Boolean(settings.mode),
			playCount: Boolean(settings.playCount),
			todaysPlays: Boolean(settings.todaysPlays),
			lastPlayedDate: Boolean(settings.lastPlayedDate)
		};

		await setDoc(
			docRef,
			{
				tableHeaderSettings: validatedSettings
			},
			{ merge: true }
		);
	} catch (error) {
		console.error('テーブルヘッダー設定更新エラー:', getFirebaseErrorMessage(error));
		throw new Error(`テーブルヘッダー設定の更新に失敗しました: ${getFirebaseErrorMessage(error)}`);
	}
}

/**
 * デフォルトのテーブルヘッダー設定を取得する
 * @returns デフォルト設定
 */
export function getDefaultSettings(): TableHeaderSettings {
	return { ...DEFAULT_MOBILE_COLUMNS };
}