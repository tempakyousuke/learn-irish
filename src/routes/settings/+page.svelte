<script lang="ts">
	import { t } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { siteTitle } from '$core/config/configService';
	import { isAuthenticated, authLoaded } from '$core/auth/authService';
	import { goto } from '$app/navigation';
	import Fa from 'svelte-fa';
	import { faUser } from '@fortawesome/free-solid-svg-icons';

	// 認証状態の監視とリダイレクト
	$: if ($authLoaded && !$isAuthenticated) {
		goto('/signin');
	}

	const title = `${$t('settings')} - ${siteTitle}`;
	const description = `${$t('settings')}ページです。`;
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

{#if $authLoaded && $isAuthenticated}
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-2xl mx-auto">
			<h1 class="text-3xl font-bold mb-8">{$t('settings')}</h1>

			<div class="space-y-4">
				<div class="bg-white rounded-lg shadow-md">
					<a
						href="/settings/account"
						class="block p-6 hover:bg-gray-50 transition-colors duration-200"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-4">
								<div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
									<Fa icon={faUser} class="text-white text-lg" />
								</div>
								<div>
									<h2 class="text-xl font-semibold">{$t('account_settings')}</h2>
									<p class="text-gray-600">{$t('manage_authentication_methods')}</p>
								</div>
							</div>
							<div class="text-gray-400">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</div>
						</div>
					</a>
				</div>
			</div>
		</div>
	</div>
{:else if $authLoaded}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1 class="text-2xl font-bold mb-4">{$t('access_restricted')}</h1>
			<p class="text-gray-600 mb-4">{$t('login_required')}</p>
			<a href="/signin" class="text-blue-600 hover:text-blue-800">{$t('go_to_signin')}</a>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<p class="text-gray-600">{$t('loading')}</p>
		</div>
	</div>
{/if}