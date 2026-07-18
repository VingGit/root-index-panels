# Prompt 03 — Prove behavior with unit, host, fixture, browser, and accessibility evidence

## Objective

Prove the complete user-visible contract. A green component snapshot or successful build alone does
not prove CLI insertion, host layout composition, Graph retention, SPA/base-path routing, responsive
navigation, or compatibility with other Page Types.

## Pure option/data tests

### Shared book regressions

Retain every `topic-appearance` inventory, metadata, destination, count, sorting, localization,
icon/accent, injection, and physical-versus-virtual assertion. Add regressions that the root reuses
one book result for overview/panels, while each sidebar cache variant performs at most one
render-scoped collection rather than rescanning per book/node. Neither path may mutate `allFiles`.

### New options and manifest-facing normalization

- Omitted/`true`/`false` `replaceExplorer` normalize exactly; strings, numbers, null, inherited
  properties, arrays, accessors, and throwing proxies fall back safely to `true`.
- Existing options still have their frozen defaults and shallow-map behavior.
- Sidebar book collection receives the same normalized `excludeDirs`, `descriptionFallback`, `sort`,
  and `tagCount` inventory values as panels, and produces consistent eligibility, ordering, title,
  icon, and accent results.
- With one `allFiles` identity, equal normalized inventory options reuse the cached immutable model;
  changing any of `excludeDirs`, `descriptionFallback`, `sort`, or `tagCount` selects an isolated
  cache variant. Invalid raw values normalize before cache-key construction.

### Navigation inventory

Parameterize these against different `allFiles` orders and duplicates:

- `index`, a listed root note, tags/404/unrecognized namespaces select root context.
- An eligible book landing, descendant, nested descendant, Canvas/Bases route slug, dotted segment,
  space, and Unicode slug select the correct book context.
- A first segment without an eligible/destination-backed book remains root context.
- Root mode shows listed physical root notes plus safe generated Canvas/Base leaves and never root
  `index`, books, tags, unsupported virtual records, unlisted/drafts, or duplicate slugs.
- Book mode shows listed physical descendants plus safe generated Canvas/Base leaves of that book; it
  omits the book landing from the chapter list, root notes, sibling books, reserved tags, and unlisted
  data.
- Explicit titles including unusual casing/Unicode remain exact. Missing titles use the documented
  fallback without leaking path markup into hooks.
- The selector's root title comes from the first listed physical exact `index` record; absent,
  accessor-backed, or malformed title data falls back to localized Home without invoking accessors.
- Book mode exposes its landing once as the first localized `Overview` link, outside the descendant
  tree. Nested folder nodes are deterministic; first-level folders start open, deeper current
  ancestors start open, and unrelated deeper folders start closed. Generated folder destinations
  can add a valid link but not a note/count; missing folder destinations remain disclosures only.
- A Canvas/Bases virtual record colliding at `<book>/index` cannot prove a landing destination even
  when the same first-level directory has a physical Markdown descendant.
- Valid generated Canvas/Base leaves require an own, exactly matching provenance marker, canonical
  lower-case suffix, and non-unlisted state. Reject inherited/accessor-backed, both-marker,
  wrong-suffix, upper-case-suffix, missing-marker, and unlisted cases; physical collisions win.
- A generated leaf may originate structural folder containers within an already-eligible book, but
  never creates/proves a book, changes physical count/order, or supplies that folder's Overview
  destination/title.
- Sorting is stable for equal/case-varied titles and does not depend on host locale or insertion order.
- Malformed slugs/frontmatter/fileData, prototypes, accessors, and unsafe text never throw or create
  unsafe attributes. Exercise the same leading/trailing/doubled/backslash slug anomalies through
  both the root panels and sidebar inventory, plus revoked option/frontmatter proxies.
- Large synthetic input catches accidental per-book/per-node repeated full scans without a
  timing-sensitive microbenchmark.

## Component/server-render tests

### Root body

- The overview/browse banner is the first direct child of the plugin root body. A non-empty
  transformed tree appears exactly once inside the standard article/Markdown wrappers after that
  banner and before `#rip-directories`.
- Headings, links, callouts, tables, code, transclusion output, inline style/script nodes supported by
  the public JSX helper, and frontmatter `cssclasses` render safely; malformed classes do not inject.
- An empty tree omits only the article while overview/panels still render.
- The Page Type no longer removes `toc`, `readingTime`, or `text`, and does not mutate shared
  `fileData` or tree objects.
