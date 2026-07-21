# Source migration cross-reference

The agent-document refactor consolidated 21 Markdown sources into canonical repository instructions, prompts, and references. This table records where unique material from each retired source is maintained.

| Original source | Unique material retained at |
| --- | --- |
| `AGENTS.md` | Repository-wide branch, identity, formatting, synchronization, documentation, prompt-maintenance, and bounded independent-fix rules remain at root; detailed contracts live in scoped instructions. |
| `ARCHITECTURE.md` | Product, data, rendering, host, path, options, API, build, and watch contracts consolidated in `instructions/architecture.instructions.md`; test inventory moved to verification. |
| `CHANGELOG.md` | Historical implementation evidence is retained in `reference/implementation-history.md`; the current root changelog remains human-facing and records user-visible changes. |
| `EXAMPLES.md` | Essential installation, configuration, frontmatter, custom-icon, and reader examples remain in root `README.md`; the durable JavaScript/Git/SQL lab moved to `reference/compatibility-fixture.md`; maintainer-only invariants moved to architecture. |
| `README.md` | Rewritten as a human-only install, configuration, and usage guide. Internal contracts, evidence, exhaustive selector/test details, parent-worktree procedure, and agent workflow moved to their canonical instruction or reference owners. |
| `topic-appearance/README.md` | Source authority and local boundaries moved to repository instructions; recurring task order became reusable prompts; completed historical revisions moved to implementation history. |
| `topic-appearance/00-brief-and-guardrails.md` | Listed-physical book model, appearance and security, Figma boundary, ownership, accessibility, packaging, and watch boundary consolidated in architecture; implementation sequence became `implement-change`. Superseded hidden-root and no-sidebar statements were dropped. |
| `topic-appearance/01-discovery-and-contract.md` | Host inspection became `investigate-quartz`; option, icon, accent, schema, localization, and bundling rules moved to architecture; durable decision evidence moved to history. |
| `topic-appearance/02-implementation.md` | Layered regression-first implementation sequence became `implement-change`; resulting current behavior belongs to architecture. |
| `topic-appearance/03-tests-and-accessibility.md` | Book, appearance, locale, SPA, package, host, accessibility, and command gates merged into verification; obsolete assertions were dropped. |
| `topic-appearance/04-documentation-and-release.md` | Human documentation rules moved to documentation instructions; package, release, parent, branch, and pull-request boundaries moved to publishing and repository instructions. |
| `topic-appearance/05-final-review.md` | Current audit method became `final-review`; unique historical checklist evidence moved to implementation history. |
| `topic-appearance/IMPLEMENTATION-NOTES.md` | Baseline revisions and loader, Lucide, tsup, peer, source-map, Preact, and watcher discoveries were retained once in implementation history. |
| `topic-navigation-shell/README.md` | Active scope became architecture; source order and local boundary became repository instructions; run order became prompts; completed evidence moved to history. |
| `topic-navigation-shell/00-brief-and-guardrails.md` | Root, sidebar, host, Figma, accessibility, fixture, and release rules consolidated into architecture, fixture, repository, and publishing instructions. |
| `topic-navigation-shell/01-discovery-and-contract.md` | Inspection and decision gate became `investigate-quartz`; topology, root, sidebar, cache, selector, path, accessibility, and package facts became architecture; proof requirements became verification. |
| `topic-navigation-shell/02-implementation.md` | Reviewable implementation phases became `implement-change`; parent-content allowance moved to repository and fixture references; acceptance invariants remain in architecture and verification. |
| `topic-navigation-shell/03-tests-fixture-and-accessibility.md` | Unit, SSR, CSS, script, package, fixture, Quartz CLI, watch, browser, and accessibility matrices consolidated in verification; the feature specimen matrix moved to the fixture reference. |
| `topic-navigation-shell/04-documentation-integration-and-push.md` | README audience moved to documentation instructions; package and parent boundaries moved to repository instructions; branch, pull-request, push, identity, cleanup, and release rules moved to publishing and `publish-feature`. |
| `topic-navigation-shell/05-final-review.md` | Active checklist became architecture, verification, and `final-review`; superseded intermediate checkboxes were discarded; unique commit, CI, and live-consumer evidence moved to history. |
| `topic-navigation-shell/IMPLEMENTATION-NOTES.md` | Unique revisions, CI URLs, remote install results, browser measurements, dependency discoveries, and the final watch conclusion remain in implementation history. |

## Contract ownership audit

| Topic | Single canonical owner |
| --- | --- |
| Repository-wide branch, identity, formatting, synchronization, and documentation rules | root `AGENTS.md` |
| Parent Quartz and local-write boundary | `instructions/repository.instructions.md` |
| Book, appearance, root, sidebar, host, path, API, packaging, and watch behavior | `instructions/architecture.instructions.md` |
| Tests, commands, integration, browser, accessibility, and evidence | `instructions/verification.instructions.md` |
| Human documentation and agent-document separation | `instructions/documentation.instructions.md` |
| Feature branches, commits, pull requests, branch cleanup, and release boundary | `instructions/publishing.instructions.md` |
| Durable JavaScript, Git, and SQL lab | `reference/compatibility-fixture.md` |
| Point-in-time revisions and verification milestones | `reference/implementation-history.md` |

Reusable prompts link to these owners and contain only invocation-specific workflow. Human-facing documentation does not depend on agent instructions, although both are versioned together on `main`.
