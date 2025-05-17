<script lang="ts">
	import { userStore } from '$core/store/userStore';
	import { getDate } from '$core/utils/dateUtils';
	import {
		getDailyTotal,
		getMonthlyDatas,
		getMonthlyStatistics
	} from '$core/data/repositories/statisticsRepository';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { getUserTunes } from '$core/data/repositories/tuneRepository';
	import {
		calcUserTuneStats,
		type UserTuneStats,
		countRememberedMelodyByRhythm,
		type RhythmMelodyStats
	} from '$lib/utils/userTuneStats';
	import StatCard from '$lib/stats/StatCard.svelte';
	import { faChartBar, faBook, faMusic } from '@fortawesome/free-solid-svg-icons';
	import type { TuneFull } from '$core/data/models/Tune';
	import { getTunes } from '$core/data/repositories/tuneRepository';
	import { t } from 'svelte-i18n';

	let uid: string = '';
	// 直近7日間の日付の配列を保存
	let dates = (() => {
		let dates = [];
		for (let i = 7; i--; i > -1) {
			dates.push(getDate(i));
		}
		return dates;
	})();
	let weeklyCounts: {
		[key: string]: number;
	} = {};

	let monthlyDatas: {
		[key: string]: number;
	} = {};

	let selectedMonth: string = '';
	let MonthlyStatistics: {
		[key: string]: number;
	} = {};

	// Chart.js用の要素参照
	let weeklyChartCanvas: HTMLCanvasElement;
	let monthlyChartCanvas: HTMLCanvasElement;
	let weeklyChart: Chart;
	let monthlyChart: Chart;

	let userTuneStats: UserTuneStats = {
		rememberNameCount: 0,
		rememberMelodyCount: 0,
		totalPlayCount: 0
	};

	let rhythmMelodyStats: RhythmMelodyStats = {};
	let tunes: TuneFull[] = [];
	let userTunes: any[] = [];

	// ユーザーの習得状況を取得し集計
	async function fetchUserTuneStats(uid: string) {
		if (!uid) return;
		userTunes = await getUserTunes(uid);
		userTuneStats = calcUserTuneStats(userTunes);
		if (tunes.length > 0) {
			rhythmMelodyStats = countRememberedMelodyByRhythm(userTunes, tunes);
		}
	}

	// 全曲データを取得
	async function fetchTunes() {
		tunes = await getTunes();
		if (userTunes.length > 0) {
			rhythmMelodyStats = countRememberedMelodyByRhythm(userTunes, tunes);
		}
	}

	userStore.subscribe(async (value) => {
		uid = value.uid;
		if (!uid) {
			return;
		}
		for (const date of dates) {
			const dailyTotal = await getDailyTotal(date, uid);
			weeklyCounts[date] = dailyTotal;
		}
		monthlyDatas = await getMonthlyDatas(uid);

		// データ取得後にグラフを更新
		if (weeklyChart) {
			updateWeeklyChart();
		}

		// ユーザー統計も取得
		await fetchUserTuneStats(uid);
	});

	onMount(() => {
		// ウィークリーチャートを初期化
		initWeeklyChart();
		fetchTunes();
	});

	// ウィークリーチャートの初期化
	function initWeeklyChart() {
		if (weeklyChartCanvas) {
			weeklyChart = new Chart(weeklyChartCanvas, {
				type: 'line',
				data: {
					labels: dates.map((date) => date.slice(5)),
					datasets: [
						{
							label: 'Weekly Counts',
							data: Object.values(weeklyCounts),
							backgroundColor: 'rgba(75, 192, 192, 0.6)',
							borderColor: 'rgba(75, 192, 192, 1)',
							borderWidth: 2
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false
				}
			});
		}
	}

	// ウィークリーチャートの更新
	function updateWeeklyChart() {
		if (weeklyChart) {
			weeklyChart.data.labels = dates.map((date) => date.slice(5));
			weeklyChart.data.datasets[0].data = Object.values(weeklyCounts);
			weeklyChart.update();
		}
	}

	// マンスリーチャートの初期化
	function initMonthlyChart() {
		if (monthlyChartCanvas && Object.keys(MonthlyStatistics).length > 0) {
			// 既存のチャートを破棄
			if (monthlyChart) {
				monthlyChart.destroy();
			}

			const labels = Object.keys(MonthlyStatistics).map((date) => date.slice(-2));
			const data = Object.values(MonthlyStatistics);

			monthlyChart = new Chart(monthlyChartCanvas, {
				type: 'bar',
				data: {
					labels: labels,
					datasets: [
						{
							label: `${selectedMonth} Counts`,
							data: data,
							backgroundColor: 'rgba(75, 192, 192, 0.6)',
							borderColor: 'rgba(75, 192, 192, 1)',
							borderWidth: 1
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		}
	}

	const selectMonth = (month: string) => {
		if (monthlyDatas[month] === 0) {
			return;
		}
		selectedMonth = month;
		getMonthlyStatistics(month, uid).then((data) => {
			MonthlyStatistics = data;
			// データ取得後にチャートを初期化
			setTimeout(initMonthlyChart, 0);
		});
	};
</script>

<div class="bg-white shadow-md rounded-lg p-4 mb-8">
	<h3 class="text-xl font-bold mb-4">{$t('recent_plays')}</h3>
	<div style="height: 300px;">
		<canvas bind:this={weeklyChartCanvas}></canvas>
	</div>
</div>

<div class="max-w-[800px] mx-auto my-8">
	<h3 class="text-lg font-bold mb-2">{$t('monthly_records')}</h3>
	<div
		class="flex overflow-x-auto gap-2 md:grid md:grid-cols-6 md:gap-2 scrollbar-thin scrollbar-thumb-emerald-200 pb-2"
	>
		{#each Object.entries(monthlyDatas).reverse() as [key, value]}
			<button
				class="flex-shrink-0 flex flex-col items-center justify-center rounded-lg border transition min-w-[80px] min-h-[56px] p-2 md:min-w-0
					{selectedMonth === key
					? 'border-2 border-emerald-500 bg-emerald-50'
					: 'hover:bg-emerald-50 hover:text-emerald-800'}"
				on:click={() => selectMonth(key)}
				aria-label={`${$t('select_month')} ${key}`}
			>
				<div class="text-gray-800 font-bold">{key}</div>
				<div class="text-emerald-700 text-lg group-hover:text-emerald-800">{value}</div>
			</button>
		{/each}
	</div>
</div>

{#if selectedMonth}
	<div class="max-w-[800px] mx-auto">
		<div style="height: 300px; margin-top: 20px;">
			<canvas bind:this={monthlyChartCanvas}></canvas>
		</div>
	</div>
{/if}

<div class="max-w-[800px] mx-auto my-8">
	<div
		class="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-4 scrollbar-thin scrollbar-thumb-emerald-200 pb-2"
	>
		<div class="min-w-[220px] md:min-w-0">
			<StatCard
				title={$t('total_plays')}
				value={userTuneStats.totalPlayCount}
				icon={faChartBar}
				color="orange"
			/>
		</div>
		<div class="min-w-[220px] md:min-w-0">
			<StatCard
				title={$t('memorized_name')}
				value={userTuneStats.rememberNameCount}
				icon={faBook}
				color="teal"
			/>
		</div>
		<div class="min-w-[220px] md:min-w-0">
			<StatCard
				title={$t('memorized_melody')}
				value={userTuneStats.rememberMelodyCount}
				icon={faMusic}
				color="emerald"
			/>
		</div>
	</div>
</div>

<div class="max-w-[800px] mx-auto my-8">
	<h3 class="text-lg font-bold mb-2">{$t('remembered_melody_by_type')}</h3>
	<div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
		{#each Object.entries(rhythmMelodyStats) as [rhythm, stats]}
			<div
				class="bg-white shadow-md rounded-xl p-2 md:p-4 flex flex-col items-center min-h-[60px] md:min-h-[90px] border border-emerald-100"
			>
				<div class="font-bold text-gray-800 mb-0.5 md:mb-1">{rhythm}</div>
				<div class="text-emerald-700 text-xl font-mono">{stats.remembered} / {stats.total}</div>
			</div>
		{/each}
	</div>
</div>
