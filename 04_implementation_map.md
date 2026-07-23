# 元リポジトリの実装マップ

この文書は、Codexが調査範囲を広げすぎないための目安である。実際の最新コードを優先する。

## 主要ファイル

| 目的 | 主なファイル |
|---|---|
| 画面状態と遷移 | `src/App.tsx` |
| 共通型 | `src/types.ts` |
| 標準チェックリスト | `src/checklistData.ts` |
| チェックリスト取り込み | `src/checklistImport.ts` |
| チェックリスト保存 | `src/checklistStorage.ts` |
| 開始画面 | `src/components/RoundStart.tsx` |
| メイン画面 | `src/components/MainScreen.tsx` |
| 下部タブ | `src/components/BottomTabBar.tsx` |
| チェックタブ | `src/components/ChecklistTab.tsx` |
| カテゴリ表示 | `src/components/CategoryAccordion.tsx` |
| A/B/C評価 | `src/components/RatingButtons.tsx` |
| 写真追加 | `src/components/PhotoForm.tsx` |
| 写真一覧 | `src/components/PhotoTab.tsx` |
| 総評 | `src/components/EvaluationTab.tsx` |
| Word生成・プレビュー | `src/components/ReportPreview.tsx` |
| テーマ | `src/ThemeContext.tsx`, `src/themes.ts` |
| キャラクター／アイコン | `src/IconContext.tsx`, `src/icons.ts` |
| アクセス解析 | `src/analytics.ts` |
| 全体CSS | `src/index.css` |
| HTMLメタ情報 | `index.html` |
| PWA | `public/sw.js`, manifest関連ファイル |
| 紹介ページ | `public/about/` または相当ファイル |
| ライセンス | `LICENSE`, `NOTICE` |

## 最小変更の考え方

### 変更優先度: 高

- 表示名の一括置換
- ロゴ・キャラクター
- HTMLとmanifest
- `/about/`
- Analytics削除
- 音声入力UIの非表示
- Word内ブランド名
- Service Workerのキャッシュ名とアセット一覧
- README

### 変更優先度: 中

- 配色
- テーマ名
- localStorageキー
- PWAアイコン
- 印刷用CSS

### 原則として変更しない

- データモデル
- A/B/C評価ロジック
- チェックリストの9カテゴリ・22項目相当構造
- 写真圧縮
- docx生成の基本構造
- 保存済みラウンドの処理
- CSV/XLS/XLSXパーサー
- Reactの状態管理方式
- ビルドツール

## 文字列検索

実装前後で次を検索する。

```bash
grep -Rni "めぐる君" .
grep -Rni "ict-round" .
grep -RniE "山口|田中|コネクト合同会社|KRICT" public src README.md index.html
grep -RniE "gtag|googletagmanager|google-analytics" .
```

`ict-round` は内部識別子、元URL、ライセンス記載として残る場合がある。利用者向け表示に残っていないかを判断する。

## 注意点

- READMEやdocsと実装が食い違う場合、`src/` の現行実装を優先する
- Service Worker変更後は、ブラウザに旧キャッシュが残るため、キャッシュ名を更新する
- ロゴは横長であるため、PWAアイコンとして直接縮小すると判読できない
- Word生成へ画像を追加すると、バンドルや出力が不安定になる可能性がある
- PDFはブラウザ印刷で十分であり、別ライブラリを導入しない
