# Architecture Reference

Architecture overview for `@quartz-community/root-index-panels`.

## Plugin Shape

- `RootIndexPanelsPage` is the main Quartz plugin factory exported from `src/pageType.ts` and re-exported from `src/index.ts`.
- The page type has priority `100`, matches only slug `"index"`, uses layout key `"content"`, and supplies `RootIndexPanels` as the page body.
- `RootIndexPanels` remains exported from `src/components/index.ts` for advanced manual layout use.
- The package has Quartz categories `pageType` and `component`; it does not implement transformer, filter, or emitter hooks.

## Build System

The package uses `tsup` for bundling and declaration output.

- **Inline Scripts**: Files ending in `.inline.ts` are bundled as raw strings for client-side injection.
- **Styles**: `.scss` files are compiled to CSS strings and attached to components via `Component.css`.
- **Entry Points**:
  - `index.ts`: Page-type and component exports.
  - `types.ts`: Public type re-exports.
  - `components/index.ts`: UI component exports.

## Type System

The package relies on `@quartz-community/types` for core Quartz types.

- `QuartzPageTypePlugin` defines `RootIndexPanelsPage`.
- `QuartzComponentConstructor` and `QuartzComponentProps` define `RootIndexPanels`.
- `QuartzPluginData` is read from `allFiles` for slugs, frontmatter, and optional date metadata.

## Export Conventions

- `RootIndexPanelsPage` is a named export from the package root.
- `RootIndexPanels` is a named export from the package root and `./components` subpath.
- `RootIndexPanelsOptions` and `RootIndexPanelsPageOptions` are public type exports.

## Dependency Management

- **peerDependencies**: `preact`.
- **dependencies**: `@quartz-community/types`.
- **devDependencies**: Build tools, linters, and test runners.

## Testing Infrastructure

- `vitest` runs `test/**/*.test.ts` and `test/**/*.test.tsx`.
- Component tests render with `preact-render-to-string`.
- Tests mock `.inline.ts` and `.scss` imports because tsup turns them into strings during package builds.

## CI/CD Pipeline

- GitHub Actions run `npm run check`.
- `dist/` is committed so Quartz can use the prebuilt package from GitHub without a local plugin build.

## Directory Structure

- `src/`: Source code.
  - `pageType.ts`: Root index page-type factory.
  - `components/`: UI components.
    - `scripts/`: Client-side scripts (`.inline.ts`).
    - `styles/`: Component styles (`.scss`).
  - `index.ts`: Main entry point.
  - `types.ts`: Type definitions.
- `test/`: Vitest coverage for rendering and page-type matching.
- `dist/`: Build output.
- `package.json`: Manifest and dependencies.
- `tsup.config.ts`: Build configuration.
