from pathlib import Path
import json

root = Path.cwd()


def rw(rel, func):
    path = root / rel
    source = path.read_text()
    changed = func(source)
    if changed == source:
        raise SystemExit(f"no change: {rel}")
    path.write_text(changed)


def replace_exact(rel, replacements):
    def transform(source):
        for old, new in replacements:
            count = source.count(old)
            if count != 1:
                raise SystemExit(f"{rel}: expected 1 occurrence, got {count}: {old[:80]!r}")
            source = source.replace(old, new)
        return source

    rw(rel, transform)


replace_exact(
    "src/i18n/types.ts",
    [
        ("  exploreBooks: string\n", "  exploreLibrary: string\n"),
        ("  latestBooksDescription: string\n", ""),
        ("  returnToLibrary: string\n", ""),
    ],
)
replace_exact(
    "src/i18n/locales/en-US.ts",
    [
        ('  exploreBooks: "Explore books",\n', '  exploreLibrary: "Explore library",\n'),
        ('  latestBooksDescription: "The three books edited most recently.",\n', ""),
        ('  returnToLibrary: "Return to library",\n', ""),
    ],
)
replace_exact(
    "src/i18n/locales/fi-FI.ts",
    [
        ('  exploreBooks: "Selaa kirjoja",\n', '  exploreLibrary: "Selaa kirjastoa",\n'),
        ('  latestBooksDescription: "Kolme viimeksi muokattua kirjaa.",\n', ""),
        ('  returnToLibrary: "Palaa kirjastoon",\n', ""),
    ],
)
replace_exact(
    "src/components/RootIndexPanels.tsx",
    [
        ("          {translation.exploreBooks}\n", "          {translation.exploreLibrary}\n"),
        (
            '''            <div class="rip-section-heading rip-section-heading--stacked">\n              <div>\n                <h2 id="rip-latest-heading">{translation.latestBooks}</h2>\n                <p>{translation.latestBooksDescription}</p>\n              </div>\n            </div>\n''',
            '''            <div class="rip-section-heading">\n              <h2 id="rip-latest-heading">{translation.latestBooks}</h2>\n            </div>\n''',
        ),
        (
            '''          <div class="rip-root-content markdown-preview-view markdown-rendered">\n            {htmlToJsx(tree as Parameters<typeof htmlToJsx>[0])}\n            <a class="rip-return-link" href="#rip-books">\n              {translation.returnToLibrary}\n              <span aria-hidden="true">↓</span>\n            </a>\n          </div>\n''',
            '''          <div class="rip-root-content markdown-preview-view markdown-rendered">\n            {htmlToJsx(tree as Parameters<typeof htmlToJsx>[0])}\n          </div>\n''',
        ),
    ],
)
replace_exact(
    "src/options.ts",
    [
        (
            '  const defaultIcon = normalizeRegistryIdentifier(ownDataValue(options, "defaultIcon")) ?? ""\n',
            '  const defaultIcon =\n    normalizeRegistryIdentifier(ownDataValue(options, "defaultIcon")) ?? "book-open"\n',
        )
    ],
)
replace_exact(
    "src/types.ts",
    [
        (
            "  /** Built-in or custom icon alias used when a book does not resolve one. */\n",
            "  /** Built-in or custom icon alias used when a book does not resolve one. Default: `book-open`. */\n",
        )
    ],
)

package_path = root / "package.json"
package_data = json.loads(package_path.read_text())
package_data["quartz"]["defaultOptions"]["defaultIcon"] = "book-open"
package_path.write_text(json.dumps(package_data, indent=2) + "\n")

