<script lang="ts">
	import * as yup from 'yup';
	import { ValidationError } from 'yup';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/button/Button.svelte';
	import { auth } from '$modules/firebase';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';
	import { toast } from '$modules/toast';
	import { siteTitle } from '$modules/config';
	import { page } from '$app/stores';

	let values = {
		email: '',
		password: ''
	};

	let errors: { [key: string]: string } = {
		email: '',
		password: ''
	};

	$: hasError = errors.email !== '' || errors.password !== '';

	const schema = yup.object().shape({
		email: yup
			.string()
			.required('メールアドレスは必須です')
			.email('メールアドレスが正しくありません'),
		password: yup
			.string()
			.required('パスワードは必須です')
			.min(6, 'パスワードは6文字以上入力してください')
	});

	const validate = (path: string) => {
		schema
			.validateAt(path, values)
			.then(() => {
				errors[path] = '';
			})
			.catch((err: ValidationError) => {
				errors[path] = err.message;
			});
	};

	const submit = () => {
		schema
			.validate(values, { abortEarly: false })
			.then(() => {
				signIn();
			})
			.catch((err) => {
				err.inner.forEach((error: ValidationError) => {
					if (error.path) {
						errors[error.path] = error.message;
					}
				});
			});
	};

	const signIn = () => {
		signInWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				goto('/');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	const title = `Sign In - ${siteTitle}`;
	const description = `Sign Inページです。`;
	const currentPageUrl = $page.url.href;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="”description“" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={currentPageUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="min-w-md flex justify-center items-center self-center pt-20">
	<div class="flex flex-col px-4 py-6 bg-white rounded-lg shadow-md w-full max-w-md">
		<h1>ログイン</h1>
		<form>
			<Input
				bind:value={values.email}
				type="email"
				label="メールアドレス"
				className="mt-2"
				error={errors.email}
				on:input={() => validate('email')}
			/>
			<Input
				bind:value={values.password}
				type="password"
				label="パスワード"
				className="mt-6"
				error={errors.password}
				on:input={() => validate('password')}
			/>
			<Button block className="mt-6" on:click={submit} disabled={hasError}>ログイン</Button>
		</form>
	</div>
</div>
