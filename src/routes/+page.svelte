<script lang="ts">
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneListItem from '$lib/tune/TuneListItem.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs } from 'firebase/firestore';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';

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
	let rememberName = 'notSelected';
	let rememberMelody = 'notSelected';

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
	});
	$: filteredTunes = tunes.filter((tune) => {
		if (rememberName === 'yes' && !rememberNameIds.includes(tune.id)) return false;
		if (rememberName === 'no' && rememberNameIds.includes(tune.id)) return false;
		if (rememberMelody === 'yes' && !rememberMelodyIds.includes(tune.id)) return false;
		if (rememberMelody === 'no' && rememberMelodyIds.includes(tune.id)) return false;

		return true;
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