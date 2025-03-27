<script lang="ts">
	import type { Tune } from '../../../types/tune';
	import { getYoutubeId } from '$modules/youtubeId';
	import { userStore } from '$modules/store';
	import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
	import { getDate } from '$modules/getDate';
	import Fa from 'svelte-fa';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	export let data: {
		tune: Tune;
	};
	const tune = data.tune;
	const youtubeId = getYoutubeId(tune.link);
	let rememberName = false;
	let rememberMelody = false;
	let playCount = 0;
	let uid: string;
	let dailyPlayCount = 0;
	let dailyData: { [key: string]: number } = {};
	const date = getDate();

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

	const updateRememberName = async () => {
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

	const updateRememberMelody = async () => {
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
	<title>{tune.name}</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="mx-auto w-full md:w-[800px]">
	<div>
		<iframe
			class="mx-auto w-full sm:max-w-[560px] max-w-[400px] sm:h-[315px] h-[240px]"
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
			<div class="item-name py-2">名前を覚えた</div>
			<div class="item-detail">
				<button
					class="px-4 py-2 rounded-lg {rememberName ? 'bg-teal-500 text-white' : 'bg-gray-200'}"
					on:click={() => {
						rememberName = !rememberName;
						updateRememberName();
					}}
				>
					{rememberName ? '覚えた！' : '未達成'}
				</button>
			</div>
		</div>
		<div class="row">
			<div class="item-name py-2">メロディーを覚えた</div>
			<div class="item-detail">
				<button
					class="px-4 py-2 rounded-lg {rememberMelody ? 'bg-teal-500 text-white' : 'bg-gray-200'}"
					on:click={() => {
						rememberMelody = !rememberMelody;
						updateRememberMelody();
					}}
				>
					{rememberMelody ? '覚えた！' : '未達成'}
				</button>
			</div>
		</div>
		<div class="row">
			<div class="item-name pt-2">この曲を演奏した回数</div>
			<div class="item-detail">
				{playCount}
				<button
					class="ml-2 py-2 px-4 bg-blue-500 text-white rounded-lg font-bold text-xl"
					on:click={updatePlayCount}
				>
					<Fa class="" icon={faPlus} />
				</button>
			</div>
		</div>
	{/if}
</div>

<style type="postcss">
	.row {
		@apply flex mt-5 text-xl;
	}

	.item-name {
		@apply w-1/2 text-right pr-2;
	}

	.item-detail {
		@apply w-1/2 pl-2;
	}
</style>
