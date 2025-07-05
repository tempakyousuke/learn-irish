import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '$core/data/firebase/firebaseClient';
import { userStore } from '$core/store/userStore';
import { setCreationTime } from '$core/auth/userService';
import { writable, derived } from 'svelte/store';

// ユーザーの認証状態の読み込み状態を追跡するストア
export const authLoaded = writable(false);

// 認証済みユーザーかどうかを簡単に判断できるストア
export const isAuthenticated = derived(userStore, ($userStore) => $userStore.isLoggedIn);

// ユーザーIDを簡単に取得できるストア
export const userId = derived(userStore, ($userStore) => $userStore.uid);

/**
 * Firebase認証の監視を開始する
 * アプリケーション起動時に一度だけ呼び出す
 */
export function initializeAuth() {
	// 認証状態の変更を監視
	onAuthStateChanged(auth, handleAuthStateChanged);
}

/**
 * 認証状態の変更ハンドラ
 */
async function handleAuthStateChanged(firebaseUser: User | null) {
	if (firebaseUser) {
		// ユーザーがログインしている場合
		userStore.set({
			uid: firebaseUser.uid,
			isLoggedIn: true
		});

		// ユーザー作成時間を記録
		setCreationTime(firebaseUser.uid, firebaseUser.metadata.creationTime);
	} else {
		// ユーザーがログアウトしている場合
		userStore.set({
			uid: '',
			isLoggedIn: false
		});
	}

	// 認証状態の読み込みが完了したことを通知
	authLoaded.set(true);
}

/**
 * ログアウト処理
 */
export function logout() {
	return signOut(auth);
}