replace_exact(
    "src/components/styles/panels.scss",
    [
        (
            '''  border: 1px solid var(--lightgray);\n  border-radius: 0.45rem;\n  color: var(--gray);\n  background: var(--light);\n  font-size: 0.8rem;\n  text-decoration: none;\n\n  &:hover {\n    border-color: var(--secondary);\n    color: var(--secondary);\n  }\n''',
            '''  border: 1px solid color-mix(in srgb, var(--secondary) 60%, var(--lightgray));\n  border-radius: 0.45rem;\n  color: var(--secondary);\n  background: color-mix(in srgb, var(--secondary) 13%, var(--light));\n  font-size: 0.8rem;\n  font-weight: 650;\n  text-decoration: none;\n  transition:\n    border-color 140ms ease,\n    background-color 140ms ease,\n    box-shadow 140ms ease,\n    transform 140ms ease;\n\n  &:hover {\n    border-color: var(--secondary);\n    background: color-mix(in srgb, var(--secondary) 21%, var(--light));\n    box-shadow: 0 0.25rem 0.8rem color-mix(in srgb, var(--secondary) 18%, transparent);\n    transform: translateY(-1px);\n  }\n''',
        ),
        (
            '''  .rip .rip-card-link,\n  .rip .rip-card-link::before,\n  .rip .rip-card-link::after,\n  .rip .rip-card-title,\n  .rip .rip-list-link {\n    transition: none;\n  }\n\n  .rip--cards .rip-card-link:hover {\n    transform: none;\n  }\n''',
            '''  .rip .rip-browse-link,\n  .rip .rip-card-link,\n  .rip .rip-card-link::before,\n  .rip .rip-card-link::after,\n  .rip .rip-card-title,\n  .rip .rip-list-link {\n    transition: none;\n  }\n\n  .rip .rip-browse-link:hover,\n  .rip--cards .rip-card-link:hover {\n    transform: none;\n  }\n''',
        ),
    ],
)

root_library = root / "src/components/styles/root-library.scss"
source = root_library.read_text()
start = source.index(".rip-section-heading--stacked")
end = source.index(".rip-library-heading", start)
source = source[:start] + source[end:]
start = source.index(".rip-return-link")
end = source.index("#rip-books", start)
source = source[:start] + source[end:]
source = source.replace(
    '''@media (prefers-reduced-motion: reduce) {\n  .rip-return-link {\n    scroll-behavior: auto;\n  }\n}\n\n''',
    "",
)
source = source.replace(
    '''  .rip-latest,\n  .rip-sort select,\n  .rip-return-link {\n    border-color: CanvasText;\n  }\n\n  .rip-sort select:focus-visible,\n  .rip-return-link:focus-visible {\n    outline-color: Highlight;\n  }\n''',
    '''  .rip-latest,\n  .rip-sort select {\n    border-color: CanvasText;\n  }\n\n  .rip-sort select:focus-visible {\n    outline-color: Highlight;\n  }\n''',
)
root_library.write_text(source)

replace_exact(
    "src/components/styles/sidebar.scss",
    [
        (
            '''.rip-sidebar [data-rip-state="current"] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 12%, transparent);\n  font-weight: 650;\n}\n\n.rip-sidebar [data-rip-state="ancestor"] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  font-weight: 600;\n}\n''',
            '''.rip-sidebar-home[data-rip-state="current"],\n.rip-sidebar-book-link[data-rip-state="current"],\n.rip-sidebar-note-link[data-rip-state="current"] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  background: var(--highlight);\n  background: color-mix(in srgb, var(--rip-sidebar-accent, var(--secondary)) 12%, transparent);\n  font-weight: 650;\n}\n\n.rip-sidebar-home[data-rip-state="ancestor"],\n.rip-sidebar-book-link[data-rip-state="ancestor"],\n.rip-sidebar-note-link[data-rip-state="ancestor"] {\n  color: var(--rip-sidebar-accent, var(--secondary));\n  font-weight: 600;\n}\n''',
        ),
        (
            '''  .rip-sidebar [data-rip-state="current"],\n  .rip-sidebar-switcher-menu [data-rip-selected="true"] {\n''',
            '''  .rip-sidebar-home[data-rip-state="current"],\n  .rip-sidebar-book-link[data-rip-state="current"],\n  .rip-sidebar-note-link[data-rip-state="current"],\n  .rip-sidebar-switcher-menu [data-rip-selected="true"] {\n''',
        ),
    ],
)
replace_exact(
    "src/components/styles/sidebar-rework.scss",
    [
        (
            '''.rip-sidebar-folder-link[data-rip-state="current"],\n.rip-sidebar-note-link[data-rip-state="current"] {\n''',
            '''.rip-sidebar-note-link {\n  position: relative;\n}\n\n.rip-sidebar-folder-link[data-rip-state="current"],\n.rip-sidebar-note-link[data-rip-state="current"] {\n''',
        )
    ],
)

