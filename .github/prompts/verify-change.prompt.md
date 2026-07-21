---
name: verify-change
description: Verify a change from focused tests through real Quartz integration
agent: agent
argument-hint: "Describe the changed behavior or provide commit/range"
---

Verify `${input:scope:the current change}` against the [architecture
contract](../instructions/architecture.instructions.md) and [verification
contract](../instructions/verification.instructions.md).

1. inspect the exact diff and map each changed behavior to an observable assertion;
2. run focused unit/DOM/style tests first, then package/build/integration gates required by the
   affected surface;
3. inspect generated output, package contents, public exports, and host-shaped DOM rather than
   relying only on command exit codes;
4. use isolated Quartz CLI and base-path variants when loader, manifest, routing, Page Type, or
   packaging behavior changed;
5. use a real browser for popup, responsive layout, Canvas drawer, breadcrumbs, card interactions,
   accessibility, or cross-plugin composition;
6. rerun watch diagnostics only when aggregate invalidation is relevant and always prove clean-build
   correctness afterward; and
7. separate failures caused by the change from pre-existing warnings, missing dependencies, or host
   limitations.

Return an evidence table with requirement, command/inspection, result, and exact revision. List every
unproven or failed requirement plainly; do not convert it into a documented limitation.
