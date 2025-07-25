<script lang="ts">
	import { t } from 'svelte-i18n';
	import Button from '$lib/components/ui/Button.svelte';

	const {
		currentPage,
		totalPages,
		itemsPerPage,
		totalItems,
		onPageChange,
		onItemsPerPageChange,
		compact = false
	} = $props<{
		currentPage: number;
		totalPages: number;
		itemsPerPage: number;
		totalItems: number;
		onPageChange: (page: number) => void;
		onItemsPerPageChange: (itemsPerPage: number) => void;
		compact?: boolean; // コンパクト表示フラグ（上部用）
	}>();

	const pageOptions = [10, 20, 50, 100];

	function handlePageChange(newPage: number) {
		if (newPage >= 1 && newPage <= totalPages) {
			onPageChange(newPage);
		}
	}

	function handleItemsPerPageChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newItemsPerPage = parseInt(target.value);
		onItemsPerPageChange(newItemsPerPage);
	}

	// モバイル用のページ表示数を調整
	const visiblePages = $derived(() => {
		const pages: (number | string)[] = [];
		const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
		const maxPages = isMobile ? 1 : 2; // モバイルでは現在ページの前後1つずつ、デスクトップでは2つずつ

		const start = Math.max(1, currentPage - maxPages);
		const end = Math.min(totalPages, currentPage + maxPages);

		if (start > 1) {
			pages.push(1);
			if (start > 2) {
				pages.push('...');
			}
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) {
				pages.push('...');
			}
			pages.push(totalPages);
		}

		return pages;
	});
</script>

<div
	class="flex flex-col gap-4 mt-6 mx-auto p-4 bg-white rounded-lg shadow-md max-w-[1280px] w-full overflow-hidden"
>
	{#if !compact}
		<!-- モバイル: 表示件数選択とページ情報を上に配置 -->
		<div class="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600">{$t('items_per_page')}:</span>
				<select
					class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
					value={itemsPerPage}
					onchange={handleItemsPerPageChange}
				>
					{#each pageOptions as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</div>

			<div class="text-sm text-gray-600 text-center sm:text-right">
				{$t('showing_items', {
					values: {
						from: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
						to: Math.min(currentPage * itemsPerPage, totalItems),
						total: totalItems
					}
				})}
			</div>
		</div>
	{:else}
		<!-- コンパクト表示：ページ情報のみ -->
		<div class="text-center">
			<div class="text-sm text-gray-600">
				{$t('showing_items', {
					values: {
						from: totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
						to: Math.min(currentPage * itemsPerPage, totalItems),
						total: totalItems
					}
				})}
			</div>
		</div>
	{/if}

	<!-- ページネーション controls -->
	<div class="flex items-center justify-center gap-1 sm:gap-2 w-full">
		<Button
			buttonClass="px-2 sm:px-3 py-1 text-xs sm:text-sm flex-shrink-0 rounded-md"
			bgColorClass="bg-teal-600 hover:bg-teal-500"
			disabled={currentPage === 1}
			on:click={() => handlePageChange(currentPage - 1)}
		>
			{$t('previous')}
		</Button>

		<div class="flex items-center gap-1 overflow-x-auto max-w-full px-2">
			{#each visiblePages() as page}
				{#if page === '...'}
					<span class="px-1 sm:px-2 py-1 text-gray-400 text-xs sm:text-sm flex-shrink-0">...</span>
				{:else}
					<Button
						buttonClass="px-2 sm:px-3 py-1 text-xs sm:text-sm min-w-[32px] sm:min-w-[40px] flex-shrink-0 rounded-md"
						bgColorClass={currentPage !== (page as number)
							? 'bg-teal-600 hover:bg-teal-500'
							: 'bg-gray-200'}
						textColorClass={currentPage !== (page as number) ? 'text-white' : 'text-gray-700'}
						on:click={() => handlePageChange(page as number)}
					>
						{page}
					</Button>
				{/if}
			{/each}
		</div>

		<Button
			buttonClass="px-2 sm:px-3 py-1 text-xs sm:text-sm flex-shrink-0 rounded-md"
			bgColorClass="bg-teal-600 hover:bg-teal-500"
			disabled={currentPage === totalPages}
			on:click={() => handlePageChange(currentPage + 1)}
		>
			{$t('next')}
		</Button>
	</div>
</div>
