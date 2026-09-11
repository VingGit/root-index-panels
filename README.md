# root-index-panels

A Quartz 5 plugin for organizing a knowledge base as a collection of books. Eligible first-level
content directories appear on the root page as cards or list items. A route-aware left sidebar lets
readers return to the current book landing page, switch books, and browse that book's hierarchy.

## Requirements

Your Quartz site must:

- contain `content/index.md`; and
- have `github:quartz-community/folder-page` installed and enabled.

FolderPage is a required Quartz-plugin prerequisite. Quartz ContentPage intentionally excludes every
slug ending in `/index`; FolderPage is the Page Type that emits book and nested-folder landing pages.
A physical `content/<book>/index.md` supplies authored content and book metadata, but it still needs
FolderPage to become a published landing page. When no physical index exists, FolderPage may generate
the logical `<book>/index` route from the folder's listed contents.

A first-level directory becomes a book when it contains at least one listed Markdown page and has a
FolderPage-backed landing route. Nested folders use the same emitter. Their `index` notes remain hidden
from the visible navigation tree while the folder row opens the emitted landing page.

```text
content/
├── index.md
├── java/
│   ├── index.md
│   ├── collections.md
│   └── language/
│       ├── index.md
│       └── generics.md
└── git/
    ├── index.md
    └── branching.md
```

Root-level notes, empty directories, `tags`, excluded directories, and unlisted pages do not create
books. A book's count includes its listed Markdown descendants but not its own `index.md`.

## Installation

```bash
npx quartz plugin add github:quartz-community/folder-page
npx quartz plugin enable folder-page
npx quartz plugin add github:VingGit/root-index-panels
npx quartz plugin enable root-index-panels
```

The root-index-panels manifest declares FolderPage as a dependency. Quartz stops configuration loading
and prints the required `plugin add` command when FolderPage is absent. Quartz currently emits only a
warning when a configured dependency is disabled, so keep the FolderPage entry explicitly enabled.

The installer adds one component, `RootIndexSidebar`, to the left layout at priority `40`. The root
page body is supplied separately by the plugin's Page Type; do not add `RootIndexPanels` to a layout
slot.

To update an existing installation to the latest revision:

```bash
npx quartz plugin install --latest root-index-panels
```

To disable, re-enable, or remove it:

```bash
npx quartz plugin disable root-index-panels
npx quartz plugin enable root-index-panels
npx quartz plugin remove root-index-panels
```

## Configuration

Edit the generated entry in `quartz.config.yaml`:

```yaml
plugins:
  - source: github:quartz-community/folder-page
    enabled: true

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
      descriptionFallback: ""
      defaultIcon: book-open
      defaultAccent: theme
      accents:
        ocean: "var(--secondary)"
        warning: "#b45309"
      replaceExplorer: true
    layout:
      position: left
      priority: 40
```

| Option                | Default        | Purpose                                                                |
| --------------------- | -------------- | ---------------------------------------------------------------------- |
| `layout`              | `cards`        | Use `cards` or `list`.                                                 |
| `sort`                | `alphabetical` | Initial complete-library order: `alphabetical`, `docCount`, or `date`. |
| `showDescription`     | `true`         | Show the book-index description.                                       |
| `showDocCount`        | `true`         | Show the number of listed Markdown descendants.                        |
| `showTags`            | `true`         | Show book-index tags in card layout.                                   |
| `tagCount`            | `3`            | Maximum number of displayed tags.                                      |
| `excludeDirs`         | `[]`           | First-level directories to omit; matching is case-sensitive.           |
| `descriptionFallback` | `""`           | Text used when a book index has no description.                        |
| `defaultIcon`         | `book-open`    | Built-in, direct Lucide, or TypeScript-registered fallback icon.       |
| `defaultAccent`       | `theme`        | `theme`, a named accent, or an allowed direct color.                   |
| `accents`             | `{}`           | Named accent values available to book frontmatter.                     |
| `replaceExplorer`     | `true`         | Replace stock Explorer beside this sidebar. Set `false` to show both.  |

The reader can reorder the complete library by newest edit, oldest edit, ascending title, or
descending title. This does not change the separate latest-three preview.

Books without authored icon metadata use a theme-colored open-book mark in the root library and
book switcher. Set `defaultIcon` to another built-in, a direct `lucide:<name>` icon, or a TypeScript-registered alias to override it.

`accents` works in YAML, although Quartz's current schema-driven editor cannot represent arbitrary
maps. Later configuration surfaces replace the entire `accents` or `icons` map rather than merging
individual entries.

## Book metadata

Put title, description, tags, icon, and accent on the physical book index:

```yaml
---
title: Linux
description: Kernel, networking, and command-line notes.
tags:
  - kernel
  - networking
panel:
  icon: terminal
  accent: ocean
---
```

The plugin preserves an authored title exactly. If no title exists, it derives one from the
directory name.

Built-in icons:

<!-- built-in-icons:start -->

```text
book-open  code-2  coffee  container  cpu  database  file-code-2  git-branch  globe
layers  network  shield  terminal
```

<!-- built-in-icons:end -->

### Use any Lucide icon without changing the plugin

