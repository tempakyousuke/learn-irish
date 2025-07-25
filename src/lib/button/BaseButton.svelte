<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	export let block = false;
	export let disabled = false;
	export let buttonClass = '';
	export let className = '';
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const dispatch = createEventDispatcher();
	const handleClick = () => {
		dispatch('click');
	};
</script>

<div class="inline-block {className}" class:w-full={block}>
	<button
		class="button {buttonClass}"
		class:w-full={block}
		class:disabled
		{type}
		{disabled}
		on:click={handleClick}
	>
		<slot />
	</button>
</div>

<style lang="postcss">
	@reference "../../app.css";

	.button {
		@apply py-1 px-3 rounded focus:outline-none bg-opacity-100;
	}
	.disabled {
		opacity: 0.7;
	}
</style>
