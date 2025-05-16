import type { UserTuneFull } from '$core/data/models/UserTune';
import type { TuneFull } from '$core/data/models/Tune';

export interface UserTuneStats {
	rememberNameCount: number;
	rememberMelodyCount: number;
	totalPlayCount: number;
}

/**
 * UserTuneの配列から各種統計情報を集計する
 * @param userTunes UserTuneFull[]
 */
export function calcUserTuneStats(userTunes: UserTuneFull[]): UserTuneStats {
	let rememberNameCount = 0;
	let rememberMelodyCount = 0;
	let totalPlayCount = 0;

	for (const tune of userTunes) {
		if (tune.rememberName) rememberNameCount++;
		if (tune.rememberMelody) {
			rememberMelodyCount++;
		}
		totalPlayCount += tune.playCount || 0;
	}

	return {
		rememberNameCount,
		rememberMelodyCount,
		totalPlayCount
	};
}

export type RhythmMelodyStats = Record<string, { remembered: number; total: number }>;

/**
 * rhythmごとに「覚えた曲数/全ての曲数」を集計する
 * @param userTunes UserTuneFull[]
 * @param tunes TuneFull[]
 * @returns Record<rhythm, { remembered: number; total: number }>
 */
export function countRememberedMelodyByRhythm(
	userTunes: UserTuneFull[],
	tunes: TuneFull[]
): RhythmMelodyStats {
	// rhythmごとの全曲数を集計
	const totalByRhythm: Record<string, number> = {};
	for (const tune of tunes) {
		const rhythm = tune.rhythm || 'その他';
		totalByRhythm[rhythm] = (totalByRhythm[rhythm] || 0) + 1;
	}

	// 曲IDからrhythmを引けるようにMap化
	const tuneIdToRhythm = new Map<string, string>(tunes.map((t) => [t.id, t.rhythm || 'その他']));

	// rhythmごとの覚えた曲数を集計
	const rememberedByRhythm: Record<string, number> = {};
	for (const userTune of userTunes) {
		if (!userTune.rememberMelody) continue;
		const rhythm = tuneIdToRhythm.get(userTune.id) || 'その他';
		rememberedByRhythm[rhythm] = (rememberedByRhythm[rhythm] || 0) + 1;
	}

	// 両方をまとめて返す
	const result: RhythmMelodyStats = {};
	for (const rhythm of Object.keys(totalByRhythm)) {
		result[rhythm] = {
			remembered: rememberedByRhythm[rhythm] || 0,
			total: totalByRhythm[rhythm] || 0
		};
	}
	return result;
}
