# Prompt 02 — Implement baseline correctness, then authored appearance

## Objective

Implement the frozen Prompt 01 contract in small, reviewable layers. Correct the book data model before adding visual metadata so appearance cannot be built on virtual-page contamination or broken links.

Do not redesign host Quartz chrome, add Figma application features that Prompt 00 excludes, or patch any file that exists in official Quartz upstream. Keep every compatibility change inside this plugin and verify the pushed, prebuilt checkout through the normal `npx quartz plugin` workflow.

## Phase A — Baseline book correctness

1. **Normalize inputs**
   - Add one runtime normalization boundary for all existing and new options.
   - Preserve valid existing values and documented defaults; clamp/normalize invalid enum, numeric, array, map, boolean, and string inputs as frozen in Prompt 01.
   - Keep function-valued `icons` out of manifest/YAML claims while accepting it through the TypeScript factory override.

2. **Build the inventory once**
   - Replace repeated `find`/`filter` scans with a single `Map`/`Set` aggregation over eligible physical/listed entries.
   - Exclude root-level items, `tags`, `excludeDirs`, virtual files, and `unlisted` entries before discovery/counting.
   - Count eligible physical descendants exactly once and exclude only the book's own landing index.
   - Sort only after all entries are complete.

3. **Select metadata deterministically**
   - Use the physical/listed `<segment>/index` only; do not allow `segment` or a virtual index to win based on input order.
   - Preserve authored title text exactly. Apply humanization only to the segment fallback.
   - Source description, tags, and `panel` metadata from the same selected index. Keep the date-sort key as the newest eligible physical date aggregated across the whole book.

4. **Create canonical destinations**
   - Use the public Quartz path utility and target `${segment}/index`.
   - Accept a physical/listed index or existing FolderPage virtual index as a valid destination according to Prompt 00; omit candidates with neither rather than rendering a broken link, and document the host prerequisite.
   - Never construct `./${segment}` manually.

5. **Preserve Page Type boundaries**
   - Keep root matching, priority, `layout: "content"`, and closure-captured options.
   - Continue to replace the root HAST with panels and inherit the host frame/layout slots.
   - Do not register the component a second time in a manual layout.

## Phase B — Appearance and localization internals

1. **Add focused modules**
   - Put public consumer types in `src/types.ts` and the established public barrels.
   - Add a small internal appearance resolver and curated static icon registry rather than embedding all validation in JSX.
   - Add plugin-owned `src/i18n` definitions, `en-US`, `fi-FI`, and locale selector.
   - Keep internal helpers internal unless they are a deliberate supported API.

2. **Resolve defensively**
   - Treat `frontmatter.panel` as unknown: reject null, arrays, non-objects, inherited data, non-string values, empty strings, and invalid identifiers/forms.
   - Use own-property registry lookups and validate config defaults/map values just as strictly as frontmatter.
   - Apply the exact icon/accent precedence from Prompt 01 once per completed directory entry, shared by cards and list output.
   - Never accept raw markup or interpolate an unvalidated value into markup/style.

3. **Render semantic markup**
   - Keep one existing panel anchor as the only interaction.
   - Render the `aria-hidden`/`inert` icon wrapper before the title only when an icon resolves. Pass decorative SVG props, make the wrapper non-interactive, and keep custom icon authors within the exported SVG-only contract.
   - Add only the safe data/custom-property hooks specified in Prompt 01. Untouched default options produce no new appearance markup.
   - Give a numeric-only visual count a localized accessible label; avoid duplicate audible text.

4. **Apply scoped Figma-inspired styling**
   - Keep every selector in the `rip-*` namespace and both card/list variants operational.
   - Use `--rip-panel-accent` only for decorative icon tile, border/title/hover details, with Quartz token fallbacks.
   - Keep `:focus-visible` independent of arbitrary authored colors and visibly robust in forced-colors mode.
   - Add a deliberate `prefers-reduced-motion: reduce` path for lift/transition behavior.
   - Preserve the responsive auto-fitting grid and avoid the Figma prototype's desktop-chrome overflow on narrow screens.

5. **Localize at render time**
   - Select the plugin catalog from `cfg.locale` inside component rendering.
   - Replace the hard-coded count and empty state through that boundary.
   - Keep English output compatible and use the documented fallback for unsupported locales.

## Phase C — Manifest, dependencies, and build inputs

- Add `lucide-preact` and the public path helper package `@quartz-community/utils`, update `package-lock.json`, perform the license/notice work, and ensure the notice is shipped. Import `resolveRelative` from the public utility package and use `FullSlug` from public types where its signature requires it.
- Update `quartz.defaultOptions` and `configSchema` for every YAML-safe option the loader can accurately describe. Keep package/component metadata internally consistent without inventing a release version.
- Restore dependency bundling in `tsup.config.ts` while retaining all required singleton externals and current inline SCSS/script handling.
- Update source exports so `PanelIconComponent` and extended options appear through the intended package entry points.
- Do not manually edit `dist/`; generate it only after tests/docs are ready.

## Working examples

Writer frontmatter:

```yaml
---
title: Linux
panel:
  icon: book-open
  accent: ocean
---
```

YAML-safe defaults/named accents belong in the plugin's normal `quartz.config.yaml` entry. Custom component aliases use `quartz.ts` before configuration loading:

```ts
import * as ExternalPlugin from "./.quartz/plugins"

ExternalPlugin.RootIndexPanelsPage({
  icons: { "shell-notes": ShellNotesIcon },
  accents: { ocean: "var(--tertiary)" },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
```

## Acceptance criteria

- Full builds implement the Prompt 00 book model with no virtual `tags` panel or inflated counts.
- Cards/list share one normalized entry/resolution path and canonical folder links.
- Invalid frontmatter/config is non-fatal and cannot inject CSS/HTML or access inherited registry properties.
- Default configuration has no icon/accent markup; explicit defaults and per-book metadata follow frozen precedence.
- Plugin-owned locale output, root guard, SPA script lifecycle, and host layout ownership remain intact.
- Source, manifest, lockfile, license treatment, exports, tests/docs, and eventual generated output agree.
