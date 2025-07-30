<script lang="ts">
	import { userStore } from '$core/store/userStore';
	import { isAuthenticated, authLoaded } from '$core/auth/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import InquiryForm from '$lib/forms/InquiryForm.svelte';
	import { siteTitle } from '$core/config/configService';
	import { page } from '$app/state';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import { getAuthenticationErrorMessage } from '$core/utils/inquiryErrorHandling';
	import { _ } from 'svelte-i18n';

	// ページメタデータ
	const title = $derived(`${$_('contact_page_title')} - ${siteTitle}`);
	const description = $derived($_('contact_page_description'));
	const currentPageUrl = $derived(page.url.href);

	// フォーム送信成功時の状態管理
	let showSuccessMessage = $state(false);

	// エラー状態管理
	let authError = $state<string | null>(null);
	let pageError = $state<string | null>(null);

	/**
	 * 認証状態をチェックし、未ログインの場合はサインインページにリダイレクト
	 */
	function checkAuthAndRedirect() {
		// 認証状態の読み込みが完了していない場合は待機
		if (!$authLoaded) {
			return;
		}

		// ログインしていない場合はサインインページにリダイレクト
		if (!$isAuthenticated) {
			authError = getAuthenticationErrorMessage('contact') + ' ログインページに移動します。';
			// 少し遅延してからリダイレクト（エラーメッセージを表示するため）
			setTimeout(() => {
				goto('/signin');
			}, 2000);
		} else {
			// ログイン済みの場合はエラーをクリア
			authError = null;
		}
	}

	/**
	 * フォーム送信成功時のハンドラ
	 */
	function handleSubmitSuccess() {
		showSuccessMessage = true;
		pageError = null; // 成功時はページエラーをクリア
		// 3秒後に成功メッセージを自動で非表示にする
		setTimeout(() => {
			showSuccessMessage = false;
		}, 3000);
	}

	/**
	 * フォーム送信エラー時のハンドラ
	 */
	function handleSubmitError(error: string) {
		pageError = error;
		showSuccessMessage = false;
	}

	/**
	 * 成功メッセージを手動で閉じる
	 */
	function dismissSuccessMessage() {
		showSuccessMessage = false;
	}

	// 認証状態の変更を監視
	$effect(() => {
		checkAuthAndRedirect();
	});

	// コンポーネントマウント時の処理
	onMount(() => {
		try {
			checkAuthAndRedirect();
		} catch (error) {
			console.error('認証チェックエラー:', error);
			pageError = '認証状態の確認に失敗しました。ページを再読み込みしてください。';
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={currentPageUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<!-- 認証状態の読み込み中 -->
{#if !$authLoaded}
	<div class="flex justify-center items-center min-h-[400px]">
		<div class="text-gray-600">{$_('loading_message')}</div>
	</div>
{:else if $isAuthenticated}
	<!-- 認証済みユーザー向けのコンテンツ -->
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- ページヘッダー -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-4">{$_('contact_page_title')}</h1>
			<p class="text-gray-600">{$_('contact_page_description')}</p>
		</div>

		<!-- 認証エラーメッセージ -->
		<ErrorMessage bind:message={authError} dismissable={true} type="warning" />

		<!-- ページエラーメッセージ -->
		<ErrorMessage bind:message={pageError} dismissable={true} type="error" />

		<!-- 送信完了メッセージ -->
		{#if showSuccessMessage}
			<div class="mb-8 p-6 bg-green-100 border border-green-200 rounded-lg text-green-800">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-lg font-semibold mb-2">{$_('contact_form_success_title')}</h2>
						<p class="mb-2">{$_('contact_form_success_message')}</p>
						<p class="text-sm">
							{$_('contact_form_success_note')}
						</p>
					</div>
					<button
						onclick={dismissSuccessMessage}
						class="ml-4 text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
						aria-label={$_('close_message_label')}
					>
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							></path>
						</svg>
					</button>
				</div>
			</div>
		{/if}

		<!-- 免責事項 -->
		<div class="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
			<h2 class="text-lg font-semibold text-yellow-800 mb-3">{$_('usage_guidelines_title')}</h2>
			<ul class="text-yellow-700 space-y-2">
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>{$_('no_individual_replies')}</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>{$_('not_all_requests_handled')}</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>{$_('content_used_for_improvement')}</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>{$_('bug_report_details')}</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>{$_('browser_update_notice')}</span>
				</li>
			</ul>
		</div>

		<!-- 問い合わせフォーム -->
		<div class="bg-white shadow-sm rounded-lg p-6">
			<InquiryForm onSubmitSuccess={handleSubmitSuccess} onSubmitError={handleSubmitError} />
		</div>
	</div>
{:else}
	<!-- 未認証ユーザー（通常はリダイレクトされるため表示されない） -->
	<div class="flex justify-center items-center min-h-[400px]">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">{$_('login_required_title')}</h2>
			<p class="text-gray-600 mb-6">{$_('login_required_message')}</p>
			<a
				href="/signin"
				class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				{$_('login_button')}
			</a>
		</div>
	</div>
{/if}