replace_exact(
    "README.md",
    [
        ('      defaultIcon: ""\n', "      defaultIcon: book-open\n"),
        (
            '| `defaultIcon`         | `""`           | Built-in or TypeScript-registered icon used as a fallback.             |',
            "| `defaultIcon`         | `book-open`    | Built-in or TypeScript-registered icon used as a fallback.             |",
        ),
    ],
)
readme = root / "README.md"
source = readme.read_text()
source = source.replace(
    '''The root page renders:\n\n1. a compact book and note summary with a primary library link;\n2. the three most recently edited books;\n3. authored root Markdown followed by a return-to-library link; and\n4. the complete sortable library.\n''',
    '''The root page renders:\n\n1. a compact book and note summary with a highlighted “Explore library” link;\n2. the three most recently edited books;\n3. authored root Markdown; and\n4. the complete sortable library.\n''',
)
needle = "The reader can reorder the complete library by newest edit, oldest edit, ascending title, or\ndescending title. This does not change the separate latest-three preview.\n"
if needle not in source:
    raise SystemExit("README reader paragraph missing")
source = source.replace(
    needle,
    needle
    + "\nBooks without authored icon metadata use a theme-colored open-book mark in the root library and\nbook switcher. Set `defaultIcon` to another built-in or TypeScript-registered alias to override it.\n",
)
readme.write_text(source)

replace_exact(
    "CHANGELOG.md",
    [
        (
            '''- Add a latest-edited three-book preview, localized edit dates, deterministic reader-controlled\n  library sorting, and a return-to-library action around authored root content.\n''',
            '''- Add a latest-edited three-book preview, localized edit dates, and deterministic reader-controlled\n  library sorting.\n''',
        ),
        (
            "- Prioritize book terminology and the book collection throughout the root page and sidebar.\n",
            '''- Rename the primary root action to “Explore library” and keep it visibly highlighted with a\n  theme-compatible hover treatment.\n- Give books without authored icon metadata a theme-colored open-book mark in the root library and\n  book switcher.\n- Constrain current note and folder backgrounds and rails to the selected row instead of the whole\n  sidebar tree.\n- Prioritize book terminology and the book collection throughout the root page and sidebar.\n''',
        ),
        (
            '''### Removed\n\n- Remove the obsolete branch-sync, filtered-diff, and automatic main-sync workflows.\n''',
            '''### Removed\n\n- Remove the bottom return-to-library action and the redundant latest-preview explanatory sentence.\n- Remove the obsolete branch-sync, filtered-diff, and automatic main-sync workflows.\n''',
        ),
    ],
)

replace_exact(
    ".github/instructions/architecture.instructions.md",
    [
        (
            '''1. `.rip-overview` statistics and a no-JavaScript `#rip-books` action when books exist;\n2. `.rip-latest`, containing at most the three newest books in deterministic date order;\n3. authored root HAST, followed by a keyboard-accessible return-to-library link; and\n4. `#rip-books`, containing the complete library or localized empty state.\n''',
            '''1. `.rip-overview` statistics and a persistently highlighted, localized no-JavaScript\n   `#rip-books` “Explore library” action when books exist;\n2. `.rip-latest`, containing only its localized heading and at most the three newest books in\n   deterministic date order;\n3. authored root HAST without a trailing return action; and\n4. `#rip-books`, containing the complete library or localized empty state.\n''',
        ),
        (
            '''The disclosure control has no resting outline. Hover and `:focus-visible` provide restrained border\nor outline cues compatible with Quartz tokens. Accent is never the only focus or current-state cue.\n''',
            '''The disclosure control has no resting outline. Hover and `:focus-visible` provide restrained border\nor outline cues compatible with Quartz tokens. Accent is never the only focus or current-state cue.\nCurrent-state backgrounds and rails must be anchored to the interactive row itself; broad descendant\nstate selectors must not tint a containing folder or the full sidebar tree.\n''',
        ),
        (
            '''own aliases win built-in collisions. Unknown icons fall back once to `defaultIcon`, then render no\nicon.\n''',
            '''own aliases win built-in collisions. The normalized `defaultIcon` is `book-open`, including when a\nconfiguration omits it or supplies an empty string. Unknown authored icons fall back once to that\ndefault; an explicitly configured unresolved default still renders no icon.\n''',
        ),
        (
            '''Plugin-owned `en-US` and `fi-FI` catalogs cover book/note counts, edit dates, latest/all library\nlabels, sorting, return action, switcher, home marks, folder disclosure, Explorer, and empty state.\n''',
            '''Plugin-owned `en-US` and `fi-FI` catalogs cover book/note counts, edit dates, the Explore library\naction, latest/all library labels, sorting, switcher, home marks, folder disclosure, Explorer, and\nempty state.\n''',
        ),
    ],
)
replace_exact(
    ".github/instructions/verification.instructions.md",
    [
        (
            "- the contextual return action appears only with authored content and targets `#rip-books`;\n",
            '''- the localized Explore library action targets `#rip-books`, remains visibly highlighted at rest,\n  and has hover/focus/reduced-motion/forced-color coverage;\n- the latest section contains its heading without a redundant explanatory paragraph, and authored\n  content has no trailing return action;\n''',
        ),
        (
            '''- scoped book accents on selected rows, exact-current home, and collapsed hidden active paths without\n  cross-book leakage.\n''',
            '''- scoped book accents on selected rows, exact-current home, and collapsed hidden active paths without\n  cross-book leakage; and\n- current backgrounds and rails stay inside the selected interactive row rather than applying to a\n  containing folder or the full browser tree.\n''',
        ),
    ],
)

