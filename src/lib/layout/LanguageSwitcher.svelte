<script lang="ts">
	import { locale, getLocaleFromNavigator } from 'svelte-i18n';
	import { faGlobe } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import Fa from 'svelte-fa';

	type LocaleOption = {
		code: string;
		label: string;
	};

	const availableLocales: LocaleOption[] = [
		{ code: 'en', label: 'English' },
		{ code: 'ja', label: '日本語' }
	];

	let currentLocale: string = 'en';

	$: locale.subscribe((value) => {
		currentLocale = value ?? 'en'; // fallbackを設定
	});

	function changeLang(lang: string): void {
		locale.set(lang);
		localStorage.setItem('locale', lang);
	}

	function onSelectChange(event: Event): void {
		const selectedLang = (event.target as HTMLSelectElement).value;
		changeLang(selectedLang);
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
	<select
		class="border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		bind:value={currentLocale}
		on:change={onSelectChange}
	>
		{#each availableLocales as lang}
			<option value={lang.code}>{lang.label}</option>
		{/each}
	</select>
</div>
