# Usage Examples

Examples for configuring and authoring content for `root-index-panels`.

## Quartz Config

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
      descriptionFallback: ""
    order: 50
```

No `layout` section is needed for normal use. The plugin registers `RootIndexPanelsPage`, a page type that owns only the root `index` slug.

## Directory Index Frontmatter

```yaml
---
title: Java
description: Core Java concepts, Spring Boot, JVM internals, concurrency patterns, and build tooling.
tags:
  - spring
  - jvm
  - java
modified: 2026-06-14
---
```

The card title, description, and tags come from each first-level directory's `index.md`. Date sorting can use Quartz `dates` data or frontmatter keys such as `modified`, `updated`, `created`, `published`, or `date`.

## Manual Component Use

Advanced users can import the component directly if they do not want the root page-type replacement:

```ts
import { RootIndexPanels } from "@quartz-community/root-index-panels/components"
```

When used manually, the component still self-hides unless `fileData.slug` is `"index"`.
