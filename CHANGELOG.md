# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `RootIndexSidebar`, a server-rendered root-manual/book selector and route-scoped Explorer
  hierarchy built from native disclosures, lists, and links, with responsive, forced-color, and
  reduced-motion behavior. The root selector label comes from the authored root index title with a
  localized Home fallback.
- Added a semantic directory/note/last-updated overview and no-JavaScript browse anchor as the first
  Page Type body element, followed by authored root HAST and the existing cards/list collection.
- Added a progressively enhanced absolute manual popup with selected-manual checks, outside/link
  light-dismiss, one-open behavior, Escape close with focus restoration, and Quartz SPA cleanup; the
  native no-JavaScript interaction remains complete.
- Added `replaceExplorer`, defaulting to `true`, with a narrowly scoped direct-sibling selector and a
  `false` opt-out that preserves stock Explorer.
- Added public `RootIndexSidebar` and `RootIndexSidebarOptions` exports and declared the sidebar as
  the manifest's only layout component at left priority `40`.
- Added optional book-index `panel.icon` and `panel.accent` metadata with 13 statically bundled Lucide icons, TypeScript custom icon aliases, YAML-safe named accents, and theme/direct accent fallbacks.
- Added public `PanelIconComponent`, extended `RootIndexPanelsOptions`, and consistent root, `./types`, and `./components` declarations.
- Added plugin-owned `en-US` and `fi-FI` count, overview, browse, empty-state, Explorer,
  manual-switcher, selected-manual, and sidebar-navigation labels with per-render English fallback
  for unsupported locales.
- Added reduced-motion, forced-color, decorative-icon, localized count-label, and SPA keyboard lifecycle coverage.
- Added packed-package and generated-runtime verification, including ancestor-dependency detection,
  plus notices for the shipped Lucide/Feather, Quartz utility, and HAST-to-JSX dependency closure.
- Added isolated stock-Quartz integration matrices for fresh CLI layout installation,
  mixed-Preact rendering, YAML/TypeScript options, authored root metadata and body order,
  selected-manual/current-page state, disjoint root/book Explorer scope, sidebar/Explorer/Graph
  composition, SPA/no-SPA assets, base-path/subdirectory hosting, and watch invalidation evidence.
- Added a durable JavaScript/Git/SQL compatibility-lab contract with physical/listed counts of
  `8`/`5`/`6`, distinct writer-selected icons/accents, cross-book edges, and Quartz feature specimens.

### Changed

- Defined books from listed physical first-level content only, with the physical book index as the sole metadata source and a physical or FolderPage-generated index required as the destination.
- Counts now include listed physical descendants once, exclude the book's own index, include authored nested indexes, and ignore virtual pages. Date sorting now uses the newest eligible physical entry across the book.
- Root panels plus all root-manual/book/note/folder sidebar destinations now use Quartz public path
  utilities, producing canonical relative links under both domain-root and subdirectory-hosted sites.
- Runtime options, registry maps, sort ties, and duplicate slugs are normalized deterministically at the plugin boundary. YAML and TypeScript map overrides remain intentionally shallow.
- Restyled both layouts around Quartz theme tokens with responsive cards, scoped appearance hooks,
  subtle optional accents, and host-controlled focus behavior. Card hover/focus now uses the
  Make-derived top radial glow and bottom accent hairline without the previous accent border/title
  highlight.
- Bundled non-singleton runtime dependencies into the committed prebuilt output while keeping Preact/Quartz host packages external.
- The manifest now declares exactly one installable component, `RootIndexSidebar`; the Page Type body
  remains public but outside component discovery, preventing duplicate root rendering.
- Sidebar scoping replaces only the stock Explorer navigation role. Each book scope starts with
  Overview, opens top-level folders by default, and opens deeper folders only for current ancestry.
  The right layout slot remains host-owned; CanvasPage's fullscreen no-right-slot frame remains an
  explicit host-controlled exception.
