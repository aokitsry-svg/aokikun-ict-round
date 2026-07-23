# AGENTS.md — あおき君 Phase 1

## Goal

公開OSSの感染対策ラウンドアプリを、機能をほぼ維持したまま「あおき君」へリブランドする。

## Source of truth

1. 現在の `src/`
2. `01_phase1_spec.md`
3. `02_codex_master_prompt.md`
4. READMEとdocs

文書と実装が矛盾する場合は、既存機能を壊さない範囲で `src/` を優先し、最終報告に差異を書く。

## Priorities

1. 元機能を壊さない
2. ブランドを置き換える
3. Word出力を維持する
4. Analyticsを削除する
5. 音声入力UIを無効化する
6. PWAを維持する
7. PDFは低負荷の場合だけ追加する

## Do not

- バックエンドを追加しない
- APIを追加しない
- 認証を追加しない
- データベースを追加しない
- IndexedDBへ移行しない
- 新しい状態管理ライブラリを追加しない
- 新しいUIフレームワークを追加しない
- 大規模リファクタリングをしない
- 元機能を独自判断で削除しない
- LICENSEとNOTICEを削除しない

## Working style

- 変更前に短い計画を書く
- 必要なファイルだけ読む
- 最小差分で実装する
- 変更理由が説明できない行を触らない
- TypeScriptと既存スタイルへ合わせる
- 変更後はlintとbuildを実行する
- エラーがあれば原因を直して再実行する
- 不明点が実装を妨げない場合は、元実装を維持して進める

## Brand

- App name: あおき君
- Tagline: 院内感染ラウンドを、もっとやさしく、たのしく。
- Main color: coral / red-orange
- Supporting colors: soft blue, mint green
- Background: white / very light gray
- Approved logo: `assets/aokikun-logo.png` or copied production path
- Character source photo is documentation only; do not show the photographed paper in normal UI

## Persistence

Keep existing client-side persistence. No cloud sync.

## Privacy

Remove analytics and external tracking. Prefer system fonts. Do not add telemetry.

## Output

Word `.docx` is mandatory. Browser print/PDF is optional and must not require a heavy dependency.

## Verification

Run:

```bash
npm install
npm run lint
npm run build
```

Then smoke-test the main flow, local save/reopen, checklist import, Word output, `/about/`, mobile width, and PWA assets.

## Completion report

State:

- changed files
- implemented features
- test results
- PDF status
- known constraints
- exact run commands
