---
name: investigate-quartz
description: Verify current Quartz and plugin contracts before implementation
agent: agent
argument-hint: "Describe the proposed change or host behavior to investigate"
---

Investigate `${input:goal:the proposed plugin change}` without editing implementation files.

Read the [repository boundaries](../instructions/repository.instructions.md) and the relevant parts
of the [architecture contract](../instructions/architecture.instructions.md). Then:

1. inspect scoped status in the plugin and, when local, the parent Quartz checkout;
2. record exact plugin, parent Quartz, and relevant template/dependency revisions;
3. inspect current Quartz docs, public types, source, CLI behavior, and rendered output needed for
   this decision;
4. inspect the plugin source, manifest, tests, distribution, and configuration surfaces that own the
   behavior;
5. run the smallest baseline checks that distinguish environment failure from source failure;
6. compare observed facts with the canonical architecture and identify drift or contradiction; and
7. stop before source edits if the requested behavior requires a Quartz-core change, a contract
   revision, or unresolved user choice.

Return a concise decision record: evidence inspected, current behavior, frozen implementation
boundary, affected files/tests, risks, and the specific gate that authorizes or blocks implementation.
