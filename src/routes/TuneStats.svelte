<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '../types/tune';
	import StatCard from './StatCard.svelte';

	export let tunes: Tune[] = [];
	export let rememberNameIds: string[] = [];
	export let rememberMelodyIds: string[] = [];
	export let totalCount: number = 0;
	export let dailyTotal: number = 0;
</script>

<div class="grid grid-cols-4 place-content-between md:w-[50rem] w-[28rem] mx-auto gap-x-4 gap-y-8">
	<StatCard title={$t('tune_memorized_name')} value="{rememberNameIds.length}/{tunes.length}" />
	<StatCard title={$t('tune_memorized_melody')} value="{rememberMelodyIds.length}/{tunes.length}" />
	<StatCard title={$t('total_plays')} value={totalCount} />
	<StatCard title={$t('todays_plays')} value={dailyTotal} />
</div>
