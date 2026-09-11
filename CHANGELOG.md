# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.2] - 2026-09-11

### Added

- Add `file-question-mark` to the bundled Lucide icon aliases.

### Fixed

- Make `npm run icon:add -- <name>` invoke npm through npm's JavaScript CLI so the helper works on Windows instead of failing with `spawnSync npm.cmd EINVAL`.
- Make packed-package verification extract its tarball using paths relative to the temporary working directory so GNU tar under Git Bash does not interpret a Windows drive letter as a remote host.

## [0.2.1] - 2026-09-11

### Changed

- Publish future releases from the personal npm scope `@vinggit/root-index-panels` and use the npm-published `@quartz-community/folder-page` dependency source.
- Make built-in icon generation insensitive to LF versus CRLF working-tree line endings so checks behave consistently on Windows.

## [0.2.0] - 2026-09-11

### Added

- Allow any icon from the plugin's pinned Lucide release to be selected directly with
  `panel.icon: "lucide:<name>"`, without a plugin pull request.
- Add a manifest-driven built-in icon registry and `npm run icon:add -- <name>` helper that verifies
  Lucide exports, regenerates code and documentation, formats changes, and runs package checks.

- Add a latest-edited three-book preview, localized edit dates, and deterministic reader-controlled
  library sorting.
- Add dedicated root/book home marks and independent folder disclosure buttons with active-path
  indicators.

### Changed

- Keep the book selector directly visible at every width, make Explorer independently collapsible,
  close it on compact non-landing destinations regardless of navigation source without changing page
  scroll, and leave it open for root/book landings, desktop, and Canvas navigation.
- Declare `github:quartz-community/folder-page` as a required Quartz-plugin prerequisite and reject
  builds where its configuration entry is missing.
- Rename the primary root action to “Explore library” and keep it visibly highlighted with a
  theme-compatible hover treatment.
- Give books without authored icon metadata a theme-colored open-book mark in the root library and
  book switcher.
- Constrain current note and folder backgrounds and rails to the selected row instead of the whole
  sidebar tree.
- Prioritize book terminology and the book collection throughout the root page and sidebar.
- Open book and nested-folder landing pages from their navigation rows while keeping their
  `index.md` notes out of the visible navigation tree.
- Scope selected note, folder, hidden active-path, and home-mark treatments to each book's accent.
- Consolidate repository agent instructions, reusable prompts, and technical references under
  `.github` on `main`.
- Replace the permanent agent-development branch and cherry-pick workflow with temporary feature
  branches and pull requests.
- Require human-only README content, repository-local noreply commit identity, Prettier before every
  push, synchronized documentation and generated artifacts, and deletion of merged feature branches.
- Apply the repository's Prettier rules to the consolidated agent documentation.

### Fixed

- Prevent the selected book's custom accent from recoloring root and theme-default entries in the book
  switcher; each entry now uses its own accent or the host theme color.

### Removed

- Remove the bottom return-to-library action and the redundant latest-preview explanatory sentence.
- Remove the obsolete branch-sync, filtered-diff, and automatic main-sync workflows.

## [0.1.1] - 2026-07-19

### Fixed

- Contain Canvas sidebar drawer to prevent layout overflow.
- Declare path utility peer dependency.
- Normalize committed source maps.

### Added

- Multi-book navigation shell with sidebar component.
- Book landing page panels.
- Canvas and Bases navigation integration.

[unreleased]: https://github.com/VingGit/root-index-panels/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/VingGit/root-index-panels/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/VingGit/root-index-panels/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/VingGit/root-index-panels/releases/tag/v0.2.0
[0.1.1]: https://github.com/VingGit/root-index-panels/releases/tag/v0.1.1
