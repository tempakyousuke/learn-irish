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
		clearError,
		retryFailedOperation
	} from '$core/store/tableHeaderSettingsStore';
	import Button from '$lib/components/ui/Button.svelte';
	import Fa from 'svelte-fa';
	import { faArrowLeft, faTable, faRedo, faExclamationTriangle, faWifi } from '@fortawesome/free-solid-svg-icons';

	let mounted = false;

	// 認証状態の監視とリダイレクト
	$: if ($authLoaded && !$isAuthenticated) {
		goto('/signin');
	}

	// 設定は認証リスナーによって自動的に読み込まれるため、手動読み込みは不要

	onMount(() => {
		mounted = true;
		// エラー状態をクリア
		clearError();
	});

	let isToggling = false;

	// 個別の列設定を切り替える
	async function toggleColumn(key: keyof typeof $tableHeaderSettingsStore.settings) {
		if (isToggling) return;
		
		isToggling = true;
		const currentValue = $tableHeaderSettingsStore.settings[key];
		
		try {
			await updateSetting(key, !currentValue);
			
			// 成功時のフィードバック（エラーがない場合のみ）
			if (!$tableHeaderSettingsStore.error) {
				if ($tableHeaderSettingsStore.isOnline) {
					toast.success($t('settings_saved'));
				} else if ($tableHeaderSettingsStore.pendingChanges) {
					toast.info($t('offline_mode'));
				}
			}
		} catch (error) {
			console.error('設定切り替えエラー:', error);
		} finally {
			isToggling = false;
		}
	}

	// デフォルト設定にリセット
	async function handleResetToDefaults() {
		try {
			await resetToDefaults();
			
			if (!$tableHeaderSettingsStore.error) {
				if ($tableHeaderSettingsStore.isOnline) {
					toast.success($t('settings_reset'));
				} else if ($tableHeaderSettingsStore.pendingChanges) {
					toast.info($t('offline_mode'));
				}
			}
		} catch (error) {
			console.error('デフォルト設定リセットエラー:', error);
		}
	}

	// 失敗した操作を再試行
	async function handleRetry() {
		try {
			await retryFailedOperation();
			
			if (!$tableHeaderSettingsStore.error) {
				toast.success($t('operation_completed'));
			}
		} catch (error) {
			console.error('再試行エラー:', error);
		}
	}

	// エラー表示時のトースト
	$: if ($tableHeaderSettingsStore.error) {
		// エラーの種類に応じて適切なメッセージを表示
		const error = $tableHeaderSettingsStore.error;
		
		if (error.includes('ネットワーク') || error.includes('接続')) {
			toast.error($t('network_error'));
		} else if (error.includes('破損') || error.includes('無効')) {
			toast.error($t('malformed_data_error'));
		} else if (error.includes('認証') || error.includes('ログイン')) {
			toast.error($t('permission_denied_error'));
		} else if (error.includes('タイムアウト')) {
			toast.error($t('timeout_error'));
		} else if (error.includes('利用できません')) {
			toast.error($t('firestore_unavailable'));
		} else {
			toast.error(error);
		}
		
		// エラー状態をクリア（一定時間後）
		setTimeout(() => {
			clearError();
		}, 5000);
	}

	// オンライン状態の変化を監視
	$: if (mounted && $tableHeaderSettingsStore.isOnline && $tableHeaderSettingsStore.pendingChanges) {
		toast.info($t('connection_restored'));
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
				<!-- Network status indicator -->
				{#if !$tableHeaderSettingsStore.isOnline}
					<div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
						<div class="w-4 h-4 bg-yellow-600 rounded-full mr-2"></div>
						<div class="flex-1">
							<p class="text-sm font-medium text-yellow-800">{$t('offline_mode')}</p>
							{#if $tableHeaderSettingsStore.pendingChanges}
								<p class="text-xs text-yellow-700 mt-1">変更は接続復旧時に保存されます</p>
							{/if}
						</div>
					</div>
				{:else if $tableHeaderSettingsStore.pendingChanges}
					<div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
						<Fa icon={faWifi} class="text-blue-600 mr-2" />
						<div class="flex-1">
							<p class="text-sm font-medium text-blue-800">{$t('connection_restored')}</p>
							<p class="text-xs text-blue-700 mt-1">変更を同期しています...</p>
						</div>
					</div>
				{/if}

				<!-- Error display with retry option -->
				{#if $tableHeaderSettingsStore.error && $tableHeaderSettingsStore.retryCount > 0}
					<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<div class="flex items-start">
							<Fa icon={faExclamationTriangle} class="text-red-600 mr-2 mt-0.5" />
							<div class="flex-1">
								<p class="text-sm font-medium text-red-800">操作に失敗しました</p>
								<p class="text-xs text-red-700 mt-1">
									{$tableHeaderSettingsStore.error}
									{#if $tableHeaderSettingsStore.retryCount > 1}
										(試行回数: {$tableHeaderSettingsStore.retryCount})
									{/if}
								</p>
							</div>
							<Button
								onclick={handleRetry}
								disabled={$tableHeaderSettingsStore.loading || !$tableHeaderSettingsStore.isOnline}
								bgColorClass="bg-red-100"
								textColorClass="text-red-700"
								className="text-xs px-2 py-1"
							>
								{$t('retry')}
							</Button>
						</div>
					</div>
				{/if}

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
									class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {$tableHeaderSettingsStore.settings[column.key] ? 'bg-blue-600' : 'bg-gray-200'} {isToggling || $tableHeaderSettingsStore.loading ? 'opacity-50 cursor-not-allowed' : ''}"
									onclick={() => toggleColumn(column.key)}
									disabled={isToggling || $tableHeaderSettingsStore.loading}
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
							disabled={$tableHeaderSettingsStore.loading || isToggling}
							bgColorClass="bg-gray-100"
							textColorClass="text-gray-700"
							className="w-full"
						>
							<Fa icon={faRedo} class="mr-2" />
							{$t('reset_to_defaults')}
						</Button>
						
						{#if $tableHeaderSettingsStore.lastSyncTime}
							<p class="text-xs text-gray-500 text-center mt-2">
								最終同期: {new Date($tableHeaderSettingsStore.lastSyncTime).toLocaleString('ja-JP')}
							</p>
						{/if}
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