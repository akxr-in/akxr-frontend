# Frontend design audit — May 2026

Audit against the reference design (`axar_design_extracted/Control Plane.html`
+ `js/*.jsx`, ~7,600 LOC). Audit scope: the **non-LMS** surfaces (login,
signup, dashboards, batches, meet). LMS surfaces are out of scope per
prior instruction.

## Status

**Foundation (design tokens):** ✅ Fixed in this commit.
**Component-level inline-hex usage:** 📋 Listed below, **not yet refactored**.

---

## Token reconciliation (now fixed)

The reference uses canonical names (`--paper`, `--ink`, `--line`, `--gold`).
The current codebase had drifted to its own names (`--bg-primary`,
`--text-primary`, `--border-default`, `--brand`) with several **wrong
values**:

| Token            | Reference  | Was (before this commit) | Status              |
| ---------------- | ---------- | ------------------------ | ------------------- |
| Body bg          | `#0a0a0a`  | `#0a0a0a`                | ✅                  |
| Secondary bg     | `#141414`  | `#1a1a1a`                | ❌ **wrong** — fixed |
| Card surface     | `#191919`  | (none, used --gray-600)  | ❌ missing — added   |
| Card elevated    | `#27272a`  | `#27272a`                | ✅                  |
| Line / border    | `#262626`  | `#27272a`                | ❌ **wrong** — fixed |
| Line strong      | `#404040`  | `#333333`                | ❌ **wrong** — fixed |
| Ink (headings)   | `#fafafa`  | (no token; `#cccccc`)    | ❌ **missing** — added as `--ink` |
| Ink-2 (body)     | `#d4d4d4`  | `--text-primary: #cccccc`| ❌ wrong — fixed     |
| Ink-3            | `#a3a3a3`  | `#a3a3a3`                | ✅                  |
| Ink-4            | `#737373`  | `#737373`                | ✅                  |
| Gold             | `#C9963A`  | `#C9963A`                | ✅                  |
| Gold ink (hover) | `#E2B566`  | (missing)                | ❌ — added as `--gold-ink` |
| Radius sm        | `4px`      | `0.375rem` (6px)         | ❌ wrong — fixed     |
| Radius xl        | `16px`     | (missing)                | ❌ — added           |
| Shadows          | sm/md/lg   | (missing)                | ❌ — added           |
| Base font-size   | `13px`     | (browser default)        | ❌ — added           |

Visible consequence of the wrong tokens: **everything looked muted**
because body text was rendering at `#cccccc` instead of `#d4d4d4`, and
headings had no dedicated `#fafafa` token so they inherited body color.
Subnav was one shade too pale (`#1a1a1a` vs `#141414`). Borders were a
hair too warm (`#27272a` vs `#262626`).

### How the fix is shaped

`packages/design-system/src/styles/globals.css` now:

1. Declares the **canonical** token names matching the reference
   (`--paper`, `--paper-2`, `--card`, `--card-elev`, `--line`, `--line-2`,
   `--ink` through `--ink-4`, full `--gold-*` set, status sets, radii,
   shadows, typography).
2. Keeps **legacy aliases** (`--bg-primary`, `--text-primary`, etc.)
   pointing at the canonical names so every existing Tailwind class
   (`text-text-primary`, `bg-bg-secondary`) keeps working without a
   sweeping rename.
3. Registers everything with `@theme inline` so both old (`text-text-primary`)
   and new (`text-ink`, `bg-paper`, `border-line`) Tailwind utilities work.
4. Sets the base 13px font-size, body line-height 1.5, tight tracking, and
   `<h1>–<h6>` defaults to bright ink + 600 weight per reference.

New code should prefer the canonical names: `text-ink`, `text-ink-2`,
`text-ink-3`, `bg-paper`, `bg-paper-2`, `bg-card`, `border-line`,
`text-gold-ink`, etc.

---

## Hardcoded hex values to refactor (144 instances)

Top offenders — these files have inline styles with raw hex colors that
should reference tokens:

