# root-index-panels

A Quartz 5 Page Type and layout-component plugin for a multi-book knowledge base. Every eligible
first-level content directory becomes a book. The physical root page renders an aggregate overview,
its authored Markdown, and book cards or a list; a route-aware left sidebar switches between the
authored root manual and the books without taking ownership of Quartz's right layout slot.

The package has two deliberately separate rendering roles:

- `RootIndexPanelsPage` owns only the physical `content/index.md` Page Type body. Its body component,
  `RootIndexPanels`, remains a public advanced API but is not manifest-discoverable.
- `RootIndexSidebar` is the only component declared in the manifest. A fresh CLI install places it
  in the left slot at priority `40`.

This topology produces one root body and one sidebar. It does not require Quartz core changes, a
custom page frame, or manual placement of the Page Type body.

## Requirements and book model

`content/index.md` must exist. The plugin matches that physical root page; it does not generate a home page.

A first-level directory becomes a book only when all of these conditions hold:

- it contains at least one listed physical content entry below the first path segment;
- its first segment is not the reserved `tags` namespace or an `excludeDirs` entry (`index` is a valid book-directory name); and
- `<book>/index` exists either as a listed physical `<book>/index.md` or as a generated FolderPage destination.

If FolderPage is disabled, create an explicit `index.md` in every book. A generated FolderPage may
prove that the destination exists, but virtual pages never create a book, supply metadata, or affect
counts. A virtual index carrying Canvas/Bases provenance cannot prove a book destination even when
that directory also contains physical Markdown. Root-level notes, empty folders, and synthetic
Canvas/Bases entries without `filePath` do not create books.

The physical, listed `<book>/index.md` is the only metadata source. Its authored title is preserved exactly; only a missing title is humanized from the directory slug. A same-named root note such as `java.md` is never used. Each count includes listed physical descendants except the book's own index; authored nested indexes count and virtual indexes do not. Duplicate physical slugs count once, with the first eligible entry winning. `sort: date` uses the newest valid date found anywhere in the book's listed physical entries, checking Quartz `dates`, then top-level file data, then date-like index/descendant frontmatter. Valid dates include epoch and pre-1970 finite/parseable timestamps; undated books sort behind dated books.

Every destination is resolved as `<book>/index` through Quartz's public path utility. From the root,
links are canonical directory URLs such as `./java/` or `./git.md/`. The same relative-resolution
rule is used by the sidebar, so links continue to work when any hosting provider serves the site
beneath a base path such as `/quartz-for-gitlab/`.

## Installation

Install the plugin from GitHub, then enable the disabled-by-default entry created by the CLI:

```bash
npx quartz plugin add github:VingGit/root-index-panels
npx quartz plugin enable root-index-panels
```

The add command reads the manifest and creates exactly one layout declaration for
`RootIndexSidebar`:

```yaml
layout:
  position: left
  priority: 40
```

Configure the generated plugin entry in `quartz.config.yaml` as needed:

```yaml
plugins:
  - source: github:VingGit/root-index-panels
    enabled: true
    options:
      layout: cards
      showDescription: true
      showDocCount: true
      showTags: true
      tagCount: 3
      sort: alphabetical
      excludeDirs: []
      descriptionFallback: ""
      defaultIcon: ""
      defaultAccent: theme
      accents: {}
      replaceExplorer: true
    layout:
      position: left
      priority: 40
    order: 50
```

Do not add `RootIndexPanels` to a layout slot. `RootIndexPanelsPage` already supplies that body, and
the manifest intentionally declares only the sidebar. Temporarily disable/re-enable the existing
entry, or remove it cleanly, with the normal CLI:

```bash
npx quartz plugin disable root-index-panels
npx quartz plugin enable root-index-panels
npx quartz plugin remove root-index-panels
```

If an older installation predates the sidebar manifest, preserve its option values and run the
remove/add/enable sequence again so Quartz regenerates the left-layout declaration.

