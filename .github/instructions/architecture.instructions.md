---
name: Plugin architecture
description: Canonical product, data, rendering, integration, and packaging contract
applyTo: "{src,test,scripts,types,dist}/**,package.json,package-lock.json,tsup.config.ts"
---

# Plugin architecture

This is the single technical contract for `@quartz-community/root-index-panels`. Do not restate it
in task prompts; link here and update this file when the contract changes.

## Package topology

The plugin has two independent rendering roles:

```text
RootIndexPanelsPage (Page Type factory)
└── body: RootIndexPanels (public advanced component; not manifest-declared)

RootIndexSidebar (public left layout component)
└── the only entry in package.json#quartz.components
```

`RootIndexPanelsPage(options)` has priority `100`, matches only the existing physical regular slug
`index`, has no generator, and uses layout key `content` with Quartz's default frame. Its body
factory constructs `RootIndexPanels(options)`. The advanced component also guards against non-root
use.

The manifest retains `pageType` and `component` categories but declares exactly one component:
`RootIndexSidebar`, with `defaultPosition: "left"` and `defaultPriority: 40`. A fresh CLI add must
create one left-layout declaration. `RootIndexPanels` remains exported but absent from component
discovery so the installer cannot create a second body.

The Page Type performs no tree suppression or shared-data mutation. Root HAST, `toc`, `readingTime`,
and `text` remain available to independent Quartz components and emitters.

## Physical book model

`src/books.ts` collects books in one pass over `allFiles`:

1. Parse a canonical slug with at least two non-empty segments. Reject leading, trailing, doubled,
   dot-segment, slash/backslash, and other canonical-path anomalies. Reject `tags` and case-sensitive
   `excludeDirs`; `index` is a valid first-level directory name.
2. A candidate requires a listed physical descendant: `filePath` must exist and top-level
   `unlisted !== true`. Deduplicate full physical slugs; first eligible occurrence wins.
3. A listed physical or ordinary generated FolderPage `<segment>/index` may prove a destination.
   Canvas/Bases-provenance records cannot prove it.
4. Emit only candidates with a destination. Use only a physical listed `<segment>/index` as the
   source of title, description, tags, and `panel` metadata.
5. Count listed physical descendants once, excluding the book's own index. Authored nested indexes
   count; virtual indexes do not.

Root notes, virtual-only pages, empty directories, and Canvas/Bases synthetic entries do not create
books. Preserve an authored title exactly. Humanize only a missing title by replacing hyphens with
spaces and uppercasing the first character.

For each physical file, accept the first valid date in this order:

1. `dates.modified`, `dates.created`, `dates.published`;
2. top-level `modified`, `updated`, `created`, `date`; and
3. frontmatter `modified`, `updated`, `created`, `published`, `date`.

Valid dates are `Date` objects, finite numbers within the ECMAScript Date range, and parseable
strings; epoch and pre-1970 values are valid. Date sorting uses the newest accepted timestamp in
the whole book. Undated books sort last. Count and date sorts descend, then use the same
locale-independent ties as alphabetical sorting: lower-cased title, exact title, segment.

The root body resolves one book-entry array for statistics and cards/list. The separately rendered
sidebar uses the same collector and normalized inventory values; equivalent results are required,
not shared array identity. Generated navigation leaves never flow back into book eligibility,
ordering inputs, or counts.

## Root rendering

`RootIndexPanels` renders the transformed root HAST through the public
`@quartz-community/utils/jsx` `htmlToJsx` API. Do not parse raw Markdown or use
`dangerouslySetInnerHTML`. A non-empty tree uses Quartz's standard
`article.popover-hint > .markdown-preview-view.markdown-rendered` structure and preserves safe
string `frontmatter.cssclasses`. A genuinely empty tree omits only the article wrapper.

Body order is fixed:

1. `.rip-overview` statistics and a no-JavaScript browse link when books exist;
2. authored root HAST; and
3. `#rip-directories` with the heading and cards/list/empty state.

Directory count equals rendered books. Total notes is a saturated safe-integer sum of their
existing `docCount` values. Last updated is their newest finite aggregate date and is omitted when
unavailable. Format dates in UTC with `cfg.locale`, falling back to `en-US`. The browse link targets
the local `#rip-directories` fragment and needs no origin or base path.

## Sidebar inventory and state

`src/navigation.ts` is a separate view over `allFiles` and never changes `docCount`:

- The first listed physical exact `index` supplies the root selector's non-empty authored title.
  Ignore accessors and use localized Home only as fallback.
- Root scope applies to root, root notes, tags, 404, and unrecognized namespaces. It includes listed
  physical root notes and safe generated root Canvas/Base leaves with one segment, excluding index.
