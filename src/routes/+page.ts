import { db } from '$modules/firebase';
import { getDocs, collection, query } from 'firebase/firestore';
import type { Tune } from '../types/tune';

export async function load() {
	const qu = query(collection(db, 'tunes'));
	const snapshot = await getDocs(qu);
	const tunes: Tune[] = [];
	snapshot.forEach((doc) => {
		const data = doc.data();
		const tune = {
			id: doc.id,
			...data
		} as Tune;
		tunes.push(tune);
	});
	return {
		tunes
	};
}
