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
	$: filteredTunes = tunes.filter((tune) => {
		if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
		if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
		if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
		if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;
		if (selectedRhythm !== 'notSelected' && tune.rhythm !== selectedRhythm) return false;
		return true;
	});

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

	onMount(() => {
		const cookies = parse(document.cookie);
		rememberName = cookies.rememberName || 'notSelected';
		rememberMelody = cookies.rememberMelody || 'notSelected';
		selectedRhythm = cookies.selectedRhythm || 'notSelected';
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="pt-5">
	{#if uid}
		<div class="flex place-content-between md:w-[50rem] w-[25rem] mx-auto">
			<div>
				<div class="md:text-2xl text-xl text-center">名前を覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center md:w-52 w-44"
				>
					{rememberNameIds.length}/{tunes.length}
				</div>
			</div>
			<div>
				<div class="md:text-2xl text-xl text-center">メロディーを覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center md:w-52 w-44"
				>
					{rememberMelodyIds.length}/{tunes.length}
				</div>
			</div>
			<div class="md:block hidden">
				<div class="md:text-2xl text-xl text-center">累計演奏回数</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center md:w-52 w-44"
				>
					{totalCount}
				</div>
			</div>
		</div>

		<div class="mt-5 mx-auto md:w-8/12 w-11/12">
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
	{/if}

	<div class="mx-auto mt-10">
		<TuneList tunes={filteredTunes} {userTuneStatus} />
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