## Writer frontmatter

Optional appearance metadata belongs only on the physical book index:

```yaml
---
title: Linux
description: Kernel, networking, observability, and command-line notes.
tags:
  - kernel
  - networking
panel:
  icon: terminal
  accent: ocean
---
```

`panel.icon` is a built-in or custom registry identifier. `panel.accent` is `theme`, a named accent, or an allowed direct color. The plugin never infers appearance from the directory name, title, or tags, and does not accept SVG, HTML, CSS declarations, or remote assets from frontmatter.

### Icon names

Identifiers are trimmed lower-case kebab names matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. The versioned registry backed by bundled `lucide-preact@1.25.0` contains:

`book-open`, `coffee`, `terminal`, `container`, `layers`, `code-2`, `network`, `git-branch`, `database`, `shield`, `cpu`, `globe`, and `file-code-2`.

The plugin reads the pinned generated Lucide node definitions and renders them through a hook-free SVG adapter. It does not depend on a Lucide context tied to a plugin worktree's Preact copy, so both local and GitHub `npx quartz plugin add` workflows remain stock-host compatible.

No icon is enabled by default. Resolution is:

1. resolve `panel.icon` as an own custom alias, then as a built-in;
2. if it is missing, malformed, or unknown, resolve `defaultIcon` the same way; and
3. otherwise render no icon.

Custom aliases deliberately win collisions with built-ins. Invalid, inherited, or non-component alias entries are ignored.

### Accent values

Direct accents are trimmed and must be exactly one of:

- `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`, using hexadecimal digits; or
- `var(--custom-property)`, where the property starts with a letter or underscore and then contains only letters, digits, underscores, or hyphens.

CSS keywords, arbitrary functions, `var()` fallbacks, gradients, URLs, declarations, braces, and extra tokens are rejected. Named registry identifiers use the icon-name grammar; `theme` is reserved and cannot be an accent registry key.

Resolution is:

1. `panel.accent: theme` immediately uses Quartz theme behavior and bypasses the default;
2. otherwise, a valid name resolves through the site's own `accents` entry;
3. otherwise, an allowed direct value is used;
4. missing, unknown, or invalid panel values fall back to `defaultAccent`; and
5. the default resolves as `theme`, one named entry, or one direct value. Invalid defaults become `theme`; registry values are not recursive aliases.

Prefer named values backed by Quartz/custom CSS variables for light/dark contrast. Literal colors are an explicit site-author override and never control the focus outline.

## YAML-safe site options

| Option                | Type                               | Default        | Runtime normalization and behavior                                                                      |
| --------------------- | ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| `layout`              | `cards \| list`                    | `cards`        | Any other value becomes `cards`.                                                                        |
| `showDescription`     | boolean                            | `true`         | Non-booleans become `true`.                                                                             |
| `showDocCount`        | boolean                            | `true`         | Non-booleans become `true`.                                                                             |
| `showTags`            | boolean                            | `true`         | Non-booleans become `true`; tags render only in cards.                                                  |
| `tagCount`            | number                             | `3`            | Finite values are floored and clamped to at least `0`; other values become `3`.                         |
| `sort`                | `alphabetical \| docCount \| date` | `alphabetical` | Any other value becomes `alphabetical`; ties use lower-cased title, exact title, then segment.          |
| `excludeDirs`         | string array                       | `[]`           | Items are trimmed; empty/non-string items and later duplicates are removed. Matching is case-sensitive. |
| `descriptionFallback` | string                             | `""`           | Any string, including intentional whitespace, is preserved; non-strings become `""`.                    |
| `defaultIcon`         | string                             | `""`           | A trimmed valid registry name; malformed or unresolved names produce no icon.                           |
| `defaultAccent`       | string                             | `theme`        | `theme`, a named accent, or an allowed direct value; invalid values become `theme`.                     |
| `accents`             | string map                         | `{}`           | Valid own names map to allowed direct values; invalid entries and the reserved `theme` key are ignored. |
| `replaceExplorer`     | boolean                            | `true`         | `true` hides only the stock Explorer beside this sidebar; non-booleans become `true`.                   |

