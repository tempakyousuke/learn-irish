<script lang="ts">
	import type { Tune } from '../../types/tune';
	export let tunes: Tune[];
</script>

<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto">
	<thead>
		<tr class="border bg-teal-800 text-white">
			<th class="py-3 px-3 w-96">曲名</th>
			<th class="py-3 px-3 w-52">種類</th>
			<!-- <th class="py-3 px-3 w-52">回数</th> -->
		</tr>
	</thead>
	<tbody>
		{#each tunes as tune}
			<tr class="hover:bg-teal-200">
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
			</tr>
		{/each}
	</tbody>
</table>
