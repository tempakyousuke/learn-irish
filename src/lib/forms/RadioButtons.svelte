<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Option = {
		label: string;
		value: string | boolean | number;
		id: string;
	};

	export let options: Option[];
	export let className = '';
	export let name: string;
	export let userSelected = options[0].value;

	const dispatch = createEventDispatcher();
	const handleChange = () => {
		dispatch('change');
	};

	const handleInput = () => {
		dispatch('input');
	};
</script>

<div class={className}>
	{#each options as option}
		<div class="flex items-center gap-3 mb-2">
			<input
				class="h-4 w-4 accent-cyan-400 transition"
				type="radio"
				{name}
				id={option.id}
				value={option.value}
				bind:group={userSelected}
				on:input={handleInput}
				on:change={handleChange}
			/>
			<label class="cursor-pointer select-none text-sm" for={option.id}>{option.label}</label>
		</div>
	{/each}
</div>

<style>
	.radio input {
		width: 1.25rem;
		height: 1.25rem;
		accent-color: #10b981;
		transition: background-color 0.3s ease;
	}

	.radio input:checked {
		background-color: #10b981;
	}

	.radio label {
		font-size: 1rem;
		color: #374151;
		transition: color 0.3s ease;
	}

	.radio label:hover {
		color: #10b981;
	}
</style>
