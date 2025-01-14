<script lang="ts">
	import { siteTitle } from '$modules/config';
	import { page } from '$app/stores';

	const title = `パスワードリセット完了 - ${siteTitle}`;
	const description = `パスワードリセットメールを送信しました。`;
	const currentPageUrl = $page.url.href;
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

<div class="min-w-md flex justify-center items-center self-center pt-20">
	<div class="flex flex-col px-4 py-6 bg-white rounded-lg shadow-md w-full max-w-md">
		<h1>パスワードリセットメール送信完了</h1>
		<p class="mt-4 text-gray-600">
			パスワードリセットのメールを送信しました。メールの内容に従ってパスワードの再設定を行ってください。
		</p>
		<p class="mt-2 text-gray-600">メールが届かない場合は、迷惑メールフォルダをご確認ください。</p>
		<div class="mt-6 text-center">
			<a href="/signin" class="text-blue-600 hover:text-blue-800"> ログインページに戻る </a>
		</div>
	</div>
</div>
