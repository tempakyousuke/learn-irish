<script lang="ts">
	import { getYoutubeId } from '$core/utils/youtubeUtils';
	import type { SetFull } from '$data/models/Set';

	export let set: SetFull;
	export let showTitle = true;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	$: youtubeId = getYoutubeId(set.videoLink);

	// サイズに応じたクラス設定
	$: sizeClasses = {
		small: 'w-full max-w-[280px] h-[158px] md:max-w-[320px] md:h-[180px]',
		medium: 'w-full max-w-[320px] h-[180px] md:max-w-[400px] md:h-[225px]',
		large: 'w-full max-w-[400px] h-[225px] md:max-w-[560px] md:h-[315px]'
	};
</script>

{#if youtubeId}
	<div class="flex flex-col items-center space-y-3">
		{#if showTitle}
			<h3 class="text-lg font-semibold text-teal-800 text-center">
				{set.name}
			</h3>
		{/if}
		
		<div class="relative">
			<iframe
				class="{sizeClasses[size]} rounded-lg border shadow-md"
				src="https://www.youtube.com/embed/{youtubeId}"
				title="Set video: {set.name}"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
			/>
		</div>
		
		{#if set.description}
			<p class="text-sm text-gray-600 text-center max-w-md">
				{set.description}
			</p>
		{/if}
	</div>
{:else if set.videoLink}
	<!-- YouTube IDが取得できない場合の代替表示 -->
	<div class="flex flex-col items-center space-y-3">
		{#if showTitle}
			<h3 class="text-lg font-semibold text-teal-800 text-center">
				{set.name}
			</h3>
		{/if}
		
		<div class="bg-gray-100 rounded-lg p-4 text-center">
			<p class="text-gray-600 mb-2">動画を再生できません</p>
			<a
				href={set.videoLink}
				target="_blank"
				rel="noopener noreferrer"
				class="text-teal-600 hover:text-teal-800 underline"
			>
				YouTubeで開く
			</a>
		</div>
	</div>
{:else}
	<!-- 動画リンクがない場合 -->
	<div class="flex flex-col items-center space-y-3">
		{#if showTitle}
			<h3 class="text-lg font-semibold text-teal-800 text-center">
				{set.name}
			</h3>
		{/if}
		
		<div class="bg-gray-100 rounded-lg p-4 text-center">
			<p class="text-gray-600">動画がありません</p>
		</div>
	</div>
{/if}