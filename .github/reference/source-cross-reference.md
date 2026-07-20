# Source migration cross-reference

The refactor started from 21 Markdown files and 4,157 lines on `promptfiles`. This table records the
canonical destination for every original source. Superseded files were removed only after this map,
the destination review, and link/term checks were complete.

| Original source | Unique material retained at |
| --- | --- |
| `AGENTS.md` | Minimal branch entry remains at root; ownership, local Quartz context, implementation rules, checks, and release boundary moved to repository, architecture, verification, and publishing instructions. |
| `ARCHITECTURE.md` | Product/data/rendering/host/path/options/API/build/watch contract consolidated in `instructions/architecture.instructions.md`; test inventory moved to verification. |
| `CHANGELOG.md` | Dated/versioned milestones and unique CI/remote-consumer evidence retained in `reference/implementation-history.md`; current behavior is owned by architecture and README. |
| `EXAMPLES.md` | Essential installation/config/frontmatter/custom-icon/reader examples retained in root `README.md`; durable JavaScript/Git/SQL lab moved to `reference/compatibility-fixture.md`; maintainer-only invariants moved to architecture. |
| `README.md` | Rewritten as a human-only install/config/use guide. Internal contracts, evidence, exhaustive selector/test details, parent-worktree procedure, and release workflow moved to their canonical instruction/reference owners. |
| `topic-appearance/README.md` | Source authority/local boundaries moved to repository instructions; run order became reusable prompts; completed historical revisions moved to implementation history. |
| `topic-appearance/00-brief-and-guardrails.md` | Listed-physical book model, appearance/security, Figma boundary, ownership, accessibility, packaging, and watch boundary consolidated in architecture; implementation task became `implement-change`. Superseded hidden-root/no-sidebar statements were intentionally dropped. |
| `topic-appearance/01-discovery-and-contract.md` | Host inspection became `investigate-quartz`; exact option/icon/accent/schema/localization/bundling rules moved to architecture; decision evidence moved to history. Superseded root-suppression/manifest rules were dropped. |
| `topic-appearance/02-implementation.md` | Layered regression-first implementation sequence became `implement-change`; all resulting current behavior is in architecture. |
| `topic-appearance/03-tests-and-accessibility.md` | Non-superseded book, appearance, locale, SPA, package, host, accessibility, and command gates merged into verification; obsolete root-hidden/no-layout assertions were dropped. |
| `topic-appearance/04-documentation-and-release.md` | Human documentation rules moved to documentation instructions; package/release/parent boundaries moved to publishing and repository instructions. |
| `topic-appearance/05-final-review.md` | Current audit method became `final-review`; historical checklist state became implementation history only where it supplied unique evidence. |
| `topic-appearance/IMPLEMENTATION-NOTES.md` | Exact baseline revisions, loader/Lucide/tsup/peer/source-map/Preact discoveries, and watcher conclusion retained once in implementation history. |
| `topic-navigation-shell/README.md` | Active scope became architecture; source order/local boundary became repository instructions; run order became prompts; completed evidence moved to history. |
| `topic-navigation-shell/00-brief-and-guardrails.md` | Root/sidebar/host/Figma/accessibility/fixture/release rules consolidated into architecture, fixture reference, and repository/publishing instructions. |
| `topic-navigation-shell/01-discovery-and-contract.md` | Inspection and decision gate became `investigate-quartz`; frozen topology/root/sidebar/cache/selector/path/a11y/package facts became architecture; proof requirements became verification. |
| `topic-navigation-shell/02-implementation.md` | Reviewable implementation phases became `implement-change`; parent-content allowance moved to repository and fixture reference; acceptance invariants remain in architecture/verification. |
| `topic-navigation-shell/03-tests-fixture-and-accessibility.md` | Unit/SSR/CSS/script/package/fixture/Quartz CLI/watch/browser/a11y matrices and command gate consolidated in verification; feature-specimen matrix moved to the fixture reference. |
| `topic-navigation-shell/04-documentation-integration-and-push.md` | README audience moved to documentation instructions; package/parent boundaries to repository; commit/push/release rules to publishing and `publish-to-main`; remote verification to verification. |
| `topic-navigation-shell/05-final-review.md` | Active checklist became architecture plus verification and `final-review`; superseded intermediate checkboxes were discarded; unique commit/CI/live-consumer evidence moved to history. |
| `topic-navigation-shell/IMPLEMENTATION-NOTES.md` | Unique revisions, CI URLs, remote install results, browser measurements, dependency discoveries, and final watch conclusion retained in implementation history. Repeated current behavior was not copied. |

## Contract ownership audit

| Topic | Single canonical owner |
| --- | --- |
| Root branch redirect | root `AGENTS.md` |
| Parent Quartz/local-write boundary | `instructions/repository.instructions.md` |
| Book, appearance, root, sidebar, host, path, API, packaging, watch behavior | `instructions/architecture.instructions.md` |
| Tests, commands, integration, browser, accessibility, evidence | `instructions/verification.instructions.md` |
| Human README and agent-document separation | `instructions/documentation.instructions.md` |
| Commit identity, branch isolation, cherry-pick, push, release boundary | `instructions/publishing.instructions.md` |
| Durable JavaScript/Git/SQL lab | `reference/compatibility-fixture.md` |
| Point-in-time revisions and verification milestones | `reference/implementation-history.md` |

Reusable prompts link to these owners and contain only invocation-specific workflow. The root README
duplicates only public-facing behavior required for humans and does not depend on `.github`, which
is absent from `main`.
