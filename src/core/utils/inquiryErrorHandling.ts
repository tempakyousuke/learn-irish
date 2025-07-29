import { getFirebaseErrorMessage } from './errorHandling';

/**
 * 問い合わせ機能固有のエラーハンドリングユーティリティ
 */

/**
 * 問い合わせ作成時のエラーメッセージを生成
 */
export function getInquiryCreationErrorMessage(error: unknown): string {
	// Firebase固有のエラーを先にチェック
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as any).code;

		switch (code) {
			case 'permission-denied':
				return 'ログインが必要です。ログインしてから再度お試しください。';
			case 'unauthenticated':
				return 'ログインが必要です。ログインしてから再度お試しください。';
			case 'unavailable':
				return 'サーバーに接続できません。ネットワーク接続を確認してから再度お試しください。';
			case 'invalid-argument':
				return '問い合わせ内容に問題があります。入力内容を確認してください。';
			case 'resource-exhausted':
				return '一時的にアクセスが集中しています。しばらく時間をおいてから再度お試しください。';
		}
	}

	// 一般的なFirebaseエラーメッセージを使用
	return getFirebaseErrorMessage(
		error,
		'問い合わせの送信に失敗しました。しばらく時間をおいてから再度お試しください。'
	);
}

/**
 * 問い合わせ取得時のエラーメッセージを生成
 */
export function getInquiryFetchErrorMessage(error: unknown): string {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as any).code;

		switch (code) {
			case 'permission-denied':
				return '問い合わせデータへのアクセス権限がありません。管理者権限が必要です。';
			case 'unauthenticated':
				return 'ログインが必要です。管理者アカウントでログインしてください。';
			case 'unavailable':
				return 'サーバーに接続できません。ネットワーク接続を確認してください。';
			case 'not-found':
				return '問い合わせデータが見つかりませんでした。';
		}
	}

	return getFirebaseErrorMessage(error, '問い合わせデータの取得に失敗しました。');
}

/**
 * 問い合わせステータス更新時のエラーメッセージを生成
 */
export function getInquiryStatusUpdateErrorMessage(error: unknown): string {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as any).code;

		switch (code) {
			case 'permission-denied':
				return 'ステータス更新権限がありません。管理者権限が必要です。';
			case 'unauthenticated':
				return 'ログインが必要です。管理者アカウントでログインしてください。';
			case 'not-found':
				return '指定された問い合わせが見つかりませんでした。';
			case 'unavailable':
				return 'サーバーに接続できません。ネットワーク接続を確認してください。';
			case 'invalid-argument':
				return '無効なステータス値です。';
		}
	}

	return getFirebaseErrorMessage(error, 'ステータスの更新に失敗しました。');
}

/**
 * 認証関連のエラーメッセージを生成
 */
export function getAuthenticationErrorMessage(context: 'contact' | 'admin'): string {
	switch (context) {
		case 'contact':
			return 'ログインが必要です。問い合わせを送信するにはログインしてください。';
		case 'admin':
			return '管理者権限が必要です。管理者アカウントでログインしてください。';
		default:
			return 'ログインが必要です。';
	}
}

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: unknown): boolean {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as any).code;
		return (
			code === 'unavailable' ||
			code === 'deadline-exceeded' ||
			code === 'network-request-failed' ||
			code === 'timeout'
		);
	}
	return false;
}

/**
 * 権限エラーかどうかを判定
 */
export function isPermissionError(error: unknown): boolean {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as any).code;
		return code === 'permission-denied' || code === 'unauthenticated';
	}
	return false;
}

/**
 * 一時的なエラーかどうかを判定（リトライ可能）
 */
export function isRetryableError(error: unknown): boolean {
	return (
		isNetworkError(error) ||
		(error &&
			typeof error === 'object' &&
			'code' in error &&
			(error as any).code === 'resource-exhausted')
	);
}