| File                                                  | Count | Notes                                                    |
| ----------------------------------------------------- | ----- | -------------------------------------------------------- |
| `frontend/app/(unauth)/login/page.tsx`                | 42    | Entire page uses inline `style={{ background: '#...' }}` |
| `frontend/app/meet/[roomId]/page.tsx`                 | 29    | Meeting room screen                                       |
| `frontend/components/dashboard/AdminDashboard.tsx`    | 20    | Most are intentional status pill swatches                 |
| `frontend/components/dashboard/MentorDashboard.tsx`   | 15    |                                                           |
| `frontend/components/dashboard/StudentDashboard.tsx`  | 9     |                                                           |
| `frontend/components/dashboard/AttendanceBadge.tsx`   | 8     | Status colors — should use `--ok`/`--bad`/`--warn`        |
| `frontend/components/dashboard/RoleBadge.tsx`         | 6     | Should match reference `Pill` component tones             |
| `frontend/app/lms/mentor/page.tsx`                    | 6     | LMS — out of scope                                        |
| `frontend/components/lms/CoursePlayer.tsx`            | 3     | LMS — out of scope                                        |
| `frontend/app/lms/student/page.tsx`                   | 3     | LMS — out of scope                                        |

**Refactor pattern** (do not change all in one PR):

```tsx
// Before
<div style={{ background: '#141414', borderColor: '#262626' }}>

// After
<div className="bg-paper-2 border border-line">

// Or, if inline styling is genuinely required (e.g. dynamic):
<div style={{ background: 'var(--paper-2)', borderColor: 'var(--line)' }}>
```

Suggested order, biggest visual win first:
1. `login/page.tsx` — most user-visible surface, full of inline hex.
2. `meet/[roomId]/page.tsx` — same.
3. Dashboard files — bulk of the cleanup, but lower risk per change.
4. Defer LMS files until LMS gets its own audit pass.

---

## Component-level findings vs reference

### `RoleBadge` / status pills
Reference (`ds.jsx::Pill`) defines a single `Pill` primitive with tones:
`student`, `mentor`, `admin`, `live`, `ok`, `warn`, `bad`, `info`,
`gold`, `neutral`. Each tone uses `var(--{tone}-bg)` / `var(--{tone}-deep)`
/ accent color — never a hex.

Current `RoleBadge.tsx` and the new `AdminDashboard.LiveClassesScreen`
status indicators replicate parts of this with hardcoded utility class
strings (`bg-success-subtle text-success`). These work, but a shared
`<Pill tone="...">` component would:
- Stop the pattern from drifting.
- Pick up the right `--gold-ink` color (current pills use `--brand`
  which is the saturated gold, not the lighter ink shade).
- Apply the consistent mono 10px / 0.08em tracking from the reference.

**Recommendation**: create `packages/design-system/src/components/Pill.tsx`
mirroring `ds.jsx::Pill`. Migrate `RoleBadge`, `AttendanceBadge`, and the
inline status pills in `AdminDashboard.LiveClassesScreen` to use it.

### `Avatar`
Reference has tone presets (`gold`, count-mode `+N`, neutral). Current
`Avatar` just shows initials. Adding the tone+count modes lets the
"+N more" pattern from the reference work consistently.

### `Card`
Reference has an `accent` prop that adds a top-edge gold gradient
(`linear-gradient(90deg, var(--gold), var(--gold-deep))`). Current cards
don't have this — visible on the reference's "Today's class" / hero
cards.

### Typography sizes (reference)
Verified actual numbers from the reference's CSS:
- Body / table cells: 12.5px, tracking -0.005em
- Heading h2: 20px, tracking -0.022em
- Page title: 30px, tracking -0.028em
- Hero number: 36px, tracking -0.03em
- Mono pill / meta: 10px, tracking 0.06em
- Field label: 11px

Many components use `text-[15px]`, `text-[20px]`, etc. — these match.
Where they don't is mostly inline `style={{ fontSize: ... }}` in
`login/page.tsx`. Convert to Tailwind utilities or tokens.

### Buttons
Reference `Button` has variants: `default`, `primary` (gold), `accent`
(blue), `ghost`, `danger`, plus `sm` size. Current `Button` in the
design system package — check it matches.

---

## What's intentionally **not** in this commit

- Touching individual component files. The token foundation needed to
  land first; component refactors should now be small, easy-to-review
  follow-ups (one file per PR) so it's easy to spot regressions.
- LMS files (`/app/lms/**`, `components/lms/**`) — out of scope per
  prior "skip the LMS" direction.
- New `Pill`, `Avatar` count-mode, `Card` accent variant primitives —
  worth doing but separate.

## Verification

- `npx tsc --noEmit` — clean.
- `pnpm build` — green (17/17 pages prerendered, no CSS errors).
- Visual: every existing Tailwind class (`text-text-primary`,
  `bg-bg-secondary`, `border-border-default`, `text-brand`, …) still
  resolves; values are now correct.
