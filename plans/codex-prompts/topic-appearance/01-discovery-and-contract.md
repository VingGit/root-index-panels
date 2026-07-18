# Prompt 01 — Confirm Quartz compatibility and freeze the public contract

## Objective

Before changing source, inspect the current Quartz 5 types and locale catalog available through this repository's declared dependency. Do not guess i18n keys from memory.

## Inspect

- `src/components/RootIndexPanels.tsx`
- `src/components/styles/panels.scss`
- `src/components/scripts/panels.inline.ts`
- `src/pageType.ts`, `src/index.ts`, `src/types.ts`
- `test/root-index-panels.test.tsx`
- `package.json`, `README.md`, `ARCHITECTURE.md`, `EXAMPLES.md`
- installed/current Quartz types and translation catalog

## Contract to implement

```ts
export interface RootIndexPanelsOptions {
  // Existing options stay unchanged.
  defaultIcon?: string
  icons?: Record<string, PanelIconComponent>
  defaultAccent?: string // default: "theme"
  accents?: Record<string, string>
}
```

```yaml
panel:
  icon: book-open       # built-in icon name or an alias from `icons`
  accent: ocean         # `theme`, a key from `accents`, or a safe CSS colour
```

### Required decisions

1. **Icons:** use a Preact-compatible, build-time registry. It must document every supported Lucide-style name and must not fetch assets at runtime. Reuse an existing project icon mechanism if one exists.
2. **Custom icon aliases:** support aliases in TypeScript configuration, such as:

   ```ts
   RootIndexPanels({ icons: { "research-mark": MyResearchIcon } })
   ```

   `panel.icon: research-mark` selects the alias. Unknown values must fall back or disappear without a build failure. Do not accept raw SVG/HTML from Markdown.
3. **Named accents:** support a reusable registry:

   ```ts
   RootIndexPanels({
     accents: {
       ocean: "var(--tertiary)",
       plum: "#7057a8",
     },
   })
   ```

   Omitted accent and `theme` preserve normal Quartz styling. Treat an unknown name as a direct CSS colour only after conservative validation; otherwise ignore it. Do not ship a hard-coded semantic topic palette.
4. **Data boundary:** parse only string values in `frontmatter.panel`; add resolved `icon`/`accent` fields to the internal directory entry.
5. **Theme boundary:** expose stable, scoped hooks such as `data-rip-icon`, `data-rip-accent`, and `--rip-panel-accent`; do not create selectors from user folder names.
6. **Translations:** identify the actual Quartz helper/key(s) for note count and empty state, render with the current locale, and document the exact strategy.

## Acceptance criteria

- New public types are exported from intended public entry points.
- Frontmatter is writer-friendly and config is optional.
- A site owner can add an alias/named accent from supported component/page configuration.
- Nothing maps Linux, Java, or any topic to a colour/icon by default.