- Book scope applies when the current first segment exactly matches an eligible book. It starts
  with one Overview link, then contains that book's listed physical descendants and safe generated
  Canvas/Base leaves, excluding the landing from the descendant tree.
- A generated leaf is safe only when it is not unlisted, owns exactly one matching
  `canvasData`/`basesData` marker, and has a canonical lower-case `.canvas`/`.base` suffix. Reject
  inherited or accessor markers, ambiguous/mismatched provenance, invalid suffixes, and exact
  `<book>/index` collisions. Physical slug collisions win.
- A generated leaf can originate structural folders inside an already eligible book so its nested
  path remains visible. It cannot create or prove a book, change count/order, or supply a folder
  Overview destination or title.
- Deduplicate full slugs before insertion. Exclude unlisted data, reserved/excluded books, other
  books, and unsupported virtual records.
- Folders sort before leaves, followed by case-insensitive title, exact title, and stable key.
  Ordinary notes, Canvas, and Base use distinct file-text, workflow, and table-properties icons.

Cache the immutable model in a `WeakMap` by `allFiles` identity plus normalized `excludeDirs`,
`descriptionFallback`, `sort`, and `tagCount`. A clean build/new `allFiles` identity is the
invalidation boundary.

The sidebar server-renders a labelled `<nav>` using native `<details>/<summary>`, `<ul>/<li>`, and
ordinary anchors. Selection and exact-page state are distinct: exactly one manual has
`data-rip-selected="true"`, a visible check, and hidden selected text; only the exact destination
has `aria-current="page"`. Top-level folders start open; deeper folders open only for the current
ancestry.

The native selector and links are complete without JavaScript. The enhancement only enforces one
open selector, closes on a selected link or outside pointer, and closes on Escape with focus
restoration. It initializes on Quartz `nav` and tears down every listener through
`window.addCleanup`.

At the `800px` breakpoint the shell becomes a native disclosure with 2.75rem minimum targets.
Plugin-local wide-screen CSS must expose content after a closed mobile shell is widened and its
narrow-only summary disappears.

## Host-shell ownership

Exactly five kinds of behavioral host selector are permitted:

1. default-frame `#quartz-body` grid containment gated by a direct
   `.left.sidebar > .rip-sidebar`, changing only tablet/mobile intrinsic tracks to
   `minmax(0, ...)` while preserving areas and DOM order;
2. `.left.sidebar:has(> .rip-sidebar)` mobile width/wrap containment, limited to `min-width`,
   `width`, `max-width`, `flex-wrap`, and `overflow-wrap`;
3. separate default-frame and Canvas-frame direct Explorer-sibling replacement variants;
4. Canvas-frame containment gated by `.canvas-sidebar > .rip-sidebar`, setting only
   `box-sizing: border-box` on the host frame; and
5. default-frame eligible-book breadcrumb promotion that hides only the redundant first Home crumb.

Repeated breakpoints and the two Explorer frame variants remain one selector kind each. Explorer
replacement is the only whole-component suppression.

`replaceExplorer` normalizes to `true` unless an actual boolean is supplied. When true, the sidebar
emits `data-rip-replace-explorer="true"` and CSS may hide only these direct siblings:

```text
.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer

.page[data-frame="canvas"]
  > #quartz-body
  > .center.canvas-frame
  > .canvas-sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"])
  > .explorer
```

The selectors intentionally depend on current Quartz markup and browser `:has()` support. False
emits no matching value and leaves Explorer untouched. Lack of `:has()` support fails safely by
showing Explorer. JavaScript never mutates Explorer.

On a default-frame book route, hide only
`.breadcrumb-element:first-child:not(:only-child)` inside stock Breadcrumbs. Quartz's existing next
crumb becomes the first visible book-title/root link. Root routes retain stock behavior. PageTitle
and the manual selector retain true-root access. JavaScript never rewrites Breadcrumbs.

Never select, clear, hide, move, or style `.right`, Graph, TOC, Backlinks, Search, PageTitle, or
other host components. Graph remains a normal right-layout component in the default frame.
CanvasPage is a host-controlled fullscreen exception without an ordinary right slot; its separate
box-model rule must not target the stage, container, controls, or transforms. Cross-book links stay
ordinary Quartz links and may appear in Graph/Backlinks.

## Paths and hosting

Resolve panel, root, book, note, and valid folder destinations with public
`@quartz-community/utils/path` helpers relative to the current full slug. Never concatenate an
origin-relative route or duplicate a base path. Treat `/quartz-for-gitlab/` only as an example of
general subdirectory hosting.

## Options and appearance security

Normalize public options defensively because direct TypeScript calls bypass manifest validation:

