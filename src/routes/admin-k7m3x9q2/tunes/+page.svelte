<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { TuneRepository } from '$core/data/repositories/tuneRepository';
	import type { TuneFull } from '$core/data/models/Tune';
	import { toast } from 'svelte-sonner';
	import Fa from 'svelte-fa';
	import { faPlus, faEdit, faTrash, faEye, faMusic } from '@fortawesome/free-solid-svg-icons';
	import { deleteTune as deleteTuneApi } from '$core/data/repositories/tuneRepository';

	let tunes = $state<TuneFull[]>([]);
	let loading = $state(true);
	let searchTerm = $state('');

	onMount(async () => {
		try {
			tunes = await TuneRepository.getTunes(true);
		} catch (error) {
			console.error($t('tune_data_fetch_error'), error);
			toast.error($t('tune_data_fetch_failed'));
		} finally {
			loading = false;
		}
	});

	function toSessionHref(input: string | undefined): string {
		const raw = (input || '').trim();
		if (!raw) return '';
		if (/^https?:\/\//.test(raw)) return raw;
		if (raw.startsWith('/')) return `https://thesession.org${raw}`;
		if (raw.startsWith('thesession.org')) return `https://${raw}`;
		return raw;
	}

	const filteredTunes = $derived.by(() => {
		if (!searchTerm.trim()) return tunes;
		const searchLower = searchTerm.toLowerCase();
		return tunes.filter(
			(tune) =>
				tune.name.toLowerCase().includes(searchLower) ||
				tune.alsoKnown?.toLowerCase().includes(searchLower) ||
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
			await deleteTuneApi(tuneId);

			// ローカル一覧からも即時反映
			tunes = tunes.filter((t) => t.id !== tuneId);
			toast.success('楽曲を削除しました');
		} catch (error) {
			console.error($t('tune_deletion_error'), error);
			toast.error($t('tune_deletion_failed'));
		}
	};
</script>

<svelte:head>
	<title>楽曲管理 - Practicing Irish tunes with hatao's YouTube</title>
</svelte:head>

<div class="max-w-7xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-teal-800">楽曲管理</h1>
		<div class="flex items-center space-x-2">
			<a
				href="/admin-k7m3x9q2/tunes/add-manual"
				class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
			>
				<Fa icon={faPlus} />
				<span>新しい楽曲追加</span>
			</a>
			<a
				href="/admin-k7m3x9q2/tunes/add"
				class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
			>
				<Fa icon={faPlus} />
				<span>スプレッドシートから追加</span>
			</a>
		</div>
	</div>

	<!-- 検索フィルター -->
	<div class="mb-6">
		<div class="max-w-md">
			<input
				type="text"
				placeholder={$t('search_placeholder')}
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
					href="/admin-k7m3x9q2/tunes/add"
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
								<td class="px-6 py-4 whitespace-nowrap max-w-48 overflow-hidden text-ellipsis">
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
									{#if tune.link || tune.theSession}
										<div class="flex flex-col items-start space-y-1">
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
											{/if}
											{#if (tune.theSession || '').trim()}
												<a
													href={toSessionHref(tune.theSession)}
													target="_blank"
													rel="noopener noreferrer"
													class="text-teal-600 hover:text-teal-800 flex items-center space-x-1"
												>
													<Fa icon={faEye} size="sm" />
													<span>The Session</span>
												</a>
											{/if}
										</div>
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
											title={$t('view_details')}
										>
											<Fa icon={faEye} size="sm" />
											<span>詳細</span>
										</a>
										<a
											href="/admin-k7m3x9q2/tunes/update/{tune.id}"
											class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
											title={$t('edit')}
										>
											<Fa icon={faEdit} size="sm" />
											<span>編集</span>
										</a>
										<button
											onclick={() => deleteTune(tune.id, tune.name)}
											class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm flex items-center space-x-1"
											title={$t('delete')}
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
