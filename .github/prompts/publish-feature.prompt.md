---
name: publish-feature
description: Publish a completed feature branch through a pull request and clean it up after merge
agent: agent
argument-hint: "Describe the completed feature, fix, or maintenance work"
---

Publish `${input:scope:the current completed work}` using the [branch and publishing workflow](../instructions/publishing.instructions.md).

1. confirm that the current branch is a temporary feature branch created from `main`;
2. inspect local and remote refs, status, working and staged diffs, ignored files, generated artifacts, secrets, and unrelated changes;
3. configure and verify the required `VingGit` name and noreply email;
4. run Prettier in write mode, review its changes, and rerun the formatting check;
5. run the checks required by the changed surfaces and verify generated/package artifacts when applicable;
6. confirm that source, tests, `dist/`, package metadata, `README.md`, `CHANGELOG.md`, and applicable `.github` material are synchronized;
7. create coherent commits, push the feature branch, and open a pull request targeting `main`;
8. report the branch, commit hashes, pull request, checks, incidental fixes, and remaining review requirements; and
9. after the pull request is merged, update local `main`, delete the feature branch locally and remotely, prune stale refs, and finish on clean `main`.

Do not commit directly to `main`, leave a merged feature branch behind, force-push `main`, publish a release, or push the parent Quartz repository.