- `layout`: only `cards` or `list`, else `cards`;
- `sort`: only `alphabetical`, `docCount`, or `date`, else `alphabetical`;
- display flags and `replaceExplorer`: only booleans, else `true`;
- `tagCount`: floor finite values and clamp at zero, else `3`;
- `excludeDirs`: trimmed non-empty strings, first-occurrence deduplication, case-sensitive;
- `descriptionFallback`: preserve any string, including whitespace, else `""`; and
- registry maps: own data properties only; ignore accessors, inherited entries, invalid keys/values,
  and normalized duplicates.

Quartz shallowly applies package defaults, YAML, then `quartz.ts`. `icons` and `accents` are complete
replacement maps. `accents` is YAML-safe but absent from `configSchema` because the schema has no
accurate arbitrary-map type. Function-valued `icons` is TypeScript-only and absent from manifest
defaults/schema.

Registry names match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. `theme` is reserved for accent behavior.
Static built-ins are `book-open`, `coffee`, `terminal`, `container`, `layers`, `code-2`, `network`,
`git-branch`, `database`, `shield`, `cpu`, `globe`, and `file-code-2`. With
`lucide-preact@1.25.0`, public `code-2` maps to `CodeXml` and `file-code-2` maps to `FileCode`.
Custom own aliases win built-in collisions. Unknown panel icons fall back once to `defaultIcon`,
then render no icon.

Accept accents only as `theme`, a valid own registry name whose value passes the direct grammar,
`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, or exact `var(--[A-Za-z_][A-Za-z0-9_-]*)`. Reject keywords,
arbitrary functions, fallback values, URLs, gradients, declarations, braces, controls, and extra
tokens. `panel.accent: theme` bypasses the default. Other invalid panel values fall back once to
`defaultAccent`; invalid defaults become theme. Do not recurse through aliases.

Raw colors never enter selectors, classes, IDs, or data attributes. Named accents expose only the
safe key; direct accents use `data-rip-accent="direct"`. Named/direct values set a validated inline
custom property, which sites with strict CSP style-attribute policies must account for. Accent is
decorative and never the only focus/current-state cue.

Icons are wrapped as inert, `aria-hidden`, non-interactive content with non-focusable SVG. Custom
components must not introduce links, controls, focusable descendants, or accessible-name noise.
Each card/list row has one whole-panel anchor.

## Localization, interaction, and public API

Plugin-owned `en-US` and `fi-FI` catalogs cover counts, overview, browse, empty state, Explorer,
manual switcher, selected manual, Overview, and sidebar labels. Select locale per render and fall
back to English. Do not import Quartz private locale catalogs.

Cards/list use Quartz tokens, reflow to one column, preserve forced-color focus, and remove
nonessential motion under reduced-motion. The card interaction is a top-centred `120% 80%` radial
accent glow at eight-percent mix fading at 70%, a one-pixel accent-centred bottom hairline, 300ms
opacity, focus parity, and a two-pixel hover lift. Do not restore accent-border or title-color hover.

The panel keyboard script handles unmodified Arrow/Home/End movement only while a panel link has
focus, initializes on `nav`, and registers cleanup. It must remain safe for zero/one-panel cases.

Public exports are:

- package root: `RootIndexPanelsPage`, `RootIndexPanels`, `RootIndexSidebar`, public option aliases,
  `PanelIconComponent`, and shared Quartz type re-exports;
- `./components`: both components, their option aliases, and `PanelIconComponent`; and
- `./types`: public option/icon types and shared Quartz types.

Do not export internal inventory, navigation-model, normalization, or resolver types only for tests.

## Build and distribution

`tsup` produces ESM, declarations, and source maps for the root, `./types`, and `./components`.
SCSS and `.inline.ts` files become component resource strings. Normalize source-map embedded text to
LF for deterministic Windows/Linux output.

Keep Preact and Quartz host singletons (`preact`, `@jackyzha0/quartz`, `vfile`, `unified`, including
subpaths) external. Bundle other runtime implementation dependencies. Declare optional peers used
by public utility paths directly, including `github-slugger` and `hast-util-to-jsx-runtime`.
Generated checks must reject unexpected bare runtime imports, bundled host singletons, and sources
resolved from ancestor `node_modules`. `THIRD_PARTY_NOTICES.md` must match the bundled source-map
license closure.

Commit generated `dist/` because GitHub installs consume it. Keep package/plugin/component versions
synchronized. Never hand-edit `dist/`.

## Watch boundary

Quartz partial Page Type emission has no dependency-invalidation hook from nested pages to the root,
and sidebar inventory is cached by `allFiles` identity. A watch build may therefore leave root
panels, overview statistics, or sidebar aggregates stale after nested add/change/delete. A
clean/full build is the correctness boundary. Do not patch Quartz core to hide this limitation.
