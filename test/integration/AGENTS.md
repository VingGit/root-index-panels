# Integration test DOX

## Purpose

- Own isolated, real-Quartz verification for plugin installation, rendering, assets, routing, and documented watch behavior.

## Ownership

- Owns executable fixture runners under `test/integration/`.
- The parent plugin DOX owns package scripts and public verification documentation.

## Local Contracts

- Never modify the source parent checkout's content, configuration, lockfile, plugin cache, or public output.
- Create marked workspaces beneath the system temporary directory, validate every cleanup target, and remove workspaces by default.
- `RIP_KEEP_INTEGRATION=1` may preserve a workspace for explicit manual inspection; print every preserved path.
- Locate a real Quartz checkout from the containing tree or validated `RIP_QUARTZ_ROOT`; fail clearly when none exists.

## Work Guidance

- Exercise the public CLI remove/add flow rather than constructing a successful plugin cache state by assertion alone.
- Use real Quartz builds for Page Type arbitration, plugin option surfaces, locale behavior, Preact identity, SPA/no-SPA assets, and GitLab subpaths.
- Keep known watch invalidation evidence separate from deployment gates: full builds are authoritative.

## Verification

- Run `node test/integration/parent-build.mjs` after changing its fixtures or assertions.
- Run `node test/integration/watch-build.mjs` when changing watch fixtures or the documented aggregate-invalidation boundary; stale root output is the expected current result and a clean full-build correction is required.
- Run Prettier, ESLint, syntax checking, and `git diff --check` for integration runner edits.

## Child DOX Index

- No child AGENTS.md files.