replace_exact(
    "test/locales-page-type-manifest.test.tsx",
    [
        (
            '["en-US", "books", "total notes", "Explore books", "All books"],',
            '["en-US", "books", "total notes", "Explore library", "All books"],',
        ),
        (
            '["fi-FI", "kirjaa", "muistiinpanoja yhteensä", "Selaa kirjoja", "Kaikki kirjat"],',
            '["fi-FI", "kirjaa", "muistiinpanoja yhteensä", "Selaa kirjastoa", "Kaikki kirjat"],',
        ),
        ('    expect(defaults.defaultIcon).toBe("")\n', '    expect(defaults.defaultIcon).toBe("book-open")\n'),
        (
            '''    expect(html).toContain("Authored root prose sentinel.")\n    expect(html).toContain('id="rip-books"')\n''',
            '''    expect(html).toContain("Authored root prose sentinel.")\n    expect(html).not.toContain("rip-return-link")\n    expect(html).not.toContain("The three books edited most recently.")\n    expect(html).toContain('id="rip-books"')\n''',
        ),
    ],
)
replace_exact(
    "test/appearance.test.tsx",
    [
        (
            '''  it("renders untouched defaults without an icon or accent hook", () => {\n    const html = renderPanels(bookFiles(), { layout })\n\n    expect(html).not.toContain("rip-panel-icon")\n    expect(html).not.toContain("data-rip-icon")\n    expect(html).not.toContain("data-rip-accent")\n    expect(html).not.toContain("--rip-panel-accent")\n  })\n\n  it("treats defaultIcon as an explicit opt-in", () => {\n    const html = renderPanels(bookFiles(), { layout, defaultIcon: "book-open" })\n\n    expect(html).toContain('data-rip-icon="book-open"')\n    expect(html).toContain('class="rip-panel-icon"')\n  })\n''',
            '''  it("renders the theme-neutral open-book fallback without an accent hook", () => {\n    const html = renderPanels(bookFiles(), { layout })\n\n    expect(html).toContain('data-rip-icon="book-open"')\n    expect(html).toContain('class="rip-panel-icon"')\n    expect(html).not.toContain("data-rip-accent")\n    expect(html).not.toContain("--rip-panel-accent")\n  })\n\n  it("treats an empty configured default as the open-book fallback", () => {\n    const html = renderPanels(bookFiles(), { layout, defaultIcon: "" })\n\n    expect(html).toContain('data-rip-icon="book-open"')\n  })\n\n  it("lets a configured default override the open-book fallback", () => {\n    const html = renderPanels(bookFiles(), { layout, defaultIcon: "coffee" })\n\n    expect(html).toContain('data-rip-icon="coffee"')\n    expect(html).toContain('class="rip-panel-icon"')\n  })\n''',
        ),
        (
            '''      expect(() => renderAppearance(panel)).not.toThrow()\n      expect(renderAppearance(panel)).not.toContain("data-rip-icon")\n''',
            '''      expect(() => renderAppearance(panel)).not.toThrow()\n      expect(renderAppearance(panel)).toContain('data-rip-icon="book-open"')\n''',
        ),
        (
            '''    expect(renderAppearance(panel)).not.toContain("data-rip-icon")\n    expect(getterCalls).toBe(0)\n''',
            '''    expect(renderAppearance(panel)).toContain('data-rip-icon="book-open"')\n    expect(getterCalls).toBe(0)\n''',
        ),
    ],
)

