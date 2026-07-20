---
name: Branch and publishing workflow
description: Commit identity, promptfiles isolation, cherry-picks, and release boundaries
applyTo: "**"
---

# Branch and publishing workflow

## Permanent branch model

`main` contains code, package files, generated distribution, human `README.md`, and the minimal root
`AGENTS.md`. It must not contain `.github` AI instructions/prompts or the retired
`plans/codex-prompts` tree.

`promptfiles` is the development branch. It contains the same main-compatible files plus the
complete `.github` customization library. Never merge `promptfiles` into `main`.

All repository work starts on `promptfiles`, as enforced by root `AGENTS.md`.

## Commit separation

Before committing, inspect branch, status, diff, diff-stat, ignored files, generated artifacts, and
secrets. Preserve unrelated work and stage explicit paths.

Create separate commits for:

1. `README.md` changes only;
2. `AGENTS.md` changes only;
3. each coherent code/test/package/`dist/` change, without `.github` customizations; and
4. `.github` prompt/instruction/reference changes, without code or README changes.

For branch-transfer purposes, README is a main-compatible code-side document but still always owns
its own commit. An AGENTS change also owns its own commit because main must retain only the minimal
branch redirect.

## Transfer to main

After the main-compatible commits pass their required checks:

1. record their exact commit hashes;
2. switch to `main` and update it safely without discarding work;
3. cherry-pick only the intended README, AGENTS, and code/test/package/`dist/` commits in order;
4. verify that the main diff contains no `.github` customization or `plans/codex-prompts` path;
5. push `main`;
6. switch back to `promptfiles`, ensure it contains all main-compatible commits plus the separate
   customization commit, and push `promptfiles`; and
7. finish on `promptfiles`.

If conflicts occur, resolve only the intended files and rerun proportional checks. Do not use a
merge commit or force-push to approximate the workflow.

## Identity

Before creating or pushing any commit, configure and verify:

```bash
git config user.name VingGit
git config user.email 61470249+VingGit@users.noreply.github.com
```

Inspect the resulting commit author and committer before pushing. Do not rewrite existing history
solely to change old identity metadata.

## Verification and push boundary

Run the checks required by [the verification contract](./verification.instructions.md) before
publishing. Confirm remote/branch targets immediately before each push and verify remote refs and
branch diffs afterward.

A push does not authorize a version bump, tag, GitHub release, npm publication, marketplace action,
or parent Quartz push. Those actions always require separate user authorization.
