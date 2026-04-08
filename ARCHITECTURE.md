# Architecture

- React + Vite + TypeScript
- localStorage for drafts
- JSON import/export for portability
- manual PWA manifest + service worker

Core files:

- `src/project-package.ts`
- `src/sample-project.ts`
- `src/App.tsx`

The package contract uses `creative-project-package-v1` with page structures stored in `scenes`.
