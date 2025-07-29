<script lang="ts">
	import { t } from 'svelte-i18n';

	export let showTitle = true;
</script>

<div class="privacy-policy">
	{#if showTitle}
		<h2 class="text-xl font-bold mb-4">{$t('privacy_policy_title')}</h2>
	{/if}

	<div class="text-sm text-gray-600 space-y-4">
		<section>
			<h3 class="font-semibold mb-2">{$t('privacy_data_collection_title')}</h3>
			<p>{$t('privacy_data_collection_content')}</p>
		</section>

		<section>
			<h3 class="font-semibold mb-2">{$t('privacy_data_usage_title')}</h3>
			<p>{$t('privacy_data_usage_content')}</p>
		</section>

		<section>
			<h3 class="font-semibold mb-2">{$t('privacy_data_sharing_title')}</h3>
			<p>{$t('privacy_data_sharing_content')}</p>
		</section>

		<section>
			<h3 class="font-semibold mb-2">{$t('privacy_data_security_title')}</h3>
			<p>{$t('privacy_data_security_content')}</p>
		</section>
	</div>
</div>
