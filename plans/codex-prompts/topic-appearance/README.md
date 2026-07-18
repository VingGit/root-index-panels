# Codex prompt set — root books and authored panel appearance

This is the implementation plan for the next `@quartz-community/root-index-panels` increment. It first makes the existing “first-level folder = book” behavior correct against Quartz 5's real Page Type inputs, then adds optional icon/accent metadata inspired by the [Figma Make prototype](https://www.figma.com/make/BaiQVR8caWHbwcXtS4NOzf/Alternative-Landing-Page-Design?code-node-id=0-9&p=f&fullscreen=1).

This prompt set is an implementation record, not the implementation itself. Prompt 01 is the authoritative technical contract; later prompts may add checks but must not silently weaken or reinterpret it.

## Source-of-truth order

When sources disagree, use this order and record the resolution before editing source:

1. The active user request and the applicable `AGENTS.md` chain.
2. The parent repository's current Quartz 5 docs, source, loader, and installed public types.
3. The plugin's current source, manifest, tests, and established compatibility contract.
4. The upstream [Quartz community plugin template](https://github.com/quartz-community/plugin-template/tree/0bd68d7f3a80f758dfd1abce24341e5d24028670) at a recorded commit. Recheck it when implementation begins.
5. The Figma prototype as visual/interaction evidence, within the boundary in Prompt 00. Do not copy its generated React/Tailwind/Motion code.

The local Quartz loader and this plugin's nearer DOX contract require `configSchema`; an upstream template example that still says `optionSchema` does not override them.

## Run order

1. [Brief, book model, and design boundary](./00-brief-and-guardrails.md)
2. [Discovery and frozen public contract](./01-discovery-and-contract.md)
3. [Correctness and appearance implementation](./02-implementation.md)
4. [Tests, integration, and accessibility](./03-tests-and-accessibility.md)
5. [Documentation, packaging, and release boundary](./04-documentation-and-release.md)
6. [Final review and handoff](./05-final-review.md)

The active run records verified revisions, baseline results, and contract drift in
[IMPLEMENTATION-NOTES.md](./IMPLEMENTATION-NOTES.md). Keep that note current when a discovery
changes the plan rather than silently improvising in source.

Run the prompts in order. Do not start source implementation until Prompt 01's gate is satisfied. Keep these files in the repository; `package.json` excludes them from the published package through its explicit `files` allowlist.

## Prerequisites for the implementation run

- Re-read the parent and plugin `AGENTS.md` files in that session.
- Run `npm ci` in the plugin checkout before treating missing local type packages as source defects.
- Capture a clean baseline with `npm run check`, `npm run build`, and scoped `git status` in both repositories.
- Re-read the Quartz docs and source named in Prompt 01, plus the recorded plugin-template revision.
- Keep implementation fixtures outside the user's real `content/` tree, or remove them before handoff.

## Definition of done

- Full builds discover only real, listed first-level content books; virtual TagPage/FolderPage output cannot create or inflate a book.
- Canonical book links, metadata selection, counts, title preservation, and fallback behavior match Prompt 01.
- Optional icon/accent metadata works in cards and list layout without changing default appearance.
- Manifest metadata, public declarations, bundled runtime dependencies, license notices, committed `dist/`, tests, and public docs agree.
- A fresh `quartz plugin add` does not inject a duplicate layout component, and the root frame does not expose TOC or reading-time UI for Markdown that the Page Type replaces.
- Plugin-owned localization, accessibility, SPA lifecycle, light/dark/mobile rendering, and a GitLab-style subpath build are verified.
- The known Quartz watch-mode invalidation limitation is reproduced and documented; a clean full build is the correctness boundary for aggregate root data.
- The DOX closeout is complete, and the final report distinguishes plugin changes, ignored integration-cache changes, and any parent-repository changes.

Implementation work may be committed and pushed from the nested plugin repository once the user starts the promised goal-mode run. Do not create a release version, Git tag, GitHub release, or npm publish without separate authorization.
