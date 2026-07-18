# Navigation-shell implementation session notes

Populate this file during the implementation run. It is evidence, not a substitute for tests.

## 2026-07-18 Canvas/Base navigation and breadcrumb correction

### Resolved behavior

- The sidebar now admits generated Canvas and Bases records as typed document leaves when the record
  is not unlisted, owns exactly one matching `canvasData`/`basesData` marker, and has a canonical
  lower-case `.canvas`/`.base` slug. Listed physical records retain precedence and the ordinary-note
  glyph; Canvas uses Lucide Workflow and Base uses Table Properties. Exact regressions cover
  `git-practice/history.canvas` and `sql-pocketbook/query-catalog.base`.
- Book/card eligibility, metadata, ordering inputs, and counts remain listed-physical only. Generated
  leaves cannot create or prove a book, affect counts/order, or supply a folder Overview
  destination/title. They may originate structural folders only to expose a nested route inside an
  already-eligible book.
- `replaceExplorer: true` now has separate direct-sibling variants for the default left slot and
  CanvasFrame's `.canvas-sidebar`; false omits the opt-in attribute and preserves Explorer in either
  frame. The Canvas rule leaves the plugin sidebar and canvas stage intact.
- On default-frame eligible-book routes, plugin CSS hides only the redundant first stock Home
  breadcrumb element. Quartz's already-rendered book-title/book-root link becomes the first visible
  crumb. Root-scope breadcrumbs remain stock, while PageTitle and the manual switcher still link to
  the true root. No JavaScript rewrites Explorer or Breadcrumbs, and no rule targets the right slot,
  Graph, TOC, or Backlinks.

### Verification evidence

- `npm run check` passed TypeScript, ESLint, Prettier, and 205 Vitest tests across 7 files. The new
  adversarial cases cover exact live slugs, root/book/nested virtual leaves, unlisted and ambiguous
  records, inherited/accessor markers, suffix mismatches, physical collisions, exact current state,
  distinct SVGs, both frame selectors, breadcrumb scope, and forbidden right-side selectors.
- `npm run build`, `npm run verify:dist`, `npm run verify:package`, `npm pack --dry-run`, and
  `git diff --check` passed. The packed package still contains 14 allowlisted files; regenerated,
  committed `dist/` contains the typed icons and both scoped CSS behaviors.
- `npm run test:integration` passed all three isolated stock-Quartz variants. The fixture enables
  Breadcrumbs, CanvasPage, and BasesPage; adds valid `.canvas`/`.base` sources; preserves Java's
  physical count of 2; renders note/Canvas/Base links with three distinct SVGs; proves exact current
  state and relative links below `/group/project/`; renders the Canvas custom frame and Base body;
  preserves stock Explorer in SSR for CSS replacement; and emits the exact Canvas and breadcrumb
  selectors. `npm run test:watch-integration` also passed with the documented 2/3 stale aggregate
  observations followed by clean-build correctness.
- Edge 150 computed-style checks passed at `1440`, `900`, and `390` CSS-pixel widths. On the ordinary
  book route, Home computed to `display: none`; `iOS` was the first visible crumb and linked to
  `/group/project/java/`; PageTitle and the switcher linked to `/group/project/`; note/Canvas/Base
  SVGs were distinct; stock Explorer was hidden; and tablet/mobile had no horizontal overflow. The
  root-scope loose note retained a visible Home/root link.
- Opening CanvasFrame's drawer at desktop/mobile kept one plugin sidebar, the current Canvas and Base
  links, and the canvas stage visible while the direct stock Explorer computed to `display: none`.
  At `390px` the drawer fit without horizontal overflow. Removing the true opt-in attribute—the
  exact SSR state produced by `replaceExplorer: false`—changed the direct Explorer from `none` to
  `flex` in both default and Canvas frames while the plugin and stage stayed visible.
- A post-deployment audit exposed a separate CanvasPage box-model defect at desktop: its 100%-wide
  content-box frame grew to 1740px when the host added 300px open-drawer padding. The plugin now gates
  `box-sizing: border-box` on the exact CanvasFrame that directly hosts `RootIndexSidebar`; it applies
  in both Explorer option states and never targets the stage, container, controls, or transforms.
- A rebuilt isolated Quartz host passed closed/open/closed Edge geometry at 1440, 801, 800, and 390
  CSS pixels. Desktop open frames stayed viewport-wide with 300px inward padding and stage widths of
  1140/501px; 800/390 retained the overlay model; controls and Canvas content remained non-zero; and
  `documentElement`, body, and forced `scrollTo` probes remained at zero horizontal overflow.

