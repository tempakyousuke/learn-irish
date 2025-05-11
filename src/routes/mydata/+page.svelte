<script lang="ts">
	import { userStore } from '$modules/store';
	import { getDate } from '$modules/getDate';
	import { getDailyTotal, getMonthlyDatas, getMonthlyStatistics } from '$modules/statistics';
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

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
	});

	onMount(() => {
		// ウィークリーチャートを初期化
		initWeeklyChart();
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

<h3>最近の演奏回数</h3>
<div style="height: 300px;">
	<canvas bind:this={weeklyChartCanvas}></canvas>
</div>

<div class="max-w-[800px] mx-auto">
	<h3>月ごとの記録</h3>
	<div class="grid grid-cols-12">
		{#each Object.entries(monthlyDatas) as [key, value]}
			<button
				class="flex col-span-4 border"
				on:click={() => selectMonth(key)}
				aria-label={`Select month ${key}`}
			>
				<div class="w-1/2">{key}</div>
				<div class="w-1/2">{value}</div>
			</button>
		{/each}
	</div>
</div>

{#if selectedMonth}
	<div class="max-w-[800px] mx-auto">
		<h3>{selectedMonth}の演奏回数</h3>
		<div class="grid grid-cols-12">
			{#each Object.entries(MonthlyStatistics) as [key, value]}
				<div class="flex col-span-4 border">
					<div class="w-1/2">{key}</div>
					<div class="w-1/2">{value}</div>
				</div>
			{/each}
		</div>

		<div style="height: 300px; margin-top: 20px;">
			<canvas bind:this={monthlyChartCanvas}></canvas>
		</div>
	</div>
{/if}
