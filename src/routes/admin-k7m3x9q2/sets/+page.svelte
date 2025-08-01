<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { SetRepository } from '$core/data/repositories/setRepository';
	import { TuneSetRepository } from '$core/data/repositories/tuneSetRepository';
	import { TuneRepository } from '$core/data/repositories/tuneRepository';
	import type { SetFull } from '$core/data/models/Set';
	import type { TuneFull } from '$core/data/models/Tune';
	import { toast } from 'svelte-sonner';
	import Fa from 'svelte-fa';
	import { faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

	let sets = $state<SetFull[]>([]);
	let allTunes = $state<TuneFull[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			// セットと曲データを並行して取得
			const [setsData, tunesData] = await Promise.all([
				SetRepository.getSets(),
				TuneRepository.getTunes()
			]);

			sets = setsData.sort((a, b) => Number(b.setNo) - Number(a.setNo));
			allTunes = tunesData;
		} catch (error) {
			console.error($t('data_fetch_error'), error);
			toast.error($t('data_fetch_failed'));
		} finally {
			loading = false;
		}
	});

	const deleteSet = async (setId: string) => {
		if (!confirm($t('confirm_delete_set'))) {
			return;
		}

		try {
			// セットに関連する曲の関係性を全て削除
			await TuneSetRepository.removeAllTunesFromSet(setId);

			// セット自体を削除
			await SetRepository.deleteSet(setId);

			// ローカルの配列からも削除
			sets = sets.filter((set) => set.id !== setId);

			toast.success($t('set_deleted'));
		} catch (error) {
			console.error($t('set_deletion_error'), error);
			toast.error($t('set_deletion_failed'));
		}
	};

	const getTunesWithLinks = (tuneIds: string[]) => {
		return tuneIds.map((tuneId) => {
			const tune = allTunes.find((t) => t.id === tuneId);
			return tune ? { id: tuneId, name: tune.name } : { id: tuneId, name: `未知の曲(${tuneId})` };
		});
	};
</script>

<svelte:head>
	<title>セット管理 - Practicing Irish tunes with hatao's YouTube</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
	<h1 class="text-3xl font-bold text-teal-800">セット管理</h1>
	<a
		href="/admin-k7m3x9q2/sets/add"
		class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
	>
		<Fa icon={faPlus} />
		<span>新しいセット追加</span>
	</a>
</div>

{#if loading}
	<div class="text-center py-8">
		<div class="text-gray-600">読み込み中...</div>
	</div>
{:else if sets.length === 0}
	<div class="bg-white rounded-lg shadow-md p-8 text-center">
		<p class="text-gray-600 mb-4">セットがまだ作成されていません</p>
		<a
			href="/admin-k7m3x9q2/sets/add"
			class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2"
		>
			<Fa icon={faPlus} />
			<span>最初のセットを作成</span>
		</a>
	</div>
{:else}
	<div class="grid gap-6">
		{#each sets as set}
			<div class="bg-white rounded-lg shadow-md p-6">
				<div class="flex justify-between items-start mb-4">
					<div class="flex-1">
						<h3 class="text-xl font-semibold text-teal-800 mb-2">
							{set.name}
						</h3>
						{#if set.description}
							<p class="text-gray-600 mb-2">{set.description}</p>
						{/if}
						<div class="flex items-center space-x-4 text-sm text-gray-500">
							<span>{set.tuneCount}曲</span>
							{#if set.setNo}
								<span>セット番号: {set.setNo}</span>
							{/if}
							{#if set.createdAt}
								<span>作成: {new Date(set.createdAt).toLocaleDateString('ja-JP')}</span>
							{/if}
						</div>
					</div>

					<div class="flex space-x-2">
						{#if set.videoLink}
							<a
								href={set.videoLink}
								target="_blank"
								rel="noopener noreferrer"
								class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
								title={$t('watch_video')}
							>
								<Fa icon={faEye} size="sm" />
								<span>動画</span>
							</a>
						{/if}
						<a
							href="/admin-k7m3x9q2/sets/edit/{set.id}"
							class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
							title={$t('edit')}
						>
							<Fa icon={faEdit} size="sm" />
							<span>編集</span>
						</a>
						<button
							onclick={() => deleteSet(set.id)}
							class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
							title={$t('delete')}
						>
							<Fa icon={faTrash} size="sm" />
							<span>削除</span>
						</button>
					</div>
				</div>

				{#if set.tuneIds.length > 0}
					<div class="border-t pt-4">
						<h4 class="text-sm font-medium text-gray-700 mb-2">含まれる曲:</h4>
						<div class="text-sm text-gray-600 leading-relaxed">
							{#each getTunesWithLinks(set.tuneIds) as tune, index}
								{#if index > 0}<span class="text-gray-400">, </span>{/if}<a
									href="/tune/{tune.id}"
									class="text-teal-600 hover:text-teal-800 hover:underline"
									target="_blank">{tune.name}</a
								>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
