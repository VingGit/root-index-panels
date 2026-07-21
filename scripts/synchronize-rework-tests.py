from __future__ import annotations

import re
from pathlib import Path


def rewrite(path: str, pattern: str, replacement: str, *, flags: int = re.DOTALL) -> None:
    file = Path(path)
    text = file.read_text()
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count == 0:
        if replacement.strip() in text:
            print(f"{path}: already synchronized")
            return
        raise SystemExit(f"Could not locate synchronization boundary in {path}: {pattern[:100]}")
    file.write_text(updated)
    print(f"{path}: synchronized")


appearance = Path("test/appearance.test.tsx")
text = appearance.read_text()
text = text.replace(
    "  const start = html.indexOf('<a href=\"./alpha/\"')",
    "  const libraryStart = html.indexOf('id=\"rip-books\"')\n"
    "  const start = html.indexOf('<a href=\"./alpha/\"', libraryStart)",
)
text = text.replace("rip-panel-0-title", "rip-book-0-title")
text = text.replace("rip-panel-0-count", "rip-book-0-count")
appearance.write_text(text)
rewrite(
    str(appearance),
    r'  it\("resolves named appearance per book without leaking it to another panel", \(\) => \{.*?\n  \}\)\n',
    '''  it("resolves named appearance per book without leaking it to another panel", () => {
    const html = renderPanels(
      [
        physicalFile("alpha/index", {
          title: "Alpha",
          panel: { icon: "terminal", accent: "brand" },
        }),
        physicalFile("alpha/page"),
        physicalFile("beta/index", { title: "Beta" }),
        physicalFile("beta/page"),
      ],
      { layout, accents: { brand: "#1a2b3c" } },
    )

    // The newest preview and full library each render the same eligible book.
    expect(countOccurrences(html, 'data-rip-icon="terminal"')).toBe(2)
    expect(countOccurrences(html, 'data-rip-accent="brand"')).toBe(2)
    expect(countOccurrences(html, "--rip-panel-accent: #1a2b3c")).toBe(2)
    expect(countOccurrences(html, "rip-panel-icon")).toBe(2)
    expect(html).not.toContain('data-rip-title="Beta" data-rip-accent')
  })
''',
)

inventory = Path("test/book-inventory.test.tsx")
inventory.write_text(inventory.read_text().replace("No subdirectories found.", "No books found."))

locales = Path("test/locales-page-type-manifest.test.tsx")
text = locales.read_text()
if 'styles/root-library.scss' not in text:
    text = text.replace(
        'vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))',
        'vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))\n'
        'vi.mock("../src/components/styles/root-library.scss", () => ({ default: "" }))',
    )
if 'styles/sidebar-rework.scss' not in text:
    text = text.replace(
        'vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "" }))',
        'vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "" }))\n'
        'vi.mock("../src/components/styles/sidebar-rework.scss", () => ({ default: "" }))',
    )
