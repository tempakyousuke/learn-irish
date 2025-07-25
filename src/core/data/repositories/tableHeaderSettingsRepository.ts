import { getFirestore, getDoc, doc, setDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage, tryCatchAsync, AppError } from '$core/utils/errorHandling';

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
 * 設定データの妥当性を検証する
 * @param data 検証するデータ
 * @returns 妥当性検証結果
 */
function validateSettingsData(data: any): { isValid: boolean; settings?: TableHeaderSettings } {
	if (!data || typeof data !== 'object') {
		return { isValid: false };
	}

	// 必要なプロパティが存在し、boolean型であることを確認
	const requiredKeys: (keyof TableHeaderSettings)[] = [
		'rhythm', 'key', 'mode', 'playCount', 'todaysPlays', 'lastPlayedDate'
	];

	for (const key of requiredKeys) {
		if (!(key in data) || typeof data[key] !== 'boolean') {
			return { isValid: false };
		}
	}

	return {
		isValid: true,
		settings: {
			rhythm: data.rhythm,
			key: data.key,
			mode: data.mode,
			playCount: data.playCount,
			todaysPlays: data.todaysPlays,
			lastPlayedDate: data.lastPlayedDate
		}
	};
}

/**
 * リトライ機能付きでFirestore操作を実行する
 * @param operation 実行する操作
 * @param maxRetries 最大リトライ回数
 * @param delay リトライ間隔（ミリ秒）
 * @returns 操作結果
 */
async function withRetry<T>(
	operation: () => Promise<T>,
	maxRetries: number = 3,
	delay: number = 1000
): Promise<T> {
	let lastError: Error;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			
			// 最後の試行でない場合、かつリトライ可能なエラーの場合のみリトライ
			if (attempt < maxRetries && isRetryableError(error)) {
				console.warn(`操作失敗 (試行 ${attempt}/${maxRetries}):`, getFirebaseErrorMessage(error));
				await new Promise(resolve => setTimeout(resolve, delay * attempt)); // 指数バックオフ
				continue;
			}
			
			throw lastError;
		}
	}

	throw lastError!;
}

/**
 * エラーがリトライ可能かどうかを判定する
 * @param error エラーオブジェクト
 * @returns リトライ可能かどうか
 */
function isRetryableError(error: unknown): boolean {
	const errorMessage = getFirebaseErrorMessage(error);
	
	// ネットワークエラー、タイムアウト、サーバーエラーなどはリトライ可能
	const retryablePatterns = [
		'unavailable',
		'deadline-exceeded',
		'aborted',
		'internal',
		'resource-exhausted',
		'ネットワーク',
		'タイムアウト',
		'サーバー'
	];

	return retryablePatterns.some(pattern => 
		errorMessage.toLowerCase().includes(pattern.toLowerCase())
	);
}

/**
 * ユーザーのテーブルヘッダー設定を取得する
 * @param uid ユーザーID
 * @returns テーブルヘッダー設定、存在しない場合はnull
 */
export async function getSettings(uid: string): Promise<TableHeaderSettings | null> {
	if (!uid) {
		console.warn('テーブルヘッダー設定取得: ユーザーIDが指定されていません');
		throw new AppError('ユーザーIDが指定されていません', { code: 'invalid-uid' });
	}

	try {
		return await withRetry(async () => {
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

			// 設定データの妥当性検証
			const validation = validateSettingsData(tableHeaderSettings);
			if (!validation.isValid) {
				console.warn('無効な設定データが検出されました:', tableHeaderSettings);
				throw new AppError('設定データが破損しています', { code: 'malformed-data' });
			}

			return validation.settings!;
		});
	} catch (error) {
		console.error('テーブルヘッダー設定取得エラー:', getFirebaseErrorMessage(error));
		
		if (error instanceof AppError) {
			throw error;
		}
		
		throw new AppError(
			`テーブルヘッダー設定の取得に失敗しました: ${getFirebaseErrorMessage(error)}`,
			{ cause: error instanceof Error ? error : new Error(String(error)) }
		);
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
		throw new AppError('ユーザーIDが指定されていません', { code: 'invalid-uid' });
	}

	if (!settings) {
		console.warn('テーブルヘッダー設定更新: 設定データが指定されていません');
		throw new AppError('設定データが指定されていません', { code: 'invalid-settings' });
	}

	// 設定データの妥当性検証
	const validation = validateSettingsData(settings);
	if (!validation.isValid) {
		console.warn('無効な設定データが指定されました:', settings);
		throw new AppError('無効な設定データです', { code: 'malformed-data' });
	}

	try {
		await withRetry(async () => {
			const docRef = doc(db, `users/${uid}`);
			
			await setDoc(
				docRef,
				{
					tableHeaderSettings: validation.settings
				},
				{ merge: true }
			);
		});
	} catch (error) {
		console.error('テーブルヘッダー設定更新エラー:', getFirebaseErrorMessage(error));
		
		if (error instanceof AppError) {
			throw error;
		}
		
		throw new AppError(
			`テーブルヘッダー設定の更新に失敗しました: ${getFirebaseErrorMessage(error)}`,
			{ cause: error instanceof Error ? error : new Error(String(error)) }
		);
	}
}

/**
 * デフォルトのテーブルヘッダー設定を取得する
 * @returns デフォルト設定
 */
export function getDefaultSettings(): TableHeaderSettings {
	return { ...DEFAULT_MOBILE_COLUMNS };
}