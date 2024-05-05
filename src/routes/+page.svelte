<script lang="ts">
	import { onMount } from 'svelte';
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneListItem from '$lib/tune/TuneListItem.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
	const levelOption = [
		{
			label: '未選択',
			value: 0,
			id: 'level0'
		},
		{
			label: '1',
			value: 1,
			id: 'level1'
		},
		{
			label: '2',
			value: 2,
			id: 'level2'
		},
		{
			label: '3',
			value: 3,
			id: 'level3'
		},
		{
			label: '4',
			value: 4,
			id: 'level4'
		},
		{
			label: '5',
			value: 5,
			id: 'level5'
		}
	];
	let uid: string;
	let rememberNameIds: string[] = [];
	let rememberMelodyIds: string[] = [];
	let rememberName: string;
	let rememberMelody: string;
	let selectedRhythm = '';
	let selectedLevel = 0;
	let userLevelIds: {
		1: string[];
		2: string[];
		3: string[];
		4: string[];
		5: string[];
	} = {
		1: [],
		2: [],
		3: [],
		4: [],
		5: []
	};

	const rhythms = [...new Set(tunes.map((tune) => tune.rhythm))].sort();

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
		userLevelIds[1] = tunes.filter((tune) => tune.playingLevel === 1).map((tune) => tune.id);
		userLevelIds[2] = tunes.filter((tune) => tune.playingLevel === 2).map((tune) => tune.id);
		userLevelIds[3] = tunes.filter((tune) => tune.playingLevel === 3).map((tune) => tune.id);
		userLevelIds[4] = tunes.filter((tune) => tune.playingLevel === 4).map((tune) => tune.id);
		userLevelIds[5] = tunes.filter((tune) => tune.playingLevel === 5).map((tune) => tune.id);
	});
	$: filteredTunes = tunes.filter((tune) => {
		if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
		if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
		if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
		if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;
		if (selectedRhythm !== 'notSelected' && tune.rhythm !== selectedRhythm) return false;
		if (selectedLevel === 1 && !userLevelIds[1].includes(tune.id)) return false;
		if (selectedLevel === 2 && !userLevelIds[2].includes(tune.id)) return false;
		if (selectedLevel === 3 && !userLevelIds[3].includes(tune.id)) return false;
		if (selectedLevel === 4 && !userLevelIds[4].includes(tune.id)) return false;
		if (selectedLevel === 5 && !userLevelIds[5].includes(tune.id)) return false;

		return true;
	});

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
		<div class="item-name">曲に対する自分の演奏の評価</div>
		<div class="item-detail">
			<RadioButtons options={levelOption} bind:userSelected={selectedLevel} name="playingLevel" />
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
