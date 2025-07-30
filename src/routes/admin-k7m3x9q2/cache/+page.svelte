<script lang="ts">
	import { updateTuneListViewCache } from '$core/data/repositories/tuneRepository';
	import type { TuneListViewCache } from '$core/data/models/Cache';
	import { getDoc, doc } from 'firebase/firestore';
	import { db } from '$core/data/firebase/firebaseClient';
	import { CACHE_CONFIG } from '$core/data/models/Cache';

	let isUpdating = $state(false);
	let updateMessage = $state<string>('');
	let updateError = $state<string>('');
	let cacheInfo = $state<TuneListViewCache | null>(null);
	let isLoadingInfo = $state(false);

	// ページ読み込み時にキャッシュ情報を取得
	async function loadCacheInfo() {
		isLoadingInfo = true;
		try {
			const cacheDocRef = doc(db, CACHE_CONFIG.COLLECTION_NAME, CACHE_CONFIG.TUNE_LIST_VIEW_DOC_ID);
			const cacheDoc = await getDoc(cacheDocRef);

			if (cacheDoc.exists()) {
				cacheInfo = cacheDoc.data() as TuneListViewCache;
			} else {
				cacheInfo = null;
			}
		} catch (error) {
			console.error('キャッシュ情報取得エラー:', error);
			cacheInfo = null;
		} finally {
			isLoadingInfo = false;
		}
	}

	// キャッシュ更新処理
	async function handleUpdateCache() {
		if (isUpdating) return;

		isUpdating = true;
		updateMessage = '';
		updateError = '';

		try {
			const result = await updateTuneListViewCache();
			updateMessage = `キャッシュを正常に更新しました。楽曲数: ${result.totalCount}件`;
			cacheInfo = result;
		} catch (error) {
			console.error('キャッシュ更新エラー:', error);
			updateError = error instanceof Error ? error.message : 'キャッシュの更新に失敗しました';
		} finally {
			isUpdating = false;
		}
	}

	// 初期化
	loadCacheInfo();
</script>

<h1 class="text-2xl font-bold mb-6">キャッシュ管理</h1>

<div class="space-y-6">
	<!-- キャッシュ情報表示 -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-xl font-semibold mb-4">現在のキャッシュ状況</h2>

		{#if isLoadingInfo}
			<p class="text-gray-600">読み込み中...</p>
		{:else if cacheInfo}
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label class="block text-sm font-medium text-gray-700">楽曲数</label>
					<p class="text-lg font-semibold">{cacheInfo.totalCount}件</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700">最終更新日時</label>
					<p class="text-lg">
						{#if cacheInfo.lastUpdated}
							{new Date(cacheInfo.lastUpdated.seconds * 1000).toLocaleString('ja-JP')}
						{:else}
							不明
						{/if}
					</p>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700">バージョン</label>
					<p class="text-lg">{cacheInfo.version}</p>
				</div>
			</div>
		{:else}
			<p class="text-orange-600">
				キャッシュドキュメントが存在しません。キャッシュを作成してください。
			</p>
		{/if}
	</div>

	<!-- キャッシュ更新ボタン -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-xl font-semibold mb-4">キャッシュ更新</h2>
		<p class="text-gray-600 mb-4">
			tunesコレクションの最新データでキャッシュを更新します。この操作により、トップページの読み取り回数を600回→1回に削減できます。
		</p>

		<button
			onclick={handleUpdateCache}
			disabled={isUpdating}
			class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
		>
			{isUpdating ? '更新中...' : 'キャッシュを更新'}
		</button>

		{#if updateMessage}
			<div class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
				{updateMessage}
			</div>
		{/if}

		{#if updateError}
			<div class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
				{updateError}
			</div>
		{/if}
	</div>

	<!-- 説明 -->
	<div class="bg-blue-50 p-6 rounded-lg">
		<h3 class="text-lg font-semibold mb-2">キャッシュ機能について</h3>
		<ul class="list-disc list-inside space-y-2 text-gray-700">
			<li>トップページで600件の楽曲データを1回の読み取りで取得できます</li>
			<li>ボットアクセス時の読み取り量を大幅に削減します</li>
			<li>楽曲データに変更があった場合は手動でキャッシュを更新してください</li>
			<li>
				キャッシュは <code class="bg-gray-200 px-1 rounded">cache/tune-list-view</code> ドキュメントに保存されます
			</li>
		</ul>
	</div>
</div>
