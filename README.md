# AKXR Frontend

Monorepo with Next.js frontend and shared design system.

## Structure

```
├── frontend/                 # Next.js app
├── packages/
│   └── design-system/        # Shared UI components & theme
└── pnpm-workspace.yaml
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend |
| `pnpm build` | Build frontend |
| `pnpm build:packages` | Build design system |

## Using Design System

```css
/* Import styles in globals.css */
@import "@akxr/design-system/styles";
```

```tsx
import { Button, Input } from "@akxr/design-system";

<Button variant="primary">Click</Button>
<Input label="Email" placeholder="you@example.com" />
```

## Adding Components

1. Create `packages/design-system/src/components/ComponentName.tsx`
2. Export in `packages/design-system/src/components/index.ts`
3. Run `pnpm build:packages`
