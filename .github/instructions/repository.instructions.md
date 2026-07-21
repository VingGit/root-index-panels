---
name: Repository boundaries
description: Repository ownership, source authority, and local Quartz worktree rules
applyTo: "**"
---

# Repository boundaries

## Purpose and ownership

This is the external Quartz 5 plugin `@quartz-community/root-index-panels`. It owns every file in
this plugin repository, including generated `dist/` output. Keep its Git history, status, commits,
and pushes separate from any parent Quartz repository.

All compatibility fixes belong in this plugin. Never modify a file that exists in official Quartz
upstream to make this plugin work.

## Source authority

When sources disagree, use this order:

1. the active user request and applicable `AGENTS.md` chain;
2. the parent checkout's current Quartz docs, source, installed public types, and actual
   `npx quartz plugin` behavior;
3. the canonical instructions in this `.github/instructions` directory;
4. the plugin's current source, tests, manifest, generated `dist/`, and human README; and
5. the current Quartz community plugin template at a recorded revision.

Rendered host output is authoritative for Canvas/Bases provenance, CanvasFrame structure,
Breadcrumbs, and layout behavior. Do not infer those contracts only from source extensions or old
prompt history.

## Local VS Code development layout

When this repository is opened for local development with the VS Code Codex plugin, assume it is a
gitignored subdirectory inside a separate Quartz template checkout. Move one directory upward when
Quartz context is required. That parent supplies Quartz source and `docs/`; it has its own
`AGENTS.md` and `.github` prompt files.

The nested plugin exists there only to give the agent simultaneous context. It is not the parent's
installed plugin source.

Allowed writes are:

- every path inside this plugin repository; and
- the parent Quartz repository's `content/` directory, only when a test fixture or explicit content
  verification requires it.

Do not edit the parent's Quartz source, docs, configuration, loader, CLI, package files, plugin
cache, lockfile, or other paths. Preserve unrelated work in both repositories.

## Plugin injection

Do not inject this nested checkout into the parent as a local plugin. The parent is responsible for
running Quartz's normal `npx quartz plugin` commands, downloading the newest remote revision, and
updating its own lockfile. The nested checkout's location does not authorize junctions, symlinks,
cache overlays, or manual cache replacement.

Use isolated temporary Quartz workspaces for destructive install tests and configuration variants.
The durable three-book content lab is the only intended parent-content exception; its contract is
in [the compatibility fixture reference](../reference/compatibility-fixture.md).

## Change discipline

Inspect scoped status and diffs before editing and before committing. Do not overwrite concurrent
user or agent changes. Keep source, tests, public types, manifest metadata, dependency declarations,
license notices, and committed `dist/` synchronized whenever a code change affects them.

Do not bump a version, tag, create a release, publish to npm, submit to a marketplace, or push the
parent repository without separate user authorization.
