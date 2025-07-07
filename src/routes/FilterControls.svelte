<script lang="ts">
	import {
		rememberNameOption,
		rememberMelodyOption,
		onlyFavoriteOption,
		sortByOption,
		sortByOptionLoggedOut
	} from './__options';
	import { t } from 'svelte-i18n';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import {
		faFilter,
		faBook,
		faMusic,
		faStar,
		faList,
		faSort
	} from '@fortawesome/free-solid-svg-icons';
	import { Fa } from 'svelte-fa';

	export let isLoggedIn: boolean;
	export let rememberName: string;
	export let rememberMelody: string;
	export let onlyFavorite: string;
	export let selectedRhythm: string;
	export let sortBy: string;
	export let rhythms: string[] = [];
</script>

<div
	class="bg-gradient-to-r from-cyan-100 to-teal-100 border border-gray-200 rounded-2xl shadow-lg p-8 mb-10 mt-10 w-11/12 md:w-10/12 xl:w-8/12 mx-auto"
>
	<div class="flex items-center justify-center mb-4">
		<Fa icon={faFilter} class="w-7 h-7 text-emerald-400 mr-2" />
		<div class="text-3xl font-extrabold text-gray-800">{$t('search_filter')}</div>
	</div>
	<div
		class="h-1 w-24 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full mx-auto mb-8"
	></div>
	<form class="filter-form">
		{#if isLoggedIn}
			<div class="filter-block">
				<div class="label flex items-center">
					<Fa icon={faBook} class="w-5 h-5 text-emerald-500 mr-2" />{$t('memorized_name')}
				</div>
				<RadioButtons
					className="radio-row"
					options={$rememberNameOption}
					bind:userSelected={rememberName}
					name="rememberName"
				/>
			</div>
			<div class="filter-block">
				<div class="label flex items-center">
					<Fa icon={faMusic} class="w-5 h-5 text-emerald-500 mr-2" />{$t('memorized_melody')}
				</div>
				<RadioButtons
					className="radio-row"
					options={$rememberMelodyOption}
					bind:userSelected={rememberMelody}
					name="rememberMelody"
				/>
			</div>
			<div class="filter-block">
				<div class="label flex items-center">
					<Fa icon={faStar} class="w-5 h-5 text-emerald-500 mr-2" />{$t('show_favorites_only')}
				</div>
				<RadioButtons
					className="radio-row"
					options={$onlyFavoriteOption}
					bind:userSelected={onlyFavorite}
					name="onlyFavorite"
				/>
			</div>
		{/if}
		<div class="filter-block">
			<div class="label flex items-center">
				<Fa icon={faList} class="w-5 h-5 text-emerald-500 mr-2" />{$t('tune_type')}
			</div>
			<select class="input" bind:value={selectedRhythm} name="selectedRhythm" id="selectedRhythm">
				<option value="notSelected"></option>
				{#each rhythms as rhythm}
					<option value={rhythm}>{rhythm}</option>
				{/each}
			</select>
		</div>
		<div class="filter-block">
			<div class="label flex items-center">
				<Fa icon={faSort} class="w-5 h-5 text-emerald-500 mr-2" />{$t('sort')}
			</div>
			<select id="sortByNameSelect" class="input" bind:value={sortBy}>
				{#each (isLoggedIn ? $sortByOption : $sortByOptionLoggedOut) as opt}
					<option value={opt.value} id={opt.id}>{opt.label}</option>
				{/each}
			</select>
		</div>
	</form>
</div>

<style>
	.label {
		font-size: 1.15rem;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.5rem;
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
	.filter-block {
		background: rgba(255, 255, 255, 0.7);
		border-radius: 0.75rem;
		padding: 1rem 1.2rem;
		margin-bottom: 1.2rem;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 200px;
	}
	.filter-form {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	@media (min-width: 1100px) {
		.filter-form {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: repeat(2, auto);
			max-width: 1050px;
			margin: 0 auto;
			gap: 1.5rem 2rem;
		}
		.filter-block {
			margin-bottom: 0;
		}
	}
	@media (min-width: 700px) and (max-width: 1099px) {
		.filter-form {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, auto);
			max-width: 700px;
			margin: 0 auto;
			gap: 1.5rem 2rem;
		}
		.filter-block {
			margin-bottom: 0;
		}
	}
</style>
