<script lang="ts">
	import { t } from 'svelte-i18n';
	import * as yup from 'yup';
	import { ValidationError } from 'yup';
	import Input from '$lib/forms/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PrivacyPolicy from '$lib/components/ui/PrivacyPolicy.svelte';
	import { auth, db } from '$core/data/firebase/firebaseClient';
	import { createUserWithEmailAndPassword } from 'firebase/auth';
	import { doc, setDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { siteTitle } from '$core/config/configService';
	import { page } from '$app/state';
	import { loginWithGoogle } from '$core/auth/authService';

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

	const signUpWithGoogleHandler = () => {
		loginWithGoogle()
			.then(() => {
				goto('/');
			})
			.catch((error) => {
				toast.error(error.message);
			});
	};

	const title = `${$t('sign_up_page_title')} - ${siteTitle}`;
	const description = $t('sign_up_page_description');
	$: currentPageUrl = page.url.href;
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
				oninput={() => validate('email')}
			/>
			<Input
				bind:value={values.password}
				type="password"
				label={$t('password')}
				className="mt-6"
				error={errors.password}
				oninput={() => validate('password')}
			/>
			<Button block className="mt-8" onclick={submit}>{$t('register')}</Button>
			<div class="mt-4 text-center">
				<Button
					block
					className="mt-2 bg-red-500 hover:bg-red-600"
					onclick={signUpWithGoogleHandler}
				>
					{$t('sign_up_with_google')}
				</Button>
			</div>
		</form>
		
		<div class="mt-6 pt-4 border-t border-gray-200">
			<PrivacyPolicy showTitle={true} />
		</div>
	</div>
</div>
