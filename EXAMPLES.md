# Usage Examples

Copyable patterns for writers, YAML-only site owners, and TypeScript site owners.

## Minimal content model

The root page must exist:

```text
content/
├── index.md
├── java/
│   ├── index.md
│   └── collections.md
└── git/
    └── branching.md
```

The aggregate overview is the first element in the Page Type body. Authored root Markdown stays
visible immediately after it and before the book collection:

```markdown
---
title: Knowledge Base
description: Technical books and working notes.
---

# Knowledge Base

Choose a book below, or use the left navigation to browse root notes and the current book.

## About these notes

This transformed heading can also appear in the normal root Table of Contents.
```

`java` has an explicit destination. `git` renders only when FolderPage is enabled and generates `git/index`; otherwise add `content/git/index.md`. The emitted links are `./java/` and `./git/`, not file-style links.

## Book metadata and appearance

Put all panel metadata on the physical book index:

```yaml
---
title: eBPF
description: Kernel tracing, networking, and observability.
tags:
  - linux
  - tracing
  - networking
panel:
  icon: terminal
  accent: ocean
---
```

The authored `eBPF` casing is preserved. `panel.icon` and `panel.accent` are optional; without them and without configured defaults, the panel has no icon or inline accent. There is no directory-name, title, or tag inference.

A direct accent may be used instead of a named one:

```yaml
panel:
  icon: cpu
  accent: "#7c3aed"
```

Allowed direct forms are `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, and exact `var(--custom-property)`. Values such as `red`, `rgb(...)`, gradients, URLs, `var(--x, red)`, and CSS declarations are rejected and follow the default fallback.

Use `theme` to opt one book out of a site-wide default accent:

```yaml
panel:
  accent: theme
```

In card layout, the resolved accent colors a subtle top radial glow and one-pixel bottom hairline on
hover and keyboard focus. Hover also lifts the card by two pixels. The border and title color remain
stable; reduced-motion removes the lift/transitions and forced-color mode removes the decorative
glow while keeping explicit focus cues.

## Complete YAML-safe configuration

```yaml
plugins:
  - source: github:VingGit/root-index-panels
    enabled: true
    options:
      layout: cards
      sort: alphabetical
      showDescription: true
      showDocCount: true
      showTags: true
      tagCount: 3
      excludeDirs:
        - archive
        - private-drafts
      descriptionFallback: "Notes and reference material."
      defaultIcon: book-open
      defaultAccent: theme
      accents:
        ocean: "var(--secondary)"
        forest: "var(--tertiary)"
        warning: "#b45309"
      replaceExplorer: true
    layout:
      position: left
      priority: 40
    order: 50
```

Use `npx quartz plugin add` to create the shown `layout` stanza. The manifest declares exactly one
layout component, `RootIndexSidebar`, so a fresh add places it at left priority `40`.
`RootIndexPanelsPage` supplies its body separately; never place `RootIndexPanels` in a layout slot.

The YAML-safe options and defaults are:

- `layout: cards`; valid values are `cards` and `list`.
- `sort: alphabetical`; valid values are `alphabetical`, `docCount`, and `date`.
- `showDescription`, `showDocCount`, and `showTags`: `true`. Tags appear only in cards.
- `tagCount: 3`; finite values are floored and clamped to at least zero.
- `excludeDirs: []`; values are trimmed, deduplicated, and matched case-sensitively.
- `descriptionFallback: ""`; intentional whitespace is retained.
- `defaultIcon: ""`; no built-in is selected implicitly.
- `defaultAccent: theme` and `accents: {}`.
- `replaceExplorer: true`; set it to `false` to retain stock Explorer beside the book navigation.

`accents` works in YAML even though the current schema-driven TUI cannot represent arbitrary maps. Function-valued `icons` cannot be expressed in YAML.

The built-in icon names backed by bundled `lucide-preact@1.25.0` are:

```text
book-open  coffee  terminal  container  layers  code-2  network
git-branch  database  shield  cpu  globe  file-code-2
```

All registry names must be lower-case kebab identifiers. Named accents should normally point to CSS variables so light and dark themes control contrast.

## Route-scoped navigation

The generated left component uses native disclosures and ordinary links. Its boxed selector shows
the authored title from `content/index.md` (here, `Knowledge Base`) or the localized Home fallback,
and opens an absolute manual menu without moving the Explorer tree:

- on `/`, `/loose-note`, `/tags/...`, `/404`, and unrecognized namespaces, its document list contains
  listed physical root notes plus safe generated root Canvas/Base leaves;
- on `/java/` and descendants such as `/java/collections`, it contains only the Java hierarchy; and
- the switcher always offers the root manual plus every eligible book using the same safe title,
  icon, accent, exclusion, and destination rules as the root collection.

Books, cards, ordering inputs, and counts remain listed-physical only. Within those scopes, a
generated route becomes a navigation leaf only when it is not unlisted, owns exactly one matching
`canvasData`/`basesData` marker, and has a canonical lower-case `.canvas`/`.base` suffix. Canvas uses
a workflow glyph and Base uses a table-properties glyph rather than the ordinary file-text glyph.
These leaves may require structural folder containers for a nested path, but they never create a
book, change its count/order, or provide a folder Overview destination/title.

All destinations are resolved relative to the current Quartz slug. A visible check and
`data-rip-selected="true"` mark the manual whose tree is being browsed, while
`aria-current="page"` marks only the exact current destination. Book scope starts with `Overview`;
top-level folders are open in server output, while deeper folders open only for their current path.

The complete selector and tree work without JavaScript. A progressive enhancement closes the menu
after a link, an outside pointer press, or Escape; Escape restores focus to its summary and Quartz
SPA cleanup removes the listeners. At narrow widths, the navigation shell itself becomes a native
disclosure.

The responsive stylesheet has two structural containment responsibilities. A
default-frame `#quartz-body` rule, gated by a direct `.left.sidebar > .rip-sidebar` descendant,
replaces intrinsic `auto` tracks with `minmax(0, ...)` tracks at tablet/mobile breakpoints. The
separate `.left.sidebar:has(> .rip-sidebar)` mobile rule constrains width and wrapping so the plugin
and the other left-slot components fit the viewport. Neither rule hides a sibling, selects the
right rail, Graph, or TOC, or matches Canvas/custom frames.

