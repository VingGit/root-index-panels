---
name: Documentation boundaries
description: Human README and canonical agent-document ownership rules
applyTo: "{README.md,AGENTS.md,.github/**/*.md}"
---

# Documentation boundaries

## Human README

`README.md` is strictly for plugin users and human maintainers. Keep it concise and task-oriented:
purpose, content prerequisites, installation/update/removal, copyable configuration, writer
frontmatter, supported options, reader-visible behavior, the watch limitation, essential
development commands, and license.

Do not place agent procedures, source-file tours, exhaustive internal invariants, evidence logs,
commit rules, or parent-worktree instructions in the README. Do not link the README to promptfiles-
only `.github` material because the same README is published on `main`.

## Root AGENTS

`AGENTS.md` has one purpose: force an agent to switch to `promptfiles` before it does anything and
then direct it to `.github`. Do not add the implementation contract there. Its separate commit is
main-compatible.

## Agent material

Maintain exactly one canonical owner for each fact:

- repository/parent scope: `repository.instructions.md`;
- product and implementation behavior: `architecture.instructions.md`;
- testing/evidence: `verification.instructions.md`;
- documentation audience: this file;
- branch/commit/release procedure: `publishing.instructions.md`;
- compatibility lab: `reference/compatibility-fixture.md`; and
- historical decisions/evidence: `reference/implementation-history.md`.

Prompt files contain invocation-specific steps and output requirements only. Link to instruction
files with correct relative Markdown paths instead of copying rules. When a contract changes,
replace the old statement at its owner; do not append a contradictory history paragraph.

Update `reference/source-cross-reference.md` when an original source is retired or responsibility
moves. Preserve only unique historical evidence; current behavior belongs in architecture or tests,
not in history.
