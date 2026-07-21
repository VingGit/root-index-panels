# Implementation history

This file preserves unique point-in-time decisions and evidence. Current behavior belongs in the
[architecture contract](../instructions/architecture.instructions.md), and current test requirements
belong in the [verification contract](../instructions/verification.instructions.md).

## Version 0.1.1 — 2026-06-14

The package was converted from the generic community template into a root-index Page Type. It added
directory collection/exclusion/sorting/empty-state tests, adopted `configSchema`, externalized the
host Preact runtime, excluded root notes from panels, and implemented date sorting.

## Appearance increment — 2026-07-18

Baseline revisions:

- parent Quartz: `a6878f323eed859a686a164809830a38180fd10d`
- plugin: `3e0d6dcb9cfb97dac1fba883ddecf4618ef6ed79`
- plugin template: `0bd68d7f3a80f758dfd1abce24341e5d24028670`
- installed Quartz utils: `ff02040c07d0dcb2075994b2acd7cfec710326fa`

Host/API discoveries that remain relevant:

- Quartz shallowly merges manifest defaults, YAML, and a pre-load `quartz.ts` override. Its schema
  cannot describe arbitrary maps accurately.
- `lucide-preact@1.25.0` exports `CodeXml` and `FileCode`, not the legacy `Code2`/`FileCode2` names.
- A blanket tsup `noExternal` rule overrides matching externals and can incorrectly bundle Preact;
  singleton exclusions therefore require artifact verification.
- Public Quartz utility subpaths exposed optional peers (`github-slugger` and later
  `hast-util-to-jsx-runtime`) that had resolved accidentally from an ancestor checkout. They became
  direct dependencies, and ancestor-free verification was added.
- Source-map `sourcesContent` differed by checkout line endings. The build now normalizes embedded
  text to LF for deterministic Windows/Linux `dist/`.
- Direct local plugin installation exposed split Preact hook state in pinned Lucide wrappers. The
  plugin uses their static node data through a hook-free SVG adapter instead of changing Quartz.

The first watcher diagnostic observed stale aggregates after nested add/change/delete; a clean build
corrected them. Later host revisions refreshed some delete paths, so the stable conclusion is the
clean-build boundary rather than a fixed stale-operation count.

## Navigation shell milestones — 2026-07-18

- `f5e8a1eae3018e819b6995d35fb1f4b6013adf99` — `feat: add multi-book navigation shell`;
  GitHub Actions run [29649169553](https://github.com/VingGit/root-index-panels/actions/runs/29649169553)
  passed. Remote stock CLI add/enable resolved the same prebuilt revision.
- `fd5c1f1de447733955459aaf0ee8eb12c8ecd0d9` — `feat: align navigation shell with landing design`;
  GitHub Actions run [29652498365](https://github.com/VingGit/root-index-panels/actions/runs/29652498365)
  passed. Browser checks at 1440/900/390px verified banner-first root order, authored labels,
  isolated book trees, zero selector layout shift, focus restoration, Graph retention, no overflow,
  and the computed card glow/hairline/lift.
- `3b815a5940d902e6e4f8141813ceb0aeee358b64` — `feat: integrate Canvas and Bases navigation`;
  GitHub Actions run [29654796522](https://github.com/VingGit/root-index-panels/actions/runs/29654796522)
  passed. Unit, isolated host, and browser evidence covered typed virtual leaves, both Explorer
  frames, and book-root breadcrumbs.
- `f5d40530cba3016497423529a707cf0ad7971cd3` — `fix: contain Canvas sidebar drawer`;
  GitHub Actions run [29655988881](https://github.com/VingGit/root-index-panels/actions/runs/29655988881)
  passed. Closed/open/closed browser geometry at 1440, 801, 800, and 390px verified inward desktop
  padding, mobile overlay, visible stage/controls, and zero horizontal overflow.

The final recorded stock-shaped consumer used `npx quartz plugin install --latest`, selected the
committed prebuilt distribution, resolved `f5d40530cba3016497423529a707cf0ad7971cd3`, processed 14
inputs below `/group/project/`, and emitted 64 files with one left-priority-40 sidebar entry.

No milestone above bumped the version, tagged, released, published to npm, submitted to a
marketplace, or pushed the parent Quartz repository.
