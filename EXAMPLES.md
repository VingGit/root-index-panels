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

Keep `content/index.md` metadata-only when its prose should not be consumed by Search, RSS, sitemap, or Open Graph emitters:

```yaml
---
title: Knowledge Base
description: Technical books and working notes.
---
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
    order: 50
```

Do not add a `layout` stanza for the plugin. `RootIndexPanelsPage` already supplies the root body, and the manifest intentionally has no automatic component position.

The YAML-safe options and defaults are:

- `layout: cards`; valid values are `cards` and `list`.
- `sort: alphabetical`; valid values are `alphabetical`, `docCount`, and `date`.
- `showDescription`, `showDocCount`, and `showTags`: `true`. Tags appear only in cards.
- `tagCount: 3`; finite values are floored and clamped to at least zero.
- `excludeDirs: []`; values are trimmed, deduplicated, and matched case-sensitively.
- `descriptionFallback: ""`; intentional whitespace is retained.
- `defaultIcon: ""`; no built-in is selected implicitly.
- `defaultAccent: theme` and `accents: {}`.

`accents` works in YAML even though the current schema-driven TUI cannot represent arbitrary maps. Function-valued `icons` cannot be expressed in YAML.

The built-in icon names backed by bundled `lucide-preact@1.25.0` are:

```text
book-open  coffee  terminal  container  layers  code-2  network
git-branch  database  shield  cpu  globe  file-code-2
```

All registry names must be lower-case kebab identifiers. Named accents should normally point to CSS variables so light and dark themes control contrast.

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

## GitLab Pages subpath

Configure the normal Quartz base URL for a project site:

```yaml
configuration:
  baseUrl: group.gitlab.io/project
```

Root Index Panels does not prepend or hard-code this value. It resolves relative `<book>/index` routes, so a directory such as `content/git.md/` emits `href="./git.md/"` and reaches `git.md/index.html` correctly below the project subpath.

## Visibility and disclosure

The plugin trusts Quartz's processed top-level `unlisted` marker from UnlistedPages/EncryptedPages behavior. For example, if every physical entry in `content/secret/` is marked unlisted, `secret` cannot become a panel. If one listed physical entry remains and a destination exists, the book can still appear, though unlisted entries do not affect its metadata, tags, date, or count.

Treat listed book-index titles and descriptions as public navigation data. Encryption of individual pages is not a substitute for hiding a listed index.

## Local checkout integration

From the parent Quartz repository:

```bash
npx quartz plugin remove root-index-panels
npx quartz plugin add ./root-index-panels
```

Verify `quartz.lock.json` has `commit: "local"`. Local source changes are then available without replacing a remotely pinned cache by hand. After pushing a revision, remove/add `github:VingGit/root-index-panels` to verify the remote prebuilt package.

Full builds are authoritative. During `npx quartz build --serve`, nested add/change/delete events can leave the root aggregate stale because Quartz does not invalidate the regular root Page Type for its nested dependencies. Stop the watcher and run a clean/full build before deployment.
