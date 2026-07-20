---
name: publish-to-main
description: Publish main-compatible commits while isolating AI customizations on promptfiles
agent: agent
argument-hint: "Describe the commits or current work to publish"
---

Publish `${input:scope:the current completed work}` using the [branch and publishing
workflow](../instructions/publishing.instructions.md).

1. confirm `promptfiles`, inspect both local/remote refs, status, diff, ignored files, generated
   artifacts, secrets, and unrelated changes;
2. configure and verify the required `VingGit` name and noreply email;
3. run the checks required by the changed surfaces;
4. create or verify separate README-only, AGENTS-only, coherent code-side, and `.github`-
   customization commits;
5. switch to `main` and cherry-pick only main-compatible README, AGENTS, and code-side commits;
6. prove `main` contains no `.github` AI customizations or `plans/codex-prompts`, then push it;
7. switch back to `promptfiles`, prove it contains the main-compatible commits plus the separate
   customization commit, push it, and remain there; and
8. verify remote branch heads and compare branch file lists/diffs.

Do not merge the branches, combine the commit classes, force-push, publish a release, or push the
parent Quartz repository. Report exact commit hashes, cherry-pick order, checks, and final remote
heads.
