# root-index-panels

A Quartz 5 Page Type plugin for a multi-book knowledge base. It replaces the body of the existing root `content/index.md` with cards or a list for eligible first-level content directories while preserving Quartz's page frame, theme, navigation, and other layout components.

## Requirements and book model

`content/index.md` must exist. The plugin matches that physical root page; it does not generate a home page.

A first-level directory becomes a book only when all of these conditions hold:

- it contains at least one listed physical content entry below the first path segment;
- its first segment is not the reserved `tags` namespace or an `excludeDirs` entry (`index` is a valid book-directory name); and
- `<book>/index` exists either as a listed physical `<book>/index.md` or as a generated FolderPage destination.

If FolderPage is disabled, create an explicit `index.md` in every book. A generated FolderPage may prove that the destination exists, but virtual pages never create a book, supply metadata, or affect counts. Root-level notes, empty folders, and synthetic Canvas/Bases entries without `filePath` also do not create books.

The physical, listed `<book>/index.md` is the only metadata source. Its authored title is preserved exactly; only a missing title is humanized from the directory slug. A same-named root note such as `java.md` is never used. Each count includes listed physical descendants except the book's own index; authored nested indexes count and virtual indexes do not. Duplicate physical slugs count once, with the first eligible entry winning. `sort: date` uses the newest valid date found anywhere in the book's listed physical entries, checking Quartz `dates`, then top-level file data, then date-like index/descendant frontmatter. Valid dates include epoch and pre-1970 finite/parseable timestamps; undated books sort behind dated books.

Every destination is resolved as `<book>/index` through Quartz's path utility. From the root, links are canonical directory URLs such as `./java/` or `./git.md/`, so they also work when the site is deployed below a GitLab Pages group/project subpath.

## Installation

Install the plugin from GitHub:

```bash
npx quartz plugin add github:VingGit/root-index-panels
```

Enable and configure it in `quartz.config.yaml`:

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
      defaultIcon: ""
      defaultAccent: theme
      accents: {}
    order: 50
```

Do not add a plugin `layout` stanza or manually place `RootIndexPanels` when `RootIndexPanelsPage` is enabled. The Page Type already supplies the root body. The manifest intentionally has no component `defaultPosition` or `defaultPriority`, preventing a fresh install from adding a second copy to the layout.

## Writer frontmatter

Optional appearance metadata belongs only on the physical book index:

```yaml
---
title: Linux
description: Kernel, networking, observability, and command-line notes.
tags:
  - kernel
  - networking
panel:
  icon: terminal
  accent: ocean
