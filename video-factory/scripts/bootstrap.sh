#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/5] Installing Remotion dependencies..."
npm install

echo "[2/5] Installing official Remotion Agent Skills..."
npx -y skills@latest add remotion-dev/skills -y

echo "[3/5] Installing yt-dlp for YouTube reference analysis..."
python3 -m pip install --user -U "yt-dlp[default]"

echo "[4/5] Checking ffmpeg..."
if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y ffmpeg
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y ffmpeg
  else
    echo "ffmpegを自動導入できませんでした。Codex環境へffmpegとffprobeを追加してください。" >&2
    exit 1
  fi
fi

echo "[5/5] Verifying the starter project..."
npm run lint
npm run render:horizontal

echo
printf '%s\n' "Bootstrap completed." "Starter video: video-factory/out/starter-horizontal.mp4"
