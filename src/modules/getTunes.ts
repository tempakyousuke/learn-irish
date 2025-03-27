import { db } from '$modules/firebase';
import { getDocs, collection, query, orderBy } from 'firebase/firestore';
import type { Tune } from '../types/tune';

const tunes: Tune[] = [];

export const getTunes = async () => {
	if (tunes.length) {
		return tunes;
	}
	const qu = query(collection(db, 'tunes'), orderBy('tuneNo', 'asc'));
	const snapshot = await getDocs(qu);
	snapshot.forEach((doc) => {
		const data = doc.data();
		const tune = {
			id: doc.id,
			...data
		} as Tune;
		tunes.push(tune);
	});
	return tunes;
};
