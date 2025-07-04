<script lang="ts">
	import type { TuneFull } from '$core/data/models/Tune';
	import type { UserTuneFull } from '$core/data/models/UserTune';
	import TuneList from '$lib/tune/TuneList.svelte';
	import { userId } from '$core/auth/authService';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import { serialize } from 'cookie';
	import { getDate } from '$core/utils/dateUtils';
	import { getFavorites } from '$core/data/repositories/favoritesRepository';
	import TuneStats from './TuneStats.svelte';
	import FilterControls from './FilterControls.svelte';
	import DailyPlaysTable from './DailyPlaysTable.svelte';
	import ErrorMessage from '$lib/ui/ErrorMessage.svelte';
	import { getFirebaseErrorMessage } from '$lib/utils/errorHandling';
	import { getUserTunes } from '$core/data/repositories/tuneRepository';
	import { calcUserTuneStats } from '$lib/utils/userTuneStats';
	import { untrack } from 'svelte';

	const { data }: {
		data: {
			tunes: TuneFull[];
			formValues: {
				rememberName: string;
				rememberMelody: string;
				selectedRhythm: string;
				sortBy: string;
				onlyFavorite: string;
			};
		};
	} = $props();
	const tunes = data.tunes;
	const db = getFirestore();

	let rememberNameIds = $state<string[]>([]);
	let rememberMelodyIds = $state<string[]>([]);
	let rememberName = $state<string>(data.formValues.rememberName);
	let rememberMelody = $state<string>(data.formValues.rememberMelody);
	let selectedRhythm = $state<string>(data.formValues.selectedRhythm);
	let onlyFavorite = $state<string>(data.formValues.onlyFavorite);
	let userTuneStatus = $state<{ [key: string]: UserTuneFull }>({});
	let totalCount = $state<number>(0);
	let favoriteTuneIds = $state<string[]>([]);

	const rhythms: string[] =
		([...new Set(tunes.map((tune) => tune.rhythm))].sort() as string[]) || [];
	const date = getDate();
	let dailyData = $state<{ [key: string]: number }>({});

	// 追加: ソート方法を保存する変数
	let sortBy = $state<string>(data.formValues.sortBy);

	// ユーザーデータの読み込み状態
	let isUserDataLoading = $state<boolean>(false);
	let errorMessage = $state<string | null>(null);

	// userId変更時にデータを取得
	$effect(() => {
		if ($userId) {
			isUserDataLoading = true;
			errorMessage = null;
			getUserData($userId).finally(() => {
				isUserDataLoading = false;
			});
		} else {
			// ログアウト時にデータをリセット
			rememberNameIds = [];
			rememberMelodyIds = [];
			userTuneStatus = {};
			totalCount = 0;
			dailyData = {};
			favoriteTuneIds = [];
		}
	});

	async function getUserData(uid: string) {
		if (!uid) {
			return;
		}

		try {
			// 共通化: ユーザーの習得状況一覧を取得
			const userTunes = await getUserTunes(uid);

			// 共通化: 集計ユーティリティで一括集計
			const stats = calcUserTuneStats(userTunes);
			rememberNameIds = userTunes.filter((tune) => tune.rememberName).map((tune) => tune.id);
			rememberMelodyIds = userTunes.filter((tune) => tune.rememberMelody).map((tune) => tune.id);
			totalCount = stats.totalPlayCount;
			userTuneStatus = {};
			userTunes.forEach((tune) => {
				userTuneStatus[tune.id] = tune;
			});

			// 日次データの取得
			const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
			const dailySnapshot = await getDoc(dailyDocRef);
			dailyData = dailySnapshot.data() || {};

			// お気に入りの取得
			favoriteTuneIds = await getFavorites(uid);
		} catch (error) {
			console.error('ユーザーデータ取得エラー:', error);
			// エラー時はデータを初期化
			rememberNameIds = [];
			rememberMelodyIds = [];
			userTuneStatus = {};
			totalCount = 0;
			dailyData = {};
			favoriteTuneIds = [];

			// エラーメッセージを設定
			errorMessage = getFirebaseErrorMessage(error, 'ユーザーデータの取得に失敗しました');
		}
	}

	// フィルタリング（名前を覚えた・メロディーを覚えた・種類）
	const filteredTunes = $derived(tunes.filter((tune) => {
		if ($userId) {
			// これらはログイン時のみ有効にする
			if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
			if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
			if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
			if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;
			if (onlyFavorite === 'on' && !favoriteTuneIds.includes(tune.id)) return false;
		}
		if (selectedRhythm !== 'notSelected' && tune.rhythm !== selectedRhythm) return false;
		return true;
	}));

	function removeLeadingThe(title: string): string {
		// 大文字小文字を問わず先頭が "The " の場合は取り除く
		const lower = title.toLowerCase();
		if (lower.startsWith('the ')) {
			return title.substring(4);
		}
		return title;
	}

	const sortedTunes = $derived((() => {
		const arr = [...filteredTunes];

		switch (sortBy) {
			case 'sort_by_number_asc':
				// tuneNo(文字列)を昇順
				arr.sort((a, b) => a.tuneNo - b.tuneNo);
				break;
			case 'sort_by_number_desc':
				// tuneNo(文字列)を降順
				arr.sort((a, b) => b.tuneNo - a.tuneNo);
				break;
			case 'sort_by_name_asc':
				// 曲名 (The を除去) 昇順
				arr.sort((a, b) => removeLeadingThe(a.name!).localeCompare(removeLeadingThe(b.name!)));
				break;
			case 'sort_by_name_desc':
				// 曲名 (The を除去) 降順
				arr.sort((a, b) => removeLeadingThe(b.name!).localeCompare(removeLeadingThe(a.name!)));
				break;
			case 'sort_by_key_asc':
				// Key 昇順
				arr.sort((a, b) => (a.key! + a.mode!).localeCompare(b.key! + b.mode!));
				break;
			case 'sort_by_key_desc':
				// Key 降順
				arr.sort((a, b) => (b.key! + b.mode!).localeCompare(a.key! + a.mode!));
				break;
			case 'sort_by_playcount_asc':
				// 演奏回数 昇順
				arr.sort((a, b) => {
					const playCountA = userTuneStatus[a.id]?.playCount || 0;
					const playCountB = userTuneStatus[b.id]?.playCount || 0;
					return playCountA - playCountB;
				});
				break;
			case 'sort_by_playcount_desc':
				// 演奏回数 降順
				arr.sort((a, b) => {
					const playCountA = userTuneStatus[a.id]?.playCount || 0;
					const playCountB = userTuneStatus[b.id]?.playCount || 0;
					return playCountB - playCountA;
				});
				break;
			default:
				// それ以外の場合は並び替えしない
				break;
		}

		return arr;
	})());

	const tuneObjects = $derived(tunes.reduce(
		(acc, tune) => {
			acc[tune.id] = tune;
			return acc;
		},
		{} as { [key: string]: TuneFull }
	));

	function updateCookie(name: string, value: string) {
		if (!value) return;
		document.cookie = serialize(name, value, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});
	}

	$effect(() => {
		untrack(() => updateCookie('rememberName', rememberName));
	});
	$effect(() => {
		untrack(() => updateCookie('rememberMelody', rememberMelody));
	});
	$effect(() => {
		untrack(() => updateCookie('selectedRhythm', selectedRhythm));
	});
	$effect(() => {
		untrack(() => updateCookie('sortBy', sortBy));
	});
	$effect(() => {
		untrack(() => updateCookie('onlyFavorite', onlyFavorite));
	});

	const dailyTotal = $derived(Object.values(dailyData).reduce((acc, count) => acc + count, 0));
