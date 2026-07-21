# Three-book compatibility fixture

The parent Quartz template keeps a durable interoperability lab under `content/`. This is persistent
test content, not disposable integration data.

## Books and expected counts

| Book              | Directory            | Icon         | Accent    | Listed physical descendants |
| ----------------- | -------------------- | ------------ | --------- | --------------------------: |
| JavaScript Basics | `javascript-basics/` | `code-2`     | `#2563eb` |                           8 |
| Git Practice      | `git-practice/`      | `git-branch` | `#c2410c` |                           5 |
| SQL Pocketbook    | `sql-pocketbook/`    | `database`   | `#0f766e` |                           6 |

Each book has a physical index with title, description, tags/aliases/dates, and its distinct safe
`panel.icon`/`panel.accent`. Counts follow the plugin's listed-physical model: exclude the book
index, drafts, unlisted controls, assets, FolderPage output, Canvas, and Bases. An authored nested
index counts. The listed encrypted Git specimen counts; its unlisted encrypted control does not.

Do not change these counts from a filesystem inventory. Reconcile them from a clean Quartz build and
update the owning content instructions plus `sql-pocketbook/manual-test-checklist.md` in the same
intentional fixture change.

## Copyable book-index pattern

```yaml
---
title: JavaScript Basics
description: JavaScript notes and Markdown compatibility specimens.
panel:
  icon: code-2
  accent: "#2563eb"
---
```

Git Practice and SQL Pocketbook use the same structure with their values from the table. These are
built-in icon names; TypeScript custom components never appear in frontmatter.

## Required feature coverage

Every specimen states its expected result and has a stable `FIXTURE-*` sentinel. The manual checklist
maps at least:

| Area              | Evidence                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| Root Page Type    | root sentinel/prose, overview, browse target, three customized books              |
| Markdown          | headings, emphasis/highlight, lists/tasks, table, callout, footnote, code, breaks |
| Math and diagrams | inline/block KaTeX and Mermaid, or an explicit configured-off note                |
| Links             | Markdown, wikilink, alias, heading/block, broken negative, cross-book             |
| Transclusion      | source/consumer sentinel and Backlinks                                            |
| Paths             | nested paths, spaces, Unicode, and dotted/punctuation segment                     |
| Metadata          | descriptions, tags, aliases, dates, properties, TOC positive/negative             |
| Visibility        | draft, unlisted, and listed/unlisted encrypted controls with fake passwords       |
| Page Types        | content, FolderPage, TagPage, distinctly iconed Canvas and Bases routes           |
| Assets            | local image/SVG with alt text and no required remote resource                     |
| Host UI           | Search, TOC, Graph, Backlinks, Breadcrumbs, PageTitle, modes, Footer              |
| Navigation        | root/book modes, Overview, typed leaves, book-first breadcrumbs, mobile shell     |
| Accessibility     | landmarks, headings, focus/order, contrast, forced colors, motion, zoom           |

Keep unique Search tokens for all three books and intentional cross-book links so Graph/Backlinks
exercise normal relationships. Safe Canvas/Base leaves may appear with distinct icons but do not
change books or counts. Negative controls contain no real secrets; encryption credentials are
fake and documented.

Durable fixture files remain after tests. Configuration variants, destructive CLI checks, and
temporary content belong in isolated workspaces and are cleaned separately.
