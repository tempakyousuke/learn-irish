<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { siteTitle } from '$core/config/configService';
	import {
		getLinkedProviders,
		linkGoogleAccount,
		linkEmailPassword,
		unlinkProvider,
		isAuthenticated,
		authLoaded
	} from '$core/auth/authService';
	import Button from '$lib/button/Button.svelte';
	import Input from '$lib/forms/Input.svelte';
	import * as yup from 'yup';
	import { ValidationError } from 'yup';

	let linkedProviders: any[] = [];
	let loading = false;
	let showEmailPasswordForm = false;

	let emailPasswordForm = {
		email: '',
		password: ''
	};

	let errors: { [key: string]: string } = {
		email: '',
		password: ''
	};

	$: hasGoogleAuth = linkedProviders.some((p) => p.providerId === 'google.com');
	$: hasEmailAuth = linkedProviders.some((p) => p.providerId === 'password');
	$: hasError = errors.email !== '' || errors.password !== '';

	const schema = yup.object().shape({
		email: yup
			.string()
			.required(() => $t('validation_email_required'))
			.email(() => $t('validation_email_invalid')),
		password: yup
			.string()
			.required(() => $t('validation_password_required'))
			.min(6, () => $t('validation_password_min'))
	});

	onMount(() => {
		loadLinkedProviders();
	});

	// 認証状態の監視とリダイレクト
	$: if ($authLoaded && !$isAuthenticated) {
		goto('/signin');
	}

	// 認証状態が変わった時にプロバイダー情報を再読み込み
	$: if ($authLoaded && $isAuthenticated) {
		loadLinkedProviders();
	}

	function loadLinkedProviders() {
		// 認証状態が確認済みでログイン済みの場合のみ実行
		if ($authLoaded && $isAuthenticated) {
			linkedProviders = getLinkedProviders();
		}
	}

	const validate = (path: string) => {
		schema
			.validateAt(path, emailPasswordForm)
			.then(() => {
				errors[path] = '';
			})
			.catch((err: ValidationError) => {
				errors[path] = err.message;
			});
	};

	async function handleLinkGoogle() {
		if (hasGoogleAuth) {
			toast.error($t('google_account_already_linked'));
			return;
		}

		loading = true;
		try {
			await linkGoogleAccount();
			loadLinkedProviders();
			toast.success($t('google_account_linked'));
		} catch (error: any) {
			console.error('Google link error:', error);
			if (error.code === 'auth/provider-already-linked') {
				toast.error($t('provider_already_linked'));
			} else if (error.code === 'auth/credential-already-in-use') {
				toast.error($t('credential_already_in_use'));
			} else {
				toast.error($t('google_link_failed'));
			}
		} finally {
			loading = false;
		}
	}

	async function handleLinkEmailPassword() {
		if (hasEmailAuth) {
			toast.error($t('email_password_already_linked'));
			return;
		}

		const validationResult = await schema
			.validate(emailPasswordForm, { abortEarly: false })
			.catch((err) => {
				err.inner.forEach((error: ValidationError) => {
					if (error.path) {
						errors[error.path] = error.message;
					}
				});
				return null;
			});

		if (!validationResult) {
			return;
		}

		loading = true;
		try {
			await linkEmailPassword(emailPasswordForm.email, emailPasswordForm.password);
			loadLinkedProviders();
			showEmailPasswordForm = false;
			emailPasswordForm = { email: '', password: '' };
			errors = { email: '', password: '' };
			toast.success($t('email_password_linked'));
		} catch (error: any) {
			console.error('Email/Password link error:', error);
			if (error.code === 'auth/email-already-in-use') {
				toast.error($t('email_already_in_use'));
			} else if (error.code === 'auth/weak-password') {
				toast.error($t('weak_password'));
			} else {
				toast.error($t('email_password_link_failed'));
			}
		} finally {
			loading = false;
		}
	}

	async function handleUnlinkProvider(providerId: string) {
		if (linkedProviders.length <= 1) {
			toast.error($t('minimum_one_auth_method'));
			return;
		}

		loading = true;
		try {
			await unlinkProvider(providerId);
			loadLinkedProviders();
			toast.success($t('authentication_method_unlinked'));
		} catch (error: any) {
			console.error('Unlink error:', error);
			toast.error($t('unlink_failed'));
		} finally {
			loading = false;
		}
	}

	const title = `${$t('account_settings')} - ${siteTitle}`;
	const description = `${$t('account_settings')}ページです。`;
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
			<h1 class="text-3xl font-bold mb-8">{$t('account_settings')}</h1>

			<div class="bg-white rounded-lg shadow-md p-6">
				<h2 class="text-xl font-semibold mb-4">{$t('linked_authentication_methods')}</h2>

				{#if linkedProviders.length > 0}
					<div class="space-y-4 mb-6">
						{#each linkedProviders as provider}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex items-center space-x-3">
									{#if provider.providerId === 'google.com'}
										<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
											<span class="text-white text-sm font-bold">G</span>
										</div>
										<div>
											<p class="font-medium">{$t('google')}</p>
											<p class="text-sm text-gray-600">{provider.email}</p>
										</div>
									{:else if provider.providerId === 'password'}
										<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
											<span class="text-white text-sm font-bold">@</span>
										</div>
										<div>
											<p class="font-medium">{$t('email_password')}</p>
											<p class="text-sm text-gray-600">{provider.email}</p>
										</div>
									{/if}
								</div>

								{#if linkedProviders.length > 1}
									<Button
										on:click={() => handleUnlinkProvider(provider.providerId)}
										disabled={loading}
										bgColorClass="bg-gray-100"
										textColorClass="text-gray-700"
										className="text-sm px-3 py-1"
									>
										{$t('unlink')}
									</Button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				{#if !hasGoogleAuth || !hasEmailAuth}
					<h3 class="text-lg font-semibold mb-4">{$t('add_authentication_method')}</h3>
				{/if}

				<div class="space-y-4">
					{#if !hasGoogleAuth}
						<div class="p-4 border rounded-lg">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
										<span class="text-white text-sm font-bold">G</span>
									</div>
									<div>
										<p class="font-medium">{$t('google')}</p>
										<p class="text-sm text-gray-600">{$t('google_signin_description')}</p>
									</div>
								</div>
								<Button
									on:click={handleLinkGoogle}
									disabled={loading}
									className="bg-red-500 hover:bg-red-600"
								>
									{$t('link')}
								</Button>
							</div>
						</div>
					{/if}

					{#if !hasEmailAuth}
						<div class="p-4 border rounded-lg">
							<div class="flex items-center justify-between mb-4">
								<div class="flex items-center space-x-3">
									<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
										<span class="text-white text-sm font-bold">@</span>
									</div>
									<div>
										<p class="font-medium">{$t('email_password')}</p>
										<p class="text-sm text-gray-600">{$t('email_password_signin_description')}</p>
									</div>
								</div>
								<Button
									on:click={() => (showEmailPasswordForm = !showEmailPasswordForm)}
									disabled={loading}
									bgColorClass="bg-gray-100"
									textColorClass="text-gray-700"
								>
									{showEmailPasswordForm ? $t('cancel') : $t('link')}
								</Button>
							</div>

							{#if showEmailPasswordForm}
								<div class="space-y-4">
									<Input
										bind:value={emailPasswordForm.email}
										type="email"
										label={$t('email')}
										error={errors.email}
										on:input={() => validate('email')}
									/>
									<Input
										bind:value={emailPasswordForm.password}
										type="password"
										label={$t('password')}
										error={errors.password}
										on:input={() => validate('password')}
									/>
									<Button on:click={handleLinkEmailPassword} disabled={loading || hasError} block>
										{loading ? $t('linking') : $t('link_email_password_auth')}
									</Button>
								</div>
							{/if}
						</div>
					{/if}
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
