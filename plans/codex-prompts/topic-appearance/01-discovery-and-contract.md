# Prompt 01 — Verify compatibility and freeze the implementation contract

> [!note]
> This is the frozen contract for the completed appearance increment. Its book/appearance API and
> evidence remain authoritative. The active navigation-shell contract explicitly supersedes its
> `layout: "content"`-only body boundary, hidden-root-source policy, and no-position manifest rule;
> see [`topic-navigation-shell`](../topic-navigation-shell/README.md).

## Objective

Reconfirm every API and repository fact below in the implementation session, record any drift, and stop before source edits if the frozen contract is no longer implementable. Do not guess from memory or silently substitute an upstream-template convention for the local Quartz 5 loader.

## Read and inspect

### Contracts and design

- The applicable parent and nested `AGENTS.md` files and this prompt set in order.
- The Figma URL from the prompt-set README, using it as the scoped visual reference defined in Prompt 00.
- Parent docs: `docs/plugins/index.md`, `docs/advanced/making plugins.md`, `docs/advanced/creating components.md`, `docs/configuration.md`, `docs/layout.md`, `docs/advanced/paths.md`, `docs/getting-started/migrating.md`, and `docs/cli/plugin.md` when present.
- Parent source: Page Type dispatcher/types, frame/layout resolution, path utilities, physical parsing, FolderPage/TagPage/UnlistedPages, plugin loader types/merge behavior, and the installed `@quartz-community/types` declarations.
- Upstream `quartz-community/plugin-template` at a recorded commit, especially its `AGENTS.md`, package manifest, `tsup` config, CI, tests, i18n example, and release guidance.

### Plugin and host integration

- `src/components/RootIndexPanels.tsx`, its SCSS and inline script, `src/pageType.ts`, all public barrels/types, tests, and any i18n/appearance modules that now exist.
- `package.json`, `package-lock.json`, `tsup.config.ts`, `.github/workflows/ci.yml`, `README.md`, `ARCHITECTURE.md`, `EXAMPLES.md`, `CHANGELOG.md`, and generated declaration entry points.
- Parent `quartz.ts`, `quartz.config.yaml`, `.gitlab-ci.yml`, `.quartz/plugins/index.ts`, `quartz.lock.json`, and the ignored installed plugin cache.

Run `npm ci`, then capture baseline `npm run check` and `npm run build` results before changing source. A missing plugin-local dev dependency before `npm ci` is an environment issue, not evidence that source is broken.

## Frozen book/page contract

- Implement the exact inventory, visibility, metadata, destination, count, reserved namespace, and root prerequisites in Prompt 00.
- Filter physical/listed entries before inventory and counting. Virtual TagPage/FolderPage output can be consulted only to confirm a generated destination.
- Use two ordered metadata lookups: physical/listed `<segment>/index` first; otherwise no metadata index. Never combine it with `slug === segment` in one `find()`.
- Use `resolveRelative(fileData.slug!, `${segment}/index`)`; assert a root result of `./<segment>/` and a valid base-path/subdirectory-hosted destination.
- Preserve explicit index titles byte-for-byte. Humanize only a slug fallback.
- Normalize runtime options as well as manifest/YAML input according to the table below. Do not rely on manifest discovery metadata as runtime validation.
- Keep Page Type priority `100`, layout key `content`, and body options captured by the Page Type factory closure. Root Markdown content remains intentionally replaced by the panel body.
- Keep the host frame but suppress root-only `toc`, `readingTime`, and `text` component data without mutating the shared processed-file record. Current host ContentMeta derives reading time from `text`, not a cached `readingTime` field. Search, RSS, sitemap, and social metadata may still consume the authored root source independently; recommend a metadata-only `content/index.md` when hidden prose is undesirable.
- Omit `defaultPosition` and `defaultPriority` from this dual Page Type/component package's manifest metadata. A fresh `quartz plugin add` must not add `RootIndexPanels` to a manual layout and render it twice.
- Full builds are authoritative for aggregate root data. Document the partial-watch limitation from Prompt 00 rather than claiming live correctness.

### Existing-option normalization

