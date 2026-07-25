import {execFileSync} from "node:child_process";
import {existsSync, mkdirSync, readdirSync, writeFileSync} from "node:fs";
import path from "node:path";
import process from "node:process";

const fail = (message) => {
  console.error(`\n[video-factory] ${message}\n`);
  process.exit(1);
};

const run = (command, args) => {
  console.log(`\n> ${command} ${args.join(" ")}\n`);
  execFileSync(command, args, {stdio: "inherit"});
};

const readArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};

const url = process.argv[2];
if (!url) {
  fail(
    "YouTube URLが必要です。例: npm run analyze:youtube -- https://www.youtube.com/watch?v=... --name calm-reference",
  );
}

let parsedUrl;
try {
  parsedUrl = new URL(url);
} catch {
  fail("有効なURLではありません。");
}

const allowedHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "music.youtube.com",
]);
if (!allowedHosts.has(parsedUrl.hostname.toLowerCase())) {
  fail("現在はYouTube URLだけを受け付けます。");
}

const start = Number(readArg("--start", "0"));
const requestedDuration = Number(readArg("--duration", "90"));
if (!Number.isFinite(start) || start < 0) {
  fail("--start は0以上の秒数で指定してください。");
}
if (!Number.isFinite(requestedDuration) || requestedDuration <= 0) {
  fail("--duration は1以上の秒数で指定してください。");
}

const duration = Math.min(requestedDuration, 180);
const end = start + duration;
const rawName = readArg("--name", `reference-${Date.now()}`);
const name = rawName
  .toLowerCase()
  .replace(/[^a-z0-9-_]+/g, "-")
  .replace(/^-+|-+$/g, "") || `reference-${Date.now()}`;

const root = process.cwd();
const referenceDir = path.join(root, "references", name);
const periodicDir = path.join(referenceDir, "frames-periodic");
const sceneDir = path.join(referenceDir, "frames-scenes");
mkdirSync(periodicDir, {recursive: true});
mkdirSync(sceneDir, {recursive: true});

try {
  run("python3", [
    "-m",
    "yt_dlp",
    "--no-playlist",
    "--write-info-json",
    "--write-thumbnail",
    "--convert-thumbnails",
    "jpg",
    "--format",
    "bv*[height<=720]+ba/b[height<=720]",
    "--merge-output-format",
    "mp4",
    "--download-sections",
    `*${start}-${end}`,
    "--force-keyframes-at-cuts",
    "--output",
    path.join(referenceDir, "source.%(ext)s"),
    url,
  ]);
} catch {
  fail(
    "YouTubeから参照用動画を取得できませんでした。非公開・年齢制限・地域制限・ログイン要求・サイト側仕様変更などが考えられます。Codexにログ全文を確認させてください。",
  );
}

const sourceVideo = readdirSync(referenceDir)
  .filter((file) => /^source\.(mp4|mkv|webm|mov)$/i.test(file))
  .map((file) => path.join(referenceDir, file))[0];

if (!sourceVideo || !existsSync(sourceVideo)) {
  fail("参照用動画ファイルが見つかりませんでした。");
}

try {
  const probe = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,r_frame_rate",
      "-of",
      "json",
      sourceVideo,
    ],
    {encoding: "utf-8"},
  );
  writeFileSync(path.join(referenceDir, "media-probe.json"), probe);

  run("ffmpeg", [
    "-y",
    "-i",
    sourceVideo,
    "-vf",
    "fps=1/2,scale=960:-2",
    "-q:v",
    "2",
    path.join(periodicDir, "frame-%04d.jpg"),
  ]);

  run("ffmpeg", [
    "-y",
    "-i",
    sourceVideo,
    "-vf",
    "select=gt(scene\\,0.22),scale=960:-2",
    "-vsync",
    "vfr",
    "-q:v",
    "2",
    path.join(sceneDir, "scene-%04d.jpg"),
  ]);

  run("ffmpeg", [
    "-y",
    "-i",
    sourceVideo,
    "-vf",
    "fps=1/4,scale=480:-2,tile=4x5:padding=8:margin=8",
    "-frames:v",
    "1",
    path.join(referenceDir, "contact-sheet.jpg"),
  ]);
} catch {
  fail("ffmpegまたはffprobeによるフレーム抽出に失敗しました。");
}

const analysisRequest = `# Reference animation study\n\n- Source URL: ${url}\n- Requested segment: ${start}s - ${end}s\n- Local reference directory: references/${name}\n\n## Codex instructions\n\n1. contact-sheet.jpg、frames-periodic、frames-scenes、media-probe.json、source.info.jsonを確認する。\n2. 元動画の文章・ロゴ・人物・キャラクター・固有の意匠を複製せず、構成原則だけを抽象化する。\n3. 次を分析する。\n   - シーン構成と情報の順序\n   - 1画面あたりの情報量と余白\n   - 文字サイズ、階層、整列\n   - 配色とコントラスト\n   - 動きの方向、距離、所要時間\n   - イージング、静止時間、場面転換\n   - 音声・効果音・音楽と動きの同期\n4. style-profiles/${name}.md に、再利用できる表現ルールとして保存する。\n5. いきなり本編を作らず、最初に10秒のStyleTest compositionを作成してMP4と確認用静止画を出力する。\n6. 医療・衛生用途では、清潔感、信頼感、可読性を優先し、提供原稿にない医学的主張を追加しない。\n`;
writeFileSync(path.join(referenceDir, "analysis-request.md"), analysisRequest);

console.log(`\n完了: references/${name}`);
console.log("次はCodexに analysis-request.md を読み、スタイル分析と10秒テストを実行させてください。\n");
