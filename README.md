# root-index-panels

A [Quartz 5](https://quartz.jzhao.xyz) component plugin that replaces the **root index page** with a responsive card grid (or list) of your first-level vault directories.

Each card links to a subdirectory and shows the title, description, note count, and tags sourced from that directory's `index.md` frontmatter.

---

## Installation

```bash
npm install @quartz-community/root-index-panels
```

Or with the Quartz plugin CLI:

```bash
quartz plugin add @quartz-community/root-index-panels
```

---

## Quick start

### 1. Import the component

In `quartz.layout.ts`:

```typescript
import { RootIndexPanels } from "@quartz-community/root-index-panels/components"
```

### 2. Add it to your layout

Place `RootIndexPanels()` in the `center` array. The component only renders on the root index page (`index.md` → slug `"index"`) and returns an empty element everywhere else, so it is safe to include in the shared layout.

```typescript
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { RootIndexPanels } from "@quartz-community/root-index-panels/components"

export const defaultContentPageLayout: PageLayout = {
  center: [
    RootIndexPanels({
      layout: "cards",
      sort: "alphabetical",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 3,
    }),
    Component.Content(),
  ],
}
```

### 3. Annotate your directory index files

In each first-level directory, create an `index.md` with a `description` in the frontmatter:

```yaml
---
title: Java
description: Core Java concepts, Spring Boot, JVM internals, concurrency patterns, and build tooling.
tags:
  - spring
  - jvm
  - java
---
```

---

## Options

| Option                 | Type                                     | Default          | Description                                     |
| ---------------------- | ---------------------------------------- | ---------------- | ----------------------------------------------- |
| `layout`               | `"cards" \| "list"`                      | `"cards"`        | Visual presentation of the directory listing    |
| `showDescription`      | `boolean`                                | `true`           | Show the description from frontmatter           |
| `showDocCount`         | `boolean`                                | `true`           | Show note count badge                           |
| `showTags`             | `boolean`                                | `true`           | Show tags (cards layout only)                   |
| `tagCount`             | `number`                                 | `3`              | Maximum tags displayed per card                 |
| `sort`                 | `"alphabetical" \| "docCount" \| "date"` | `"alphabetical"` | Sort order for the directory grid               |
| `excludeDirs`          | `string[]`                               | `[]`             | First-path-segment names to hide from the grid  |
| `descriptionFallback`  | `string`                                 | `""`             | Text shown when a directory has no description  |

---

## How it works

`RootIndexPanels` is a **Quartz component** — it requires no transformer or emitter. At build time, Quartz passes the full `allFiles` array (all published pages). The component:

1. Collects unique first-level path segments from `allFiles` (e.g., `"java"`, `"linux"`, `"docker"`).
2. Finds each segment's `index.md` (slug `<seg>/index`) to read frontmatter: `title`, `description`, `tags`.
3. Counts the notes under each segment (all files matching `<seg>/*`, excluding the index).
4. Sorts and renders a `<ul class="rip-grid">` card list — one `<li class="rip-card">` per directory.

All styles use Quartz's CSS custom properties (`--light`, `--lightgray`, `--secondary`, `--dark`, etc.) and automatically respect the active colour theme and dark-mode toggle.

---

## Keyboard navigation

| Key        | Action              |
| ---------- | ------------------- |
| `→` / `↓` | Focus next card     |
| `←` / `↑` | Focus previous card |
| `Home`     | Focus first card    |
| `End`      | Focus last card     |

All event listeners are registered with `window.addCleanup` so Quartz's SPA router removes them cleanly before each navigation.

---

## Development

```bash
npm install
npm run dev       # watch mode
npm run check     # typecheck + lint + format + test
npm run build     # emit dist/
```

---

## License

MIT
