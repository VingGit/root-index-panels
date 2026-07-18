# Prompt 04 — Document, package, integrate, commit, and push without releasing

## Objective

Make the new shell understandable to writers, site owners, theme authors, installers, and future
maintainers; ship reproducible prebuilt output; verify the exact pushed revision through stock Quartz
commands. Keep the parent upstream boundary and no-release boundary intact.

## Public README

Update the README around real user workflows, not internal file names alone.

### Installation and layout

- Show stock `npx quartz plugin add`, `enable`, `disable`, `remove`, and upgrade/source-switch flows as
  supported by the current CLI.
- Explain that a fresh add inserts `RootIndexSidebar` at left because it is the one manifest component;
  the Page Type body is not a layout component and renders once.
- Explain `replaceExplorer: true` default, its zero-config replacement purpose, the narrowly scoped
  CSS/`:has()` dependency on current Quartz default-frame/CanvasFrame/Explorer markup, and the `false`
  opt-out that preserves Explorer in both frames.
- State that no other left component is hidden. PageTitle, Search, Darkmode, ReaderMode, and toolbar
  composition stay host-owned.
- State that Graph remains a normal right component and is intentionally not isolated per book.
  Cross-book edges are supported. Do not claim this plugin installs Graph if it does not.
- Show how the right Graph entry remains enabled/positioned in ordinary Quartz configuration, but do
  not require or instruct an agent to patch this template's upstream file.

### Writer/root behavior

- Document the calculated statistics/browse banner as the first plugin-body content, followed by
  visible authored `content/index.md` prose and panels. Clarify that Quartz PageTitle/ContentMeta stay
  before the plugin body, and remove the obsolete recommendation that root content be metadata-only.
- Define exact directory/total-note/last-updated calculations and the no-date behavior.
- Retain the complete physical/listed book, destination, count, sort, watch, icon/accent, locale, and
  security contracts from the appearance documentation.
- Show the three fixture book index frontmatter blocks as copyable examples of distinct icon/accent
  customization; distinguish built-in icon names from TypeScript-only custom component aliases.

### Navigation and hosting

- Define authored-root versus recognized-book context, root/book document inventories, safe generated
  Canvas/Base leaves and their distinct icons, the book `Overview` link, first-level-open/deeper-active
  folder defaults, selected-context versus exact `aria-current` state, and `replaceExplorer`
  behavior. Document localized Home only as the root-title fallback.
- Explain native/progressive interaction, no-JS links, SPA behavior, absolute popup/no-layout-shift
  behavior, covered-underlay focus protection, outside/Escape light-dismiss with focus restoration,
  desktop/tablet/mobile flow, and accessibility/reduced-motion/forced-colors guarantees, including
  why a mobile-collapsed native shell remains visible after widening past its hidden-summary
  breakpoint.
- Explain that sidebar book ordering/eligibility inherits normalized `excludeDirs`,
  `descriptionFallback`, `sort`, and `tagCount` inventory inputs from the panel model, while generated
  Canvas/Base leaves never create/prove/inflate that listed-physical book model or provide folder
  Overviews. Document exactly five host-selector kinds separately: default-frame/direct-plugin-gated
  grid-track containment at tablet/mobile breakpoints, mobile left-container width/wrap containment,
  frame-specific default/Canvas direct Explorer sibling suppression, direct-plugin Canvas-frame
  border-box containment, and default-frame book-root breadcrumb promotion. State that Explorer
  replacement is the only whole-component suppression, Canvas containment does not target its stage,
  container, controls, or transforms, breadcrumb promotion hides only the redundant first Home
  element, and no rule targets the right rail, Graph, TOC, Backlinks, or unrelated custom frames.
- Use **base-path/subdirectory hosting compatibility** consistently. Give `/quartz-for-gitlab/` as an
  example and explain that public Quartz path resolution—not GitLab-specific logic—keeps links valid.
- Document Canvas/Bases as distinctly iconed scoped-navigation destinations without claiming they are
  physical book/card/count/order inputs. Explain the own-provenance/canonical-suffix/non-unlisted
  admission boundary and structural-folder-without-Overview distinction.
- Document that eligible default-frame book Breadcrumbs begin at Quartz's existing book-title/root
  link, while root routes retain stock behavior and PageTitle/manual selector retain true-root access.
- Document the card's Make-aligned radial glow, accent-centered bottom hairline, focus parity, and
  motion fallback; remove claims or screenshots that imply the superseded accent border/title hover.

## Examples, architecture, changelog, and maintainer docs

- Update `EXAMPLES.md` with:
  - three writer frontmatter examples;
  - YAML `replaceExplorer` true/false examples;
  - the existing named accents/defaults example;
  - TypeScript custom icon usage through the Page Type factory;
  - normal host layout composition showing Search left and Graph right without manual body placement.
