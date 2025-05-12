import { db } from '$modules/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { parseTuneData } from '../../../types/models/Tune';

export async function load({ params }: { params: { id: string } }) {
	const d = await getDoc(doc(db, 'tunes', params.id));
	const data = d.data() || {};
	const tune = parseTuneData(data, params.id);
	return {
		tune
	};
}
