<script lang="ts">
	import { locale, getLocaleFromNavigator } from 'svelte-i18n';
	import { faGlobe } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';

	let currentLocale: string = 'en';

	$: locale.subscribe((value) => {
		currentLocale = value ?? 'en'; // fallbackを設定
	});

	function toggleLanguage(): void {
		const newLang = currentLocale === 'en' ? 'ja' : 'en';
		locale.set(newLang);
		localStorage.setItem('locale', newLang);
	}

	onMount(() => {
		const savedLocale = localStorage.getItem('locale');
		if (savedLocale) {
			locale.set(savedLocale);
		} else {
			locale.set(getLocaleFromNavigator());
		}
	});
</script>

<div class="flex items-center gap-2">
	<Fa icon={faGlobe} class="text-gray-600 w-5 h-5" />
	<button
		class="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
		onclick={toggleLanguage}
	>
		{currentLocale === 'ja' ? 'English' : '日本語'}
	</button>
</div>
