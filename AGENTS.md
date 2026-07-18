# root-index-panels DOX

## Purpose

- Quartz 5 community plugin that presents eligible first-level content directories as books on the
  authored root page and provides route-scoped Home/book navigation in the left layout slot.
- This ignored nested Git working tree has its own `.git` directory and remote
  `https://github.com/VingGit/root-index-panels.git`.

## Ownership

- Owns all files under `root-index-panels/`, including generated `dist/` output and implementation
  prompt contracts.
- Keep nested plugin history/status separate from the parent repository; use the nested working tree
  for its commits and pushes.
- Keep source, tests, public docs, package metadata, and committed `dist/` aligned before pushing.

## Local Contracts

- `RootIndexPanelsPage` in `src/pageType.ts` owns only the physical root `index` at priority `100`,
  uses layout key `content` and the host default frame, and supplies `RootIndexPanels` as its body.
- `RootIndexPanels` renders transformed authored root HAST, semantic overview/browse UI, then the
  cards/list collection. Preserve root `toc`, `readingTime`, and `text`; never add a suppression
  transform or mutate shared render data.
- `package.json#quartz.components` declares exactly one component: `RootIndexSidebar` at left
  priority `40`. Keep `RootIndexPanels` publicly exported but outside manifest component discovery.
- `RootIndexSidebar` uses native SSR links/disclosures and scopes its tree to listed physical root
  notes or the current eligible book. Reuse the book collector's eligibility, order, destination,
  canonical-slug, title, icon, and accent contracts. Cache variants inherit normalized `excludeDirs`,
  `descriptionFallback`, `sort`, and `tagCount` inputs. A shell closed on mobile must expose its
  content again above the mobile breakpoint, where its summary is hidden.
- Exactly three kinds of narrowly scoped host selector are allowed:
  1. default-frame `#quartz-body` grid containment gated by a direct
     `.left.sidebar > .rip-sidebar` descendant, used at tablet/mobile breakpoints only to replace
     intrinsic `auto` tracks with `minmax(0, ...)` tracks;
  2. direct-plugin mobile `.left.sidebar:has(> .rip-sidebar)` width/wrap containment; and
  3. direct
     `.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer` replacement.
- Breakpoint variants of the grid rule remain one selector kind. Explorer is the only cross-plugin
  suppression. `replaceExplorer` defaults to `true`; `false` must leave Explorer untouched. Never
  use script/DOM mutation to suppress it.
- Never select, clear, hide, move, or style the right layout slot, Graph, or TOC. The grid rule may
  change only default-frame track sizing and must not match CanvasPage or any custom frame.
- Resolve every plugin destination with public Quartz path utilities. Treat hosting beneath a base
  path such as `/quartz-for-gitlab/` as general subdirectory hosting, not GitLab-specific behavior.
- Books/counts use listed physical records; virtual FolderPage indexes may prove destinations, while
  Canvas/Bases virtual records—including `<segment>/index` collisions—never prove, create, or inflate
  books. `dist/` remains committed for GitHub prebuilt installs.
- Declare optional peers used through public utility subpaths as direct dependencies. Distribution
  verification must reject dependency sources resolved from an ancestor `node_modules`, and bundled
  license notices must match the generated source-map closure.
- Keep every compatibility fix inside this plugin. Never modify a file that exists in official
  Quartz upstream; validate against stock Quartz through `npx quartz plugin` commands.

## Work Guidance

- Use `plans/codex-prompts/topic-navigation-shell/` as the active implementation contract and
  `topic-appearance/` for non-superseded book/appearance history.
- Treat the parent Quartz docs, source, installed public APIs, and real CLI behavior as authoritative
  when template examples conflict.
- Keep styles/scripts under `rip-*`, except the three documented structural selector kinds. The
  default-frame rule may only constrain grid tracks, the mobile left rule may only constrain
  width/wrapping, and the Explorer sibling rule is the only suppression. Sidebar navigation must
  work without JavaScript; panel `.inline.ts` lifecycle must clean up on SPA navigation.
- Define and test physical-versus-virtual data, `allFiles` cache identity, and partial-watch
  invalidation explicitly. Clean/full builds are authoritative.
- Do not bump versions, tag, release, publish, or submit to a marketplace without separate user
  authorization.

## Verification

- Run `npm run check` before committing package changes.
- Run `npm run build`, `npm run verify:dist`, and `npm run verify:package` after source/manifest or
  dependency changes; `verify:dist` must prove bundled sources are local. Commit regenerated `dist/`
  files. `verify:package` must exercise both panel and sidebar runtime/type exports.
- Run `npm run test:integration` after Page Type, sidebar, loader-facing manifest, routing, locale,
  appearance, Graph composition, base-path, or packaging changes. Temporary workspaces are removed
  unless `RIP_KEEP_INTEGRATION=1` is set.
- Run `npm run test:watch-integration` when changing aggregate/watch behavior or its documentation;
  stale partial-watch observations are acceptable only when a subsequent clean build corrects them.
- Validate unpublished work with stock `quartz plugin remove`, `add`, and `enable`; verify the lock
  and single left-layout stanza. Verify a pushed remote pin separately from any local cache.

## Child DOX Index

- `test/integration/AGENTS.md` — isolated real-Quartz fixture runners, safety boundaries, and host
  verification contracts.
