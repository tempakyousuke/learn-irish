<script lang="ts">
	import { userStore, type LoginUser } from '$core/store/userStore';
	import AdminBreadcrumb from '$lib/components/AdminBreadcrumb.svelte';

	const ADMIN_UID = 'dci2JB1vI3VYruel4U6L6q7N0As1';

	let user = $state<LoginUser | null>(null);
	let isAdmin = $derived(user?.uid === ADMIN_UID);

	$effect(() => {
		const unsubscribe = userStore.subscribe((value) => {
			user = value;
		});

		return unsubscribe;
	});
</script>

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
	<div class="container mx-auto p-4">
		<AdminBreadcrumb />
		<slot />
	</div>
{/if}
