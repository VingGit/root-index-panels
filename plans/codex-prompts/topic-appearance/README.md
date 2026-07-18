# Codex prompt set — topic appearance metadata

This prompt set plans a focused enhancement to `@quartz-community/root-index-panels`: writers can choose a topic panel icon and accent through a first-level directory's `index.md` frontmatter, without coupling this layout plugin to a particular Quartz theme.

## Run order

1. [Brief and guardrails](./00-brief-and-guardrails.md)
2. [Discovery and public contract](./01-discovery-and-contract.md)
3. [Implementation](./02-implementation.md)
4. [Tests and accessibility](./03-tests-and-accessibility.md)
5. [Documentation and release](./04-documentation-and-release.md)
6. [Final review](./05-final-review.md)

Keep these files in the repository as the implementation record. They are not included in the published package because `package.json` has an explicit `files` allowlist.

## Definition of done

The documented frontmatter and optional configuration work, the default stays theme-neutral, all visible strings use Quartz localization, tests/build/check pass, and the README explains both the writer and theme-author paths.
