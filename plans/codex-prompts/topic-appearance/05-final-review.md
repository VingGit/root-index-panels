# Prompt 05 — Final implementation review and handoff

> [!note]
> Historical appearance closeout checklist. Use it for regression coverage, then apply the active
> [`topic-navigation-shell`](../topic-navigation-shell/README.md) closeout. Where the two differ,
> the navigation-shell contract controls only its explicitly expanded scope.

Do not treat this as a summary-only prompt. Re-open the frozen contract, inspect the actual diff/artifacts, rerun the gates, and resolve discrepancies before reporting.

## Scope and book correctness

- [ ] Only existing root `index` is owned by `RootIndexPanelsPage`; priority/layout/frame behavior is intentional.
- [ ] Books come only from listed physical first-level content; root notes, virtual pages, `tags`, excludes, and virtual-only/empty folders cannot create panels.
- [ ] Physical book index metadata wins deterministically, authored titles are preserved, counts follow Prompt 00, and aggregation is single-pass.
- [ ] Every card uses the Quartz-resolved `<segment>/index` directory URL; explicit/generated destinations and a dotted segment are integration-tested with base-path/subdirectory hosting.
- [ ] Root `content/index.md`, FolderPage/explicit book index prerequisites, host layout ownership, root HAST behavior, and watch limitation are documented accurately.
- [ ] Root TOC/reading-time data is suppressed without mutating shared processed content; Search/RSS/sitemap/OG treatment of the hidden root source is tested and documented.
- [ ] Existing options/cards/list/tags/sorting/SPA behavior remain compatible except for the explicit correctness fixes.

## Appearance and configuration

- [ ] Untouched defaults render no forced icon, accent property, appearance attribute, or topic palette.
- [ ] `panel.icon`/`panel.accent`, defaults, aliases, named/direct/theme accents, identifier/color grammars, and fallback precedence exactly match Prompt 01.
- [ ] YAML-safe options exist in runtime/default metadata and are represented by `configSchema` where its verified vocabulary is accurate; any TUI-schema limitation is explicit. `icons` is documented TypeScript-only through `ExternalPlugin.RootIndexPanelsPage` in `quartz.ts`.
- [ ] Own-property lookups and strict validation prevent inherited-key access and markup/CSS injection.
- [ ] Cards/list use shared resolved data; hooks are safe/scoped/documented; no raw authored value becomes a selector/class/data name.
- [ ] Curated Lucide imports are static, bundled, tree-shaken, locked, licensed, and versioned by the documented built-in list.

## Inclusive localized interaction

- [ ] Icons are decorative SVG-only content with no focus stop, nested interaction, or accessible-name duplication; each panel remains one link.
- [ ] Theme-controlled focus, forced-colors, keyboard, hover, long content, light/dark, and reduced-motion behavior pass review.
- [ ] Plugin-local `en-US` and `fi-FI` singular/plural/empty strings work; unsupported locales fall back per render.
- [ ] SPA initial/navigation/cleanup/re-entry tests prove no duplicate listeners and correct Arrow/Home/End boundaries.
- [ ] Desktop/mobile visual comparison implements the scoped Figma cues without copying host chrome or its mobile overflow.

## Package quality gate

- [ ] `npm ci` completes from the lockfile.
- [ ] Prettier write mode was applied only as needed; `npm run check` passes with zero warnings/failures.
- [ ] `npm run build` passes and all generated `dist/` changes are committed as required by this repository.
- [ ] `git diff --check` passes and scoped status/diffs contain no temporary fixtures, cache contents, secrets, or unrelated edits.
- [ ] `npm pack --dry-run` shows the intended allowlist, declarations, license, notice, docs, and prebuilt files.
- [ ] Built package root, `./types`, and `./components` import successfully; all intended public declarations exist.
- [ ] Generated JavaScript contains no unexpected bare runtime dependency imports, including `lucide-preact`; singleton host externals remain intentional.
- [ ] CI/distribution checks align with the current local loader and plugin-template guidance (`configSchema` remains the local contract).
- [ ] A fresh plugin add creates no `layout` stanza from component defaults and the root renders exactly one panel body.

## Host integration and limitation gate

- [ ] Isolated parent Quartz builds pass with TagPage/FolderPage, explicit/generated indexes, valid/invalid metadata, YAML/TS overrides, SPA on/off, locale variants, and a base-path/subdirectory-hosted URL.
- [ ] Root HTML/CSS and destination files were inspected, not inferred only from a zero exit code.
- [ ] Nested add/change/delete watch staleness was reproduced/documented, and a clean full build was proven to refresh the root panels.
- [ ] The ignored plugin cache was refreshed for testing and is not mistaken for a committed source change.
- [ ] If the plugin was pushed and parent consumption is in scope, `quartz.lock.json` points to the verified commit; otherwise the unchanged pin is called out.

## DOX and release gate

- [ ] Re-read the applicable DOX chain for every changed path.
- [ ] Update nearest owning docs/parent-child indexes for actual durable contract or structure changes; remove stale contradictions.
- [ ] Keep `CHANGELOG.md` under `Unreleased` and versions unchanged unless a separate release was explicitly authorized.
- [ ] No tag, GitHub release, npm publish, or marketplace side effect occurred without authorization.

## Final response format

Lead with whether the plugin is implementation-ready and full-build correct. Then report:

1. exact changed files grouped by plugin, generated output, and parent integration/DOX;
2. final book model and icon/accent/config/localization contracts;
3. command and host-integration results, including inspected output;
4. commit/push and parent-lock state;
5. remaining limitations, headed by partial-watch invalidation;
6. documents intentionally left unchanged and why.
