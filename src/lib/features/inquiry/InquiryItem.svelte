<script lang="ts">
	import type { InquiryFull, InquiryStatus } from '$core/data/models/Inquiry';
	import Button from '$lib/components/ui/Button.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import { InquiryRepository } from '$core/data/repositories/inquiryRepository';
	import { getInquiryStatusUpdateErrorMessage } from '$core/utils/inquiryErrorHandling';

	interface Props {
		inquiry: InquiryFull;
		onStatusUpdate?: (id: string, status: InquiryStatus) => void;
		onStatusUpdateError?: (error: string) => void;
	}

	let { inquiry, onStatusUpdate, onStatusUpdateError }: Props = $props();

	let isUpdating = $state(false);
	let error = $state<string | null>(null);

	const statusLabels: Record<InquiryStatus, string> = {
		unconfirmed: '未確認',
		in_progress: '対応中',
		completed: '対応済み',
		not_required: '対応不要'
	};

	const statusColors: Record<InquiryStatus, string> = {
		unconfirmed: 'bg-gray-100 text-gray-800',
		in_progress: 'bg-yellow-100 text-yellow-800',
		completed: 'bg-green-100 text-green-800',
		not_required: 'bg-blue-100 text-blue-800'
	};

	const typeLabels: Record<string, string> = {
		opinion: '意見',
		request: '要望',
		bug_report: '不具合報告'
	};

	async function updateStatus(newStatus: InquiryStatus) {
		if (isUpdating || newStatus === inquiry.status) return;

		const previousStatus = inquiry.status;
		isUpdating = true;
		error = null;

		try {
			// 楽観的UI更新
			inquiry.status = newStatus;
			onStatusUpdate?.(inquiry.id, newStatus);

			// サーバーに更新を送信
			await InquiryRepository.updateStatus(inquiry.id, newStatus);
		} catch (err) {
			console.error('ステータス更新エラー:', err);

			// エラー時は元のステータスに戻す
			inquiry.status = previousStatus;
			onStatusUpdate?.(inquiry.id, previousStatus);

			// 問い合わせ固有のエラーメッセージを生成
			const friendlyError = getInquiryStatusUpdateErrorMessage(err);
			error = friendlyError;

			// 親コンポーネントにもエラーを通知
			onStatusUpdateError?.(friendlyError);
		} finally {
			isUpdating = false;
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
	<!-- Header with status and date -->
	<div class="flex justify-between items-start mb-4">
		<div class="flex items-center gap-3">
			<span class="px-3 py-1 rounded-full text-sm font-medium {statusColors[inquiry.status]}">
				{statusLabels[inquiry.status]}
			</span>
			{#if inquiry.type}
				<span class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
					{typeLabels[inquiry.type] || inquiry.type}
				</span>
			{/if}
		</div>
		<span class="text-sm text-gray-500">
			{formatDate(inquiry.createdAt)}
		</span>
	</div>

	<!-- Content -->
	<div class="mb-4">
		<p class="text-gray-800 whitespace-pre-wrap leading-relaxed">
			{inquiry.content}
		</p>
	</div>

	<!-- User info -->
	<div class="mb-4 text-sm text-gray-600 space-y-1">
		<div>ユーザーID: {inquiry.userId}</div>
		{#if inquiry.userAgent}
			<div class="font-mono text-xs bg-gray-50 p-2 rounded border">
				<span class="font-semibold">UserAgent:</span> {inquiry.userAgent}
			</div>
		{/if}
	</div>

	<!-- Status update buttons -->
	<div class="flex flex-wrap gap-2">
		{#each Object.entries(statusLabels) as [status, label]}
			<Button
				bgColorClass={inquiry.status === status ? 'bg-teal-600' : 'bg-gray-200'}
				textColorClass={inquiry.status === status ? 'text-white' : 'text-gray-700'}
				buttonClass="text-sm"
				disabled={isUpdating}
				onclick={() => updateStatus(status as InquiryStatus)}
			>
				{label}
			</Button>
		{/each}
	</div>

	<!-- Error message -->
	{#if error}
		<div class="mt-3">
			<ErrorMessage bind:message={error} dismissable={true} type="error" />
		</div>
	{/if}

	<!-- Loading indicator -->
	{#if isUpdating}
		<div class="mt-3 text-sm text-gray-500">更新中...</div>
	{/if}
</div>