locales.write_text(text)
rewrite(
    str(locales),
    r'describe\("plugin localization", \(\) => \{.*?\n\}\)\n\ndescribe\("RootIndexPanelsPage"',
    '''describe("plugin localization", () => {
  const singularFiles = [physicalFile("java/index", { title: "Java" }), physicalFile("java/one")]
  const pluralFiles = [
    physicalFile("java/index", { title: "Java" }),
    physicalFile("java/one"),
    physicalFile("java/two"),
  ]

  it.each([
    ["en-US", singularFiles, 1, "1 note"],
    ["en-US", pluralFiles, 2, "2 notes"],
    ["fi-FI", singularFiles, 1, "1 muistiinpano"],
    ["fi-FI", pluralFiles, 2, "2 muistiinpanoa"],
  ])("renders the exact %s count for the fixture", (locale, files, count, expected) => {
    const cards = renderPanels(files, { layout: "cards" }, locale)
    const list = renderPanels(files, { layout: "list" }, locale)

    expect(cards).toContain(`aria-hidden="true">${count}</span>`)
    expect(cards).toContain(`>${expected}</span>`)
    expect(list).toContain(`>${expected}</span>`)
  })

  it.each([
    ["en-US", "No books found."],
    ["fi-FI", "Kirjoja ei löytynyt."],
  ])("renders the exact %s empty state", (locale, expected) => {
    expect(renderPanels([physicalFile("index")], undefined, locale)).toContain(expected)
  })

  it("falls back to English for an unsupported locale", () => {
    const count = renderPanels(singularFiles, undefined, "sv-SE")
    const empty = renderPanels([physicalFile("index")], undefined, "sv-SE")

    expect(count).toContain(">1 note</span>")
    expect(empty).toContain("No books found.")
  })

  it.each([
    ["en-US", "books", "total notes", "Explore books", "All books"],
    ["fi-FI", "kirjaa", "muistiinpanoja yhteensä", "Selaa kirjoja", "Kaikki kirjat"],
  ])("localizes the %s root overview", (locale, books, totalNotes, explore, allBooks) => {
    const html = renderPanels(
      [
        physicalFile("git/index", { title: "Git" }),
        physicalFile("git/topic"),
        physicalFile("java/index", { title: "Java" }),
        physicalFile("java/one"),
        physicalFile("java/two"),
      ],
      undefined,
      locale,
    )

    expect(html).toContain(`<dt>${books}</dt><dd>2</dd>`)
    expect(html).toContain(`<dt>${totalNotes}</dt><dd>3</dd>`)
    expect(html).toContain(`href="#rip-books">${explore}`)
    expect(html).toContain(`id="rip-books-heading">${allBooks}</h2>`)
  })

  it("formats the newest overview date in UTC and omits an empty Markdown wrapper", () => {
    const html = renderPanels([
      physicalFile(
        "java/index",
        { title: "Java" },
        { dates: { modified: new Date("2024-01-02T23:00:00-05:00") } },
      ),
      physicalFile("java/topic"),
    ])

    expect(html).toContain(
      '<dt>last edited</dt><dd><time datetime="2024-01-03">Jan 3, 2024</time></dd>',
    )
    expect(html).not.toContain("rip-root-content")
  })

  it("omits finite timestamps outside the ECMAScript Date range", () => {
    const html = renderPanels([
      physicalFile("java/index", { title: "Java" }, { date: 1e100 }),
      physicalFile("java/topic"),
    ])

    expect(html).not.toContain("<dt>last edited</dt>")
    expect(html).toContain("Java")
  })

  it("selects the locale per render rather than at module initialization", () => {
    const Component = RootIndexPanels()
    const english = renderComponent(Component, "index", pluralFiles, "en-US")
    const finnish = renderComponent(Component, "index", pluralFiles, "fi-FI")
    const englishAgain = renderComponent(Component, "index", pluralFiles, "en-US")

    expect(english).toContain(">2 notes</span>")
    expect(finnish).toContain(">2 muistiinpanoa</span>")
    expect(englishAgain).toContain(">2 notes</span>")
  })
})

describe("RootIndexPanelsPage"''',
)
text = locales.read_text()
text = text.replace(
    "    const authoredIndex = html.indexOf('class=\"rip-root-content')\n"
    "    const directoriesIndex = html.indexOf('id=\"rip-directories\"')",
    "    const latestIndex = html.indexOf('class=\"rip-latest\"')\n"
    "    const authoredIndex = html.indexOf('class=\"rip-root-content')\n"
    "    const booksIndex = html.indexOf('id=\"rip-books\"')",
)
text = text.replace(
    "    expect(overviewIndex).toBeLessThan(authoredIndex)\n"
    "    expect(authoredIndex).toBeLessThan(directoriesIndex)",
    "    expect(overviewIndex).toBeLessThan(latestIndex)\n"
    "    expect(latestIndex).toBeLessThan(authoredIndex)\n"
    "    expect(authoredIndex).toBeLessThan(booksIndex)",
)
text = text.replace('id="rip-directories"', 'id="rip-books"')
locales.write_text(text)

sidebar = Path("test/sidebar-navigation.test.tsx")
text = sidebar.read_text()
if 'styles/sidebar-rework.scss' not in text:
    text = text.replace(
        'vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "sidebar-style" }))',
        'vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "sidebar-style" }))\n'
        'vi.mock("../src/components/styles/sidebar-rework.scss", () => ({\n'
        '  default: "sidebar-rework-style",\n'
        '}))',
    )