By default, frame-specific variants replace only the stock Explorer navigation role:

```text
.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer

.page[data-frame="canvas"]
  > #quartz-body
  > .center.canvas-frame
  > .canvas-sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"])
  > .explorer
```

They depend on the current Quartz default-frame/CanvasFrame/Explorer class structure and browser
`:has()` support. `replaceExplorer: false` removes the opt-in attribute and leaves Explorer visible
in either frame. These variants form one host-selector kind and are the only whole-component
suppression; they never target Search, PageTitle, Graph, Table of Contents, Backlinks, or other
components.

```yaml
options:
  replaceExplorer: false
```

The right layout slot remains host-owned. A configured right Graph appears on the root and ordinary
book notes and can show cross-book edges. CanvasPage is different by design: its fullscreen `canvas`
frame has a togglable left slot but no normal right slot. Override CanvasPage to the `default` frame
if that route also needs the ordinary right Graph. Its custom `.canvas-sidebar` wrapper uses the
separate frame-gated replacement variant, so the default option removes the duplicate Explorer tree;
the drawer contains both only when `replaceExplorer: false`.

When stock Breadcrumbs renders on a default-frame eligible-book route, only its redundant leading
`Home` crumb is hidden. Quartz's existing book-title link to the book root becomes the first visible
crumb. Root-context breadcrumbs remain unchanged, while PageTitle and the manual selector continue
to provide true-root access. This book-root promotion is CSS-only.

The responsive grid rule, mobile-left rule, frame-specific Explorer variants, and book-breadcrumb
promotion are exactly four narrowly scoped host-selector kinds. None selects the right rail, Graph,
TOC, or Backlinks.

These relevant entries coexist normally; no body placement is present:

```yaml
plugins:
  - source: github:quartz-community/search
    enabled: true
    layout:
      position: left
      priority: 20
      group: toolbar
  - source: github:VingGit/root-index-panels
    enabled: true
    options:
      replaceExplorer: true
    layout:
      position: left
      priority: 40
  - source: github:quartz-community/graph
    enabled: true
    layout:
      position: right
      priority: 10
```

## TypeScript custom icon aliases

Use the Page Type override before `loadQuartzConfig()`:

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
  icons: {
    "shell-notes": ShellNotesIcon,
    // A custom alias wins if its name collides with a built-in.
    terminal: ShellNotesIcon,
  },
  accents: {
    ocean: "var(--secondary)",
  },
  defaultIcon: "shell-notes",
  defaultAccent: "ocean",
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
```

The custom component must produce decorative SVG only. The plugin makes the wrapper inert/hidden and sends `focusable="false"`, but the component must not introduce controls, links, or focusable descendants.

Option precedence is `package defaults < quartz.config.yaml < quartz.ts`. Map values are shallow: the `icons` and `accents` objects above replace the corresponding complete YAML maps. Repeat every alias that must remain available.

Calling `ExternalPlugin.RootIndexPanelsPage(...)` records the Page Type override. Calling the separately exported `RootIndexPanels(...)` component constructor does not. Only use the component manually after disabling the Page Type, or it can render twice.

## Sorting and counts

```yaml
options:
  sort: docCount
  showDocCount: true
```

Counts include each listed physical descendant once, excluding only the book's own `<book>/index`. An authored nested `chapter/index.md` counts; a FolderPage-generated nested index does not. An unlisted or encrypted-as-unlisted page supplies no count, metadata, tags, or date.

```yaml
options:
  sort: date
