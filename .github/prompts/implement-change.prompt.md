---
name: implement-change
description: Implement a scoped root-index-panels feature or fix
agent: agent
argument-hint: "Describe the feature, fix, or refactor"
---

Implement `${input:goal:the requested change}` in this plugin.

Read the [repository boundaries](../instructions/repository.instructions.md), [architecture
contract](../instructions/architecture.instructions.md), and [verification
contract](../instructions/verification.instructions.md). Use `investigate-quartz` first when host
APIs or rendered behavior are not already established.

1. inspect branch, status, existing tests, and the narrow owning modules;
2. state the intended observable contract and add or update failing regression coverage where
   practical;
3. reuse existing inventory, option, appearance, path, localization, and lifecycle helpers rather
   than creating competing definitions;
4. implement the smallest coherent change entirely inside the plugin, except for explicitly allowed
   parent `content/` fixture work;
5. use public Quartz APIs and preserve no-JS SSR, accessibility, SPA cleanup, host ownership, and
   malformed-input defenses;
6. update manifest/types/dependencies/notices/build inputs and regenerate `dist/` only when the
   change requires them;
7. run proportional checks, inspect the complete diff, and update the canonical documentation owner
   if behavior changed.

Do not publish unless the user requested it. Report changed behavior, files, exact checks/results,
remaining limitations, and any decision that still needs approval.
