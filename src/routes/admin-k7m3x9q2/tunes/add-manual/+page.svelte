<script lang="ts">
	import { t } from 'svelte-i18n';
	import { db } from '$core/data/firebase/firebaseClient';
	import { addDoc, collection } from 'firebase/firestore';
	import { toast } from 'svelte-sonner';
	import type { Tune } from '$core/data/models';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// フォームの初期値
	const initialForm: Omit<Tune, 'id'> = {
		setNo: '',
		tuneNo: 0,
		name: '',
		link: '',
		genre: '',
		date: '',
		rhythm: '',
		key: '',
		mode: '',
		part: '',
		spotify: '',
		instrument: '',
		source: '',
		composer: '',
		region: '',
		alsoKnown: ''
	};

	let form: Omit<Tune, 'id'> = $state({ ...initialForm });

	const resetForm = () => {
		form = { ...initialForm };
	};

	// バリデーション
	function getNameError(): string {
		return form.name.trim() === '' ? $t('required') : '';
	}
	function getTuneNoError(): string {
		const n = Number(form.tuneNo);
		if (!Number.isFinite(n)) return $t('invalid_number');
		if (n < 0) return $t('invalid_number');
		return '';
	}
	const isValid = $derived(() => getNameError() === '' && getTuneNoError() === '');

	const saveTune = async () => {
		if (!isValid) {
			toast.error($t('validation_error'));
			return;
		}
		try {
			const payload: Omit<Tune, 'id'> = {
				...form,
				// 念のため数値化
				tuneNo: Number(form.tuneNo)
			};
			await addDoc(collection(db, 'tunes'), payload);
			toast.success(`${form.name}を保存しました。`);
			resetForm();
		} catch (error) {
			toast.error($t('save_error'));
			console.error(error);
		}
	};
</script>

<svelte:head>
	<title>曲追加（フォーム）</title>
	<meta name="description" content="Add a new tune by form" />
</svelte:head>

<div class="space-y-8">
	<h2 class="text-2xl font-bold">{$t('add_new_tune')}</h2>

	<div class="space-y-6">
		<div>
			<h3 class="text-lg font-semibold mb-3">基本情報</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					bind:value={form.tuneNo}
					label={$t('tune_number')}
					type="number"
					error={getTuneNoError()}
				/>
				<Input bind:value={form.name} label={$t('tune_name_label')} error={getNameError()} />
			</div>
		</div>

		<div>
			<h3 class="text-lg font-semibold mb-3">音楽的特性</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input bind:value={form.rhythm} label={$t('rhythm')} />
				<Input bind:value={form.key} label={$t('key_label')} />
				<Input bind:value={form.mode} label={$t('mode_label')} />
				<Input bind:value={form.part} label={$t('part_count')} />
			</div>
		</div>

		<div>
			<h3 class="text-lg font-semibold mb-3">メタ情報</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input bind:value={form.setNo} label={$t('set_number')} />
				<Input bind:value={form.genre} label={$t('genre')} />
				<Input bind:value={form.date} label={$t('date')} />
				<Input bind:value={form.instrument} label={$t('instrument')} />
				<Input bind:value={form.composer} label={$t('composer')} />
				<Input bind:value={form.region} label={$t('region')} />
				<Input bind:value={form.alsoKnown} label={$t('also_known')} />
			</div>
		</div>

		<div>
			<h3 class="text-lg font-semibold mb-3">外部リンク</h3>
			<div class="grid grid-cols-1 gap-4">
				<Input bind:value={form.link} label={$t('youtube_link')} />
				<Input bind:value={form.spotify} label={$t('spotify_link')} />
				<Input bind:value={form.source} label={$t('source')} />
			</div>
		</div>

		<div class="flex items-center gap-3 justify-end">
			<Button onclick={resetForm} bgColorClass="bg-gray-200" textColorClass="text-gray-800">
				リセット
			</Button>
			<Button onclick={saveTune} disabled={!isValid}>保存</Button>
		</div>
	</div>
</div>
