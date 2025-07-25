<script lang="ts">
	import { page } from '$app/state';
	import { _ } from 'svelte-i18n';

	interface BreadcrumbItem {
		href: string;
		label: string;
	}

	let breadcrumbs = $state<BreadcrumbItem[]>([]);

	$effect(() => {
		const path = page.url.pathname;
		const segments = path.split('/').filter(Boolean);

		const items: BreadcrumbItem[] = [{ href: '/', label: 'ホーム' }];

		// segments = ['admin', 'sets', 'add'] の場合
		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i];
			const href = '/' + segments.slice(0, i + 1).join('/');

			let label = segment;
			if (segment === 'admin') {
				label = '管理者';
			} else if (segment === 'tunes') {
				label = '曲管理';
			} else if (segment === 'sets') {
				label = 'セット管理';
			} else if (segment === 'add') {
				label = '追加';
			} else if (segment === 'edit') {
				label = '編集';
			} else if (segment === 'update') {
				label = '更新';
			}

			items.push({ href, label });
		}

		breadcrumbs = items;
	});
</script>

<nav class="mb-6">
	<ol class="flex items-center space-x-2 text-sm text-gray-600">
		{#each breadcrumbs as item, index}
			<li class="flex items-center">
				{#if index > 0}
					<svg class="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						></path>
					</svg>
				{/if}
				{#if index === breadcrumbs.length - 1}
					<span class="text-gray-900 font-medium">{item.label}</span>
				{:else}
					<a href={item.href} class="text-blue-600 hover:text-blue-800 hover:underline">
						{item.label}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