- Directory count, total notes, finite newest date, and no-date cases match the frozen calculations.
  Assert deterministic `en-US`, `fi-FI`, and unsupported-locale output.
- Browse is an ordinary `href="#rip-directories"` anchor with a visible focus state; the target ID
  occurs once.
- Root guard still renders no `.rip` body for non-root usage of the advanced component.
- Cards and list modes still render one panel anchor per book with all prior accessible-name behavior.

### Sidebar

- Manifest-loaded constructor server-renders one labelled navigation region.
- Selector uses native disclosure/list/link markup; authored-root/book labels and menu contents are
  correct. It does not use listbox/tree/application roles or custom tabindex.
- Root, root-note, book landing, nested book note, tags, Canvas/Bases, and 404 examples produce the
  correct context/tree.
- Exactly one root/book entry exposes selected context/check/status independently of
  `aria-current`. Exact current links have `aria-current="page"`; descendants do not falsely mark
  the book landing; the first-level-open/deeper-current disclosure defaults are exact.
- Ordinary-note, Canvas, and Base leaves render three distinct decorative/non-focusable SVG glyphs;
  accent hooks are validated and links retain readable names.
- Root, book, folder, dotted, spaced, Unicode, and deep links use public relative resolution and
  preserve encoded/output-safe destinations.
- `replaceExplorer: true` emits the true data hook; false omits it or emits a non-matching value.
- Long/empty navigation labels and zero/one/many books remain valid.

## CSS and script contract tests

- Parse/search compiled CSS and fail if either frame-specific Explorer suppression variant lacks its
  exact frame/sidebar ancestry, direct-sidebar marker, true data attribute, or direct `.explorer`
  target constraints.
- Render a host-shaped DOM with:
  1. stock Explorer as a direct same-default-sidebar child and opt-in true — hidden;
  2. stock Explorer as a direct CanvasFrame `.canvas-sidebar` child and opt-in true — hidden;
  3. either frame with opt-out false — visible;
  4. an `.explorer` elsewhere/nested — visible;
  5. Search/PageTitle/toolbars in left — visible;
  6. Graph/TOC/Backlinks in right — visible.
- Assert tablet/mobile CSS contains the exact default-frame/direct-descendant selector
  `.page[data-frame="default"]:has(> #quartz-body > .left.sidebar > .rip-sidebar) > #quartz-body` and
  changes only track sizing from intrinsic `auto` behavior to `minmax(0, ...)`. Prove the tablet
  variant preserves two tracks, the mobile variant has one shrinkable track, and Canvas/custom
  frames do not match.
- Assert the mobile stylesheet contains direct-plugin-scoped
  `.left.sidebar:has(> .rip-sidebar)` containment with exactly the frozen `min-width`, `width`,
  `max-width`, `flex-wrap`, and `overflow-wrap` effects, and that it does not hide or restyle sibling
  host components.
- Fail if plugin CSS contains selectors for the right slot/Graph/TOC or generic unscoped host chrome.
  Default-frame grid containment, mobile left width/wrap containment, frame-specific direct Explorer
  replacement, and book-root breadcrumb promotion are the only host-class selector kinds. Explorer
  replacement is the only whole-component suppression.
- Assert the exact default-frame/direct-book-scope breadcrumb selector hides only
  `.breadcrumb-element:first-child:not(:only-child)`. In host-shaped DOM, an eligible book route must
  expose the existing book-title/root link as its first visible crumb, while root/unrecognized routes,
  only-child Breadcrumbs, and Canvas/custom frames remain unchanged. Reject breadcrumb JavaScript.
- Verify desktop/tablet/mobile display rules, long-label overflow, native details open/closed display,
  a mobile-close then tablet/desktop resize, print, forced colors, and reduced motion from compiled
  CSS. The wide state must expose content even if the narrow shell's `open` attribute stays absent.
- Test the sidebar script's initial render, SPA `nav`/re-entry, repeated events, cleanup, multiple
  sidebars, no matching sidebar, outside-pointer close, selected-link close, Escape close with
  summary-focus restoration, one-open-selector behavior, and no queries/mutations of Explorer or
  right components. Also prove the same links/disclosures work with the script absent.
- Assert the popup is absolute/opaque, has bounded scrolling/z-index, causes no Explorer layout
  shift, and disables the covered Explorer scope while open. Closing must restore the scope.
- Assert the compiled panel CSS contains the exact frozen Make radial gradient and bottom hairline,
  `300ms` opacity, focus parity, and allowed two-pixel lift; reject the superseded accent
  border/title-color hover. Test reduced-motion and forced-colors fallbacks.
