# Codex prompt set — navigation shell, authored root, and compatibility books

This is the active implementation contract for
`@quartz-community/root-index-panels`. It extends the completed
[`topic-appearance`](../topic-appearance/README.md) work with a route-aware book navigation
component, visible authored root content, landing-page overview controls, and a durable parent
Quartz compatibility fixture. The 2026-07-18 design-alignment follow-up in this set supersedes the
original root-order, selector-label, book-overview, disclosure-default, and card-hover details.
The active Canvas/Bases navigation correction further supersedes the physical-only sidebar-leaf,
default-frame-only Explorer replacement, three-selector, and untouched-Breadcrumbs details. Earlier
completed checklists remain historical evidence only; the unchecked corrective audit in Prompt 05
must pass before this increment is complete.

Prompt 01 is the authoritative technical contract for this increment. The appearance prompt set
remains authoritative for book discovery/counting, destinations, panel icons/accents, option
normalization, localization, packaging, and its recorded watch limitation unless this set explicitly
supersedes a boundary.

## Source-of-truth order

When evidence disagrees, use this order and record the resolution before source edits:

1. The active user goal and the applicable `AGENTS.md` chain.
2. The parent repository's current Quartz 5 docs, source, loader, installed public types, and actual
   `npx quartz plugin` behavior.
3. This prompt set, then the non-superseded `topic-appearance` contract.
4. The plugin's current source, manifest, tests, generated `dist/`, and public documentation.
5. The upstream Quartz community plugin template at a recorded commit.
6. The ignored local `Alternative Landing Page Design.make` archive as design and interaction
   evidence. Do not copy its generated React/Tailwind/Motion implementation into the plugin.

Use **base-path/subdirectory hosting compatibility** for deployment beneath a path such as
`/quartz-for-gitlab/`. This is not GitLab-specific behavior.

## Run order

1. [Product boundary and guardrails](./00-brief-and-guardrails.md)
2. [Discovery and frozen contract](./01-discovery-and-contract.md)
3. [Implementation sequence](./02-implementation.md)
4. [Tests, fixture, accessibility, and visual review](./03-tests-fixture-and-accessibility.md)
5. [Documentation, packaging, integration, and push](./04-documentation-integration-and-push.md)
6. [Final audit and handoff](./05-final-review.md)

Record inspected revisions, baseline results, decisions, and final evidence in
[`IMPLEMENTATION-NOTES.md`](./IMPLEMENTATION-NOTES.md). Do not silently improvise around a frozen
contract item.

## Scope summary

- Keep `RootIndexPanelsPage` as the root Page Type and `RootIndexPanels` as its body.
- Render the calculated overview/browse banner as the first direct child of the plugin root body,
  then authored root Markdown, then the existing cards/list directory panels. Host PageTitle and
  ContentMeta remain outside and before the plugin body in Quartz's default frame.
- Add one plugin-owned left layout component, `RootIndexSidebar`, containing an authored-root/book
  popup selector and a route-scoped Explorer tree.
- Derive sidebar books through the same normalized `excludeDirs`, `descriptionFallback`, `sort`, and
  `tagCount` inventory inputs as panels; isolate cached variants by those values and `allFiles`
  identity.
- Declare only `RootIndexSidebar` in `quartz.components`; keep `RootIndexPanels` exported for the
  Page Type/advanced API but omit it from manifest component discovery.
- Let a fresh `npx quartz plugin add` insert the one left component. It must never insert the Page
  Type body into a layout slot or produce a duplicate `.rip` body.
- Keep Quartz's default frame and right layout slot. Graph remains rendered on root and note pages,
  including responsive layouts; the plugin must not clear, hide, replace, or restyle the right slot.
- Preserve host PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, Table of Contents, Backlinks,
  Footer, and other independently installed components. `RootIndexSidebar` replaces the navigation
  role of stock Explorer. Exactly five kinds of narrowly scoped behavioral host selector are
  permitted: default-frame `#quartz-body` grid-track containment gated by a direct
  `.left.sidebar > .rip-sidebar` descendant at tablet/mobile breakpoints; direct-plugin mobile
  left-container width/wrap containment; frame-specific direct Explorer sibling replacement for
  default and Canvas frames; direct-plugin Canvas-frame border-box containment; and default-frame
  eligible-book breadcrumb-root promotion. `replaceExplorer` defaults to `true`; `false` preserves
  Explorer in both frames. Default-frame structural containment may not select the right rail or
  custom frames; Canvas containment may not target stage/container/controls/transforms. No script may
  mutate Explorer or Breadcrumbs. Explorer replacement is the only whole-component suppression;
  breadcrumb promotion hides only the redundant first Home crumb.
- Keep book/card eligibility, physical counts, and book ordering listed-physical only. Scoped
  navigation additionally admits a generated Canvas/Base leaf only with its own matching provenance
  marker, canonical lower-case suffix, and non-unlisted state. These leaves use distinct icons and
  never create/prove a book, inflate counts/order, or supply a folder Overview; structural folder
  containers are allowed only to represent their nested path inside an already-eligible book.
- Keep all compatibility logic inside the external plugin. Never patch Quartz core or any upstream
  file. The only parent-worktree write allowance is the user's disposable/persistent fixture work
  under `content/` and its owning DOX documentation.
- Keep three observable fixture books—JavaScript Basics, Git Practice, and SQL Pocketbook—with
  distinct safe icon/accent frontmatter and a systematic cross-plugin test matrix.
- Match the Make card interaction exactly: a subtle accent radial glow, an accent-centered bottom
  hairline, focus-visible parity, and a two-pixel lift—without the old accent border/title hover.

## Definition of done

- Every frozen behavior in Prompt 01 is implemented and evidenced, not inferred.
- Desktop, tablet, and mobile navigation work with keyboard, pointer, touch, no-JS links, SPA
  navigation, reduced motion, forced colors, long labels, Unicode, popup light-dismiss/focus
  restoration, narrow-closed-to-wide resizing, and base-path/subdirectory hosting.
- Root Markdown remains visible and drives normal Quartz TOC, reading-time, Search, RSS, sitemap,
  and social metadata behavior; statistics and browse UI are accurate and accessible.
- The right Graph component remains present on root and book notes and can show cross-book edges.
- Safe Canvas/Base pages appear in their root/book navigation scope with distinct icons; opted-in
  Canvas pages do not show a duplicate stock Explorer below the plugin sidebar.
- Default-frame book breadcrumbs begin with Quartz's existing book-title/book-root link rather than
  redundant Home, while root-context breadcrumbs and true-root PageTitle/switcher access remain.
- The three durable fixture books exercise configured Quartz features and contain an observable
  expected-results checklist with stable sentinels.
- Unit, DOM, package, real-host, clean-install, watch, browser, accessibility, and remote-pin gates
  pass. The pushed nested-plugin commit and CI revision are recorded.
- `dist/`, manifest, declarations, docs, examples, architecture, changelog, tests, and DOX contracts
  agree. No release, tag, npm publish, or marketplace action occurs without separate authorization.

The user has authorized commits and pushes from the nested plugin repository during this goal.
That permission does not authorize pushing the parent GitLab repository or publishing a release.
