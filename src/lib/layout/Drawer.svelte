<script lang="ts">
	import { t } from 'svelte-i18n';
	import { isAuthenticated, authLoaded, logout } from '$core/auth/authService';

	type Props = {
		isOpen?: boolean;
		closeDrawer: (event: Event) => void;
		handleKeydown: (event: KeyboardEvent) => void;
	};

	let { isOpen = false, closeDrawer, handleKeydown }: Props = $props();
</script>

<!-- Drawer Overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-gray-900 opacity-50 drawer-overlay"
		onclick={closeDrawer}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
		aria-label="Close navigation menu"
	></div>
{/if}

<!-- Drawer Content -->
<div
	class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform"
	class:translate-x-0={isOpen}
	class:-translate-x-full={!isOpen}
>
	<div class="p-4 w-full">
		<ul class="mt-4 space-y-2">
			<li><a href="/" class="block px-4 py-2 rounded hover:bg-gray-100">TOP</a></li>
			<li><a href="/about" class="block px-4 py-2 rounded hover:bg-gray-100">About</a></li>
			{#if $authLoaded && !$isAuthenticated}
				<li>
					<a href="/signin" class="block px-4 py-2 rounded hover:bg-gray-100">{$t('sign_in')}</a>
				</li>
				<li>
					<a href="/signup" class="block px-4 py-2 rounded hover:bg-gray-100"
						>{$t('create_account')}</a
					>
				</li>
			{/if}
			{#if $authLoaded && $isAuthenticated}
				<li>
					<a href="/mydata" class="block px-4 py-2 rounded hover:bg-gray-100">My data</a>
				</li>
				<li>
					<a href="/contact" class="block px-4 py-2 rounded hover:bg-gray-100">Contact</a>
				</li>
				<li>
					<a href="/settings" class="block px-4 py-2 rounded hover:bg-gray-100">{$t('settings')}</a>
				</li>
				<li>
					<button class="inline px-4 py-2 rounded hover:bg-gray-100" onclick={logout}
						>{$t('sign_out')}</button
					>
				</li>
			{/if}
		</ul>
	</div>
</div>
