<script lang="ts">
	import { t } from 'svelte-i18n';
	import type { Tune } from '$core/data/models/Tune';
	import StatCard from './StatCard.svelte';
	import {
		faUserCheck,
		faMusic,
		faChartBar,
		faCalendarDay
	} from '@fortawesome/free-solid-svg-icons';

	export let tunes: Tune[] = [];
	export let rememberNameIds: string[] = [];
	export let rememberMelodyIds: string[] = [];
	export let totalCount: number = 0;
	export let dailyTotal: number = 0;
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl w-full mx-auto my-8 px-4">
	<StatCard
		title={$t('tune_memorized_name')}
		value={`${rememberNameIds.length}/${tunes.length}`}
		icon={faUserCheck}
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
