<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { TuneListView } from '$core/data/models/Tune';
	import type { UserTuneFull } from '$core/data/models/UserTune';

	let {
		tunes = $bindable([]),
		userTuneStatus = $bindable({}),
		dailyData = $bindable({})
	}: {
		tunes: TuneListView[];
		userTuneStatus: { [key: string]: UserTuneFull };
		dailyData: { [key: string]: number };
	} = $props();

	const countExist = $derived(Object.keys(userTuneStatus).length > 0);
</script>

{#snippet desktopTuneRow(tune: TuneListView)}
	<tr
		class="border-b border-teal-400 md:table-row hidden {dailyData[tune.id]
			? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
			: 'hover:bg-teal-200'}"
	>
		<td class="py-3 px-3">
			<a class="block" href="/tune/{tune.id}">
				{tune.name}
			</a>
		</td>
		<td class="py-3 px-3 text-center">
			<a class="block" href="/tune/{tune.id}">
				{tune.rhythm}
			</a>
		</td>
		<td class="py-3 px-3 text-center">
			<a class="block" href="/tune/{tune.id}">
				{tune.key}
			</a>
		</td>
		<td class="py-3 px-3 text-center">
			<a class="block" href="/tune/{tune.id}">
				{tune.mode}
			</a>
		</td>
		{#if countExist}
			<td class="py-3 px-3 text-center">
				<a class="block" href="/tune/{tune.id}">
					{userTuneStatus[tune.id]?.playCount || ''}
				</a>
			</td>
			<td class="py-3 px-3 text-center">
				<a class="block" href="/tune/{tune.id}">
					{dailyData[tune.id] || ''}
				</a>
			</td>
			<td class="py-3 px-3 text-center">
				<a class="block" href="/tune/{tune.id}">
					{userTuneStatus[tune.id]?.lastPlayedDate || ''}
				</a>
			</td>
		{/if}
	</tr>
{/snippet}

{#snippet mobileTuneRow(tune: TuneListView)}
	<tr
		class="border-b border-teal-400 table-row md:hidden {dailyData[tune.id]
			? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
			: 'hover:bg-teal-200'}"
	>
		<td class="py-3 px-3">
			<a class="block" href="/tune/{tune.id}">
				{tune.name}
			</a>
		</td>
		<td class="py-3 px-3 text-center">
			<a class="block" href="/tune/{tune.id}">
				{tune.rhythm}
			</a>
		</td>
		{#if countExist}
			<td class="py-3 px-3 text-center">
				<a class="block" href="/tune/{tune.id}">
					{userTuneStatus[tune.id]?.playCount || ''}
				</a>
			</td>
			<td class="py-3 px-3 text-center">
				<a class="block" href="/tune/{tune.id}">
					{dailyData[tune.id] || ''}
				</a>
			</td>
		{/if}
	</tr>
{/snippet}

<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto xl:w-auto w-full">
	<thead>
		<tr class="border bg-teal-800 text-white md:table-row hidden">
			<th class="py-3 px-3 w-96">{$t('tune_name')}</th>
			<th class="py-3 px-3 w-52">{$t('tune_type')}</th>
			<th class="py-3 px-3 w-52">Key</th>
			<th class="py-3 px-3 w-52">Mode</th>
			{#if countExist}
				<th class="py-3 px-3 w-52">{$t('total_plays')}</th>
				<th class="py-3 px-3 w-52">{$t('todays_plays')}</th>
				<th class="py-3 px-3 w-52">{$t('last_played')}</th>
			{/if}
		</tr>
		<tr class="border bg-teal-800 text-white table-row md:hidden">
			<th class="py-3 px-3 w-96">{$t('tune_name')}</th>
			<th class="py-3 px-3 w-52">{$t('tune_type')}</th>
			{#if countExist}
				<th class="py-3 px-3 w-52">{$t('total_plays')}</th>
				<th class="py-3 px-3 w-52">{$t('todays_plays')}</th>
			{/if}
		</tr>
	</thead>
	<tbody>
		{#each tunes as tune}
			{@render desktopTuneRow(tune)}
			{@render mobileTuneRow(tune)}
		{/each}
	</tbody>
</table>
