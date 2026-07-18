import type { QuartzComponentProps } from "@quartz-community/types"
import render from "preact-render-to-string"
import { describe, expect, it, vi } from "vitest"

vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "sidebar-style" }))

import RootIndexSidebar, { type RootIndexSidebarOptions } from "../src/components/RootIndexSidebar"
import {
  buildSidebarNavigationModel,
  getSidebarLinkState,
  getSidebarNavigationModel,
  selectSidebarNavigationScope,
} from "../src/navigation"
import { componentProps, physicalFile, virtualFile, type PluginFile } from "./helpers"

function fixture(): PluginFile[] {
  return [
    physicalFile("index", { title: "Home" }),
    physicalFile("loose", { title: "Loose note" }),
    physicalFile("java", { title: "Java root note" }),
    physicalFile("java/index", {
      title: "Java",
      panel: { icon: "coffee", accent: "ocean" },
    }),
    physicalFile("java/topic", { title: "Java Topic" }),
    physicalFile("java/setup/index", { title: "Setup" }),
    physicalFile("java/setup/install", { title: "Install" }),
    physicalFile("java/private", { title: "Private", unlisted: true }, { unlisted: true }),
    physicalFile("git/index", { title: "Git" }),
    physicalFile("git/topic", { title: "Git Topic" }),
    virtualFile("tags/index", { title: "Tags" }),
    physicalFile("tags/manual", { title: "Tags Manual" }),
  ]
}

function renderSidebar(
  slug: string,
  allFiles: PluginFile[],
  options?: RootIndexSidebarOptions,
  locale = "en-US",
  displayClass?: "mobile-only" | "desktop-only",
): string {
  const props = componentProps(slug, allFiles, locale) as QuartzComponentProps
  props.displayClass = displayClass
  const Sidebar = RootIndexSidebar(options)
  return render(Sidebar(props) as Parameters<typeof render>[0])
}

