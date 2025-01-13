<script lang="ts">
	import type { Tune } from '../../types/tune';
	import type { UserTune } from '../../types/userTune';
	export let tunes: Tune[];
	export let userTuneStatus: { [key: string]: UserTune };
</script>

<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto xl:w-auto w-11/12">
	<thead>
		<tr class="border bg-teal-800 text-white md:table-row hidden">
			<th class="py-3 px-3 w-96">曲名</th>
			<th class="py-3 px-3 w-52">種類</th>
			<th class="py-3 px-3 w-52">Key</th>
			<th class="py-3 px-3 w-52">Mode</th>
			<th class="py-3 px-3 w-52">累計演奏回数</th>
		</tr>
		<tr class="border bg-teal-800 text-white table-row md:hidden">
			<th class="py-3 px-3 w-96">曲名</th>
			<th class="py-3 px-3 w-52">種類</th>
			<th class="py-3 px-3 w-52">Key</th>
			<th class="py-3 px-3 w-52">Mode</th>
			<th class="py-3 px-3 w-52">累計演奏回数</th>
		</tr>
	</thead>
	<tbody>
		{#each tunes as tune}
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
				<td class="py-3 px-3 text-center">
					<a class="block" href="/tune/{tune.id}">
						{userTuneStatus[tune.id]?.playCount || ''}
					</a>
				</td>
			</tr>
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
				<td class="py-3 px-3 text-center">
					<a class="block" href="/tune/{tune.id}">
						{userTuneStatus[tune.id]?.playCount || ''}
					</a>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
