# Prompt 02 — Implement authored topic appearance metadata

## Objective

Implement Prompt 01 with focused edits. Do not redesign the component or modify template compatibility files without a real test need.

## Steps

1. **Types and defaults**
   - Extend `RootIndexPanelsOptions` and add narrow local types for icon components and resolved appearance.
   - Default `defaultAccent` to `"theme"`.
   - Preserve legacy output when `panel` is absent; do not force visible icon markup onto old panels.
   - Export any consumer-facing types through `src/index.ts` and `src/types.ts`.

2. **Parsing and resolution**
   - Read `frontmatter.panel` defensively as an object and accept only strings.
   - Resolve built-in/custom icons with a deterministic precedence and graceful fallback.
   - Resolve named accents through `options.accents`; then accept only conservatively validated direct CSS colours. Never inject an unvalidated string into class names, attributes, CSS, or markup.
   - Store resolved appearance on every `DirEntry`, shared by cards and list rendering.

3. **Markup**
   - Render an icon only when one resolves, inside the existing link before the topic title, with a stable class such as `.rip-panel-icon`.
   - Add scoped data attributes and an inline custom property only when a custom accent resolves. Legacy panels inherit Quartz naturally.
   - Preserve one interactive panel link; do not introduce nested buttons/links.
   - Decorative icons use `aria-hidden="true"` and `focusable="false"`; preserve the title as the accessible link name.

4. **CSS**
   - Keep selectors scoped under `.rip`, `.rip--cards`, or `.rip--list`.
   - At existing panel accent touchpoints use a fallback chain such as `var(--rip-panel-accent, var(--secondary))` for border/focus/icon/title states.
   - Do not introduce a palette, typography, surface, or layout opinion beyond existing Quartz variables.
   - Preserve responsive layout and reduced-motion-friendly behavior.

5. **Internationalization**
   - Replace hard-coded note singular/plural and empty-state strings with the confirmed Quartz translation API.
   - Resolve locale during rendering, not at module initialization.

## Working example

```yaml
---
title: Linux
panel:
  icon: book-open
  accent: ocean
---
```

```ts
RootIndexPanels({
  icons: { "shell-notes": TerminalIcon },
  accents: { ocean: "var(--tertiary)" },
})
```

`panel.icon: shell-notes` uses the alias. Omitting `panel` keeps theme-defined output.

## Acceptance criteria

- Cards and list items share resolver behavior.
- Invalid frontmatter/config is non-fatal and safe.
- Root guard and SPA cleanup remain unchanged.
- `npm run build` succeeds.
