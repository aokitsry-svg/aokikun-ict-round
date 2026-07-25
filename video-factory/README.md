# Aoki Video Factory

CodexとRemotionを使い、YouTubeの参考URLからアニメーション表現を研究し、再利用可能な動画の型へ変換する作業環境です。

## できること

- YouTube URLから最大180秒の参照区間を取得
- 2秒間隔フレーム、場面転換フレーム、コンタクトシートを自動生成
- Codexが構成、余白、文字、配色、動き、テンポを分析
- 分析結果を`style-profiles/`へ保存
- 10秒のスタイルテストを経て、本編を制作
- 1920x1080横型と1080x1920縦型をレンダリング

## 初回セットアップ

Codexに次の一文を送れば、環境構築と動作確認をまとめて行えます。

```text
video-factory/AGENTS.mdを読み、初回セットアップを最後まで実行してください。エラーは自分で調査・修正し、StarterHorizontalのMP4が正常に生成できるところまで進めてください。
```

Codexが実行する中心コマンドは次のとおりです。

```bash
cd video-factory
bash scripts/bootstrap.sh
```

## YouTube URLを使うとき

URLと制作目的をCodexへ渡します。

```text
次のYouTube動画を参考に、構成・テンポ・余白・文字組み・動きの原則を分析してください。
URL: https://www.youtube.com/watch?v=...

元動画固有の文章、ロゴ、人物、キャラクター、画像、音楽は複製しないでください。
video-factory/AGENTS.mdの手順に従い、まず参照区間90秒を抽出・分析し、style-profileと10秒のStyleTestを作成してください。
```

参照区間を指定する場合は、プロンプトに「2分10秒から60秒間」のように追記してください。Codexは次の形式で処理します。

```bash
npm run analyze:youtube -- "URL" --name calm-medical --start 130 --duration 60
```

## 出力先

- 参照分析: `references/<name>/`
- 表現ルール: `style-profiles/<name>.md`
- 動画: `out/`

参照動画、抽出フレーム、完成MP4はGitへ登録されません。

## 技術構成

- Remotion
- React / TypeScript
- Official Remotion Agent Skills
- yt-dlp
- ffmpeg / ffprobe

YouTube側の制限、ログイン要求、地域制限、仕様変更によってURL取得が失敗する場合があります。その場合はCodexがログを確認し、取得可能な公開範囲で再試行します。