Browse the [Lucide icon gallery](https://lucide.dev/icons/). The kebab-case name at the end of an
icon page URL is the name to use. For example, `https://lucide.dev/icons/book-copy` corresponds to
`book-copy`.

Prefix that name with `lucide:` in book frontmatter:

```yaml
panel:
  icon: "lucide:book-copy"
```

No pull request or plugin registry change is required. Direct Lucide icons are loaded as decorative,
color-inheriting SVG masks from jsDelivr using the same exact Lucide version pinned by this plugin.
They therefore require the reader's browser and Content Security Policy to allow image requests to
`cdn.jsdelivr.net`. Built-in icons and TypeScript custom icons remain self-contained and make no
external icon request. An icon introduced after the plugin's pinned Lucide version will not render
until the plugin updates Lucide.

You can also use the direct form as the plugin fallback:

```yaml
options:
  defaultIcon: "lucide:library-big"
```

### Adding another built-in icon

Built-ins are still useful when an icon should work offline, under a restrictive CSP, or as a
curated default. The bundled icons come from [Lucide](https://lucide.dev/icons/) through the exact
`lucide-preact` version in `package.json`.

From a repository checkout with dependencies installed, adding the normal case is one command:

```bash
npm run icon:add -- book-copy
```

The command infers `BookCopy`, verifies that export exists in the installed pinned
`lucide-preact`, updates the single source of truth in `src/built-in-icons.json`, regenerates the
static imports and this README list, formats them, then runs `check`, `build`, `verify:dist`, and
`verify:package`. The generated TypeScript registry and exhaustive generated-registry test no
longer require manual editing.

When the frontmatter alias and Lucide export do not map mechanically, pass the export explicitly:

```bash
npm run icon:add -- code-2 CodeXml
```

The icon can then be used without the `lucide:` prefix because it is a bundled built-in:

```yaml
panel:
  icon: book-copy
```

An accent can be:

- `theme`, which uses normal Quartz theme behavior;
- a name from the configured `accents` map;
- `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`; or
- an exact CSS custom property such as `var(--secondary)`.

Other CSS expressions, URLs, gradients, declarations, and `var()` fallbacks are rejected.

## TypeScript custom icons

Custom SVG icon components can be registered in `quartz.ts` before loading the Quartz config:

```ts
import { createElement } from "preact"
import type { PanelIconComponent } from "./.quartz/plugins/root-index-panels"
import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const ShellIcon: PanelIconComponent = (props) =>
  createElement(
    "svg",
    { ...props, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
    createElement("path", { d: "m5 7 4 5-4 5m6 0h8" }),
  )

ExternalPlugin.RootIndexPanelsPage({
  icons: { "shell-notes": ShellIcon },
  defaultIcon: "shell-notes",
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
```

Custom icons must contain decorative SVG only. Do not put links, controls, or focusable elements
inside them.

## Reader behavior

The root body displays, in order:

1. book count, total note count, last edit, and a primary link to the complete library;
2. the three most recently edited books, newest first;
3. authored Markdown from `content/index.md`; and
4. the complete card or list library with reader-controlled sorting.

Each book card shows its latest accepted edit date when one is available.

The sidebar separates navigation from switching:

- the compact root or book mark opens the active landing page;
- the adjacent selector changes the active book and remains directly visible at every screen width;
- Explorer has its own disclosure instead of being wrapped with the selector;
- a book's own `index.md` is not repeated as the first Explorer item;
- a folder row opens that folder's real `index` route; and
- the adjacent chevron only expands or collapses children.

At widths up to `800px`, every ordinary non-landing page starts with Explorer closed after navigation,
including pages reached through content links or Backlinks. A book or root landing page starts with it
open, and the reader can explicitly reopen it anywhere. Wider screens and Canvas navigation leave
Explorer open. Navigation never changes the page scroll position. All links and the book selector
remain available without JavaScript.

Collapsing a folder that contains the selected note does not navigate away. Its closed chevron and
surface retain a muted book-accent cue so the hidden active path remains discoverable. Selected book
notes and folders use that book's configured or derived accent. Root notes use the host site's normal
accent.

Canvas and Bases routes may appear as distinct sidebar leaves when Quartz generates valid,
non-unlisted `.canvas` and `.base` pages. They never create a book or change its Markdown-page count.

`replaceExplorer: true` hides only the stock Explorer immediately beside this plugin in Quartz's
default and Canvas frames. It does not hide Search, PageTitle, Graph, Table of Contents, Backlinks,
or other layout components. On ordinary pages, Graph remains a normal right-layout component.
CanvasPage uses its own fullscreen frame and has no ordinary right slot unless the site changes that
frame.

Book breadcrumbs begin at Quartz's existing book-root link instead of repeating Home. Root routes
retain normal Quartz breadcrumbs. The site title and compact home mark still provide true-root
access.

All plugin links use Quartz's relative path utilities, including sites hosted below a subdirectory.
Core links remain usable without JavaScript.

## FolderPage prerequisite and hosting diagnostics

FolderPage is required for every book and nested-folder landing route, including routes backed by a
physical `index.md`. The ordinary ContentPage plugin deliberately does not emit `/index` slugs. Do not
disable or remove FolderPage while root-index-panels is enabled.

A missing FolderPage configuration entry is rejected by Quartz dependency validation. A configured but
disabled FolderPage currently produces a Quartz warning rather than a hard failure and can leave the
library pointing to landing pages that were never emitted.

If every non-root URL returns 404, inspect the generated Pages artifact first. If the expected
`.html` files exist, verify that Quartz's configured public URL and base path match the deployed URL.
In particular, a custom domain served at its root should not retain a project subpath such as
`/quartz-for-gitlab` in `data-basepath`, canonical URLs, assets, or the 404-page home link. Either use
the custom-domain root consistently or deploy under the project path consistently; do not combine
the two URL models.

## Known limitation

During `npx quartz build --serve`, changes to nested notes can leave root counts, dates, or sidebar
contents stale. Run a clean/full build before deployment; full builds are authoritative.

## Development

```bash
npm ci
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm run test:integration
npm run test:watch-integration
npm pack --dry-run
```

`dist/` is committed because GitHub installations consume the prebuilt package.

## License

MIT. Bundled dependency notices are in `THIRD_PARTY_NOTICES.md`.
