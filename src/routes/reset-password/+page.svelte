<script lang="ts">
	import * as yup from 'yup';
	import { ValidationError } from 'yup';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/button/Button.svelte';
	import { auth } from '$modules/firebase';
	import { sendPasswordResetEmail } from 'firebase/auth';
	import { toast } from '$modules/toast';
	import { siteTitle } from '$modules/config';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let email = '';
	let error = '';

	const schema = yup.object().shape({
		email: yup
			.string()
			.required('メールアドレスは必須です')
			.email('メールアドレスが正しくありません')
	});

	const validate = () => {
		schema
			.validateAt('email', { email })
			.then(() => {
				error = '';
			})
			.catch((err: ValidationError) => {
				error = err.message;
			});
	};

	const submit = () => {
		schema
			.validate({ email }, { abortEarly: false })
			.then(() => {
				sendPasswordResetEmail(auth, email)
					.then(() => {
						goto('/reset-password/complete');
					})
					.catch((error) => {
						toast.error(error.message);
					});
			})
			.catch((err) => {
				error = err.message;
			});
	};

	const title = `パスワードリセット - ${siteTitle}`;
	const description = `パスワードリセットページです。`;
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
		<h1>パスワードリセット</h1>
		<p class="mt-2 text-gray-600">
			登録したメールアドレスを入力してください。パスワードリセットのメールをお送りします。
		</p>
		<form>
			<Input
				bind:value={email}
				type="email"
				label="メールアドレス"
				className="mt-4"
				{error}
				on:input={validate}
			/>
			<Button block className="mt-6" on:click={submit} disabled={error !== ''}>
				パスワードリセットメールを送信
			</Button>
		</form>
	</div>
</div>
