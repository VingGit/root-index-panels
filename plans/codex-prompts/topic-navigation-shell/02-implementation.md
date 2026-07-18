# Prompt 02 — Implement the authored root and navigation shell in reviewable layers

## Objective

Implement Prompt 01 without regressing the completed book/appearance increment. Keep every change in
the external plugin except the explicitly allowed `content/` fixture. Use small modules, public Quartz
APIs, and observable tests; do not solve integration by editing core or copying Figma application
code.

## Phase A — Lock regressions and shared data

1. Add failing tests for the new manifest topology, overview/article/directory order, sidebar contexts,
   typed Canvas/Base leaves and icons, both frame-specific Explorer variants/opt-out, book-root
   breadcrumbs, native markup, path resolution, and Graph-safe resource scoping before changing the
   corresponding behavior.
2. Extend runtime normalization with `replaceExplorer`, preserving every existing option default and
   invalid-input fallback.
3. Reuse the existing one-pass book collector and appearance resolvers. Pass the sidebar the same
   normalized `excludeDirs`, `descriptionFallback`, `sort`, and `tagCount` inventory values as the
   panels. Extract only focused shared helpers needed by both components; do not create a second
   definition of eligibility, metadata, dates, titles, links, icons, or accents.
4. Add a separate navigation inventory helper that receives `allFiles` plus normalized inventory
   inputs and returns an immutable/render-ready root/book model with nested nodes. Select the active
   scope from that model and the current slug. Keep both operations free of DOM, Preact, and
   host-private imports so they are exhaustively unit-testable.
   - Preserve listed-physical book/card eligibility, counts, and ordering inputs.
   - Admit a generated Canvas/Base document leaf only with its own matching provenance marker,
     canonical lower-case suffix, and non-unlisted state. Prefer physical slug collisions and reject
     ambiguous/inherited/accessor/mismatched records without executing them.
   - Allow structural folders only to represent a typed leaf's nested path in an already-eligible
     book; the virtual record cannot create/prove a book, change counts/order, or supply a folder
     Overview destination/title.
5. Cache immutable navigation models only by `allFiles` identity plus all four normalized inventory
   values. Equivalent normalized variants may reuse a model; distinct variants must remain isolated.
6. Treat all `fileData`/frontmatter objects as unknown and use the existing own-property defensive
   style. Malformed entries fail softly and never alter another entry.

## Phase B — Restore authored root and add overview

1. Remove the Page Type tree transform that deletes root TOC/reading-time/text data. Preserve root
   matching, priority, layout key, frame, and closure-captured options.
2. Render the transformed root tree through `@quartz-community/utils/jsx` with the standard Content
   Page article/classes and safe `cssclasses` handling.
3. Calculate statistics from the same rendered book entries. Render the overview/browse banner as
   the first direct child of the plugin Page Type body. Use semantic list/region markup, localized
   labels, deterministic date formatting, and omit only an unavailable date item.
4. Render the article exactly once after the banner and before the directory collection. Empty trees
   must not create a meaningless article, while non-empty
   callouts/transclusions/tables/styles/scripts must survive the public utility's conversions.
5. Put the localized browse anchor in the banner and retain the stable `rip-directories` section
   heading. Keep it functional without JavaScript and visible under keyboard focus.
6. Preserve cards and list modes, empty state, panel keyboard navigation, descriptions, counts, tags,
   icon/accent precedence, and existing class hooks unless Prompt 01 explicitly changes their wrapper.

## Phase C — Build `RootIndexSidebar`

1. Add a public Quartz component constructor with the shared normalized options.
2. Server-render:
   - a native root-manual/book selector whose root label comes from authored physical `index` title
     data and falls back safely to localized Home;
   - an uppercase/localized explorer label or equivalent semantic heading;
   - root-document navigation or the selected book's `Overview` plus nested descendant navigation,
     including safe generated Canvas/Base leaves;
   - selected-context, exact-current-page, and current-ancestor state as separate concepts.
3. Resolve all links relative to `fileData.slug` using public Quartz utilities. Folder disclosures are
   native and folder links appear only when a valid emitted destination is known.
4. Reuse panel icon/accent resolution for selected-book and selector decoration. Add distinct
   ordinary-note, Canvas, and Base leaf glyphs. Keep SVG decorative, non-focusable, and free of nested
   interactions; keep accents out of critical state indicators.
5. Emit `data-rip-replace-explorer="true"` only for normalized opt-in. Add separate exact, frame-gated
   direct-Explorer sibling variants for default `.left.sidebar` and Canvas `.canvas-sidebar`, with a
   `false` path that suppresses neither.
6. Add responsive styles for Quartz desktop/tablet/mobile flow, native mobile disclosure, an
   absolute/opaque selector popup, long labels, scrolling, touch, zoom, light/dark, forced colors,
   reduced motion, and print as appropriate. Opening the popup must not shift the Explorer, and its
   visually covered Explorer underlay must not remain pointer- or keyboard-interactive. Add
   the exact default-frame/direct-plugin-gated `#quartz-body` selector from Prompt 01 to replace only
   intrinsic `auto` tracks with `minmax(0, ...)` tracks at tablet/mobile breakpoints. On mobile,
   scope the separate `.left.sidebar:has(> .rip-sidebar)` width/wrap declarations exactly as frozen
   in Prompt 01. Neither structural rule may hide/restyle siblings or select the right rail/custom
   frames. Add a plugin-local wide-breakpoint fallback that displays shell content when a mobile
   collapse leaves the native `<details>` closed after resizing and its summary is hidden.
