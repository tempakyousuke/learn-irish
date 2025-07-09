<script lang="ts">
	import type { Tune } from '$core/data/models/Tune';
	import { getFirestore, doc, updateDoc } from 'firebase/firestore';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/button/Button.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	export let data: {
		tune: Tune;
	};
	const tune = data.tune;
	
	let errorMessage = '';
	
	const submit = async (event: Event) => {
		event.preventDefault();
		
		console.log('Submit function called');
		console.log('Current tune data:', tune);
		
		// 必須フィールドの検証
		if (!tune.name || tune.name.trim() === '') {
			errorMessage = '曲名は必須です';
			return;
		}
		
		if (!tune.tuneNo || tune.tuneNo <= 0) {
			errorMessage = '曲番号は1以上の数値を入力してください';
			return;
		}
		
		try {
			console.log('Attempting to update document...');
			const ref = doc(db, 'tunes', tune.id);
			// Firestore用にオブジェクトを変換（idを除外）
			const { id, ...tuneData } = tune;
			console.log('Data to update:', tuneData);
			
			await updateDoc(ref, tuneData);
			console.log('Update successful');
			errorMessage = '';
			toast.success('更新が完了しました');
			goto('/admin/tunes');
		} catch (error) {
			console.error('更新エラー:', error);
			errorMessage = '更新中にエラーが発生しました';
		}
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
	<form on:submit={submit}>
		{#if errorMessage}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{errorMessage}
			</div>
		{/if}
		
		<h2 class="text-xl font-bold mb-4">基本情報</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.tuneNo} label="曲番号" type="number" />
			<Input bind:value={tune.name} label="曲名" />
		</div>

		<h2 class="text-xl font-bold mb-4">音楽的特性</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.rhythm} label="リズム" />
			<Input bind:value={tune.key} label="調" />
			<Input bind:value={tune.mode} label="調性" />
			<Input bind:value={tune.part} label="パート数" />
		</div>

		<h2 class="text-xl font-bold mb-4">メタ情報</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.setNo} label="セット番号" />
			<Input bind:value={tune.genre} label="ジャンル" />
			<Input bind:value={tune.date} label="日付" />
			<Input bind:value={tune.instrument} label="楽器" />
			<Input bind:value={tune.composer} label="作曲者" />
			<Input bind:value={tune.region} label="地域" />
			<Input bind:value={tune.alsoKnown} label="別名" />
		</div>

		<h2 class="text-xl font-bold mb-4">外部リンク</h2>
		<div class="grid grid-cols-1 gap-4 mb-6">
			<Input bind:value={tune.link} label="YouTube等のリンク" />
			<Input bind:value={tune.spotify} label="Spotifyリンク" />
			<Input bind:value={tune.source} label="楽譜等のソース" />
		</div>

		<Button className="mt-6" type="submit">更新</Button>
	</form>
</div>
