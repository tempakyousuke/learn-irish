import { browser } from '$app/environment';

/**
 * ローカルストレージを使用したキャッシュの管理クラス
 * @template T キャッシュするデータの型
 */
export class CacheStorage<T> {
  private readonly key: string;
  private readonly expiryTime: number; // ミリ秒
  private memoryCache: T | null = null;

  /**
   * コンストラクタ
   * @param key キャッシュのキー名
   * @param expiryTimeMs キャッシュの有効期限（ミリ秒）
   */
  constructor(key: string, expiryTimeMs: number = 24 * 60 * 60 * 1000) { // デフォルト24時間
    this.key = `cache_${key}`;
    this.expiryTime = expiryTimeMs;
  }

  /**
   * データをキャッシュに保存
   * @param data 保存するデータ
   */
  set(data: T): void {
    // メモリキャッシュに保存
    this.memoryCache = data;

    // ブラウザ環境でのみローカルストレージに保存
    if (browser) {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.expiryTime
      };
      
      try {
        localStorage.setItem(this.key, JSON.stringify(cacheItem));
      } catch (err) {
        console.warn('キャッシュの保存に失敗しました:', err);
      }
    }
  }

  /**
   * キャッシュからデータを取得
   * @returns キャッシュデータまたはnull（キャッシュがない場合や期限切れの場合）
   */
  get(): T | null {
    // まずメモリキャッシュをチェック
    if (this.memoryCache) {
      return this.memoryCache;
    }

    // ブラウザ環境でのみローカルストレージをチェック
    if (browser) {
      try {
        const cached = localStorage.getItem(this.key);
        
        if (!cached) {
          return null;
        }
        
        const cacheItem = JSON.parse(cached);
        
        // 期限切れチェック
        if (cacheItem.expiry < Date.now()) {
          this.clear(); // 期限切れならキャッシュをクリア
          return null;
        }
        
        // メモリキャッシュにも格納
        this.memoryCache = cacheItem.data;
        
        return cacheItem.data;
      } catch (err) {
        console.warn('キャッシュの読み込みに失敗しました:', err);
        return null;
      }
    }
    
    return null;
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.memoryCache = null;
    
    if (browser) {
      try {
        localStorage.removeItem(this.key);
      } catch (err) {
        console.warn('キャッシュのクリアに失敗しました:', err);
      }
    }
  }

  /**
   * キャッシュが存在するか確認
   * @returns キャッシュが存在し、有効期限内ならtrue
   */
  exists(): boolean {
    return this.get() !== null;
  }

  /**
   * キャッシュをリフレッシュ（有効期限を延長）
   */
  refresh(): void {
    const data = this.get();
    if (data) {
      this.set(data);
    }
  }

  /**
   * キャッシュの有効期限を確認
   * @returns 有効期限の残り時間（ミリ秒）、キャッシュがなければnull
   */
  getTimeToExpiry(): number | null {
    if (!browser) {
      return null;
    }
    
    try {
      const cached = localStorage.getItem(this.key);
      
      if (!cached) {
        return null;
      }
      
      const cacheItem = JSON.parse(cached);
      const remaining = cacheItem.expiry - Date.now();
      
      return remaining > 0 ? remaining : null;
    } catch {
      return null;
    }
  }
}

/**
 * 特定の型のデータをキャッシュするためのヘルパー関数
 * @param key キャッシュキー
 * @param expiryTimeMs 有効期限（ミリ秒）
 * @returns 指定された型のCacheStorageインスタンス
 */
export function createCache<T>(key: string, expiryTimeMs?: number): CacheStorage<T> {
  return new CacheStorage<T>(key, expiryTimeMs);
}