# Aoki Video Factory instructions

## Scope

This directory is an isolated Remotion workspace. Do not modify the infection-round application outside `video-factory/` unless the user explicitly asks.

## First task in a fresh Codex environment

Run:

```bash
cd video-factory
bash scripts/bootstrap.sh
```

This installs Remotion, the official Remotion Agent Skills, yt-dlp, ffmpeg when possible, and renders the starter composition.

## When the user provides a YouTube URL

1. Treat the URL as a visual reference, not as material to copy or republish.
2. Ask no setup questions unless the URL cannot be accessed after retrying and reading the error.
3. Run, choosing a short descriptive English slug:

```bash
cd video-factory
npm run analyze:youtube -- "YOUTUBE_URL" --name descriptive-slug --duration 90
```

4. Inspect all generated files under `references/descriptive-slug/`, especially:
   - `contact-sheet.jpg`
   - `frames-periodic/`
   - `frames-scenes/`
   - `media-probe.json`
   - `source.info.json`
   - `analysis-request.md`
5. Analyze both still-frame design and frame-to-frame change. Include timing, easing, pauses, transition structure, and audio synchronization where observable.
6. Save abstracted rules to `style-profiles/descriptive-slug.md` using the template in that directory.
7. Do not reproduce source-specific wording, logos, people, characters, illustrations, music, or distinctive assets.
8. Build a 10-second `StyleTest` composition first. Render an MP4 plus stills at the beginning, middle, and end.
9. Review the rendered output visually before creating a longer video.

## Production defaults

- Provide both 1920x1080 horizontal and 1080x1920 vertical versions unless the user requests only one.
- The result must be understandable without narration unless narration is explicitly requested.
- Prioritize legibility on a smartphone.
- For medical or hygiene content, prioritize trust, cleanliness, calm motion, and adequate reading time.
- Never add medical claims, efficacy statements, indications, or comparisons that are not present in the user-provided source material.
- Keep generated media out of Git. Commit source code, style profiles, and concise documentation only.

## Verification

Before reporting completion, run:

```bash
cd video-factory
npm run lint
npm run render:all
```

Report the output paths and any limitation in YouTube access, fonts, audio, or source quality.
