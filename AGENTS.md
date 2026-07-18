# root-index-panels DOX

## Purpose

- Quartz 5 community plugin that presents eligible first-level content directories as books on the
  authored root page and provides a root-manual/book selector with route-scoped Explorer navigation
  in the left layout slot.
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
- `RootIndexPanels` renders the semantic overview/browse UI first, transformed authored root HAST
  second, then the cards/list collection. Preserve root `toc`, `readingTime`, and `text`; never add a
  suppression transform or mutate shared render data.
- `package.json#quartz.components` declares exactly one component: `RootIndexSidebar` at left
  priority `40`. Keep `RootIndexPanels` publicly exported but outside manifest component discovery.
- `RootIndexSidebar` uses native SSR links/disclosures. Its selector labels the root manual from the
  physical root index's authored title, with localized Home fallback, and lists that root plus every
  eligible book in an absolute popup. Selected-manual state is separate from exact-page
  `aria-current`; the scoped Explorer shows only listed physical root notes or the current eligible
  book, places the book Overview first, opens top-level folders by default, and otherwise opens only
  current ancestry. Reuse the book collector's eligibility, order, destination, canonical-slug,
  title, icon, and accent contracts. Cache variants inherit normalized `excludeDirs`,
  `descriptionFallback`, `sort`, and `tagCount` inputs. A shell closed on mobile must expose its
  content again above the mobile breakpoint, where its summary is hidden.
- The sidebar's native selector and links remain complete without JavaScript. Its inline script may
  add only light-dismiss behavior: one open selector, outside-pointer and switcher-link close, and
  Escape close with focus restoration. It must initialize on Quartz `nav` and tear down through
  `window.addCleanup`.
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
  work without JavaScript; both panel and sidebar `.inline.ts` lifecycles must clean up on SPA
  navigation.
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
- For sidebar popup or card-interaction changes, also verify a real browser at desktop, tablet, and
  mobile widths: menu overlay without Explorer reflow, outside/Escape close and focus restoration,
  book-scoped Explorer state, card hover/focus glow, right-rail preservation, and no horizontal
  overflow.
- Run `npm run test:watch-integration` when changing aggregate/watch behavior or its documentation;
  stale partial-watch observations are acceptable only when a subsequent clean build corrects them.
- Validate unpublished work with stock `quartz plugin remove`, `add`, and `enable`; verify the lock
  and single left-layout stanza. Verify a pushed remote pin separately from any local cache.

## Child DOX Index

- `test/integration/AGENTS.md` — isolated real-Quartz fixture runners, safety boundaries, and host
  verification contracts.