### Push, CI, and remote-consumer evidence

- Implementation commit `3b815a5940d902e6e4f8141813ceb0aeee358b64`
  (`feat: integrate Canvas and Bases navigation`) is pushed to `origin/main`. GitHub CI run
  <https://github.com/VingGit/root-index-panels/actions/runs/29654796522> completed successfully for
  that exact SHA.
- Canvas drawer containment commit `f5d40530cba3016497423529a707cf0ad7971cd3`
  (`fix: contain Canvas sidebar drawer`) is pushed to `origin/main`. GitHub CI run
  <https://github.com/VingGit/root-index-panels/actions/runs/29655988881> completed successfully for
  that exact SHA.
- A separate stock-shaped consumer ran
  `npx quartz plugin install --latest root-index-panels`; its lock and cache both resolved
  `f5d40530cba3016497423529a707cf0ad7971cd3`, and the installer selected committed prebuilt `dist/`.
  Its clean `/group/project/` build processed 14 inputs, emitted 64 files, retained the Canvas stage
  and stock Explorer SSR, rendered current typed Canvas/Base leaves, and emitted the plugin-gated
  CanvasFrame border-box rule.
- A preserved stock-shaped Quartz workspace removed the local plugin source, added
  `github:VingGit/root-index-panels`, and enabled it through the normal CLI. `plugin add` selected
  committed prebuilt `dist/`; the lock and cache both resolved the exact implementation SHA above;
  generated configuration contained one enabled plugin entry with one left-priority-40 layout. A clean
  `/group/project/` build processed 14 inputs and emitted 64 files. It rendered six root cards, one
  sidebar, typed Canvas/Base links, exact current Canvas/Base states, the raw Home/book breadcrumb
  ancestry, and both emitted scoped selectors.
- The parent repository remains intentionally untouched except for reusable guidance in the new,
  non-upstream `.github/QUARTZ_PLUGIN_DEVELOPMENT.md`. Its upstream-owned `quartz.lock.json` still
  pins the preceding plugin revision by design; the live GitLab deployment will receive this pushed
  plugin only after the consumer runs
  `npx quartz plugin install --latest root-index-panels`, commits its refreshed lock, and deploys.
  No version bump, tag, release, npm publish, marketplace action, or parent push was performed.

## 2026-07-18 follow-up design alignment

### Resolved contract

- The local `Alternative Landing Page Design.make` archive was re-audited against the supplied
  screenshots and deployed reference. The deployment's stock Explorer-only appearance was traced to
  its older installed plugin/config state, not to a need for a Quartz-core patch. A fresh stock CLI
  remove/add integration now proves the plugin manifest generates the one left
  `RootIndexSidebar` layout stanza.
- The selector's root/manual label is authored data: the first listed physical exact `index` title,
  with accessor properties ignored and localized Home used only as a fallback. The selector popup
  separates active manual/book selection from exact-page state: exactly one item exposes selected
  status/check, while only the exact destination receives `aria-current="page"`.
- Root mode lists only physical root notes. Book mode renders `Overview` first and then only that
  book's descendants. First-level folders start open; deeper folders start open only on the current
  ancestry. Root, Java, and dotted-segment Git inventories were observed to be mutually disjoint.
- The overview/statistics/browse banner is the first direct child of the plugin Page Type body,
  followed by transformed authored root HAST and then the directory collection. Quartz-owned title
  and metadata remain outside and before the plugin body.
- The selector remains useful without JavaScript. Its scoped enhancement closes on outside
  `pointerdown`, selected-link activation, or Escape; Escape restores summary focus, one selector
  stays open, and Quartz navigation cleanup removes listeners. The absolute opaque popup causes no
  Explorer layout shift, and the covered Explorer scope is non-interactive while it is open.
- The previous accent border/title card hover was replaced by the Make-aligned effect: a
  `120% 80%` radial ellipse at `50% 0%` using the validated accent at 8% and transparent at 70%, a
  one-pixel transparent/accent/transparent bottom hairline, `300ms` opacity, focus-visible parity,
  and a two-pixel lift where motion is allowed.

### Local and browser evidence

- `npm run typecheck`, `npm run lint`, `npm run format`, `npm test`, and `npm run build` passed. The
  expanded Vitest result is 199 passing tests across 7 files, including the dedicated sidebar
  light-dismiss/cleanup suite.
