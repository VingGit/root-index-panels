# Prompt 04 — Document, package, and integrate without releasing

> [!note]
> Historical appearance documentation/release gate. Keep its packaging and no-release rules, but
> the active [`topic-navigation-shell`](../topic-navigation-shell/README.md) contract supersedes
> the no-layout-stanza, hidden-root-source, and remove-all-parent-fixtures instructions.

## Objective

Make the book model and appearance feature understandable to writers, YAML users, TypeScript site owners, theme authors, and future maintainers. Finish prebuilt package and parent Quartz integration work, but keep release actions outside this increment.

## Public documentation

### README

Document three distinct configuration surfaces without mixing them:

1. **Writer frontmatter:** complete `panel.icon`/`panel.accent` YAML on `<book>/index.md`; accepted values, exact fallback, and no inferred topic mapping.
2. **Site YAML:** every YAML-safe option with type/default/precedence, including the shallow replacement behavior of map options. Do not claim function/TUI support that the loader cannot provide.
3. **TypeScript-only aliases:** a compilable `quartz.ts` example that calls `ExternalPlugin.RootIndexPanelsPage(...)` before `loadQuartzConfig()`, then exports the normally loaded config/layout. Explain that `RootIndexPanels(...)` is the advanced component constructor, not the normal Page Type override.

Also document:

- the exact physical/listed book/count/date-sort model, reserved `tags`, explicit/generated index destination requirement, omission of candidates with no destination, root `content/index.md` prerequisite, and canonical directory links;
- every versioned built-in icon name and alias-first collision behavior;
- the exact direct-color grammar, `theme`, named registry values, invalid-input fallback, and preference for token-backed values across light/dark themes;
- plugin-owned `en-US`/`fi-FI` catalogs and unsupported-locale fallback;
- cards/list behavior, stable scoped hooks, theme ownership, decorative icon contract, focus independence, and inline custom property's CSP implication;
- host layout ownership and warning not to manually add the component when the Page Type is enabled;
- normal installation with no plugin `layout` stanza, plus the reason the manifest intentionally has no default component position;
- the hidden-root-source policy: TOC and reading time are suppressed in the rendered root frame, while Search/RSS/sitemap/OG can still consume root Markdown; recommend metadata-only root content when that distinction is unwanted;
- the partial-watch limitation and clean/full-build workaround.

### Examples and architecture

- Update `EXAMPLES.md` with copyable writer, YAML-safe, and `quartz.ts` examples. This repository already uses it as the usage-pattern document, so the update is required.
- Update `ARCHITECTURE.md` for physical-versus-virtual aggregation, metadata/destination rules, option normalization, resolver/icon/i18n modules, public exports, dependency bundling, SPA lifecycle, and watch invalidation boundary.
- Add an `Unreleased` `CHANGELOG.md` entry covering correctness fixes, optional appearance, localization, accessibility/motion, public API, dependency/license, and documented limitation.
- Update the nearest `AGENTS.md` only for durable contracts/workflow/structure that actually changed; remove stale statements rather than appending history.

## Package and prebuilt output

- Keep the current version during unreleased implementation. Do not bump only to make changed files look release-ready.
- Ensure `package.json`, `package-lock.json`, `quartz` manifest defaults/schema/component metadata, exports, side effects, package allowlist, and third-party notice agree.
- Generate `dist/` with the repository build; never hand-edit it. Commit all changed JavaScript, declarations, maps/assets that the established build owns.
- Prove the package installs from its packed/GitHub form without source or undeclared runtime modules.
- Review CI against the current plugin-template guidance and add only checks that enforce this package's actual contracts.

## Parent Quartz/GitLab integration

1. Switch the ignored cache from remote to local with `quartz plugin remove root-index-panels` followed by `quartz plugin add ./root-index-panels`; preserve options, remove any generated layout stanza, and confirm the lock reports `commit: "local"`. Never junction the nested repository over a remotely locked cache.
2. Use isolated fixture content/config and restore/remove it after verification; do not leave sample metadata in the user's notes.
3. Run the host scenarios in Prompt 03, including SPA modes, locale variants, and base-path/subdirectory-hosted output.
4. Once the goal-mode authorization is active, the nested plugin may be committed and pushed for integration. Switch back with remove/add against the remote source, refresh `quartz.lock.json` to the exact pushed commit, and verify from a clean-shaped install if parent consumption is in scope; otherwise report that the parent remains pinned to the previous revision.
5. Keep nested plugin history and parent history/status separate in the handoff.

## Release boundary

This prompt does not authorize a version bump, Git tag, GitHub release, npm publish, or marketplace submission. A later release task must:

- choose the semantic version from the final change set;
- synchronize `package.version`, `quartz.version`, component metadata version, lockfile, changelog, and tag;
- rerun all package/host checks from the release commit;
- publish/tag only after explicit authorization.

## Acceptance criteria

A writer can copy one YAML block; a YAML-only site owner understands available safe options; a TypeScript owner can register a custom icon against the correct factory; a theme author knows the stable hooks and accessibility boundary; a maintainer understands virtual pages/watch invalidation/bundling; the packed prebuilt and real base-path/subdirectory-hosted build are verified; and no release side effect occurred.
