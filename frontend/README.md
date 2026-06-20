# Turborepo Monorepo

This is a monorepo managed with [Turborepo](https://turborepo.com/), containing multiple apps and packages for a TypeScript-based frontend ecosystem.

## Monorepo Structure

```
frontend/
  apps/
    hq/         # Main React app (Vite, Tailwind CSS)
    jlens/      # (React app, purpose TBD)
  packages/
    ui/         # Shared React UI component library (Tailwind CSS, Rollup)
    eslint-config/    # Shared ESLint configurations
    typescript-config/ # Shared TypeScript configurations
```

## Apps

- **hq**: Main React application using Vite, Tailwind CSS, and TypeScript. Entry point: `apps/hq/src/main.tsx`.
- **jlens**: React application (add a description of its purpose here if known).

## Packages

- **ui**: Shared React component library, built with Rollup and styled with Tailwind CSS. Used by apps for consistent UI.
- **eslint-config**: Centralized ESLint configuration for code linting across the monorepo.
- **typescript-config**: Shared `tsconfig.json` base files for consistent TypeScript settings.

## Getting Started

To install dependencies for all apps and packages:

```
cd frontend
npm install
```

## Development

To develop all apps and packages:

```
# With global turbo (recommended)
turbo dev

# Or with npx
npx turbo dev
```

To develop a specific app (e.g., hq):

```
turbo dev --filter=apps/hq
```

### Running the hq App Directly

You can also run the `hq` app directly with Vite:

```
cd apps/hq
npm install
npm run dev
```

## Build

To build all apps and packages:

```
turbo build
```

To build a specific app or package:

```
turbo build --filter=apps/hq
```

## Linting & Formatting

To lint all packages and apps:

```
turbo lint
```

To format code with Prettier:

```
turbo format
```

## Tools & Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Vite](https://vitejs.dev/) for fast frontend builds (apps/hq)
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS (apps/hq, packages/ui)
- [PostCSS](https://postcss.org/) for CSS processing
- [Rollup](https://rollupjs.org/) for bundling the UI library

## Remote Caching

Turborepo supports [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) via Vercel for faster CI and team workflows. See the [Turborepo docs](https://turborepo.com/docs/core-concepts/remote-caching) for setup instructions.

## Useful Links

- [Turborepo Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Turborepo Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Turborepo Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Turborepo Configuration](https://turborepo.com/docs/reference/configuration)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

Feel free to update this README with more details about each app or package as your project evolves.
