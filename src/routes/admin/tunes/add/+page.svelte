<script lang="ts">
	import { t } from 'svelte-i18n';
	import { db } from '$core/data/firebase/firebaseClient';
	import { addDoc, collection } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';

	let sheetText = $state('');

	const rows = $derived(sheetText.split('\n'));

	const parsedTunes = $derived(
		rows.map((row) => {
			const parsedValue = row.split('\t');
			return {
				setNo: parseInt(parsedValue[0]),
				tuneNo: parseInt(parsedValue[1]),
				name: parsedValue[2],
				link: parsedValue[3],
				genre: parsedValue[4],
				date: parsedValue[5],
				rhythm: parsedValue[6],
				key: parsedValue[7],
				mode: parsedValue[8],
				part: parseInt(parsedValue[9]),
				commonness: parsedValue[10],
				difficulty: parsedValue[11],
				range: parsedValue[12],
				spotify: parsedValue[14],
				instrument: parsedValue[15],
				source: parsedValue[16],
				composer: parsedValue[17],
				region: parsedValue[18],
				alsoKnown: parsedValue[19]
			};
		})
	);

	const saveTunes = async () => {
		if (parsedTunes.length === 0) {
			toast.error($t('no_tunes_to_save'));
			return;
		}

		try {
			const promises = parsedTunes.map((tune) => addDoc(collection(db, 'tunes'), tune));
			await Promise.all(promises);

			if (parsedTunes.length === 1) {
				toast.success(`${parsedTunes[0].name}を保存しました。`);
			} else {
				toast.success(`${parsedTunes.length}曲を保存しました。`);
			}
			sheetText = '';
		} catch (error) {
			toast.error($t('save_error'));
			console.error(error);
		}
	};
</script>

<svelte:head>
	<title>曲追加</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<textarea class="w-full h-32" bind:value={sheetText} placeholder={$t('paste_spreadsheet_content')}
	></textarea>

	{#if parsedTunes.length > 0}
		<div class="mt-4">
			<h3 class="text-lg font-bold mb-2">追加予定の曲（{parsedTunes.length}曲）:</h3>
			<div class="overflow-x-auto max-h-96 overflow-y-auto border rounded">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50 sticky top-0">
						<tr>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>#</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Set</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>No</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Name</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Genre</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Rhythm</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Key</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Difficulty</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Date</th
							>
							<th
								class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>Link</th
							>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each parsedTunes as tune, index}
							<tr class="hover:bg-gray-50">
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-900"
									>{tune.setNo || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-900"
									>{tune.tuneNo || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900"
									>{tune.name || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
									>{tune.genre || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
									>{tune.rhythm || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{tune.key || '-'}</td>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500"
									>{tune.difficulty || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500">{tune.date || '-'}</td
								>
								<td class="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
									{#if tune.link}
										<a
											href={tune.link}
											target="_blank"
											rel="noopener noreferrer"
											class="text-blue-600 hover:text-blue-900"
										>
											Link
										</a>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}

	<button
		class="p-2 rounded bg-green-900 text-white mt-4"
		onclick={saveTunes}
		disabled={parsedTunes.length === 0}
	>
		{#if parsedTunes.length === 0}
			保存する曲がありません
		{:else if parsedTunes.length === 1}
			1曲を保存
		{:else}
			{parsedTunes.length}曲を保存
		{/if}
	</button>
</div>
