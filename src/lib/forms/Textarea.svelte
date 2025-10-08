<script lang="ts">
	interface Props {
		disabled?: boolean;
		readonly?: boolean;
		placeholder?: string;
		value?: string | undefined;
		label?: string;
		className?: string;
		error?: string;
		onchange?: () => void;
		oninput?: () => void;
		rows?: number;
	}

	let {
		disabled = false,
		readonly = false,
		placeholder = '',
		value = $bindable(''),
		label = '',
		className = '',
		error = '',
		onchange,
		oninput,
		rows = 3
	}: Props = $props();
</script>

<div class="flex justify-center items-center {className}">
	<div class="relative w-full" class:empty={!placeholder && value === ''}>
		<textarea bind:value {disabled} {readonly} {placeholder} {rows} {onchange} {oninput}></textarea>
		<div class="label">
			{label}
		</div>
		{#if error}
			<p class="text-red-500 text-xs italic">
				{error}
			</p>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "../../app.css";

	textarea {
		@apply w-full border-gray-300 px-2 py-2 transition-all rounded border-2;
		min-height: 2.5rem;
	}

	.label {
		@apply absolute left-2 transition-all bg-white px-1;
	}

	.label {
		top: 0%;
		transform: translateY(-50%);
		font-size: 0.7rem;
		color: rgba(37, 99, 235, 1);
	}
	.empty textarea:not(:focus) + .label {
		top: 0.75rem;
		transform: translateY(0);
		font-size: 1rem;
	}
	textarea:not(:focus) + .label {
		color: rgba(150, 150, 150, 1);
	}
	textarea {
		border-width: 1px;
	}
	textarea:focus {
		outline: none;
		border-color: rgba(37, 99, 235, 1);
	}
</style>
