<script lang="ts">
	import { t } from 'svelte-i18n';
	import { db } from '$core/data/firebase/firebaseClient';
	import { addDoc, collection } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import type { Tune } from '$core/data/models';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let sheetText = $state('');
	let editableTunes: Omit<Tune, 'id'>[] = $state([]);

	$effect(() => {
		if (!sheetText) {
			editableTunes = [];
			return;
		}
		const rows = sheetText.split('\n').filter((row) => row.trim() !== '');
		editableTunes = rows.map((row) => {
			const parsedValue = row.split('\t');
			return {
				setNo: parsedValue[0] || '',
				tuneNo: parseInt(parsedValue[1]) || 0,
				name: parsedValue[2] || '',
				link: parsedValue[3] || '',
				genre: parsedValue[4] || '',
				date: parsedValue[5] || '',
				rhythm: parsedValue[6] || '',
				key: parsedValue[7] || '',
				mode: parsedValue[8] || '',
				part: parsedValue[9] || '',
				commonness: parsedValue[10] || '',
				difficulty: parsedValue[11] || '',
				range: parsedValue[12] || '',
				spotify: parsedValue[14] || '',
				instrument: parsedValue[15] || '',
				source: parsedValue[16] || '',
				composer: parsedValue[17] || '',
				region: parsedValue[18] || '',
				alsoKnown: parsedValue[19] || ''
			};
		});
	});

	const saveTunes = async () => {
		if (editableTunes.length === 0) {
			toast.error($t('no_tunes_to_save'));
			return;
		}

		try {
			const promises = editableTunes.map((tune) => addDoc(collection(db, 'tunes'), tune));
			await Promise.all(promises);

			if (editableTunes.length === 1) {
				toast.success(`${editableTunes[0].name}を保存しました。`);
			} else {
				toast.success(`${editableTunes.length}曲を保存しました。`);
			}
			sheetText = '';
			editableTunes = [];
		} catch (error) {
			toast.error($t('save_error'));
			console.error(error);
		}
	};

	const saveTune = async (tuneToSave: Omit<Tune, 'id'>) => {
		try {
			await addDoc(collection(db, 'tunes'), tuneToSave);
			toast.success(`${tuneToSave.name}を保存しました。`);

			// Remove the saved tune from the list
			editableTunes = editableTunes.filter((t) => t !== tuneToSave);

			// If all tunes are saved, clear the sheet text
			if (editableTunes.length === 0) {
				sheetText = '';
			}
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

	{#if editableTunes.length > 0}
		<div class="mt-8 space-y-8">
			<h3 class="text-2xl font-bold mb-4">追加予定の曲（{editableTunes.length}曲）:</h3>
			{#each editableTunes as tune, index}
				<div class="border p-6 rounded-xl shadow-md space-y-6">
					<h3 class="text-xl font-bold">
						{tune.name || `Tune ${index + 1}`}
					</h3>

					<div>
						<h4 class="text-lg font-semibold mb-3">基本情報</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input bind:value={tune.tuneNo} label={$t('tune_number')} type="number" />
							<Input bind:value={tune.name} label={$t('tune_name_label')} />
						</div>
					</div>

					<div>
						<h4 class="text-lg font-semibold mb-3">音楽的特性</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input bind:value={tune.rhythm} label={$t('rhythm')} />
							<Input bind:value={tune.key} label={$t('key_label')} />
							<Input bind:value={tune.mode} label={$t('mode_label')} />
							<Input bind:value={tune.part} label={$t('part_count')} />
						</div>
					</div>

					<div>
						<h4 class="text-lg font-semibold mb-3">メタ情報</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input bind:value={tune.setNo} label={$t('set_number')} />
							<Input bind:value={tune.genre} label={$t('genre')} />
							<Input bind:value={tune.date} label={$t('date')} />
							<Input bind:value={tune.instrument} label={$t('instrument')} />
							<Input bind:value={tune.composer} label={$t('composer')} />
							<Input bind:value={tune.region} label={$t('region')} />
							<textarea
								class="w-full h-24 border border-gray-300 rounded p-2"
								bind:value={tune.alsoKnown}
								placeholder={$t('also_known')}
							></textarea>
						</div>
					</div>

					<div>
						<h4 class="text-lg font-semibold mb-3">外部リンク</h4>
						<div class="grid grid-cols-1 gap-4">
							<Input bind:value={tune.link} label={$t('youtube_link')} />
							<Input bind:value={tune.spotify} label={$t('spotify_link')} />
							<Input bind:value={tune.source} label={$t('source')} />
						</div>
					</div>
					<div class="flex justify-end">
						<Button onclick={() => saveTune(tune)}>この曲を保存</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<Button className="mt-6" onclick={saveTunes} disabled={editableTunes.length === 0}>
		{#if editableTunes.length === 0}
			保存する曲がありません
		{:else if editableTunes.length === 1}
			1曲を保存
		{:else}
			{editableTunes.length}曲を保存
		{/if}
	</Button>
</div>
