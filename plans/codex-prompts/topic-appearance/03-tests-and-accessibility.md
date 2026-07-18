# Prompt 03 — Prove behavior, safety, locale use, and accessibility

## Objective

Extend the existing Vitest coverage with observable-output tests. Use only the smallest helpers required by the current test stack.

## Required cases

1. Legacy panels with no `panel` metadata have no explicit custom accent hook and no unexpected icon markup.
2. A built-in icon renders as decorative SVG/container and the title remains the usable link name.
3. An option-provided alias resolves from frontmatter.
4. Unknown/malformed icons never throw and follow fallback/no-icon behavior.
5. A named accent resolves through `options.accents` in both `cards` and `list` output.
6. Safe direct colours render; unsafe/invalid inputs are ignored and cannot contaminate markup/CSS.
7. `theme` and an omitted accent leave theme control intact.
8. One directory's appearance cannot appear on another panel.
9. Render two available Quartz locales (or mock the canonical i18n boundary) and prove note count/empty state are locale-derived, including singular/plural behavior.
10. Retain regression coverage for root-only rendering, note counts, tags, excludes, sorting, and page type integration.

## Manual accessibility review

- Tab reaches a panel link once; icons add no focus stop.
- Arrow/Home/End navigation still works after Quartz SPA navigation.
- Focus remains visible with and without a custom accent.
- Hover-only cues are not required for comprehension/activation.
- Test both light and dark themes with theme-token and literal colour values.

If literal colors cannot guarantee contrast across arbitrary themes, document them as explicit writer overrides and recommend token-backed named accents. Do not silently rewrite the writer's value.

## Commands

```bash
npm run typecheck
npm run lint
npm run format
npm run test
npm run build
npm run check
```

Do not call the work complete until all commands pass and all ten test behaviors have coverage or a documented, justified limitation.
