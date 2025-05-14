<script lang="ts">
	import {
		rememberNameOption,
		rememberMelodyOption,
		onlyFavoriteOption,
		sortByOption
	} from './__options';
	import { t } from 'svelte-i18n';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import { faFilter } from '@fortawesome/free-solid-svg-icons';
	import { Fa } from 'svelte-fa';

	export let isLoggedIn: boolean;
	export let rememberName: string;
	export let rememberMelody: string;
	export let onlyFavorite: string;
	export let selectedRhythm: string;
	export let sortBy: string;
	export let rhythms: string[] = [];
</script>

{#if isLoggedIn}
	<div
		class="bg-gradient-to-r from-cyan-100 to-teal-100 border border-gray-200 rounded-2xl shadow-lg p-8 mb-10 mt-10 md:w-7/12 w-11/12 mx-auto"
	>
		<div class="flex items-center justify-center mb-4">
			<Fa icon={faFilter} class="w-7 h-7 text-emerald-400 mr-2" />
			<div class="text-3xl font-extrabold text-gray-800">{$t('search_filter')}</div>
		</div>
		<div
			class="h-1 w-24 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full mx-auto mb-8"
		></div>
		<form class="space-y-6">
			<div>
				<div class="label">{$t('memorized_name')}</div>
				<div class="flex flex-row gap-4">
					<RadioButtons
						className="flex flex-row gap-4"
						options={$rememberNameOption}
						bind:userSelected={rememberName}
						name="rememberName"
					/>
				</div>
			</div>
			<div>
				<div class="label">{$t('memorized_melody')}</div>
				<div class="flex flex-row gap-4">
					<RadioButtons
						className="flex flex-row gap-4"
						options={$rememberMelodyOption}
						bind:userSelected={rememberMelody}
						name="rememberMelody"
					/>
				</div>
			</div>
			<div>
				<div class="label">{$t('show_favorites_only')}</div>
				<div class="flex flex-row gap-4">
					<RadioButtons
						className="flex flex-row gap-4"
						options={$onlyFavoriteOption}
						bind:userSelected={onlyFavorite}
						name="onlyFavorite"
					/>
				</div>
			</div>
			<div>
				<div class="label">{$t('tune_type')}</div>
				<select class="input" bind:value={selectedRhythm} name="selectedRhythm" id="selectedRhythm">
					<option value="notSelected"></option>
					{#each rhythms as rhythm}
						<option value={rhythm}>{rhythm}</option>
					{/each}
				</select>
			</div>
			<div>
				<div class="label">{$t('sort')}</div>
				<select id="sortByNameSelect" class="input" bind:value={sortBy}>
					{#each $sortByOption as opt}
						<option value={opt.value} id={opt.id}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</form>
	</div>
{/if}
{#if !isLoggedIn}
	<div
		class="bg-gradient-to-r from-cyan-100 to-teal-100 border border-gray-200 rounded-2xl shadow-lg p-8 mb-10 mt-10 md:w-7/12 w-11/12 mx-auto"
	>
		<div class="flex items-center justify-center mb-4">
			<Fa icon={faFilter} class="w-7 h-7 text-emerald-400 mr-2" />
			<div class="text-3xl font-extrabold text-gray-800">{$t('search_filter')}</div>
		</div>
		<div
			class="h-1 w-24 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full mx-auto mb-8"
		></div>
		<form class="space-y-6">
			<div>
				<div class="label">{$t('tune_type')}</div>
				<select class="input" bind:value={selectedRhythm} name="selectedRhythm">
					<option value="notSelected"></option>
					{#each rhythms as rhythm}
						<option value={rhythm}>{rhythm}</option>
					{/each}
				</select>
			</div>
			<div>
				<div class="label">{$t('sort')}</div>
				<select id="sortByNameSelect" class="input" bind:value={sortBy}>
					{#each $sortByOption as opt}
						<option value={opt.value} id={opt.id}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</form>
	</div>
{/if}

<style>
	.label {
		font-size: 1.25rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.75rem;
	}

	.input {
		border: 1px solid #cbd5e0;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		width: 100%;
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.input:focus {
		border-color: #38b2ac;
		box-shadow: 0 0 0 3px rgba(56, 178, 172, 0.3);
	}
</style>
