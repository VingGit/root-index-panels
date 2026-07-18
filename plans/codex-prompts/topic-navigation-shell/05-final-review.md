# Prompt 05 — Final requirement audit and handoff

Do not treat this prompt as a summary exercise. Re-open the active user goal, both prompt contracts,
current diffs, generated package, parent fixture, rendered pages, pushed revision, and CI. For every
box, cite authoritative current-state evidence in `IMPLEMENTATION-NOTES.md`; absence of an observed
failure is not proof.

## External-plugin and topology invariant

- [x] No file that exists in Quartz upstream outside the explicit disposable-`content/` fixture
      exception was modified, moved, reformatted, mode-changed, or used to hold compatibility logic.
      Parent-owned changes are confined to the allowed `content/` fixtures and DOX plus new
      non-upstream reusable plugin guidance under `.github/`.
- [x] `Alternative Landing Page Design.make` remains ignored/untracked, was not unpacked into either
      repository, and contributed no copied generated Make application code.
- [x] `RootIndexPanelsPage` still owns only the physical root at priority 100 and supplies one
      `RootIndexPanels` body through layout key `content`/default frame.
- [x] `quartz.components` contains exactly `RootIndexSidebar`, with left default position and frozen
      priority. `RootIndexPanels` remains publicly exported but is absent from manifest discovery.
- [x] Fresh CLI add/enable inserts one sidebar layout entry and renders exactly one `.rip` body; remove
      is clean. No loader/CLI patch, manual body layout stanza, junction, or cache overlay is involved.

## Existing book/appearance regressions

- [x] Every non-superseded `topic-appearance` final-review item passes: physical/listed inventory,
      destinations, counts, sorting, metadata, cards/list, icons/accents, i18n, injection defense,
      keyboard/SPA behavior, package bundling, and watch-boundary documentation.
- [x] Panel and sidebar book lists share normalized `excludeDirs`, `descriptionFallback`, `sort`, and
      `tagCount` inventory inputs and produce the same eligibility, ordering, title, destination,
      icon, and accent data without mutating/rescanning input incorrectly.
- [x] Sidebar cache variants include all four normalized inventory inputs; equivalent variants reuse
      safely and distinct variants never cross-contaminate results.
- [x] Canvas/Bases provenance/count behavior matches the frozen physical model or a deliberate,
      documented pre-implementation contract revision—not fixture assumptions.
- [x] Canvas/Bases `<book>/index` collisions cannot prove a book destination; root and sidebar reject
      the same noncanonical slugs and revoked metadata/options without throwing.

## Authored root and overview

- [x] The overview/browse banner is the first direct child of the plugin Page Type body. Authored
      transformed root content is visible exactly once after it in standard safe article/Markdown
      wrappers and before the directory collection; host PageTitle/ContentMeta remain host-owned.
- [x] Root TOC, reading time, text/Search, RSS, sitemap, and social behavior is no longer suppressed by
      this Page Type; shared file/tree objects are not mutated.
- [x] Directory count, total notes, last-updated/no-date behavior, localized labels/date, semantic
      structure, and `#rip-directories` browse link are exact.
- [x] Empty/non-empty HAST, cards/list, empty books, long content, CSS classes, callouts,
      transclusions, tables, styles/scripts, light/dark, forced colors, and reduced motion are tested.

## Navigation shell

- [x] Root/root-note/tags/404/unrecognized contexts and eligible book/descendant contexts select the
      exact frozen selector/Explorer view; the root label comes from authored physical `index` title
      data with a localized Home fallback.
- [x] Root notes, selected-book descendants, unlisted/drafts, duplicates, folder destinations,
      current page/ancestors, sort, casing, long titles, spaces, Unicode, and malformed input all
      match Prompt 01.
- [x] Selector/folders use native disclosure/list/link semantics, core operation needs no JS,
      selected context is independent from exact `aria-current`, each book begins with `Overview`,
      first-level/deeper disclosure defaults are correct, and every URL uses public relative path
      resolution.
- [x] Desktop, tablet, and mobile behavior is usable with keyboard, pointer, touch, no-JS, SPA,
      200%/400% zoom, screen-reader names, forced colors, and reduced motion; no focus trap/hidden
      focusable content exists.
- [x] Closing the native sidebar shell on mobile and widening to tablet/desktop exposes its content
      despite the retained closed state; the hidden narrow-only summary cannot strand navigation.
- [x] Tablet/mobile grid CSS matches only the default frame whose direct `#quartz-body` contains a
      direct `.left.sidebar > .rip-sidebar`, replaces only intrinsic `auto` track sizing with
      `minmax(0, ...)`, preserves grid areas/order, and does not match Canvas/custom frames.
- [x] Mobile left CSS matches only `.left.sidebar:has(> .rip-sidebar)`, applies only the frozen
      width/wrap containment properties, and leaves every sibling host component visible.
- [x] `replaceExplorer` normalizes to true by default; its selector hides only a direct stock Explorer
      beside an opted-in sidebar. False and unrelated/nested Explorer cases remain visible.
- [x] CSS/script review finds exactly the three permitted host-selector kinds and no
      suppression/mutation of Search, PageTitle, toolbar components, right slot, Graph, TOC,
      Backlinks, Canvas/custom frames, or other unrelated plugins; Explorer is the only suppression.
