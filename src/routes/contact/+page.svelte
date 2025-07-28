<script lang="ts">
	import { userStore } from '$core/store/userStore';
	import { isAuthenticated, authLoaded } from '$core/auth/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import InquiryForm from '$lib/forms/InquiryForm.svelte';
	import { siteTitle } from '$core/config/configService';
	import { page } from '$app/state';

	// ページメタデータ
	const title = `問い合わせ - ${siteTitle}`;
	const description = '意見・要望・不具合報告をお送りください。';
	const currentPageUrl = $derived(page.url.href);

	// フォーム送信成功時の状態管理
	let showSuccessMessage = $state(false);

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
			goto('/signin');
		}
	}

	/**
	 * フォーム送信成功時のハンドラ
	 */
	function handleSubmitSuccess() {
		showSuccessMessage = true;
		// 3秒後に成功メッセージを自動で非表示にする
		setTimeout(() => {
			showSuccessMessage = false;
		}, 3000);
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
		checkAuthAndRedirect();
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
		<div class="text-gray-600">読み込み中...</div>
	</div>
{:else if $isAuthenticated}
	<!-- 認証済みユーザー向けのコンテンツ -->
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- ページヘッダー -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-4">問い合わせ</h1>
			<p class="text-gray-600">
				システムに関するご意見、ご要望、不具合報告をお送りください。
			</p>
		</div>

		<!-- 送信完了メッセージ -->
		{#if showSuccessMessage}
			<div class="mb-8 p-6 bg-green-100 border border-green-200 rounded-lg text-green-800">
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-lg font-semibold mb-2">送信完了</h2>
						<p class="mb-2">問い合わせを送信いたしました。ご協力ありがとうございます。</p>
						<p class="text-sm">
							送信された内容は管理者が確認いたします。個別の返信は行っておりませんので、予めご了承ください。
						</p>
					</div>
					<button
						onclick={dismissSuccessMessage}
						class="ml-4 text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
						aria-label="メッセージを閉じる"
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
			<h2 class="text-lg font-semibold text-yellow-800 mb-3">ご利用にあたってのお願い</h2>
			<ul class="text-yellow-700 space-y-2">
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>問い合わせに対する個別の返信は行っておりません</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>すべての問い合わせに対応できるわけではありません</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>送信された内容は管理者が確認し、システム改善の参考とさせていただきます</span>
				</li>
				<li class="flex items-start">
					<span class="text-yellow-600 mr-2 mt-1">•</span>
					<span>不具合報告の際は、発生状況を詳しくお書きください</span>
				</li>
			</ul>
		</div>

		<!-- 問い合わせフォーム -->
		<div class="bg-white shadow-sm rounded-lg p-6">
			<InquiryForm onSubmitSuccess={handleSubmitSuccess} />
		</div>
	</div>
{:else}
	<!-- 未認証ユーザー（通常はリダイレクトされるため表示されない） -->
	<div class="flex justify-center items-center min-h-[400px]">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">ログインが必要です</h2>
			<p class="text-gray-600 mb-6">問い合わせを送信するにはログインしてください。</p>
			<a
				href="/signin"
				class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
			>
				ログイン
			</a>
		</div>
	</div>
{/if}