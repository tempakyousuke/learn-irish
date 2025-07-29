<script lang="ts">
	import { t } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { SetRepository } from '$core/data/repositories/setRepository';
	import { TuneSetRepository } from '$core/data/repositories/tuneSetRepository';
	import SetForm from '$lib/forms/SetForm.svelte';
	import { toast } from 'svelte-sonner';

	let saving = $state(false);

	type SetFormPayload = { setData: any; tuneIds: string[] };

	const handleSubmit = async (payload: SetFormPayload) => {
		if (saving) return;

		saving = true;

		try {
			const { setData, tuneIds } = payload;

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

			toast.success($t('set_created'));
			goto('/admin/sets');
		} catch (error) {
			console.error($t('set_creation_error'), error);
			toast.error($t('set_creation_failed'));
		} finally {
			saving = false;
		}
	};

	const handleCancel = () => {
		goto('/admin/sets');
	};
</script>

<svelte:head>
	<title>新しいセット作成 - Practicing Irish tunes with hatao's YouTube</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
	{#if saving}
		<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
			セットを作成中です...
		</div>
	{/if}

	<SetForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
</div>
