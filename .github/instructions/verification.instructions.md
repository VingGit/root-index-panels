---
name: Verification contract
description: Required unit, package, host, browser, accessibility, and release-boundary evidence
applyTo: "{src,test,scripts,types,dist}/**,package.json,package-lock.json,tsup.config.ts,README.md,.github/**/*.md"
---

# Verification contract

Select checks in proportion to the change, but do not treat a component snapshot or successful
build as proof of CLI insertion, host composition, SPA/base-path routing, responsive behavior, or
packaged consumption.

## Baseline and evidence

Before source edits, inspect scoped status/diffs, record the plugin and parent Quartz revisions, run
`npm ci`, and capture relevant baseline checks. When host behavior matters, inspect the current
Quartz docs/source/types and a clean rendered host before freezing the implementation decision.

After edits, record exact commands, results, revisions, pages, selectors, and any pre-existing
warnings. Absence of an observed failure is not proof; assertions must exercise the intended and
negative paths.

## Focused data and option tests

Retain parameterized cards/list coverage for:

- listed-physical book eligibility, root-note exclusion, reserved/excluded namespaces, destination
  proof, metadata index selection, count rules, date sources/ranges, deterministic sorting,
  deduplication, and one-pass access;
- physical versus FolderPage, TagPage, Canvas, Bases, unlisted, duplicate, dotted, spaced, Unicode,
  malformed, leading/trailing/doubled/dot/backslash slug cases;
- exact runtime normalization for every option, shallow maps, own properties, accessors, inherited
  entries, revoked/throwing proxies, and soft failure;
- icon alias/built-in precedence, all accepted accent forms, invalid/injection forms, no raw values
  in hooks, no cross-book appearance leakage, and theme-neutral untouched defaults;
- per-render `en-US`, `fi-FI`, and unsupported-locale fallback; and
- large synthetic input that detects repeated full scans without timing-sensitive benchmarks.

For sidebar inventory, parameterize input order and duplicates. Assert root/book context selection,
authored root fallback, Overview-first behavior, folder destinations/default open states, selected
versus exact-current state, cache isolation for all four normalized inventory inputs, and distinct
note/Canvas/Base leaves. Generated leaves must pass own-provenance, exact suffix, non-unlisted, and
collision tests and must never affect book eligibility, destination proof, count, ordering, or
folder Overview metadata.

## Server-rendered components

For the root body, prove:

- overview is the first direct plugin-body child;
- a non-empty transformed tree appears exactly once in the standard safe article wrapper after the
  overview and before the unique `#rip-directories` target;
- headings, links, callouts, tables, code, transclusion output, supported style/script nodes, and
  safe `cssclasses` survive public HAST conversion;
- an empty tree omits only the article;
- `toc`, `readingTime`, `text`, `fileData`, and HAST inputs are not deleted or mutated;
- statistics, deterministic locale/date output, no-date omission, browse anchor, root guard,
  empty state, and cards/list accessible names are exact.

For the sidebar, prove one labelled navigation region, native details/lists/links, no application
ARIA or custom tab stops, correct labels/menu/scope, exactly one selected item, exact-current only,
Overview/folder ordering, correct relative destinations, safe decorative hooks, three distinct
leaf SVGs, Explorer opt-in emission, and valid zero/one/many/long-label states.

## CSS and inline scripts

Freeze all five permitted host-selector kinds and fail on an additional host suppression:

1. exact default-frame/direct-plugin tablet/mobile grid containment;
2. exact direct-plugin mobile width/wrap containment and only its five allowed properties;
3. exact default and Canvas direct Explorer sibling variants with true opt-in, plus false and
   unrelated/nested visible cases;
4. exact direct-plugin Canvas-frame border-box containment without stage/control/transform targets;
5. exact default-frame book-scope breadcrumb rule hiding only the non-only first element.

Host-shaped DOM/CSS checks must leave Search, PageTitle, toolbars, Graph, TOC, Backlinks, the right
slot, unrelated navigation, and custom frames untouched. Root breadcrumbs remain normal. Reject
JavaScript that queries or rewrites Explorer, Breadcrumbs, or right-side components.

Verify desktop/tablet/mobile display, native mobile close then wide resize, long labels, popup
absolute positioning/scroll/z-index/underlay protection, print, forced colors, and reduced motion.
Freeze the Make card radial gradient, bottom hairline, 300ms opacity, focus parity, two-pixel lift,
and absence of the superseded accent-border/title hover.

