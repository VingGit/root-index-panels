# Agent customization index

This branch stores repository instructions and reusable task prompts separately from the code-only
`main` branch.

## Automatically applied instructions

- [`copilot-instructions.md`](./copilot-instructions.md) defines the short repository-wide entry
  contract.
- [`repository.instructions.md`](./instructions/repository.instructions.md) defines ownership,
  source authority, and the parent Quartz worktree boundary.
- [`architecture.instructions.md`](./instructions/architecture.instructions.md) is the single
  technical product contract.
- [`verification.instructions.md`](./instructions/verification.instructions.md) is the single test
  and evidence contract.
- [`documentation.instructions.md`](./instructions/documentation.instructions.md) separates human
  documentation from agent material.
- [`publishing.instructions.md`](./instructions/publishing.instructions.md) defines commit, identity,
  cherry-pick, and branch hygiene.

## Reusable prompts

Run these from VS Code Chat with `/` followed by the file name:

- [`investigate-quartz`](./prompts/investigate-quartz.prompt.md) — verify host APIs before changing
  implementation.
- [`implement-change`](./prompts/implement-change.prompt.md) — implement a scoped feature or fix.
- [`verify-change`](./prompts/verify-change.prompt.md) — select and run proportional verification.
- [`update-documentation`](./prompts/update-documentation.prompt.md) — synchronize human and agent
  documentation without duplicating contracts.
- [`final-review`](./prompts/final-review.prompt.md) — audit the complete change and evidence.
- [`publish-to-main`](./prompts/publish-to-main.prompt.md) — publish main-compatible commits while
  keeping these customizations only on `promptfiles`.

The prompt bodies contain task sequences only. They link to the canonical instruction files instead
of restating product rules.

## Reference material

- [`compatibility-fixture.md`](./reference/compatibility-fixture.md) records the durable three-book
  interoperability lab.
- [`implementation-history.md`](./reference/implementation-history.md) preserves unique historical
  decisions and verification evidence.
- [`source-cross-reference.md`](./reference/source-cross-reference.md) maps every superseded source
  document to its new canonical destination.
