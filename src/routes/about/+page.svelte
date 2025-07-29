<script lang="ts">
	import { t } from 'svelte-i18n';
	import TunePage from '$lib/assets/tune_page.png';
	import PracticeRecord from '$lib/assets/practice_record.png';
</script>

<div class="md:w-[50rem] w-11/12 mx-auto">
	<h2 class="text-3xl font-bold">{$t('about_page_title')}</h2>
	<div class="mt-5 text-xl">
		{$t('about_page_description')}
	</div>
	<h2 class="mt-10 text-3xl font-bold">{$t('about_creator_title')}</h2>
	<div class="mt-5 text-xl">{$t('about_creator_name')}</div>

	<h2 class="mt-10 text-3xl font-bold">{$t('about_features_title')}</h2>
	<div class="mt-5 img-wrapper">
		<img class="img" src={TunePage} alt={$t('video_page_image_alt')} />
		<p class="img-text">
			{$t('about_login_features')}
		</p>
	</div>
	<div class="img-wrapper">
		<img class="img" src={PracticeRecord} alt={$t('practice_record_image_alt')} />
		<p class="img-text">
			{$t('about_homepage_features')}
		</p>
	</div>

	<h2 class="mt-10 text-3xl font-bold">{$t('support_title')}</h2>
	<div class="mt-5 text-xl">
		<p class="mb-4">
			(1) {$t('support_patreon_description')}
		</p>
		<p class="mb-4">
			(2) {$t('support_paypal_description')}<br />
			<a href="https://paypal.me/celtnofue" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
				https://paypal.me/celtnofue
			</a>
		</p>
		<p class="mb-4">
			<a href="https://www.patreon.com/tune_everyday" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
				https://www.patreon.com/tune_everyday
			</a>
		</p>
	</div>
</div>

<style lang="postcss">
	@reference "../../app.css";

	.img-wrapper {
		@apply border bg-white mx-auto md:w-[50rem] w-11/12 py-10 rounded-lg shadow-lg mt-10;
	}
	.img {
		@apply md:w-[40rem] w-11/12 mx-auto;
	}
	.img-text {
		@apply md:w-[40rem] w-11/12 mx-auto mt-10 text-left text-xl;
	}
</style>