Panel and sidebar scripts must cover initial load, repeated Quartz `nav`, cleanup, navigation away
and back, multiple/zero matching components, no duplicate listeners, and no-JS core functionality.
Panel navigation tests include modified-key rejection and Arrow/Home/End boundaries. Sidebar tests
include one-open state, selected-link close, outside pointer close, Escape focus restoration, and
scope restoration when the popup closes.

## Manifest, API, and package

Assert:

- `Object.keys(packageJson.quartz.components)` is exactly `["RootIndexSidebar"]`;
- sidebar metadata/version/default left position/priority and boolean `replaceExplorer: true`
  schema/default are aligned;
- no manifest entry registers `RootIndexPanels`, but built root, `./components`, and `./types`
  expose every documented runtime/type export;
- validators, declarations, source maps, side effects/resources, dependency graph, notices, CI,
  package allowlist, and committed `dist/` cover all changed outputs;
- every generated JavaScript entry has only intended externals, no accidentally bundled singleton,
  no unexpected bare runtime import, and no dependency source resolved from an ancestor; and
- `npm pack --dry-run` plus a temporary consumer import prove the shipped sidebar/panel resources and
  public types work without source files.

## Isolated Quartz integration

Use plugin-owned isolated runners or a temporary stock-shaped checkout. Do not rewrite the actual
parent's upstream files. Cover relevant combinations of:

- cards/list and `replaceExplorer` true/false;
- default and Canvas frames;
- SPA on/off;
- `en-US`, `fi-FI`, and unsupported locale;
- root, root note, book landing, ordinary/nested note, FolderPage, TagPage, Canvas, Bases,
  unlisted/encrypted control, and 404;
- explicit and FolderPage-generated landing destinations; and
- root/deep routes below a base directory such as `/group/project/`.

Inspect generated HTML and resources, not only exit status. Require one sidebar and one root body,
banner/authored-root/directory order, exact scope/state/icons/links, retained root metadata outputs,
existing destinations, base-path-safe resources, Graph in the default right slot, scoped Explorer
replacement, book-first/root-normal breadcrumbs, Canvas stage visibility, and no duplicate SPA
resources or browser errors.

For fresh CLI behavior, run stock local/packed add, inspect the one layout stanza and lock entry,
enable/build, assert one body/sidebar, remove cleanly, and after push repeat remote add/enable/build
against the exact commit. Never infer remote usability from a local cache overlay.

## Browser and accessibility review

For popup, card, breakpoint, Canvas drawer, breadcrumb, or host-composition changes, use a real
browser at representative desktop (>1200px), tablet (800–1200px), and mobile (<800px) widths.
Measure viewport/document/body/left/center/right bounds and require no plugin-induced horizontal
overflow.

Verify:

- selector opening causes zero Explorer layout shift, stays within the viewport, disables the
  covered underlay, and restores it/focus correctly;
- keyboard, pointer, touch, no-JS, SPA, Back/Forward, 200%/400% zoom, long labels, Unicode, light/dark,
  forced colors, reduced motion, and coarse pointers remain usable;
- root → book → nested → other book → root keeps one component/listener set and no console/network
  errors;
- real Canvas/Base routes show correct distinct/current leaves; Canvas drawer closed/open/closed at
  1440, 801, 800, and mobile keeps inward desktop padding, mobile overlay, stage/controls, scoped
  Explorer behavior, and zero horizontal scroll;
- book/default breadcrumbs begin at the existing book-root link while root remains stock; and
- card computed styles match the exact decorative contract without replacing the focus cue.

## Durable fixture and watch diagnostics

When the change touches host integration or content semantics, audit the persistent three-book lab
against [its reference](../reference/compatibility-fixture.md). Expected counts come from a clean
render and the physical/listed model, not file counts or optimistic Canvas/Bases assumptions.

Rerun the separate add/change/delete watch diagnostic for aggregate changes. Record stale behavior
honestly, then stop the watcher and prove a clean/full build corrects root panels, overview, and
sidebar inventory. This watch limitation is pre-approved; full-build defects are not.

## Command gate

Use Prettier write mode only on changed files. Run the relevant subset while iterating, then the
complete gate for source, manifest, dependency, or distribution changes:

```bash
npm ci
npx prettier --write <changed-plugin-files>
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm run test:integration
npm run test:watch-integration
npm pack --dry-run
git diff --check
```

`npm run format` checks formatting; it does not write fixes.
