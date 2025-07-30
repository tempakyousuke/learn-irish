<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { SetRepository } from '$core/data/repositories/setRepository';
	import { TuneSetRepository } from '$core/data/repositories/tuneSetRepository';
	import SetForm from '$lib/forms/SetForm.svelte';
	import type { SetFull } from '$core/data/models/Set';
	import { toast } from 'svelte-sonner';

	const { data }: { data: { set: SetFull } } = $props();

	let saving = $state(false);

	type SetFormPayload = { setData: any; tuneIds: string[] };

	const handleSubmit = async (payload: SetFormPayload) => {
		if (saving) return;

		saving = true;

		try {
			const { setData, tuneIds } = payload;

			// セットの基本情報を更新
			await SetRepository.updateSet(data.set.id, {
				name: setData.name,
				videoLink: setData.videoLink,
				description: setData.description,
				setNo: setData.setNo,
				tuneIds,
				tuneCount: tuneIds.length
			});

			// 既存の曲-セット関係性を全て削除
			await TuneSetRepository.removeAllTunesFromSet(data.set.id);

			// 新しい曲-セット関係性を一括作成
			if (tuneIds.length > 0) {
				await TuneSetRepository.addTunesToSet(data.set.id, tuneIds);
			}

			toast.success($t('set_updated'));
			goto('/admin-k7m3x9q2/sets');
		} catch (error) {
			console.error($t('set_update_error'), error);
			toast.error($t('set_update_failed'));
		} finally {
			saving = false;
		}
	};

	const handleCancel = () => {
		goto('/admin-k7m3x9q2/sets');
	};
</script>

<svelte:head>
	<title>セット編集: {data.set.name} - Learn Irish</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-teal-800 mb-2">セット編集: {data.set.name}</h1>
		<nav class="text-sm text-gray-600">
			<a href="/admin-k7m3x9q2/sets" class="hover:text-teal-600">セット管理</a>
			<span class="mx-2">></span>
			<span>編集</span>
		</nav>
	</div>

	{#if saving}
		<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
			セットを更新中です...
		</div>
	{/if}

	<SetForm set={data.set} mode="edit" onSubmit={handleSubmit} onCancel={handleCancel} />
</div>
