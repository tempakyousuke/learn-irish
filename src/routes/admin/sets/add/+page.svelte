<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$core/store/userStore';
	import { SetRepository } from '$data/repositories/setRepository';
	import { TuneSetRepository } from '$data/repositories/tuneSetRepository';
	import SetForm from '$lib/forms/SetForm.svelte';
	import { toast } from 'svelte-sonner';

	let user: any = null;
	let isAdmin = false;
	let saving = false;

	// 管理者チェック（あなたのUID）
	const ADMIN_UID = 'dci2JB1vI3VYruel4U6L6q7N0As1';

	userStore.subscribe((value) => {
		user = value;
		isAdmin = value.uid === ADMIN_UID;
	});

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

{#if !user}
	<div class="max-w-2xl mx-auto p-6">
		<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
			ログインしてください
		</div>
	</div>
{:else if !isAdmin}
	<div class="max-w-2xl mx-auto p-6">
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
			管理者権限が必要です
		</div>
	</div>
{:else}
	<div class="max-w-6xl mx-auto p-6">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-teal-800 mb-2">新しいセット作成</h1>
			<nav class="text-sm text-gray-600">
				<a href="/admin/sets" class="hover:text-teal-600">セット管理</a>
				<span class="mx-2">></span>
				<span>新規作成</span>
			</nav>
		</div>

		{#if saving}
			<div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
				セットを作成中です...
			</div>
		{/if}

		<SetForm
			mode="create"
			on:submit={handleSubmit}
			on:cancel={handleCancel}
		/>
	</div>
{/if}