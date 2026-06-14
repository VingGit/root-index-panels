# root-index-panels

A [Quartz 5](https://quartz.jzhao.xyz) plugin that replaces the root index page with a responsive card grid or list of first-level vault directories.

Each panel links to a subdirectory and shows the title, description, note count, and tags sourced from that directory's `index.md` frontmatter.

## Installation

Install from GitHub with the Quartz plugin CLI:

```bash
npx quartz plugin add github:VingGit/root-index-panels
```

Or add it directly to `quartz.config.yaml`:

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
    order: 50
```

The plugin exports a high-priority Quartz page type that matches only the root `index.md` slug, so no manual layout import is required. It also exports the `RootIndexPanels` component from `@quartz-community/root-index-panels/components` for advanced manual layouts.

## Directory Metadata

In each first-level directory, create an `index.md` with frontmatter:

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

| Option                | Type                                     | Default          | Description                                    |
| --------------------- | ---------------------------------------- | ---------------- | ---------------------------------------------- |
| `layout`              | `"cards" \| "list"`                      | `"cards"`        | Visual presentation of the directory listing   |
| `showDescription`     | `boolean`                                | `true`           | Show the description from frontmatter          |
| `showDocCount`        | `boolean`                                | `true`           | Show note count badge                          |
| `showTags`            | `boolean`                                | `true`           | Show tags (cards layout only)                  |
| `tagCount`            | `number`                                 | `3`              | Maximum tags displayed per card                |
| `sort`                | `"alphabetical" \| "docCount" \| "date"` | `"alphabetical"` | Sort order for the directory grid              |
| `excludeDirs`         | `string[]`                               | `[]`             | First-path-segment names to hide from the grid |
| `descriptionFallback` | `string`                                 | `""`             | Text shown when a directory has no description |

---

## How it works

`RootIndexPanelsPage` is a Quartz page-type plugin. It has priority `100`, matches only slug `"index"`, and uses `RootIndexPanels` as the page body. At build time, Quartz passes the full `allFiles` array to the component. The component:

1. Collects unique first-level directory segments from `allFiles` (for example, `"java"`, `"linux"`, `"docker"`). Root-level notes are ignored.
2. Finds each segment's `index.md` (slug `<seg>/index`) to read frontmatter: `title`, `description`, `tags`.
3. Counts the notes under each segment (all files matching `<seg>/*`, excluding the index).
4. Sorts by title, note count, or newest known date from Quartz file data/frontmatter.
5. Renders a `<ul class="rip-grid">` card list or `<ul class="rip-list">` list.

All styles use Quartz's CSS custom properties (`--light`, `--lightgray`, `--secondary`, `--dark`, etc.) and automatically respect the active color theme and dark-mode toggle.

## Keyboard navigation

| Key       | Action              |
| --------- | ------------------- |
| `→` / `↓` | Focus next card     |
| `←` / `↑` | Focus previous card |
| `Home`    | Focus first card    |
| `End`     | Focus last card     |

All event listeners are registered with `window.addCleanup` so Quartz's SPA router removes them cleanly before each navigation.

## Development

```bash
npm install
npm run check     # typecheck + lint + format + test
npm run build     # emit dist/
```

## License

MIT
