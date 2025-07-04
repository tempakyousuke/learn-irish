<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '$core/data/models/Tune';
	import type { UserTune } from '$core/data/models/UserTune';
	export let tunes: Tune[] = [];
	export let userTuneStatus: { [key: string]: UserTune } = {};
	export let dailyData: { [key: string]: number } = {};
	$: countExist = Object.keys(userTuneStatus).length > 0;
</script>

{#snippet desktopTuneRow(tune: Tune)}
	<tr class="border-b border-teal-400 hover:bg-teal-200 md:table-row hidden">
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
		{/if}
	</tr>
{/snippet}

{#snippet mobileTuneRow(tune: Tune)}
	<tr class="border-b border-teal-400 hover:bg-teal-200 table-row md:hidden">
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

<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto xl:w-auto w-11/12">
	<thead>
		<tr class="border bg-teal-800 text-white md:table-row hidden">
			<th class="py-3 px-3 w-96">{$t('tune_name')}</th>
			<th class="py-3 px-3 w-52">{$t('tune_type')}</th>
			<th class="py-3 px-3 w-52">Key</th>
			<th class="py-3 px-3 w-52">Mode</th>
			{#if countExist}
				<th class="py-3 px-3 w-52">{$t('total_plays')}</th>
				<th class="py-3 px-3 w-52">{$t('todays_plays')}</th>
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
