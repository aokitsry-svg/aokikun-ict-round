#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

tool_dir=".tools/bin"
mkdir -p "$tool_dir"
export PATH="$tool_dir:$PATH"
export npm_config_cache=".tools/npm-cache"

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) is_windows=1 ;;
  *) is_windows=0 ;;
esac

echo "[1/6] Installing Remotion dependencies..."
npm install

echo "[2/6] Installing official Remotion Agent Skills..."
npx -y skills@latest add remotion-dev/skills -y

echo "[3/6] Installing or checking yt-dlp for YouTube reference analysis..."
if ! command -v yt-dlp >/dev/null 2>&1; then
  if [[ "$is_windows" -eq 1 ]]; then
    curl -fL --retry 3 \
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" \
      -o "$tool_dir/yt-dlp.exe"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -m pip install --user -U "yt-dlp[default]"
  else
    echo "yt-dlpを自動導入できませんでした。Python 3またはyt-dlpを追加してください。" >&2
    exit 1
  fi
fi

echo "[4/6] Checking ffmpeg and Japanese fonts..."
need_ffmpeg=0
need_fonts=0
command -v ffmpeg >/dev/null 2>&1 && command -v ffprobe >/dev/null 2>&1 || need_ffmpeg=1

if [[ "$is_windows" -eq 1 ]]; then
  windows_dir="$(cygpath -u "${WINDIR:-C:\\Windows}")"
  find "$windows_dir/Fonts" -maxdepth 1 -type f \
    \( -iname "NotoSansJP*" -o -iname "YuGoth*" -o -iname "meiryo*" \) \
    -print -quit | grep -q . || need_fonts=1

  if [[ "$need_ffmpeg" -eq 1 ]]; then
    archive=".tools/ffmpeg-release-essentials.zip"
    checksum="$archive.sha256"
    unpack_dir="$(mktemp -d ".tools/ffmpeg-unpack.XXXXXX")"

    curl -fL --retry 3 \
      "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip.sha256" \
      -o "$checksum"

    expected_hash="$(tr -d '\r\n[:space:]' < "$checksum")"
    actual_hash=""
    if [[ -f "$archive" ]]; then
      actual_hash="$(sha256sum "$archive" | awk '{print $1}')"
    fi
    if [[ "$expected_hash" != "$actual_hash" ]]; then
      curl -fL --retry 3 \
        "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" \
        -o "$archive"
      actual_hash="$(sha256sum "$archive" | awk '{print $1}')"
    fi
    if [[ "$expected_hash" != "$actual_hash" ]]; then
      echo "ffmpegのダウンロード検証に失敗しました。" >&2
      exit 1
    fi

    archive_windows="$(cygpath -w "$archive")"
    unpack_windows="$(cygpath -w "$unpack_dir")"
    powershell.exe -NoProfile -NonInteractive -Command \
      "Expand-Archive -LiteralPath '$archive_windows' -DestinationPath '$unpack_windows' -Force"
    ffmpeg_source="$(find "$unpack_dir" -type f -name "ffmpeg.exe" -print -quit)"
    ffprobe_source="$(find "$unpack_dir" -type f -name "ffprobe.exe" -print -quit)"
    if [[ -z "$ffmpeg_source" || -z "$ffprobe_source" ]]; then
      echo "ffmpegまたはffprobeが展開先に見つかりません。" >&2
      exit 1
    fi
    cp "$ffmpeg_source" "$tool_dir/ffmpeg.exe"
    cp "$ffprobe_source" "$tool_dir/ffprobe.exe"
    rm -rf "$unpack_dir"
  fi
else
  command -v fc-list >/dev/null 2>&1 && fc-list | grep -qi "Noto Sans CJK JP" || need_fonts=1
fi

if [[ "$is_windows" -eq 0 && ("$need_ffmpeg" -eq 1 || "$need_fonts" -eq 1) ]]; then
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

if [[ "$need_fonts" -eq 1 ]]; then
  echo "日本語フォントが見つかりませんでした。Noto Sans JPなどを追加してください。" >&2
  exit 1
fi

if command -v fc-cache >/dev/null 2>&1; then
  fc-cache -f >/dev/null
fi

yt-dlp --version
ffmpeg -version | head -n 1
ffprobe -version | head -n 1

echo "[5/6] Verifying source and scripts..."
npm run lint
npm run lint:scripts

echo "[6/6] Rendering the starter video..."
npm run render:horizontal

echo
printf '%s\n' "Bootstrap completed." "Starter video: video-factory/out/starter-horizontal.mp4"
