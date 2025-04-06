<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$modules/store';
	import type { UserTune } from '../../types/userTune';
	import { getDate } from '$modules/getDate';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import { getDailyTotal, getMonthlyDatas } from '$modules/statistics';
	import { Line, Bar } from "svelte-chartjs";
	import { Chart, registerables } from "chart.js";

	let uid: string = '';
	const db = getFirestore();
	// 直近7日間の日付の配列を保存
	let dates =
		(() => {
			let dates = [];
			for (let i = 7; i--; i > -1) {
				dates.push(getDate(i));
			}
			return dates;
		})();
	let weeklyCounts: {
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
		const monthlyDatas = await getMonthlyDatas(uid);
		console.log(monthlyDatas);
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
	}
	const options = {
		responsive: true,
		maintainAspectRatio: false
	};
</script>

<h3>最近の演奏回数</h3>
<div style="height: 300px;">
	<Line data={lineData} {options} />
</div>

<h3>月ごとの記録</h3>

