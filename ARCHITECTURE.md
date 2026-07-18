# Architecture Reference

Architecture of `@quartz-community/root-index-panels`, a Quartz 5 Page Type and layout-component
package.

## Package topology

The plugin has two independent rendering roles:

```text
RootIndexPanelsPage (Page Type factory)
└── body: RootIndexPanels (public advanced component; not manifest-declared)

RootIndexSidebar (public left layout component)
└── the only entry in package.json#quartz.components
```

`RootIndexPanelsPage(options)` has priority `100`, matches only the existing physical regular slug
`index`, has no generator, and uses the host `content` layout and default frame. Its body factory
constructs `RootIndexPanels(options)`. The component also guards on `fileData.slug === "index"` for
advanced manual use.

The package manifest keeps both `pageType` and `component` categories but declares exactly one
component: `RootIndexSidebar`, with `defaultPosition: "left"` and `defaultPriority: 40`. A fresh
`npx quartz plugin add` therefore creates one left-layout declaration. `RootIndexPanels` remains
exported but is deliberately absent from manifest discovery, so the installer cannot place a second
body in the frame.

The Page Type has no tree transform and does not clone or delete root data. The transformed HAST and
the host's `toc`, `readingTime`, and `text` remain available to the body and independent Quartz
components/emitters.

## Physical book aggregation

`src/books.ts` builds the complete book inventory in one pass over `allFiles`:

1. Parse one canonical slug with at least two non-empty path segments, rejecting slash/backslash and
   dot-segment anomalies. Reject the reserved first segment `tags` and case-sensitive `excludeDirs`
   matches. `index` is not reserved as a first-level directory name.
2. Record a listed physical or virtual `<segment>/index` as proof of a landing destination. In normal
   host use, the virtual case is FolderPage output; virtual records carrying `canvasData` or
   `basesData` provenance are not destination proof.
3. Admit candidates and counts only when `filePath` is present and top-level `unlisted !== true`.
   Deduplicate full physical slugs; first eligible occurrence wins.
4. Maintain one accumulator per segment: descendant count, maximum timestamp, and the first eligible
   physical `<segment>/index` metadata record.
5. Emit only accumulators with a recorded destination. Use only the physical index's frontmatter for
   title, description, tags, and `panel`; generated destinations provide no metadata.

Root notes, virtual pages, empty directories, and current Canvas/Bases synthetic entries without
`filePath` cannot create books. A book index is excluded from its own count; every other listed
physical descendant, including an authored nested index, counts once. Authored titles are returned
unchanged. Without one, the first segment is humanized by replacing hyphens with spaces and
uppercasing only the first character.

For each physical file, the date reader accepts the first valid value in this order:

1. `dates.modified`, `dates.created`, `dates.published`;
2. top-level `modified`, `updated`, `created`, `date`; and
3. frontmatter `modified`, `updated`, `created`, `published`, `date`.

Dates may be valid `Date` objects, finite numbers inside the ECMAScript Date range, or parseable
strings. Epoch and pre-1970 values are valid; undated or out-of-range entries use negative infinity.
`sort: date` uses the maximum accepted timestamp across every eligible physical entry. `docCount`
and `date` sort descending, then use the same locale-independent tie-breaker as alphabetical
sorting: lower-cased title, exact title, then segment.

The root body collects and resolves one render-entry array for its overview and cards/list, so those
surfaces cannot drift within a render. The sidebar builds its navigation model with the same book
collector and normalized eligibility/ordering inputs, then adds a route-specific physical-note view.

## Authored root and overview rendering

`src/components/RootIndexPanels.tsx` uses `htmlToJsx` from the public
`@quartz-community/utils/jsx` entry point to render the already-transformed root HAST. It never parses
raw Markdown or uses `dangerouslySetInnerHTML`. A root with children renders one article with the
normal `popover-hint` and `markdown-preview-view markdown-rendered` hooks; authored string entries
from `frontmatter.cssclasses` remain article classes. A genuinely empty tree omits only the
Markdown wrapper.

The body order is fixed:

1. authored root HAST;
2. `.rip-overview`, containing statistics and a no-JavaScript browse link when books exist; and
3. the `#rip-directories` section containing the heading and cards/list/empty state.

The overview is a semantic definition list:

- directory count equals the rendered eligible-book count;
- total notes is a saturated safe-integer sum of existing `docCount` values; and
- last updated is the newest finite aggregate book date, formatted with `Intl.DateTimeFormat` in UTC
  using `cfg.locale` with `en-US` fallback. Its complete row is omitted when no finite date exists.

