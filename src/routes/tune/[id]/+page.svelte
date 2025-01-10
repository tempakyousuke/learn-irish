<script lang="ts">
	import type { Tune } from '../../../types/tune';
	import { getYoutubeId } from '$modules/youtubeId';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	export let data: {
		tune: Tune;
	};
	const tune = data.tune;
	const youtubeId = getYoutubeId(tune.link);
	const rememberNameOption = [
		{
			label: 'はい',
			value: true,
			id: 'rememberName1'
		},
		{
			label: 'いいえ',
			value: false,
			id: 'rememberName2'
		}
	];
	const rememberMelodyOption = [
		{
			label: 'はい',
			value: true,
			id: 'rememberMelody1'
		},
		{
			label: 'いいえ',
			value: false,
			id: 'rememberMelody2'
		}
	];
	let rememberName = false;
	let rememberMelody = false;
	let playCount = 0;
	let uid: string;
	let dailyPlayCount = 0;
	let dailyData: { [key: string]: number } = {};
	const date = new Date().toISOString().split('T')[0];

	userStore.subscribe(async (value) => {
		uid = value.uid;
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		const data = await getDoc(docRef);
		const userTune = data.data();
		if (userTune?.rememberName) {
			rememberName = userTune.rememberName as boolean;
		}
		if (userTune?.rememberMelody) {
			rememberMelody = userTune.rememberMelody as boolean;
		}
		if (userTune?.playCount) {
			playCount = userTune.playCount as number;
		}
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		const dailyData = (await getDoc(dailyDocRef)).data() || {};
		if (dailyData[tune.id]) {
			dailyPlayCount = dailyData[tune.id];
		}
	});

	const updateRememberName = async (event: CustomEvent) => {
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(
			docRef,
			{
				rememberName
			},
			{ merge: true }
		);
	};
	const updateRememberMelody = async (event: CustomEvent) => {
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(
			docRef,
			{
				rememberMelody
			},
			{ merge: true }
		);
	};
	const updatePlayCount = async () => {
		if (!uid) {
			return;
		}
		playCount++;
		dailyPlayCount++;
		dailyData[tune.id] = dailyPlayCount;
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(
			docRef,
			{
				playCount
			},
			{ merge: true }
		);
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		await setDoc(dailyDocRef, { [tune.id]: dailyPlayCount }, { merge: true });
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="mx-auto bg-white w-full md:w-[800px] rounded shadow-md">
	<div>
		<iframe
			class="mx-auto w-full md:w-[560px]"
			height="315"
			src="https://www.youtube.com/embed/{youtubeId}"
			title="YouTube video player"
			frameborder="0"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			allowfullscreen
		></iframe>
	</div>
	{#if uid}
		<div class="row">
			<div class="item-name">名前を覚えた</div>
			<div class="item-detail">
				<RadioButtons
					options={rememberNameOption}
					bind:userSelected={rememberName}
					name="rememberName"
					on:change={updateRememberName}
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
					on:change={updateRememberMelody}
				/>
			</div>
		</div>
		<div class="row">
			<div class="item-name">この曲を演奏した回数</div>
			<div class="item-detail">
				{playCount}
				<button on:click={updatePlayCount}>+1</button>
			</div>
		</div>
	{/if}
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