`accents` is accepted by the YAML loader, but the current Quartz manifest schema cannot accurately describe arbitrary mappings, so it is not exposed through schema-driven TUI editing. `icons` contains Preact components and is TypeScript-only.

Effective precedence is package defaults, then YAML options, then a `quartz.ts` override. Quartz merges options shallowly: an `accents` or `icons` map in a later surface replaces the entire earlier map rather than merging individual keys.

## TypeScript-only custom icons

Register custom component aliases on the Page Type factory before loading the configuration:

```ts
import { createElement } from "preact"
import type { PanelIconComponent } from "./.quartz/plugins/root-index-panels"
import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const ShellNotesIcon: PanelIconComponent = (props) =>
  createElement(
    "svg",
    { ...props, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
    createElement("path", { d: "m5 7 4 5-4 5m6 0h8" }),
  )

ExternalPlugin.RootIndexPanelsPage({
  icons: { "shell-notes": ShellNotesIcon },
  accents: { ocean: "var(--secondary)" },
  defaultIcon: "shell-notes",
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
```

The TypeScript-only `icons` option has type `Record<string, PanelIconComponent>` and an effective default of `{}`. It keeps valid own registry keys whose values are component functions; malformed, inherited, accessor, and non-function entries are ignored. Like `accents`, the complete map is shallowly replaced by a later configuration surface.

Custom icons must render decorative SVG content only: no links, controls, focusable descendants, or
accessible-name content. `RootIndexPanels(...)`, separately exported from the package and
`./components`, is the advanced body constructor; calling it does not configure the Page Type.
Disable the Page Type before taking manual body ownership. `RootIndexSidebar` and
`RootIndexSidebarOptions` are also exported from the package root and `./components`, but the normal
CLI-created layout should remain the integration path.

## Root landing page

`RootIndexPanels` converts the already-transformed root HAST with Quartz's public `htmlToJsx`
utility. It does not render raw Markdown, use a raw HTML-string injection path, or duplicate the
article. A genuinely empty tree simply omits the Markdown wrapper. The visible body order is:

1. a semantic overview with directory count, total listed-note count, the newest valid book date when
   one exists, and—when at least one book exists—a no-JavaScript `Browse directories` anchor;
2. authored root content inside the normal popover/Markdown classes; and
3. the `#rip-directories` heading followed by cards, a list, or the localized empty state.

Directory count is the number of rendered eligible books. Total notes is the safe sum of their
existing physical/listed counts. The last-updated date uses the newest accepted aggregate book date,
is formatted in UTC for deterministic output, and is omitted when every book is undated.

The Page Type leaves root `toc`, `readingTime`, and `text` intact. Table of Contents, ContentMeta,
Search, RSS, sitemap, and social metadata can therefore consume authored root content like they do
on an ordinary content page.

## Left navigation and host composition

`RootIndexSidebar` server-renders a labelled `<nav>` made from native `<details>`, `<summary>`,
lists, and ordinary links. Its selector is a boxed native disclosure: the visible label is the
current book title or the physical root index's authored title, with the localized Home label used
only when that title is unavailable. The absolute popup identifies itself as the manual switcher and
offers the root manual plus every eligible book without shifting the Explorer tree below it.

The complete selector, tree, and links work without JavaScript. A small enhancement closes the
popup after a selected link, an outside pointer press, or Escape; Escape restores focus to the
summary, only one plugin switcher remains open, and Quartz SPA cleanup removes every listener before
re-entry.

The selected manual and exact current page are intentionally different states:

- `data-rip-selected="true"` and a visible check identify the root manual or book whose tree is being
  browsed. Every route inside a book keeps that book selected.
- `aria-current="page"` appears only on the link whose destination is the exact current route. A
  selected book link is therefore not current while reading one of its descendants.

