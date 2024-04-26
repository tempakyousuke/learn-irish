<script lang="ts">
	import type { Tune } from '../types/tune';
	import type { UserTune } from '../types/userTune';
	import TuneListItem from '$lib/tune/TuneListItem.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, collection, getDocs } from 'firebase/firestore';

	export let data: {
		tunes: Tune[];
	};
	const tunes = data.tunes;
	const db = getFirestore();
	let uid: string;
	let rememberNameIds: string[] = [];
	let rememberMelodyIds: string[] = [];
	let onlyNotRememberName = true;
	let onlyNotRememberMelody = false;

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
		if (onlyNotRememberName && rememberNameIds.includes(tune.id)) return false;
		if (onlyNotRememberMelody && rememberMelodyIds.includes(tune.id)) return false;
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
	<input type="checkbox" bind:checked={onlyNotRememberName} id="onlyNotRememberName" />
	<label for="onlyNotRememberName"> 名前を覚えてない曲のみ表示 </label>
	<input type="checkbox" bind:checked={onlyNotRememberMelody} id="onlyNotRememberMelody" />
	<label for="onlyNotRememberMelody"> メロディーを覚えてない曲のみ表示 </label>
	{#each filteredTunes as tune}
		<TuneListItem {tune} />
	{/each}
</div>
