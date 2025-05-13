import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

/**
 * ログインユーザー情報の型定義
 */
type LoginUser = {
	uid: string;
	isLoggedIn: boolean;
};

/**
 * ユーザー認証状態を管理するストア
 */
export const userStore: Writable<LoginUser> = writable({
	uid: '',
	isLoggedIn: false
});