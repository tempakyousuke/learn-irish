<script lang="ts">
	import { t } from 'svelte-i18n';
	import Fa from 'svelte-fa';
	import { faClover } from '@fortawesome/free-solid-svg-icons';
	import { isAuthenticated, authLoaded, logout } from '$modules/auth/authService';

	export let openDrawer: () => void;
</script>

<header class="flex border-b bg-teal-800 md:px-10 pl-4 py-2">
	<button
		class="md:hidden bg-white rounded-lg py-1 px-1 mr-4 shadow-lg border text-3xl"
		on:click={openDrawer}
		aria-label="Open navigation menu"
	>
		<Fa class="text-teal-800" icon={faClover} />
	</button>
	<a href="/" class="text-white text-3xl grow my-auto flex">
		<Fa class="mr-3 mt-0.5 md:block hidden" icon={faClover} />
		Learn Irish from hatao's youtube</a
	>
	<a
		href="/about"
		class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
		>About</a
	>
	{#if $authLoaded && !$isAuthenticated}
		<a
			href="/signin"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
			>{$t('sign_in')}</a
		>
		<a
			href="/signup"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
			>{$t('create_account')}</a
		>
	{/if}
	{#if $authLoaded && $isAuthenticated}
		<a
			href="/mydata"
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
			>mydata</a
		>
		<button
			class="text-white text-2xl ml-3 py-5 border-b-2 border-teal-800 hover:border-white hidden md:block"
			on:click={logout}>{$t('sign_out')}</button
		>
	{/if}
</header>