The conditional browse link targets the local `#rip-directories` fragment and needs no origin or
base-path data. Root TOC, reading-time, Search, RSS, sitemap, and social behavior remain host-owned
and can consume the same authored source.

## Sidebar inventory and route selection

`src/navigation.ts` treats navigation inventory as a separate view over `allFiles`; it never changes
book `docCount`:

- Home notes are listed physical slugs with exactly one segment, excluding `index`.
- A book tree contains only listed physical descendants of that eligible book and excludes the
  book's own `<book>/index` landing from its chapter list.
- Full slugs are deduplicated before insertion. Reserved/excluded books, `tags`, unlisted entries,
  other books, and virtual-only records do not become note nodes.
- Nested path segments create folders. A listed physical or generated nested index may supply that
  folder's overview destination/title, but an empty generated folder creates no node.
- Folders sort before notes, followed by case-insensitive title, exact title, and stable key ties.

The immutable model is cached in a `WeakMap` by `allFiles` identity and the normalized
`excludeDirs`, `descriptionFallback`, `sort`, and `tagCount` values. Repeated page renders in one
build therefore avoid rescanning the complete vault while distinct option variants remain isolated.
A new clean build/all-files identity is the invalidation boundary.

`selectSidebarNavigationScope` maps the current slug to either Home or one book. Root/index, root
notes, tags, 404, and unrecognized first segments use Home. A current slug whose first segment
exactly matches an eligible book uses only that book's hierarchy.

`RootIndexSidebar` server-renders a labelled `<nav>` with native `<details>/<summary>`, nested
`<ul>/<li>`, and ordinary anchors. The switcher always exposes Home and eligible books. Nested
folders open the current ancestry; only the exact current link receives `aria-current="page"`.
Sidebar operation requires no client script. At the `800px` breakpoint, its shell summary becomes a
native mobile disclosure; sidebar summaries and links have a minimum 2.75rem touch target. Above the
mobile breakpoint, a plugin-local rule displays shell content even if the native `<details>` remains
closed after a narrow-to-wide resize, because its reopening summary is hidden there.

The stylesheet permits exactly three kinds of host selector. Two are structural containment, not
cross-plugin suppression:

1. `.page[data-frame="default"]:has(> #quartz-body > .left.sidebar > .rip-sidebar) > #quartz-body`
   may replace only intrinsic `auto` track sizing with `minmax(0, ...)` at tablet/mobile
   breakpoints. Tablet preserves the host's two-track layout; mobile uses one shrinkable track.
2. `.left.sidebar:has(> .rip-sidebar)` may constrain only the mobile left container's width and
   wrapping, including long-label wrapping, so it occupies the available viewport.
3. The direct Explorer sibling selector documented below may suppress Explorer.

The first rule is gated by the default frame and a direct plugin descendant, preserves grid areas
and DOM order, and does not match CanvasPage or another custom frame. Neither structural rule
selects `.right`, `.graph`, `.toc`, Backlinks, or an individual right component. Browser testing at
tablet/mobile widths and zoom/reflow is the compatibility evidence for this deliberately narrow
Quartz-markup dependency.

## Explorer replacement and host ownership

`replaceExplorer` is normalized to `true` unless the caller supplies a boolean. The opted-in sidebar
renders `data-rip-replace-explorer="true"`. One intentionally cross-plugin CSS rule then hides only
the direct stock Explorer beside that sidebar:

```text
.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer
```

The selector is coupled to Quartz's current default-frame `.left.sidebar` and Explorer `.explorer`
markup and to supported browser `:has()` behavior. It is the only cross-plugin suppression. It does
not target nested/unrelated Explorer markup, generic navigation, or any right/center component.
`replaceExplorer: false` emits no true attribute, leaving stock Explorer unchanged; lack of `:has()`
support fails safely by showing it. No JavaScript mutates Explorer.

Search, PageTitle, Darkmode, ReaderMode, Breadcrumbs, ContentMeta, Note Properties, Table of
Contents, Backlinks, Graph, Footer, and other host components remain independent layout entries. The
plugin never clears, hides, repositions, or styles the right slot. A right Graph therefore remains in
the default frame on root and ordinary book pages and follows Quartz's responsive flow.

CanvasPage is an explicit host-frame exception. Its fullscreen `canvas` frame exposes the left slot
and canvas controls but no ordinary right slot, so Graph is absent there unless the site overrides
CanvasPage to use the `default` frame. Root Index Panels neither causes nor bypasses that frame
decision. Its `.canvas-sidebar` wrapper also does not satisfy the default-frame Explorer selector;
when both layout entries are configured, both navigation components can remain in that drawer.

