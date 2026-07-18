# Prompt 02 — Implement the authored root and navigation shell in reviewable layers

## Objective

Implement Prompt 01 without regressing the completed book/appearance increment. Keep every change in
the external plugin except the explicitly allowed `content/` fixture. Use small modules, public Quartz
APIs, and observable tests; do not solve integration by editing core or copying Figma application
code.

## Phase A — Lock regressions and shared data

1. Add failing tests for the new manifest topology, root article/overview order, sidebar contexts,
   native markup, Explorer opt-out, path resolution, and Graph-safe resource scoping before changing
   the corresponding behavior.
2. Extend runtime normalization with `replaceExplorer`, preserving every existing option default and
   invalid-input fallback.
3. Reuse the existing one-pass book collector and appearance resolvers. Pass the sidebar the same
   normalized `excludeDirs`, `descriptionFallback`, `sort`, and `tagCount` inventory values as the
   panels. Extract only focused shared helpers needed by both components; do not create a second
   definition of eligibility, metadata, dates, titles, links, icons, or accents.
4. Add a separate navigation inventory helper that receives `allFiles` plus normalized inventory
   inputs and returns an immutable/render-ready Home/book model with nested nodes. Select the active
   scope from that model and the current slug. Keep both operations free of DOM, Preact, and
   host-private imports so they are exhaustively unit-testable.
5. Cache immutable navigation models only by `allFiles` identity plus all four normalized inventory
   values. Equivalent normalized variants may reuse a model; distinct variants must remain isolated.
6. Treat all `fileData`/frontmatter objects as unknown and use the existing own-property defensive
   style. Malformed entries fail softly and never alter another entry.

## Phase B — Restore authored root and add overview

1. Remove the Page Type tree transform that deletes root TOC/reading-time/text data. Preserve root
   matching, priority, layout key, frame, and closure-captured options.
2. Render the transformed root tree through `@quartz-community/utils/jsx` with the standard Content
   Page article/classes and safe `cssclasses` handling.
3. Render the article exactly once and before plugin-generated overview/panels. Empty trees must not
   create a meaningless article, while non-empty callouts/transclusions/tables/styles/scripts must
   survive the public utility's conversions.
4. Calculate statistics from the same rendered book entries. Use semantic list/region markup,
   localized labels, deterministic date formatting, and omit only an unavailable date item.
5. Add the localized browse anchor and stable `rip-directories` section heading. Keep it functional
   without JavaScript and visible under keyboard focus.
6. Preserve cards and list modes, empty state, panel keyboard navigation, descriptions, counts, tags,
   icon/accent precedence, and existing class hooks unless Prompt 01 explicitly changes their wrapper.

## Phase C — Build `RootIndexSidebar`

1. Add a public Quartz component constructor with the shared normalized options.
2. Server-render:
   - a native Home/book switcher with current context;
   - an uppercase/localized explorer label or equivalent semantic heading;
   - Home root-note navigation or the selected book's nested descendant navigation;
   - current-page and current-ancestor state.
3. Resolve all links relative to `fileData.slug` using public Quartz utilities. Folder disclosures are
   native and folder links appear only when a valid emitted destination is known.
4. Reuse panel icon/accent resolution for selected-book and switcher decoration. Keep SVG decorative,
   non-focusable, and free of nested interactions; keep accents out of critical state indicators.
5. Emit `data-rip-replace-explorer="true"` only for normalized opt-in. Add the exact narrow
   same-left-sidebar/direct-Explorer CSS replacement selector and a `false` path with no suppression.
6. Add responsive styles for Quartz desktop/tablet/mobile flow, native mobile disclosure, long labels,
   scrolling, touch, zoom, light/dark, forced colors, reduced motion, and print as appropriate. Add
   the exact default-frame/direct-plugin-gated `#quartz-body` selector from Prompt 01 to replace only
   intrinsic `auto` tracks with `minmax(0, ...)` tracks at tablet/mobile breakpoints. On mobile,
   scope the separate `.left.sidebar:has(> .rip-sidebar)` width/wrap declarations exactly as frozen
   in Prompt 01. Neither structural rule may hide/restyle siblings or select the right rail/custom
   frames. Add a plugin-local wide-breakpoint fallback that displays shell content when a mobile
   collapse leaves the native `<details>` closed after resizing and its summary is hidden.
7. Prefer no sidebar script. If native behavior cannot cover a small SPA affordance, add one scoped
   inline script following Quartz `nav`/cleanup conventions and prove no-JS functionality first.

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
   Canvas/Bases merely because their source files exist on disk if Quartz exposes them only as
   synthetic Page Type records.

## Phase F — Styling and integration polish

- Compare root, left navigation, cards/list, and right rail to the Make evidence at desktop, tablet,
  and mobile sizes. Preserve semantic/functional cues rather than chasing exact pixels.
- Keep Quartz theme tokens authoritative. Literal per-book accents remain decorative author choices.
- Check coexistence with PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, ContentMeta,
  NoteProperties, TOC, Graph, Backlinks, and Footer. Fix only plugin-owned markup/styles/scripts.
- Audit generated selectors and scripts: allow exactly the three host-selector kinds frozen in
  Prompt 01—default-frame grid containment, direct-plugin mobile left width/wrap containment, and
  direct Explorer sibling replacement. Explorer replacement remains the only cross-plugin
  suppression; no code selects or touches the right slot, Graph, TOC, or a custom frame.
- Verify base-path/subdirectory hosting at every route depth and through SPA navigation.

## Implementation acceptance

- Root authored content, overview, browse target, and one panels body render in the frozen order.
- The manifest exposes/inserts exactly one sidebar component and never the body.
- Home/book navigation is correctly scoped, nested, current-aware, accessible, and path-safe.
- `replaceExplorer: true` prevents the stock duplicate only in the exact intended sidebar context;
  `false` preserves it.
- The Graph/right slot and all unrelated Quartz components remain operational and visible.
- The three content books are a durable, documented compatibility laboratory with accurate expected
  outcomes.
- No upstream file or ignored `.make` archive is changed or committed.
