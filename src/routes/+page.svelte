<script lang="ts">
	import type { Tune } from '../types/tune';
	export let data: {
		tunes: Tune[];
	};
	const tunes = data.tunes;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	{#each tunes as tune}
		<div>{tune.name}</div>
	{/each}
</div>
