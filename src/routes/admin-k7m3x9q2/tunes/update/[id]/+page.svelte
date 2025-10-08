<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '$core/data/models/Tune';
	import { getFirestore, doc, updateDoc } from 'firebase/firestore';
	import Input from '$lib/forms/Input.svelte';
	import Textarea from '$lib/forms/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	// Firestoreのインスタンスを取得
	const db = getFirestore();

	let { data }: { data: { tune: Tune } } = $props();
	let tune = $state(data.tune);

	// theSessionは既存データでは未定義の可能性があるため空文字に正規化
	tune.theSession ??= '';

	let errorMessage = $state('');

	const submit = async (event: Event) => {
		event.preventDefault();

		// 必須フィールドの検証
		if (!tune.name || tune.name.trim() === '') {
			errorMessage = $t('tune_name_required');
			return;
		}

		if (!tune.tuneNo || tune.tuneNo <= 0) {
			errorMessage = $t('tune_number_invalid');
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
			toast.success($t('update_completed'));
			goto('/admin-k7m3x9q2/tunes');
		} catch (error) {
			console.error($t('update_error'), error);
			errorMessage = $t('update_failed');
		}
	};
</script>

<svelte:head>
	<title>Practicing Irish tunes with hatao's YouTube</title>
	<meta
		name="description"
		content="このサイトはhataoさんがyoutubeにあげている「Learn an Irish Tune Every
		Day」の動画を探しやすくし、練習の進捗を記録できるようにしたサイトです。"
	/>
</svelte:head>

<div>
	<form onsubmit={submit}>
		{#if errorMessage}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{errorMessage}
			</div>
		{/if}

		<h2 class="text-xl font-bold mb-4">基本情報</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.tuneNo} label={$t('tune_number')} type="number" />
			<Input bind:value={tune.name} label={$t('tune_name_label')} />
		</div>

		<h2 class="text-xl font-bold mb-4">音楽的特性</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.rhythm} label={$t('rhythm')} />
			<Input bind:value={tune.key} label={$t('key_label')} />
			<Input bind:value={tune.mode} label={$t('mode_label')} />
			<Input bind:value={tune.part} label={$t('part_count')} />
		</div>

		<h2 class="text-xl font-bold mb-4">メタ情報</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
			<Input bind:value={tune.setNo} label={$t('set_number')} />
			<Input bind:value={tune.genre} label={$t('genre')} />
			<Input bind:value={tune.date} label={$t('date')} />
			<Input bind:value={tune.instrument} label={$t('instrument')} />
			<Input bind:value={tune.composer} label={$t('composer')} />
			<Input bind:value={tune.region} label={$t('region')} />
			<Textarea bind:value={tune.alsoKnown} label={$t('also_known')} rows={3} />
		</div>

		<h2 class="text-xl font-bold mb-4">外部リンク</h2>
		<div class="grid grid-cols-1 gap-4 mb-6">
			<Input bind:value={tune.link} label={$t('youtube_link')} />
			<Input bind:value={tune.spotify} label={$t('spotify_link')} />
			<Input bind:value={tune.source} label={$t('source')} />
			<div>
				<Input bind:value={tune.theSession} label={$t('the_session_link')} />
				{#if (tune.theSession || '').trim()}
					<div class="mt-1">
						<a
							href={(($) => {
								const raw = ((tune.theSession || '') as string).trim();
								if (!raw) return '';
								if (/^https?:\/\//.test(raw)) return raw;
								if (raw.startsWith('/')) return `https://thesession.org${raw}`;
								if (raw.startsWith('thesession.org')) return `https://${raw}`;
								return raw;
							})(null)}
							target="_blank"
							rel="noopener noreferrer"
							class="text-teal-600 hover:text-teal-800 underline text-sm"
						>
							{$t('open_in_new_tab')}
						</a>
					</div>
				{:else if (tune.name || '').trim()}
					<div class="mt-1">
						<a
							href={`https://thesession.org/tunes/search?q=${encodeURIComponent(tune.name)}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-teal-600 hover:text-teal-800 underline text-sm"
						>
							{$t('search_on_the_session')}
						</a>
					</div>
				{/if}
			</div>
		</div>

		<Button className="mt-6" type="submit">更新</Button>
	</form>
</div>
