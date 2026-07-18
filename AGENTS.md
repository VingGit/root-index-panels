# root-index-panels DOX

## Purpose

- Quartz 5 community plugin that replaces the root `index` page body with panels for first-level vault directories.
- This ignored nested Git working tree has its own `.git` directory and remote `https://github.com/VingGit/root-index-panels.git`.

## Ownership

- Owns all files under `root-index-panels/`, including generated `dist/` output.
- Keep nested plugin history/status separate from the parent repository; use the nested working tree for its commits and pushes.
- Keep package docs, package manifest, tests, and `dist/` aligned before pushing the nested plugin remote.

## Local Contracts

- Main plugin factory: `RootIndexPanelsPage` in `src/pageType.ts`, exported from `src/index.ts`.
- Main component: `RootIndexPanels` in `src/components/RootIndexPanels.tsx`, exported from `src/components/index.ts` and package root.
- `package.json` must declare Quartz categories `pageType` and `component`, use `configSchema`, and include complete `components.RootIndexPanels` metadata.
- Component metadata must omit `defaultPosition` and `defaultPriority`; normal installation must not add a second layout rendering beside the Page Type body.
- Root rendering suppresses `toc`, `readingTime`, and the source `text` used by host ContentMeta only for the exact physical root record won by this Page Type, through a shallow per-render `fileData` clone. It must not mutate shared data or affect virtual/higher-priority root owners.
- `dist/` is committed because Quartz can install this plugin from GitHub using prebuilt output.
- Keep every compatibility fix inside this plugin. Never edit a file that exists in official Quartz upstream; validate against the stock parent through `npx quartz plugin` commands.

## Work Guidance

- Do not reintroduce template transformer, filter, emitter, i18n, or example component files unless the plugin genuinely implements those features.
- `.inline.ts` scripts and `.scss` styles are bundled as strings by `tsup`; tests should mock them when importing components directly.
- Keep root-level notes and synthetic Page Type output out of the panel list; derive book candidates only from listed physical slugs with at least two path segments.
- For normal Quartz use, enable the plugin in `quartz.config.yaml`; no manual layout entry is required.
- Keep `plans/codex-prompts/topic-appearance/` as the durable book-correctness and appearance contract; Prompt 01 remains authoritative and implementation evidence belongs in `IMPLEMENTATION-NOTES.md`.
- Treat the parent Quartz docs, loader, and installed public types as authoritative when an upstream plugin-template example conflicts with this fork.
- When aggregating `allFiles`, define and test physical-versus-virtual and watch-invalidation behavior explicitly.

## Verification

- Run `npm run check` before committing package changes.
- Run `npm run build` after source or manifest changes and commit the regenerated `dist/` files.
- Run `npm run test:integration` from a nested parent Quartz checkout after loader, Page Type, routing, locale, appearance, or packaging changes. `RIP_QUARTZ_ROOT` may identify an explicit checkout; temporary workspaces are removed unless `RIP_KEEP_INTEGRATION=1` is set for inspection.
- Run `npm run test:watch-integration` when changing aggregate/watch behavior or its documentation; the current stale observations are expected only when the subsequent clean build corrects them.
- When validating unpublished local work inside the parent Quartz fork, switch sources with `quartz plugin remove` then `quartz plugin add`, verify the lock entry, and never junction the nested worktree over a remotely pinned cache. Reinstall from the remote/pin only after that revision has been pushed.

## Child DOX Index

- `test/integration/AGENTS.md` — isolated real-Quartz fixture runners, safety boundaries, and host verification contracts.
