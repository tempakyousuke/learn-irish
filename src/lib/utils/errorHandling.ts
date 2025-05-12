import { FirestoreError } from 'firebase/firestore';
import type { AuthError } from 'firebase/auth';

/**
 * Firebaseエラーをユーザーフレンドリーなメッセージに変換する
 * @param error 元のエラー
 * @param defaultMessage デフォルトのエラーメッセージ
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
export function getFirebaseErrorMessage(error: unknown, defaultMessage = 'エラーが発生しました'): string {
  // Firestoreエラーの場合
  if (error instanceof FirestoreError) {
    return getFirestoreErrorMessage(error);
  }
  
  // 認証エラーの場合
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code.startsWith('auth/')) {
    return getAuthErrorMessage(error as AuthError);
  }
  
  // その他のエラー
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  
  return defaultMessage;
}

/**
 * Firestoreエラーをユーザーフレンドリーなメッセージに変換する
 * @param error Firestoreエラー
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
function getFirestoreErrorMessage(error: FirestoreError): string {
  switch (error.code) {
    case 'permission-denied':
      return 'アクセス権限がありません';
    case 'unavailable':
      return 'サーバーに接続できません。ネットワーク接続を確認してください';
    case 'not-found':
      return '指定されたデータが見つかりませんでした';
    case 'cancelled':
      return '操作がキャンセルされました';
    case 'data-loss':
      return 'データが失われました。もう一度お試しください';
    case 'deadline-exceeded':
      return 'タイムアウトしました。もう一度お試しください';
    case 'failed-precondition':
      return '操作の前提条件が満たされていません';
    case 'aborted':
      return '操作が中断されました。もう一度お試しください';
    case 'already-exists':
      return '既に存在するデータです';
    case 'resource-exhausted':
      return 'リソースの上限に達しました。しばらく時間をおいてお試しください';
    case 'internal':
      return 'サーバー内部エラーが発生しました。しばらく時間をおいてお試しください';
    case 'invalid-argument':
      return '無効な引数が指定されました';
    case 'out-of-range':
      return '指定された値が範囲外です';
    case 'unauthenticated':
      return '認証が必要です。ログインしてください';
    case 'unimplemented':
      return 'この機能はまだ実装されていません';
    case 'unknown':
    default:
      return `データベースエラー: ${error.message}`;
  }
}

/**
 * Firebase認証エラーをユーザーフレンドリーなメッセージに変換する
 * @param error 認証エラー
 * @returns ユーザーフレンドリーなエラーメッセージ
 */
function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています';
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが間違っています';
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが間違っています';
    case 'auth/weak-password':
      return 'パスワードが短すぎます。6文字以上で設定してください';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。接続を確認してください';
    case 'auth/too-many-requests':
      return 'アクセスが集中しています。しばらく時間をおいてお試しください';
    case 'auth/internal-error':
      return '内部エラーが発生しました。もう一度お試しください';
    case 'auth/popup-closed-by-user':
      return '認証ポップアップが閉じられました。もう一度お試しください';
    case 'auth/requires-recent-login':
      return '再度ログインしてから操作を行ってください';
    case 'auth/operation-not-allowed':
      return 'この操作は許可されていません';
    default:
      return `認証エラー: ${error.message}`;
  }
}

/**
 * エラーをキャッチしてコンソールに出力し、ユーザーフレンドリーなエラーを返す
 * 非同期関数のtry-catchラッパー
 * @param fn 実行する非同期関数
 * @param errorPrefix エラーメッセージの接頭辞
 * @returns 元の関数の戻り値またはnull（エラー時）
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorPrefix = 'エラー'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = getFirebaseErrorMessage(error);
    console.error(`${errorPrefix}:`, error);
    return { data: null, error: `${errorPrefix}: ${errorMessage}` };
  }
}

/**
 * エラー情報を標準化したカスタムエラークラス
 */
export class AppError extends Error {
  code?: string;
  
  constructor(message: string, options?: { cause?: Error; code?: string }) {
    super(message, options);
    this.name = 'AppError';
    this.code = options?.code;
    
    // Errorオブジェクトのprototypeチェーンを修復（TypeScriptクラス拡張のバグ回避）
    Object.setPrototypeOf(this, AppError.prototype);
  }
}