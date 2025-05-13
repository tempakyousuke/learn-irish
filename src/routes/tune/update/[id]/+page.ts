import { db } from '$core/data/firebase/firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import type { Tune } from '$core/data/models/Tune';

export async function load({ params }) {
	const d = await getDoc(doc(db, 'tunes', params.id));
	const data = d.data();
	const tune = {
		id: d.id,
		...data
	} as Tune;
	return {
		tune
	};
}
