<script lang="ts">
	import { InquiryRepository } from '$core/data/repositories/inquiryRepository';
	import { createInquiry, type InquiryType } from '$core/data/models/Inquiry';
	import { userStore } from '$core/store/userStore';
	import Button from '$lib/components/ui/Button.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import {
		getInquiryCreationErrorMessage,
		getAuthenticationErrorMessage
	} from '$core/utils/inquiryErrorHandling';
	import { _ } from 'svelte-i18n';

	interface Props {
		onSubmitSuccess?: () => void;
		onSubmitError?: (error: string) => void;
		onCancel?: () => void;
	}

	let { onSubmitSuccess, onSubmitError, onCancel }: Props = $props();

	// フォームデータ
	let formData = $state({
		content: '',
		type: 'opinion' as InquiryType
	});

	// バリデーションエラー
	let errors = $state({
		content: ''
	});

	// UI状態
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);
	let submitSuccess = $state(false);

	// 問い合わせタイプのオプション
	const inquiryTypes = $derived([
		{ value: 'opinion', label: $_('inquiry_type_opinion') },
		{ value: 'request', label: $_('inquiry_type_request') },
		{ value: 'bug_report', label: $_('inquiry_type_bug_report') }
	] as const);

	/**
	 * フォームバリデーション
	 */
	function validateForm(): boolean {
		errors = { content: '' };
		let isValid = true;

		// 内容の必須チェック
		if (!formData.content.trim()) {
			errors.content = $_('inquiry_content_required');
			isValid = false;
		} else if (formData.content.trim().length < 10) {
			errors.content = $_('inquiry_content_min_length');
			isValid = false;
		} else if (formData.content.trim().length > 2000) {
			errors.content = $_('inquiry_content_max_length');
			isValid = false;
		}

		return isValid;
	}

	/**
	 * フォーム送信処理
	 */
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		// バリデーション
		if (!validateForm()) {
			return;
		}

		// ユーザー認証チェック
		if (!$userStore.isLoggedIn || !$userStore.uid) {
			const authError = getAuthenticationErrorMessage('contact');
			submitError = authError;
			onSubmitError?.(authError);
			return;
		}

		isSubmitting = true;
		submitError = null;

		try {
			// ユーザーエージェント情報を取得
			const userAgent = navigator.userAgent;

			// 問い合わせデータを作成
			const inquiryData = createInquiry(
				{
					content: formData.content.trim(),
					userId: $userStore.uid,
					createdAt: new Date(),
					status: 'unconfirmed',
					userAgent
				},
				{
					type: formData.type
				}
			);

			// 問い合わせを送信
			await InquiryRepository.create(inquiryData);

			// 成功時の処理
			submitSuccess = true;
			formData = { content: '', type: 'opinion' };
			errors = { content: '' };

			// 成功コールバックを実行
			onSubmitSuccess?.();
		} catch (error) {
			console.error('問い合わせ送信エラー:', error);

			// 問い合わせ固有のエラーメッセージを生成
			const friendlyError = getInquiryCreationErrorMessage(error);
			submitError = friendlyError;

			// 親コンポーネントにもエラーを通知
			onSubmitError?.(friendlyError);
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * キャンセル処理
	 */
	function handleCancel() {
		formData = { content: '', type: 'opinion' };
		errors = { content: '' };
		submitError = null;
		submitSuccess = false;
		onCancel?.();
	}

	/**
	 * 成功メッセージを閉じる
	 */
	function dismissSuccess() {
		submitSuccess = false;
	}
</script>

<div class="max-w-2xl mx-auto">
	<!-- 成功メッセージ -->
	{#if submitSuccess}
		<div class="mb-6 p-4 bg-green-100 border border-green-200 rounded-lg text-green-800">
			<div class="flex items-start justify-between">
				<div>
					<h3 class="font-medium">{$_('inquiry_form_success_title')}</h3>
					<p class="mt-1">{$_('inquiry_form_success_message')}</p>
				</div>
				<button
					onclick={dismissSuccess}
					class="ml-4 text-green-600 hover:text-green-800 transition-colors"
					aria-label={$_('close')}
				>
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						></path>
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<!-- エラーメッセージ -->
	<ErrorMessage bind:message={submitError} dismissable={true} />

	<!-- 免責事項 -->
	<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
		<h3 class="font-medium text-yellow-800 mb-2">{$_('inquiry_form_disclaimer_title')}</h3>
		<ul class="text-sm text-yellow-700 space-y-1">
			<li>• {$_('inquiry_form_disclaimer_1')}</li>
			<li>• {$_('inquiry_form_disclaimer_2')}</li>
			<li>• {$_('inquiry_form_disclaimer_3')}</li>
		</ul>
	</div>

	<!-- フォーム -->
	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- 問い合わせ種類 -->
		<fieldset>
			<legend class="block text-sm font-medium text-gray-700 mb-3">
				{$_('inquiry_type_label')} <span class="text-red-500">{$_('required_field')}</span>
			</legend>
			<div class="space-y-2">
				{#each inquiryTypes as option}
					<label class="flex items-center">
						<input
							type="radio"
							bind:group={formData.type}
							value={option.value}
							class="mr-2 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-gray-700">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>

		<!-- 問い合わせ内容 -->
		<div>
			<label for="content" class="block text-sm font-medium text-gray-700 mb-2">
				{$_('inquiry_content_label')} <span class="text-red-500">{$_('required_field')}</span>
			</label>
			<textarea
				id="content"
				bind:value={formData.content}
				rows="8"
				class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				class:border-red-500={errors.content}
				placeholder={$_('inquiry_content_placeholder')}
				disabled={isSubmitting}
			></textarea>
			{#if errors.content}
				<p class="mt-1 text-sm text-red-600">{errors.content}</p>
			{/if}
			<p class="mt-1 text-sm text-gray-500">
				{$_('inquiry_content_counter', { values: { count: formData.content.length } })}
			</p>
		</div>

		<!-- アクションボタン -->
		<div class="flex justify-end space-x-4">
			{#if onCancel}
				<Button
					onclick={handleCancel}
					disabled={isSubmitting}
					bgColorClass="bg-gray-500"
					textColorClass="text-white"
				>
					{$_('cancel')}
				</Button>
			{/if}
			<Button
				type="submit"
				disabled={isSubmitting || !formData.content.trim()}
				bgColorClass="bg-blue-600"
				textColorClass="text-white"
			>
				{isSubmitting ? $_('submitting') : $_('submit')}
			</Button>
		</div>
	</form>
</div>
