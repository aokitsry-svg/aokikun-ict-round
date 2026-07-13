# ICN感染対策ラウンドアプリ「めぐる君」

<p align="center"><img src="public/meguru.png" width="160" alt="めぐる君"></p>

<p align="center"><strong>公開URL: <a href="https://ict-round.conect.llc/">https://ict-round.conect.llc/</a></strong></p>

<p align="center"><img src="docs/assets/distribution-qr.png" alt="QRコード"></p>

病院の感染対策ラウンドを、スマートフォンやタブレットで記録し、Word 形式の報告書として出力する React + TypeScript 製の Web アプリです。チェックリスト評価、写真記録、総評入力、ラウンド保存、チェックリスト取り込みまでをブラウザ内で完結します。

## 主な機能

- 担当者名と病棟名を入力してラウンド開始
- 標準チェックリストでの A / B / C 評価入力
- CSV / Excel (`.csv` / `.xls` / `.xlsx`) からのチェックリスト取り込み
- 項目紐付き写真と汎用写真の追加、削除
- 総評入力、箇条書き補助、音声入力
- レポートプレビュー表示
- Word (`.docx`) 生成、対応端末では共有シート連携
- 保存済みラウンドのローカル保存、再開、削除
- テーマとキャラクターアイコンの切り替え保持
- Service Worker による PWA 対応とアセットキャッシュ

## 画面構成

1. ラウンド開始画面
2. 保存済みラウンド一覧
3. メイン画面
4. 写真追加画面
5. レポートプレビュー画面

メイン画面は `チェック` `写真` `総評` の 3 タブ構成です。

## 標準チェックリスト

- 初回起動時に `標準チェックリスト` を自動登録
- 9カテゴリ・22項目を収録
- 開始画面で使用するチェックリストを選択
- 取り込み済みチェックリストは複数保持可能

## データ保存の考え方

- 入力中のラウンドは React state 上で保持
- ヘッダーの `保存` ボタンを押したラウンドは `localStorage` に保存
- 保存済みラウンドは開始画面の `保存済みラウンドを開く` から再開可能
- チェックリストライブラリ、選択中チェックリスト、テーマ、アイコンも `localStorage` に保存
- 未保存の入力内容は、ページ再読み込みやタブ終了で失われます

## レポート出力

生成される報告書には以下が含まれます。

- 担当者名
- 病棟名
- 実施日時
- チェックリスト評価一覧
- 写真記録
- 総評

出力形式は PDF ではなく `.docx` です。Web Share API でファイル共有できる環境では共有ボタン表示になり、未対応環境では Word ファイルを保存します。

## 技術スタック

- React 19
- TypeScript 5
- Vite 8
- Tailwind CSS 4
- `docx`
- `file-saver`
- `xlsx`

## セットアップ

### 前提

- Node.js
- npm

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

## 利用手順

1. 開始画面で使用するチェックリストを選び、担当者名を入力してラウンドを開始します。
2. 必要に応じて `取り込む` から CSV / Excel のチェックリストを追加します。
3. `チェック` タブで各項目を A / B / C で評価します。
4. `写真` タブ、または項目導線から写真を追加します。コメントも入力できます。
5. `総評` タブで総評を入力します。必要なら箇条書き補助や音声入力を使います。
6. 途中で残す場合はヘッダーの `保存` を押します。
7. `レポート` から内容を確認し、Word 出力または共有を行います。

## 利用可能なスクリプト

- `npm run dev` : 開発サーバーを起動
- `npm run build` : TypeScript チェックと本番ビルドを実行
- `npm run preview` : ビルド結果をローカル確認
- `npm run lint` : ESLint を実行

## 実装上の注意

- バックエンド、データベース、外部 API はありません
- 写真は 10MB 以下の画像ファイルのみ取り込み可能です
- 画像はブラウザ内で JPEG に圧縮し、データ URL として保持します
- 音声入力は `SpeechRecognition` / `webkitSpeechRecognition` 対応ブラウザでのみ利用できます
- Service Worker は **本番でのみ** `index.html` から登録され、アプリシェルと Google Fonts をキャッシュします
- 開発時（`localhost` / `127.0.0.1`）は Service Worker を登録しません。過去に登録された SW が別プロジェクトや別ポートのキャッシュと混線し、古い画面や意図しないアプリが表示されるのを防ぐため、既存の登録があれば自動で解除します
- `npm run dev` では紹介ページ `/about/` は SPA フォールバックでアプリ本体が返るため、開発中にランディングを確認するときは `/about/index.html` を開くか、`npm run build && npm run preview`（`/about/` で正しく表示）を使います
- 現状 Service Worker の登録・キャッシュ制御は `public/sw.js` と `index.html` に手書きしています。本来は `vite-plugin-pwa` 等の専用プラグインに任せるほうが、dev 時の無効化や precache、更新制御を一貫して扱えてクリーンです
- Vite の `base` は `./` に設定されています

## 推奨利用環境

- iPhone / iPad Safari
- Android Chrome
- PC の Chrome / Edge / Safari

## 関連ドキュメント

- [docs/user-guide.md](docs/user-guide.md)
- [docs/technical-spec.md](docs/technical-spec.md)
- `docs/reference/round-checklist.xlsx`
- `docs/assets/distribution-qr.png`

## ライセンス

本ソフトウェアは [Apache License 2.0](LICENSE) のもとで公開されています。
複製・改変・再配布・商用利用が可能です。詳細は [LICENSE](LICENSE) および [NOTICE](NOTICE) を参照してください。
