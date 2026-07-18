# Navigation-shell implementation session notes

Populate this file during the implementation run. It is evidence, not a substitute for tests.

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
- Public HAST-to-JSX API and root-content wrapper: the root body renders transformed `file.data.htmlAst`
  once through `@quartz-community/utils/jsx`'s public `htmlToJsx`, inside normal Quartz article and
  Markdown wrappers, before overview and panels. No suppression transform clears `toc`,
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
- DOX/document closeout: the root, plugin, integration, and content DOX chains were re-read after
  implementation; their ownership, topology, fixture, and verification contracts already match the
  delivered behavior. This evidence-only pass changes only `IMPLEMENTATION-NOTES.md` and
  `05-final-review.md`; other plugin docs, parent DOX/general plugin guidance, content DOX/checklist,
  and explicitly superseded appearance evidence are intentionally unchanged because no durable
  contract changed after the implementation commit. Official Quartz upstream files outside the
  explicit disposable-`content/` fixture exception remain untouched.