- Update `ARCHITECTURE.md` for the two-role topology, one manifest component, shared normalized book
  inputs, navigation inventory/context tree and cache variants, public HAST rendering, overview
  calculations, browser-proven default-frame grid containment, mobile left width/wrap containment,
  default/Canvas Explorer selector coupling/opt-out, book-root breadcrumb promotion, typed
  Canvas/Base leaves, SPA/resource lifecycle, Graph non-ownership, base-path resolution, and watch
  invalidation boundary.
- Include the authored-root-title provenance, selected-versus-current semantics, `Overview`/folder
  defaults, sidebar inline-script lifecycle, popup underlay contract, root banner-first order, and
  exact Make glow in the relevant public/maintainer documents.
- Add an `Unreleased` changelog entry for authored root restoration, overview/browse UI, sidebar,
  default/Canvas Explorer replacement/opt-out, generated Canvas/Base navigation and icons, book-root
  Breadcrumbs, responsive/accessibility work, manifest/API changes, tests, and compatibility fixture.
  Do not invent a release date/version.
- Update third-party notices only if new bundled dependencies require it. Prefer existing public
  utilities/native HTML over adding dependencies.
- Update nearest DOX documents for actual durable topology/workflow/content-count changes. Remove
  stale statements that the manifest contains `RootIndexPanels`, has no positioned component, or
  suppresses root content.
- Keep both prompt sets: appearance is historical evidence; navigation-shell is the active delta.

## Package and generated output

- Keep the current package/plugin/component version synchronized; do not bump merely to represent an
  unreleased feature.
- Align package exports, manifest categories/defaults/schema/components, validators, lockfile,
  TypeScript declarations, tsup entries, side effects, package allowlist, CI, and notices.
- Generate every `dist/` file/source map through `npm run build`. Verify deterministic output on the
  current platform and CI; never hand-edit prebuilt artifacts.
- Prove packed and GitHub-prebuilt installs need no source, ancestor `node_modules`, undeclared
  runtime package, or core import.
- Confirm `Alternative Landing Page Design.make` remains ignored and absent from status, commits,
  tarball, source maps, and logs.

## Parent-worktree integration boundary

- Durable writes are limited to `content/` and its owning DOX contract. Do not edit parent
  `quartz.config.yaml`, `quartz.ts`, loader, CLI, built-in/community plugin sources, docs, package
  files, or other upstream paths.
- Exercise layout/config variants in an isolated copied/temporary Quartz fixture owned by the
  integration runner. Validate absolute targets before cleanup.
- Keep durable JavaScript/Git/SQL books and their manual checklist. Do not remove them after testing.
- Report parent content/DOX changes separately from nested-plugin changes and do not stage/commit/push
  unrelated or user-owned parent edits.

## Nested commit and push gate

The active user goal authorizes a nested-plugin push. Perform it only after local gates pass:

1. Review nested `git status`, diff, diff-stat, generated artifacts, ignored files, and secrets.
2. Separate unrelated/pre-existing edits or explicitly account for them; never overwrite another
   agent/user change.
3. Commit the source, tests, docs, plans/notes, manifest/lock/build config, DOX, and generated `dist/`
   that form one coherent implementation. Do not commit the `.make` archive, integration caches,
   tarballs, screenshots, or temporary fixtures.
4. Push the nested repository's intended branch to `VingGit/root-index-panels`.
5. Record the exact commit and GitHub CI run; wait for required CI to finish and fix failures rather
   than reporting only the local result.
6. In a clean isolated Quartz checkout, run stock remote `npx quartz plugin add`/`enable` against that
   exact commit, build, inspect root/sidebar/Graph/base-path output, and record the resolved lock hash.
7. If fixes are required, commit/push them and repeat the remote gate against the new final hash.

Do not update/push the parent GitLab repository unless separately authorized. Do not create a tag,
GitHub release, npm publication, or marketplace submission.

## Acceptance criteria

- A new user can install/enable the plugin normally and gets one left sidebar plus one root body.
- A writer understands visible root content and can customize each book safely.
- A site owner understands the authored-root/book selector, scoped Explorer and Overview behavior,
  typed Canvas/Base leaves/icons, default/Canvas Explorer replacement/opt-out, book-root Breadcrumbs,
  Search composition, always-present right Graph, cross-book edges, responsive behavior, and
  subdirectory hosting.
- A maintainer can trace data, layout, selector coupling, watch limitation, package artifacts, and
  tests from architecture/DOX without relying on chat history.
- The nested pushed commit, green CI, and exact remote fresh-install result are recorded; no release
  or unauthorized parent push occurred.