- Retain all existing panel keyboard/SPA lifecycle tests.

## Manifest, API, and package tests

- `Object.keys(packageJson.quartz.components)` is exactly `["RootIndexSidebar"]`.
- Sidebar metadata is complete/version-aligned and has frozen left position/priority.
- No manifest string/key registers `RootIndexPanels` as a component, while source/built imports still
  expose `RootIndexPanels`, `RootIndexPanelsPage`, `RootIndexSidebar`, shared options, sidebar options,
  and `PanelIconComponent` from documented entry points.
- Manifest defaults/schema contain valid boolean `replaceExplorer: true`; existing schema limitations
  remain honest.
- Manifest validator, CI artifact scan, package allowlist, declarations, source maps, notices,
  singleton externals, and no-unexpected-bare-import checks cover all new entries/resources.
- `npm pack --dry-run` and a temporary consumer import prove the sidebar CSS/script and public types
  are actually shipped.

## Durable parent-content fixture audit

Do not merely count files. Open every specimen and verify its expected-result text and sentinel.
The checklist must map each configured Quartz feature to a concrete page and observation:

| Area                | Required fixture evidence                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Root Page Type      | Visible root sentinel/heading/prose, overview values, browse target, three customized books         |
| Markdown/GFM/OFM    | headings, emphasis/highlight, lists/tasks, table, callout, footnote, code, hard/soft breaks         |
| Math/diagram        | inline/block KaTeX and Mermaid output or an explicit configured-plugin limitation                   |
| Links               | Markdown links, wikilinks, aliases, headings/blocks, broken-link negative control, cross-book links |
| Transclusion        | source and consumer with visible embedded sentinel and backlinks                                    |
| Paths               | nested directory, spaces, Unicode, punctuation/dotted-segment integration fixture                   |
| Metadata            | descriptions, tags, aliases, dates, properties, TOC opt-out/control                                 |
| Visibility/security | draft, unlisted, listed/unlisted encrypted examples with fake documented passwords                  |
| Page Types          | ordinary content, FolderPage, TagPage, distinctly iconed Canvas/Bases leaves and live routes        |
| Assets              | local image/SVG with alt text; no required remote resource                                          |
| Host UI             | Search token, TOC, Graph, Backlinks, Breadcrumbs, PageTitle, modes, Footer                          |
| Navigation          | Root/book modes, Overview, typed leaves, book-first breadcrumbs, selector, mobile disclosure        |
| Accessibility       | landmark/headings, keyboard order, focus, contrast/forced colors, reduced motion, zoom              |

- Each book index uses its distinct safe icon/accent and links to its specimens.
- Cross-book links form visible Graph/Backlinks edges; no test assumes books are isolated graphs.
- Search has unique stable tokens from all three books.
- Expected card/stat/sidebar counts come from a clean rendered build and match the physical/listed
  contract. Reconcile `content/AGENTS.md` and the manual checklist together if Canvas/Bases were
  previously counted optimistically.
- Draft/unlisted/encrypted negative controls never expose secret-like real data.
- All durable fixture files stay after tests. Only isolated temporary copies/config variants are
  cleaned.

## Real Quartz integration matrix

Use the plugin's isolated integration runners or a temporary stock-shaped Quartz checkout. Never
rewrite parent upstream files for a test. Exercise at least:

- cards and list modes;
- `replaceExplorer` true and false in both default and Canvas frames;
- SPA enabled and disabled;
- `en-US`, `fi-FI`, and unsupported locale;
- root, root note, three book indexes, ordinary/nested book notes, FolderPage, TagPage, Canvas, Bases,
  unlisted/encrypted controls, 404;
- explicit and FolderPage-generated book landing destinations;
- base-path/subdirectory hosting shaped like `/quartz-for-gitlab/` at root and deep routes;
- host PageTitle, Search, Darkmode, ReaderMode, Breadcrumbs, ContentMeta, NoteProperties, TOC, Graph,
  Backlinks, Footer, RSS, sitemap, and social metadata as configured.

Inspect generated HTML and resources, not only exit codes:

- root contains one overview/browse banner as the first direct plugin-body child, the authored
  sentinel once after it, one directory target, and one `.rip` panels body;
- root TOC/reading-time/Search/RSS/sitemap/social evidence reflects authored root content where the
  host normally exposes it;