Cross-book links remain ordinary Quartz links; Graph and Backlinks may expose cross-book edges even
while sidebar navigation is scoped to one book.

## Path and deployment contract

Panel, Home, book, note, and valid folder destinations are generated with public
`@quartz-community/utils/path` helpers (`resolveRelative`, `isFullSlug`, and `simplifySlug`) relative
to the current full slug. The plugin never concatenates an origin-relative route or duplicates a
configured base path.

This is general base-path/subdirectory-hosting behavior, not a GitLab-specific mode. A domain-root
deployment and a site beneath `/quartz-for-gitlab/` execute the same code. Tests cover root, deep,
dotted, spaced, Unicode, SPA, and no-SPA output below a non-root base path.

## Runtime option and appearance boundary

`src/options.ts` defensively normalizes options because manifest metadata does not validate direct
TypeScript calls:

- `layout` accepts only `cards` or `list`; `sort` accepts only `alphabetical`, `docCount`, or `date`.
- Display flags and `replaceExplorer` accept only booleans. Invalid values use `true`.
- A finite `tagCount` is floored and clamped at zero; invalid values use `3`.
- `excludeDirs` keeps trimmed, non-empty string entries, deduplicates first occurrence, and remains
  case-sensitive.
- Any string `descriptionFallback`, including whitespace, is preserved.
- Icon/accent maps use own data properties only. Invalid keys/values, accessors, inherited
  properties, and duplicates after normalization are ignored.

Quartz applies package defaults, YAML, then `quartz.ts` overrides with a shallow merge. The `icons`
and `accents` maps are therefore replacement units. `accents` is YAML-safe but absent from
`configSchema` because the current manifest vocabulary has no accurate arbitrary-map descriptor.
Function-valued `icons` is TypeScript-only and absent from manifest defaults/schema.

`src/icons.ts` statically imports 13 curated `lucide-preact@1.25.0` definitions and renders their
static nodes through a hook-free SVG adapter. Stable built-ins are `book-open`, `coffee`, `terminal`,
`container`, `layers`, `code-2`, `network`, `git-branch`, `database`, `shield`, `cpu`, `globe`, and
`file-code-2`. Custom own aliases win collisions; unresolved panel values fall back once to
`defaultIcon`, then no icon.

`src/appearance.ts` accepts theme, validated named accents, and exact direct hexadecimal/custom-
property values. `panel.accent: theme` bypasses the default. Defaults resolve once and never recurse
through aliases. No raw color becomes a selector, class, ID, or data value. Named/direct values set
validated inline custom properties—an explicit consideration for CSPs that prohibit style
attributes. Accent color remains decorative and never replaces current/focus/forced-color cues.

## Localization, accessibility, and SPA lifecycle

Plugin-owned `en-US` and `fi-FI` strings cover count, overview, browse, empty-state, and sidebar
labels. Locale selection occurs per render; unsupported locales fall back to English. Overview dates
also fall back safely when the requested locale is invalid.

Cards and list rows each contain one whole-panel anchor. The visible title supplies the accessible
name; counts, descriptions, and card tags supply descriptions. Icons are inert, `aria-hidden`, and
non-focusable. Styles stay under `rip-*`, use Quartz tokens, reflow to one card column, and include
forced-color/reduced-motion behavior.

`src/components/scripts/panels.inline.ts` handles Arrow, Home, and End movement only while a panel
link has focus. It initializes on Quartz `nav`, ignores modified shortcuts, and registers teardown
with `window.addCleanup`. The sidebar intentionally has no client script because native disclosure
and links provide its complete interaction model.

## Public API

The package has three export surfaces:

- package root: `RootIndexPanelsPage`, `RootIndexPanels`, `RootIndexSidebar`, their public option
  aliases, `PanelIconComponent`, and shared Quartz type re-exports;
- `./components`: `RootIndexPanels`, `RootIndexSidebar`, their option aliases, and
  `PanelIconComponent`; and
- `./types`: the public option/icon types plus shared Quartz type re-exports.

Internal inventory, navigation-model, normalized-option, and resolver types are not public merely
for testing.

## Build and distribution

`tsup.config.ts` produces ESM JavaScript, declarations, and source maps for the root, `./types`, and
`./components` entries. Its loaders compile SCSS and browser-bundle `.inline.ts` files into strings
attached to components. `scripts/normalize-source-maps.mjs` normalizes embedded source text to LF
after production builds so committed artifacts remain deterministic across Windows and Linux.

