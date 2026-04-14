# AGENTS.md — todo.ross.gg

## Project Overview

A SolidJS web UI for [OpenCode](https://github.com/sst/opencode), deployed as a Cloudflare Worker at `todo.ross.gg`. The app connects to a local `opencode serve` instance via `@opencode-ai/sdk` v2 and provides a chat/session interface.

## Current Goals

### Spaceship Cockpit UI (Empty Session Screen)

The primary active goal is making the **empty session screen** (shown when connected to OpenCode but no active conversation) look like a **spaceship cockpit command center**, inspired by the game [Spaceteam](https://spaceteam.ca/).

**Design intent:**
- Top ~40% of screen: viewport "windshield" showing an ISS live feed (YouTube embed) with converging V-shaped structural beams
- Below viewport: a control panel area with the **prompt textbox centered**, flanked by silly Spaceteam-style controls (knobs, dials, toggles, action buttons with absurd names)
- Bottom: dashboard instruments (radar screen, ship's log with scrolling green terminal text, gauges, red button grid), extra control rows
- **Theme-aware**: dark mode = cockpit UI, light mode = clean white centered textbox
- The textbox is the primary interface — it should be prominent, not buried

**Spaceteam aesthetic:**
- Dense grid of controls with absurd names: "Gelatinous Darkbucket", "Beeping Trapezoid", "Pulsing Ribbontrellis"
- Action button verbs: CARAMELIZE, HONK, EULOGIZE, DEFENESTRATE, SNORKEL
- Blinking warnings like "PORKCHOP LEVELS CRITICAL" (currently set to static, not blinking — user dislikes blink)
- Panel header: `=== SPACETEAM COMMAND INTERFACE v4.20 ===`

## What's Been Tried / Current State

### Merged PRs
1. **PR #1** — Readability, accessibility, contrast improvements
2. **PR #2** — Initial starship control panel with canvas-based animated space viewport (stars, planets, comets, nebula drawn on HTML canvas)
3. **PR #3** — Cockpit frame overlay (SVG) + Spaceteam control panel component

### Cherry-picked onto main (not via PR)
- **Fix viewport frame sizing** — Extended viewport windows from y=400 to y=560 (out of 600) to reduce dead space below windows
- **Control panel overflow** — Removed `overflow: hidden`, controls scroll horizontally, warning text no longer clipped
- **ISS live feed** — Replaced canvas space scene with embedded YouTube ISS Earth viewing stream (`zPH5KtjJFaQ`). First attempted `P9C25Un7xaM` which didn't load.
- **Curved windshield** — Wide curved cockpit frame with dashboard instruments, indicator lights, nav screens, red button grid
- **Theme-aware** — `useTheme()` with `resolvedMode()` — dark mode shows cockpit, light mode shows clean white centered textbox
- **Textbox prominence** — Highlighted border (rgba(80,140,200,0.3) + outer glow), reduced textarea rows from 3 to 2
- **Porkchop blink removed** — User explicitly doesn't want blinking text
- **Layout iterations** — Went through many rounds: textbox was initially at bottom, moved to center, then to 2/3 down, then settled on current layout (viewport top 40%, controls + textbox below with no gap, dead space filled with ship's log + dashboard + extra controls)
- **Controls around textbox** — Left/right side panels with individual control widgets (dials, toggles, buttons), bottom strip with SpaceteamPanel
- **ISS feed fix** — Swapped to confirmed working stream ID `zPH5KtjJFaQ`, verified in preview

### Pending / Not Yet Deployed
- The latest iteration on main (`9024422`) includes all the above. The user needs to run `npm run build && npx wrangler deploy` to push to production.
- The worktree branch `claude/confident-kalam` has equivalent changes but diverged via cherry-picks. It can be cleaned up.

## Key Architecture Notes

### Files involved in the cockpit UI
- `src/components/space-viewport.tsx` — SVG cockpit frame with V-beams, YouTube ISS feed iframe, HUD overlays, scanline/vignette effects
- `src/components/spaceteam-panel.tsx` — Spaceteam control strip + exported individual widgets (ActionButton, ToggleSwitch, NumberDial, AutoSlider). Silly names pool, shuffled on mount.
- `src/pages/session.tsx` — `EmptySession` component: theme-aware (dark=cockpit, light=clean), layout structure with viewport, control panels, ship's log, dashboard instruments

### Deployment
- **Platform**: Cloudflare Workers (NOT Pages — per user preference in CLAUDE.md)
- **Auth**: Uses `CLOUDFLARE_EMAIL=ross@ross.gg` + `CLOUDFLARE_API_KEY` (Global API Key), NOT `CLOUDFLARE_API_TOKEN` (which had permission issues)
- **Deploy command**: `npm run build && npx wrangler deploy`
- **Build tool**: Vite

### Dev testing
- The EmptySession component requires an OpenCode backend to render (it's inside `AppProviders` which needs server context)
- The preview server (Vite on port 3000) renders the home page but not the session view without a running `opencode serve` on port 3456
- Previous attempt to create a standalone `/cockpit-test` route failed because providers throw without backend
- SolidJS app has rendering issues in headless preview browser (blank body) — verified builds pass but visual testing requires the full stack

## User Preferences (for this project)
- No blinking text (user explicitly said "nobody likes blink")
- Terse responses, no trailing summaries
- Commit messages: no Co-Authored-By trailers (per global CLAUDE.md)
- Cloudflare Workers only, never Pages
- Test before deploy: `npm run build` must pass before `npx wrangler deploy`
