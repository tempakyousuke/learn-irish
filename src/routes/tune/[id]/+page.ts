import { db } from '$core/data/firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { parseTuneData } from '$core/data/models/Tune';
import type { SetFull } from '$core/data/models/Set';
import type { TuneFull } from '$core/data/models/Tune';
import { SetRepository } from '$core/data/repositories/setRepository';
import { TuneRepository } from '$core/data/repositories/tuneRepository';

export async function load({ params }: { params: { id: string } }) {
	const d = await getDoc(doc(db, 'tunes', params.id));
	const data = d.data() || {};
	const tune = parseTuneData(data, params.id);

	// この曲が含まれるセットを取得
	let sets: SetFull[] = [];
	let setTunes: TuneFull[][] = [];

	try {
		sets = await SetRepository.getSetsByTuneId(params.id);

		// 各セットの曲リストを取得
		for (const set of sets) {
			const tunesInSet = await Promise.all(
				set.tuneIds.map(async (tuneId) => {
					return await TuneRepository.getTuneById(tuneId);
				})
			);
			// nullを除外して正しい曲のみを保持
			setTunes.push(tunesInSet.filter((t): t is TuneFull => t !== null));
		}
	} catch (error) {
		console.error('セット情報の取得に失敗しました:', error);
		// エラーが発生してもページは表示できるように空配列を設定
		sets = [];
		setTunes = [];
	}

	return {
		tune,
		sets,
		setTunes
	};
}
