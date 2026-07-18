# Prompt 05 — Final requirement audit and handoff

Do not treat this prompt as a summary exercise. Re-open the active user goal, both prompt contracts,
current diffs, generated package, parent fixture, rendered pages, pushed revision, and CI. For every
box, cite authoritative current-state evidence in `IMPLEMENTATION-NOTES.md`; absence of an observed
failure is not proof.

## External-plugin and topology invariant

- [ ] No file that exists in Quartz upstream was modified, moved, reformatted, mode-changed, or used
      to hold compatibility logic. Allowed parent changes are confined to `content/` and its DOX.
- [ ] `Alternative Landing Page Design.make` remains ignored/untracked/unpacked and no generated Make
      application code was copied.
- [ ] `RootIndexPanelsPage` still owns only the physical root at priority 100 and supplies one
      `RootIndexPanels` body through layout key `content`/default frame.
- [ ] `quartz.components` contains exactly `RootIndexSidebar`, with left default position and frozen
      priority. `RootIndexPanels` remains publicly exported but is absent from manifest discovery.
- [ ] Fresh CLI add/enable inserts one sidebar layout entry and renders exactly one `.rip` body; remove
      is clean. No loader/CLI patch, manual body layout stanza, junction, or cache overlay is involved.

## Existing book/appearance regressions

- [ ] Every non-superseded `topic-appearance` final-review item passes: physical/listed inventory,
      destinations, counts, sorting, metadata, cards/list, icons/accents, i18n, injection defense,
      keyboard/SPA behavior, package bundling, and watch-boundary documentation.
- [ ] Panel and sidebar book lists share normalized `excludeDirs`, `descriptionFallback`, `sort`, and
      `tagCount` inventory inputs and produce the same eligibility, ordering, title, destination,
      icon, and accent data without mutating/rescanning input incorrectly.
- [ ] Sidebar cache variants include all four normalized inventory inputs; equivalent variants reuse
      safely and distinct variants never cross-contaminate results.
- [ ] Canvas/Bases provenance/count behavior matches the frozen physical model or a deliberate,
      documented pre-implementation contract revision—not fixture assumptions.
- [ ] Canvas/Bases `<book>/index` collisions cannot prove a book destination; root and sidebar reject
      the same noncanonical slugs and revoked metadata/options without throwing.

## Authored root and overview

- [ ] Authored transformed root content is visible exactly once in standard safe article/Markdown
      wrappers and precedes overview/browse/panels.
- [ ] Root TOC, reading time, text/Search, RSS, sitemap, and social behavior is no longer suppressed by
      this Page Type; shared file/tree objects are not mutated.
- [ ] Directory count, total notes, last-updated/no-date behavior, localized labels/date, semantic
      structure, and `#rip-directories` browse link are exact.
- [ ] Empty/non-empty HAST, cards/list, empty books, long content, CSS classes, callouts,
      transclusions, tables, styles/scripts, light/dark, forced colors, and reduced motion are tested.

## Navigation shell

- [ ] Home/root-note/tags/404/unrecognized contexts and eligible book/descendant contexts select the
      exact frozen switcher/explorer view.
- [ ] Root notes, selected-book descendants, unlisted/drafts, duplicates, folder destinations,
      current page/ancestors, sort, casing, long titles, spaces, Unicode, and malformed input all
      match Prompt 01.
- [ ] Switcher/folders use native disclosure/list/link semantics, core operation needs no JS, current
      links have correct `aria-current`, and every URL uses public relative path resolution.
- [ ] Desktop, tablet, and mobile behavior is usable with keyboard, pointer, touch, no-JS, SPA,
      200%/400% zoom, screen-reader names, forced colors, and reduced motion; no focus trap/hidden
      focusable content exists.
- [ ] Closing the native sidebar shell on mobile and widening to tablet/desktop exposes its content
      despite the retained closed state; the hidden narrow-only summary cannot strand navigation.
- [ ] Tablet/mobile grid CSS matches only the default frame whose direct `#quartz-body` contains a
      direct `.left.sidebar > .rip-sidebar`, replaces only intrinsic `auto` track sizing with
      `minmax(0, ...)`, preserves grid areas/order, and does not match Canvas/custom frames.
- [ ] Mobile left CSS matches only `.left.sidebar:has(> .rip-sidebar)`, applies only the frozen
      width/wrap containment properties, and leaves every sibling host component visible.
- [ ] `replaceExplorer` normalizes to true by default; its selector hides only a direct stock Explorer
      beside an opted-in sidebar. False and unrelated/nested Explorer cases remain visible.
