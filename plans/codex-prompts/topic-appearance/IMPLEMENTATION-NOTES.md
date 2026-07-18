# Implementation session notes

Verified on 2026-07-18 before source implementation.

## Revisions and baseline

- Parent Quartz worktree: `a6878f323eed859a686a164809830a38180fd10d`.
- Plugin baseline: `3e0d6dcb9cfb97dac1fba883ddecf4618ef6ed79`.
- Plugin-template reference: `0bd68d7f3a80f758dfd1abce24341e5d24028670`.
- `npm ci`: passed; the existing dependency tree reported 14 audit findings (7 moderate,
  6 high, 1 critical). No automatic audit rewrite is authorized for this feature.
- Baseline `npm run build`: passed and regenerated the tracked `dist/` output.
- Baseline `npm run check`: typecheck and lint passed; format failed because the repository's
  Prettier default forced LF against a CRLF checkout. `--end-of-line auto` narrowed failures to
  files already changed by planning, so the implementation adds a durable cross-platform
  `endOfLine: auto` setting before treating formatting as a gate.

## Confirmed APIs and packaging

- The local loader uses `quartz.configSchema`, shallowly merges package defaults, YAML, and a
  pre-load `quartz.ts` factory override, and cannot accurately describe arbitrary maps in its
  current schema vocabulary.
- `@quartz-community/utils/path` exports `resolveRelative(current, target)`. The installed utils
  revision is `ff02040c07d0dcb2075994b2acd7cfec710326fa`.
- `lucide-preact@1.25.0` uses Preact `^10.27.2`. It exports the curated icons except the legacy
  names `Code2` and `FileCode2`; stable public keys map to `CodeXml` and `FileCode` respectively.
- Because Lucide and utils are bundled, `THIRD_PARTY_NOTICES.md` must carry Lucide ISC, its
  embedded Feather MIT notice, and the utils MIT notice. CI must scan every generated JS entry.
- The initial literal template rule `noExternal: [/.*/]` bundled Preact despite a matching
  `external` regex because this tsup release gives `noExternal` precedence. The build therefore
  uses a blanket non-singleton matcher with explicit Preact/Quartz/vfile/unified exclusions, and
  artifact verification rejects both unexpected bare dependencies and bundled singleton markers.
- A clean GitHub Actions checkout exposed that `@quartz-community/utils/path` imports
  `github-slugger` while declaring it only as an optional peer. The nested Windows checkout had
  resolved that import accidentally from the parent Quartz `node_modules`. The plugin now declares
  `github-slugger` directly and validates source checks from an ancestor-free checkout.

## Contract revisions from host evidence

- Remove component `defaultPosition`/`defaultPriority`: Quartz's add command otherwise inserts a
  layout component and can render this dual Page Type/component package twice.
- The Page Type will shallow-clone root `fileData` for rendering and omit `toc`, `readingTime`, and
  `text` because the host ContentMeta derives reading time from `text`; the host frame therefore
  cannot link to or describe prose that the panel body hides. It must not mutate the shared
  processed record used by other emitters.
- Search, RSS, sitemap, and social metadata still consume the authored root source independently.
  Public docs therefore recommend a metadata-only `content/index.md` when hidden prose should not
  appear in those outputs.
- Switching the host cache between remote and local sources requires plugin remove/add. Never put
  a junction to the nested worktree beneath a remotely pinned cache path.
- A direct local add from a development worktree exposed split Preact hook state because the
  worktree already contains its auto-installed peer. Quartz upstream remains untouched. The plugin
  now invokes each pinned generated Lucide wrapper only to read its static `iconNode`, then renders
  those SVG nodes through its own hook-free component instead of Lucide's context-consuming Icon.
  Direct local CLI add and host rendering therefore work even with the development peer present;
  the pushed prebuilt checkout installed by the normal `npx quartz plugin add` flow remains the
  authoritative consumption path.

No frozen feature was found to be unimplementable. These revisions close installer and host-frame
gaps that were absent from the initial prompt set.

## Watch evidence

- The isolated stock-host watcher diagnostic observed the documented dependency gap for all three
  operations: nested add emitted the page but left root count `1` instead of `2`; book-index change
  updated the book page but left the root description old; nested deletes rebuilt but left count
  `1` instead of `0`.
- Stopping the watcher and running a clean/full build corrected the root to count `0` and the new
  description. `test/integration/watch-build.mjs` records this as an expected limitation while also
  accepting a future host that invalidates the root correctly.
