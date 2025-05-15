<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '$core/data/models/Tune';

	export let dailyData: { [key: string]: number } = {};
	export let tuneObjects: { [key: string]: Tune } = {};
</script>

<div class="mt-7 mx-auto w-full max-w-screen-lg px-2">
	<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl w-full">
		<thead>
			<tr class="border bg-teal-800 text-white">
				<th class="py-3 px-3 text-left w-2/5">{$t('tunes_played_today')}</th>
				<th class="py-3 px-3 text-center w-1/4 hidden md:table-cell">{$t('tune_type')}</th>
				<th class="py-3 px-3 text-center w-1/4">{$t('todays_plays')}</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(dailyData) as [tuneId, count], i}
				<tr
					class="border-b border-teal-400 odd:bg-white even:bg-teal-50 hover:bg-emerald-50 transition-colors"
				>
					<td class="py-3 px-3 text-left max-w-xs truncate" title={tuneObjects[tuneId]?.name}
						>{tuneObjects[tuneId]?.name}</td
					>
					<td class="py-3 px-3 text-center hidden md:table-cell">{tuneObjects[tuneId]?.rhythm}</td>
					<td class="py-3 px-3 text-center">{count}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	@media (max-width: 600px) {
		td,
		th {
			font-size: 1rem;
		}
	}
</style>
