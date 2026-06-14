# root-index-panels DOX

## Purpose

- Quartz 5 community plugin that replaces the root `index` page body with panels for first-level vault directories.
- This folder is a git subrepo whose remote is `https://github.com/VingGit/root-index-panels.git`.

## Ownership

- Owns all files under `root-index-panels/`, including generated `dist/` output.
- Keep `.gitrepo` maintained by `git subrepo`; do not edit it by hand.
- Keep package docs, package manifest, tests, and `dist/` aligned before pushing the subrepo remote.

## Local Contracts

- Main plugin factory: `RootIndexPanelsPage` in `src/pageType.ts`, exported from `src/index.ts`.
- Main component: `RootIndexPanels` in `src/components/RootIndexPanels.tsx`, exported from `src/components/index.ts` and package root.
- `package.json` must declare Quartz categories `pageType` and `component`, use `configSchema`, and include complete `components.RootIndexPanels` metadata.
- `dist/` is committed because Quartz can install this plugin from GitHub using prebuilt output.

## Work Guidance

- Do not reintroduce template transformer, filter, emitter, i18n, or example component files unless the plugin genuinely implements those features.
- `.inline.ts` scripts and `.scss` styles are bundled as strings by `tsup`; tests should mock them when importing components directly.
- Keep root-level notes out of the panel list; only slugs with at least two path segments represent first-level directories.
- For normal Quartz use, enable the plugin in `quartz.config.yaml`; no manual layout entry is required.

## Verification

- Run `npm run check` before committing package changes.
- Run `npm run build` after source or manifest changes and commit the regenerated `dist/` files.
- When validating inside the parent Quartz fork, reinstall the plugin cache before building if `.quartz/plugins/root-index-panels` already exists.

## Child DOX Index

- No child AGENTS.md files.