| Option                                        | Accepted runtime value                        | Invalid fallback/normalization                                                                |
| --------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `layout`                                      | exactly `cards` or `list`                     | `cards`                                                                                       |
| `sort`                                        | exactly `alphabetical`, `docCount`, or `date` | `alphabetical`                                                                                |
| `showDescription`, `showDocCount`, `showTags` | booleans                                      | existing default `true`                                                                       |
| `tagCount`                                    | finite number                                 | floor fractions, clamp below zero to `0`; other values use `3`                                |
| `excludeDirs`                                 | array of strings                              | trim, drop empty/non-string items, deduplicate first occurrence, and compare case-sensitively |
| `descriptionFallback`                         | string, including intentional whitespace      | non-strings use `""`                                                                          |

Deduplicate eligible physical files by full slug with the first eligible occurrence winning and contributing to counts once. Preserve `sort: date` as the newest valid date across every listed physical entry in the book; valid `Date` objects, finite numbers, and parseable strings include epoch and pre-1970 values, while undated books sort last. Metadata other than this aggregate sort key still comes only from the selected book index.

## Frozen public appearance API

Export `RootIndexPanelsOptions` and `PanelIconComponent` from `src/types.ts`, the package root, and `src/components/index.ts` so the three declared entry points expose a consistent consumer contract:

```ts
import type { ComponentType, JSX } from "preact"

export type PanelIconComponent = ComponentType<JSX.SVGAttributes<SVGSVGElement>>

export interface RootIndexPanelsOptions {
  layout?: "cards" | "list"
  showDescription?: boolean
  showDocCount?: boolean
  showTags?: boolean
  tagCount?: number
  sort?: "alphabetical" | "docCount" | "date"
  excludeDirs?: string[]
  descriptionFallback?: string
  defaultIcon?: string
  icons?: Record<string, PanelIconComponent>
  defaultAccent?: string
  accents?: Record<string, string>
}

export type RootIndexPanelsPageOptions = RootIndexPanelsOptions
```

Do not expose internal resolver/entry types solely to make tests convenient.

### Built-in icons and packaging

Use statically imported `lucide-preact` components in a curated registry. The versioned built-in names are:

`book-open`, `coffee`, `terminal`, `container`, `layers`, `code-2`, `network`, `git-branch`, `database`, `shield`, `cpu`, `globe`, and `file-code-2`.

For the verified `lucide-preact@1.25.0` API, keep the stable public keys while mapping
`code-2` to `CodeXml` and `file-code-2` to `FileCode`; those releases no longer export
`Code2` or `FileCode2`.

- No built-in icon is selected by default.
- Add `lucide-preact` to runtime dependencies and pin it through `package-lock.json`.
- Add the public path package `@quartz-community/utils` as a locked runtime dependency for `resolveRelative`; do not import Quartz core path internals.
- Restore the plugin-template dependency-bundling intent while retaining singleton externals for Preact/Quartz host packages. In the verified tsup release, a literal `noExternal: [/.*/]` overrides `external` and bundles Preact; use the equivalent blanket matcher with explicit singleton exclusions and fail the artifact check if singleton internals appear.
- Add a shipped `THIRD_PARTY_NOTICES.md` with Lucide's ISC notice, Lucide's embedded Feather MIT notice, and the bundled `@quartz-community/utils` MIT notice; include it in the package allowlist.
- Static imports must tree-shake; never dynamically import an authored icon name or fetch an asset at runtime.
- CI/final review must scan every generated JavaScript entry, including side-effect imports and re-exports, and prove there is no unexpected bare `lucide-preact`, `@quartz-community/utils`, or other bundled-runtime import.

### Registry identifiers

Trim input and accept only lower-case kebab identifiers matching:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Use own-property checks for `icons` and `accents`; inherited names such as `constructor` and `toString` never resolve. Ignore invalid keys/values. Custom icon aliases must be functions/components and obey the decorative SVG contract. Custom aliases resolve before built-ins so a future built-in addition cannot silently change an established site alias. `theme` is reserved for accent behavior and cannot be an accent registry key.

### Icon precedence

Resolve once per book in this exact order:

1. Trim a string `panel.icon`; ignore non-strings/empty/invalid identifiers.
2. Resolve that name as an own custom alias, then as a built-in.
3. If missing/unknown, resolve `defaultIcon` by the same custom-alias-then-built-in order.
4. If still unresolved, render no icon and no icon hook.

