# Pattern Studio Standalone Web App Handoff

This document explains how the current pattern studio works inside this Next.js portfolio, what parts are portable, and how to turn it into a single standalone web app in a separate project.

The intended audience is another coding agent or engineer who will build the standalone app. This should give enough context to reproduce the behavior without reverse-engineering the original files again.

## Goal

Turn the existing pattern editor and animated canvas background into a standalone web app with:

- a single-page interface
- a live preview
- editable controls
- click-triggered shockwave interaction
- preset export
- no dependency on the surrounding portfolio site

The current implementation already contains almost everything needed. The standalone work is mostly extraction, cleanup, and minor decoupling from Next.js-specific pieces.

## Source Files

The two important source files are:

- [`components/pattern-studio.tsx`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx)
- [`components/ui/pattern-background.tsx`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx)

Related app context:

- [`app/page.tsx`](/Users/kenny/Code/Worksite/app/page.tsx)
- [`README.md`](/Users/kenny/Code/Worksite/README.md)
- [`package.json`](/Users/kenny/Code/Worksite/package.json)

## What Exists Today

### 1. `PatternBackground` is the rendering engine

[`components/ui/pattern-background.tsx`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx) contains:

- the public props type for the animated background
- pattern and item-shape option lists
- reusable presets
- the math that computes cell opacity and wave behavior
- the canvas drawing logic for squares, circles, triangles, stars, and glyphs
- animation timing
- responsive canvas resizing
- optional shockwave propagation on interaction

This file is the core of the feature. It is already close to framework-agnostic React code.

### 2. `PatternStudio` is the app shell

[`components/pattern-studio.tsx`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx) contains:

- all editor state
- the preview surface that renders `PatternBackground`
- all control UI
- preset serialization
- copy-to-clipboard behavior
- click handling that creates shockwaves
- motion-based panel transitions

This is effectively the standalone app already, except it currently lives as one section inside the portfolio.

## How The Current System Works

### Rendering Model

`PatternBackground` renders a responsive `<canvas>` inside a wrapper `div`.

Key mechanics:

- `ResizeObserver` watches the wrapper width and stores it in state.
- canvas height is derived from the ratio `rows / itemsPerRow`.
- device pixel ratio is capped at `2` for performance.
- every render pass clears the canvas, paints the background, computes the grid, and draws each item.

Important code areas:

- option lists and props: [`components/ui/pattern-background.tsx:6`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L6)
- presets: [`components/ui/pattern-background.tsx:67`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L67)
- helper math: [`components/ui/pattern-background.tsx:135`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L135)
- shape drawing helpers: [`components/ui/pattern-background.tsx:222`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L222)
- React canvas component: [`components/ui/pattern-background.tsx:325`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L325)

### Pattern Math

Each cell in the grid gets:

- a position in the grid
- a seeded pseudo-random offset based on row, column, and seed
- a normalized distance and angle from the center
- a wave value based on the chosen pattern
- a final opacity interpolated between `minOpacity` and `maxOpacity`

Patterns:

- `sign`: essentially sign of sine for stark on/off bands
- `radial`: circular wavefronts based on distance from center
- `spiral`: angular plus radial modulation
- `mandala`: layered cosine fields for more ornate symmetry

Core functions:

- `getPatternValue(...)`: [`components/ui/pattern-background.tsx:159`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L159)
- `getSeededValue(...)`: [`components/ui/pattern-background.tsx:191`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L191)
- per-cell opacity calculation: [`components/ui/pattern-background.tsx:515`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L515)

### Shapes And Glyphs

Each grid cell is drawn as one of:

- square
- circle
- triangle
- star
- glyph

Glyph mode uses monospace text drawn into the canvas. There is also a special `$matrix` glyph mode that changes characters over time using the current phase value.

Relevant code:

- shape list: [`components/ui/pattern-background.tsx:13`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L13)
- glyph selection: [`components/ui/pattern-background.tsx:199`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L199)
- shape drawing: [`components/ui/pattern-background.tsx:266`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L266)

### Animation Model

Animation is not handled by CSS. It is driven by `requestAnimationFrame`.

Mechanism:

- `animatedPhaseOffset` is stored in React state
- each animation frame adds `deltaSeconds * animationSpeed`
- the resolved phase is `phase + animatedPhaseOffset`
- the draw effect reruns when `resolvedPhase` changes

Relevant code:

- animation state: [`components/ui/pattern-background.tsx:355`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L355)
- animation loop: [`components/ui/pattern-background.tsx:402`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L402)

### Shockwave Interaction

Shockwaves are created in `PatternStudio`, not in `PatternBackground`.

Mechanism:

- pointer down on the preview area computes local x/y coordinates
- a new shockwave object is appended with `key: Date.now()`
- `PatternBackground` derives elapsed time from the shockwave key
- each frame computes an expanding radius and additional opacity boost around the ring

Relevant code:

