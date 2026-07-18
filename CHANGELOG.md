# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added optional book-index `panel.icon` and `panel.accent` metadata with 13 statically bundled Lucide icons, TypeScript custom icon aliases, YAML-safe named accents, and theme/direct accent fallbacks.
- Added public `PanelIconComponent`, extended `RootIndexPanelsOptions`, and consistent root, `./types`, and `./components` declarations.
- Added plugin-owned `en-US` and `fi-FI` count/empty-state catalogs with per-render English fallback for unsupported locales.
- Added reduced-motion, forced-color, decorative-icon, localized count-label, and SPA keyboard lifecycle coverage.
- Added packed-package and generated-runtime-import verification plus shipped Lucide/Feather and Quartz utility dependency notices.
- Added isolated stock-Quartz integration matrices for CLI installation, mixed-Preact rendering, YAML/TypeScript options, SPA/no-SPA assets, GitLab subpaths, and watch invalidation evidence.

### Changed

- Defined books from listed physical first-level content only, with the physical book index as the sole metadata source and a physical or FolderPage-generated index required as the destination.
- Counts now include listed physical descendants once, exclude the book's own index, include authored nested indexes, and ignore virtual pages. Date sorting now uses the newest eligible physical entry across the book.
- Directory links now resolve `<book>/index` through Quartz's public path utility, producing canonical trailing-slash links that remain correct under GitLab Pages subpaths.
- Runtime options, registry maps, sort ties, and duplicate slugs are normalized deterministically at the plugin boundary. YAML and TypeScript map overrides remain intentionally shallow.
- Restyled both layouts around Quartz theme tokens with responsive cards, scoped appearance hooks, subtle optional accents, and host-controlled focus behavior.
- Bundled non-singleton runtime dependencies into the committed prebuilt output while keeping Preact/Quartz host packages external.

### Fixed

- Root notes, `tags`, unlisted content, virtual FolderPage/TagPage output, and synthetic Canvas/Bases pages no longer create books, leak metadata, or inflate counts.
- Explicit title casing such as `iOS` and `eBPF` is preserved; only missing titles are humanized from their directory segment.
- Missing landing destinations are omitted instead of producing broken links, including dotted directory segments that previously risked file-style URLs.
- Root TOC, reading-time, and source-text component data are suppressed only for the exact physical root won by this Page Type, through a shallow render clone that cannot affect higher-priority or virtual owners and does not mutate the processed record used by other emitters.
- Repeated Quartz SPA navigation now cleans up panel keyboard listeners without duplicate handling.
- Built-in icons render through a hook-free Lucide-node adapter, avoiding split Preact context failures in local plugin worktrees without any Quartz upstream change.
- Card counts now use reliable localized accessible descriptions, and modified Arrow/Home/End browser shortcuts are no longer intercepted.
- Throwing/accessor-backed synthetic metadata is ignored without executing authored accessors or crashing the root render.
- Declared the path utility's optional `github-slugger` peer directly so clean Linux checkouts no longer depend on an ancestor Quartz installation to run source tests and builds.
- Embedded source-map text is normalized to LF after builds, so the committed `dist/` freshness check is deterministic across Windows and Linux without discarding useful source content.

### Security

- Accent values now use an exact hexadecimal/custom-property allowlist, and icon/accent registries accept only validated own data properties, preventing inherited-key resolution and CSS/markup injection paths.

### Known limitations

- Quartz partial watch builds do not invalidate the regular root Page Type when nested content changes, so root panels/counts/dates can remain stale after nested add/change/delete events. A clean/full build is authoritative.

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
