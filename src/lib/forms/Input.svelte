<script lang="ts">
	interface Props {
		disabled?: boolean;
		readonly?: boolean;
		placeholder?: string;
		value?: string | number | undefined;
		type?: string;
		label?: string;
		className?: string;
		error?: string;
		onchange?: () => void;
		oninput?: () => void;
	}

	let {
		disabled = false,
		readonly = false,
		placeholder = '',
		value = $bindable(''),
		type = 'text',
		label = '',
		className = '',
		error = '',
		onchange,
		oninput
	}: Props = $props();
</script>

<div class="flex justify-center items-center {className}">
	<div class="relative h-10 w-full" class:empty={!placeholder && value === ''}>
		{#if type == 'text'}
			<input bind:value {disabled} {readonly} {placeholder} {onchange} {oninput} />
		{/if}
		{#if type == 'email'}
			<input bind:value {disabled} {readonly} {placeholder} type="email" {onchange} {oninput} />
		{/if}
		{#if type == 'password'}
			<input
				bind:value
				{disabled}
				{readonly}
				{placeholder}
				type="password"
				autocomplete="on"
				{onchange}
				{oninput}
			/>
		{/if}
		{#if type == 'number'}
			<input bind:value {disabled} {readonly} {placeholder} type="number" {onchange} {oninput} />
		{/if}
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

	input {
		@apply h-full w-full border-gray-300 px-2 transition-all rounded border-2;
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
	.empty input:not(:focus) + .label {
		top: 50%;
		transform: translateY(-50%);
		font-size: 1rem;
	}
	input:not(:focus) + .label {
		color: rgba(150, 150, 150, 1);
	}
	input {
		border-width: 1px;
	}
	input:focus {
		outline: none;
		border-color: rgba(37, 99, 235, 1);
	}
</style>
