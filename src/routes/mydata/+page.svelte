<script lang="ts">
	import { goto } from '$app/navigation';
	import { userStore } from '$modules/store';
	import type { UserTune } from '../../types/userTune';
	import { getDate } from '$modules/getDate';
	import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
	import { getDailyTotal } from '$modules/statistics';

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

	userStore.subscribe(async (value) => {
		uid = value.uid;
		if (!uid) {
			return;
		}
		for (const date of dates) {
			const dailyTotal = await getDailyTotal(date, uid);
			weeklyCounts[date] = dailyTotal;
		}
	});
</script>