7. Add the exact default-frame eligible-book breadcrumb selector from Prompt 01. Hide only the
   non-only first stock Home element so Quartz's existing book-title/book-root link becomes first;
   keep root-context behavior and true-root PageTitle/manual-selector access unchanged.
8. Add only the small selector enhancement needed for light-dismiss: outside `pointerdown`, selected
   link, Escape with summary-focus restoration, and one-open-selector behavior. Follow Quartz
   `nav`/`window.addCleanup` lifecycle conventions and prove no-JS functionality first; never
   reconstruct navigation, rewrite Breadcrumbs, or touch host components.

## Phase D — Manifest, public API, and build graph

- Replace the manifest's `RootIndexPanels` component entry with exactly `RootIndexSidebar`.
- Add full sidebar metadata, `defaultPosition: left`, frozen priority, and version alignment.
- Add `replaceExplorer: true` to default options and boolean schema. Keep arbitrary/function map
  schema limitations from the appearance contract accurate.
- Export sidebar constructor/type from source barrels and all intended declaration entry points.
- Keep `RootIndexPanels` exported even though it is not manifest-discoverable.
- Update manifest validation to reject:
  - missing/multiple component entries;
  - any manifest `RootIndexPanels` entry;
  - wrong sidebar default position/priority;
  - missing/malformed `replaceExplorer` default/schema;
  - stale metadata versions.
- Ensure SCSS/inline scripts are declared side effects/resources as required by the existing build.
  Preserve singleton externals and current runtime bundling/license rules.
- Generate `dist/` only with the repository build after source/tests/docs are ready. Never hand-edit it.

## Phase E — Durable three-book compatibility fixture

Within the allowed parent `content/` subtree:

1. Complete the JavaScript Basics, Git Practice, and SQL Pocketbook indexes with distinct panel
   metadata and short topic introductions.
2. Complete the systematic feature specimens and stable sentinels from Prompt 01. Prefer cross-book
   links so Graph and Backlinks expose realistic relationships.
3. Make `content/index.md` itself a visible root-rendering specimen with headings, ordinary prose, a
   Quartz-flavored construct, an internal link, and a root sentinel. Do not replace its purpose with
   generated statistics text.
4. Keep negative controls safe: drafts/unlisted pages must not leak; encryption passwords are fake and
   documented; local assets contain no sensitive data; no remote test dependency is required.
5. Reconcile the checklist and nearest content DOX with clean-build observed counts. Do not count
   Canvas/Bases merely because their source files exist on disk or their safe generated routes appear
   as scoped-navigation leaves.

## Phase F — Styling and integration polish

- Compare root, left navigation, cards/list, and right rail to the Make evidence at desktop, tablet,
  and mobile sizes. Preserve semantic/functional cues rather than chasing exact pixels.
- Keep Quartz theme tokens authoritative. Literal per-book accents remain decorative author choices.
- Replace the old card border/title hover with the exact Make effect frozen in Prompt 01: the
  120%-by-80% top radial accent wash, one-pixel accent-centered bottom hairline, `300ms` opacity,
  keyboard-focus parity, and two-pixel lift with reduced-motion/forced-colors fallbacks.
- Check coexistence with PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, ContentMeta,
  NoteProperties, TOC, Graph, Backlinks, and Footer. The only host-element changes are the exact
  Explorer sibling replacement and redundant first book-breadcrumb suppression frozen in Prompt 01.
- Audit generated selectors and scripts: allow exactly the four host-selector kinds frozen in
  Prompt 01—default-frame grid containment, direct-plugin mobile left width/wrap containment,
  frame-specific default/Canvas direct Explorer sibling replacement, and default-frame book-root
  breadcrumb promotion. Explorer replacement remains the only whole-component suppression; no code
  selects or touches the right slot, Graph, TOC, Backlinks, or unrelated custom frames.
- Verify base-path/subdirectory hosting at every route depth and through SPA navigation.

## Implementation acceptance

- Overview/browse banner, authored root content, directory target, and one panels body render in the
  frozen order, with the banner first inside the plugin body.
- The manifest exposes/inserts exactly one sidebar component and never the body.
- Root/book navigation is correctly scoped, includes book `Overview`, distinguishes selection from
  exact-current state, includes distinctly iconed safe Canvas/Base leaves without altering the
  physical book model, uses the frozen disclosure defaults, and is accessible/path-safe.
- `replaceExplorer: true` prevents the stock duplicate only in the exact intended default/Canvas
  sibling contexts; `false` preserves it in both.
- Eligible default-frame book Breadcrumbs begin at Quartz's existing book-title/root link; root
  context and PageTitle/manual-selector true-root access remain intact.
- The Graph/right slot and all unrelated Quartz components remain operational and visible.
- The three content books are a durable, documented compatibility laboratory with accurate expected
  outcomes.
- No upstream file or ignored `.make` archive is changed or committed.
