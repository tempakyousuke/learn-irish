import { register, init, getLocaleFromNavigator, locale, waitLocale } from 'svelte-i18n';

export function setupI18n(): Promise<void> {
	register('en', () => import('../locales/en.json'));
	register('ja', () => import('../locales/ja.json'));

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

	// 🎯 これで初期化完了を待てるようになる
	return waitLocale();
}
