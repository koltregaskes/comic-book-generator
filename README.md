# Comic Book Generator

Comic Book Generator turns a concept into a `creative-project-package-v1` comic issue package inside a more studio-style workspace.

## Included in the current build

- issue setup with arc summary and visual-language direction
- character roster and continuity fields
- focused page workbench with turn-moment notes
- nested panel planner
- lettering, dialogue, and caption notes
- prompt studio for offline prompt building
- generation queue for Midjourney-style background runs
- delivery outputs, AI runbook, and working notes
- JSON export/import
- installable PWA support

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4302`

## Exchange format

This repo exports `projectType: "comic-book"` packages for later use by `comic-book-video-generator`.

The current sample project shows the intended structure for:

- issue-level direction
- continuity and character planning
- page-to-panel breakdown
- reusable prompt packaging
- background generation queue tracking

## Local-Only Files

- `.autolab/` is used for internal AutoResearch and should remain untracked
- `.env*` files are local-only
- `.local/` and `*.local.md` are for planning notes and are ignored
