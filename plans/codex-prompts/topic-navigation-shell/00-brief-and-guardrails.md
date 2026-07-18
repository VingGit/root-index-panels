# Prompt 00 — Product boundary and non-negotiable guardrails

## Product goal

Turn the existing multi-book root Page Type into a coherent Quartz-native knowledge-base shell:

1. The root landing page shows authored Markdown, useful aggregate context, and the established
   first-level-book panels.
2. A left navigation component lets readers switch between Home and books, then browse only the
   root-note or current-book hierarchy.
3. The rest of Quartz continues to behave normally, especially Search and the always-present right
   Graph slot.
4. Three small technical books remain in `content/` as an observable compatibility laboratory.

Functional fidelity to the local Figma Make source matters more than exact pixel measurements. Keep
the icon tiles, restrained accents, compact hierarchy, switcher, explorer label, useful landing-page
context, and responsive behavior. Spacing, card column counts, and glow radius may follow Quartz
tokens and robust CSS rather than literal prototype values.

## Ownership boundary

- Every implementation and compatibility change belongs in `root-index-panels/`.
- Do not modify Quartz core, its loader, CLI, built-in/community plugin cache, configuration,
  package manifests, docs, or upstream sample files.
- The active user allowance permits parent changes only under `content/` for this compatibility
  fixture, including its nearest `AGENTS.md` when DOX requires it.
- Use isolated/temporary Quartz fixtures for configuration variants and destructive install tests.
- Keep `Alternative Landing Page Design.make` ignored. Read it as local design evidence; do not add,
  copy, publish, or expose its conversation history/metadata.
- Do not copy generated Figma Make React, Tailwind, Motion, or application scaffolding. Implement
  Preact/SCSS/inline-script code through Quartz's documented external-plugin APIs.

## Component and manifest topology

The plugin has two distinct rendering roles:

- `RootIndexPanelsPage` owns the physical root page and supplies `RootIndexPanels` as the Page Type
  body.
- `RootIndexSidebar` is the only manifest-discoverable layout component. It has
  `defaultPosition: "left"` and an intentional priority recorded in Prompt 01.

`RootIndexPanels` remains a public advanced constructor, but it must not appear in
`quartz.components`. A fresh CLI add therefore creates one left-layout declaration for the sidebar
and cannot insert a second body. Do not add a second manifest component, custom Quartz frame, or
manual Page Type body layout registration.

## Host-shell composition

- Keep the Quartz `default` frame and the Page Type's existing `layout: "content"` key unless the
  Prompt 01 discovery gate proves a public-API reason to revise the contract before source edits.
- Do not reimplement Search, PageTitle, Darkmode, ReaderMode, Breadcrumbs, Table of Contents,
  Backlinks, Graph, or Footer. Compose with their normal layout entries.
- `RootIndexSidebar` intentionally replaces the stock Explorer navigation role. Because Quartz's
  installer cannot remove another plugin entry, `replaceExplorer` defaults to `true`: narrowly
  scoped component CSS may hide only a direct stock `.explorer` in the same left sidebar when the
  rendered sidebar carries an explicit opt-in data attribute. Do not mutate Explorer DOM, intercept
  its scripts, hide any other component, or use an unscoped `.explorer` selector.
- `replaceExplorer: false` must leave stock Explorer visible for users who deliberately want both.
  Document the selector's dependency on current Quartz default-frame/Explorer markup.
- Never clear, replace, hide, reposition, or style the right layout slot. With Graph enabled at
  `position: right`, it remains rendered on root and book notes. On tablet/mobile, "always visible"
  means present in Quartz's responsive document flow, not permanently fixed onscreen.
- A default-frame grid-track containment rule may resize `#quartz-body` tracks without selecting the
  right slot. It must be gated by a direct `.left.sidebar > .rip-sidebar` descendant, preserve grid
  areas/order, use `minmax(0, ...)` only at tablet/mobile breakpoints, and never match CanvasPage or
  another custom frame.
- Cross-book links remain normal Quartz links. Graph and Backlinks may show cross-book relationships.

## Authored root and overview

The root body renders in this order:

1. the transformed authored `content/index.md` HAST using Quartz's public HAST-to-JSX utility and
   standard `article.popover-hint > .markdown-preview-view.markdown-rendered` structure;
2. an overview region with calculated book count, total note count, and last-updated value when one
   exists;
3. an accessible local "Browse directories" link targeting the directory-section heading;
4. the existing cards/list book collection.

