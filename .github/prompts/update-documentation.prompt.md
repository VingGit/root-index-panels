---
name: update-documentation
description: Synchronize human and agent documentation without duplicated contracts
agent: agent
argument-hint: "Describe the behavior or workflow that changed"
---

Update documentation for `${input:change:the current change}`.

Read the [documentation boundaries](../instructions/documentation.instructions.md) and inspect the
actual implementation, tests, generated config, and CLI behavior before writing.

1. identify the one canonical owner of each changed fact;
2. update `README.md` only when a plugin user or human maintainer needs the information;
3. update the matching instruction file for agent-only architecture, verification, scope, or
   publishing rules;
4. update reference history only for unique evidence or decisions that are no longer current
   contract;
5. make prompts link to canonical instructions rather than restating them;
6. remove stale or contradictory text instead of appending a second version; and
7. verify Markdown links, frontmatter, paths, examples, terminology, and that README links remain
   valid on the code-only `main` branch.

Report which facts moved to which canonical owners and any intentionally unchanged document.
