---
name: "remotion-youtube-reference"
description: "Use when the user gives a YouTube URL as an animation or motion-design reference and wants Codex to analyze the style, save reusable rules, and create a Remotion video with minimal user work."
---

# Remotion YouTube Reference Skill

## Goal

Turn a YouTube reference URL into an original, reusable Remotion style profile and a verified short test without copying source-specific assets.

## Workflow

1. Read `video-factory/AGENTS.md` and `video-factory/README.md`.
2. If the environment is not ready, run:

```bash
cd video-factory
bash scripts/bootstrap.sh
```

3. Convert the user's URL into a local reference study:

```bash
cd video-factory
npm run analyze:youtube -- "YOUTUBE_URL" --name descriptive-slug --duration 90
```

4. If the user specifies a time range, convert it to seconds and pass `--start` and `--duration`.
5. Inspect the generated video metadata, contact sheet, periodic frames, scene-change frames, and analysis request.
6. Analyze not only individual frames but frame-to-frame changes: timing, distance, easing, sequencing, pauses, transitions, and audio synchronization.
7. Save the abstracted rules as `video-factory/style-profiles/<slug>.md` based on the template.
8. Do not copy the original wording, branding, logos, people, characters, illustrations, music, or distinctive visual assets.
9. Create a 10-second `StyleTest` composition before any full production video.
10. Render the test MP4 and stills, inspect them visually, and repair layout or timing issues without asking the user to operate tools.
11. After approval or when the brief is already clear, create horizontal and vertical compositions and run:

```bash
cd video-factory
npm run lint
npm run render:all
```

## Failure handling

- Retry once after updating yt-dlp when YouTube extraction fails.
- Read the complete error before changing the approach.
- Public URLs may still fail because of login, age, regional, bot, or site restrictions.
- Do not silently replace the requested URL with another source.
- If access remains impossible, report the exact limitation and ask only for the smallest necessary alternative, such as a permitted local video file.

## Medical content constraints

- Never introduce a medical claim not supplied by the user.
- Keep text readable without narration.
- Prefer calm motion, strong hierarchy, clean spacing, and adequate reading time.
- Treat patient information, unpublished internal data, and company-confidential material as prohibited unless the user explicitly confirms a safe, authorized source.
