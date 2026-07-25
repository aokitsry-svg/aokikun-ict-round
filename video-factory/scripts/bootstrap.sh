#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "[1/6] Installing Remotion dependencies..."
npm install

echo "[2/6] Installing official Remotion Agent Skills..."
npx -y skills@latest add remotion-dev/skills -y

echo "[3/6] Installing yt-dlp for YouTube reference analysis..."
python3 -m pip install --user -U "yt-dlp[default]"

echo "[4/6] Checking ffmpeg and Japanese fonts..."
need_ffmpeg=0
need_fonts=0
command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1 || need_ffmpeg=1
command -v fc-list >/dev/null 2>&1 && fc-list | grep -qi "Noto Sans CJK JP" || need_fonts=1

if [[ "$need_ffmpeg" -eq 1 || "$need_fonts" -eq 1 ]]; then
  packages=()
  [[ "$need_ffmpeg" -eq 1 ]] && packages+=(ffmpeg)
  [[ "$need_fonts" -eq 1 ]] && packages+=(fonts-noto-cjk fontconfig)

  if command -v sudo >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y "${packages[@]}"
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y "${packages[@]}"
  else
    echo "ffmpegまたは日本語フォントを自動導入できませんでした。Codex環境へ追加してください。" >&2
    exit 1
  fi
fi

if command -v fc-cache >/dev/null 2>&1; then
  fc-cache -f >/dev/null
fi

echo "[5/6] Verifying source and scripts..."
npm run lint
npm run lint:scripts

echo "[6/6] Rendering the starter video..."
npm run render:horizontal

echo
printf '%s\n' "Bootstrap completed." "Starter video: video-factory/out/starter-horizontal.mp4"
