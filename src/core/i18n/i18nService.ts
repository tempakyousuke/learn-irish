import { register, init, getLocaleFromNavigator, locale, waitLocale } from 'svelte-i18n';

/**
 * 国際化機能の初期設定を行う
 * @returns 初期化完了を表すPromise
 */
export function setupI18n(): Promise<void> {
	register('en', () => import('../i18n/locales/en.json'));
	register('ja', () => import('../i18n/locales/ja.json'));

	init({
		fallbackLocale: 'en',
		initialLocale: null
	});

	const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null;
	if (savedLocale) {
		locale.set(savedLocale);
	} else {
		locale.set(getLocaleFromNavigator());
	}

	// 初期化完了を待てるようにする
	return waitLocale();
}

/**
 * 指定された言語に切り替える
 * @param lang 言語コード（'en'または'ja'）
 */
export function changeLanguage(lang: string): void {
	locale.set(lang);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem('locale', lang);
	}
}

/**
 * 現在の言語を取得する
 * @returns 現在設定されている言語コード
 */
export function getCurrentLanguage(): string {
	return locale.toString();
}