<script lang="ts">
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { siteTitle } from '$core/config/configService';
	import { 
		getLinkedProviders, 
		linkGoogleAccount, 
		linkEmailPassword, 
		unlinkProvider 
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

	$: hasGoogleAuth = linkedProviders.some(p => p.providerId === 'google.com');
	$: hasEmailAuth = linkedProviders.some(p => p.providerId === 'password');
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

	function loadLinkedProviders() {
		linkedProviders = getLinkedProviders();
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
			toast.error('Googleアカウントは既にリンクされています');
			return;
		}

		loading = true;
		try {
			await linkGoogleAccount();
			loadLinkedProviders();
			toast.success('Googleアカウントをリンクしました');
		} catch (error: any) {
			console.error('Google link error:', error);
			if (error.code === 'auth/provider-already-linked') {
				toast.error('このGoogleアカウントは既にリンクされています');
			} else if (error.code === 'auth/credential-already-in-use') {
				toast.error('このGoogleアカウントは他のユーザーによって使用されています');
			} else {
				toast.error('Googleアカウントのリンクに失敗しました');
			}
		} finally {
			loading = false;
		}
	}

	async function handleLinkEmailPassword() {
		if (hasEmailAuth) {
			toast.error('メール/パスワード認証は既にリンクされています');
			return;
		}

		const validationResult = await schema.validate(emailPasswordForm, { abortEarly: false })
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
			toast.success('メール/パスワード認証をリンクしました');
		} catch (error: any) {
			console.error('Email/Password link error:', error);
			if (error.code === 'auth/email-already-in-use') {
				toast.error('このメールアドレスは既に使用されています');
			} else if (error.code === 'auth/weak-password') {
				toast.error('パスワードが弱すぎます');
			} else {
				toast.error('メール/パスワード認証のリンクに失敗しました');
			}
		} finally {
			loading = false;
		}
	}

	async function handleUnlinkProvider(providerId: string) {
		if (linkedProviders.length <= 1) {
			toast.error('最低1つの認証方法を残す必要があります');
			return;
		}

		loading = true;
		try {
			await unlinkProvider(providerId);
			loadLinkedProviders();
			toast.success('認証方法のリンクを解除しました');
		} catch (error: any) {
			console.error('Unlink error:', error);
			toast.error('認証方法のリンク解除に失敗しました');
		} finally {
			loading = false;
		}
	}

	const title = `アカウント設定 - ${siteTitle}`;
	const description = `アカウント設定ページです。`;
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

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-3xl font-bold mb-8">アカウント設定</h1>
		
		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-xl font-semibold mb-4">リンクされた認証方法</h2>
			
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
										<p class="font-medium">Google</p>
										<p class="text-sm text-gray-600">{provider.email}</p>
									</div>
								{:else if provider.providerId === 'password'}
									<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
										<span class="text-white text-sm font-bold">@</span>
									</div>
									<div>
										<p class="font-medium">メール/パスワード</p>
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
									解除
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<h3 class="text-lg font-semibold mb-4">認証方法を追加</h3>
			
			<div class="space-y-4">
				{#if !hasGoogleAuth}
					<div class="p-4 border rounded-lg">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
									<span class="text-white text-sm font-bold">G</span>
								</div>
								<div>
									<p class="font-medium">Google</p>
									<p class="text-sm text-gray-600">Googleアカウントでログイン</p>
								</div>
							</div>
							<Button 
								on:click={handleLinkGoogle} 
								disabled={loading}
								className="bg-red-500 hover:bg-red-600"
							>
								リンク
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
									<p class="font-medium">メール/パスワード</p>
									<p class="text-sm text-gray-600">メールアドレスとパスワードでログイン</p>
								</div>
							</div>
							<Button 
								on:click={() => showEmailPasswordForm = !showEmailPasswordForm}
								disabled={loading}
								bgColorClass="bg-gray-100"
								textColorClass="text-gray-700"
							>
								{showEmailPasswordForm ? 'キャンセル' : 'リンク'}
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
								<Button 
									on:click={handleLinkEmailPassword}
									disabled={loading || hasError}
									block
								>
									{loading ? 'リンク中...' : 'メール/パスワード認証をリンク'}
								</Button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>