sidebar_test = root / "test/sidebar-style.test.ts"
source = sidebar_test.read_text()
source = source.replace(
    'const compactStyleSource = styleSource.replace(/\\s+/g, "")\n',
    '''const compactStyleSource = styleSource.replace(/\\s+/g, "")\nconst reworkStyleSource = readFileSync(\n  new URL("../src/components/styles/sidebar-rework.scss", import.meta.url),\n  "utf8",\n)\n''',
)
insert = '''\n  it("contains current backgrounds and rails to interactive rows", () => {\n    expect(styleSource).not.toContain('.rip-sidebar [data-rip-state="current"]')\n    expect(styleSource).not.toContain('.rip-sidebar [data-rip-state="ancestor"]')\n    expect(styleSource).toContain('.rip-sidebar-note-link[data-rip-state="current"]')\n    expect(reworkStyleSource).toMatch(\n      /\\.rip-sidebar-note-link\\s*\\{[\\s\\S]*?position:\\s*relative;/,\n    )\n  })\n'''
position = source.rfind("\n})")
source = source[:position] + insert + source[position:]
sidebar_test.write_text(source)

integration = root / "test/integration/parent-build.mjs"
source = integration.read_text()
source = source.replace(
    '  assert.match(bodyHtml, /class="rip-browse-link" href="#rip-books"/)\n',
    '''  assert.match(bodyHtml, /class="rip-browse-link" href="#rip-books"/)\n  assert.ok(\n    bodyHtml.includes(`class="rip-browse-link" href="#rip-books">${expectedLabels.exploreLibrary}`),\n    "root Explore library action was not localized",\n  )\n  assert.equal(classCount(bodyHtml, "rip-return-link"), 0, "obsolete return action rendered")\n  const latestStart = bodyHtml.indexOf('<section class="rip-latest"')\n  const latestEnd = bodyHtml.indexOf("</section>", latestStart)\n  assert.ok(latestStart >= 0 && latestEnd > latestStart, "could not isolate latest section")\n  assert.doesNotMatch(\n    bodyHtml.slice(latestStart, latestEnd + 10),\n    /<p(?:\\s|>)/,\n    "latest section retained its redundant explanatory paragraph",\n  )\n''',
)
source = source.replace(
    '{ switchBook: "Switch book", explorer: "Explorer", bookHome: "Open iOS home" }',
    '''{\n          switchBook: "Switch book",\n          explorer: "Explorer",\n          bookHome: "Open iOS home",\n          exploreLibrary: "Explore library",\n        }''',
)
source = source.replace(
    '          bookHome: "Avaa kirjan iOS etusivu",\n',
    '          bookHome: "Avaa kirjan iOS etusivu",\n          exploreLibrary: "Selaa kirjastoa",\n',
)
source = source.replace(
    '''      assert.doesNotMatch(itemForHref(rootHtml, "./custom/"), /data-rip-icon=|rip-panel-icon/)\n      assert.doesNotMatch(\n        sidebarBookAnchorForHref(rootHtml, "./custom/"),\n        /data-rip-icon=|rip-sidebar-book-icon/,\n      )\n''',
    '''      assert.match(itemForHref(rootHtml, "./custom/"), /data-rip-icon="book-open"/)\n      assert.match(\n        sidebarBookAnchorForHref(rootHtml, "./custom/"),\n        /data-rip-icon="book-open"/,\n      )\n''',
)
integration.write_text(source)

for rel in [
    ".github/workflows/sync-followup.yml",
    ".github/workflows/export-followup.yml",
    ".github/workflows/export-followup-trigger.yml",
    ".github/reference/live-followup-request.md",
    ".github/reference/.keep-followup",
    ".github/reference/followup-status.txt",
    ".github/reference/followup-current.txt",
]:
    path = root / rel
    if path.exists():
        path.unlink()

print("follow-up changes applied")
