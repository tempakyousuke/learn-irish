<script lang="ts">
	import { onMount } from 'svelte';
	import { TuneRepository } from '$core/data/repositories/tuneRepository';
	import type { TuneFull } from '$core/data/models/Tune';
	import { toast } from 'svelte-sonner';
	import Fa from 'svelte-fa';
	import { faPlus, faEdit, faTrash, faEye, faMusic } from '@fortawesome/free-solid-svg-icons';

	let tunes = $state<TuneFull[]>([]);
	let loading = $state(true);
	let searchTerm = $state('');

	onMount(async () => {
		try {
			tunes = await TuneRepository.getTunes();
		} catch (error) {
			console.error('楽曲データ取得エラー:', error);
			toast.error('楽曲データの取得に失敗しました');
		} finally {
			loading = false;
		}
	});

	const filteredTunes = $derived.by(() => {
		if (!searchTerm.trim()) return tunes;
		const searchLower = searchTerm.toLowerCase();
		return tunes.filter(
			(tune) =>
				tune.name.toLowerCase().includes(searchLower) ||
				tune.tuneNo.toString().includes(searchTerm) ||
				tune.rhythm?.toLowerCase().includes(searchLower) ||
				tune.key?.toLowerCase().includes(searchLower)
		);
	});

	const deleteTune = async (tuneId: string, tuneName: string) => {
		if (!confirm(`楽曲「${tuneName}」を削除しますか？この操作は取り消せません。`)) {
			return;
		}

		try {
			// TODO: 楽曲削除のAPI実装が必要
			toast.info('楽曲削除機能は実装中です');
		} catch (error) {
			console.error('楽曲削除エラー:', error);
			toast.error('楽曲の削除に失敗しました');
		}
	};
</script>

<svelte:head>
	<title>楽曲管理 - Learn Irish</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-teal-800">楽曲管理</h1>
		<a
			href="/admin/tunes/add"
			class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
		>
			<Fa icon={faPlus} />
			<span>新しい楽曲追加</span>
		</a>
	</div>

	<!-- 検索フィルター -->
	<div class="mb-6">
		<div class="max-w-md">
			<input
				type="text"
				placeholder="楽曲名、番号、リズム、調で検索..."
				bind:value={searchTerm}
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
			/>
		</div>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="text-gray-600">読み込み中...</div>
		</div>
	{:else if filteredTunes.length === 0}
		<div class="bg-white rounded-lg shadow-md p-8 text-center">
			{#if searchTerm}
				<p class="text-gray-600 mb-4">検索条件に一致する楽曲がありません</p>
				<button
					onclick={() => (searchTerm = '')}
					class="text-teal-600 hover:text-teal-800 underline"
				>
					検索をクリア
				</button>
			{:else}
				<p class="text-gray-600 mb-4">楽曲がまだ登録されていません</p>
				<a
					href="/admin/tunes/add"
					class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2"
				>
					<Fa icon={faPlus} />
					<span>最初の楽曲を追加</span>
				</a>
			{/if}
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								No.
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								楽曲名
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								リズム
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								調
							</th>
							<th
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								リンク
							</th>
							<th
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								操作
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each filteredTunes as tune}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{tune.tuneNo}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="flex items-center">
										<Fa icon={faMusic} class="text-teal-600 mr-2" size="sm" />
										<div>
											<div class="text-sm font-medium text-gray-900">{tune.name}</div>
											{#if tune.alsoKnown}
												<div class="text-sm text-gray-500">別名: {tune.alsoKnown}</div>
											{/if}
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{tune.rhythm || '-'}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if tune.key}
										{tune.key}{tune.mode ? ` ${tune.mode}` : ''}
									{:else}
										-
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{#if tune.link}
										<a
											href={tune.link}
											target="_blank"
											rel="noopener noreferrer"
											class="text-teal-600 hover:text-teal-800 flex items-center space-x-1"
										>
											<Fa icon={faEye} size="sm" />
											<span>動画</span>
										</a>
									{:else}
										-
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div class="flex justify-end space-x-2">
										<a
											href="/tune/{tune.id}"
											target="_blank"
											class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
											title="詳細を見る"
										>
											<Fa icon={faEye} size="sm" />
											<span>詳細</span>
										</a>
										<a
											href="/admin/tunes/update/{tune.id}"
											class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
											title="編集"
										>
											<Fa icon={faEdit} size="sm" />
											<span>編集</span>
										</a>
										<button
											onclick={() => deleteTune(tune.id, tune.name)}
											class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
											title="削除"
										>
											<Fa icon={faTrash} size="sm" />
											<span>削除</span>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="mt-4 text-sm text-gray-600">
			{filteredTunes.length}件の楽曲
			{#if searchTerm}
				（全{tunes.length}件中）
			{/if}
		</div>
	{/if}
</div>
