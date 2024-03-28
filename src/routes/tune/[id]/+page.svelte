<script lang="ts">
	import type { Tune } from '../../../types/tune';
	import { getYoutubeId } from '$modules/youtubeId';
	import RadioButtons from '$lib/forms/RadioButtons.svelte';
	import { userStore } from '$modules/store';
	import { getFirestore, doc, setDoc } from 'firebase/firestore';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	// 保存したいデータ
	const tuneData = {
		title: '曲のタイトル',
		artist: 'アーティスト名'
		// その他のデータ...
	};

	export let data: {
		tune: Tune;
	};
	const tune = data.tune;
	const youtubeId = getYoutubeId(tune.link);
	const rememberNameOptions = [
		{
			label: 'はい',
			value: true,
			id: 'remember1'
		},
		{
			label: 'いいえ',
			value: false,
			id: 'remember2'
		}
	];
	const rememberMelodyOption = [
		{
			label: 'はい',
			value: true,
			id: 'remember1'
		},
		{
			label: 'いいえ',
			value: false,
			id: 'remember2'
		}
	];
	let rememberName = false;
	let rememberMelody = false;
	let uid: string;

	userStore.subscribe((value) => {
		uid = value.uid;
	});

	const updateRememberName = async (event: CustomEvent) => {
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(docRef, {
			rememberName
		});
	};
	const updateRememberMelody = async (event: CustomEvent) => {
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(docRef, {
			rememberMelody
		});
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
	<div class="row">
		<div class="item-name">名前</div>
		<div class="item-detail">{tune.name}</div>
	</div>
	<div class="row">
		<div class="item-name">名前から何の曲が思い出せる</div>
		<div class="item-detail">
			<RadioButtons
				options={rememberNameOptions}
				bind:userSelected={rememberName}
				name="rememberName"
				on:input={updateRememberName}
			/>
		</div>
	</div>
	<div class="row">
		<div class="item-name">楽譜を見ずに演奏できる</div>
		<div class="item-detail">
			<RadioButtons
				options={rememberMelodyOption}
				bind:userSelected={rememberMelody}
				name="rememberMelody"
				on:input={updateRememberMelody}
			/>
		</div>
	</div>
	<div class="row">
		<div class="item-name">満足のいく演奏ができる</div>
		<div class="item-detail">ラジオボタン</div>
	</div>
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
