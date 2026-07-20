# root-index-panels repository instructions

The root [`AGENTS.md`](../AGENTS.md) is the branch entry point. This file assumes its branch rule has
already been followed.

Before editing, read the instruction file whose scope matches the task:

- repository scope and local Quartz context: [repository instructions](./instructions/repository.instructions.md)
- implementation behavior: [architecture instructions](./instructions/architecture.instructions.md)
- tests and evidence: [verification instructions](./instructions/verification.instructions.md)
- README and agent documentation: [documentation instructions](./instructions/documentation.instructions.md)
- commits and branch transfer: [publishing instructions](./instructions/publishing.instructions.md)

Use the reusable files in [`.github/prompts`](./prompts/) for recurring workflows. Do not reproduce
the linked contracts inside a task prompt or a new instruction file; update the one canonical owner
instead.
