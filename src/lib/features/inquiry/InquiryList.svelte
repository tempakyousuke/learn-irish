<script lang="ts">
	import type { InquiryFull, InquiryStatus } from '$core/data/models/Inquiry';
	import InquiryItem from './InquiryItem.svelte';
	import { InquiryRepository } from '$core/data/repositories/inquiryRepository';
	import { onMount } from 'svelte';

	interface Props {
		inquiries?: InquiryFull[];
		autoLoad?: boolean;
	}

	let { inquiries = $bindable([]), autoLoad = true }: Props = $props();

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	const statusLabels: Record<InquiryStatus, string> = {
		unconfirmed: '未確認',
		in_progress: '対応中',
		completed: '対応済み',
		not_required: '対応不要'
	};

	let selectedStatus = $state<InquiryStatus | 'all'>('all');

	const filteredInquiries = $derived(() => {
		if (selectedStatus === 'all') {
			return inquiries;
		}
		return inquiries.filter(inquiry => inquiry.status === selectedStatus);
	});

	async function loadInquiries() {
		if (isLoading) return;

		isLoading = true;
		error = null;

		try {
			inquiries = await InquiryRepository.getAll();
		} catch (err) {
			error = err instanceof Error ? err.message : '問い合わせの取得に失敗しました';
		} finally {
			isLoading = false;
		}
	}

	function handleStatusUpdate(id: string, newStatus: InquiryStatus) {
		// Update the inquiry in the local array
		const index = inquiries.findIndex(inquiry => inquiry.id === id);
		if (index !== -1) {
			inquiries[index].status = newStatus;
			inquiries = [...inquiries]; // Trigger reactivity
		}
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
			<button
				class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
				disabled={isLoading}
				onclick={loadInquiries}
			>
				{isLoading ? '読み込み中...' : '更新'}
			</button>
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
	{#if error}
		<div class="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
				</svg>
				{error}
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
					<InquiryItem {inquiry} onStatusUpdate={handleStatusUpdate} />
				{/each}
			</div>
		{/if}
	{/if}
</div>