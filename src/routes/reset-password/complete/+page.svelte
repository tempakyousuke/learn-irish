<script lang="ts">
	import { t } from 'svelte-i18n';
	import { siteTitle } from '$core/config/configService';
	import { page } from '$app/state';

	const title = `${$t('password_reset_sent_title')} - ${siteTitle}`;
	const description = `パスワードリセットメールを送信しました。`;
	$: currentPageUrl = page.url.href;
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
		<h1>{$t('password_reset_sent_title')}</h1>
		<p class="mt-4 text-gray-600">
			{$t('password_reset_sent_description')}
		</p>
		<p class="mt-2 text-gray-600">{$t('check_spam_folder')}</p>
		<div class="mt-6 text-center">
			<a href="/signin" class="text-blue-600 hover:text-blue-800"> {$t('return_to_signin')} </a>
		</div>
	</div>
</div>