The Explorer scope follows the selected route:

- Root context covers the root, root notes, tags, 404, and routes whose first segment is not an
  eligible book. Its note tree contains only listed physical root notes and excludes `index`.
- Book context selects the matching book and shows only that book's listed physical descendants.
  The book's own index appears once as the first `Overview` link.
- Nested directories use native disclosure. A listed physical or FolderPage-generated index may
  supply a folder overview link, while virtual-only Canvas/Bases records do not become navigation
  notes.
- Top-level folders are open in server output so a book starts as a useful table of contents. Deeper
  folders open only when they are the current destination or contain it. Authored titles, long paths,
  spaces, and Unicode remain text rather than selector data.

The sidebar inventory receives the same normalized `excludeDirs`, `descriptionFallback`, `sort`, and
`tagCount` inputs as the panel collector. In particular, configured alphabetical/count/date ordering
is shared; cache variants include all four values so distinct configurations cannot reuse the wrong
model.

At Quartz's narrow layout, the entire sidebar becomes a native disclosure; its summary and the
sidebar's links/disclosures keep a 2.75rem minimum target. No custom tree keyboard model or focus
trap is required. Reduced-motion and forced-color modes retain usable state and focus cues, and
accent color is never the sole indicator. If a reader closes the shell on mobile and then widens the
viewport, plugin-local CSS exposes the content again above the mobile breakpoint; the now-hidden
summary can never strand desktop navigation in a closed native-details state.

Real-browser testing found that Quartz's intrinsic `auto` grid tracks can retain a wider
left/center/right minimum after this component is inserted. The plugin therefore uses two
non-suppressing containment rules in addition to Explorer replacement:

- a default-frame-only selector gated by
  `#quartz-body > .left.sidebar > .rip-sidebar` replaces only the tablet/mobile grid track sizes
  with `minmax(0, ...)`; and
- `.left.sidebar:has(> .rip-sidebar)` constrains the mobile left container's width and wrapping so
  the sidebar and existing left components fit the viewport.

These rules preserve Quartz's grid areas, document order, and responsive right-rail flow. They do
not select `.right`, Graph, Table of Contents, or any individual right component, and the
`data-frame="default"` gate means CanvasPage and other custom frames never match. Together with the
Explorer rule below, these are the plugin's exactly three kinds of narrowly scoped host selector.

`replaceExplorer` defaults to `true`. The stylesheet hides only a direct stock Explorer sibling
when this component explicitly opts in:

```text
.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer
```

This intentionally depends on Quartz's current default-frame `.left.sidebar` and stock `.explorer`
markup, plus browser support for `:has()`. It is the only rule that suppresses another plugin. It
never mutates Explorer with JavaScript and never targets Search, PageTitle, toolbar controls, or
generic navigation. Set `replaceExplorer: false` to omit the opt-in attribute and keep both
navigation components visible. On an older browser without `:has()`, the safe failure mode is also
that stock Explorer remains visible.

The plugin does not clear, hide, move, or style the right layout slot. A right-positioned Graph—and
independent Table of Contents and Backlinks entries—continues to render on the root and ordinary
book pages, including Quartz's responsive document flow. CanvasPage is the host-controlled
exception: its fullscreen `canvas` frame exposes only a togglable left slot and canvas controls, so
there is no ordinary right Graph slot unless the site overrides CanvasPage to use the default frame.
Its custom `.canvas-sidebar` wrapper also sits outside the default-frame Explorer selector, so that
drawer may show both navigation components when stock Explorer is configured.

Cross-book links remain ordinary Quartz links. Graph and Backlinks can show those relationships; the
sidebar scopes browsing, not the content graph.

Graph is a separate plugin. Keep its ordinary right-layout entry enabled when the site should show
it:

```yaml
- source: github:quartz-community/graph
  enabled: true
  layout:
    position: right
    priority: 10
```