- sidebar authored-root label, selected-versus-current context, `Overview`, disclosure defaults,
  scoped links, safe hooks, expected books/notes, typed Canvas/Base leaves, and three distinct
  document icons are exact without changing physical counts/order;
- all expected destinations exist and resources/links retain the hosting subdirectory;
- the right sidebar contains the current Graph component marker on root and representative book
  notes; plugin CSS does not hide it at any tested width;
- cross-book links appear in Graph data/Backlinks according to host behavior;
- stock Explorer is hidden only for opted-in direct default/Canvas sibling replacement and visible
  for false/unrelated contexts; Canvas stage and plugin navigation remain visible;
- default-frame eligible-book Breadcrumbs begin with the existing book-title/root link, root-context
  Breadcrumbs retain stock behavior, and PageTitle/manual-selector links still reach the true root;
- no duplicate panels/sidebar scripts/listeners or broken console/network requests occur after SPA
  navigation sequences.

## Fresh CLI and remote-pin gate

In a clean isolated Quartz checkout:

1. add the local/packed plugin with the stock `npx quartz plugin add` command;
2. inspect the generated plugin config and lock entry;
3. assert the plugin entry has one left layout declaration from `RootIndexSidebar`, contains no body
   registration/manual `RootIndexPanels`, and has normalized defaults;
4. enable it through `npx quartz plugin enable` and build;
5. assert exactly one panels body and one sidebar render;
6. remove it through the stock CLI and verify clean removal;
7. after commit/push, repeat add/enable/build against the exact remote commit/prebuilt checkout and
   record the resolved hash.

Do not junction over a locked cache or infer remote usability from a local worktree install.

## Watch and browser review

- Rerun nested add/change/delete watch diagnostics for any aggregate used by root or sidebar. Record
  stale observations accurately, then stop the watcher and prove a clean/full build corrects root
  panels, overview, and navigation.
- Use real browser inspection at representative desktop (>1200px), tablet (800–1200px), and mobile
  (<800px) widths in light/dark themes.
- At tablet/mobile widths, compare viewport, document, `#quartz-body`, left, center, right, and Graph
  bounds. Require no plugin-induced horizontal overflow, a shrinkable center/right responsive flow,
  and no default-frame grid-containment match on Canvas/custom frames.
- Compare functional hierarchy to the Make source and inspect the right Graph at every width.
- Measure the selector closed/open Explorer position and require zero layout shift. Verify the popup
  stays within the viewport, covered Explorer content is non-interactive while open, outside pointer
  closes it, and Escape closes it and restores summary focus.
- Keyboard-test selector, folder disclosures, all links, browse anchor, cards/list, Search, modes,
  TOC, and Backlinks through SPA navigation.
- Open real `.canvas` and `.base` routes. Confirm each appears in the current book tree with its own
  glyph/current state; the Canvas drawer has no visible stock Explorer below the plugin sidebar when
  opted in, while the canvas stage remains visible. Toggle the Canvas drawer closed/open/closed at
  desktop, 801px, 800px, and mobile: desktop padding must allocate inward, mobile must remain an
  overlay, controls/stage must remain visible, and every state must have zero horizontal scroll.
- On a regular/default-frame nested book route, confirm the first visible/accessible breadcrumb is the
  book-title link to the book root rather than Home. Confirm root context remains stock and the site
  title/manual selector still reaches the true front page.
- Inspect card hover/focus computed styles for the frozen radial wash, bottom line, alpha,
  `translateY(-2px)`, and absence of the old border/title highlight.
- Inspect accessibility tree/names where available; test forced colors/high contrast, reduced motion,
  touch/coarse pointer, 200% and 400% zoom/reflow, long labels, and Unicode.
- Check browser console and network requests after root → book → nested note → other book → root.
- Include a subdirectory-hosted SPA build such as `/group/project/`; verify root and deep selector,
  Overview, Explorer, and resource links without describing this as GitLab-specific routing.

## Command gate

Run changed-file formatting, then the repository's actual gates:

```bash
npm ci
npx prettier --write <changed-plugin-files>
npm run check
npm run build
npm run verify:dist
npm run verify:package
npm run test:integration
npm run test:watch-integration
npm pack --dry-run
git diff --check
```

Also run the clean parent build and browser/manual checklist. Capture exact commands, revisions,
results, inspected pages/selectors, and any pre-existing warning in `IMPLEMENTATION-NOTES.md`.
Do not waive required behavior as a known limitation; only the already documented partial-watch
invalidation is pre-approved, and clean-build correctness remains mandatory.