describe("sidebar navigation model", () => {
  it("separates root notes from alphabetized book-scoped hierarchies", () => {
    const model = buildSidebarNavigationModel(fixture(), { excludeDirs: [] })

    expect(model.rootNotes.map((note) => [note.title, note.slug])).toEqual([
      ["Java root note", "java"],
      ["Loose note", "loose"],
    ])
    expect(model.books.map((book) => book.title)).toEqual(["Git", "Java"])

    const java = model.books.find((book) => book.segment === "java")
    expect(java?.children.map((node) => [node.kind, node.title])).toEqual([
      ["folder", "Setup"],
      ["note", "Java Topic"],
    ])
    const setup = java?.children[0]
    expect(setup?.kind).toBe("folder")
    if (setup?.kind !== "folder") throw new Error("Expected Setup folder")
    expect(setup.slug).toBe("java/setup/index")
    expect(setup.children.map((node) => node.title)).toEqual(["Install"])
    expect(JSON.stringify(model)).not.toContain("Private")
    expect(JSON.stringify(model)).not.toContain("Tags Manual")
    expect(Object.isFrozen(model)).toBe(true)
    expect(Object.isFrozen(java?.children)).toBe(true)
  })

  it("requires listed physical content and a physical or generated book destination", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("generated/topic", { title: "Generated Topic" }),
      virtualFile("generated/index", { title: "Generated" }),
      virtualFile("virtual-only/index", { title: "Virtual only" }),
      physicalFile("hidden/index", { title: "Hidden", unlisted: true }, { unlisted: true }),
      physicalFile("hidden/topic", { title: "Secret", unlisted: true }, { unlisted: true }),
      physicalFile("canvas-book/topic", { title: "Canvas topic" }),
      virtualFile("canvas-book/index", {}, { canvasData: {} }),
      physicalFile("bases-book/topic", { title: "Bases topic" }),
      virtualFile("bases-book/index", {}, { basesData: {} }),
      { slug: "/invalid/index", filePath: "invalid.md" } as unknown as PluginFile,
    ])

    expect(model.books.map((book) => book.segment)).toEqual(["generated"])
    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["Generated Topic"])
  })

  it("uses a generated nested index only to link a folder that has physical content", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      virtualFile("book/generated/index", { title: "Generated folder" }),
      physicalFile("book/generated/topic", { title: "Topic" }),
      virtualFile("book/empty/index", { title: "Empty generated folder" }),
    ])

    const generated = model.books[0]?.children[0]
    expect(generated?.kind).toBe("folder")
    if (generated?.kind !== "folder") throw new Error("Expected generated folder")
    expect(generated.title).toBe("Generated folder")
    expect(generated.slug).toBe("book/generated/index")
    expect(generated.children.map((node) => node.title)).toEqual(["Topic"])
    expect(JSON.stringify(model)).not.toContain("Empty generated folder")
  })

  it("caches by allFiles identity without conflating option variants", () => {
    const files = fixture()
    const first = getSidebarNavigationModel(files, { excludeDirs: [] })
    const second = getSidebarNavigationModel(files, { excludeDirs: [] })
    const excluded = getSidebarNavigationModel(files, { excludeDirs: ["java"] })
    const byCount = getSidebarNavigationModel(files, { excludeDirs: [], sort: "docCount" })

    expect(second).toBe(first)
    expect(excluded).not.toBe(first)
    expect(byCount).not.toBe(first)
    expect(excluded.books.map((book) => book.segment)).toEqual(["git"])
    expect(byCount.books.map((book) => book.segment)).toEqual(["java", "git"])

    files.push(physicalFile("new/index", { title: "New" }))
    expect(getSidebarNavigationModel(files, { excludeDirs: [] })).toBe(first)
    expect(
      getSidebarNavigationModel([...files], { excludeDirs: [] }).books.map((book) => book.segment),
    ).toEqual(["git", "java", "new"])
  })

  it("keeps the book switcher in the configured panel order", () => {
    const files = [
      physicalFile("alpha/index", { title: "Alpha" }),
      physicalFile("alpha/one", {}, { dates: { modified: new Date("2024-01-01") } }),
      physicalFile("alpha/two"),
      physicalFile("beta/index", { title: "Beta" }),
      physicalFile("beta/one", {}, { dates: { modified: new Date("2026-01-01") } }),
    ]

    expect(buildSidebarNavigationModel(files).books.map((book) => book.title)).toEqual([
      "Alpha",
      "Beta",
    ])
    expect(
      buildSidebarNavigationModel(files, { sort: "docCount" }).books.map((book) => book.title),
    ).toEqual(["Alpha", "Beta"])
    expect(
      buildSidebarNavigationModel(files, { sort: "date" }).books.map((book) => book.title),
    ).toEqual(["Beta", "Alpha"])
  })

  it("selects Home or one known book and distinguishes ancestors", () => {
    const model = buildSidebarNavigationModel(fixture())

    expect(selectSidebarNavigationScope(model, "loose").kind).toBe("root")
    const bookScope = selectSidebarNavigationScope(model, "java/setup/install")
    expect(bookScope.kind).toBe("book")
    expect(bookScope.book?.segment).toBe("java")
    expect(selectSidebarNavigationScope(model, "tags/index").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "404").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "unknown/index").kind).toBe("root")
    expect(selectSidebarNavigationScope(model, "/invalid").kind).toBe("none")

    expect(getSidebarLinkState("java/setup/install", "java/setup/install")).toBe("current")
    expect(getSidebarLinkState("java/index", "java/setup/install")).toBe("ancestor")
    expect(getSidebarLinkState("git/index", "java/setup/install")).toBeUndefined()
    expect(getSidebarLinkState("index", "java/setup/install")).toBeUndefined()
  })

  it("ignores inherited fields, accessors, malformed exclusions, and duplicate slugs", () => {
    const inherited = Object.assign(
      Object.create({ slug: "inherited/index", filePath: "inherited/index.md" }),
      { frontmatter: { title: "Inherited" } },
    ) as PluginFile
    const throwing = Object.create(null) as PluginFile
    Object.defineProperty(throwing, "slug", {
      enumerable: true,
      get() {
        throw new Error("must not execute")
      },
    })
    Object.defineProperty(throwing, "filePath", { value: "throwing.md", enumerable: true })
    const revokedFrontmatter = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedFrontmatter.revoke()
    const files = [
      inherited,
      throwing,
      {
        slug: "broken/topic",
        filePath: "broken/topic.md",
        frontmatter: revokedFrontmatter.proxy,
      } as PluginFile,
      physicalFile("safe/index", { title: "Safe" }),
      physicalFile("safe/topic", { title: "First" }),
      physicalFile("safe/topic", { title: "Duplicate" }),
    ]

    expect(() =>
      buildSidebarNavigationModel(files, {
        excludeDirs: ["", "safe/nested", "safe\\nested", 1, "missing"],
      }),
    ).not.toThrow()
    const model = buildSidebarNavigationModel(files)
    expect(model.books.map((book) => book.segment)).toEqual(["safe"])
    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["First"])

    const revokedOptions = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedOptions.revoke()
    expect(() => buildSidebarNavigationModel(files, revokedOptions.proxy)).not.toThrow()

    const revokedFiles = Proxy.revocable<PluginFile[]>([], {})
    revokedFiles.revoke()
    expect(getSidebarNavigationModel(revokedFiles.proxy)).toEqual({ books: [], rootNotes: [] })
  })
})

