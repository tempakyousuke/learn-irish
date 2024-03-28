<script lang="ts">
	import type { Tune } from '../types/tune';
	import TuneListItem from '$lib/tune/TuneListItem.svelte';
	export let data: {
		tunes: Tune[];
	};
	const tunes = data.tunes;
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
