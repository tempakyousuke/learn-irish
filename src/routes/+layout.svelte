<script lang="ts">
	import '../app.css';
	import { app } from '$core/data/firebase/firebaseClient';
	import { getAnalytics } from 'firebase/analytics';
	import { Toaster } from 'svelte-sonner';
	import { setupI18n } from '$core/i18n/i18nService';
	import { onMount } from 'svelte';
	import LanguageSwitcher from '$lib/layout/LanguageSwitcher.svelte';
	import { writable } from 'svelte/store';
	import Header from '$lib/layout/navigation/Header.svelte';
	import Drawer from '$lib/layout/navigation/Drawer.svelte';
	import { initializeAuth } from '$core/auth/authService';

	// 認証サービスを初期化
	initializeAuth();

	// Analytics初期化
	getAnalytics(app);

	// ドロワーの状態管理
	let drawer = false;
	const openDrawer = () => {
		drawer = true;
	};
	const closeDrawer = (event: Event) => {
		if (event.target && (event.target as HTMLElement).classList.contains('drawer-overlay')) {
			drawer = false;
		}
	};
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && drawer) {
			drawer = false;
		}
	};

	// 国際化の準備状態
	const i18nReady = writable(false);
	onMount(async () => {
		await setupI18n();
		i18nReady.set(true);
	});
</script>

{#if $i18nReady}
	<div class="app">
		<Header {openDrawer} />
		<Drawer isOpen={drawer} {closeDrawer} {handleKeydown} />

		<div class="flex bg-teal-50 justify-end pr-4 pt-2">
			<LanguageSwitcher />
		</div>
		<main class="bg-teal-50 min-h-screen pt-10">
			<slot />
		</main>
		<footer class="pt-5 bg-teal-50"></footer>
		<Toaster position="top-right" richColors closeButton />
	</div>
{:else}
	<div class="flex items-center justify-center h-screen">Loading...</div>
{/if}
