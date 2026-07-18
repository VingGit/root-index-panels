# Prompt 00 — Brief and non-negotiable guardrails

## Goal

Extend `@quartz-community/root-index-panels` so a first-level topic (for example `content/linux/index.md`) can choose a panel icon and accent in YAML frontmatter. A Linux writer must be able to choose a blue `book-open` panel rather than inheriting a terminal/green association.

## Product decision

Use a namespaced `panel` frontmatter object:

```yaml
---
title: Linux
panel:
  icon: book-open
  accent: ocean
---
```

`icon` is an icon name. `accent` is either:

1. `theme` (the default), which preserves the host theme's accent;
2. a configured reusable name such as `ocean`; or
3. a conservatively validated CSS colour such as `#3178c6` or `var(--tertiary)` for a one-off Markdown-only override.

Do **not** infer an icon or colour from a folder name, title, or tag.

## Guardrails

- This is a layout component plugin, not a theme. Do not add a global palette, font, surface, shadow, or theme selector.
- Existing installations must render identically until they opt in. `panel` is optional and the default accent comes from Quartz theme variables.
- Preserve root-only rendering, cards/list layouts, note counts, tags, sorting, SPA-safe keyboard navigation, and Quartz 5 API compatibility.
- Use Quartz's real i18n API and active locale for every visible string introduced or touched. Do not leave English literals as a shortcut.
- Preserve accessibility: no nested interactions, no extra focus stops, and decorative SVGs are hidden from assistive technology.
- Use scoped component CSS and CSS custom-property hooks as the integration boundary for theme packages.
- Keep `.prettierrc` formatting (`semi: false`, `printWidth: 100`, trailing commas).

## Deliverable

Implement this prompt set, update tests/docs, and report changed files plus verification commands.
