# Architecture Reference

Architecture of `@quartz-community/root-index-panels`, a Quartz 5 Page Type/component package.

## Plugin boundary

`RootIndexPanelsPage(options)` is the normal integration point. It has priority `100`, matches only the existing physical regular slug `index`, has no generator, uses the host `content` layout, and captures its options in the Page Type factory closure. Its body is `RootIndexPanels(options)`. The component also guards on `fileData.slug === "index"` for advanced manual use.

The Page Type replaces the root Markdown body but not Quartz's frame. Its matcher records the exact physical root object only when the priority-ordered dispatcher evaluates this plugin as the winning owner. A root-only tree transform acts only on that record, shallow-cloning render `fileData` and removing `toc`, `readingTime`, and `text`; current host ContentMeta derives reading time directly from `text`. It cannot affect virtual roots or a physical root won by a higher-priority Page Type, and it never mutates the shared processed record used by Search, RSS, sitemap, Open Graph, or other emitters. The package manifest has both `pageType` and `component` categories but deliberately omits a component position/priority so installation does not create duplicate layout rendering.

## Aggregation pipeline

`src/books.ts` builds the complete book inventory in one pass over `allFiles`:

1. Read a non-empty slug with at least two path segments. Reject the reserved first segment `tags` and case-sensitive `excludeDirs` matches. `index` is not reserved as a first-level directory name.
2. Record a listed physical or virtual `<segment>/index` as proof of a landing destination. In normal host use the virtual case is FolderPage output.
3. Admit candidates and counts only when `filePath` is present and top-level `unlisted !== true`. Deduplicate full physical slugs, with the first eligible occurrence winning.
4. Maintain one accumulator per segment: descendant count, maximum timestamp, and the first eligible physical `<segment>/index` metadata record.
5. Emit only accumulators with a recorded destination. Use only the physical index's frontmatter for title, description, tags, and `panel`; generated destinations provide no metadata.

Root notes, virtual pages, empty directories, and current Canvas/Bases synthetic entries without `filePath` cannot create books. A book index is excluded from its own count; every other listed physical descendant, including an authored nested index, counts once. Authored titles are returned unchanged. Without one, the first segment is humanized by replacing hyphens with spaces and uppercasing only the first character.

For each physical file, the date reader accepts the first valid value in this order:

1. `dates.modified`, `dates.created`, `dates.published`;
2. top-level `modified`, `updated`, `created`, `date`; and
3. frontmatter `modified`, `updated`, `created`, `published`, `date`.

Dates may be valid `Date` objects, finite numbers, or parseable strings. Epoch and pre-1970 timestamps are valid; entries without any valid date sort as older than dated entries. `sort: date` uses the maximum accepted timestamp across every eligible physical entry in the book. `docCount` sorts descending by count; `date` sorts descending by timestamp; both use title and then segment as deterministic ties. Alphabetical sorting uses title and then segment.

`src/components/RootIndexPanels.tsx` resolves every destination with public `@quartz-community/utils/path` as `resolveRelative(rootSlug, "<segment>/index")`. This produces a canonical relative directory URL such as `./java/` or `./git.md/` and remains valid under GitLab Pages subpaths.

## Runtime option boundary

`src/options.ts` defensively normalizes options because manifest discovery metadata does not validate direct TypeScript calls:

- `layout` accepts only `cards` or `list`; `sort` accepts only `alphabetical`, `docCount`, or `date`.
- The three display flags accept only booleans. Invalid values use `true`.
- A finite `tagCount` is floored and clamped at zero; invalid values use `3`.
- `excludeDirs` keeps trimmed, non-empty string entries, deduplicates first occurrence, and remains case-sensitive.
- Any string `descriptionFallback`, including whitespace, is preserved.
- Icon/accent maps use own data properties only. Invalid keys/values, accessors, inherited properties, and duplicates after normalization are ignored.

Quartz applies package defaults, YAML, then `quartz.ts` overrides with a shallow merge. Consequently the `icons` and `accents` maps are replacement units, not deep-merged registries. `accents` is YAML-safe but absent from `configSchema` because the current manifest vocabulary has no accurate arbitrary-map descriptor. Function-valued `icons` is TypeScript-only and is absent from manifest defaults/schema.

## Appearance resolution

`src/icons.ts` statically imports the curated `lucide-preact@1.25.0` components. It invokes each pinned generated wrapper only to read its static `iconNode`, then renders those nodes with a hook-free SVG adapter instead of Lucide's context-consuming Icon. This keeps direct local and GitHub CLI installs compatible even when a development worktree has its own auto-installed Preact peer, without changing Quartz upstream. The module exposes stable keys rather than authored dynamic imports: `book-open`, `coffee`, `terminal`, `container`, `layers`, `code-2`, `network`, `git-branch`, `database`, `shield`, `cpu`, `globe`, and `file-code-2`. Custom own aliases resolve before built-ins; an unresolved panel name falls back once to `defaultIcon`, then to no icon.

`src/appearance.ts` resolves theme, named, and direct accents. Registry identifiers are trimmed lower-case kebab names. Direct values accept only the four supported hexadecimal lengths or an exact `var(--property)` without fallback tokens. `panel.accent: theme` bypasses the default; otherwise named then direct panel values are tried before `defaultAccent`. Defaults resolve once as theme, named, or direct and never recurse through registry aliases. Invalid defaults become theme behavior.

Resolved safe data is the only appearance input used by the component:

- a resolved icon adds `data-rip-icon` plus an inert, `aria-hidden` `.rip-panel-icon`; the SVG is non-focusable;
- a named accent adds its validated key to `data-rip-accent` and its validated value to `--rip-panel-accent`;
- a direct accent uses `data-rip-accent="direct"` and the validated custom property; and
- theme behavior adds no accent attribute or inline style.

