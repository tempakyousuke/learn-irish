<script lang="ts">
	import type { SetFull } from '$core/data/models/Set';
	import type { TuneFull } from '$core/data/models/Tune';

	export let set: SetFull;
	export let tunes: TuneFull[] = [];
	export let showDescription = true;
	export let showTuneCount = true;
	export let compact = false;
</script>

<div class="bg-white rounded-lg shadow-md p-4 {compact ? 'space-y-2' : 'space-y-3'}">
	<!-- セット名 -->
	<div class="flex items-center justify-between">
		<h4 class="text-lg font-semibold text-teal-800">
			{set.name}
		</h4>
		{#if showTuneCount}
			<span class="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
				{set.tuneCount}曲
			</span>
		{/if}
	</div>

	<!-- 説明文 -->
	{#if showDescription && set.description}
		<p class="text-gray-600 text-sm leading-relaxed">
			{set.description}
		</p>
	{/if}

	<!-- セット内の曲リスト -->
	{#if tunes.length > 0}
		<div class="space-y-2">
			<h5 class="text-sm font-medium text-gray-700">このセットの曲:</h5>
			<div class="space-y-1">
				{#each tunes as tune, index}
					<div class="flex items-center space-x-2 text-sm">
						<span
							class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs min-w-[24px] text-center"
						>
							{index + 1}
						</span>
						<a
							href="/tune/{tune.id}"
							class="text-teal-600 hover:text-teal-800 hover:underline flex-1"
						>
							{tune.name}
						</a>
						{#if tune.rhythm}
							<span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">
								{tune.rhythm}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else if set.tuneIds.length > 0}
		<!-- 曲データが取得できていない場合 -->
		<div class="space-y-2">
			<h5 class="text-sm font-medium text-gray-700">このセットの曲:</h5>
			<p class="text-sm text-gray-500">曲データを読み込み中...</p>
		</div>
	{/if}

	<!-- メタデータ -->
	{#if !compact && (set.createdAt || set.updatedAt)}
		<div class="pt-2 border-t border-gray-100">
			<div class="flex justify-between text-xs text-gray-500">
				{#if set.createdAt}
					<span>作成: {new Date(set.createdAt).toLocaleDateString('ja-JP')}</span>
				{/if}
				{#if set.updatedAt}
					<span>更新: {new Date(set.updatedAt).toLocaleDateString('ja-JP')}</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
