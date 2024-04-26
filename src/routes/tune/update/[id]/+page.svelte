<script lang="ts">
	import type { Tune } from '../../../../types/tune';
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
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>
<div>
	<div class="row">
		<div class="item-name">名前</div>
		<div class="item-detail">{tune.name}</div>
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