- Responsive host coupling is limited to three narrowly scoped selector kinds: default-frame grid
  track containment, direct-plugin mobile left-container containment, and direct Explorer sibling
  replacement. Explorer remains the only cross-plugin suppression.

### Fixed

- Root notes, `tags`, unlisted content, virtual FolderPage/TagPage output, and synthetic Canvas/Bases pages no longer create books, leak metadata, or inflate counts.
- Explicit title casing such as `iOS` and `eBPF` is preserved; only missing titles are humanized from their directory segment.
- Missing landing destinations are omitted instead of producing broken links, including dotted directory segments that previously risked file-style URLs.
- Root Markdown is visible exactly once and root TOC, reading-time, and source-text data remain intact
  for normal host components and emitters.
- The plugin no longer needs root-only metadata deletion or a render clone; the physical root HAST is
  rendered through Quartz's public JSX utility before the overview and book collection.
- Repeated Quartz SPA navigation now cleans up panel keyboard listeners without duplicate handling.
- Built-in icons render through a hook-free Lucide-node adapter, avoiding split Preact context failures in local plugin worktrees without any Quartz upstream change.
- Card counts now use reliable localized accessible descriptions, and modified Arrow/Home/End browser shortcuts are no longer intercepted.
- Throwing/accessor-backed synthetic metadata is ignored without executing authored accessors or crashing the root render.
- Declared the path utility's optional `github-slugger` peer directly so clean Linux checkouts no longer depend on an ancestor Quartz installation to run source tests and builds.
- Embedded source-map text is normalized to LF after builds, so the committed `dist/` freshness check is deterministic across Windows and Linux without discarding useful source content.
- Browser-observed tablet/mobile horizontal overflow from Quartz intrinsic `auto` grid tracks is
  contained with default-frame-only `minmax(0, ...)` tracks and direct-plugin left width/wrapping;
  right-rail components and Canvas/custom frames remain untargeted.
- Declared the JSX utility's optional `hast-util-to-jsx-runtime` peer directly so standalone source
  builds cannot resolve it accidentally from an ancestor Quartz installation.
- A sidebar shell collapsed on mobile becomes visible when resized to tablet/desktop, even though
  its native `<details>` state remains closed and its narrow-only summary is hidden.
- Finite numeric dates outside the ECMAScript Date range are ignored instead of crashing both the
  requested-locale and English-fallback overview formatters.
- Canvas/Bases virtual records named `<book>/index` no longer qualify a physical directory as a book
  destination; only physical indexes and ordinary generated FolderPage indexes do.
- Root panels and sidebar inventory now share one canonical-slug parser, so leading, trailing,
  doubled, dot, and backslash path anomalies cannot create mismatched links.
- Revoked option and frontmatter proxies fall back safely at the public root component boundary.
- Packed-package verification now exercises sidebar runtime exports and sidebar option declarations
  through every public entry.

### Security

- Accent values now use an exact hexadecimal/custom-property allowlist, and icon/accent registries accept only validated own data properties, preventing inherited-key resolution and CSS/markup injection paths.

### Known limitations

- Quartz partial watch builds do not fully invalidate nested aggregates, so root
  panels/counts/dates or cached sidebar inventory can remain stale after nested add/change/delete
  events. A clean/full build is authoritative.

## [0.1.1] - 2026-06-14

### Added

- Added `RootIndexPanelsPage`, a Quartz page-type plugin that replaces only the root `index` page body.
- Added component rendering tests for directory collection, exclusion, sorting, empty states, and page-type matching.

### Changed

- Converted the package from the generic community plugin template into a focused root index panels plugin.
- Updated the Quartz manifest to use `configSchema`, complete component metadata, and `pageType` plus `component` categories.

### Fixed

- Preact JSX runtime is now externalized correctly so Quartz renders the built component with the host Preact instance.
- Root-level notes are no longer promoted into directory panels.
- The documented `date` sort option now sorts by available Quartz date data or date-like frontmatter.
