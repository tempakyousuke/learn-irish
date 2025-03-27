import { getTunes } from '$modules/getTunes';

export async function load() {
	const tunes = await getTunes();
	return {
		tunes
	};
}
