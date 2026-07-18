# Prompt 03 — Prove correctness, safety, integration, and accessibility

## Objective

Add observable tests at three levels: focused component/Page Type tests, script/DOM lifecycle tests, and a real parent Quartz build fixture. A direct JSX render alone cannot verify loader merging, virtual pages, canonical output paths, prebuilt installation, or GitLab Pages behavior.

## Component and contract tests

Use parameterized cards/list cases where behavior must be identical.

### Book inventory and routing

- Physical first-level content creates one book; root notes do not.
- Virtual `tags/index` and virtual nested FolderPage indexes do not create books or affect counts.
- `unlisted` pages do not create a book, supply metadata, tags, dates, or counts.
- Current synthetic Canvas/Bases Page Type entries without `filePath` do not create books or affect counts.
- The book's own physical index is excluded from its count; authored nested indexes count; virtual indexes do not.
- Reserved `tags`, `excludeDirs`, empty/virtual-only folders, and duplicate input entries behave deterministically.
- A physical `<segment>/index` wins regardless of `allFiles` ordering; a root `segment` note is never metadata.
- Explicit titles such as `iOS` and `eBPF` are preserved; only slug fallback is humanized.
- A segment containing a dot (for example `git.md`) links exactly to `./git.md/`, targeting `git.md/index.html`.
- A candidate without a physical index and with FolderPage disabled is omitted; the same candidate renders when FolderPage supplies its virtual destination.
- `sort: date` uses a newer eligible nested note over an older book index. Every normalized invalid-option case and duplicate physical slug follows the Prompt 01 table.
- Add a large synthetic inventory assertion sufficient to catch a return to per-book full scans if practical without timing-flaky tests.

### Appearance resolution and safety

- Untouched defaults and no `panel` metadata produce no icon wrapper, accent hook, or inline custom property.
- `defaultIcon` is an explicit opt-in; built-ins and custom aliases resolve with alias-first collision behavior.
- Unknown/malformed icon names, invalid alias keys, non-function alias values, whitespace/non-string values, and inherited names fail softly through the exact fallback chain.
- Null, array, primitive, inherited, and partial `panel` values never throw.
- Named, direct, `theme`, omitted, invalid, and `defaultAccent` cases follow the exact precedence in Prompt 01.
- Test every allowed hex length and exact `var(--property)` form, plus invalid registry/default values.
- Reject prototype names and injection strings including `#fff;outline:none`, braces, controls, `url()`, gradients, keywords, arbitrary functions, and `var(--x, red)`.
- Named hooks contain only the safe key; direct colors use `data-rip-accent="direct"`; raw colors never appear in classes/data attributes.
- Resolve each book independently so appearance cannot leak between panels.
- Built-in and custom icons have the frozen `aria-hidden`/`inert` wrapper and non-focusable SVG props, the title remains the usable link name, and each panel contains exactly one anchor with no nested interaction or added `tabindex`.

### Locale and public API

- Render `en-US` and `fi-FI` exact singular, plural, accessible count label, and empty-state outputs.
- An unsupported locale falls back to `en-US`; locale selection occurs per render rather than at module initialization.
- Assert the manifest defaults/schema for YAML-safe options and the absence of function claims for `icons`.
- Type/consumer fixtures import the extended options and `PanelIconComponent` from every intended public entry point.
- Generated declarations later agree in `dist/index.d.ts`, `dist/types.d.ts`, and `dist/components/index.d.ts`.
- The root Page Type's transform removes rendered TOC/reading-time component data through a shallow per-page clone, without mutating the shared file object used by other emitters.

## SPA script lifecycle tests

Exercise the inline script in a DOM-capable test environment:

- initial navigation setup;
- ArrowLeft/Right/Up/Down and Home/End boundaries for both layouts;
- navigate away and back through Quartz SPA events;
- registered cleanup removes listeners;
- repeated navigation does not create duplicate handling;
- zero/one-panel cases do not throw or create unexpected focus behavior.

Keep `window.addCleanup` behavior compatible with Quartz; do not add a second client framework or Motion dependency.

## Host Quartz integration fixture

Use a temporary/isolated content and config fixture, never durable user notes. Install or copy the local built plugin into the ignored plugin cache using the documented development workflow, then run a real parent build with:

- root `index.md`, multiple books, explicit and generated book indexes;
- nested content, unlisted content, a `git.md/` directory, malformed and valid `panel` metadata;
- TagPage and FolderPage enabled;
- YAML-safe plugin options plus a `quartz.ts` `ExternalPlugin.RootIndexPanelsPage(...)` override before `loadQuartzConfig()`;
- SPA enabled and disabled variants;
- `en-US`, `fi-FI`, and unsupported-locale fallback builds;
- a GitLab-style group/project subpath/base URL matching the repository deployment pattern.

Assert generated `public/index.html` contains only the expected books, exact canonical hrefs, localized output, safe hooks, and no virtual Tag Index card. Assert each expected `public/<book>/index.html` destination exists. Verify CSS/resources resolve from the subpath.

Exercise a fresh isolated `quartz plugin add` and assert it creates no component layout stanza and
the rendered root contains exactly one `.rip`. Include headings/body text in the fixture root and
assert that no stale TOC links or reading-time label survive in the root frame, while separately
recording that Search/RSS/OG may still index the source Markdown by design.

Reproduce nested add/change/delete under `npx quartz build --serve` (or the current watch command), record that the root aggregate can remain stale, then prove a clean/full build refreshes it. This is an accepted Quartz API limitation from Prompt 00, not a waiver for full-build correctness.

## Manual visual and accessibility review

- Compare the implemented panel cues with the scoped Figma reference at desktop and narrow/mobile widths; do not reproduce its overflowing desktop sidebars.
- Check cards and list layout, empty state, long titles/descriptions/tags, one and many panels, light/dark themes, token-backed and literal accents.
- Tab reaches each panel once. Arrow/Home/End behavior still works after SPA navigation. Icons add no focus stop or accessible-name noise.
- Focus stays visible with theme/custom accents, Windows forced-colors/high contrast, and keyboard-only use.
- `prefers-reduced-motion: reduce` removes nonessential lift/motion; hover-only cues are not required to understand or activate a panel.
- Token-backed named accents are the recommendation for cross-theme contrast. Literal colors remain an explicit author-controlled override, but never control the only focus cue.

## Commands and artifact checks

Start with a reproducible install. Use Prettier's write mode only for changed files, then use repository scripts as gates:

```bash
npm ci
npx prettier --write <changed-files>
npm run check
npm run build
npm pack --dry-run
git diff --check
```

Run `npm run typecheck`, `npm run lint`, `npm run format`, or `npm run test` separately while diagnosing. `npm run format` is a check, not a writer.

After build/pack:

- fail if committed `dist/` is stale;
- inspect the tarball allowlist and third-party notice;
- import the package root, `./types`, and `./components` from built output;
- scan every generated JavaScript entry for unexpected bare runtime imports, especially `lucide-preact`;
- switch remote and local plugin sources with `quartz plugin remove` followed by `quartz plugin add`; never overlay a remotely locked cache with a junction to the nested repository;
- review scoped statuses in both repositories and remove temporary integration content/config.

Do not waive a required safety/accessibility assertion as a “documented limitation” without user approval. The only pre-approved limitation here is Quartz partial-watch invalidation, with full builds proven correct.