- shockwave state in the editor: [`components/pattern-studio.tsx:284`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L284)
- click handler: [`components/pattern-studio.tsx:382`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L382)
- shockwave effect inside canvas render: [`components/ui/pattern-background.tsx:491`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L491)

### Preset Export

The studio derives a serializable preset object from editor state and turns it into a code snippet:

```ts
const myPattern = { ... } as const;
```

The export panel then copies that string with `navigator.clipboard.writeText(...)`.

Relevant code:

- preset derivation: [`components/pattern-studio.tsx:327`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L327)
- code string generation: [`components/pattern-studio.tsx:372`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L372)
- clipboard copy: [`components/pattern-studio.tsx:376`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L376)

## Current Dependencies

From [`package.json`](/Users/kenny/Code/Worksite/package.json):

- `react`
- `react-dom`
- `motion`
- `lucide-react`
- `next-themes`
- Tailwind CSS 4

For the standalone app, only some of these are essential.

## What Is Actually Required For Standalone

Required:

- `react`
- `react-dom`
- `typescript`
- `motion`
- `lucide-react`

Optional:

- Tailwind CSS 4 if the current UI styling should be preserved
- `next-themes` only if the standalone app still wants theme-provider behavior

Not required for the standalone app:

- `next`
- `eslint-config-next`
- App Router files

## Recommended Standalone Stack

Use Vite with React and TypeScript.

Recommended base:

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- `motion`
- `lucide-react`

Why Vite:

- faster and simpler than carrying over Next.js for a single-page tool
- no routing or server features are needed for the current feature set
- easier to deploy as a single standalone app
- easier to turn into both a local dev app and a static deploy target

## Scaffold Commands

If the other agent is starting from scratch, this is the recommended setup path:

```bash
pnpm create vite pattern-studio-app --template react-ts
cd pattern-studio-app
pnpm add motion lucide-react
pnpm add -D tailwindcss @tailwindcss/postcss
```

Then wire Tailwind into the Vite app using the standard Tailwind CSS 4 setup:

- add the Tailwind PostCSS plugin in `postcss.config.*`
- import Tailwind from the main global stylesheet
- load that stylesheet from `main.tsx`

If the goal is parity with the current UI, Tailwind should be installed from the start rather than added later.

Suggested app entry files:

```ts
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/app";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

```tsx
// src/app/app.tsx
import { PatternStudio } from "../components/pattern-studio";

export default function App() {
  return <PatternStudio />;
}
```

## Recommended Standalone App Structure

Suggested file layout:

```text
src/
  app/
    app.tsx
  components/
    pattern-studio.tsx
    ui/
      pattern-background.tsx
  lib/
    pattern-engine.ts
    color.ts
  styles/
    globals.css
  main.tsx
index.html
```

Better version of the current architecture:

- `pattern-engine.ts`
  - move pure helpers and draw logic here
  - no React imports
- `pattern-background.tsx`
  - keep only the React wrapper, resize observation, animation loop, and canvas mount
- `pattern-studio.tsx`
  - keep all editor state and controls here

This split is not strictly required, but it is the cleanest way to make the standalone app easier to maintain.

## Minimal Extraction Plan

If the other agent wants the fastest route, do this first:

1. Create a new Vite React TypeScript app.
2. Add Tailwind CSS 4 if preserving the current styles.
3. Copy `pattern-studio.tsx` and `pattern-background.tsx` into the new app.
4. Replace the `@/` alias import in `pattern-studio.tsx` with a relative import.
5. Remove the `next-themes` dependency from `pattern-background.tsx`.
6. Mount `<PatternStudio />` from the top-level app component.
7. Verify animation, resizing, controls, export, and shockwave behavior.

## Single-Web-App Interpretation

For this handoff, "single web app" should mean:

- one Vite app
- one main React entrypoint
- one page
- no Next.js routing requirements
- no dependency on the portfolio shell

The standalone app does not need:

- SSR
- server actions
- route segments
- metadata APIs
- `app/` router conventions from Next.js

The app should open directly into the pattern studio experience.

## Required Code Changes During Extraction

### 1. Replace the `@/` alias import

Current import in [`components/pattern-studio.tsx:8`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L8):

```ts
import {
  ITEM_SHAPES,
  PATTERNS,
  PATTERN_BACKGROUND_PRESETS,
  PatternBackground,
  type ItemShape,
  type PatternKind,
} from "@/components/ui/pattern-background";
```

This must become a relative import in the standalone app, for example:

```ts
import {
  ITEM_SHAPES,
  PATTERNS,
  PATTERN_BACKGROUND_PRESETS,
  PatternBackground,
  type ItemShape,
  type PatternKind,
} from "./ui/pattern-background";
```

or whatever matches the new file layout.

### 2. Remove `next-themes` coupling

Current Next-specific dependency:

- import: [`components/ui/pattern-background.tsx:3`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L3)
- usage: [`components/ui/pattern-background.tsx:352`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L352)

Today, `PatternBackground` does this:

- reads `resolvedTheme`
- uses theme-aware fallback colors only when explicit colors are not passed

In practice, `PatternStudio` already passes explicit `backgroundColor`, `foregroundColor`, and `itemColor`, so theme coupling is weak and easy to remove.

Recommended replacement:

```ts
export type ThemeMode = "light" | "dark";

