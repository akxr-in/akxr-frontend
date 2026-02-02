# @akxr/design-system

Shared design system components and utilities for AKXR frontend applications.

## Installation

```bash
pnpm add @akxr/design-system
```

## Usage

```tsx
import { Button, Input, Select, Chip, Tag, Spinner } from "@akxr/design-system";
import { GithubIcon, LinkedinIcon, XIcon, EyeIcon, EyeOffIcon } from "@akxr/design-system";
```

## Components

- **Button** - Primary, secondary, outline, and ghost variants with loading states
- **Input** - Text input with label, error, hint, and password toggle support
- **Select** - Dropdown select component
- **Chip** - Small badge component
- **Tag** - Removable tag component
- **Spinner** - Loading spinner with size variants

## Icons

- `GithubIcon`, `LinkedinIcon`, `XIcon`
- `EyeIcon`, `EyeOffIcon` - For password visibility toggles

## Styling

The design system uses Tailwind CSS with custom design tokens. Import the global styles:

```tsx
import "@akxr/design-system/styles";
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev
```
