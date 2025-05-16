import type { UserTuneFull } from '$core/data/models/UserTune';

export interface UserTuneStats {
	rememberNameCount: number;
	rememberMelodyCount: number;
	totalPlayCount: number;
	melodyByRhythm: Record<string, number>;
}

/**
 * UserTuneの配列から各種統計情報を集計する
 * @param userTunes UserTuneFull[] & { rhythm?: string }[]
 */
export function calcUserTuneStats(
	userTunes: (UserTuneFull & { rhythm?: string })[]
): UserTuneStats {
	let rememberNameCount = 0;
	let rememberMelodyCount = 0;
	let totalPlayCount = 0;
	const melodyByRhythm: Record<string, number> = {};

	for (const tune of userTunes) {
		if (tune.rememberName) rememberNameCount++;
		if (tune.rememberMelody) {
			rememberMelodyCount++;
			const rhythm = tune.rhythm || 'その他';
			melodyByRhythm[rhythm] = (melodyByRhythm[rhythm] || 0) + 1;
		}
		totalPlayCount += tune.playCount || 0;
	}

	return {
		rememberNameCount,
		rememberMelodyCount,
		totalPlayCount,
		melodyByRhythm
	};
}
