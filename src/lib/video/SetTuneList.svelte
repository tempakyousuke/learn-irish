<script lang="ts">
	import type { TuneFull } from '$data/models/Tune';
	import type { SetFull } from '$data/models/Set';

	export let tunes: TuneFull[] = [];
	export let currentTuneId: string | null = null;
	export let showRhythm = true;
	export let showKey = true;
	export let compact = false;

	$: sortedTunes = tunes.sort((a, b) => a.tuneNo - b.tuneNo);
</script>

<div class="space-y-3">
	{#if sortedTunes.length > 0}
		<div class="bg-white rounded-lg shadow-md p-4">
			<h4 class="text-lg font-semibold text-teal-800 mb-3">
				セット内の曲 ({sortedTunes.length}曲)
			</h4>
			
			<div class="space-y-2">
				{#each sortedTunes as tune, index}
					<div 
						class="flex items-center space-x-3 p-2 rounded-lg transition-colors
						{currentTuneId === tune.id ? 'bg-teal-50 border-l-4 border-teal-500' : 'hover:bg-gray-50'}"
					>
						<!-- 演奏順序 -->
						<div class="flex-shrink-0">
							<span class="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full font-medium min-w-[32px] text-center">
								{index + 1}
							</span>
						</div>

						<!-- 曲情報 -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center space-x-2">
								<a 
									href="/tune/{tune.id}"
									class="text-teal-600 hover:text-teal-800 hover:underline font-medium truncate
									{currentTuneId === tune.id ? 'text-teal-800 font-semibold' : ''}"
								>
									{tune.name}
								</a>
								{#if currentTuneId === tune.id}
									<span class="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
										現在の曲
									</span>
								{/if}
							</div>
							
							{#if !compact}
								<div class="flex items-center space-x-2 mt-1">
									<span class="text-sm text-gray-500">
										No.{tune.tuneNo}
									</span>
									{#if showRhythm && tune.rhythm}
										<span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded">
											{tune.rhythm}
										</span>
									{/if}
									{#if showKey && tune.key}
										<span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
											{tune.key}
										</span>
									{/if}
									{#if tune.mode}
										<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
											{tune.mode}
										</span>
									{/if}
								</div>
							{/if}
						</div>

						<!-- ナビゲーション矢印 -->
						<div class="flex-shrink-0">
							<a 
								href="/tune/{tune.id}"
								class="text-gray-400 hover:text-teal-600 transition-colors"
								title="曲ページへ移動"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-md p-4">
			<h4 class="text-lg font-semibold text-teal-800 mb-3">
				セット内の曲
			</h4>
			<p class="text-gray-500 text-center py-4">
				曲データを読み込み中...
			</p>
		</div>
	{/if}
</div>