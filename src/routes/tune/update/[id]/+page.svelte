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
	<title>Learn Irish from hatao's youtube</title>
	<meta
		name="description"
		content="このサイトはhataoさんがyoutubeにあげている「Learn an Irish Tune Every
		Day」の動画を探しやすくし、練習の進捗を記録できるようにしたサイトです。"
	/>
</svelte:head>

<div>
	<form>
		<Input bind:value={tune.name} label="名前" />
		<Input bind:value={tune.link} label="link" />
		<Input bind:value={tune.rhythm} label="rhythm" />
		<Input bind:value={tune.key} label="key" />
		<Input bind:value={tune.mode} label="mode" />
		<Button className="mt-6" on:click={submit}>更新</Button>
	</form>
</div>