No raw color becomes a selector, class, or data value. Accents are decorative; focus and forced-color indicators remain controlled by host/system colors. Named/direct accents use an inline style custom property, which is an explicit CSP consideration for hosts that prohibit style attributes.

## Rendering and localization

Cards and list layout share the same collected and resolved entries. Each item contains one anchor whose visible title supplies `aria-labelledby`; count, description, and card tags are supporting `aria-describedby` content. Tags appear only in cards. Accented list rows retain a visible inline-start cue even when no icon resolves. Styles remain under the `rip-*` namespace, use Quartz tokens, auto-fit to narrow widths, disable nonessential motion for `prefers-reduced-motion`, and include forced-color fallbacks.

`src/i18n/` owns the translation contract. `i18n(cfg.locale)` is evaluated on every render, ships exact `en-US` and `fi-FI` count/empty strings, and returns English for unsupported locales. Card counts use an `aria-hidden` numeric badge plus a visually hidden localized phrase referenced by `aria-describedby`; list counts render the localized phrase directly.

`src/components/scripts/panels.inline.ts` initializes on each Quartz `nav` event. It handles Arrow, Home, and End focus movement inside both layouts and registers listener removal through `window.addCleanup`. It adds no framework or tabindex-based interaction.

## Public API

The package has three export surfaces:

- package root: `RootIndexPanelsPage`, `RootIndexPanels`, `RootIndexPanelsOptions`, `RootIndexPanelsPageOptions`, and `PanelIconComponent`;
- `./components`: `RootIndexPanels`, `RootIndexPanelsOptions`, and `PanelIconComponent`; and
- `./types`: the public option/icon types plus shared Quartz type re-exports.

Internal inventory, normalized-option, and resolver types are not public merely for testing.

## Build and distribution

`tsup.config.ts` produces ESM JavaScript, declarations, and source maps for the root, `./types`, and `./components` entries. Its loaders compile SCSS and browser-bundle `.inline.ts` files into strings attached to the component.

Preact and Quartz host singletons (`preact`, `@jackyzha0/quartz`, `vfile`, and `unified`, including subpaths) remain external. Other runtime implementation dependencies, including the statically tree-shaken `lucide-preact` registry and `@quartz-community/utils`, are bundled into the prebuilt output. Artifact checks scan every generated JavaScript entry for unexpected bare runtime imports. `THIRD_PARTY_NOTICES.md` ships the Lucide/Feather and Quartz utility notices.

`dist/` is committed so GitHub installs can consume prebuilt output. The package allowlist includes only the distribution, public/license documents, changelog, and package metadata. Version fields remain synchronized but are not advanced during unreleased implementation.

## Verification structure

- `test/book-inventory.test.tsx` covers physical/virtual/listed rules, destinations, metadata, counting, dates, normalization, sorting, deduplication, and one-pass access.
- `test/appearance.test.tsx` covers both layouts, all built-ins, custom collision precedence, malformed/inherited data, the exact accent grammar, injection rejection, and decorative icon markup.
- `test/locales-page-type-manifest.test.tsx` covers per-render locale fallback, Page Type ownership, root data cloning, manifest contracts, and runtime barrels.
- `test/panels-script.test.ts` uses a DOM environment for initial/repeated SPA navigation, cleanup, keyboard boundaries, and zero/one-panel behavior.
- `test/public-api-consumer.tsx` typechecks consumer imports from every declared entry.
- `test/integration/parent-build.mjs` uses isolated temporary Quartz workspaces for a physical mixed-Preact render, a fresh local CLI add, and three real host builds: YAML/cards/en-US/SPA, TypeScript custom-icon/list/fi-FI/no-SPA, and unsupported-plugin-locale fallback under a GitLab subpath.
- `test/integration/watch-build.mjs` is a separate opt-in stock-host diagnostic that reproduces nested add/change/delete staleness and verifies the clean full-build correction. It also accepts a future host that gains correct root dependency invalidation.
- `scripts/check-dist-externals.mjs` and `scripts/check-packed-package.mjs` verify built dependency and packed-install contracts.

CI runs the source checks, build, distribution scan, package check, and a freshness assertion for committed `dist/`.

## Watch invalidation boundary

The regular root page aggregates nested files, but Quartz's partial Page Type emitter re-emits only changed regular slugs and provides no plugin dependency-invalidation hook. A serve/watch session can therefore leave the emitted root aggregate stale after nested add/change/delete events. A clean/full build is the correctness boundary; changing ownership to a virtual page or patching Quartz core requires a separate design.

The stock-host diagnostic observed all three current cases: adding a nested page emitted that page while the root count remained `1` instead of `2`; changing the authored book index updated the book page while the root retained the old description; deleting both descendants rebuilt but left count `1` instead of `0`. A subsequent clean build emitted count `0` and the new description.

## Source layout

- `src/pageType.ts`: root Page Type and render-only root metadata suppression.
- `src/books.ts`: one-pass physical inventory, metadata, counts, dates, and sorting.
- `src/options.ts`: option/registry validation and normalization.
- `src/icons.ts`: curated built-in and custom icon resolver.
- `src/appearance.ts`: named/direct/theme accent resolver.
- `src/i18n/`: plugin-owned catalogs and locale selector.
- `src/components/`: component, scoped styles, and SPA inline script.
- `src/build/validate-manifest.ts`: package-manifest contract check.
- `src/index.ts`, `src/types.ts`, `src/components/index.ts`: public barrels.
- `test/`: focused rendering, API, manifest, locale, DOM, and isolated parent-build tests.
- `scripts/`: packed-output and generated-import checks.
- `dist/`: generated, committed prebuilt package.