Preserve root `toc`, `readingTime`, and `text`; remove the appearance increment's root-only deletion
transform. Host TOC, ContentMeta, Search, RSS, sitemap, and social metadata may consume the authored
root exactly as on a normal content page. Do not render raw Markdown, use `dangerouslySetInnerHTML`,
or duplicate the root article.

Overview semantics:

- directory count is the number of rendered eligible books after exclusions/destination checks;
- total notes is the sum of those books' existing `docCount` values, preserving the frozen physical
  listed-page model;
- last updated is the newest valid aggregate book date already used by date sorting; omit the stat
  when no book has a valid date rather than inventing one;
- formatting and labels are localized through the plugin catalog, with unsupported locales falling
  back to `en-US`;
- the browse control is a real anchor to a stable heading ID, works without JavaScript, and never
  uses a hard-coded origin/base path.

## Navigation model

- The switcher is semantic native HTML, progressively enhanced at most. Home and every eligible
  book are ordinary links; core navigation works with JavaScript disabled and Quartz SPA enabled.
- Home/root context applies to `index`, listed root notes, tags, 404, and paths whose first segment is
  not an eligible book. Its explorer lists only listed physical root notes, excluding `index`.
- Book context applies when the current slug begins with an eligible first segment. The selected
  switcher label uses that book's resolved title/accent/icon; the explorer lists only that book's
  navigable descendants and does not repeat other books.
- Build sidebar books through the same collector and the same normalized `excludeDirs`,
  `descriptionFallback`, `sort`, and `tagCount` inventory options as the panels. The two independently
  rendered components need equivalent results and ordering, not shared array identity.
- Deduplicate by canonical slug. Exclude unlisted content and the reserved `tags` namespace. Preserve
  authored titles; use the established fallback only when a title is absent.
- Build nested semantic lists from path segments. Use native disclosure for nested directories,
  open the current ancestry on initial render, and mark only the current page link with
  `aria-current="page"`.
- Resolve every Home, book, note, and folder destination with public Quartz path helpers relative to
  the current slug. Never concatenate origin-relative `/book/...` URLs.
- Server-render useful navigation. Client code may close disclosures or restore focus during SPA
  navigation, but must not fetch/reconstruct the content index or become necessary for links.

## Responsive and inclusive interaction

- Follow Quartz breakpoints and default-frame flow for desktop, tablet, and mobile. Do not reproduce
  the Make prototype's fixed-width overflow.
- At narrow widths, expose the navigation through a native disclosure/toggle with a clear accessible
  name and a usable touch target. Hidden content must leave neither focusable nor audible remnants.
- Keep DOM order, focus order, and visual order aligned. Do not add keyboard traps or application
  arrow-key semantics to native links/disclosures.
- Support long titles, long descriptions, Unicode paths, zoom/reflow, forced colors, light/dark
  themes, coarse pointers, and `prefers-reduced-motion`.
- Accent color is decorative and never the only current/focus/expanded indicator.
- Scope plugin markup/classes under `rip-*`, except exactly three narrowly scoped host-selector
  kinds: the default-frame grid containment above; mobile
  `.left.sidebar:has(> .rip-sidebar)` width/wrap containment; and direct opted-in Explorer sibling
  replacement. The mobile left rule may set only `min-width`, `width`, `max-width`, `flex-wrap`, and
  `overflow-wrap` for viewport containment. Explorer replacement remains the only selector allowed
  to suppress another plugin and must require the explicit `rip-sidebar` marker/data attribute.

## Durable compatibility fixture

Keep exactly these showcase books as the deliberate three-book lab unless a discovered collision
requires a recorded rename:

- `content/javascript-basics/` — `code-2`, blue accent;
- `content/git-practice/` — `git-branch`, orange accent;
- `content/sql-pocketbook/` — `database`, teal accent.

They use short, accurate technical prose whose primary purpose is systematic verification. Together
they cover configured Markdown, links, transclusions, metadata, Search, TOC, Graph, Backlinks,
aliases, visibility, encryption, Canvas, Bases, assets, paths, responsive behavior, and cross-book
edges. Keep a manual checklist and stable `FIXTURE-*` sentinels.

The fixture does not redefine book counts. Canvas/Bases virtual pages remain testable destinations
but do not inflate the frozen physical/listed `docCount` unless Prompt 01 records new public host
evidence and revises both contracts before implementation.

## Known limitation and release boundary

The documented Quartz partial-watch invalidation gap remains: nested changes can leave root/sidebar
aggregates stale until a clean/full build. Reproduce it and prove clean-build correctness; do not
patch Quartz core.

The nested plugin may be committed and pushed during this goal. Do not bump versions solely for the
increment, tag, publish to npm, create a release, or submit to a marketplace without separate user
authorization.
