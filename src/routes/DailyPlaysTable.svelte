<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '../types/tune';

	export let dailyData: { [key: string]: number } = {};
	export let tuneObjects: { [key: string]: Tune } = {};
</script>

<div class="mt-7 mx-auto md:w-8/12 w-11/12">
	<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto">
		<thead>
			<tr class="border bg-teal-800 text-white md:table-row hidden">
				<th class="py-3 px-3 w-96">{$t('tunes_played_today')}</th>
				<th class="py-3 px-3 w-52">{$t('tune_type')}</th>
				<th class="py-3 px-3 w-52">{$t('todays_plays')}</th>
			</tr>
			<tr class="border bg-teal-800 text-white table-row md:hidden">
				<th class="py-3 px-3 w-96">{$t('tunes_played_today')}</th>
				<th class="py-3 px-3 w-60 whitespace-pre-wrap">{$t('todays_plays_with_break')}</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(dailyData) as [tuneId, count]}
				<tr class="border-b border-teal-400 md:table-row hidden">
					<td class="py-3 px-3">{tuneObjects[tuneId]?.name}</td>
					<td class="py-3 px-3 text-center">{tuneObjects[tuneId]?.rhythm}</td>
					<td class="py-3 px-3 text-center">{count}</td>
				</tr>
				<tr class="border-b border-teal-400 table-row md:hidden">
					<td class="py-3 px-3">{tuneObjects[tuneId]?.name}</td>
					<td class="py-3 px-3 text-center">{count}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
