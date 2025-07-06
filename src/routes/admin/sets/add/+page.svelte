<script lang="ts">
	import { goto } from '$app/navigation';
	import { SetRepository } from '$data/repositories/setRepository';
	import { TuneSetRepository } from '$data/repositories/tuneSetRepository';
	import SetForm from '$lib/forms/SetForm.svelte';
	import { toast } from 'svelte-sonner';

	let saving = $state(false);

	const handleSubmit = async (event: CustomEvent) => {
		if (saving) return;

		saving = true;

		try {
			const { setData, tuneIds } = event.detail;

			// セットを作成
			const setId = await SetRepository.addSet(
				{
					id: '', // 自動生成
					name: setData.name,
					videoLink: setData.videoLink
				},
				{
					tuneIds,
					tuneCount: tuneIds.length
				},
				{
					description: setData.description,
					setNo: setData.setNo
				}
			);

			// 曲-セット関係性を一括作成
			await TuneSetRepository.addTunesToSet(setId, tuneIds);

			toast.success('セットを作成しました');
			goto('/admin/sets');
		} catch (error) {
			console.error('セット作成エラー:', error);
			toast.error('セットの作成に失敗しました');
		} finally {
			saving = false;
		}
	};

	const handleCancel = () => {
		goto('/admin/sets');
	};
</script>

<svelte:head>
	<title>新しいセット作成 - Learn Irish</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	{#if saving}
		<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
			セットを作成中です...
		</div>
	{/if}

	<SetForm mode="create" on:submit={handleSubmit} on:cancel={handleCancel} />
</div>
