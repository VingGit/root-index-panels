# Prompt 01 — Verify current Quartz behavior and freeze the navigation-shell contract

## Objective

Reconfirm the public APIs and repository facts below in the implementation session. Record exact
revisions and baseline results in `IMPLEMENTATION-NOTES.md`. Do not treat an existing partial edit as
proof, and do not edit source until every decision gate in this prompt is satisfied.

## Required inspection

### Contracts and design evidence

- Re-read the root and nested `AGENTS.md` chain and both prompt-set READMEs.
- Inspect the ignored local `Alternative Landing Page Design.make` archive sufficiently to identify
  the final desktop shell, selector, Explorer hierarchy, landing overview, directory cards, right
  rail, and any interaction/responsive intent. Confirm `git check-ignore` still matches it.
- Compare the current live/reference render and a local clean build, but distinguish their installed
  plugin commits before attributing a visual defect to current source.
- Inspect the current Quartz docs for plugins, component creation, configuration, layout/page frames,
  paths, SPA lifecycle, accessibility conventions, and CLI plugin add/enable/remove workflows.
- Inspect the relevant current Quartz source: Page Type dispatcher/layout resolution, default frame,
  component registry/loader, manifest types, config layout loader, CLI add/enable/remove handlers,
  render pipeline, path utilities, and the installed public type/utility declarations.
- Inspect CanvasPage/BasesPage generated `fileData` provenance and canonical slugs, CanvasFrame's
  exact left-sidebar DOM, and stock Breadcrumbs output on root/book/nested routes. Treat rendered
  host output—not source-file extensions alone—as the navigation evidence.
- Recheck the upstream `quartz-community/plugin-template` at a recorded commit, especially manifest,
  export, bundling, test, CI, documentation, and release conventions.

### Plugin and fixture state

- Inspect all source/components/styles/scripts/types/tests/build scripts and public barrels.
- Inspect `package.json`, lockfile, tsup config, CI, README, architecture, examples, changelog, notice,
  committed `dist/`, and package allowlist.
- Inspect current parent `content/`, its nearest DOX contract, configured plugins, expected counts,
  stable sentinels, cross-book links, and manual checklist.
- Capture scoped `git status` in the parent and nested repositories before editing. Preserve unrelated
  and concurrent work.

Run `npm ci`, `npm run check`, and `npm run build` as baseline evidence. Run a clean parent build and
inspect root plus representative book HTML before assuming current behavior.

## Frozen package topology

Keep these public roles distinct:

```text
RootIndexPanelsPage (Page Type factory)
└── body: RootIndexPanels (public advanced component, not manifest-declared)

RootIndexSidebar (public layout component)
└── the only key under package.json#quartz.components
```

- Keep categories `pageType` and `component`.
- `quartz.components` contains exactly `RootIndexSidebar`, with complete metadata,
  `defaultPosition: "left"`, and `defaultPriority: 40`. This places it after the host's priority-35
  toolbar group and before the stock priority-50 Explorer in the current default layout.
- `RootIndexPanels` stays exported from package root and `./components`, but is absent from
  `quartz.components`. The Page Type directly imports/constructs it.
- Export `RootIndexSidebar` and `RootIndexSidebarOptions` from the package root and `./components`.
- Extend the shared plugin options with `replaceExplorer?: boolean`; normalize it to `true` unless an
  actual boolean is provided. `RootIndexSidebarOptions` may alias the shared options. Pass the
  normalized `excludeDirs`, `descriptionFallback`, `sort`, and `tagCount` values into sidebar book
  collection, and use the shared normalized icon/accent options when rendering, so cards and
  navigation cannot drift.
- Add `replaceExplorer: true` to manifest defaults and an accurate boolean `configSchema` entry.
- A fresh CLI add must write one plugin entry with one `layout` declaration for the sidebar. The
  manifest component order cannot be used to smuggle in a second component.
