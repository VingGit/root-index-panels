# root-index-panels repository instructions

Read the root [`AGENTS.md`](../AGENTS.md) first. It defines the repository-wide branch, identity, validation, documentation, and maintenance rules.

Before editing, read the instruction file whose scope matches the task:

- repository scope and local Quartz context: [repository instructions](./instructions/repository.instructions.md)
- implementation behavior: [architecture instructions](./instructions/architecture.instructions.md)
- tests and evidence: [verification instructions](./instructions/verification.instructions.md)
- README and agent documentation: [documentation instructions](./instructions/documentation.instructions.md)
- feature branches, commits, pull requests, and release boundaries: [publishing instructions](./instructions/publishing.instructions.md)

Use the reusable files in [`.github/prompts`](./prompts/) for recurring workflows. Do not reproduce linked contracts inside a task prompt or a new instruction file; update the single canonical owner instead.