Likewise, existing PageTitle, Search, Darkmode, ReaderMode, and toolbar entries remain in their own
left positions; `RootIndexSidebar` does not install or duplicate them.

## Rendering, themes, and accessibility

Cards and list rows are each one whole-panel link. The visible title is its explicit accessible name;
localized count and other supporting text form its description. Card hover and keyboard focus share a
subtle Make-style treatment: a low-opacity accent glow descends from the top edge and a one-pixel
accent hairline appears along the bottom, while hover adds a two-pixel lift. The effect does not
replace the border or recolor the title, and reduced-motion removes the lift and transitions.

The plugin uses Quartz theme tokens, a responsive grid, Windows forced-color support, visible
host-controlled focus outlines, and reduced-motion fallbacks. Decorative icon wrappers are
`aria-hidden`, inert, and non-interactive; their SVG is non-focusable. Numeric card badges are hidden
from assistive technology and paired with visually hidden localized count text; list counts are
localized visibly. Forced-color mode disables the decorative glow and retains explicit borders and
focus cues.

Stable scoped hooks for theme authors are `.rip`, `.rip-grid`, `.rip-card-link`, `.rip-list-link`, `.rip-panel-icon`, `.rip-count`, `.rip-tags`, `data-rip-icon`, and `data-rip-accent`. Named accents expose only the validated registry name; direct values use `data-rip-accent="direct"`. Theme behavior emits neither an accent data attribute nor an inline custom property.

Named and direct accents set a validated inline `--rip-panel-accent` custom property. A strict Content Security Policy that blocks style attributes may also block those accents; use theme behavior or adjust the site's CSP deliberately. Raw authored values never become selectors or class names.

Arrow keys move between adjacent panels when one has focus; `Home` and `End` move to the first and
last panel. Panel-keyboard and sidebar-light-dismiss listeners initialize on Quartz `nav` events and
register through `window.addCleanup`, so SPA navigation tears them down before re-entry.

The plugin ships `en-US` and `fi-FI` strings for counts, overview labels, empty state, Explorer,
manual-switcher, selected-manual, and sidebar-navigation labels, selected from `cfg.locale` on each
render. Unsupported locales fall back to English.
English uses `1 note`, `N notes`, and `No subdirectories found.`; Finnish uses `1 muistiinpano`,
`N muistiinpanoa`, and `Alikansioita ei löytynyt.`

## Visibility and disclosure boundaries

Book eligibility reads Quartz's processed top-level `unlisted` flag rather than reparsing raw
frontmatter. This respects visibility/encryption plugins that mark pages unlisted. An unlisted page
cannot create a book, provide metadata/tags/dates, enter the sidebar inventory, or increase its
count; a book can still appear if it has other listed physical content and a valid destination. Do
not place sensitive book names or descriptions in listed indexes, and keep
UnlistedPages/EncryptedPages configured for the disclosure policy you need.

## Base-path and subdirectory hosting

There is no GitLab-specific routing branch. Root panels and root-manual/book/sidebar destinations use
Quartz's public `resolveRelative`/slug utilities from the current page. A deployment at a domain root and one below
`/quartz-for-gitlab/` therefore use the same plugin code, with Quartz's normal site configuration
controlling the base URL. Tests cover root, nested, dotted, spaced, Unicode, SPA, and no-SPA links
under a non-root base path.

## Reference compatibility fixture

The companion Quartz development template keeps three durable first-level books as an observable
interoperability lab:

| Book              | `panel.icon` | Direct accent | Expected physical/listed descendants |
| ----------------- | ------------ | ------------- | -----------------------------------: |
| JavaScript Basics | `code-2`     | `#2563eb`     |                                    8 |
| Git Practice      | `git-branch` | `#c2410c`     |                                    5 |
| SQL Pocketbook    | `database`   | `#0f766e`     |                                    6 |

Their physical index frontmatter is a copyable direct-accent pattern:

