<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneList from '$lib/tune/TuneList.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import { parse, serialize } from 'cookie';
	import { getDate } from '$modules/getDate';

	export let data: {
		tunes: Tune[];
	};
	const tunes = data.tunes;
	const db = getFirestore();
	const rememberNameOption = [
		{
			label: '未選択',
			value: 'notSelected',
			id: 'rememberName1'
		},
		{
			label: '覚えた',
			value: 'yes',
			id: 'rememberName2'
		},
		{
			label: '覚えていない',
			value: 'no',
			id: 'rememberName3'
		}
	];
	const rememberMelodyOption = [
		{
			label: '未選択',
			value: 'notSelected',
			id: 'rememberMelody1'
		},
		{
			label: '覚えた',
			value: 'yes',
			id: 'rememberMelody2'
		},
		{
			label: '覚えていない',
			value: 'no',
			id: 'rememberMelody3'
		}
	];

	const sortByNameOption = [
		{ label: 'No(昇順)', value: 'sort_by_number_asc', id: 'sortByNumber_asc' },
		{ label: 'No(降順)', value: 'sort_by_number_desc', id: 'sortByNumber_desc' },
		{ label: '曲名(昇順)', value: 'sort_by_name_asc', id: 'sortByName_asc' },
		{ label: '曲名(降順)', value: 'sort_by_name_desc', id: 'sortByName_desc' },
		{ label: 'Key(昇順)', value: 'sort_by_key_asc', id: 'sortByKey_desc' },
		{ label: 'Key(降順)', value: 'sort_by_key_desc', id: 'sortByKey_desc' }
	];

	let uid: string;
	let rememberNameIds: string[] = [];
	let rememberMelodyIds: string[] = [];
	let rememberName: string;
	let rememberMelody: string;
	let selectedRhythm: string;
	let userTuneStatus: { [key: string]: UserTune } = {};
	let totalCount: number = 0;

	const rhythms = [...new Set(tunes.map((tune) => tune.rhythm))].sort();
	const date = getDate();
	let dailyData: { [key: string]: number } = {};

	// 追加: ソート方法を保存する変数
	let sortBy = 'sort_by_number_asc';

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
	});

	// フィルタリング（名前を覚えた・メロディーを覚えた・種類）
	$: filteredTunes = tunes.filter((tune) => {
		if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
		if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
		if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
		if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;
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

	$: dailyTotal = Object.values(dailyData).reduce((acc, count) => acc + count, 0);

	onMount(() => {
		const cookies = parse(document.cookie);
		rememberName = cookies.rememberName || 'notSelected';
		rememberMelody = cookies.rememberMelody || 'notSelected';
		selectedRhythm = cookies.selectedRhythm || 'notSelected';
	});
</script>

<svelte:head>
	<title>Learn Irish From hatao's youtube</title>
	<meta name="description" content="learn irish music from hatao's youtube movie." />
</svelte:head>

<div class="pt-5">
	{#if uid}
		<div class="grid grid-cols-4 place-content-between md:w-[50rem] w-[28rem] mx-auto gap-x-1 gap-y-8">
			<div class="col-span-2">
				<div class="md:text-2xl text-xl text-center">名前を覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
				>
					{rememberNameIds.length}/{tunes.length}
				</div>
			</div>
			<div class="col-span-2">
				<div class="md:text-2xl text-xl text-center">メロディーを覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
				>
					{rememberMelodyIds.length}/{tunes.length}
				</div>
			</div>
			<div class="col-span-2">
				<div class="md:text-2xl text-xl text-center">累計演奏回数</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
				>
					{totalCount}
				</div>
			</div>
			<div class="col-span-2">
				<div class="md:text-2xl text-xl text-center">今日の演奏回数</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center max-w-56"
				>
					{dailyTotal}
				</div>
			</div>
		</div>

		<div class="mt-7 mx-auto md:w-8/12 w-11/12">
			<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto">
				<thead>
					<tr class="border bg-teal-800 text-white md:table-row hidden">
						<th class="py-3 px-3 w-96">今日演奏した曲</th>
						<th class="py-3 px-3 w-52">種類</th>
						<th class="py-3 px-3 w-52">今日の演奏回数</th>
					</tr>
					<tr class="border bg-teal-800 text-white table-row md:hidden">
						<th class="py-3 px-3 w-96">今日演奏した曲</th>
						<th class="py-3 px-3 w-60">今日の<br />演奏回数</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(dailyData) as [tuneId, count]}
						<tr class="border-b border-teal-400 md:table-row hidden">
							<td class="py-3 px-3">{tuneObjects[tuneId].name}</td>
							<td class="py-3 px-3 text-center">{tuneObjects[tuneId].rhythm}</td>
							<td class="py-3 px-3 text-center">{count}</td>
						</tr>
						<tr class="border-b border-teal-400 table-row md:hidden">
							<td class="py-3 px-3">{tuneObjects[tuneId].name}</td>
							<td class="py-3 px-3 text-center">{count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mt-10 md:w-8/12 w-11/12 mx-auto">
			<div class="text-2xl font-bold mx-auto">検索フィルター</div>
			<div class="row">
				<div class="item-name">名前を覚えた</div>
				<div class="item-detail">
					<RadioButtons
						className="flex md:flex-row flex-col"
						options={rememberNameOption}
						bind:userSelected={rememberName}
						name="rememberName"
					/>
				</div>
			</div>
			<div class="row">
				<div class="item-name">メロディーを覚えた</div>
				<div class="item-detail">
					<RadioButtons
						className="flex md:flex-row flex-col"
						options={rememberMelodyOption}
						bind:userSelected={rememberMelody}
						name="rememberMelody"
					/>
				</div>
			</div>
			<div class="row">
				<div class="item-name">種類</div>
				<div class="item-detail">
					<select bind:value={selectedRhythm} name="selectedRhythm">
						<option value="notSelected"></option>
						{#each rhythms as rhythm}
							<option value={rhythm}>
								{rhythm}
							</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="row">
				<div class="item-name">並び替え</div>
				<div class="item-detail">
					<select id="sortByNameSelect" bind:value={sortBy}>
						{#each sortByNameOption as opt}
							<option value={opt.value} id={opt.id}>{opt.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	{/if}
	{#if !uid}
		<div class="mt-10 md:w-8/12 w-11/12 mx-auto">
			<div class="text-2xl font-bold mx-auto">検索フィルター</div>
			<div class="row">
				<div class="item-name">種類</div>
				<div class="item-detail">
					<select bind:value={selectedRhythm} name="selectedRhythm">
						<option value="notSelected"></option>
						{#each rhythms as rhythm}
							<option value={rhythm}>
								{rhythm}
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="item-name">並び替え</div>
			<div class="item-detail">
				<select id="sortByNameSelect" bind:value={sortBy}>
					{#each sortByNameOption as opt}
						<option value={opt.value} id={opt.id}>{opt.label}</option>
					{/each}
				</select>
			</div>
		</div>
	{/if}

	<div class="mx-auto mt-10">
		<TuneList tunes={sortedTunes} {userTuneStatus} />
	</div>
</div>

<style type="postcss">
	.row {
		@apply flex mt-7 md:h-10;
	}

	.item-name {
		@apply md:w-4/12 w-5/12 text-right pr-2 text-xl font-bold;
	}

	.item-detail {
		@apply md:w-8/12 w-7/12 pl-2 text-xl;
	}
</style>
