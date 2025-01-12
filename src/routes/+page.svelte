<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneList from '$lib/tune/TuneList.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import { parse, serialize } from 'cookie';

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

	const rhythms = [...new Set(tunes.map((tune) => tune.rhythm))].sort();
	const date = new Date().toISOString().split('T')[0];
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
		<div class="flex place-content-between w-[30rem] mx-auto">
			<div>
				<div class="text-2xl text-center">名前を覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center w-52"
				>
					{rememberNameIds.length}/{tunes.length}
				</div>
			</div>
			<div>
				<div class="text-2xl text-center">メロディーを覚えた曲</div>
				<div
					class="mt-2 mx-auto border-2 border-teal-300 bg-teal-100 rounded-xl text-4xl shadow-xl py-2 text-center w-52"
				>
					{rememberMelodyIds.length}/{tunes.length}
				</div>
			</div>
		</div>

		<div class="mt-5 mx-auto w-8/12">
			<table class="shadow-lg rounded-xl bg-teal-100 overflow-hidden text-xl mx-auto">
				<thead>
					<tr class="border bg-teal-800 text-white">
						<th class="py-3 px-3 w-96">今日演奏した曲</th>
						<th class="py-3 px-3 w-52">種類</th>
						<th class="py-3 px-3 w-52">回数</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(dailyData) as [tuneId, count]}
						<tr>
							<td class="py-3 px-3">{tuneObjects[tuneId].name}</td>
							<td class="py-3 px-3 text-center">{tuneObjects[tuneId].rhythm}</td>
							<td class="py-3 px-3 text-center">{count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mt-10 w-8/12 mx-auto">
			<div class="text-2xl font-bold mx-auto">検索フィルター</div>
			<div class="row">
				<div class="item-name">名前を覚えた</div>
				<div class="item-detail">
					<RadioButtons
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
	<div class="mx-auto mt-10">
		<TuneList tunes={filteredTunes} />
	</div>
</div>

<style type="postcss">
	.row {
		@apply flex mt-5 h-10;
	}

	.item-name {
		@apply w-4/12 text-right pr-2 text-xl font-bold;
	}

	.item-detail {
		@apply w-8/12 pl-2 text-xl;
	}
</style>
