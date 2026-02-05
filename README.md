# AKXR Frontend

Monorepo for AKXR frontend application built with Next.js, featuring a shared design system and auto-generated API client.

## Structure

```
├── frontend/                 # Next.js application
├── packages/
│   ├── design-system/        # Shared UI components & icons
│   └── api/                  # Auto-generated API client
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
# Start frontend dev server
pnpm dev

# Build all packages
pnpm build:packages
```

## Environment Configuration

**`packages/api/src/lib/env.ts` is the source of truth for all backend URLs.**

URLs are automatically determined based on `APP_ENV`:

- **Development** (`APP_ENV=development`): `http://localhost:3000`
- **Staging** (`APP_ENV=staging`): `https://api-staging.akxr.in`
- **Production** (`APP_ENV=production`): `https://api.akxr.in`

**Note:** All API calls automatically use `env.BACKEND_URL` based on the current `APP_ENV`. No additional environment variables needed.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm build` | Build frontend for production |
| `pnpm build:packages` | Build design system package |
| `pnpm lint` | Lint all packages |

## Packages

### @akxr/design-system

Shared UI components and icons.

```tsx
import { Button, Input, Select, Spinner } from "@akxr/design-system";
import { GithubIcon, EyeIcon } from "@akxr/design-system";
```

See [packages/design-system/README.md](./packages/design-system/README.md) for details.

### @akxr/api

Auto-generated API client with React Query hooks.

```tsx
import { usePostUserAuthSignin, useGetUser } from "@akxr/api";
```

See [packages/api/README.md](./packages/api/README.md) for details.
