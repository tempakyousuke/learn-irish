<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '../../../types/tune';
	import { getYoutubeId } from '$modules/youtubeId';
	import { userStore } from '$modules/store';
	import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
	import { getDate } from '$modules/getDate';
	import Fa from 'svelte-fa';
	import { faPlus, faHeart } from '@fortawesome/free-solid-svg-icons';
	import { toast } from '$modules/toast';
	import {checkFavorite, addFavorite, removeFavorite} from '$modules/favorites';

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
	let note = '';
	let isBookmarked = false;
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
		if (userTune?.note) {
			note = userTune.note as string;
		}
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		const dailyData = (await getDoc(dailyDocRef)).data() || {};
		if (dailyData[tune.id]) {
			dailyPlayCount = dailyData[tune.id];
		}
		isBookmarked = await checkFavorite(uid, tune.id);
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
		const date = getDate();
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		await setDoc(dailyDocRef, { [tune.id]: dailyPlayCount }, { merge: true });
	};
	const updateNote = async () => {
		if (!uid) {
			return;
		}
		const docRef = doc(db, `users/${uid}/tunes/${tune.id}`);
		await setDoc(
			docRef,
			{
				note
			},
			{ merge: true }
		);
		toast.success('メモを保存しました');
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
	<ul class="mt-5 border p-2 max-w-[560px] mx-auto">
		<h3 class="text-xl">{$t('tune_information')}</h3>
		<li class="flex text-xl">
			<div class="text-right w-1/2 mr-5">No</div>
			<div class="text-left w-1/2 grow">{tune.tuneNo}</div>
		</li>
		<li class="flex text-xl">
			<div class="text-right w-1/2 mr-5">{$t('tune_name')}</div>
			<div class="text-left w-1/2">{tune.name}</div>
		</li>
		<li class="flex text-xl">
			<div class="text-right w-1/2 mr-5">{$t('tune_type')}</div>
			<div class="text-left w-1/2">{tune.rhythm}</div>
		</li>
		<li class="flex text-xl">
			<div class="text-right w-1/2 mr-5">{$t('key')}・{$t('mode')}</div>
			<div class="text-left w-1/2">{tune.key} {tune.mode}</div>
		</li>

	</ul>
	{#if uid}
		<div class="row">
			<div class="item-name py-2">{$t('memorized_name')}</div>
			<div class="item-detail">
				<button
					class="px-4 py-2 rounded-lg {rememberName ? 'bg-teal-500 text-white' : 'bg-gray-200'}"
					on:click={() => {
						rememberName = !rememberName;
						updateRememberName();
					}}
				>
					{rememberName ?  $t('memorized') + '！': $t('incomplete')}
				</button>
			</div>
		</div>
		<div class="row">
			<div class="item-name py-2">{$t('memorized_melody')}</div>
			<div class="item-detail">
				<button
					class="px-4 py-2 rounded-lg {rememberMelody ? 'bg-teal-500 text-white' : 'bg-gray-200'}"
					on:click={() => {
						rememberMelody = !rememberMelody;
						updateRememberMelody();
					}}
				>
					{rememberMelody ? $t('memorized') + '！' : $t('incomplete')}
				</button>
			</div>
		</div>
		<div class="row">
			<div class="item-name pt-2">{$t('times_played')}</div>
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
		<div class="row">
			<div class="item-name pt-2">{$t('favorite')}</div>
			<div class="item-detail">
				{#if isBookmarked}
					<button
						class="px-4 py-2 rounded-lg bg-teal-500 text-white"
						on:click={async () => {
							await removeFavorite(uid, tune.id);
							isBookmarked = false;
						}}
					>
						<Fa class="" icon={faHeart} />
					</button>
				{:else}
					<button
						class="px-4 py-2 rounded-lg bg-gray-200"
						on:click={async () => {
							await addFavorite(uid, tune.id);
							isBookmarked = true;
						}}
					>
						<Fa class="" icon={faHeart} />
					</button>
				{/if}
			</div>
		</div>
		<div class="row">
			<div class="w-1/4 text-right pr-2 pt-2">{$t('notes')}</div>
			<div class="pl-2 w-2/4">
				<textarea
					bind:value={note}
					class="w-full h-52 border-2 border-gray-300 rounded-lg p-2"
					placeholder="{$t('enter_notes')}"
				></textarea>
			</div>
		</div>
		<!-- ボタン右よせ -->
		<div class="flex justify-end w-3/4">
			<button
				class="py-1 px-2 bg-blue-500 text-white rounded-lg font-bold text-xl"
				on:click={updateNote}
			>
				{$t('save_notes')}
			</button>
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
