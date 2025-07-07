/**
 * ユーザーの曲に関する情報の型定義
 */

import type { TuneReference } from './Tune';

/**
 * 再生履歴のエントリ
 */
export interface PlayHistoryEntry {
	/** 日付（YYYY-MM-DD形式） */
	date: string;
	/** その日の演奏回数 */
	count: number;
}

/**
 * ユーザーの曲に関する基本情報インターフェース
 */
export interface UserTuneBase extends TuneReference {
	/** 曲名を覚えたかどうか */
	rememberName: boolean;
	/** メロディーを覚えたかどうか */
	rememberMelody: boolean;
	/** 演奏回数 */
	playCount: number;
	/** 最後に演奏した日付（YYYY-MM-DD形式） */
	lastPlayedDate?: string;
}

/**
 * ユーザーの曲に関する詳細情報インターフェース
 */
export interface UserTuneDetails {
	/** ユーザーのノート */
	note: string;
	/** 日付ごとの練習履歴 */
	playHistory: {
		[key: string]: number;
	};
}

/**
 * 完全なユーザー曲情報インターフェース
 */
export interface UserTuneFull extends UserTuneBase, UserTuneDetails {}

/**
 * 既存のUserTune型との後方互換性を維持するための型
 * @deprecated UserTuneFullを使用してください
 */
export type UserTune = UserTuneFull;

/**
 * ユーザー曲情報の必須フィールドを指定して新しいオブジェクトを作成する関数
 */
export function createUserTune(
	base: UserTuneBase,
	details: Partial<UserTuneDetails> = {}
): UserTuneFull {
	return {
		...base,
		note: details.note || '',
		playHistory: details.playHistory || {}
	};
}

/**
 * 演奏回数を増やす関数
 * @param userTune ユーザー曲情報
 * @param date 日付（YYYY-MM-DD形式、デフォルトは今日）
 * @param count 増やす回数（デフォルトは1）
 * @returns 更新されたユーザー曲情報
 */
export function incrementPlayCount(
	userTune: UserTuneFull,
	date?: string,
	count: number = 1
): UserTuneFull {
	const today = date || new Date().toISOString().split('T')[0];

	const playHistory = { ...userTune.playHistory };
	playHistory[today] = (playHistory[today] || 0) + count;

	return {
		...userTune,
		playCount: userTune.playCount + count,
		playHistory,
		lastPlayedDate: today
	};
}

/**
 * playHistoryから最後に演奏した日付を取得する関数
 * @param playHistory 演奏履歴
 * @returns 最後に演奏した日付（YYYY-MM-DD形式）、演奏履歴がない場合はundefined
 */
export function getLastPlayedDate(playHistory: { [key: string]: number } | undefined | null): string | undefined {
	if (!playHistory) return undefined;
	const dates = Object.keys(playHistory).filter((date) => playHistory[date] > 0);
	if (dates.length === 0) return undefined;
	return dates.sort().pop();
}

/**
 * UserTuneのlastPlayedDateを補完する関数
 * 既存のデータでlastPlayedDateが設定されていない場合、playHistoryから設定する
 * @param userTune ユーザー曲情報
 * @returns lastPlayedDateが更新されたユーザー曲情報
 */
export function ensureLastPlayedDate(userTune: UserTuneFull): UserTuneFull {
	if (userTune.lastPlayedDate) {
		return userTune;
	}

	const lastPlayedDate = getLastPlayedDate(userTune.playHistory || {});
	return {
		...userTune,
		lastPlayedDate
	};
}