- Final hardening rejects nested virtual Canvas/Bases indexes as folder overview destinations,
  exercises cleanup followed by SPA re-initialization, and makes the packed-package verifier require
  both the sidebar stylesheet and executable inline script.
- `npm run test:integration` passed mixed-Preact rendering, fresh stock CLI remove/add, SPA `en-US`
  YAML, no-SPA `fi-FI` TypeScript, unsupported `en-GB` fallback below `/group/project/`, and parent
  boundary assertions. Generated output proves the one sidebar stanza, banner-first body order,
  authored root selector label, selected-versus-current semantics, scoped trees, `Overview`, open
  first-level folders, exact locale dates, base-path-safe links, Graph/TOC coexistence, stock Explorer
  replacement, popup CSS/script, and Make glow resources.
- Real Edge 150 inspection passed at desktop `1440px`, tablet `900px`, and mobile `390px`. The root
  banner was first inside the plugin body; the authored-root selector and root-only tree rendered;
  stock Explorer was replaced; Graph stayed present; no tested viewport overflowed or raised a
  runtime error. Opening the selector left the Explorer top coordinate unchanged at `346.34375px`,
  kept the popup inside the viewport, and disabled the covered scope. Escape closed the popup and
  restored summary focus.
- Computed card interaction showed the radial layer and bottom hairline at opacity `1`, the exact
  accent alpha, and a `-2px` Y transform. SPA navigation to Java selected its authored iOS-titled
  manual, made `Overview` exact-current on the landing, and showed only Java descendants; a second
  dotted `Git.md` book likewise showed only its own tree. Graph remained visible and console errors
  remained zero. Mobile retained an in-viewport selector/shell toggle and tablet retained a
  `256px` sidebar without horizontal overflow.

### Follow-up closeout state

- Local implementation, distribution generation, isolated CLI insertion, integration, responsive,
  subdirectory-hosting, light-dismiss, focus-restoration, and visual-computed-style gates pass.
- Implementation commit `fd5c1f1de447733955459aaf0ee8eb12c8ecd0d9`
  (`feat: align navigation shell with landing design`) is pushed to `origin/main`. GitHub CI run
  <https://github.com/VingGit/root-index-panels/actions/runs/29652498365> completed successfully for
  that exact SHA.
- A preserved stock-shaped Quartz workspace removed the local source, added
  `github:VingGit/root-index-panels`, and enabled it through the normal CLI. Add selected committed
  prebuilt `dist/`; the lock and cache resolved the full implementation SHA above; configuration
  contained one enabled plugin entry and one left-priority-40 layout stanza. A clean
  `/group/project/` build emitted 57 files and proved overview/authored/directories order, one sidebar
  on root and topic, authored root/book labels, scoped Overview/current state, Graph on both pages,
  and shipped popup/glow/light-dismiss resources.
- No version bump, tag, release, npm publication, marketplace action, PR, or parent push was
  performed or authorized by this follow-up.

## Original navigation-shell increment (historical evidence)

The remaining sections record the completed increment that preceded the follow-up above. Their
revision hashes, test totals, browser measurements, and push statements are point-in-time evidence;
the follow-up section supersedes them where behavior or totals changed.

## Revisions and baseline

- Parent Quartz revision: `a6878f323eed859a686a164809830a38180fd10d`.
- Plugin starting revision: `6b87c01919c8bb4989e985d155ade9370b0c3cbf`.
- Plugin-template reference revision: `0bd68d7f3a80f758dfd1abce24341e5d24028670`.
- Ignored `.make` file inspected and still ignored: yes. The local
  `Alternative Landing Page Design.make` archive supplied the design hierarchy, states, copy, and
  responsive reference. It remains matched by `.gitignore`'s `*.make`, is not in the package
  allowlist, and none of its generated application code was copied.
- Baseline `npm ci`: passed before implementation. A later dependency-boundary fix deliberately
  changed the lockfile; the final clean install and ancestor-free install are recorded below.
- Baseline `npm run check`: passed before implementation; the final expanded suite is recorded
  below.
- Baseline `npm run build`: passed, including committed prebuilt output.
- Baseline parent clean build and rendered observations: passed before implementation. The final
  parent build processed 31 Markdown inputs, filtered 2, and emitted 230 files. It rendered the
  durable book counts `8`, `5`, and `6`; emitted Canvas and Bases routes; omitted draft negative
  controls; and left `quartz.config.yaml` and the user-owned `quartz.lock.json` byte-identical at
  SHA-256 `21D223F41BCB5C60F9523D8081078CE0E90F52B8C3CE1AF7377B53AD7282F5FE` and
  `9E08AB956609084DB17152978088CC6C841157E359E4D77D0325A4B49B0192BE`.

