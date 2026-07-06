---
name: Expo mobile app conventions (School Intelligence Platform)
description: Theme, layout, and demo-data conventions used across artifacts/mobile screens — apply when adding new screens to keep visual/data consistency.
---

## Theme
Dark palette: bg `#060d1f`, card `#0d1b2e`, primary `#10b981` (emerald), accent `#0ea5e9`, border `#1a2744`. Icons are Ionicons only — no emojis.

**Why:** established early in the project as the premium SaaS look; deviating breaks visual consistency across the growing screen count.

## Layout / safe area
`topPad = Platform.OS === "web" ? 67 : insets.top` and `bottomPad = Platform.OS === "web" ? 34 : 0` — used at the top of nearly every screen to handle the web preview's fixed proxy chrome vs native safe areas.

**How to apply:** copy this pattern verbatim in any new full-screen route; using raw `insets.top` alone misaligns headers in the web preview.

## Demo data generation
`artifacts/mobile/constants/demoData.ts` uses a seeded pseudo-random helper `rng(seed, min, max)` so generated data (students, staff, admissions, question bank, etc.) is deterministic across reloads. Per-student derived collections (family tree, behavior log, documents, medical info, promotion history, tags) are cached in a `Map` keyed by `student.id` via getter functions (e.g. `getFamilyTree(student)`).

**Why:** avoids regenerating different random data on every render/re-mount, which previously caused UI flicker/inconsistency between screens showing the same student.

**How to apply:** when adding new per-entity demo data, follow the same `rng(seed, ...)` + cached getter-function pattern rather than `Math.random()`.

## Reanimated on web
`withSequence` from `react-native-reanimated` can fail silently (blank/white screen) on the web platform target in this Expo setup. If a screen goes blank on web only, suspect Reanimated sequence/timing usage first — replace with plain React state + `Pressable`/`opacity` for web-safe interactions.

**Why:** caused a full white-screen crash on `attendance.tsx` that was hard to diagnose since no console error surfaced.

## Known pre-existing typecheck gotchas (fixed)
`ReturnType<typeof STUDENTS>` is wrong when `STUDENTS` is an array, not a function — use `(typeof STUDENTS)[number]` instead. Casting a non-overlapping object type via `as Record<...>` needs an `as unknown as Record<...>` intermediate cast.
