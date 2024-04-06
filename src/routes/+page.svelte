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
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="pt-5">
	{#each tunes as tune}
		<TuneListItem {tune} />
	{/each}
</div>
