import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import {
	getSettings,
	updateSettings,
	getDefaultSettings,
	type TableHeaderSettings
} from '$core/data/repositories/tableHeaderSettingsRepository';
import { userStore } from '$core/store/userStore';

/**
 * テーブルヘッダー設定ストアの状態型定義
 */
interface TableHeaderSettingsState {
	settings: TableHeaderSettings;
	loading: boolean;
	error: string | null;
}

/**
 * 初期状態
 */
const initialState: TableHeaderSettingsState = {
	settings: getDefaultSettings(),
	loading: false,
	error: null
};

/**
 * テーブルヘッダー設定を管理するストア
 */
export const tableHeaderSettingsStore: Writable<TableHeaderSettingsState> = writable(initialState);

/**
 * 認証状態の変更を監視し、設定を自動的に読み込み/クリアする
 */
let isAuthListenerInitialized = false;

export function initializeAuthListener(): void {
	if (isAuthListenerInitialized) {
		return;
	}

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
		error: null
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
			tableHeaderSettingsStore.update(state => ({
				...state,
				settings: getDefaultSettings(),
				loading: false,
				error: null
			}));
			return;
		}
		uid = currentUser.uid;
	}

	// ローディング状態を開始
	tableHeaderSettingsStore.update(state => ({
		...state,
		loading: true,
		error: null
	}));

	try {
		const userSettings = await getSettings(uid);
		const settings = userSettings || getDefaultSettings();

		tableHeaderSettingsStore.update(state => ({
			...state,
			settings,
			loading: false,
			error: null
		}));
	} catch (error) {
		console.error('テーブルヘッダー設定読み込みエラー:', error);
		const errorMessage = error instanceof Error ? error.message : '設定の読み込みに失敗しました';
		
		tableHeaderSettingsStore.update(state => ({
			...state,
			loading: false,
			error: errorMessage
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
	// uidが指定されていない場合は現在のユーザーを取得
	if (!uid) {
		const currentUser = getCurrentUser();
		if (!currentUser.isLoggedIn || !currentUser.uid) {
			console.warn('テーブルヘッダー設定更新: ユーザーがログインしていません');
			// 未認証ユーザーの場合はローカルのみ更新
			tableHeaderSettingsStore.update(state => ({
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
	let previousSettings: TableHeaderSettings;
	tableHeaderSettingsStore.update(state => {
		previousSettings = { ...state.settings };
		return {
			...state,
			settings: {
				...state.settings,
				[key]: value
			},
			error: null
		};
	});

	try {
		// 現在の設定を取得して更新
		const currentState = await new Promise<TableHeaderSettingsState>(resolve => {
			const unsubscribe = tableHeaderSettingsStore.subscribe(state => {
				unsubscribe();
				resolve(state);
			});
		});

		await updateSettings(uid, currentState.settings);
	} catch (error) {
		console.error('テーブルヘッダー設定更新エラー:', error);
		const errorMessage = error instanceof Error ? error.message : '設定の更新に失敗しました';
		
		// エラー時は前の状態に戻す
		tableHeaderSettingsStore.update(state => ({
			...state,
			settings: previousSettings,
			error: errorMessage
		}));
	}
}

/**
 * 設定をデフォルトにリセットする
 * @param uid ユーザーID（省略時は現在のユーザーを使用、認証済みユーザーの場合Firestoreにも保存）
 */
export async function resetToDefaults(uid?: string): Promise<void> {
	const defaultSettings = getDefaultSettings();

	// UIを即座に更新
	tableHeaderSettingsStore.update(state => ({
		...state,
		settings: defaultSettings,
		error: null
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
		try {
			await updateSettings(uid, defaultSettings);
		} catch (error) {
			console.error('デフォルト設定保存エラー:', error);
			const errorMessage = error instanceof Error ? error.message : 'デフォルト設定の保存に失敗しました';
			
			tableHeaderSettingsStore.update(state => ({
				...state,
				error: errorMessage
			}));
		}
	}
}

/**
 * エラー状態をクリアする
 */
export function clearError(): void {
	tableHeaderSettingsStore.update(state => ({
		...state,
		error: null
	}));
}

/**
 * 現在の設定を同期的に取得する（主にコンポーネントでの使用向け）
 * @returns 現在の設定状態
 */
export function getCurrentSettings(): TableHeaderSettings {
	let currentSettings: TableHeaderSettings = getDefaultSettings();
	
	const unsubscribe = tableHeaderSettingsStore.subscribe(state => {
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
	
	const unsubscribe = userStore.subscribe(user => {
		currentUser = user;
	});
	unsubscribe();
	
	return currentUser;
}