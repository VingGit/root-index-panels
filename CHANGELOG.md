# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add a latest-edited three-book preview, localized edit dates, deterministic reader-controlled
  library sorting, and a return-to-library action around authored root content.
- Add dedicated root/book home marks and independent folder disclosure buttons with active-path
  indicators.

### Changed

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

### Removed

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

[unreleased]: https://github.com/VingGit/root-index-panels/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/VingGit/root-index-panels/releases/tag/v0.1.1
