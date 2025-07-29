import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import {
	getSettings,
	updateSettings,
	getDefaultSettings,
	type TableHeaderSettings
} from '$core/data/repositories/tableHeaderSettingsRepository';
import { userStore } from '$core/store/userStore';
import { AppError } from '$core/utils/errorHandling';

/**
 * テーブルヘッダー設定ストアの状態型定義
 */
interface TableHeaderSettingsState {
	settings: TableHeaderSettings;
	loading: boolean;
	error: string | null;
	isOnline: boolean;
	pendingChanges: Partial<TableHeaderSettings> | null;
	lastSyncTime: number | null;
	retryCount: number;
}

/**
 * 初期状態
 */
const initialState: TableHeaderSettingsState = {
	settings: getDefaultSettings(),
	loading: false,
	error: null,
	isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
	pendingChanges: null,
	lastSyncTime: null,
	retryCount: 0
};

/**
 * テーブルヘッダー設定を管理するストア
 */
export const tableHeaderSettingsStore: Writable<TableHeaderSettingsState> = writable(initialState);

/**
 * ネットワーク状態を監視し、オンライン/オフライン状態を管理する
 */
function initializeNetworkMonitoring(): void {
	if (typeof window === 'undefined') return;

	const updateOnlineStatus = () => {
		const isOnline = navigator.onLine;
		tableHeaderSettingsStore.update((state) => ({
			...state,
			isOnline
		}));

		// オンラインに復帰した場合、保留中の変更を同期
		if (isOnline) {
			syncPendingChanges();
		}
	};

	window.addEventListener('online', updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
}

/**
 * 保留中の変更をサーバーに同期する
 */
async function syncPendingChanges(): Promise<void> {
	const currentState = getCurrentState();

	if (!currentState.pendingChanges || !currentState.isOnline) {
		return;
	}

	const currentUser = getCurrentUser();
	if (!currentUser.isLoggedIn || !currentUser.uid) {
		// 未認証の場合は保留中の変更をクリア
		tableHeaderSettingsStore.update((state) => ({
			...state,
			pendingChanges: null
		}));
		return;
	}

	try {
		// 保留中の変更を現在の設定にマージ
		const updatedSettings = {
			...currentState.settings,
			...currentState.pendingChanges
		};

		await updateSettings(currentUser.uid, updatedSettings);

		// 同期成功時は保留中の変更をクリア
		tableHeaderSettingsStore.update((state) => ({
			...state,
			pendingChanges: null,
			lastSyncTime: Date.now(),
			retryCount: 0,
			error: null
		}));
	} catch (error) {
		console.error('保留中の変更の同期に失敗:', error);

		// リトライ回数を増やし、エラー状態を更新
		tableHeaderSettingsStore.update((state) => ({
			...state,
			retryCount: state.retryCount + 1,
			error: error instanceof Error ? error.message : '同期に失敗しました'
		}));
	}
}

/**
 * 認証状態の変更を監視し、設定を自動的に読み込み/クリアする
 */
let isAuthListenerInitialized = false;

export function initializeAuthListener(): void {
	if (isAuthListenerInitialized) {
		return;
	}

	// ネットワーク監視を初期化
	initializeNetworkMonitoring();

	userStore.subscribe(async (user) => {
		if (user.isLoggedIn && user.uid) {
			// ユーザーがログインした場合、設定を自動読み込み
			await loadSettings(user.uid);
		} else {
			// ユーザーがログアウトした場合、設定をデフォルトにリセット
			clearSettingsOnLogout();
		}
	});

	isAuthListenerInitialized = true;
}

/**
 * ログアウト時に設定をクリアしてデフォルトに戻す
 */
function clearSettingsOnLogout(): void {
	tableHeaderSettingsStore.set({
		settings: getDefaultSettings(),
		loading: false,
		error: null,
		isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
		pendingChanges: null,
		lastSyncTime: null,
		retryCount: 0
	});
}

/**
 * ユーザーのテーブルヘッダー設定を読み込む
 * @param uid ユーザーID（省略時は現在のユーザーを使用）
 */
export async function loadSettings(uid?: string): Promise<void> {
	// uidが指定されていない場合は現在のユーザーを取得
	if (!uid) {
		const currentUser = getCurrentUser();
		if (!currentUser.isLoggedIn || !currentUser.uid) {
			console.warn('テーブルヘッダー設定読み込み: ユーザーがログインしていません');
			// 未認証ユーザーの場合はデフォルト設定を使用
			tableHeaderSettingsStore.update((state) => ({
				...state,
				settings: getDefaultSettings(),
				loading: false,
				error: null,
				pendingChanges: null,
				retryCount: 0
			}));
			return;
		}
		uid = currentUser.uid;
	}

	// ローディング状態を開始
	tableHeaderSettingsStore.update((state) => ({
		...state,
		loading: true,
		error: null,
		retryCount: 0
	}));

	try {
		const userSettings = await getSettings(uid);
		const settings = userSettings || getDefaultSettings();

		tableHeaderSettingsStore.update((state) => ({
			...state,
			settings,
			loading: false,
			error: null,
			lastSyncTime: Date.now(),
			retryCount: 0
		}));
	} catch (error) {
		console.error('テーブルヘッダー設定読み込みエラー:', error);

		let errorMessage = '設定の読み込みに失敗しました';
		let fallbackToDefaults = false;

		if (error instanceof AppError) {
			switch (error.code) {
				case 'malformed-data':
					errorMessage = '設定データが破損しています。デフォルト設定を使用します。';
					fallbackToDefaults = true;
					break;
				case 'invalid-uid':
					errorMessage = 'ユーザー認証に問題があります。再度ログインしてください。';
					break;
				default:
					errorMessage = error.message;
			}
		} else {
			errorMessage = error instanceof Error ? error.message : errorMessage;
		}

		// データが破損している場合はデフォルト設定を使用
		const settings = fallbackToDefaults ? getDefaultSettings() : getCurrentState().settings;

		tableHeaderSettingsStore.update((state) => ({
			...state,
			settings,
			loading: false,
			error: errorMessage,
			retryCount: state.retryCount + 1
		}));
	}
}

/**
 * 個別の列設定を更新する
 * @param key 更新する設定のキー
 * @param value 新しい値
 * @param uid ユーザーID（省略時は現在のユーザーを使用）
 */
export async function updateSetting(
	key: keyof TableHeaderSettings,
	value: boolean,
	uid?: string
): Promise<void> {
	const currentState = getCurrentState();

	// uidが指定されていない場合は現在のユーザーを取得
	if (!uid) {
		const currentUser = getCurrentUser();
		if (!currentUser.isLoggedIn || !currentUser.uid) {
			console.warn('テーブルヘッダー設定更新: ユーザーがログインしていません');
			// 未認証ユーザーの場合はローカルのみ更新
			tableHeaderSettingsStore.update((state) => ({
				...state,
				settings: {
					...state.settings,
					[key]: value
				},
				error: null
			}));
			return;
		}
		uid = currentUser.uid;
	}

	// 楽観的更新: UIを即座に更新
	const previousSettings = { ...currentState.settings };
	const newSettings = {
		...currentState.settings,
		[key]: value
	};

	tableHeaderSettingsStore.update((state) => ({
		...state,
		settings: newSettings,
		error: null
	}));

	// オフラインの場合は保留中の変更として保存
	if (!currentState.isOnline) {
		tableHeaderSettingsStore.update((state) => ({
			...state,
			pendingChanges: {
				...state.pendingChanges,
				[key]: value
			}
		}));
		return;
	}

	try {
		await updateSettings(uid, newSettings);

		// 成功時は保留中の変更をクリア
		tableHeaderSettingsStore.update((state) => ({
			...state,
			lastSyncTime: Date.now(),
			retryCount: 0,
			pendingChanges: null
		}));
	} catch (error) {
		console.error('テーブルヘッダー設定更新エラー:', error);

		let errorMessage = '設定の更新に失敗しました';
		let shouldRevert = true;

		if (error instanceof AppError) {
			switch (error.code) {
				case 'malformed-data':
					errorMessage = '無効な設定データです。デフォルト設定に戻します。';
					break;
				case 'invalid-uid':
					errorMessage = 'ユーザー認証に問題があります。再度ログインしてください。';
					break;
				default:
					errorMessage = error.message;
			}
		} else {
			errorMessage = error instanceof Error ? error.message : errorMessage;
		}

		// ネットワークエラーの場合は保留中の変更として保存し、リバートしない
		if (errorMessage.includes('ネットワーク') || errorMessage.includes('接続')) {
			shouldRevert = false;
			tableHeaderSettingsStore.update((state) => ({
				...state,
				pendingChanges: {
					...state.pendingChanges,
					[key]: value
				},
				error: errorMessage,
				retryCount: state.retryCount + 1
			}));
		} else if (shouldRevert) {
			// その他のエラーの場合は前の状態に戻す
			tableHeaderSettingsStore.update((state) => ({
				...state,
				settings: previousSettings,
				error: errorMessage,
				retryCount: state.retryCount + 1
			}));
		}
	}
}

/**
 * 設定をデフォルトにリセットする
 * @param uid ユーザーID（省略時は現在のユーザーを使用、認証済みユーザーの場合Firestoreにも保存）
 */
export async function resetToDefaults(uid?: string): Promise<void> {
	const defaultSettings = getDefaultSettings();
	const currentState = getCurrentState();

	// UIを即座に更新
	tableHeaderSettingsStore.update((state) => ({
		...state,
		settings: defaultSettings,
		error: null,
		pendingChanges: null
	}));

	// uidが指定されていない場合は現在のユーザーを取得
	if (!uid) {
		const currentUser = getCurrentUser();
		if (currentUser.isLoggedIn && currentUser.uid) {
			uid = currentUser.uid;
		}
	}

	// 認証済みユーザーの場合はFirestoreにも保存
	if (uid) {
		// オフラインの場合は保留中の変更として保存
		if (!currentState.isOnline) {
			tableHeaderSettingsStore.update((state) => ({
				...state,
				pendingChanges: defaultSettings
			}));
			return;
		}

		try {
			await updateSettings(uid, defaultSettings);

			tableHeaderSettingsStore.update((state) => ({
				...state,
				lastSyncTime: Date.now(),
				retryCount: 0
			}));
		} catch (error) {
			console.error('デフォルト設定保存エラー:', error);

			let errorMessage = 'デフォルト設定の保存に失敗しました';

			if (error instanceof AppError) {
				switch (error.code) {
					case 'invalid-uid':
						errorMessage = 'ユーザー認証に問題があります。再度ログインしてください。';
						break;
					default:
						errorMessage = error.message;
				}
			} else {
				errorMessage = error instanceof Error ? error.message : errorMessage;
			}

			// ネットワークエラーの場合は保留中の変更として保存
			if (errorMessage.includes('ネットワーク') || errorMessage.includes('接続')) {
				tableHeaderSettingsStore.update((state) => ({
					...state,
					pendingChanges: defaultSettings,
					error: errorMessage,
					retryCount: state.retryCount + 1
				}));
			} else {
				tableHeaderSettingsStore.update((state) => ({
					...state,
					error: errorMessage,
					retryCount: state.retryCount + 1
				}));
			}
		}
	}
}

/**
 * エラー状態をクリアする
 */
export function clearError(): void {
	tableHeaderSettingsStore.update((state) => ({
		...state,
		error: null,
		retryCount: 0
	}));
}

/**
 * 失敗した操作を再試行する
 */
export async function retryFailedOperation(): Promise<void> {
	const currentState = getCurrentState();

	if (!currentState.isOnline) {
		tableHeaderSettingsStore.update((state) => ({
			...state,
			error: 'オフラインです。接続を確認してください。'
		}));
		return;
	}

	// 保留中の変更がある場合は同期を試行
	if (currentState.pendingChanges) {
		await syncPendingChanges();
	} else {
		// 保留中の変更がない場合は設定を再読み込み
		const currentUser = getCurrentUser();
		if (currentUser.isLoggedIn && currentUser.uid) {
			await loadSettings(currentUser.uid);
		}
	}
}

/**
 * 現在のストア状態を同期的に取得する
 */
function getCurrentState(): TableHeaderSettingsState {
	let currentState: TableHeaderSettingsState = initialState;

	const unsubscribe = tableHeaderSettingsStore.subscribe((state) => {
		currentState = state;
	});
	unsubscribe();

	return currentState;
}

/**
 * 現在の設定を同期的に取得する（主にコンポーネントでの使用向け）
 * @returns 現在の設定状態
 */
export function getCurrentSettings(): TableHeaderSettings {
	let currentSettings: TableHeaderSettings = getDefaultSettings();

	const unsubscribe = tableHeaderSettingsStore.subscribe((state) => {
		currentSettings = state.settings;
	});
	unsubscribe();

	return currentSettings;
}

/**
 * 現在のユーザー情報を同期的に取得する
 * @returns 現在のユーザー状態
 */
function getCurrentUser() {
	let currentUser = { uid: '', isLoggedIn: false };

	const unsubscribe = userStore.subscribe((user) => {
		currentUser = user;
	});
	unsubscribe();

	return currentUser;
}
