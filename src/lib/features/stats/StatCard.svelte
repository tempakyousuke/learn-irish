<script lang="ts">
	import { Fa } from 'svelte-fa';
	import type { IconDefinition } from '@fortawesome/fontawesome-common-types';

	let {
		title,
		value,
		icon,
		color = 'teal'
	}: {
		title: string;
		value: string | number;
		icon: IconDefinition;
		color?: string; // カラー名（例: teal, emerald, orange, blue など）
	} = $props();

	const statColor = $derived(`var(--stat-color-${color})`);
	const statBg = $derived(`var(--stat-bg-${color})`);
	const styleVars = $derived(`--stat-color: ${statColor}; --stat-bg: ${statBg};`);
</script>

<div
	class="stat-card border-2 rounded-xl p-4 bg-white shadow-md flex flex-col items-center justify-center min-h-[180px]"
	style="border-color: var(--stat-color); {styleVars}"
>
	<div class="icon-wrapper mb-4" style="background: var(--stat-bg);">
		<Fa {icon} class="w-12 h-12" style="color: var(--stat-color);" />
	</div>
	<div class="stat-title md:text-2xl text-xl text-center font-bold text-gray-800 mb-2">{title}</div>
	<div
		class="stat-value mt-2 mx-auto rounded-xl py-2 text-center font-mono font-extrabold"
		style="color: var(--stat-color); background: var(--stat-bg);"
	>
		{value}
	</div>
</div>

<svelte:head>
	<style>
		:root {
			--stat-color-teal: #14b8a6;
			--stat-bg-teal: #99f6e4;
			--stat-color-emerald: #10b981;
			--stat-bg-emerald: #a7f3d0;
			--stat-color-orange: #f59e42;
			--stat-bg-orange: #fde68a;
			--stat-color-blue: #3b82f6;
			--stat-bg-blue: #bfdbfe;
		}
	</style>
</svelte:head>

<style>
	.stat-card {
		transition: box-shadow 0.2s;
	}
	.stat-card:hover {
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
	}
	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		width: 4rem;
		height: 4rem;
		margin-bottom: 1rem;
	}
	.stat-title {
		min-height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		word-break: break-word;
		text-align: center;
		margin-bottom: 0.5rem;
	}
	.stat-value {
		min-width: 9rem;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		box-sizing: border-box;
		margin-left: auto;
		margin-right: auto;
		font-size: clamp(2.5rem, 5vw, 3rem);
		max-width: 100%;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	@media (max-width: 600px) {
		.stat-title {
			min-height: 2.5rem;
		}
		.stat-value {
			min-width: 7rem;
			font-size: clamp(1.3rem, 6vw, 2rem);
		}
	}
</style>
