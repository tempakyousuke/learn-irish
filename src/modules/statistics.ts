import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDate } from './getDate';
import { getUser } from './user';

const cache: Record<string, Record<string, number>> = {}; // 月ごとのキャッシュ

export const getDailyTotal = async (date: string, uid: string) => {
	const db = getFirestore();
	const currentDate = getDate();
	const yearMonth = date.slice(0, 7);

	// すでにキャッシュされている場合はキャッシュを使う

	if (cache[yearMonth] !== undefined && cache[yearMonth][date] !== undefined) {
		return cache[yearMonth][date];
	}

	// 統計情報のcollectionから情報を取得
	const statisticsRef = doc(db, `users/${uid}/statistics/${yearMonth}`);
	const statisticsData = (await getDoc(statisticsRef)).data() || {};

	// キャッシュに保存
	cache[yearMonth] = statisticsData;

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

export const getMonthlyDatas = async (uid: string): Promise<{ [key: string]: number }> => {
	const user = await getUser(uid);
	if (!user) return {};
	const createdAt = new Date(user.creationTime);

	// creattionTimeから現在までの年月を取得
	const currentDate = getDate();
	const yearMonth = currentDate.slice(0, 7);
	const yearMonthList: string[] = [];
	const startYear = createdAt.getFullYear();
	const startMonth = createdAt.getMonth() + 1;

	for (let i = startYear; i <= parseInt(yearMonth.split('-')[0]); i++) {
		// 年が変わる場合、開始月を1月にリセット
		const monthStart = i === startYear ? startMonth : 1;
		for (let j = monthStart; j <= 12; j++) {
			const ym = `${i}-${String(j).padStart(2, '0')}`;
			if (ym > yearMonth) break;
			yearMonthList.push(ym);
		}
	}

	const monthlyDatas: { [key: string]: number } = {};
	for (const yearMonth of yearMonthList) {
		monthlyDatas[yearMonth] = await getMonthlyTotal(yearMonth, uid);
	}
	return monthlyDatas;
};

export const getMonthlyTotal = async (yearMonth: string, uid: string) => {
	const db = getFirestore();
	const statisticsRef = doc(db, `users/${uid}/statistics/${yearMonth}`);
	const statisticsData = (await getDoc(statisticsRef)).data() || {};
	// monthlyTotalのkeyが存在している場合はその値を返す ただし、yearMonthが現在の年月の場合は計算する
	if (
		Object.prototype.hasOwnProperty.call(statisticsData, 'monthlyTotal') &&
		yearMonth !== getDate().slice(0, 7)
	) {
		return statisticsData.monthlyTotal;
	}
	// monthlyTotalのkeyが存在しない場合は1日から末日までgetDailyTotalを呼び出して合計を計算
	const dates = getDatesOfMonth(yearMonth);
	let total = 0;
	for (const date of dates) {
		const dailyTotal = await getDailyTotal(date, uid);
		total += dailyTotal;
	}
	// monthlyTotalをstatisticsRefに保存
	await setDoc(
		statisticsRef,
		{
			monthlyTotal: total
		},
		{ merge: true }
	);

	return total;
};

// return ['2023-01-01', '2023-01-02', ...]
export const getDatesOfMonth = (yearMonth: string): string[] => {
	const [year, month] = yearMonth.split('-').map(Number);

	// 月末日を取得する
	const lastDay = new Date(year, month, 0).getDate();

	const dates = [];
	for (let day = 1; day <= lastDay; day++) {
		// 日付をゼロ埋めして "YYYY-MM-DD" 形式にする
		const formattedDay = String(day).padStart(2, '0');
		const formattedMonth = String(month).padStart(2, '0');
		dates.push(`${year}-${formattedMonth}-${formattedDay}`);
	}

	return dates;
};
