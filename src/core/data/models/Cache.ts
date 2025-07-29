import type { TuneListView } from './Tune';
import type { FirebaseFirestore } from 'firebase/firestore';

/**
 * トップページ用楽曲一覧キャッシュの型定義
 * 600件の楽曲データを1つのドキュメントにまとめて読み取り回数を削減
 */
export interface TuneListViewCache {
	/** 楽曲データ配列（TuneListViewの全件） */
	data: TuneListView[];
	/** 最終更新日時 */
	lastUpdated: FirebaseFirestore.Timestamp;
	/** キャッシュバージョン（スキーマ変更時の管理用） */
	version: number;
	/** 総件数（検証用） */
	totalCount: number;
}

/**
 * キャッシュの設定定数
 */
export const CACHE_CONFIG = {
	/** キャッシュドキュメントのコレクション名 */
	COLLECTION_NAME: 'cache',
	/** 楽曲一覧キャッシュのドキュメントID */
	TUNE_LIST_VIEW_DOC_ID: 'tune-list-view',
	/** 現在のキャッシュバージョン */
	CURRENT_VERSION: 1
} as const;
