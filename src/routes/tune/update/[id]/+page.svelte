<script lang="ts">
	import type { Tune } from '../../../../types/tune';
	import { getFirestore, doc, updateDoc } from 'firebase/firestore';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/button/Button.svelte';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	export let data: {
		tune: Tune;
	};
	const tune = data.tune;
	const submit = () => {
		const ref = doc(db, 'tunes', tune.id);
		updateDoc(ref, tune);
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<form>
		<Input bind:value={tune.name} label="名前" />
		<Input bind:value={tune.link} label="link" />
		<Input bind:value={tune.rhythm} label="rhythm" />
		<Button className="mt-6" on:click={submit}>更新</Button>
	</form>
</div>
