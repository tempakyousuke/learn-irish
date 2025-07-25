import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import {
	getSettings,
	updateSettings,
	getDefaultSettings,
	type TableHeaderSettings
} from '$core/data/repositories/tableHeaderSettingsRepository';

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
 * ユーザーのテーブルヘッダー設定を読み込む
 * @param uid ユーザーID
 */
export async function loadSettings(uid: string): Promise<void> {
	if (!uid) {
		console.warn('テーブルヘッダー設定読み込み: ユーザーIDが指定されていません');
		return;
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
 * @param uid ユーザーID
 * @param key 更新する設定のキー
 * @param value 新しい値
 */
export async function updateSetting(
	uid: string,
	key: keyof TableHeaderSettings,
	value: boolean
): Promise<void> {
	if (!uid) {
		console.warn('テーブルヘッダー設定更新: ユーザーIDが指定されていません');
		return;
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
 * @param uid ユーザーID（認証済みユーザーの場合、Firestoreにも保存）
 */
export async function resetToDefaults(uid?: string): Promise<void> {
	const defaultSettings = getDefaultSettings();

	// UIを即座に更新
	tableHeaderSettingsStore.update(state => ({
		...state,
		settings: defaultSettings,
		error: null
	}));

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