describe("RootIndexSidebar SSR", () => {
  it("renders native Home/book switching and only root physical notes on root routes", () => {
    const html = renderSidebar("index", fixture())

    expect(html).toContain('<nav class="rip-sidebar"')
    expect(html).toContain('aria-label="Book navigation"')
    expect(html).toContain(
      '<details class="rip-sidebar-shell" open><summary class="rip-sidebar-toggle">Book navigation</summary>',
    )
    expect(html).toMatch(/class="rip-sidebar-home" href="\.\/" aria-current="page"/)
    expect(html).toContain('<details class="rip-sidebar-switcher">')
    expect(html).toContain('<span class="rip-sidebar-switcher-label">Home</span>')
    expect(html).toMatch(
      /<summary><span class="rip-sidebar-switcher-label">Home<\/span><\/summary>/,
    )
    expect(html).toContain('href="./java/"')
    expect(html).toContain('href="./git/"')
    expect(html).toContain('href="./loose"')
    expect(html).toContain("Java root note")
    expect(html).not.toContain("Java Topic")
    expect(html).not.toContain("Git Topic")
    expect(html).not.toContain("Private")
  })

  it("renders only the current book tree with canonical links and active ancestors", () => {
    const html = renderSidebar("java/setup/install", fixture(), {
      accents: { ocean: "#0f766e" },
      defaultAccent: "theme",
    })

    expect(html).toContain('data-rip-scope="book"')
    expect(html).toContain('<span class="rip-sidebar-switcher-label">Java</span>')
    expect(html).toMatch(
      /class="rip-sidebar-book-link" href="\.\.\/\.\.\/java\/"[^>]*data-rip-state="ancestor"/,
    )
    expect(html).toContain('data-rip-icon="coffee"')
    expect(html).toContain('data-rip-accent="ocean"')
    expect(html).toContain("--rip-sidebar-accent: #0f766e")
    expect(html).toMatch(/<details open>\s*<summary data-rip-state="ancestor">/)
    expect(html).toMatch(
      /href="\.\.\/\.\.\/java\/setup\/install" aria-current="page" data-rip-state="current"/,
    )
    expect(html).toContain("Java Topic")
    expect(html).not.toContain("Git Topic")
    expect(html).not.toContain("Loose note")
  })

  it("localizes labels, preserves display classes, and exposes Explorer opt-out", () => {
    const html = renderSidebar(
      "index",
      fixture(),
      { replaceExplorer: false },
      "fi-FI",
      "desktop-only",
    )

    expect(html).toContain('class="desktop-only rip-sidebar"')
    expect(html).toContain('aria-label="Kirjojen navigointi"')
    expect(html).not.toContain("data-rip-replace-explorer")
    expect(html).toContain(">Etusivu</span>")
    expect(html).toContain(">Kirjojen navigointi</summary>")
    expect(html).toContain(">Muistiinpanot</h2>")
  })

  it("escapes authored text and fails malformed appearance data softly", () => {
    const files = [
      physicalFile("index"),
      physicalFile("safe/index", {
        title: '<img src=x onerror="alert(1)">',
        panel: { icon: "constructor", accent: "#fff;display:none" },
      }),
      physicalFile("safe/topic", { title: "Topic" }),
    ]
    const html = renderSidebar("safe/topic", files, {
      defaultIcon: "constructor",
      defaultAccent: "#fff;display:none",
      icons: Object.create({ constructor: () => null }) as RootIndexSidebarOptions["icons"],
      accents: Object.create({ constructor: "#fff" }) as RootIndexSidebarOptions["accents"],
    })

    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;>")
    expect(html).not.toContain("<img src=x")
    expect(html).not.toContain("display:none")
    expect(html).not.toContain('data-rip-icon="constructor"')
  })

  it("attaches only the scoped stylesheet to the component", () => {
    const Sidebar = RootIndexSidebar()
    expect(Sidebar.css).toBe("sidebar-style")
    expect(Sidebar.afterDOMLoaded).toBeUndefined()
  })
})