- Add/enable/remove behavior must work through stock `npx quartz plugin` commands; no CLI/loader
  patch, postinstall rewrite, junction, or undocumented cache mutation is permitted.

## Frozen Page Type and root-body contract

- Preserve the physical-root match, priority `100`, Page Type name, and `layout: "content"`.
- Keep the host `default` frame. Do not add/export/register a custom frame.
- Remove the root transform that deletes `toc`, `readingTime`, and `text`. Do not mutate or clone
  shared `fileData` solely to suppress authored root metadata.
- Render `tree` once with `htmlToJsx` from the public `@quartz-community/utils/jsx` entry point.
  Match the public Content Page wrapper: `article.popover-hint` and a child
  `.markdown-preview-view.markdown-rendered`, including safe frontmatter `cssclasses` behavior.
- Render no authored article wrapper only when the transformed tree is genuinely empty; never infer
  emptiness from missing `text` alone.
- The visible Page Type body order is overview/browse banner first, authored article second, and
  directory heading/list third. Quartz-owned PageTitle/ContentMeta remain outside the plugin body.
- Use one stable directory heading ID, `rip-directories`; the browse link is `#rip-directories`.
- Reuse one collected/resolved book array within the root body for panels and overview. The sidebar
  is a separately rendered Quartz component, so it may collect once for its own render/cache through
  the same collector and normalized inventory inputs; require equivalent results and ordering, not
  impossible cross-component array identity.

### Overview calculations

- `directoryCount = renderedBooks.length`.
- `totalNoteCount = sum(renderedBooks[*].docCount)` using safe integer addition and the frozen book
  model. Do not include root notes, book landing indexes, excluded/unlisted entries, or virtual-only
  pages that the existing book contract excludes.
- `lastUpdated = max(finite renderedBooks[*].date)`. Omit its entire item if none is finite.
- Format the date deterministically with `Intl.DateTimeFormat` selected from `cfg.locale`, falling
  back to `en-US`; freeze timezone behavior in tests so CI and local output agree.
- Extend plugin-owned `en-US` and `fi-FI` catalogs with directory-count singular/plural, total-notes,
  last-updated, browse, selector, switch-manual, selected-manual, localized Home fallback,
  Explorer/navigation, Overview, and empty-navigation strings. Keep all existing note-count/empty
  strings backward compatible and unsupported locales per-render fallback.
- Statistics are a semantic list/region with readable labels and values. Do not encode meaning only
  in icons, color, tooltip, or CSS-generated content.

## Frozen sidebar data model

Use the same eligible books and appearance resolution as the root panels. Navigation inventory is a
separate view over `allFiles` and must not change `docCount`.

- Normalize the sidebar inventory boundary with the shared option normalizer and pass exactly
  `excludeDirs`, `descriptionFallback`, `sort`, and `tagCount` to `collectBooks`. Do not hard-code an
  alphabetical sidebar or a second set of fallback values.
- If the immutable navigation model is cached, key it by `allFiles` identity plus all four normalized
  inventory values. Equivalent normalized inputs may reuse a model; different excludes, fallback,
  sort, or tag-count variants must never reuse one another's model.

### Context selection

- Normalize the current `fileData.slug` into path segments without decoding/re-encoding authored
  names manually.
- If the first segment exactly matches an eligible book, select book context; otherwise select root
  context. `index`, root notes, `tags/**`, `404`, and unrelated virtual namespaces are root context.
- Capture the authored title from the first listed physical record whose canonical slug is exactly
  `index`. Ignore accessor-backed title properties and use localized `Home` only when no safe authored
  title exists. A book label uses its authored/fallback title and resolved safe icon/accent.
- The selector popup contains the root manual once, a divider, and every eligible book once in the
  same configured sort order as the panels. Expose selected context through exactly one
  `data-rip-selected` item, check icon, and hidden selected-status label. Use
  `aria-current="page"` only for an exact current destination, never merely because its book is the
  active context.

### Explorer inventory

