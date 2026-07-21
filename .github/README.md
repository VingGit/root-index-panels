# Agent customization index

This directory contains the repository's agent instructions, reusable prompt files, durable technical references, and GitHub workflows. It is versioned on `main` so local agents, pull-request agents, and GitHub Copilot review use the same repository context.

## Automatically applied instructions

- [`copilot-instructions.md`](./copilot-instructions.md) is the repository-wide entry contract.
- [`repository.instructions.md`](./instructions/repository.instructions.md) defines ownership, source authority, and the parent Quartz worktree boundary.
- [`architecture.instructions.md`](./instructions/architecture.instructions.md) is the canonical technical product contract.
- [`verification.instructions.md`](./instructions/verification.instructions.md) defines tests and evidence requirements.
- [`documentation.instructions.md`](./instructions/documentation.instructions.md) separates human documentation from agent material.
- [`publishing.instructions.md`](./instructions/publishing.instructions.md) defines feature branches, commits, pull requests, identity, and branch cleanup.

## Reusable prompts

Run these from VS Code Chat with `/` followed by the prompt name:

- [`investigate-quartz`](./prompts/investigate-quartz.prompt.md) — verify host APIs before changing implementation.
- [`implement-change`](./prompts/implement-change.prompt.md) — implement a scoped feature or fix.
- [`verify-change`](./prompts/verify-change.prompt.md) — select and run proportional verification.
- [`update-documentation`](./prompts/update-documentation.prompt.md) — synchronize human and agent documentation without duplicating contracts.
- [`final-review`](./prompts/final-review.prompt.md) — audit the completed change and evidence.
- [`publish-feature`](./prompts/publish-feature.prompt.md) — publish a completed feature branch through a pull request and clean it up after merge.

Prompt files contain task sequences and output requirements. They link to canonical instruction files instead of restating product or process rules.

## Reference material

- [`compatibility-fixture.md`](./reference/compatibility-fixture.md) records the durable three-book interoperability lab.
- [`implementation-history.md`](./reference/implementation-history.md) preserves unique historical decisions and verification evidence.
- [`source-cross-reference.md`](./reference/source-cross-reference.md) maps superseded source documents to their canonical destinations.

## Maintenance rules

Follow the current Visual Studio Code and GitHub Copilot documentation when adding or editing prompt and instruction files. Keep frontmatter valid, scopes narrow, links relative, and instructions non-duplicative. Remove stale references in the same change that makes them obsolete.
