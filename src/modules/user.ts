import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

export const setCreationTime = async (uid: string, creationTime?: string) => {
	const db = getFirestore();
	const userDocRef = doc(db, `users/${uid}`);
	const userDoc = await getDoc(userDocRef);
	if (!userDoc.exists() || userDoc.data()?.creationTime === undefined) {
		if (!creationTime) {
			const date = new Date();
			creationTime = date.toISOString();
		}
		setDoc(userDocRef, { creationTime: creationTime }, { merge: true });
	}
};
