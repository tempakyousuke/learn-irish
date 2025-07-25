<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		block?: boolean;
		href?: string;
		target?: string;
		disabled?: boolean;
		bgColorClass?: string;
		textColorClass?: string;
		buttonClass?: string;
		className?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: () => void;
	}

	let {
		children,
		block = false,
		href = '',
		target = '',
		disabled = false,
		bgColorClass = 'bg-blue-500',
		textColorClass = 'text-white',
		buttonClass = '',
		className = '',
		type = 'button',
		onclick
	}: Props = $props();

	const finalButtonClass = $derived(
		`py-1 px-3 rounded focus:outline-none opacity-100 ${buttonClass} ${bgColorClass} ${textColorClass} ${!disabled ? ' hover:opacity-80' : ''}`
	);

	const handleClick = () => {
		onclick?.();
	};
</script>

{#snippet buttonContent()}
	<button
		class={finalButtonClass}
		class:w-full={block}
		class:opacity-70={disabled}
		{type}
		{disabled}
		onclick={handleClick}
	>
		{@render children()}
	</button>
{/snippet}

<div class="inline-block {className}" class:w-full={block}>
	{#if href !== ''}
		<a {href} {target}>
			{@render buttonContent()}
		</a>
	{:else}
		{@render buttonContent()}
	{/if}
</div>
