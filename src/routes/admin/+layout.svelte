<script lang="ts">
	import { userStore, type LoginUser } from '$core/store/userStore';
	import { authLoaded } from '$core/auth/authService';
	import AdminBreadcrumb from '$lib/components/navigation/AdminBreadcrumb.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import { getAuthenticationErrorMessage } from '$core/utils/inquiryErrorHandling';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const ADMIN_UID = 'dci2JB1vI3VYruel4U6L6q7N0As1';

	let user = $state<LoginUser | null>(null);
	let authLoadedState = $state(false);
	let isAdmin = $derived(user?.uid === ADMIN_UID);
	let authError = $state<string | null>(null);

	$effect(() => {
		const unsubscribeUser = userStore.subscribe((value) => {
			user = value;
		});

		const unsubscribeAuthLoaded = authLoaded.subscribe((loaded) => {
			authLoadedState = loaded;
		});

		return () => {
			unsubscribeUser();
			unsubscribeAuthLoaded();
		};
	});

	$effect(() => {
		// 認証状態が読み込まれた後にエラーメッセージを設定
		if (authLoadedState) {
			if (!user?.isLoggedIn) {
				authError = getAuthenticationErrorMessage('admin');
			} else if (!isAdmin) {
				authError = '管理者権限が必要です。このページにアクセスする権限がありません。';
			} else {
				authError = null;
			}
		}
	});
</script>

{#if !authLoadedState}
	<!-- 認証状態の読み込み中 -->
	<div class="flex justify-center items-center min-h-[400px]">
		<div class="text-gray-600">認証状態を確認中...</div>
	</div>
{:else if !user?.isLoggedIn}
	<!-- 未ログインユーザー -->
	<div class="max-w-2xl mx-auto p-6">
		<ErrorMessage message={authError} type="warning" />
		<div class="mt-4 text-center">
			<a
				href="/signin"
				class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				ログイン
			</a>
		</div>
	</div>
{:else if !isAdmin}
	<!-- 管理者権限なし -->
	<div class="max-w-2xl mx-auto p-6">
		<ErrorMessage message={authError} type="error" />
		<div class="mt-4 text-center">
			<a
				href="/"
				class="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
			>
				ホームに戻る
			</a>
		</div>
	</div>
{:else}
	<!-- 管理者ユーザー -->
	<div class="container mx-auto p-4">
		<AdminBreadcrumb />
		{@render children()}
	</div>
{/if}
