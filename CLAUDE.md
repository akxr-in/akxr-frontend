# akxr-frontend

Next.js 16 monorepo (pnpm workspace) for the akxr learning platform.

- `frontend/` — Next.js app (admin / mentor / student dashboards, LMS, meet).
- `packages/api/` — orval-generated API client + custom hooks.
- `packages/design-system/` — shared design tokens + UI primitives.

## Agent skills

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical defaults — no overrides. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root, covering the whole frontend monorepo. See `docs/agents/domain.md`.
