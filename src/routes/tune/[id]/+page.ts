import { db } from '$modules/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Tune } from '../../../types/tune';

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