- Root Explorer includes listed physical root notes and safe generated Canvas/Base leaves with
  exactly one slug segment, except `index`.
- Book explorer includes listed physical descendants and safe generated Canvas/Base leaves of the
  selected book, excluding its own `<book>/index` landing from the descendant tree. Render that
  landing separately as the first `Overview` link so the book remains directly reachable.
- Deduplicate full slugs first occurrence wins, matching the book collector's defensive model.
- Unlisted/encrypted-as-unlisted entries, `tags`, excluded books, root entries in book mode, and all
  other books are absent.
- Preserve each admitted document's authored title; use a safe segment/file fallback only when
  absent.
- Build directory nodes from descendant segments. A generated FolderPage index may prove a folder
  destination, but must not create a note or count. Do not expose a broken folder link when no
  destination exists.
- Admit a generated Canvas/Base record only as a typed leaf when top-level `unlisted !== true`, it
  owns exactly one matching `canvasData`/`basesData` marker, and its canonical slug ends in lower-case
  `.canvas`/`.base`. Reject inherited/accessor-backed, ambiguous, mismatched, and suffix-invalid
  records without executing authored accessors; a physical canonical-slug collision wins.
- Generated leaves never create/prove an eligible book, alter its physical count/order, or supply a
  folder Overview destination/title. They may originate structural folder containers only to expose
  their nested path inside an already-eligible book.
- Sort folders and document leaves deterministically with locale-independent stable tie-breakers.
  Render distinct ordinary-note, Canvas, and Base icons and freeze the chosen folder-first/title
  order in tests.

### Markup and destinations

- Use a labelled `<nav>` and nested `<ul>/<li>` lists. Use `<details>/<summary>` for the selector and
  nested folder disclosure; do not recreate listbox/tree ARIA roles.
- Every destination is an ordinary `<a>`. No clickable `div`, nested anchor/button, positive
  `tabindex`, or required custom keyboard handling.
- Mark only the exact current page link with `aria-current="page"`; selection state is separate.
  Mark disclosure state through native `open` semantics. Open every first-level folder in server
  output and open a deeper folder only when it is on the current ancestor chain.
- Resolve root (`index`), book (`<segment>/index`), notes, and valid folders with public Quartz path
  helpers relative to the current slug. Assert root, nested, dotted, spaced, Unicode, and
  base-path/subdirectory-hosted output.
- Give stable `rip-*` hooks only; never place raw accent values or unsafe path/title text in class
  names, IDs, selectors, or data attributes.

## Explorer replacement contract

- The rendered sidebar carries `data-rip-replace-explorer="true"` only when normalized
  `replaceExplorer` is true.
- Each frame-specific direct-sibling variant must require all of:
  1. the exact Quartz default `.left.sidebar` or CanvasFrame `.canvas-sidebar` ancestry;
  2. a direct `RootIndexSidebar` marker with that explicit data attribute; and
  3. a direct stock `.explorer` child target.
- Use separate variants rooted at
  `.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer` and
  `.page[data-frame="canvas"] > #quartz-body > .center.canvas-frame > .canvas-sidebar:has(...) > .explorer`.
- Do not hide `.explorer` outside those exact sibling contexts, do not target generic navigation, and
  do not use JavaScript/DOM mutation to disable Explorer.
- `replaceExplorer: false` emits no true attribute and leaves Explorer's display/behavior untouched
  in both frames.
- Document the current `:has()`/Quartz markup compatibility assumption and test both option states.
  If the current supported-browser policy cannot satisfy it, stop and revise the contract rather
  than broadening the selector.

## Book-root breadcrumb contract

- On a default-frame route whose direct `RootIndexSidebar` has `data-rip-scope="book"`, hide only the
  non-only first `.breadcrumb-element` in the stock Breadcrumbs container. Quartz's next existing
  element already carries the resolved book title and link to the book root, so it becomes the first
  visible breadcrumb.
