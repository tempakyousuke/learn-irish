# Learn Irish プロジェクトの技術的負債

このドキュメントでは、現在のプロジェクトで特定された技術的負債について記載します。技術的負債とは、将来的に対処すべき問題や改善点で、現状では機能しているものの、長期的には保守性、拡張性、セキュリティなどの観点から問題となる可能性があるものです。

## 1. Firebase設定情報の取り扱い（問題なし）

### 注記

- `src/modules/firebase.ts` にFirebaseの設定情報（APIキーなど）がハードコードされていますが、これは問題ありません。
- FirebaseのAPIキーは他の一般的なAPIキーとは異なり、バックエンドリソースへのアクセス制御には使用されず、プロジェクトの識別のみに使用されます。
- Firebase公式ドキュメントでは、「APIキーをコードに含めたり、設定ファイルにチェックインしたりしても問題ない」と明記されています。

### 真のセキュリティ対策

- データベースやストレージのセキュリティはFirebase Security Rulesを通じて確保するべきです
- 複数の環境（開発・テスト・本番）を使い分ける場合は、環境ごとに適切なFirebaseプロジェクト設定を使用する

## 2. コードの重複と再利用性（一部対応済み）

### 問題点

- ~~ルートコンポーネント内にナビゲーション関連のコードが直接埋め込まれている~~ → 対応済み
- ~~認証状態の管理ロジックが複数のコンポーネントに散在している~~ → 対応済み
- 他のコンポーネントでも共通UIパターンが再利用されていない箇所がある

### 実施された対策

- ナビゲーション関連のコードを `src/lib/layout/navigation/` ディレクトリに独立したコンポーネント（Header.svelteとDrawer.svelte）として抽出
- 認証状態の管理ロジックを `src/modules/auth/authService.ts` に集約し、派生ストアを作成して使いやすくした
- ページコンポーネントを更新して新しい認証サービスを利用するようにした

### 残りの対策

- さらに共通UIパターンをコンポーネントライブラリとして整理

## 3. キャッシュ戦略の欠如（対応済み）

### 問題点

- ~~`getTunes.ts` では曲データをメモリ内にキャッシュしていますが、このキャッシュは永続的ではなく、ページのリロードで失われます。~~ → 対応済み
- ~~キャッシュの有効期限や更新戦略が定義されていない~~ → 対応済み

### 実施された対策

- `src/lib/utils/cacheStorage.ts` にローカルストレージを使用した汎用的なキャッシュ管理クラスを実装
- `getTunes.ts` にローカルストレージキャッシュを実装し、24時間の有効期限を設定
- メインページに更新ボタンを追加して、キャッシュの強制更新機能を実装
- 既存のメモリキャッシュとの互換性を維持

### 将来的な対策

- 可能であればServiceWorkerを使用したオフラインサポートの追加

## 4. エラーハンドリングの不足（一部対応済み）

### 問題点

- ~~Firebase操作（認証、データ取得など）のエラーハンドリングが不十分~~ → 一部対応済み
- ~~ユーザーに適切なエラーメッセージが表示されない場合がある~~ → 一部対応済み
- 一部のFirebase操作やページでまだエラーハンドリングが不足している箇所がある

### 実施された対策

- 主要なデータ取得モジュール（`getTunes.ts`、`user.ts`）にエラーハンドリングを追加
- 共通のエラーハンドリングユーティリティ（`errorHandling.ts`）を作成
- エラーメッセージ表示用のコンポーネント（`ErrorMessage.svelte`）を作成
- メインページにエラー表示機能を追加

### 残りの対策

- すべてのFirebase操作に包括的なエラーハンドリングを追加
- エラーログの収集と監視の仕組みの導入

## 5. 型定義の改善点（対応済み）

### 問題点

- ~~`tune.ts` の型定義ではほとんどのプロパティがオプショナル（`?:`）になっており、型安全性が低下しています~~ → 対応済み
- ~~NULL値や未定義値の取り扱いが一貫していない~~ → 対応済み
- ~~データ変換時に型アサーションを使用していて、型安全性が低下している~~ → 対応済み

### 実施された対策

- `src/types/models/` ディレクトリを作成し、詳細な型定義を追加
- 曲情報とユーザー曲情報の型をインターフェースに変更し、必須フィールドを明確に定義
- 型ガードと型安全なユーティリティ関数を追加
- コンポーネント間の型の一貫性を確保
- 既存の型定義との後方互換性を維持
- Firestoreのデータを型安全に変換するための`parseTuneData`関数を実装
- ハードコードされた型アサーションを排除し、型安全な変換関数に置き換え

## 6. パフォーマンスの最適化

### 問題点

- メインページで複数のフィルタリングやソートロジックが実行されており、大量のデータがある場合にパフォーマンスが低下する可能性
- 仮想スクロールなどの大量リスト表示の最適化が実装されていない

### 推奨される対策

- メインページのパフォーマンスプロファイリングと最適化
- 大量データ表示時の仮想スクロールの実装
- サーバーサイドでのフィルタリングとページネーションの導入

## 7. テストの欠如

### 問題点

- 単体テスト、結合テスト、E2Eテストがプロジェクトに含まれていない
- テスト可能性を考慮した設計になっていない部分がある

### 推奨される対策

- Vitest/Jestを使用した単体テストの導入
- Playwright/Cypressを使用したE2Eテストの導入
- テスタビリティを向上させるためのコード構造の改善

## 8. READMEの不足

### 問題点

- 現在のREADMEファイルはデフォルトのSvelteプロジェクトREADMEをほぼそのまま使用しており、プロジェクト固有の情報が不足

### 推奨される対策

- プロジェクトの目的、機能、技術スタックを詳細に記述したREADMEの作成
- 開発者向けのセットアップ手順とコントリビューションガイドの追加
- プロジェクト構造に関する詳細な説明の追加

## 9. 国際化（i18n）の改善

### 問題点

- 一部の文字列がハードコードされており、完全な国際化がされていない
- 言語切り替え後の状態管理が最適化されていない

### 推奨される対策

- すべての文字列をi18nシステムに移行
- 言語リソースの整理と一貫性の確保
- 言語切り替え時のUX改善

## 10. 依存関係の管理

### 問題点

- 一部の依存パッケージが古いバージョンである可能性
- 依存関係の更新戦略が明確でない

### 推奨される対策

- 依存パッケージの定期的な監査と更新
- セキュリティ脆弱性スキャンの導入
- npm-check-updatesなどのツールを使用した依存関係の管理

## 優先度とロードマップ

上記の技術的負債を優先度順に整理すると、以下のようになります：

1. **高優先度** - 即時対応すべき項目
   - エラーハンドリングの改善（一部対応済み）

2. **中優先度** - 近いうちに対応すべき項目
   - コードの重複と再利用性の改善（一部対応済み）
   - ~~キャッシュ戦略の実装~~ → 対応済み
   - ~~型定義の改善~~ → 対応済み
   - Firebase Security Rulesの見直しと強化

3. **低優先度** - 長期的に対応すべき項目
   - パフォーマンスの最適化
   - テストの導入
   - READMEの改善
   - 国際化の完全実装
   - 依存関係の管理改善

この優先順位に従って計画的に技術的負債を解消していくことで、プロジェクトの保守性、安定性、拡張性を向上させることができます。
