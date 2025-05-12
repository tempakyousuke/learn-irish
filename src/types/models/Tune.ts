/**
 * アイリッシュ音楽の曲に関する型定義
 */

/**
 * 曲の基本情報に関するインターフェース
 * 必須フィールドのみを含む
 */
export interface TuneBase {
  /** 曲のID（ドキュメントID） */
  id: string;
  /** 曲の番号 */
  tuneNo: string;
  /** 曲名 */
  name: string;
}

/**
 * 曲の音楽的特性に関するインターフェース
 */
export interface TuneMusicalProperties {
  /** リズムの種類（jig, reel, hornpipe等） */
  rhythm?: string;
  /** 調（D, G, Aなど） */
  key?: string;
  /** 調性（major, minorなど） */
  mode?: string;
  /** パート数 */
  part?: string;
}

/**
 * 曲のメタ情報に関するインターフェース
 */
export interface TuneMetadata {
  /** セット番号 */
  setNo?: string;
  /** ジャンル */
  genre?: string;
  /** 日付 */
  date?: string;
  /** 楽器 */
  instrument?: string;
  /** 作曲者 */
  composer?: string;
  /** 地域 */
  region?: string;
  /** 別名 */
  alsoKnown?: string;
}

/**
 * 曲の外部リンク情報に関するインターフェース
 */
export interface TuneExternalLinks {
  /** YouTube等のリンク */
  link?: string;
  /** Spotifyリンク */
  spotify?: string;
  /** 楽譜等のソース */
  source?: string;
}

/**
 * 完全な曲情報を表すインターフェース
 * 曲の基本情報、音楽的特性、メタ情報、外部リンクを含む
 */
export interface TuneFull extends TuneBase, TuneMusicalProperties, TuneMetadata, TuneExternalLinks {}

/**
 * 曲の基本的な表示に必要な情報
 */
export interface TuneDisplay extends TuneBase {
  rhythm?: string;
  key?: string;
  mode?: string;
}

/**
 * 既存のTune型との後方互換性を維持するための型
 * @deprecated TuneFullを使用してください
 */
export type Tune = TuneFull;

/**
 * 曲のIDのみを参照する型
 */
export type TuneReference = Pick<TuneBase, 'id'>;

/**
 * 必須フィールドを指定して曲オブジェクトを作成する関数
 */
export function createTune(base: TuneBase, properties: Partial<Omit<TuneFull, keyof TuneBase>> = {}): TuneFull {
  return {
    ...base,
    ...properties
  };
}

/**
 * 曲が必須フィールドを持っているか確認する型ガード
 */
export function isValidTune(tune: Partial<TuneFull>): tune is TuneFull {
  return (
    typeof tune.id === 'string' && 
    typeof tune.tuneNo === 'string' && 
    typeof tune.name === 'string'
  );
}

/**
 * Firestoreから取得したデータをTune型に変換する
 * @param data Firestoreから取得した生データ
 * @param id ドキュメントID
 * @returns 変換されたTune型データ
 */
export function parseTuneData(data: Record<string, unknown>, id: string): TuneFull {
  return createTune(
    {
      id,
      tuneNo: typeof data.tuneNo === 'string' ? data.tuneNo : '0',
      name: typeof data.name === 'string' ? data.name : 'Unknown Tune'
    },
    {
      setNo: typeof data.setNo === 'string' ? data.setNo : undefined,
      link: typeof data.link === 'string' ? data.link : undefined,
      genre: typeof data.genre === 'string' ? data.genre : undefined,
      date: typeof data.date === 'string' ? data.date : undefined,
      rhythm: typeof data.rhythm === 'string' ? data.rhythm : undefined,
      key: typeof data.key === 'string' ? data.key : undefined,
      mode: typeof data.mode === 'string' ? data.mode : undefined,
      part: typeof data.part === 'string' ? data.part : undefined,
      instrument: typeof data.instrument === 'string' ? data.instrument : undefined,
      spotify: typeof data.spotify === 'string' ? data.spotify : undefined,
      source: typeof data.source === 'string' ? data.source : undefined,
      composer: typeof data.composer === 'string' ? data.composer : undefined,
      region: typeof data.region === 'string' ? data.region : undefined,
      alsoKnown: typeof data.alsoKnown === 'string' ? data.alsoKnown : undefined
    }
  );
}