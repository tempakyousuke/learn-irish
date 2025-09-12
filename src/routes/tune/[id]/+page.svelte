<script lang="ts">
	import { t } from 'svelte-i18n';
	import { getYoutubeId } from '$core/utils/youtubeUtils';
	import { userStore } from '$core/store/userStore';
	import { getDate } from '$core/utils/dateUtils';
	import Fa from 'svelte-fa';
	import { faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
	import { toast } from 'svelte-sonner';
	import {
		checkFavorite,
		addFavorite,
		removeFavorite
	} from '$core/data/repositories/favoritesRepository';
	import {
		getUserTuneData,
		updateMemoryStatus,
		incrementUserTunePlayCount,
		updateUserTuneNote
	} from '$core/data/repositories/userTuneRepository';
	import { incrementDailyPlayCount } from '$core/data/repositories/dailyStatsRepository';
	import { siteTitle } from '$core/config/configService';
	import SetVideoPlayer from '$lib/features/video/SetVideoPlayer.svelte';
	import SetTuneList from '$lib/features/video/SetTuneList.svelte';
	import type { SetFull } from '$core/data/models/Set';
	import type { TuneFull } from '$core/data/models/Tune';

	const { data }: { data: { tune: TuneFull; sets: SetFull[]; setTunes: TuneFull[][] } } = $props();
	const tune = $derived(data.tune);
	const sets = $derived(data.sets);
	const setTunes = $derived(data.setTunes);
	const youtubeId = $derived(getYoutubeId(tune.link));
	let rememberName = $state<boolean>(false);
	let rememberMelody = $state<boolean>(false);
	let playCount = $state<number>(0);
	let uid = $state<string>('');
	let note = $state<string>('');
	let isBookmarked = $state<boolean>(false);
	let playHistory = $state<{ [key: string]: number }>({});

	// デバウンス用の一時カウンタとタイマー
	let pendingPlayIncrements = 0;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let isFlushing = false;

	$effect(() => {
		(async () => {
			const user = $userStore;
			uid = user.uid;
			if (!uid) {
				return;
			}

			// Reset state when tune changes
			rememberName = false;
			rememberMelody = false;
			playCount = 0;
			note = '';
			playHistory = {};
			isBookmarked = false;

			// Load user tune data using repository
			const userTuneData = await getUserTuneData(uid, tune.id);
			if (userTuneData) {
				rememberName = userTuneData.rememberName;
				rememberMelody = userTuneData.rememberMelody;
				playCount = userTuneData.playCount;
				note = userTuneData.note;
				playHistory = userTuneData.playHistory;
			}

			// Check if tune is bookmarked
			isBookmarked = await checkFavorite(uid, tune.id);
		})();
	});

	const updateRememberName = async () => {
		if (!uid) {
			return;
		}
		await updateMemoryStatus(uid, tune.id, rememberName, undefined);
	};

	const updateRememberMelody = async () => {
		if (!uid) {
			return;
		}
		await updateMemoryStatus(uid, tune.id, undefined, rememberMelody);
	};

	// バックエンドへまとめて反映（対象を引数で受け取り、UI同期の有無を選択）
	const flushPlayCount = async (
		targetUid: string,
		targetTuneId: string,
		syncUI: boolean = true
	) => {
		if (!targetUid || !targetTuneId || pendingPlayIncrements === 0 || isFlushing) {
			return;
		}
		isFlushing = true;
		const currentDate = getDate();
		const incrementsToSend = pendingPlayIncrements;
		pendingPlayIncrements = 0;
		try {
			const success = await incrementUserTunePlayCount(
				targetUid,
				targetTuneId,
				currentDate,
				incrementsToSend
			);
			if (success) {
				const newDailyCount = await incrementDailyPlayCount(
					targetUid,
					currentDate,
					targetTuneId,
					incrementsToSend
				);
				if (syncUI && newDailyCount > 0) {
					playHistory[currentDate] = newDailyCount;
				}
			} else if (syncUI) {
				// 失敗時は楽観的更新を巻き戻す（UI同期が必要なときのみ）
				playCount = Math.max(0, playCount - incrementsToSend);
				const prev = playHistory[currentDate] || 0;
				playHistory[currentDate] = Math.max(0, prev - incrementsToSend);
			}
		} catch (e) {
			if (syncUI) {
				playCount = Math.max(0, playCount - incrementsToSend);
				const prev = playHistory[currentDate] || 0;
				playHistory[currentDate] = Math.max(0, prev - incrementsToSend);
			}
		} finally {
			isFlushing = false;
		}
	};

	const updatePlayCount = () => {
		if (!uid) {
			return;
		}
		const currentDate = getDate();
		// UIは即時反映（楽観的更新）
		playCount++;
		playHistory[currentDate] = (playHistory[currentDate] || 0) + 1;
		pendingPlayIncrements += 1;
		// デバウンスしてまとめて送信
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			debounceTimer = null;
			void flushPlayCount(uid, tune.id, true);
		}, 1000);
	};

	// rune API: $effect のクリーンアップでフラッシュとクリーンアップを実施
	$effect(() => {
		const currentUid = uid;
		const currentTuneId = tune.id;
		return () => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			void flushPlayCount(currentUid, currentTuneId, false);
		};
	});
	const updateNote = async () => {
		if (!uid) {
			return;
		}
		const success = await updateUserTuneNote(uid, tune.id, note);
		if (success) {
			toast.success($t('note_saved'));
		} else {
			toast.error($t('note_save_failed'));
		}
	};
	const title = $derived(`${tune.name} - ${siteTitle}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={title} />
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-2">
	<!-- 楽曲情報カード -->
	<div class="bg-white rounded-2xl shadow-md p-6 mb-8">
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
			<div>
				<div class="text-2xl font-bold text-emerald-700 mb-2">{tune.name}</div>
				<div class="flex flex-wrap gap-2 mb-2">
					<span
						class="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full"
						>No.{tune.tuneNo}</span
					>
					<span
						class="inline-block bg-cyan-100 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full"
						>{tune.rhythm}</span
					>
					<span
						class="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full"
						>{tune.key} {tune.mode}</span
					>
				</div>
			</div>
			{#if youtubeId}
				<iframe
					class="mx-auto w-full max-w-[320px] h-[180px] md:max-w-[400px] md:h-[225px] rounded-lg border"
					height="225"
					src="https://www.youtube.com/embed/{youtubeId}"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
				></iframe>
			{/if}
		</div>
	</div>

	{#if uid}
		<!-- 操作・統計カード -->
		<div class="bg-white rounded-2xl shadow-md p-6 mb-8 flex flex-col gap-4">
			<div class="flex flex-wrap gap-4 justify-between">
				<!-- 覚えた（名前） -->
				<div class="flex flex-col items-center">
					<div class="text-sm text-gray-600 mb-1">{$t('memorized_name')}</div>
					<button
						class="px-4 py-2 rounded-lg font-bold text-base transition-colors duration-150 {rememberName
							? 'bg-emerald-500 text-white'
							: 'bg-gray-200 text-gray-700'}"
						onclick={() => {
							rememberName = !rememberName;
							updateRememberName();
						}}
					>
						{rememberName ? $t('memorized') + '！' : $t('incomplete')}
					</button>
				</div>
				<!-- 覚えた（メロディ） -->
				<div class="flex flex-col items-center">
					<div class="text-sm text-gray-600 mb-1">{$t('memorized_melody')}</div>
					<button
						class="px-4 py-2 rounded-lg font-bold text-base transition-colors duration-150 {rememberMelody
							? 'bg-emerald-500 text-white'
							: 'bg-gray-200 text-gray-700'}"
						onclick={() => {
							rememberMelody = !rememberMelody;
							updateRememberMelody();
						}}
					>
						{rememberMelody ? $t('memorized') + '！' : $t('incomplete')}
					</button>
				</div>
				<!-- 累計演奏回数 -->
				<div class="flex flex-col items-center">
					<div class="text-sm text-gray-600 mb-1">{$t('times_played')}</div>
					<div class="flex items-center gap-2">
						<span class="text-2xl font-mono font-extrabold text-emerald-700">{playCount}</span>
						<button
							class="py-2 px-3 bg-blue-500 text-white rounded-lg font-bold text-xl hover:bg-blue-600 transition-colors"
							onclick={updatePlayCount}
						>
							<Fa icon={faPlus} />
						</button>
					</div>
				</div>
				<!-- お気に入り -->
				<div class="flex flex-col items-center">
					<div class="text-sm text-gray-600 mb-1">{$t('favorite')}</div>
					<button
						class="px-4 py-2 rounded-lg font-bold text-xl transition-colors duration-150 {isBookmarked
							? 'bg-yellow-400 text-white'
							: 'bg-gray-200 text-gray-700'}"
						onclick={async () => {
							if (isBookmarked) {
								await removeFavorite(uid, tune.id);
								isBookmarked = false;
							} else {
								await addFavorite(uid, tune.id);
								isBookmarked = true;
							}
						}}
					>
						<Fa icon={faStar} />
					</button>
				</div>
			</div>
		</div>

		<!-- メモ欄カード -->
		<div class="bg-white rounded-2xl shadow-md p-6 mb-8">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-lg font-bold text-emerald-700">{$t('notes')}</span>
			</div>
			<textarea
				bind:value={note}
				class="w-full h-40 border-2 border-gray-300 rounded-lg p-2 mb-2"
				placeholder={$t('enter_notes')}
			></textarea>
			<div class="flex justify-end">
				<button
					class="py-1 px-4 bg-blue-500 text-white rounded-lg font-bold text-base hover:bg-blue-600 transition-colors"
					onclick={updateNote}
				>
					{$t('save_notes')}
				</button>
			</div>
		</div>

		<!-- 演奏履歴カード -->
		{#if Object.entries(playHistory).length > 0}
			<div class="bg-white rounded-2xl shadow-md p-6 mb-8">
				<div class="text-lg font-bold text-emerald-700 mb-2">{$t('play_history')}</div>
				<div class="space-y-2">
					{#each Object.entries(playHistory).sort( ([dateA], [dateB]) => dateA.localeCompare(dateB) ) as [date, count]}
						<div class="flex justify-between text-base md:text-lg">
							<div class="text-gray-600">{date}</div>
							<div class="font-mono font-bold text-emerald-700">{count}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	<!-- セット動画セクション -->
	{#if sets.length > 0}
		<div class="space-y-6">
			<h2 class="text-xl font-bold text-teal-800 text-center">{$t('sets_containing_this_tune')}</h2>

			{#each sets as set, index}
				<div class="bg-teal-50 rounded-2xl p-6 space-y-4">
					<!-- セット動画プレイヤー -->
					<SetVideoPlayer {set} size="medium" />

					<!-- セット内の曲リスト -->
					{#if setTunes[index] && setTunes[index].length > 0}
						<SetTuneList
							tunes={setTunes[index]}
							currentTuneId={tune.id}
							showRhythm={true}
							showKey={true}
							compact={false}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