## Contract decisions from current host evidence

- Manifest add/enable/layout behavior: `RootIndexPanelsPage` remains the only Page Type and owns only
  physical root `index` at priority `100`, layout `content`, default frame. Manifest discovery adds
  exactly one left component, `RootIndexSidebar`, priority `40`; `RootIndexPanels` remains a public
  component export but is not separately discoverable. Isolated CLI remove/add/enable checks prove
  one generated layout stanza and one rendered sidebar.
- Public HAST-to-JSX API and root-content wrapper: the root body renders its overview/browse banner
  first, then transformed `file.data.htmlAst` once through `@quartz-community/utils/jsx`'s public
  `htmlToJsx`, inside normal Quartz article and Markdown wrappers, before panels. No suppression
  transform clears `toc`,
  `readingTime`, or `text`. `hast-util-to-jsx-runtime` is now a direct dependency because the public
  utility subpath imports it as an optional peer.
- Sidebar route and visibility model: one SSR `<nav aria-label="Book navigation">` uses native
  `<details>`, lists, and relative links. Root/root-note contexts show root notes; eligible book
  contexts show that book's folder tree. All contexts reuse canonical slug parsing and the book
  collector's normalized eligibility/order/title/destination/icon/accent inputs. A `min-width: 801px`
  rule restores content when a shell closed on mobile is widened while its `open` state remains
  false.
- Stock Explorer integration decision: `replaceExplorer` defaults to true and emits an opt-in data
  attribute. One direct-sibling `:has()` rule hides only stock Explorer beside that opted-in sidebar;
  false, nested, and unrelated Explorer instances stay visible. No JavaScript mutates host DOM.
- Graph/right-slot evidence: no selector or script targets the right slot, Graph, TOC, or Backlinks.
  Real-browser measurements found one Graph at desktop `256px`, tablet `543px`, mobile `358px`, and
  400%-reflow-equivalent `328px`. The right rail remained in normal Quartz flow. Canvas retains its
  stock fullscreen/custom-frame exception rather than being forced into the default frame.
- Base-path/subdirectory hosting evidence: the SPA `en-GB` integration build rendered and navigated
  correctly below `/group/project/`; root and deep links use Quartz's public relative-path utility.
  There is no GitLab-specific routing branch—`/quartz-for-gitlab/` is simply another URL base path.
- Canvas/Bases source identity and book-count decision: counts use listed physical records. Virtual
  FolderPage records may prove a physical directory destination, but Canvas/Bases records—including
  virtual `<book>/index` collisions—cannot prove/create a book or inflate counts. Root panels and
  sidebar preserve this provenance marker and share the rejection behavior.
- Watch invalidation evidence: the isolated watcher reproduced stale root aggregates for nested add
  and nested change, while nested delete happened to refresh. A direct root refresh and clean/full
  build restored the correct count/description. The diagnostic reports this as a host invalidation
  limitation, not a deployment failure.

## Final evidence

- Focused/unit/DOM checks: `npm run check` passed typecheck, ESLint, Prettier, and 185 Vitest tests in
  6 files. The suite covers inventory/provenance, malformed and revoked inputs, dates, options,
  cards/list, HAST content, i18n, injection, panel lifecycle, manifest topology, sidebar navigation,
  cache variants, styles, SPA cleanup, and public runtime/type consumers.
- Package/build/dist checks: `npm run build`, `npm run verify:dist`,
  `npm run verify:package`, `npm pack --dry-run`, and `git diff --check` passed. The packed package has
  14 allowlisted files and all three export surfaces. Generated maps prove every bundled dependency
  source resolves inside this plugin's own `node_modules`; notices cover the map closure. A copied
  ancestor-free checkout passed `npm ci --ignore-scripts`, build, both verifiers, and production
  audit with lock SHA-256 `8CAB7B685B7CAEE39CAFD62A45CE7C8306D96B2879D62C0C684FF15FB8B36EE1`.
  Production audit reports 0 vulnerabilities; the full development tree reports 14 dev-only audit
  findings (7 moderate, 6 high, 1 critical), with no unauthorized automatic dependency rewrite.
