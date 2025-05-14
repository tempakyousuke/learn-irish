<script lang="ts">
	import Papa from 'papaparse';
	import type { Tune } from '$core/data/models/Tune';
	import { db } from '$core/data/firebase/firebaseClient';
	import { addDoc, collection } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	let sheetText = '';

	$: parsedValue = sheetText.split('\t');
	$: saveData = {
		setNo: parseInt(parsedValue[0]),
		tuneNo: parseInt(parsedValue[1]),
		name: parsedValue[2],
		link: parsedValue[3],
		genre: parsedValue[4],
		date: parsedValue[5],
		rhythm: parsedValue[6],
		key: parsedValue[7],
		mode: parsedValue[8],
		part: parseInt(parsedValue[9]),
		commonness: parsedValue[10],
		difficulty: parsedValue[11],
		range: parsedValue[12],
		spotify: parsedValue[14],
		instrument: parsedValue[15],
		source: parsedValue[16],
		composer: parsedValue[17],
		region: parsedValue[18],
		alsoKnown: parsedValue[19]
	};

	const saveTune = async () => {
		await addDoc(collection(db, 'tunes'), saveData);
		toast.info(saveData.name + 'を保存しました。');
		sheetText = '';
	};
</script>

<svelte:head>
	<title>曲追加</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<textarea
		class="w-full"
		bind:value={sheetText}
		placeholder="ここにスプレッドシートの内容を貼り付け"
	></textarea>
	<ul>
		<li>setNo: {saveData.setNo}</li>
		<li>tuneNo: {saveData.tuneNo}</li>
		<li>name: {saveData.name}</li>
		<li>link: {saveData.link}</li>
		<li>genre: {saveData.genre}</li>
		<li>date: {saveData.date}</li>
		<li>rhythm: {saveData.rhythm}</li>
		<li>key: {saveData.key}</li>
		<li>mode: {saveData.mode}</li>
		<li>part: {saveData.part}</li>
		<li>commonness: {saveData.commonness}</li>
		<li>difficulty: {saveData.difficulty}</li>
		<li>range: {saveData.range}</li>
		<li>instrument: {saveData.instrument}</li>
		<li>spotify: {saveData.spotify}</li>
		<li>source: {saveData.source}</li>
		<li>composer: {saveData.composer}</li>
		<li>region: {saveData.region}</li>
		<li>alsoKnown: {saveData.alsoKnown}</li>
	</ul>
	<button class="p-2 rounded bg-green-900 text-white" on:click={saveTune}>保存</button>
</div>