---
```

`panel.icon` is a built-in or custom registry identifier. `panel.accent` is `theme`, a named accent, or an allowed direct color. The plugin never infers appearance from the directory name, title, or tags, and does not accept SVG, HTML, CSS declarations, or remote assets from frontmatter.

### Icon names

Identifiers are trimmed lower-case kebab names matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. The versioned registry backed by bundled `lucide-preact@1.25.0` contains:

`book-open`, `coffee`, `terminal`, `container`, `layers`, `code-2`, `network`, `git-branch`, `database`, `shield`, `cpu`, `globe`, and `file-code-2`.

The plugin reads the pinned generated Lucide node definitions and renders them through a hook-free SVG adapter. It does not depend on a Lucide context tied to a plugin worktree's Preact copy, so both local and GitHub `npx quartz plugin add` workflows remain stock-host compatible.

No icon is enabled by default. Resolution is:

1. resolve `panel.icon` as an own custom alias, then as a built-in;
2. if it is missing, malformed, or unknown, resolve `defaultIcon` the same way; and
3. otherwise render no icon.

Custom aliases deliberately win collisions with built-ins. Invalid, inherited, or non-component alias entries are ignored.

### Accent values

Direct accents are trimmed and must be exactly one of:

- `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`, using hexadecimal digits; or
- `var(--custom-property)`, where the property starts with a letter or underscore and then contains only letters, digits, underscores, or hyphens.

CSS keywords, arbitrary functions, `var()` fallbacks, gradients, URLs, declarations, braces, and extra tokens are rejected. Named registry identifiers use the icon-name grammar; `theme` is reserved and cannot be an accent registry key.

Resolution is:

1. `panel.accent: theme` immediately uses Quartz theme behavior and bypasses the default;
2. otherwise, a valid name resolves through the site's own `accents` entry;
3. otherwise, an allowed direct value is used;
4. missing, unknown, or invalid panel values fall back to `defaultAccent`; and
5. the default resolves as `theme`, one named entry, or one direct value. Invalid defaults become `theme`; registry values are not recursive aliases.

Prefer named values backed by Quartz/custom CSS variables for light/dark contrast. Literal colors are an explicit site-author override and never control the focus outline.

## YAML-safe site options

| Option                | Type                               | Default        | Runtime normalization and behavior                                                                      |
| --------------------- | ---------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| `layout`              | `cards \| list`                    | `cards`        | Any other value becomes `cards`.                                                                        |
| `showDescription`     | boolean                            | `true`         | Non-booleans become `true`.                                                                             |
| `showDocCount`        | boolean                            | `true`         | Non-booleans become `true`.                                                                             |
| `showTags`            | boolean                            | `true`         | Non-booleans become `true`; tags render only in cards.                                                  |
| `tagCount`            | number                             | `3`            | Finite values are floored and clamped to at least `0`; other values become `3`.                         |
| `sort`                | `alphabetical \| docCount \| date` | `alphabetical` | Any other value becomes `alphabetical`; ties use title then segment.                                    |
| `excludeDirs`         | string array                       | `[]`           | Items are trimmed; empty/non-string items and later duplicates are removed. Matching is case-sensitive. |
| `descriptionFallback` | string                             | `""`           | Any string, including intentional whitespace, is preserved; non-strings become `""`.                    |
| `defaultIcon`         | string                             | `""`           | A trimmed valid registry name; malformed or unresolved names produce no icon.                           |
| `defaultAccent`       | string                             | `theme`        | `theme`, a named accent, or an allowed direct value; invalid values become `theme`.                     |
| `accents`             | string map                         | `{}`           | Valid own names map to allowed direct values; invalid entries and the reserved `theme` key are ignored. |

`accents` is accepted by the YAML loader, but the current Quartz manifest schema cannot accurately describe arbitrary mappings, so it is not exposed through schema-driven TUI editing. `icons` contains Preact components and is TypeScript-only.

Effective precedence is package defaults, then YAML options, then a `quartz.ts` override. Quartz merges options shallowly: an `accents` or `icons` map in a later surface replaces the entire earlier map rather than merging individual keys.

## TypeScript-only custom icons

Register custom component aliases on the Page Type factory before loading the configuration:

```ts
import { createElement } from "preact"
import type { PanelIconComponent } from "./.quartz/plugins/root-index-panels"
import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const ShellNotesIcon: PanelIconComponent = (props) =>
  createElement(
    "svg",
    { ...props, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" },
    createElement("path", { d: "m5 7 4 5-4 5m6 0h8" }),
  )

ExternalPlugin.RootIndexPanelsPage({
  icons: { "shell-notes": ShellNotesIcon },
  accents: { ocean: "var(--secondary)" },
  defaultIcon: "shell-notes",
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
```

The TypeScript-only `icons` option has type `Record<string, PanelIconComponent>` and an effective default of `{}`. It keeps valid own registry keys whose values are component functions; malformed, inherited, accessor, and non-function entries are ignored. Like `accents`, the complete map is shallowly replaced by a later configuration surface.

Custom icons must render decorative SVG content only: no links, controls, focusable descendants, or accessible-name content. `RootIndexPanels(...)`, separately exported from the package and `./components`, is the advanced component constructor; calling it does not configure the Page Type. Disable the Page Type before taking manual layout ownership.

## Rendering, themes, and accessibility

Cards and list rows are each one whole-panel link. The visible title is its explicit accessible name; localized count and other supporting text form its description. The plugin uses Quartz theme tokens, a responsive grid, Windows forced-color support, visible host-controlled focus outlines, and reduced-motion fallbacks. Decorative icon wrappers are `aria-hidden`, inert, and non-interactive; their SVG is non-focusable. Numeric card badges are hidden from assistive technology and paired with visually hidden localized count text; list counts are localized visibly.

Stable scoped hooks for theme authors are `.rip`, `.rip-grid`, `.rip-card-link`, `.rip-list-link`, `.rip-panel-icon`, `.rip-count`, `.rip-tags`, `data-rip-icon`, and `data-rip-accent`. Named accents expose only the validated registry name; direct values use `data-rip-accent="direct"`. Theme behavior emits neither an accent data attribute nor an inline custom property.

Named and direct accents set a validated inline `--rip-panel-accent` custom property. A strict Content Security Policy that blocks style attributes may also block those accents; use theme behavior or adjust the site's CSP deliberately. Raw authored values never become selectors or class names.

Arrow keys move between adjacent panels when one has focus; `Home` and `End` move to the first and last panel. Listeners initialize on Quartz `nav` events and register through `window.addCleanup`, so SPA navigation tears them down before re-entry.

The plugin ships `en-US` and `fi-FI` strings, selected from `cfg.locale` on each render. Unsupported locales fall back to English. English uses `1 note`, `N notes`, and `No subdirectories found.`; Finnish uses `1 muistiinpano`, `N muistiinpanoa`, and `Alikansioita ei löytynyt.`

## Root source and visibility boundaries

The root Markdown HAST is intentionally replaced by panels. The rendered root frame receives a shallow file-data clone without TOC or reading-time data, so hidden root headings do not leave stale TOC/read-time UI. The shared processed record is not mutated: Search, RSS, sitemap, and Open Graph emitters may still consume the authored root Markdown or its metadata. Use a metadata-only `content/index.md` when that source text should not be indexed elsewhere.

Book eligibility reads Quartz's processed top-level `unlisted` flag rather than reparsing raw frontmatter. This respects the output of visibility/encryption plugins that mark pages unlisted. An unlisted page cannot create a book, provide metadata/tags/dates, or increase its count; a book can still appear if it has other listed physical content and a valid destination. Do not place sensitive book names or descriptions in listed indexes, and keep UnlistedPages/EncryptedPages configured for the disclosure policy you need.

## Partial-watch limitation

Full Quartz builds are authoritative. Quartz's partial Page Type emitter does not expose a dependency-invalidation hook from nested pages back to the regular root page. During `npx quartz build --serve`, adding, changing, or deleting a nested note can therefore leave `public/index.html` counts, dates, or panels stale. Stop the watcher and run a clean/full build to refresh the root aggregate. This plugin does not patch Quartz core or claim live aggregate correctness.

## Local development

Install dependencies and run the package gates from this repository:

```bash
npm ci
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm pack --dry-run
```

When this checkout is nested inside Quartz (or `RIP_QUARTZ_ROOT` points to a Quartz checkout), run the isolated three-build host matrix too:

```bash
npm run test:integration
```

Set `RIP_KEEP_INTEGRATION=1` only when you want its temporary workspaces preserved for manual inspection; the default run validates and removes them.

The known watcher boundary has a separate, opt-in stock-host diagnostic:

```bash
npm run test:watch-integration
```

It currently reports nested add/change/delete root staleness as `EXPECTED LIMITATION`, then requires a clean build to correct the aggregate. It will also pass if a future compatible Quartz host begins invalidating the root correctly. This diagnostic is intentionally separate from CI and deployment gates.

To test an unpublished checkout in a parent Quartz repository, use the CLI's local source workflow rather than overlaying a remotely pinned cache:

```bash
npx quartz plugin remove root-index-panels
npx quartz plugin add ./root-index-panels
```

Confirm that `quartz.lock.json` records `commit: "local"`. After the desired revision has been pushed, switch back with another remove/add using `github:VingGit/root-index-panels`; do not treat a local cache as a verified remote install.

## License

MIT. Bundled dependency notices are in `THIRD_PARTY_NOTICES.md`.
