# Learn Irishプロジェクトのフォルダ構造と命名規則に関する改善点

このドキュメントでは、現在のプロジェクトのフォルダ構造、ファイルの設置場所、命名規則に関する分析と改善提案をまとめています。

## 現状分析

現在のプロジェクトは以下のような構造になっています：

```
src/
├── app.css           # グローバルCSS
├── app.d.ts          # TypeScript宣言ファイル
├── app.html          # HTMLテンプレート
├── lib/              # 再利用可能なコンポーネントやユーティリティ
│   ├── assets/       # 静的アセット
│   ├── button/       # ボタンコンポーネント
│   ├── forms/        # フォーム関連コンポーネント
│   ├── images/       # 画像アセットと画像関連コンポーネント
│   ├── layout/       # レイアウトコンポーネント
│   └── tune/         # 曲関連コンポーネント
├── locales/          # 国際化ファイル
│   ├── en.json       # 英語のローカライゼーション
│   └── ja.json       # 日本語のローカライゼーション
├── modules/          # 機能モジュール
│   ├── config.ts
│   ├── favorites.ts
│   ├── firebase.ts
│   ├── getDate.ts
│   ├── getTunes.ts
│   ├── i18n.ts
│   ├── statistics.ts
│   ├── store.ts
│   ├── user.ts
│   └── youtubeId.ts
├── routes/           # SvelteKitのルート（ページ）
│   ├── +layout.svelte
│   ├── +layout.ts
│   ├── +page.svelte
│   ├── +page.ts
│   ├── DailyPlaysTable.svelte
│   ├── FilterControls.svelte
│   ├── StatCard.svelte
│   ├── TuneStats.svelte
│   ├── __options.ts
│   ├── about/
│   ├── mydata/
│   ├── reset-password/
│   ├── signin/
│   ├── signup/
│   └── tune/
└── types/            # TypeScript型定義
    ├── tune.ts
    └── userTune.ts
```

## 改善提案

### 1. フォルダ構造の一貫性

#### 問題点
- `modules/`ディレクトリに異なる種類の機能が混在している
- ルートディレクトリ直下にコンポーネント（`DailyPlaysTable.svelte`など）が配置されている
- 型定義が分散している（`app.d.ts`と`types/`ディレクトリ）

#### 提案
```
src/
├── app/              # アプリケーション固有のコード
│   ├── components/   # アプリケーション固有のコンポーネント
│   │   ├── dashboard/
│   │   ├── statistics/
│   │   └── filters/
│   └── services/     # アプリケーション固有のサービス
├── core/             # コアモジュール・サービス
│   ├── auth/         # 認証関連のロジック
│   ├── data/         # データアクセス層
│   ├── i18n/         # 国際化関連のロジック
│   └── store/        # 状態管理
├── lib/              # 再利用可能なコンポーネントやユーティリティ
├── routes/           # SvelteKitのルート（ページ）
└── types/            # すべての型定義を集約
```

### 2. 命名規則

#### 問題点
- 命名規則が一貫していない（`getTunes.ts`、`getDate.ts`などの動詞始まりと、`user.ts`、`store.ts`などの名詞始まりが混在）
- ファイル命名とその内容・役割が必ずしも一致していない
- ディレクトリ名（`button/`など）とファイル名（`Button.svelte`など）で単数形/複数形の一貫性がない

#### 提案
- **コンポーネント**：PascalCase + `.svelte`（例：`Button.svelte`、`TuneList.svelte`）
- **コンポーネントディレクトリ**：複数形を使用（例：`buttons/`、`forms/`）
- **ユーティリティ/サービス**：camelCase + `.ts`（例：`tuneService.ts`、`dateUtils.ts`）
- **モジュール**：名詞を基本とし、機能を明確に表す名前（例：`firebaseAuth.ts`、`tuneRepository.ts`）
- **型定義**：PascalCase（例：`Tune.ts`、`UserTune.ts`）

### 3. ファイル設置場所

#### 問題点
- ルートのroutesディレクトリにページコンポーネント以外のコンポーネントが混在している
- 関連するロジックや型定義が分散している
- コンポーネントとそれに関連するロジックが分離されている

#### 提案
- **ページコンポーネント**：対応するルートディレクトリ内（`routes/`配下）
- **共有コンポーネント**：`lib/components/`配下に機能ごとに整理
- **ビジネスロジック**：`core/`または`app/services/`配下に機能ごとに整理
- **データアクセス**：`core/data/`配下にリポジトリパターンで整理
- **ユーティリティ関数**：`lib/utils/`配下にカテゴリごとに整理
- **型定義**：
  - 共通型：`types/`配下
  - 機能特有の型：対応する機能モジュール内のサブディレクトリに配置

### 4. 特定の改善点

#### モジュール構造の改善
```
src/core/
├── auth/
│   ├── authService.ts    # 認証関連のビジネスロジック
│   ├── authStore.ts      # 認証状態の管理
│   └── types.ts          # 認証関連の型定義
├── data/
│   ├── repositories/
│   │   ├── tuneRepository.ts
│   │   └── userRepository.ts
│   ├── models/
│   │   ├── Tune.ts
│   │   └── User.ts
│   └── firebase/
│       └── firebaseClient.ts
├── i18n/
│   ├── i18nService.ts
│   └── locales/
│       ├── en.json
│       └── ja.json
└── utils/
    ├── dateUtils.ts
    ├── formatUtils.ts
    └── youtubeUtils.ts
```

#### ページコンポーネントの整理
```
src/routes/
├── +layout.svelte            # グローバルレイアウト
├── +page.svelte              # ホームページ
├── about/
│   └── +page.svelte
├── mydata/
│   ├── +page.svelte
│   ├── components/           # mydata専用のコンポーネント
│   │   ├── DailyPlaysTable.svelte
│   │   └── TuneStats.svelte
│   └── services/             # mydata専用のサービス
│       └── statisticsService.ts
└── tune/
    ├── [id]/
    │   └── +page.svelte
    ├── add/
    │   └── +page.svelte
    └── update/
        └── +page.svelte
```

## 移行戦略

一度にすべての変更を行うのではなく、段階的なリファクタリングを推奨します：

1. 新しいフォルダ構造を設計・ドキュメント化する
2. `src/core/`ディレクトリを作成し、まずはモジュールの再編成から始める
3. 共通コンポーネントを再整理する
4. ページコンポーネントとそれに関連するコンポーネントを整理する
5. 型定義を集約・整理する
6. 新しい命名規則に従ってファイル名を変更する

## まとめ

提案したフォルダ構造と命名規則の改善により、以下のメリットが期待できます：

- **コードの発見性の向上**：関連するコードが論理的に配置され、探しやすくなる
- **開発効率の向上**：命名の一貫性により、新しいファイルの作成や既存ファイルの特定が容易になる
- **保守性の向上**：関連する機能が集約され、修正や拡張が容易になる
- **スケーラビリティの向上**：機能追加時のフォルダ構造の拡張が明確になる
- **チーム開発の効率化**：明確な規則により、チームメンバー間の一貫性が確保される

これらの改善は一度に行う必要はなく、新機能開発や既存機能のリファクタリングのタイミングで徐々に適用していくことも可能です。