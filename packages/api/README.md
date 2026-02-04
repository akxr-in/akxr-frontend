# @akxr/api

Auto-generated API client for AKXR Backend with React Query hooks and TypeScript types.

## Installation

```bash
pnpm add @akxr/api
```

## Usage

### React Query Hooks

```tsx
import { usePostUserAuthSignin, useGetUser } from "@akxr/api";

// Mutation hook
const loginMutation = usePostUserAuthSignin();

loginMutation.mutate(
  { data: { email: "user@example.com", password: "password123" } },
  {
    onSuccess: (response) => {
      if (response.status === 200) {
        const { access_token, refresh_token, user } = response.data.data;
        // Handle success
      }
    },
  }
);

// Query hook
const { data, isLoading, error } = useGetUser();
```

### Types

```tsx
import type { PostUserAuthSigninBody, PostUserAuthSignin200 } from "@akxr/api";

const loginData: PostUserAuthSigninBody = {
  email: "user@example.com",
  password: "password123",
};
```

## Available Endpoints

- **Auth** - `usePostUserAuthSignin`, `usePostUserAuthSignup`, `usePostUserAuthRefresh`, `useGetUserGithubLogin`, `useGetUserGithubCallback`
- **User** - `useGetUser`, `usePatchUser`, `usePostUserCompleteProfile`
- **Admin** - `useGetAdminUsers`, `usePostAdminUpgradeRole`
- **Batch** - `useGetBatch`, `usePostBatch`
- **Meeting** - `useGetMeeting`, `usePostMeeting`, etc.

## Environment Configuration

**`packages/api/src/lib/env.ts` is the source of truth for all backend URLs.**

URLs are automatically determined based on `NODE_ENV`:

- **Development** (`NODE_ENV=development`): `http://localhost:3000`
- **Staging** (`NODE_ENV=staging`): `https://api-staging.akxr.in`
- **Production** (`NODE_ENV=production`): `https://api.akxr.in`

**Usage:**
```typescript
import { env } from '@akxr/api';

// Access backend URL
const backendUrl = env.BACKEND_URL;

// Check environment
if (env.isDevelopment) {
  // development-specific code
}
```

**Note:** All API calls automatically use `env.BACKEND_URL` based on the current `NODE_ENV`. No additional environment variables needed.

## Generating API Client

The API client is auto-generated from the OpenAPI spec:

```bash
# Generate from backend
pnpm generate

# Or manually with orval
pnpm orval
```

This will:
1. Fetch OpenAPI spec from `${env.BACKEND_URL}/openapi.json` (based on `NODE_ENV`)
2. Generate React Query hooks and TypeScript types
3. Output to `src/api/generated/` and `src/api/models/`

## Custom Fetch

The package uses a custom fetch function (`custom-fetch.ts`) that:
- Handles authentication tokens automatically
- Wraps responses with status and headers
- **Uses `env.BACKEND_URL` from `env.ts` as the source of truth for backend URLs**
- Automatically selects the correct URL based on `NODE_ENV`

## Error Handling

Errors are automatically handled by React Query. The global error handler in your app will catch and display errors:

```tsx
// Errors are caught by MutationCache/QueryCache
// See frontend/app/providers.tsx for error handling
```

## Development

```bash
# Generate API client
pnpm generate

# Watch mode (if needed)
pnpm orval --watch
```