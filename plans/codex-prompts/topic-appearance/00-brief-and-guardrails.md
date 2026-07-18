# Prompt 00 — Product brief, book model, and non-negotiable guardrails

## Goal

Make `@quartz-community/root-index-panels` a dependable Quartz 5 landing-page Page Type for a multi-book knowledge base: each eligible first-level `content/` directory is represented by one panel, and its authored `index.md` may opt into a panel icon and accent.

The implementation has two ordered parts:

1. Correct the existing book inventory, canonical links, metadata selection, counting, and locale behavior.
2. Add the optional Figma-inspired appearance metadata without turning the plugin into a theme.

## Book model

Implement this model exactly unless the user approves a contract change:

- `content/index.md` is required. This Page Type matches an existing root `index` page; it does not generate one.
- A book candidate is a first path segment represented by at least one physical, listed content page below it. Physical means `fileData.filePath` is present; listed means top-level `fileData.unlisted !== true`, matching Quartz's transformed visibility convention. Respect UnlistedPages/EncryptedPages output rather than reparsing `frontmatter.unlisted` independently.
- Root-level notes, virtual Page Type output, the reserved `tags` namespace, and `excludeDirs` entries do not create books. `index` is not a reserved first-level folder name.
- Current Markdown-derived physical entries are eligible. Canvas/Bases Page Types currently expose synthetic entries without `filePath`, so they do not create books or affect counts. Empty filesystem folders are not content and cannot create books.
- Prefer the physical, listed `<book>/index` entry as the sole metadata source. Never use a same-named root note such as `java.md`. Preserve an authored `title` exactly; humanize only the slug fallback.
- Render a book candidate only when it has an explicit physical/listed `<book>/index.md` or a FolderPage-generated `<book>/index` destination. Omit it without a broken link when neither exists. Documentation must state that one destination mode is required. Virtual FolderPage output may prove a destination exists, but it must not create a candidate or contribute metadata/counts.
- Count listed physical pages below the book except the book's own landing index. Authored nested indexes count; virtual indexes do not.
- Preserve `sort: date` as the newest available date across the book's listed physical entries, not only the book index date.
- Use Quartz path utilities to target `<book>/index`, producing a canonical directory URL such as `./java/` under root and under GitLab Pages subpaths.
- Aggregate the eligible files in one pass rather than repeatedly scanning `allFiles` for every book.

## Authored appearance

Use a namespaced frontmatter object on the physical book index:

```yaml
---
title: Linux
panel:
  icon: book-open
  accent: ocean
---
```

`icon` is a safe registry name. `accent` is `theme`, a configured reusable name, or one of the exact direct color forms frozen in Prompt 01. Never infer appearance from a folder name, title, or tag, and never accept raw SVG, HTML, CSS declarations, or remote asset URLs from content.

## Figma boundary

Use the Figma prototype for these panel-level cues:

- a compact decorative icon tile when an icon is configured;
- a restrained authored accent on decorative icon/border/title/hover details;
- one whole-card link, concise description/tags/count metadata, subtle motion, and a responsive auto-fitting grid;
- clear hierarchy in both light and dark Quartz themes.

Preserve the existing cards/list option and Quartz theme tokens. Figma's Search/Explorer/manual switcher, Graph/TOC/Backlinks, header/footer, and page frame are host Quartz responsibilities. Its fixed “Knowledge Base” prose, aggregate statistics, browse button, filtering, and page transitions are not part of this increment. The captured mobile prototype overflows its desktop chrome, so it is not a mobile specification; the implemented component must instead satisfy Quartz-responsive behavior.

The Page Type continues to replace only the root page body with panels, uses layout key `content`, and intentionally does not render or hard-code the root Markdown HAST. Do not also add `RootIndexPanels` manually to a layout slot, which would duplicate the panels.

## Guardrails

- Default options remain visually theme-neutral: no icon markup, inline accent, or appearance data attributes until frontmatter or site configuration opts in.
- Keep cards/list layouts, descriptions, counts, tags, excludes, sorting, root-only ownership, SPA-safe keyboard navigation, and Quartz 5 compatibility, except where Prompt 01 explicitly corrects faulty legacy behavior.
- The plugin owns its small locale catalog, selects it from `cfg.locale` during rendering, and falls back to `en-US`. Do not import Quartz core i18n internals.
- Keep one interactive link per panel. Decorative icons must be hidden from assistive technology and custom icon components must not render interactive/focusable descendants.
- An authored accent is never the sole focus or state indicator. Critical focus/high-contrast behavior remains controlled by host theme/system colors.
- Scope all CSS under the existing `rip-*` namespace. Do not introduce a global palette, font, theme switcher, surface system, or selectors made from authored folder names/values.
- Use static build-time icon imports only. No runtime fetch, dynamic import by authored name, or copied Figma application code.
- Preserve `.prettierrc` conventions and use the repository's actual formatter workflow.
- Rebuild and commit `dist/` after source/manifest/docs that affect the package. Do not tag or publish as part of this implementation.

## Known Quartz limitation

This regular root page depends on every nested physical page, but Quartz's partial Page Type emitter only re-emits changed regular slugs. Nested add/change/delete events can therefore leave the watched `public/index.html` stale. The standalone plugin API has no dependency-invalidation hook.

For this increment, a clean/full Quartz build is the authoritative result. Reproduce and document the watch limitation; do not attempt virtual root ownership or a Quartz core patch without a separately reviewed design.

## Deliverable

Implement Prompts 01–05, update source/tests/package/docs/DOX and committed `dist/`, perform plugin and host integration verification, and report exact results plus the watch limitation.