- [ ] CSS/script review finds exactly the three permitted host-selector kinds and no
      suppression/mutation of Search, PageTitle, toolbar components, right slot, Graph, TOC,
      Backlinks, Canvas/custom frames, or other unrelated plugins; Explorer is the only suppression.

## Right Graph and plugin interoperability

- [ ] Graph is enabled/right-positioned in the isolated integration host and appears in generated DOM
      on root plus representative notes. Tablet/mobile styles keep it in Quartz responsive flow.
- [ ] Cross-book fixture links produce normal Graph/Backlinks relationships; no code partitions the
      graph by book.
- [ ] PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, ContentMeta, NoteProperties, TOC, Graph,
      Backlinks, Footer, FolderPage, TagPage, Canvas, Bases, encryption, aliases, RSS, sitemap, and
      social output have concrete passing fixture observations or an accurately scoped configured-off
      note.
- [ ] Root → book → nested note → other book → root SPA navigation has correct shell/current state,
      no duplicate listeners/components, no broken network/console output, and valid Back/Forward use.

## Durable content lab

- [ ] JavaScript Basics, Git Practice, and SQL Pocketbook are the only deliberate compatibility-lab
      books and each has a physical index, distinct safe icon/accent, concise technical content,
      cross-links, and stable sentinels.
- [ ] Every feature row in Prompt 03 maps to a real specimen and an expected result in the manual
      checklist; all local links/assets resolve in the clean build.
- [ ] Root sentinel and all three book/Search sentinels are visible where expected; negative controls
      are absent where expected; encryption credentials are fake/public.
- [ ] Clean-build observed card/stat counts agree with content DOX/checklist and the plugin's physical
      listed-page semantics.
- [ ] Durable fixture files remain in `content/`; only isolated temporary integration work was removed.

## Package, integration, and hosting gates

- [ ] `npm ci`, changed-file formatting, `npm run check`, `npm run build`, dist/package verifiers,
      integration/watch tests, dry-run pack, and `git diff --check` pass with exact recorded output.
- [ ] Generated `dist/`, declarations, maps/resources, manifest, lockfile, exports, side effects,
      notices, package allowlist, validators, CI, README, examples, architecture, changelog, and DOX
      describe the same implementation.
- [ ] Packed imports work without ancestor dependencies; all generated JS entries have only intended
      externals and no accidentally bundled singleton. Both panel/sidebar runtime exports and option
      types work through every public entry.
- [ ] Root and deep links/resources pass under base-path/subdirectory hosting such as
      `/quartz-for-gitlab/`, with SPA on/off. No GitLab-specific path branch exists.
- [ ] Watch add/change/delete behavior is honestly recorded and a clean/full build proves root
      panels, overview, and sidebar aggregate correctness afterward.

## Commit, push, CI, and release boundary

- [ ] Nested status/diff contains the complete intentional change and no `.make`, cache, tarball,
      screenshot, secret, parent content, or unrelated user/agent edit.
- [ ] The nested plugin commit is pushed; exact final hash and green GitHub CI run are recorded.
- [ ] A clean stock-shaped host remotely adds/enables that exact pushed revision and passes the
      rendered body/sidebar/Graph/base-path checks; its lock records the same hash.
- [ ] Parent status is reported separately. No parent GitLab push occurred without authorization.
- [ ] No version-only bump, tag, release, npm publish, or marketplace side effect occurred.

## DOX closeout

- [ ] Re-read the applicable DOX chain for every changed path after edits.
- [ ] Update the plugin DOX for the sidebar manifest topology, visible root source, Explorer option,
      right-slot boundary, and relevant verification gates.
- [ ] Update the content DOX/checklist for actual fixture ownership/counts and refresh every affected
      Child DOX Index.
- [ ] Remove stale/contradictory rules instead of appending history; preserve the old prompt notes as
      explicitly labelled evidence.
- [ ] List documents intentionally unchanged and why.

## Final response

Lead with the achieved user-visible result and the exact pushed plugin revision. Then report:

1. authored root/overview behavior;
2. sidebar/Explorer replacement and responsive/accessibility behavior;
3. always-present right Graph and cross-plugin evidence;
4. the three content books and observed counts/feature matrix;
5. exact local, integration, browser, package, CI, and fresh remote-install results;
6. files/status grouped by nested plugin, generated output, parent content/DOX, and untouched upstream;
7. known partial-watch limitation and any other remaining caveat;
8. explicit no-release/no-unauthorized-parent-push statement.

Do not declare the goal complete until every applicable box is proven by current evidence. If one is
missing or contradicted, continue implementation/testing rather than narrowing the objective.