- Durable content-fixture checks: the parent clean build and rendered inspection found JavaScript
  Basics `8`, Git Practice `5`, and SQL Pocketbook `6`. Custom icons/accents rendered. The fixture
  covers GFM/OFM, callouts, tasks, code, KaTeX, Mermaid, transclusion, aliases, properties, tags,
  cross-book links, Unicode/spaces, encryption, SVG, Canvas, and Bases. Draft/unlisted/static and
  fake-password negative controls match `content/sql-pocketbook/manual-test-checklist.md`.
- Isolated real-Quartz integration checks: all three stock-host variants passed—SPA `en-US` YAML,
  no-SPA `fi-FI` TypeScript, and SPA `en-GB` fallback below a base path—plus mixed-Preact rendering,
  public remove/add, generated manifest layout, root/sidebar/Graph composition, and package assets.
  The separate watcher diagnostic passed with its documented `2/3` stale observations followed by
  clean-build correctness.
- Desktop/tablet/mobile browser and accessibility checks: current built output passed live Edge at
  `1440`, `900`, `390`, `720`, and `360` CSS-pixel viewports. The grids measured
  `320/790/320`, `320/543`, and one `358px` track; document width equaled viewport width at every
  narrow measurement. Search, PageTitle, Darkmode, authored sentinel, six cards, one sidebar, and one
  Graph stayed present. Mobile close collapsed content; widening to `900px` displayed it with
  `open=false`. ArrowRight moved to the next card; the accessibility tree exposed a named
  `Book navigation` landmark. Root → Custom Book SPA navigation and Back/Forward kept one sidebar and
  one Graph, selected `Custom Book`, removed root cards off-root, and raised zero page errors.
- Nested plugin implementation commit and pushed revision:
  `f5e8a1eae3018e819b6995d35fb1f4b6013adf99` (`feat: add multi-book navigation shell`) is
  pushed on `main` and matches `origin/main` at the implementation evidence point. This
  implementation-notes closeout is a later evidence-only revision; embedding that containing
  revision's own hash would be self-referential, so its exact final hash and CI result are reported
  externally after it is pushed.
- GitHub CI run: the implementation revision passed the repository workflow in green at
  <https://github.com/VingGit/root-index-panels/actions/runs/29649169553>.
- Fresh remote add/enable/build revision: a clean stock-shaped host ran
  `npx quartz plugin remove root-index-panels --concurrency 1`, added
  `github:VingGit/root-index-panels`, and enabled it through the ordinary CLI. Add selected the
  committed prebuilt distribution and reported `f5e8a1e`; the lock, plugin cache checkout, and
  checkout `HEAD` all recorded the full implementation hash
  `f5e8a1eae3018e819b6995d35fb1f4b6013adf99`. Generated configuration contained exactly one enabled
  `root-index-panels` entry from `github:VingGit/root-index-panels`, positioned left at priority
  `40`. A `/group/project/` base-directory build processed 14 inputs and emitted 56 files. Its root
  contained one sidebar, six cards, authored and overview sentinels, and one Graph; a Custom Book
  deep route contained one sidebar, no root cards, and one Graph. The built CSS contained both the
  scoped Explorer replacement and wide-screen disclosure-restoration rules, and generated metadata
  used the base path.
- Parent worktree status and whether it was pushed: parent changes are limited to root DOX/general
  plugin guidance, allowed durable `content/` fixtures, and the user's pre-existing
  `quartz.lock.json` modification. No parent GitLab push occurred. No parent Quartz source, docs,
  configuration, package metadata, CLI, loader, or generated public file is part of the plugin
  commit.
- Known limitations: Quartz partial watch invalidation can leave first-level aggregate root/sidebar
  data stale for nested add/change until a direct-root change or clean build; full builds are
  authoritative. Canvas uses Quartz's fullscreen custom frame, so the default-frame right Graph is
  intentionally not injected there. No version bump, tag, release, npm publish, marketplace action,
  or parent push is authorized or performed. Explicit browser/ancestor-free audit workspaces remain
  outside both repositories under system temporary directories because the command policy rejected
  recursive cleanup; they are untracked, unpackaged, and contain only disposable verification copies.
- Original increment DOX/document closeout: the root, plugin, integration, and content DOX chains
  were re-read after that implementation and matched its delivered behavior. The 2026-07-18
  follow-up reconciles every active `topic-navigation-shell` prompt file with the new behavior;
  source/public-doc/DOX closeout is tracked by the surrounding implementation review. Official
  Quartz upstream files outside the explicit disposable-`content/` fixture exception remain
  untouched.