- Do not reconstruct breadcrumb data/markup or suppress the Breadcrumbs component. Root-context
  routes retain stock Home behavior, and PageTitle plus the manual switcher retain true-root access.
- This behavior is CSS-only and must not select Canvas/custom frames, the right rail, Graph, TOC,
  Backlinks, or unrelated navigation.

## Host components and right Graph invariant

- Search, PageTitle, toolbar components, before/after-body components, Footer, and right components
  remain independent host entries. The sidebar must not import their packages or duplicate their
  behavior.
- Plugin CSS may style `rip-*` content and use exactly four kinds of narrowly scoped behavioral host
  selector:
  1. default-frame `#quartz-body` grid containment gated by a direct
     `.left.sidebar > .rip-sidebar` descendant;
  2. direct-plugin mobile left-container width/wrap containment; and
  3. frame-specific default/Canvas direct Explorer sibling replacement; and
  4. default-frame eligible-book breadcrumb-root promotion.
- Repeated breakpoint variants and the two Explorer frame variants do not create additional kinds.
  Explorer replacement is the only whole-component suppression; breadcrumb promotion may hide only
  the redundant first Home element. CSS must not select `.right`, `.graph`, `.toc`, `.backlinks`,
  `.search`, `.page-title`, toolbar controls, or unrelated custom frames.
- Plugin scripts must not query, move, clone, hide, or attach handlers to those components.
- The integration fixture keeps Graph enabled at `position: right` with `display: all` behavior and
  no content/root override clearing it. Generated root and book-note DOM must contain Graph under the
  right slot.
- Tablet/mobile visual location follows Quartz's documented default frame. Never use plugin CSS to
  remove Graph for narrow widths.

## SPA, responsive, and accessibility contract

- Useful root and sidebar HTML is server-rendered. All core links/disclosures work without JS.
- The selector's optional inline enhancement initializes on Quartz navigation events, registers
  cleanup with `window.addCleanup`, avoids duplicate listeners, and scopes queries to each
  `.rip-sidebar`. It closes on outside `pointerdown`, selected-link activation, and Escape; Escape
  restores focus to the controlling summary and opening one selector closes another. Preserve native
  link interception. No additional client framework or Motion dependency.
- Use Quartz breakpoint variables/conventions where public bundling supports them; otherwise mirror
  the documented mobile/desktop values once and record the compatibility dependency.
- Desktop/tablet show the navigation in the left column. Mobile exposes it as a compact native
  disclosure in Quartz's horizontal left-sidebar flow without fixed desktop widths or overflow.
- Because that native summary is hidden outside the mobile layout, closing the shell on mobile and
  widening must expose its content again through plugin-local CSS; no reader may be stranded with a
  closed `<details>` and no visible reopening control.
- At tablet/mobile breakpoints, the permitted grid adjustment is
  `.page[data-frame="default"]:has(> #quartz-body > .left.sidebar > .rip-sidebar) > #quartz-body`.
  It may replace only intrinsic `auto` track sizes with shrinkable `minmax(0, ...)` tracks: preserve
  the host's two-track tablet structure and use one `minmax(0, 1fr)` track on mobile. It must preserve
  grid areas/order and must not select a right-rail child or match Canvas/custom frames.
- At the mobile breakpoint, `.left.sidebar:has(> .rip-sidebar)` may set only
  `min-width: 0`, `width: 100%`, `max-width: 100%`, `flex-wrap: wrap`, and
  `overflow-wrap: anywhere`. It must require the direct plugin marker, must not hide siblings, and
  does not weaken the Explorer section's one-cross-plugin-suppression rule.
- Focus indicators use host/system colors, survive forced colors and custom accents, and are not
  removed. Reduced motion removes nonessential lift/slide/scroll animation.
- The popup is absolutely positioned and opaque, remains inside the viewport, and causes no Explorer
  layout shift. While open, the visually covered Explorer scope must be hidden from interaction and
  focus as well as sight; closing restores it.
