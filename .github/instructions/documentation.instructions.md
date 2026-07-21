---
name: Documentation boundaries
description: Human documentation and canonical agent-document ownership rules
applyTo: "{README.md,CHANGELOG.md,AGENTS.md,.github/**/*.md}"
---

# Documentation boundaries

## Human-facing documentation

`README.md` is strictly for plugin users and human maintainers. Keep it concise
and task-oriented: purpose, content prerequisites, installation, update,
removal, copyable configuration, writer frontmatter, supported options,
reader-visible behavior, known limitations, essential development commands,
and license.

Do not place agent procedures, hidden workflow notes, source-file tours,
exhaustive internal invariants, evidence logs, commit rules, or parent-worktree
instructions in `README.md`. Agent-only material belongs under `.github/`.

`CHANGELOG.md` records user-visible additions, changes, fixes, deprecations,
removals, and security corrections. Update its `Unreleased` section whenever
completed work changes observable behavior, compatibility, packaging,
installation, or supported configuration. Do not use the changelog as an agent
scratchpad.

## Root AGENTS

`AGENTS.md` is the repository-wide operational contract. Keep it focused on
branch discipline, commit identity, validation, documentation separation,
prompt maintenance, synchronization duties, and bounded independent fixes. Put
detailed implementation, testing, or host-integration contracts in the scoped
instruction files instead.

## Agent material

Maintain exactly one canonical owner for each fact:

- repository and parent-worktree scope: `repository.instructions.md`;
- product and implementation behavior: `architecture.instructions.md`;
- testing and evidence: `verification.instructions.md`;
- documentation audiences and ownership: this file;
- branches, commits, pull requests, identity, and release procedure:
  `publishing.instructions.md`;
- compatibility lab: `reference/compatibility-fixture.md`; and
- historical decisions and evidence: `reference/implementation-history.md`.

Prompt files contain invocation-specific steps and output requirements only.
Link to instruction files with correct relative Markdown paths instead of
copying rules. When a contract changes, replace the old statement at its owner;
do not append a contradictory history paragraph.

Create and edit `.github/copilot-instructions.md`,
`.github/instructions/*.instructions.md`, and `.github/prompts/*.prompt.md`
according to the current Visual Studio Code and GitHub Copilot documentation.
Keep frontmatter valid, `applyTo` scopes accurate, descriptions specific,
prompt inputs explicit, and tool permissions no broader than required.

Update `reference/source-cross-reference.md` when an original source is retired
or responsibility moves. Preserve only unique historical evidence; current
behavior belongs in architecture, verification, README, or tests rather than
history.