</script>

<svelte:head>
	<title>Learn Irish From hatao's youtube</title>
	<meta name="description" content="learn irish music from hatao's youtube movie." />
</svelte:head>

<!-- 更新ボタンは必要に応じて有効化
<div class="fixed bottom-4 right-4 z-10">
	<a
		href="?refresh=true"
		class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
		title="データを最新の状態に更新"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
		</svg>
		更新
	</a>
</div>
-->

<div class="pt-5">
	{#if $userId}
		{#if errorMessage}
			<ErrorMessage message={errorMessage} dismissable={true} type="error" />
		{/if}

		{#if isUserDataLoading}
			<div class="text-center py-10">
				<p class="text-lg">データを読み込み中...</p>
			</div>
		{:else}
			<TuneStats {tunes} {rememberNameIds} {rememberMelodyIds} {totalCount} {dailyTotal} />

			<DailyPlaysTable {dailyData} {tuneObjects} />
			<FilterControls
				isLoggedIn={!!$userId}
				bind:rememberName
				bind:rememberMelody
				bind:onlyFavorite
				bind:selectedRhythm
				bind:sortBy
				{rhythms}
			/>
		{/if}
	{/if}

	<div class="mx-auto mt-10">
		<TuneList tunes={sortedTunes} {userTuneStatus} {dailyData} />
	</div>
</div>