```

Date sorting uses the newest accepted date across the book's eligible physical index and descendants, not just the book index. A newer nested note can therefore move the book ahead of one with a newer index but older content.

## Generated and explicit destinations

With FolderPage enabled, this is enough to create a `networking` panel and destination:

```text
content/networking/tcp.md
```

The generated `networking/index` proves the route exists, while the physical `tcp.md` creates the candidate. Because there is no physical `networking/index.md`, the title is humanized from `networking` and no index description, tags, or `panel` metadata exists.

With FolderPage disabled, add:

```yaml
# content/networking/index.md
---
title: Networking
description: Protocol and operations notes.
---
```

A physical descendant without either destination is omitted instead of receiving a broken panel link.

## Base-path and subdirectory hosting

Configure Quartz normally for a site served beneath a path. A GitLab project site is one example:

```yaml
configuration:
  baseUrl: group.gitlab.io/project
```

Root Index Panels contains no GitLab-specific path branch and does not prepend or hard-code this
value. It resolves root panels and every root-manual/book/note/folder sidebar link through Quartz's
public path utilities. A directory such as `content/git.md/` therefore emits `href="./git.md/"` from
the root and reaches `git.md/index.html` below `/project/`; deep, spaced, dotted, and Unicode routes
use the same relative-resolution contract on other hosting providers.

## Visibility and disclosure

The plugin trusts Quartz's processed top-level `unlisted` marker from UnlistedPages/EncryptedPages behavior. For example, if every physical entry in `content/secret/` is marked unlisted, `secret` cannot become a panel. If one listed physical entry remains and a destination exists, the book can still appear, though unlisted entries do not affect its metadata, tags, date, or count.

Treat listed book-index titles and descriptions as public navigation data. Encryption of individual pages is not a substitute for hiding a listed index.

## Three-book compatibility lab

The companion Quartz template keeps this writer-facing regression set under `content/`:

```text
content/
├── javascript-basics/   # code-2, #2563eb, 8 counted descendants
├── git-practice/        # git-branch, #c2410c, 5 counted descendants
└── sql-pocketbook/      # database, #0f766e, 6 counted descendants
```

Each physical book index demonstrates a writer-selected built-in icon and direct accent:

```yaml
# content/javascript-basics/index.md
---
title: JavaScript Basics
description: JavaScript notes and Markdown compatibility specimens.
panel:
  icon: code-2
  accent: "#2563eb"
---
```

```yaml
# content/git-practice/index.md
---
title: Git Practice
description: Git workflows and cross-book navigation specimens.
panel:
  icon: git-branch
  accent: "#c2410c"
---
```

```yaml
# content/sql-pocketbook/index.md
---
title: SQL Pocketbook
description: SQL notes, assets, Bases, and the manual checklist.
panel:
  icon: database
  accent: "#0f766e"
---
```

These icon values come from the bundled registry. A TypeScript-only custom component alias instead
uses the earlier `icons` registration pattern; frontmatter never contains SVG or component code.

The counts are deliberately physical/listed counts. They exclude each book index, draft and
unlisted controls, the local SVG asset, and synthetic `.canvas`/`.base` Page Type records. Safe
Canvas/Base records still appear as distinctly iconed leaves in the scoped navigation. The Git
book's listed encrypted fixture contributes to `5`; its hidden encrypted control does not. Cross-book
links are intentional so the normal Graph and Backlinks can expose relationships even though the
left navigation displays only one book hierarchy at a time.

The SQL book's manual checklist covers Search, TOC, transclusions, math, Mermaid, aliases,
encryption, local assets, paths with spaces and Unicode, Canvas, Bases, light/dark/forced-color
rendering, keyboard use, SPA navigation, responsive layout, and stable `FIXTURE-*` sentinels.

## Local checkout integration

From the parent Quartz repository:

```bash
npx quartz plugin remove root-index-panels
npx quartz plugin add ./root-index-panels
npx quartz plugin enable root-index-panels
```

Verify `quartz.lock.json` has `commit: "local"` and the generated plugin entry has exactly one
`layout: { position: left, priority: 40 }` declaration. Local source changes are then available
without replacing a remotely pinned cache by hand. After pushing a revision, remove/add/enable
`github:VingGit/root-index-panels` to verify the remote prebuilt package.

`npm run test:integration` automates isolated fresh install and output checks for overview-first body
order, authored root selector title, selected-manual/current-page state, root/book Explorer isolation,
top-folder opening, Graph/TOC coexistence, locale fallback, SPA/no-SPA assets, and non-root base paths.
Use a real browser as well when changing popup geometry or card interactions so desktop, tablet, and
mobile overlay/reflow, focus restoration, glow, right-rail flow, and horizontal overflow remain
observable.

Full builds are authoritative. During `npx quartz build --serve`, nested add/change/delete events can
leave the root panels/overview or sidebar aggregate stale because Quartz does not invalidate the
regular root Page Type for nested dependencies and does not guarantee a new `allFiles` identity for
every partial render. Stop the watcher and run a clean/full build before deployment.
