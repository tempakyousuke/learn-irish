<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { TuneFull } from '$core/data/models/Tune';
	import StatCard from '$lib/features/stats/StatCard.svelte';
	import { faBook, faMusic, faChartBar, faCalendarDay } from '@fortawesome/free-solid-svg-icons';

	const {
		tunes = [],
		rememberNameIds = [],
		rememberMelodyIds = [],
		totalCount = 0,
		dailyTotal = 0
	}: {
		tunes?: TuneFull[];
		rememberNameIds?: string[];
		rememberMelodyIds?: string[];
		totalCount?: number;
		dailyTotal?: number;
	} = $props();
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl w-full mx-auto my-8 px-4">
	<StatCard
		title={$t('tune_memorized_name')}
		value={`${rememberNameIds.length}/${tunes.length}`}
		icon={faBook}
		color="teal"
	/>
	<StatCard
		title={$t('tune_memorized_melody')}
		value={`${rememberMelodyIds.length}/${tunes.length}`}
		icon={faMusic}
		color="emerald"
	/>
	<StatCard title={$t('total_plays')} value={totalCount} icon={faChartBar} color="orange" />
	<StatCard title={$t('todays_plays')} value={dailyTotal} icon={faCalendarDay} color="blue" />
</div>
