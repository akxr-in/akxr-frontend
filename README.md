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

## Environment Variables

Create environment files in `frontend/`:

- `.env.development` - `NEXT_PUBLIC_API_URL=http://localhost:3000`
- `.env.staging` - `NEXT_PUBLIC_API_URL=https://api-staging.akxr.com`
- `.env.production` - `NEXT_PUBLIC_API_URL=https://api.akxr.com`

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

## Features

- ✅ Email/password authentication
- ✅ GitHub OAuth login
- ✅ Token refresh on expiration
- ✅ Protected routes with middleware
- ✅ Complete profile flow
- ✅ Responsive design system

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Package Manager:** pnpm (workspace)
