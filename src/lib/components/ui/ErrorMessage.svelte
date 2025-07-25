<script lang="ts">
	import { t } from 'svelte-i18n';
	export let message: string | null = null;
	export let dismissable = false;
	export let type: 'error' | 'warning' | 'info' = 'error';

	function getColorClasses() {
		switch (type) {
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'warning':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			case 'info':
				return 'bg-blue-100 text-blue-800 border-blue-200';
		}
	}

	function handleDismiss() {
		message = null;
	}
</script>

{#if message}
	<div
		class="rounded-lg p-4 mb-4 border {getColorClasses()} flex items-start"
		role="alert"
		aria-live="assertive"
	>
		<div class="flex-grow">
			{#if type === 'error'}
				<h3 class="font-medium">エラーが発生しました</h3>
			{:else if type === 'warning'}
				<h3 class="font-medium">警告</h3>
			{:else}
				<h3 class="font-medium">お知らせ</h3>
			{/if}
			<p>{message}</p>
		</div>
		{#if dismissable}
			<button
				on:click={handleDismiss}
				class="ml-4 text-gray-500 hover:text-gray-800 transition-colors"
				aria-label={$t('close')}
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					></path>
				</svg>
			</button>
		{/if}
	</div>
{/if}
