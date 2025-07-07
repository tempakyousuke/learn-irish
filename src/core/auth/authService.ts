import {
	onAuthStateChanged,
	signOut,
	signInWithPopup,
	GoogleAuthProvider,
	linkWithPopup,
	linkWithCredential,
	EmailAuthProvider,
	unlink,
	fetchSignInMethodsForEmail,
	type User
} from 'firebase/auth';
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
 * Googleログイン処理
 */
export function loginWithGoogle() {
	const provider = new GoogleAuthProvider();
	return signInWithPopup(auth, provider);
}

/**
 * ログアウト処理
 */
export function logout() {
	return signOut(auth);
}

/**
 * 現在のユーザーにGoogleアカウントをリンクする
 */
export function linkGoogleAccount() {
	if (!auth.currentUser) {
		throw new Error('No user is currently signed in');
	}
	const provider = new GoogleAuthProvider();
	return linkWithPopup(auth.currentUser, provider);
}

/**
 * 現在のユーザーにメール/パスワード認証をリンクする
 */
export function linkEmailPassword(email: string, password: string) {
	if (!auth.currentUser) {
		throw new Error('No user is currently signed in');
	}
	const credential = EmailAuthProvider.credential(email, password);
	return linkWithCredential(auth.currentUser, credential);
}

/**
 * 認証プロバイダーのリンクを解除する
 */
export function unlinkProvider(providerId: string) {
	if (!auth.currentUser) {
		throw new Error('No user is currently signed in');
	}
	return unlink(auth.currentUser, providerId);
}

/**
 * メールアドレスに関連付けられたサインイン方法を取得する
 */
export function getSignInMethodsForEmail(email: string) {
	return fetchSignInMethodsForEmail(auth, email);
}

/**
 * 現在のユーザーのリンクされたプロバイダー情報を取得する
 */
export function getLinkedProviders() {
	if (!auth.currentUser) {
		return [];
	}
	return auth.currentUser.providerData.map(provider => ({
		providerId: provider.providerId,
		uid: provider.uid,
		displayName: provider.displayName,
		email: provider.email,
		photoURL: provider.photoURL
	}));
}
