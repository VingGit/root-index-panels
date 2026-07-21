---
name: final-review
description: Audit implementation, evidence, documentation, and publish readiness
agent: agent
argument-hint: "Describe the completed change or provide commit/range"
---

Perform a final audit of `${input:scope:the current change}`.

Re-open the active request, exact diff, [repository boundaries](../instructions/repository.instructions.md),
[architecture contract](../instructions/architecture.instructions.md), [verification
contract](../instructions/verification.instructions.md), and [publishing
workflow](../instructions/publishing.instructions.md).

Audit, with current evidence:

1. requested scope and absence of unrelated/upstream/forbidden parent edits;
2. book/appearance/root/sidebar/host invariants affected by the change;
3. no-JS, accessibility, SPA cleanup, path/base-directory, malformed-input, and security behavior;
4. manifest/API/dependency/license/package/committed-`dist` alignment;
5. focused, integration, browser, watch, CI, and remote-consumer gates that apply;
6. human README accuracy and absence of duplicated/contradictory agent instructions;
7. branch contents, commit separation, author identity, secret/temporary-artifact review, and
   no-release/no-parent-push boundary.

If an applicable requirement is missing or contradicted, continue fixing/testing when authorized or
report the concrete blocker. Final output must lead with the achieved behavior, then exact commits,
evidence, branch state, remaining limitations, and explicitly unperformed release-side actions.
