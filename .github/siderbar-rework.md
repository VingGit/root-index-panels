---
name: sidebar-rework
description: Implement and verify the version 14–23 sidebar and root-library rework, then remove this handoff prompt
agent: agent
argument-hint: "Apply the sidebar and root-library rework described here"
---

Implement the version 14–23 sidebar and root-library rework in
`@quartz-community/root-index-panels`.

Read [`AGENT_README.md`](./AGENT_README.md),
[`copilot-instructions.md`](./copilot-instructions.md), the applicable files under
[`./instructions/`](./instructions/), and the reusable prompts under
[`./prompts/`](./prompts/) before editing. In particular, use the repository,
architecture, verification, documentation, and publishing contracts; investigate current Quartz APIs
first where a requested behavior is not already supported by this plugin. Treat this file as a
one-time implementation handoff: remove `.github/sidebar-rework.md` in the same final change after
all requested behavior, documentation, generated outputs, and verification evidence are complete.

## Scope and ordering

Implement the following groups in order. Preserve the previous group while working on the next one.
Do not implement prototype-only labels, mock data, or a global visual theme. Use the host site’s
locale, content metadata, theme variables, accessibility conventions, and public Quartz APIs.

### 1. Book landing/sidebar model (versions 14–16)

- A root book card/selector opens that first-level book’s `index.md` by default.
- Do not render that book `index.md` as a regular first item in its Explorer/ToC. It remains the
  book’s landing route and is reachable by a dedicated book-home control.
- Split the book control into a compact square book-mark home button and an adjacent book-switcher
  dropdown. The mark opens the active book’s `index.md`; the dropdown only changes book.
- Make the home role discoverable without duplicating link text: descriptive accessible name and
  tooltip, compact home badge, visible keyboard focus, and a subtle current-page rail when the
  book landing is active.
- Keep normal Quartz folder/file navigation after entering a book. A global site-home control returns
  to the root index/cards.

### 2. Root index prioritizes books (versions 17–19)

- Directly below the root heading, render a compact library summary: book count, note count,
  last-edited information, and a clearly primary “explore books” action. Avoid implementation-facing
  wording such as “directories” in reader-facing UI.
- Before arbitrary root-index prose, render a compact preview of the three most recently edited
  books, newest first. State that the preview is the latest-edited set.
- Keep the complete book grid available below authored root prose. Provide a contextual, nonblocking
  return-to-library action after readers scroll into lengthy prose; it must be keyboard accessible,
  respect reduced motion, and never obscure content at narrow viewports.
- Each card displays its book’s last-edit date in a stable, localizable form. The full library offers
  an accessible sort control for edit date and title, each ascending and descending. Sorting must be
  deterministic, preserve all eligible books, and not alter the top-three latest preview.

### 3. Hidden folder landing pages and independent disclosure (versions 20–21)

- Model every folder as having a landing `index.md`, including nested folders. Selecting the folder
  opens that landing page, but its index note is hidden from the visible Explorer tree.
- Separate the folder-row navigation target from its disclosure control: activating the folder row
  opens its landing page; activating the compact chevron only expands/collapses children.
- A reader on a nested note may collapse its containing folder without navigating away from that
  note. Preserve the selected route, SPA behavior, Back/Forward semantics, and no-JS navigation.
- Do not manufacture client-only routes or rely on mock placeholder documents. Resolve the actual
  Quartz folder/index destination, with base-directory-safe links and graceful handling for absent,
  unlisted, or malformed metadata.

### 4. Scoped accent and active-path states (versions 21–23)

- All selected book notes and selected folders use that book’s configured/derived accent—not a
  hard-coded purple—for the selected-row tint, icon/text treatment, and narrow left rail. Root-level
  notes use the ordinary host/root accent.
- The dedicated book-home button is accented and railed only while its book `index.md` is active.
  When a note or folder is active, return the main book mark to neutral while retaining the small
  home badge in the book accent.
- Apply the same rule to root: the root-home mark receives its rail only on the root `index.md` and
  becomes neutral while a root-level note is selected.
- When a selected note lies under a collapsed folder, use that book accent on the folder’s closed
  chevron and a muted accent-tinted disclosure-button surface so the hidden active path remains
  discoverable. When the folder is open, return its chevron to the normal expanded treatment.
  Ancestors must behave correctly for nested notes.
- The disclosure control has no resting outline. On hover and keyboard focus it receives a clear but
  restrained, theme-compatible border/focus cue. Do not make hover the only discoverability signal.

## Implementation constraints

- Keep this plugin a layout/navigation component, not a theme. Do not impose fonts, a global palette,
  or opaque hard-coded card/sidebar styles. Expose scoped semantic hooks and use Quartz theme custom
  properties for fallbacks.
- Preserve root-only panel rendering, page-type priority/matching, note counts, tags, exclusion,
  sorting options, localization, no-JS SSR, keyboard navigation, and SPA cleanup.
- Respect `cfg.locale` and Quartz translation facilities for every visible changed string. Do not
  hard-code English labels, dates, singular/plural strings, or inaccessible icon-only actions.
- Use public Quartz APIs and actual file data. Validate frontmatter and metadata defensively; never
  inject untrusted values into classes, styles, or markup.
- Do not modify Quartz core or unrelated template/example plugins. Update the package manifest,
  exports, type declarations, docs, tests, and committed `dist/` only when the implementation
  requires them.

## Required verification and final response

Use the relevant reusable prompts, then run the proportional checks required by
[`verification.instructions.md`](./instructions/verification.instructions.md). For source,
manifest, dependency, or distribution edits, run the complete project gate and inspect rendered
output in a real Quartz-shaped fixture at desktop, tablet, and mobile sizes. Cover at least:

1. root index, root note, book index, ordinary book note, folder index, nested note, and nested
   collapsed active-path behavior;
2. book and root home-button active/neutral transitions;
3. folder-row versus disclosure-button keyboard and pointer behavior, including collapsing the active
   note’s ancestor without navigation;
4. latest-three ordering, all sort combinations, localized date/label behavior, malformed/missing
   metadata, dark/light themes, focus visibility, reduced motion, and SPA navigation/cleanup; and
5. base-directory-safe routes, no duplicate controls/listeners, and no JavaScript dependency for core
   links.

Before handing off, inspect the complete diff, synchronize human documentation where behavior is
public, regenerate and commit `dist/` when repository policy requires it, and delete this prompt
file. Report achieved behavior, changed files, exact checks/results, limitations, and explicitly
unperformed release-side actions.
