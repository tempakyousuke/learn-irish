<script lang="ts">
	import { t } from 'svelte-i18n';
	import Button from '$lib/button/Button.svelte';

	const { currentPage, totalPages, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange } =
		$props<{
			currentPage: number;
			totalPages: number;
			itemsPerPage: number;
			totalItems: number;
			onPageChange: (page: number) => void;
			onItemsPerPageChange: (itemsPerPage: number) => void;
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

	const visiblePages = $derived(() => {
		const pages: (number | string)[] = [];
		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, currentPage + 2);

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
	class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-lg shadow-md"
>
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

	<div class="flex items-center gap-2">
		<Button
			buttonClass="px-3 py-1 text-sm"
			bgColorClass="bg-teal-600"
			disabled={currentPage === 1}
			on:click={() => handlePageChange(currentPage - 1)}
		>
			{$t('previous')}
		</Button>

		<div class="flex items-center gap-1">
			{#each visiblePages() as page}
				{#if page === '...'}
					<span class="px-2 py-1 text-gray-400">...</span>
				{:else}
					<Button
						buttonClass="px-3 py-1 text-sm min-w-[40px]"
						bgColorClass={currentPage === (page as number) ? 'bg-teal-600' : 'bg-gray-200'}
						textColorClass={currentPage === (page as number) ? 'text-white' : 'text-gray-700'}
						on:click={() => handlePageChange(page as number)}
					>
						{page}
					</Button>
				{/if}
			{/each}
		</div>

		<Button
			buttonClass="px-3 py-1 text-sm"
			bgColorClass="bg-teal-600"
			disabled={currentPage === totalPages}
			on:click={() => handlePageChange(currentPage + 1)}
		>
			{$t('next')}
		</Button>
	</div>

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
