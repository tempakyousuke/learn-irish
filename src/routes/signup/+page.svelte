<script lang="ts">
	import { t } from 'svelte-i18n';
	import * as yup from 'yup';
	import { ValidationError } from 'yup';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/button/Button.svelte';
	import { auth, db } from '$core/data/firebase/firebaseClient';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { signInWithGoogle } from '$core/auth/authService'; // Added import
	import { doc, setDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { siteTitle } from '$core/config/configService';
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
			.required(() => $t('validation_email_required'))
			.email(() => $t('validation_email_invalid')),

		password: yup
			.string()
			.required(() => $t('validation_password_required'))
			.min(6, () => $t('validation_password_min'))
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
				signUp();
			})
			.catch((err) => {
				err.inner.forEach((error: ValidationError) => {
					if (error.path) {
						errors[error.path] = error.message;
					}
				});
			});
	};

	const signUp = () => {
		createUserWithEmailAndPassword(auth, values.email, values.password)
			.then(() => {
				goto('/');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	// Added Google Sign-Up handler
	const handleGoogleSignUp = async () => {
		try {
			await signInWithGoogle();
			goto('/');
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	const title = `Sign Up - ${siteTitle}`;
	const description = `Sign Upページです。`;
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
		<h1>{$t('create_account')}</h1>
		<form>
			<Input
				bind:value={values.email}
				type="email"
				label={$t('email')}
				className="mt-6"
				error={errors.email}
				on:input={() => validate('email')}
			/>
			<Input
				bind:value={values.password}
				type="password"
				label={$t('password')}
				className="mt-6"
				error={errors.password}
				on:input={() => validate('password')}
			/>
			<Button block className="mt-5" on:click={submit}>{$t('register')}</Button>
			<!-- Added Google Sign Up Button -->
			<Button block className="mt-4" on:click={handleGoogleSignUp} type="button">
				{$t('sign_up_with_google')}
			</Button>
		</form>
	</div>
</div>
