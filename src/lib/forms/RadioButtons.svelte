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
		<input
			type="radio"
			{name}
			id={option.id}
			value={option.value}
			bind:group={userSelected}
			on:input={handleInput}
			on:change={handleChange}
		/>
		<label for={option.id}> {option.label} </label>
	{/each}
</div>

<style>
	.radio input ~ label {
		background-color: rgb(233, 225, 225);
		color: rgb(158, 146, 146);
	}
	.radio input:checked ~ label {
		background-color: rgb(70, 230, 22);
		color: white;
	}
</style>
