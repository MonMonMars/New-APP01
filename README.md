# New-APP01

A focused task board built with **Vite + React + TypeScript**. Add tasks, mark
them done, filter, and clear completed items. Tasks persist in the browser via
`localStorage`.

## Requirements

- Node.js 22 (see `.nvmrc` / CI). npm 10+.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
```

## Available scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (host `0.0.0.0`).  |
| `npm run build`     | Type-check and produce a production build.   |
| `npm run preview`   | Preview the production build locally.        |
| `npm run lint`      | Run ESLint over the project.                 |
| `npm run typecheck` | Type-check without emitting.                 |

## Project structure

```
src/
  App.tsx      # Task board UI and state
  storage.ts   # localStorage persistence helpers
  types.ts     # Shared types
  index.css    # Styling
  main.tsx     # App entry point
```
