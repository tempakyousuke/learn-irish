<script lang="ts">
	import type { InquiryFull, InquiryStatus } from '$core/data/models/Inquiry';
	import InquiryItem from './InquiryItem.svelte';
	import { InquiryRepository } from '$core/data/repositories/inquiryRepository';
	import { getInquiryFetchErrorMessage, isNetworkError } from '$core/utils/inquiryErrorHandling';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import { onMount } from 'svelte';

	interface Props {
		inquiries?: InquiryFull[];
		autoLoad?: boolean;
	}

	let { inquiries = $bindable([]), autoLoad = true }: Props = $props();

	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let retryCount = $state(0);
	const MAX_RETRY_COUNT = 3;

	const statusLabels: Record<InquiryStatus, string> = {
		unconfirmed: '未確認',
		in_progress: '対応中',
		completed: '対応済み',
		not_required: '対応不要'
	};

	let selectedStatus = $state<InquiryStatus | 'all'>('all');

	const filteredInquiries = $derived(
		selectedStatus === 'all' 
			? inquiries 
			: inquiries.filter(inquiry => inquiry.status === selectedStatus)
	);

	async function loadInquiries(isRetry = false) {
		if (isLoading) return;

		if (!isRetry) {
			retryCount = 0;
		}

		isLoading = true;
		error = null;

		try {
			inquiries = await InquiryRepository.getAll();
			retryCount = 0; // 成功時はリトライカウントをリセット
		} catch (err) {
			console.error('問い合わせ取得エラー:', err);
			error = getInquiryFetchErrorMessage(err);
			
			// 自動リトライ機能（ネットワークエラーの場合のみ）
			if (retryCount < MAX_RETRY_COUNT && isNetworkError(err)) {
				retryCount++;
				setTimeout(() => {
					loadInquiries(true);
				}, 2000 * retryCount); // 指数バックオフ
			}
		} finally {
			isLoading = false;
		}
	}



	/**
	 * 手動リトライ
	 */
	function retryLoad() {
		retryCount = 0;
		loadInquiries();
	}

	function handleStatusUpdate(id: string, newStatus: InquiryStatus) {
		try {
			// Update the inquiry in the local array
			const index = inquiries.findIndex(inquiry => inquiry.id === id);
			if (index !== -1) {
				inquiries[index].status = newStatus;
				inquiries = [...inquiries]; // Trigger reactivity
			}
		} catch (err) {
			console.error('ステータス更新の反映エラー:', err);
			// UI上のエラーは InquiryItem で処理されるため、ここでは何もしない
		}
	}

	/**
	 * ステータス更新エラー時のハンドラ
	 */
	function handleStatusUpdateError(errorMessage: string) {
		error = errorMessage;
	}

	function getStatusCount(status: InquiryStatus): number {
		return inquiries.filter(inquiry => inquiry.status === status).length;
	}

	onMount(() => {
		if (autoLoad) {
			loadInquiries();
		}
	});
</script>

<div class="space-y-6">
	<!-- Header with filter and stats -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
			<h2 class="text-2xl font-bold text-gray-800">問い合わせ管理</h2>
			<div class="flex gap-2">
				<button
					class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
					disabled={isLoading}
					onclick={() => loadInquiries()}
				>
					{isLoading ? '読み込み中...' : '更新'}
				</button>
				{#if error && retryCount < MAX_RETRY_COUNT}
					<button
						class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
						disabled={isLoading}
						onclick={retryLoad}
					>
						再試行
					</button>
				{/if}
			</div>
		</div>

		<!-- Status filter -->
		<div class="flex flex-wrap gap-2 mb-4">
			<button
				class="px-3 py-1 rounded-full text-sm font-medium transition-colors {selectedStatus === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
				onclick={() => selectedStatus = 'all'}
			>
				すべて ({inquiries.length})
			</button>
			{#each Object.entries(statusLabels) as [status, label]}
				<button
					class="px-3 py-1 rounded-full text-sm font-medium transition-colors {selectedStatus === status ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
					onclick={() => selectedStatus = status as InquiryStatus}
				>
					{label} ({getStatusCount(status as InquiryStatus)})
				</button>
			{/each}
		</div>

		<!-- Summary stats -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
			{#each Object.entries(statusLabels) as [status, label]}
				<div class="bg-gray-50 rounded-lg p-3">
					<div class="text-2xl font-bold text-gray-800">
						{getStatusCount(status as InquiryStatus)}
					</div>
					<div class="text-sm text-gray-600">{label}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Error message -->
	<ErrorMessage bind:message={error} dismissable={true} type="error" />
	
	{#if error && retryCount > 0 && retryCount < MAX_RETRY_COUNT}
		<div class="bg-blue-100 border border-blue-300 rounded-lg p-4 text-blue-700 mb-4">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
				</svg>
				自動再試行中... ({retryCount}/{MAX_RETRY_COUNT})
			</div>
		</div>
	{/if}

	<!-- Loading state -->
	{#if isLoading}
		<div class="text-center py-8">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
			<p class="mt-2 text-gray-600">問い合わせを読み込み中...</p>
		</div>
	{/if}

	<!-- Inquiry list -->
	{#if !isLoading}
		{#if filteredInquiries.length === 0}
			<div class="text-center py-8 bg-white rounded-lg shadow-md">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"></path>
				</svg>
				<p class="mt-2 text-gray-600">
					{selectedStatus === 'all' ? '問い合わせがありません' : `${statusLabels[selectedStatus as InquiryStatus]}の問い合わせがありません`}
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each filteredInquiries as inquiry (inquiry.id)}
					<InquiryItem 
						{inquiry} 
						onStatusUpdate={handleStatusUpdate}
						onStatusUpdateError={handleStatusUpdateError}
					/>
				{/each}
			</div>
		{/if}
	{/if}
</div>