<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneListItem from '$lib/tune/TuneListItem.svelte';
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
	let selectedRhythm = '';

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

	$: tuneNames = tunes.reduce(
		(acc, tune) => {
			acc[tune.id] = tune.name || '';
			return acc;
		},
		{} as { [key: string]: string }
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
		selectedRhythm = cookies.selectedRhythm || '';
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="pt-5">
	<div class="flex">
		<div>名前を覚えた曲</div>
		<div>{rememberNameIds.length}/{tunes.length}</div>
	</div>
	<div class="flex">
		<div>メロディーを覚えた曲</div>
		<div>{rememberMelodyIds.length}/{tunes.length}</div>
	</div>
	<div class="flex">
		<div>今日演奏した回数</div>
		<div>
			{#each Object.entries(dailyData) as [tuneId, count]}
				<div>{tuneNames[tuneId]}: {count}</div>
			{/each}
		</div>
	</div>

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
		<div class="item-name">rhythm</div>
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
	{#each filteredTunes as tune}
		<TuneListItem {tune} />
	{/each}
</div>

<style type="postcss">
	.row {
		@apply flex mt-5;
	}

	.item-name {
		@apply w-1/2 text-right pr-2;
	}

	.item-detail {
		@apply w-1/2 pl-2;
	}
</style>