text = text.replace("Switch manual", "Switch book")
text = text.replace("selected manual", "selected book")
text = text.replace("Vaihda käsikirjaa", "Vaihda kirjaa")
text = text.replace(
    'expect(Sidebar.css).toBe("sidebar-style")',
    'expect(Sidebar.css).toBe("sidebar-style\\nsidebar-rework-style")',
)
sidebar.write_text(text)
rewrite(
    str(sidebar),
    r'  it\("renders only the current book tree with canonical links and active ancestors", \(\) => \{.*?\n  \}\)\n\n  it\("renders typed Canvas',
    '''  it("renders only the current book tree with canonical links and active ancestors", () => {
    const html = renderSidebar("java/setup/install", fixture(), {
      accents: { ocean: "#0f766e" },
      defaultAccent: "theme",
    })
    const menu = switcherMenu(html)
    const scope = sidebarScope(html)

    expect(html).toContain('data-rip-scope="book"')
    expect(html).toContain('<span class="rip-sidebar-switcher-label">Java</span>')
    expect(menu).toMatch(
      /class="rip-sidebar-book-link" href="\.\.\/\.\.\/java\/"[^>]*data-rip-state="ancestor"[^>]*data-rip-selected="true"/,
    )
    expect(menu).toContain('class="rip-sidebar-selected-check"')
    expect(menu).toContain(", selected book</span>")
    expect(html).toContain('data-rip-icon="coffee"')
    expect(html).toContain('data-rip-accent="ocean"')
    expect(html).toContain("--rip-sidebar-accent: #0f766e")
    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-state="ancestor"[^>]*data-rip-open="true"/,
    )
    expect(scope).toMatch(
      /href="\.\.\/\.\.\/java\/setup\/install" aria-current="page" data-rip-state="current"/,
    )
    expect(scope).not.toContain("rip-sidebar-book-overview-link")
    expect(scope).not.toContain(">Overview<")
    expect(scope).toContain("Java Topic")
    expect(scope).toContain('class="rip-sidebar-node-icon" aria-hidden="true" inert')
    expect(scope).not.toContain("Git Topic")
    expect(scope).not.toContain("Loose note")
  })

  it("renders typed Canvas''',
)
rewrite(
    str(sidebar),
    r'  it\("separates selected-manual context from the exact current page", \(\) => \{.*?\n  \}\)\n\n  it\("switches the Explorer',
    '''  it("separates selected-book context from the exact current page", () => {
    const rootNote = renderSidebar("loose", fixture())
    const rootMenu = switcherMenu(rootNote)
    expect(rootMenu).toMatch(/class="rip-sidebar-home" href="\.\/" data-rip-selected="true"/)
    expect(rootMenu).not.toMatch(/class="rip-sidebar-home"[^>]*aria-current=/)

    const bookIndex = renderSidebar("java/index", fixture())
    const bookScope = sidebarScope(bookIndex)
    expect(bookIndex).toMatch(
      /class="rip-sidebar-home-mark" href="\.\.\/java\/"[^>]*aria-current="page" data-rip-state="current"/,
    )
    expect(bookScope).not.toContain("rip-sidebar-book-overview-link")
    expect(switcherMenu(bookIndex)).toMatch(
      /class="rip-sidebar-book-link" href="\.\.\/java\/" aria-current="page" data-rip-state="current" data-rip-selected="true"/,
    )
  })

  it("switches the Explorer''',
)
rewrite(
    str(sidebar),
    r'  it\("opens every top-level folder while keeping inactive nested folders collapsed", \(\) => \{.*?\n  \}\)\n\n  it\("localizes labels',
    '''  it("opens every top-level folder while keeping inactive nested folders collapsed", () => {
    const files = [
      physicalFile("index", { title: "Knowledge Base" }),
      physicalFile("book/index", { title: "Book" }),
      physicalFile("book/active/index", { title: "Active" }),
      physicalFile("book/active/current", { title: "Current" }),
      physicalFile("book/active/deep/index", { title: "Deep" }),
      physicalFile("book/active/deep/page", { title: "Deep page" }),
      physicalFile("book/inactive/index", { title: "Inactive" }),
      physicalFile("book/inactive/page", { title: "Inactive page" }),
    ]
    const scope = sidebarScope(renderSidebar("book/active/current", files))

    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-state="ancestor"[^>]*data-rip-open="true"[\s\S]*?Active<\/span>/,
    )
    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-open="true"[\s\S]*?Inactive<\/span>/,
    )
    expect(scope).toMatch(
      /class="rip-sidebar-folder" data-rip-open="false"[\s\S]*?Deep<\/span>[\s\S]*?<ul[^>]* hidden>/,
    )
    expect(countOccurrences(scope, 'class="rip-sidebar-node-icon"')).toBeGreaterThan(4)
  })

  it("localizes labels''',
)
