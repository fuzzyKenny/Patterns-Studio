# Pattern Studio

Standalone web app extraction of the portfolio pattern studio described in [`project.md`](/Users/kenny/Code/Pattern-Lab/project.md).

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- `motion`
- `lucide-react`

## Features

- single-page studio UI
- live animated canvas preview
- editable pattern, motion, glyph, and color controls
- click-triggered shockwave interaction
- copyable preset export
- no Next.js dependency

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Build

```bash
pnpm build
pnpm preview
```

## Typecheck

```bash
pnpm typecheck
```
