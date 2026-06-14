# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