- [x] The absolute selector popup causes no Explorer layout shift, stays inside the viewport, and
      disables the visually covered Explorer scope while open. Outside pointer and selected-link
      activation close it; Escape closes and restores summary focus; SPA cleanup prevents duplicates.
- [x] Cards use the frozen Make radial wash, accent-centered bottom hairline, `300ms` opacity,
      focus-visible parity, and allowed two-pixel lift. The superseded accent border/title hover is
      absent, with reduced-motion and forced-colors fallbacks retained.

## Right Graph and plugin interoperability

- [x] Graph is enabled/right-positioned in the isolated integration host and appears in generated DOM
      on root plus representative notes. Tablet/mobile styles keep it in Quartz responsive flow.
- [x] Cross-book fixture links produce normal Graph/Backlinks relationships; no code partitions the
      graph by book.
- [x] PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, ContentMeta, NoteProperties, TOC, Graph,
      Backlinks, Footer, FolderPage, TagPage, Canvas, Bases, encryption, aliases, RSS, sitemap, and
      social output have concrete passing fixture observations or an accurately scoped configured-off
      note.
- [x] Live root → book → root SPA navigation and Back/Forward keep correct selector/current state with
      no duplicate listeners/components or browser errors; component/integration route coverage
      proves the nested-note and other-book states use the same model.

## Durable content lab

- [x] JavaScript Basics, Git Practice, and SQL Pocketbook are the only deliberate compatibility-lab
      books and each has a physical index, distinct safe icon/accent, concise technical content,
      cross-links, and stable sentinels.
- [x] Every feature row in Prompt 03 maps to a real specimen and an expected result in the manual
      checklist; all local links/assets resolve in the clean build.
- [x] Root sentinel and all three book/Search sentinels are visible where expected; negative controls
      are absent where expected; encryption credentials are fake/public.
- [x] Clean-build observed card/stat counts agree with content DOX/checklist and the plugin's physical
      listed-page semantics.
- [x] Durable fixture files remain in `content/`; no temporary integration/audit artifact entered
      either repository or package. Explicitly preserved browser/audit evidence remains cleanup-only
      under system temporary directories because recursive cleanup was tool-policy blocked.

## Package, integration, and hosting gates

- [x] `npm ci`, changed-file formatting, `npm run check`, `npm run build`, dist/package verifiers,
      integration/watch tests, dry-run pack, and `git diff --check` pass with exact recorded output.
- [x] Generated `dist/`, declarations, maps/resources, manifest, lockfile, exports, side effects,
      notices, package allowlist, validators, CI, README, examples, architecture, changelog, and DOX
      describe the same implementation.
- [x] Packed imports work without ancestor dependencies; all generated JS entries have only intended
      externals and no accidentally bundled singleton. Both panel/sidebar runtime exports and option
      types work through every public entry.
- [x] Root and deep links/resources pass under base-path/subdirectory hosting such as
      `/quartz-for-gitlab/`, with SPA on/off. No GitLab-specific path branch exists.
- [x] Watch add/change/delete behavior is honestly recorded and a clean/full build proves root
      panels, overview, and sidebar aggregate correctness afterward.

## Commit, push, CI, and release boundary

- [x] The prior navigation-shell implementation revision was pushed and remotely verified as
      recorded in `IMPLEMENTATION-NOTES.md`; that evidence remains historical baseline context.
- [ ] The 2026-07-18 design-alignment follow-up status/diff contains the complete intentional change
      and no `.make`, cache, tarball,
      screenshot, secret, parent content, or unrelated user/agent edit.
- [ ] The follow-up implementation commit is pushed; its exact hash and green GitHub CI run are
      recorded externally (the containing commit hash cannot be self-recorded).
- [ ] A clean stock-shaped host remotely adds/enables that exact pushed follow-up revision and passes
      the rendered body/sidebar/Graph/subdirectory-path checks; its lock records the same hash.
- [x] Parent status is reported separately. No parent GitLab push occurred without authorization.
- [x] No version-only bump, tag, release, npm publish, or marketplace side effect occurred.

## DOX closeout

- [x] Re-read the applicable DOX chain for every changed path after edits.
- [x] Update the plugin DOX for the sidebar manifest topology, visible root source, Explorer option,
      right-slot boundary, and relevant verification gates.
- [x] Update the content DOX/checklist for actual fixture ownership/counts and refresh every affected
      Child DOX Index.
- [x] Remove stale/contradictory rules instead of appending history; preserve the old prompt notes as
      explicitly labelled evidence.
- [x] List documents intentionally unchanged and why.

## Final response

Lead with the achieved user-visible result and the exact pushed plugin revision. Then report:

1. banner-first overview and authored-root behavior;
2. sidebar/Explorer replacement and responsive/accessibility behavior;
3. always-present right Graph and cross-plugin evidence;
4. the three content books and observed counts/feature matrix;
5. exact local, integration, browser, package, CI, and fresh remote-install results;
6. files/status grouped by nested plugin, generated output, parent content/DOX, and untouched upstream;
7. known partial-watch limitation and any other remaining caveat;
8. explicit no-release/no-unauthorized-parent-push statement.

Do not declare the goal complete until every applicable box is proven by current evidence. If one is
missing or contradicted, continue implementation/testing rather than narrowing the objective.