An omitted `panel.icon` may use an explicitly configured `defaultIcon`; untouched default options render no icon.

### Accent grammar and precedence

Registry values, defaults, and direct frontmatter values use the same allowlist after trimming:

- `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa` with hexadecimal digits; or
- exactly `var(--custom-property)` where the property matches `--[A-Za-z_][A-Za-z0-9_-]*`, with no fallback or extra tokens.

Reject CSS keywords, whitespace-expanded expressions, semicolons, braces, control characters, `url()`, gradients, arbitrary functions, and `var()` fallbacks. JSX escaping is not a substitute for this validation.

Resolve in this exact order:

1. A string `panel.accent` equal to `theme` resolves immediately to theme behavior and bypasses `defaultAccent`.
2. Otherwise, a valid identifier resolves through an own `accents` entry whose value passes the direct grammar.
3. Otherwise, a frontmatter value that itself passes the direct grammar resolves as a direct accent.
4. Missing/unknown/invalid frontmatter falls back to `defaultAccent`.
5. Resolve `defaultAccent` as `theme`, a valid own registry name, or a direct allowed value. Invalid/missing defaults resolve to `theme`; do not recurse through aliases.

`defaultAccent` defaults to `theme`. Registry maps are shallowly replaced according to Quartz's option merge behavior; document that they are not deep-merged.

### Markup/style hooks

- Resolved icon: the panel anchor receives `data-rip-icon="<safe-resolved-name>"`; its `.rip-panel-icon` span is `aria-hidden="true"`, `inert`, and non-interactive, and the SVG receives `focusable="false"`. The title remains the link's accessible name.
- Named accent: the panel anchor receives `data-rip-accent="<safe-registry-name>"` and inline `--rip-panel-accent: <validated-value>`.
- Direct accent: the panel anchor receives `data-rip-accent="direct"` and the validated custom property.
- Theme behavior: no accent data attribute and no inline custom property.
- Never place a raw color value in a class, selector, or data attribute. Keep the critical focus outline on a host-controlled token/system color.

## Configuration surfaces

- YAML-safe site options are `defaultIcon`, `defaultAccent`, and `accents`. Reflect them in runtime normalization/default metadata and represent them in `configSchema` wherever the current manifest vocabulary can do so accurately.
- `icons` is TypeScript-only because it contains Preact components. Do not claim YAML/TUI support for functions.
- Normal page-type overrides use `ExternalPlugin.RootIndexPanelsPage({...})` in `quartz.ts` before `loadQuartzConfig()`. Calling the separately exported `RootIndexPanels(...)` component factory does not configure the Page Type.
- Effective precedence is package defaults, then YAML options, then `quartz.ts` override; object merging is shallow.

If the current manifest schema cannot describe arbitrary mappings, document YAML map support accurately and omit misleading TUI claims rather than inventing a schema shape.

The verified local schema vocabulary has no accurate arbitrary-map descriptor. Add string schema
entries for `defaultIcon` and `defaultAccent`, keep `accents` YAML-supported but absent from
`configSchema`, and keep `icons` absent from both manifest defaults and schema.

## Localization contract

Create plugin-owned `src/i18n` definitions/catalogs and an `i18n(locale)` selector evaluated during render from `cfg.locale`.

- Ship `en-US` and `fi-FI` initially; unknown/unsupported locales fall back to `en-US`.
- Localize note count with correct singular/plural output and the empty-directory message.
- Keep `en-US` text compatible with the existing `1 note`, `N notes`, and `No subdirectories found.` wording.
- Freeze `fi-FI` as `1 muistiinpano`, `${count} muistiinpanoa` for every other count, and `Alikansioita ei löytynyt.` for the empty state.
- Numeric-only visual count badges, if used, receive a localized accessible label.
- Do not import `@jackyzha0/quartz` or Quartz's private locale catalogs.

## Decision gate

Before Prompt 02, write a short implementation-session note with:

- inspected Quartz/types/plugin-template revisions;
- baseline command results;
- confirmed loader schema and TS override behavior;
- confirmed Lucide component/type compatibility and license treatment;
- any source drift that changes this contract.

If a frozen item cannot be met, stop and revise this prompt with the user instead of improvising in source.
