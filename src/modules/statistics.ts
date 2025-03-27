import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDate } from './getDate';

const cache: Record<string, Record<string, number>> = {}; // 月ごとのキャッシュ

export const getDailyTotal = async (date: string, uid: string) => {
	const db = getFirestore();
	const currentDate = getDate();
	const yearmonth = date.slice(0, 7);

	// すでにキャッシュされている場合はキャッシュを使う

	if (cache[yearmonth] !== undefined && cache[yearmonth][date] !== undefined) {
		return cache[yearmonth][date];
	}

	// 統計情報のcollectionから情報を取得
	const statisticsRef = doc(db, `users/${uid}/statistics/${yearmonth}`);
	const statisticsData = (await getDoc(statisticsRef)).data() || {};

	// キャッシュに保存
	cache[yearmonth] = statisticsData;

	if (statisticsData[date] === undefined || date === currentDate) {
		// 情報がない場合、または当日のdataはdailyから計算
		const dailyDocRef = doc(db, `users/${uid}/daily/${date}`);
		const dailyData = (await getDoc(dailyDocRef)).data() || {};
		let total = 0;
		for (const [, count] of Object.entries(dailyData)) {
			total += count;
		}
		// 統計情報を更新
		if (date !== currentDate) {
			setDoc(
				statisticsRef,
				{
					[date]: total
				},
				{ merge: true }
			);
		}
		return total;
	} else {
		return statisticsData[date];
	}
};