export type PatternBackgroundProps = {
  // existing props...
  theme?: ThemeMode;
};
```

Then replace:

```ts
const { resolvedTheme } = useTheme();
```

with:

```ts
const resolvedTheme = theme ?? "dark";
```

This keeps the existing fallback behavior without depending on Next.js.

An even simpler alternative is to remove theme fallback entirely and require explicit colors for the standalone app.

### 3. Keep `motion` as-is or simplify it

`PatternStudio` uses `motion/react` and `AnimatePresence` only for:

- panel entrance animations
- export panel collapse/expand

These are nice-to-have, not structurally required.

Relevant imports:

- [`components/pattern-studio.tsx:4`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L4)

Options:

- keep `motion` and preserve the current behavior
- remove it and replace with plain CSS transitions if trying to reduce dependencies

Recommendation: keep it for the first standalone version.

### 4. Keep Tailwind or restyle

The studio UI is heavily styled with Tailwind utility classes throughout:

- section shell: [`components/pattern-studio.tsx:404`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L404)
- preview card: [`components/pattern-studio.tsx:432`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L432)
- controls panel: [`components/pattern-studio.tsx:479`](/Users/kenny/Code/Worksite/components/pattern-studio.tsx#L479)

Recommendation: keep Tailwind for the initial extraction because rewriting the styling adds noise without improving the standalone architecture.

## Suggested Standalone Features

The first standalone app should preserve these features:

- live preview
- all current slider controls
- pattern selection
- item shape selection
- glyph presets and manual glyph text entry
- color + alpha editing
- pause/play animation
- shockwave toggle
- click-to-trigger shockwaves
- copy preset code

Additional features worth adding after parity:

- URL-based state persistence
- JSON export/import
- image export, for example PNG
- preset gallery
- mobile-optimized control drawer
- fullscreen preview mode

## Suggested Build Order For The Other Agent

1. Scaffold the Vite app and install base dependencies.
2. Port `PatternBackground` first and make sure the preview renders.
3. Remove `next-themes` and verify fallback color behavior.
4. Port `PatternStudio` and wire all props to the preview.
5. Restore shockwave interaction.
6. Restore preset export.
7. Recreate or preserve the current visual styling.
8. Add app-level polish such as layout, header, metadata, and mobile behavior.
9. Verify the canvas performance on desktop and mobile.

## Implementation Notes And Design Intent

The current studio is not a generic admin tool. It was built as a polished visual lab inside a portfolio.

Important design characteristics to preserve:

- the preview should feel like the hero element
- controls are dense but still presentable
- black-and-white contrast is intentional
- the visual language leans toward signal-processing / waveform / lab-tool aesthetics
- motion should feel deliberate, not noisy

If the standalone version becomes more app-like, it should still preserve that visual identity rather than turning into a generic dashboard.

## Performance Notes

The current implementation already includes a few practical performance choices:

- `devicePixelRatio` is capped at `2`
- the canvas only redraws when relevant state changes
- shape drawing is direct canvas API usage
- mobile gap spacing is slightly reduced for narrow layouts

Relevant code:

- DPR cap: [`components/ui/pattern-background.tsx:442`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L442)
- mobile gap adjustment: [`components/ui/pattern-background.tsx:464`](/Users/kenny/Code/Worksite/components/ui/pattern-background.tsx#L464)

Potential future optimizations if needed:

- move animation phase to a ref and draw directly without React state updates
- render shockwave timing with `performance.now()`
- debounce very high-frequency control updates if mobile performance suffers

These are not required for the initial standalone version.

## Risks To Watch During Extraction

- removing `next-themes` incorrectly can change default color behavior
- changing file structure can break type imports or relative imports
- replacing Tailwind may unintentionally flatten the UI
- over-refactoring the canvas logic can break the visual output subtly
- changing how phase animation is stored may alter the motion feel
- changing shockwave timing may alter the ring speed and glow intensity

The safest approach is parity first, cleanup second.

## Suggested Acceptance Criteria

The standalone app is good enough when:

- it loads as a single page without relying on Next.js
- the preview matches the current studio closely
- all controls update the preview correctly
- clicking the preview creates the same shockwave effect
- pause/play works
- copy preset works
- layout is usable on both desktop and mobile
- there is no dependency on the portfolio app shell

## One-Sentence Summary For The Other Agent

Treat `PatternStudio` as the standalone app UI, treat `PatternBackground` as the canvas rendering engine, port both into a Vite React app, remove `next-themes`, keep Tailwind and `motion` for parity, and refactor the pure drawing/math helpers into a shared engine only after the app matches the current behavior.