```yaml
# content/javascript-basics/index.md
---
title: JavaScript Basics
description: JavaScript notes and Markdown compatibility specimens.
panel:
  icon: code-2
  accent: "#2563eb"
---
# content/git-practice/index.md
---
title: Git Practice
description: Git workflows and cross-book navigation specimens.
panel:
  icon: git-branch
  accent: "#c2410c"
---
# content/sql-pocketbook/index.md
---
title: SQL Pocketbook
description: SQL notes, assets, Bases, and the manual checklist.
panel:
  icon: database
  accent: "#0f766e"
---
```

The icon names above are built-ins. Custom component aliases remain TypeScript-only and frontmatter
never contains SVG/component code.

Each count excludes the book's own index, drafts, unlisted entries, assets, and virtual Page Type
records. The listed encrypted Git specimen counts; its hidden encrypted control does not. Canvas and
Bases routes remain linked interoperability targets, but their synthetic records do not inflate the
physical/listed book totals. The fixture exercises Markdown, Search, TOC, Graph, Backlinks, aliases,
encryption, transclusion, math, diagrams, assets, spaces, Unicode, Canvas, Bases, responsive layout,
and cross-book links.

## Partial-watch limitation

Full Quartz builds are authoritative. Quartz's partial Page Type emitter does not expose a
dependency-invalidation hook from nested pages back to the regular root page, and sidebar inventory
is cached by the host `allFiles` identity. During `npx quartz build --serve`, adding, changing, or
deleting a nested note can therefore leave root panels/overview or route-scoped sidebar aggregates
stale. Stop the watcher and run a clean/full build before deployment. This plugin does not patch
Quartz core or claim live aggregate correctness.

## Local development

Install dependencies and run the package gates from this repository:

```bash
npm ci
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm pack --dry-run
```

When this checkout is nested inside Quartz (or `RIP_QUARTZ_ROOT` points to a Quartz checkout), run
the isolated stock-host matrix too:

```bash
npm run test:integration
```

The matrix performs fresh remove/add/enable installation and checks generated layout, overview-first
body order, authored root selector title, selected-manual/current-page semantics, disjoint root and
book Explorer scopes, top-level folder state, Graph/TOC coexistence, Explorer replacement, locale
fallback, SPA/no-SPA output, and dotted/deep links below a non-root base path. Focused unit tests also
freeze sidebar light-dismiss cleanup and the card glow's reduced-motion/forced-color fallbacks.

Set `RIP_KEEP_INTEGRATION=1` only when you want its temporary workspaces preserved for manual inspection; the default run validates and removes them.

The known watcher boundary has a separate, opt-in stock-host diagnostic:

```bash
npm run test:watch-integration
```

It records nested add/change/delete outcomes as either fresh or `EXPECTED LIMITATION`, then requires
a clean build to correct the final aggregate. The current host has reproduced stale add/change
observations, while some delete paths refresh correctly. The diagnostic will also pass if a future
compatible Quartz host invalidates every aggregate. It is intentionally separate from CI and
deployment gates.

To test an unpublished checkout in a parent Quartz repository, use the CLI's local source workflow rather than overlaying a remotely pinned cache:

```bash
npx quartz plugin remove root-index-panels
npx quartz plugin add ./root-index-panels
npx quartz plugin enable root-index-panels
```

Confirm that `quartz.lock.json` records `commit: "local"`. After the desired revision has been pushed, switch back with another remove/add using `github:VingGit/root-index-panels`; do not treat a local cache as a verified remote install.

```bash
npx quartz plugin remove root-index-panels
npx quartz plugin add github:VingGit/root-index-panels
npx quartz plugin enable root-index-panels
```

Once an installation already has the sidebar layout declaration, fetch the latest revision from its
tracked remote/ref with:

```bash
npx quartz plugin install --latest root-index-panels
```

## License

MIT. Bundled dependency notices are in `THIRD_PARTY_NOTICES.md`.
