<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { siteTitle } from '$core/config/configService';
	import { isAuthenticated, authLoaded, userId } from '$core/auth/authService';
	import {
		tableHeaderSettingsStore,
		loadSettings,
		updateSetting,
		resetToDefaults,
		clearError
	} from '$core/store/tableHeaderSettingsStore';
	import Button from '$lib/components/ui/Button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowLeft, faTable, faRedo } from '@fortawesome/free-solid-svg-icons';

	let mounted = false;

	// 認証状態の監視とリダイレクト
	$: if ($authLoaded && !$isAuthenticated) {
		goto('/signin');
	}

	// 認証済みユーザーの設定を読み込み
	$: if ($authLoaded && $isAuthenticated && $userId && mounted) {
		loadSettings($userId);
	}

	onMount(() => {
		mounted = true;
		// エラー状態をクリア
		clearError();
	});

	// 個別の列設定を切り替える
	async function toggleColumn(key: keyof typeof $tableHeaderSettingsStore.settings) {
		if (!$userId) return;
		
		const currentValue = $tableHeaderSettingsStore.settings[key];
		await updateSetting($userId, key, !currentValue);
		
		// 成功時のフィードバック
		if (!$tableHeaderSettingsStore.error) {
			toast.success($t('settings_saved'));
		}
	}

	// デフォルト設定にリセット
	async function handleResetToDefaults() {
		if (!$userId) return;
		
		await resetToDefaults($userId);
		
		if (!$tableHeaderSettingsStore.error) {
			toast.success($t('settings_reset'));
		}
	}

	// エラー表示時のトースト
	$: if ($tableHeaderSettingsStore.error) {
		toast.error($tableHeaderSettingsStore.error);
		clearError();
	}

	const title = `${$t('table_header_settings')} - ${siteTitle}`;
	const description = `${$t('table_header_settings')}ページです。`;
	$: currentPageUrl = page.url.href;

	// 列設定の定義
	const columnSettings = [
		{ key: 'rhythm', labelKey: 'column_rhythm' },
		{ key: 'key', labelKey: 'column_key' },
		{ key: 'mode', labelKey: 'column_mode' },
		{ key: 'playCount', labelKey: 'column_play_count' },
		{ key: 'todaysPlays', labelKey: 'column_todays_plays' },
		{ key: 'lastPlayedDate', labelKey: 'column_last_played' }
	] as const;
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
			<!-- Navigation breadcrumb and back button -->
			<div class="mb-6">
				<Button
					href="/settings"
					bgColorClass="bg-gray-100"
					textColorClass="text-gray-700"
					className="mb-4"
				>
					<Fa icon={faArrowLeft} class="mr-2" />
					{$t('back_to_settings')}
				</Button>
				
				<nav class="text-sm text-gray-600 mb-2">
					<a href="/settings" class="hover:text-blue-600">{$t('settings')}</a>
					<span class="mx-2">›</span>
					<span>{$t('table_header_settings')}</span>
				</nav>
			</div>

			<div class="flex items-center mb-8">
				<div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
					<Fa icon={faTable} class="text-white text-lg" />
				</div>
				<div>
					<h1 class="text-3xl font-bold">{$t('table_header_settings')}</h1>
					<p class="text-gray-600">{$t('table_header_settings_description')}</p>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow-md p-6">
				<div class="mb-6">
					<h2 class="text-xl font-semibold mb-2">{$t('mobile_display_options')}</h2>
					<p class="text-gray-600 text-sm mb-4">{$t('desktop_shows_all_columns')}</p>
				</div>

				{#if $tableHeaderSettingsStore.loading}
					<div class="flex items-center justify-center py-8">
						<div class="text-center">
							<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
							<p class="text-gray-600">{$t('loading')}</p>
						</div>
					</div>
				{:else}
					<div class="space-y-4">
						<!-- Tune name column (always visible) -->
						<div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
							<div class="flex items-center space-x-3">
								<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
									<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
									</svg>
								</div>
								<div>
									<p class="font-medium">{$t('tune_name')}</p>
									<p class="text-sm text-gray-600">{$t('always_visible')}</p>
								</div>
							</div>
							<div class="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded">
								{$t('tune_name_always_visible')}
							</div>
						</div>

						<!-- Customizable columns -->
						{#each columnSettings as column}
							<div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
								<div class="flex items-center space-x-3">
									<div class="w-6 h-6 {$tableHeaderSettingsStore.settings[column.key] ? 'bg-blue-500' : 'bg-gray-300'} rounded-full flex items-center justify-center transition-colors">
										{#if $tableHeaderSettingsStore.settings[column.key]}
											<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
											</svg>
										{/if}
									</div>
									<div>
										<p class="font-medium">{$t(column.labelKey)}</p>
									</div>
								</div>
								
								<button
									class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {$tableHeaderSettingsStore.settings[column.key] ? 'bg-blue-600' : 'bg-gray-200'}"
									onclick={() => toggleColumn(column.key)}
									disabled={$tableHeaderSettingsStore.loading}
									aria-label="Toggle {$t(column.labelKey)} column visibility"
								>
									<span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {$tableHeaderSettingsStore.settings[column.key] ? 'translate-x-6' : 'translate-x-1'}"></span>
								</button>
							</div>
						{/each}
					</div>

					<!-- Reset to defaults button -->
					<div class="mt-8 pt-6 border-t">
						<Button
							onclick={handleResetToDefaults}
							disabled={$tableHeaderSettingsStore.loading}
							bgColorClass="bg-gray-100"
							textColorClass="text-gray-700"
							className="w-full"
						>
							<Fa icon={faRedo} class="mr-2" />
							{$t('reset_to_defaults')}
						</Button>
					</div>
				{/if}
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
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
			<p class="text-gray-600">{$t('loading')}</p>
		</div>
	</div>
{/if}