- Verify keyboard-only selector/folder operation, focus order, focus restoration after SPA
  navigation, 200%/400% zoom/reflow, touch target sizing, long/Unicode labels, screen-reader names,
  and hidden-state focusability.

## Follow-up appearance contract — 2026-07-18

The Make card interaction is exact rather than impressionistic:

- card `::before`: `radial-gradient(ellipse 120% 80% at 50% 0%, <safe accent at 8%>, transparent 70%)`;
- card `::after`: one-pixel horizontal gradient `transparent → accent at 50% → transparent`;
- both layers transition opacity from `0` to `1` over `300ms` on hover and keyboard focus within;
- the card lifts by two pixels when motion is allowed;
- the old accent border and title-color hover are absent;
- reduced-motion and forced-colors modes retain usable focus/state feedback without depending on
  the decorative effect.

## Durable fixture contract

- Keep `javascript-basics`, `git-practice`, and `sql-pocketbook` as the three showcase books, each
  with physical `index.md`, title, description, tags/aliases/dates, and distinct safe
  `panel.icon`/`panel.accent` values recorded in Prompt 00.
- Preserve the current physical/listed descendant counts—JavaScript Basics `8`, Git Practice `5`,
  and SQL Pocketbook `6`—until an intentional fixture edit updates the owning content DOX and manual
  checklist in the same change. Canvas/Bases virtual routes are not included in those values.
- Keep their prose technically accurate but concise. Every feature specimen states an expected
  visual/behavior result and includes a stable `FIXTURE-*` sentinel.
- Keep at least one nested path, spaces, Unicode, cross-book links, backlinks, TOC-positive and
  TOC-negative pages, Search tokens, transclusion, callout, table, code, math, Mermaid, local asset,
  alias, unlisted/draft negative control, encrypted listed/unlisted control, Canvas, and Bases view.
- Keep `sql-pocketbook/manual-test-checklist.md` as the human test matrix and update it whenever a
  specimen or expected book count changes.
- The fixture is intentionally persistent; do not remove it during integration cleanup. Temporary
  config/content variants still belong in isolated workspaces.
- Before freezing expected card/stat counts, inspect actual clean-build `allFiles` provenance. The
  existing physical/listed contract wins over an optimistic fixture count. Reconcile the owning
  content DOX and checklist in the same change.

## Decision gate

Before Prompt 02, fill the baseline/decision sections of `IMPLEMENTATION-NOTES.md` and confirm:

- current loader and CLI behavior supports exactly one manifest sidebar insertion;
- public `htmlToJsx` and path APIs are installed and compatible;
- both `replaceExplorer` frame variants and the breadcrumb-root selector are sufficiently narrow for
  current Quartz/browser support;
- navigation cache variants cover the four normalized inventory options without cross-contamination;
- browser measurements prove the default-frame grid and direct-plugin mobile width/wrap rules remove
  tablet/mobile horizontal overflow without suppressing host components or matching custom frames;
- selector measurements prove the popup causes no Explorer layout shift, stays in the viewport, and
  its covered underlay cannot receive pointer or keyboard focus while open;
- root and book route output proves authored-root labeling, selected-versus-current semantics,
  first `Overview`, first-level-open/deeper-active disclosure behavior, and mutually disjoint scoped
  Explorer inventories;
- root/side navigation data has unambiguous physical/listed/virtual provenance, generated Canvas/Base
  leaves have distinct icons, and they do not create/prove/inflate the physical book model;
- CanvasFrame output proves `replaceExplorer: true` suppresses only its direct duplicate Explorer and
  false preserves it; default-frame book Breadcrumbs begin at the existing book-root link while root
  context remains unchanged;
- Graph remains a host right-slot component on root and book notes;
- expected fixture counts match a clean build and the frozen book model;
- no upstream file edit is required.

If any item fails, revise this prompt with the user before implementation. Do not patch Quartz core,
weaken the no-duplicate guarantee, or silently change the book model.
