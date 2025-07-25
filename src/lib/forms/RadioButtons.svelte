<script lang="ts">
	type Option = {
		label: string;
		value: string | boolean | number;
		id: string;
	};

	interface Props {
		options: Option[];
		className?: string;
		name: string;
		userSelected?: string | boolean | number;
		onchange?: () => void;
		oninput?: () => void;
	}

	let { options, className = '', name, userSelected = $bindable(options[0].value), onchange, oninput }: Props = $props();
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
				oninput={oninput}
				onchange={onchange}
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