Preact and Quartz host singletons (`preact`, `@jackyzha0/quartz`, `vfile`, and `unified`, including
subpaths) remain external. Other runtime implementation dependencies, including the tree-shaken icon
registry and Quartz public utilities, are bundled. `github-slugger` is declared directly because the
utility path entry exposes it as an optional peer. `hast-util-to-jsx-runtime` is likewise direct
because the public JSX utility exposes that renderer as an optional peer. Generated-JavaScript
checks reject unexpected bare runtime imports, bundled host singletons, and any dependency source
resolved from an ancestor `node_modules`; `THIRD_PARTY_NOTICES.md` ships the complete bundled
license closure.

`dist/` is committed so GitHub installs can consume prebuilt output. The package allowlist contains
only distribution, public/license documents, changelog, and package metadata. Package/plugin/
component versions remain synchronized at `0.1.1`; this unreleased increment does not itself justify
a version bump, tag, or release.

## Verification and durable fixtures

- `test/book-inventory.test.tsx` covers physical/virtual/listed rules, destinations, metadata,
  counts, dates, normalization, sorting, deduplication, and one-pass access.
- `test/appearance.test.tsx` covers both layouts, built-in/custom icons, exact accent grammar,
  malformed/inherited data, injection rejection, and decorative markup.
- `test/locales-page-type-manifest.test.tsx` covers locale fallback, authored root HAST and retained
  metadata, out-of-range dates, Page Type ownership, exactly-one-sidebar manifest topology, and
  public barrels.
- `test/sidebar-navigation.test.tsx` covers inventory/scope/cache behavior, native SSR markup,
  canonical links, appearance, locale, malformed input, and Explorer opt-out.
- `test/sidebar-style.test.ts` freezes the default-frame grid containment, mobile left width/wrap
  containment, narrow Explorer selector, forbidden right-rail selectors, and native mobile
  disclosure including the closed-mobile-to-wide escape.
- `test/panels-script.test.ts` covers initial/repeated SPA navigation, cleanup, keyboard boundaries,
  and zero/one-panel behavior.
- `test/integration/parent-build.mjs` uses isolated Quartz workspaces for fresh CLI install/layout,
  mixed-Preact rendering, YAML/TypeScript variants, SPA/no-SPA assets, authored root/TOC/reading time,
  root/book sidebar scope, right Graph, Explorer replacement, and non-root base-path output.
- `test/integration/watch-build.mjs` separately reproduces aggregate watch staleness and requires the
  clean full-build correction.
- package scripts verify deterministic maps, generated externals, packed installs, and committed
  `dist/` freshness.

The companion Quartz template keeps JavaScript Basics, Git Practice, and SQL Pocketbook as durable
interoperability books. Their expected physical/listed descendant counts are `8`, `5`, and `6`.
Drafts, unlisted controls, assets, book indexes, Canvas, and Bases do not inflate those totals; the
listed encrypted Git specimen does. Cross-book links exercise normal Graph/Backlinks behavior.

## Watch invalidation boundary

The regular root body and every sidebar aggregate nested files, but Quartz's partial Page Type
emitter exposes no plugin dependency-invalidation hook from nested pages to the root. The sidebar
model also intentionally caches by `allFiles` identity. A serve/watch session can therefore leave
panels, overview counts/dates, or route-scoped navigation stale after nested add/change/delete
events. A clean/full build is the correctness boundary. Patching Quartz core is forbidden; a future
host invalidation API can remove this limitation without changing the public content model.

## Source layout

- `src/pageType.ts`: physical-root Page Type and body ownership.
- `src/books.ts`: shared physical book inventory, metadata, counts, dates, and sorting.
- `src/navigation.ts`: cached Home/book inventory, hierarchy, scope, and link state.
- `src/options.ts`: option/registry validation and normalization.
- `src/icons.ts` and `src/appearance.ts`: safe icon/accent resolution.
- `src/i18n/`: plugin-owned catalogs and locale selector.
- `src/components/RootIndexPanels.tsx`: authored root, overview, browse, cards/list body.
- `src/components/RootIndexSidebar.tsx`: native route-aware left navigation.
- `src/components/styles/`: scoped body/sidebar styles, default-frame responsive grid containment,
  mobile left width/wrap containment, and Explorer sibling replacement.
- `src/components/scripts/`: panel-only SPA keyboard lifecycle.
- `src/build/validate-manifest.ts`: exactly-one-sidebar manifest contract.
- `src/index.ts`, `src/types.ts`, `src/components/index.ts`: public barrels.
- `test/`: focused rendering, API, manifest, locale, DOM, style, and isolated host tests.
- `scripts/`: generated-output and packed-package checks.
- `dist/`: generated, committed prebuilt package.
