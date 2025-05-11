<script lang="ts">
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneList from '$lib/tune/TuneList.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import { serialize } from 'cookie';
	import { getDate } from '$modules/getDate';
	import { getFavorites } from '$modules/favorites';
	import TuneStats from './TuneStats.svelte';
	import FilterControls from './FilterControls.svelte';
	import DailyPlaysTable from './DailyPlaysTable.svelte';

	export let data: {
		tunes: Tune[];
		formValues: {
			rememberName: string;
			rememberMelody: string;
			selectedRhythm: string;
			sortBy: string;
			onlyFavorite: string;
		};
	};
	const tunes = data.tunes;
	const db = getFirestore();

	let uid: string;
	let rememberNameIds: string[] = [];
	let rememberMelodyIds: string[] = [];
	let rememberName: string = data.formValues.rememberName;
	let rememberMelody: string = data.formValues.rememberMelody;
	let selectedRhythm: string = data.formValues.selectedRhythm;
	let onlyFavorite: string = data.formValues.onlyFavorite;
	let userTuneStatus: { [key: string]: UserTune } = {};
	let totalCount: number = 0;
	let favoriteTuneIds: string[] = [];

	const rhythms: string[] =
		([...new Set(tunes.map((tune) => tune.rhythm))].sort() as string[]) || [];
	const date = getDate();
	let dailyData: { [key: string]: number } = {};

	// 追加: ソート方法を保存する変数
	let sortBy: string = data.formValues.sortBy;

	userStore.subscribe(async (value) => {
		uid = value.uid;
		if (!uid) {
			return;
		}
		const tunesCollectionRef = collection(db, `users/${uid}/tunes`);
		const querySnapshot = await getDocs(tunesCollectionRef);
		const tunes = querySnapshot.docs.map((doc) => {
			return { id: doc.id, ...doc.data() } as UserTune;
		});
		rememberNameIds = tunes.filter((tune) => tune.rememberName).map((tune) => tune.id);
		rememberMelodyIds = tunes.filter((tune) => tune.rememberMelody).map((tune) => tune.id);
		tunes.forEach((tune) => {
			userTuneStatus[tune.id] = tune;
			totalCount += tune.playCount || 0;
		});
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		dailyData = (await getDoc(dailyDocRef)).data() || {};
		favoriteTuneIds = await getFavorites(uid);
	});

	// フィルタリング（名前を覚えた・メロディーを覚えた・種類）
	$: filteredTunes = tunes.filter((tune) => {
		if (uid) {
			// これらはログイン時のみ有効にする
			if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
			if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
			if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
			if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;
			if (onlyFavorite === 'on' && !favoriteTuneIds.includes(tune.id)) return false;
		}
		if (selectedRhythm !== 'notSelected' && tune.rhythm !== selectedRhythm) return false;
		return true;
	});

	function removeLeadingThe(title: string): string {
		// 大文字小文字を問わず先頭が "The " の場合は取り除く
		const lower = title.toLowerCase();
		if (lower.startsWith('the ')) {
			return title.substring(4);
		}
		return title;
	}

	$: sortedTunes = (() => {
		const arr = [...filteredTunes];

		switch (sortBy) {
			case 'sort_by_number_asc':
				// tuneNo(文字列)を昇順
				arr.sort((a, b) => parseInt(a.tuneNo!) - parseInt(b.tuneNo!));
				break;
			case 'sort_by_number_desc':
				// tuneNo(文字列)を降順
				arr.sort((a, b) => parseInt(b.tuneNo!) - parseInt(a.tuneNo!));
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
			default:
				// それ以外の場合は並び替えしない
				break;
		}

		return arr;
	})();

	$: tuneObjects = tunes.reduce(
		(acc, tune) => {
			acc[tune.id] = tune;
			return acc;
		},
		{} as { [key: string]: Tune }
	);

	function updateCookie(name: string, value: string) {
		if (!value) return;
		document.cookie = serialize(name, value, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});
	}

	$: updateCookie('rememberName', rememberName);
	$: updateCookie('rememberMelody', rememberMelody);
	$: updateCookie('selectedRhythm', selectedRhythm);
	$: updateCookie('sortBy', sortBy);
	$: updateCookie('onlyFavorite', onlyFavorite);

	$: dailyTotal = Object.values(dailyData).reduce((acc, count) => acc + count, 0);
</script>

<svelte:head>
	<title>Learn Irish From hatao's youtube</title>
	<meta name="description" content="learn irish music from hatao's youtube movie." />
</svelte:head>

<div class="pt-5">
	{#if uid}
		<TuneStats {tunes} {rememberNameIds} {rememberMelodyIds} {totalCount} {dailyTotal} />

		<DailyPlaysTable {dailyData} {tuneObjects} />
		<FilterControls
			isLoggedIn={!!uid}
			bind:rememberName
			bind:rememberMelody
			bind:onlyFavorite
			bind:selectedRhythm
			bind:sortBy
			{rhythms}
		/>
	{/if}

	<div class="mx-auto mt-10">
		<TuneList tunes={sortedTunes} {userTuneStatus} />
	</div>
</div>

<style type="postcss">
</style>
