<!-- <script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$modules/store';
	import type { UserTune } from '../../types/userTune';
	import { getDate } from '$modules/getDate';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import { getDailyTotal, getMonthlyDatas, getMonthlyStatistics } from '$modules/statistics';
	import { Line, Bar } from 'svelte-chartjs';
	import { Chart, registerables } from 'chart.js';

	let uid: string = '';
	const db = getFirestore();
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

	Chart.register(...registerables);

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
	});
	$: lineData = {
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
	};
	const options = {
		responsive: true,
		maintainAspectRatio: false
	};
	const selectMonth = (month: string) => {
		if (monthlyDatas[month] === 0) {
			return;
		}
		selectedMonth = month;
		getMonthlyStatistics(month, uid).then((data) => {
			MonthlyStatistics = data;
		});
	};
</script>

<h3>最近の演奏回数</h3>
<div style="height: 300px;">
	<Line data={lineData} {options} />
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
	</div>
{/if} -->
