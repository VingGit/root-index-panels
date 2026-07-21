# Source migration cross-reference

The agent-document refactor consolidated 21 Markdown sources into canonical
repository instructions, prompts, and references. This file records where
unique material from each retired source is maintained.

## Root documents

- `AGENTS.md`: repository-wide branch, identity, formatting, synchronization,
  documentation, prompt-maintenance, and bounded independent-fix rules remain at
  root. Detailed contracts live in scoped instructions.
- `ARCHITECTURE.md`: product, data, rendering, host, path, options, API, build,
  and watch contracts moved to `instructions/architecture.instructions.md`.
  Test inventory moved to verification.
- `CHANGELOG.md`: historical implementation evidence remains in
  `reference/implementation-history.md`. The current root changelog is
  human-facing and records user-visible changes.
- `EXAMPLES.md`: essential installation, configuration, frontmatter,
  custom-icon, and reader examples remain in root `README.md`. The durable
  JavaScript, Git, and SQL lab moved to
  `reference/compatibility-fixture.md`. Maintainer-only invariants moved to
  architecture.
- `README.md`: rewritten as a human-only installation, configuration, and usage
  guide. Internal contracts, evidence, exhaustive selector and test details,
  parent-worktree procedure, and agent workflow moved to their canonical
  instruction or reference owners.

## Appearance planning sources

- `topic-appearance/README.md`: source authority and local boundaries moved to
  repository instructions. Recurring task order became reusable prompts.
  Completed historical revisions moved to implementation history.
- `topic-appearance/00-brief-and-guardrails.md`: the listed-physical book model,
  appearance and security, Figma boundary, ownership, accessibility, packaging,
  and watch boundary moved to architecture. The implementation sequence became
  `implement-change`. Superseded hidden-root and no-sidebar statements were
  dropped.
- `topic-appearance/01-discovery-and-contract.md`: host inspection became
  `investigate-quartz`. Option, icon, accent, schema, localization, and bundling
  rules moved to architecture. Durable decision evidence moved to history.
- `topic-appearance/02-implementation.md`: the layered regression-first
  implementation sequence became `implement-change`. Resulting current behavior
  belongs to architecture.
- `topic-appearance/03-tests-and-accessibility.md`: book, appearance, locale,
  SPA, package, host, accessibility, and command gates moved to verification.
  Obsolete assertions were dropped.
- `topic-appearance/04-documentation-and-release.md`: human documentation rules
  moved to documentation instructions. Package, release, parent, branch, and
  pull-request boundaries moved to publishing and repository instructions.
- `topic-appearance/05-final-review.md`: the current audit method became
  `final-review`. Unique historical checklist evidence moved to implementation
  history.
- `topic-appearance/IMPLEMENTATION-NOTES.md`: baseline revisions and loader,
  Lucide, tsup, peer, source-map, Preact, and watcher discoveries remain once in
  implementation history.

## Navigation-shell planning sources

- `topic-navigation-shell/README.md`: active scope moved to architecture. Source
  order and local boundaries moved to repository instructions. Run order became
  prompts. Completed evidence moved to history.
- `topic-navigation-shell/00-brief-and-guardrails.md`: root, sidebar, host,
  Figma, accessibility, fixture, and release rules moved to architecture, the
  fixture reference, and repository and publishing instructions.
- `topic-navigation-shell/01-discovery-and-contract.md`: inspection and the
  decision gate became `investigate-quartz`. Topology, root, sidebar, cache,
  selector, path, accessibility, and package facts moved to architecture. Proof
  requirements moved to verification.
- `topic-navigation-shell/02-implementation.md`: reviewable implementation
  phases became `implement-change`. The parent-content allowance moved to
  repository and fixture references. Acceptance invariants remain in
  architecture and verification.
- `topic-navigation-shell/03-tests-fixture-and-accessibility.md`: unit, SSR,
  CSS, script, package, fixture, Quartz CLI, watch, browser, and accessibility
  matrices moved to verification. The feature specimen matrix moved to the
  fixture reference.
- `topic-navigation-shell/04-documentation-integration-and-push.md`: README
  audience moved to documentation instructions. Package and parent boundaries
  moved to repository instructions. Branch, pull-request, push, identity,
  cleanup, and release rules moved to publishing and `publish-feature`.
- `topic-navigation-shell/05-final-review.md`: the active checklist became
  architecture, verification, and `final-review`. Superseded intermediate
  checkboxes were discarded. Unique commit, CI, and live-consumer evidence
  moved to history.
- `topic-navigation-shell/IMPLEMENTATION-NOTES.md`: unique revisions, CI URLs,
  remote installation results, browser measurements, dependency discoveries,
  and the final watch conclusion remain in implementation history.

## Contract ownership audit

- Repository-wide branch, identity, formatting, synchronization, and
  documentation rules: root `AGENTS.md`.
- Parent Quartz and local-write boundary:
  `instructions/repository.instructions.md`.
- Book, appearance, root, sidebar, host, path, API, packaging, and watch
  behavior: `instructions/architecture.instructions.md`.
- Tests, commands, integration, browser, accessibility, and evidence:
  `instructions/verification.instructions.md`.
- Human documentation and agent-document separation:
  `instructions/documentation.instructions.md`.
- Feature branches, commits, pull requests, branch cleanup, and release
  boundary: `instructions/publishing.instructions.md`.
- Durable JavaScript, Git, and SQL lab:
  `reference/compatibility-fixture.md`.
- Point-in-time revisions and verification milestones:
  `reference/implementation-history.md`.

Reusable prompts link to these owners and contain only invocation-specific
workflow. Human-facing documentation does not depend on agent instructions,
although both are versioned together on `main`.
