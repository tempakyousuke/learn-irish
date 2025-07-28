<script lang="ts">
	import InquiryList from '$lib/features/inquiry/InquiryList.svelte';
</script>

<svelte:head>
	<title>問い合わせ管理 - Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-teal-800">問い合わせ管理</h1>
	</div>

	<InquiryList />
</div>