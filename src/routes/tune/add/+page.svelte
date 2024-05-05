<script lang="ts">
	import Papa from 'papaparse';
	import type { Tune } from '../../../types/tune';
	import { db } from '$modules/firebase';
	import { addDoc, collection } from 'firebase/firestore';
	let sheetText = '';

	$: parsedValue = sheetText.split('\t');
	$: saveData = {
		setNo: parsedValue[0],
		tuneNo: parsedValue[1],
		name: parsedValue[2],
		link: parsedValue[3],
		genre: parsedValue[4],
		date: parsedValue[5],
		rhythm: parsedValue[6],
		key: parsedValue[7],
		mode: parsedValue[8],
		part: parsedValue[9],
		instrument: parsedValue[10],
		spotify: parsedValue[11],
		source: parsedValue[12],
		composer: parsedValue[13],
		region: parsedValue[14],
		alsoKnown: parsedValue[15]
	};

	const saveTune = () => {
		addDoc(collection(db, 'tunes'), saveData);
	};
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div>
	<textarea
		class="w-full"
		bind:value={sheetText}
		placeholder="ここにスプレッドシートの内容を貼り付け"
	/>
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
		<li>instrument: {saveData.instrument}</li>
		<li>spotify: {saveData.spotify}</li>
		<li>source: {saveData.source}</li>
		<li>composer: {saveData.composer}</li>
		<li>region: {saveData.region}</li>
		<li>alsoKnown: {saveData.alsoKnown}</li>
	</ul>
	<button class="p-2 rounded bg-green-900 text-white" on:click={saveTune}>保存</button>
</div>
