import { describe, expect, it } from "vitest"

import { collectBooks } from "../src/books"
import { normalizeRootIndexPanelsOptions } from "../src/options"
import {
  inventoryOptions,
  physicalFile,
  renderPanels,
  type PluginFile,
  virtualFile,
} from "./helpers"

const layouts = ["cards", "list"] as const

describe.each(layouts)("book inventory and routing (%s)", (layout) => {
  it("creates books from physical descendants without promoting root notes", () => {
    const html = renderPanels(
      [
        physicalFile("index"),
        physicalFile("lonely-note", { title: "Lonely Note" }),
        physicalFile("java/getting-started"),
        virtualFile("java/index"),
      ],
      { layout },
    )

    expect(html).toContain('href="./java/"')
    expect(html).toContain("Java")
    expect(html).toContain("1 note")
    expect(html).not.toContain("Lonely Note")
    expect(html).not.toContain("lonely-note")
  })

  it("ignores virtual tag, folder, Canvas, and Bases entries for candidates and counts", () => {
    const html = renderPanels(
      [
        physicalFile("real/index", { title: "Real book" }),
        physicalFile("real/note"),
        virtualFile("real/nested/index", { title: "Generated nested folder" }),
        physicalFile("tags/topic"),
        virtualFile("tags/index", { title: "Tag Index" }),
        physicalFile("canvas-book/note"),
        virtualFile("canvas-book/index", {}, { canvasData: {} }),
        virtualFile("canvas-book/board", { title: "Synthetic Canvas" }, { canvasData: {} }),
        physicalFile("bases-book/note"),
        virtualFile("bases-book/index", {}, { basesData: {} }),
        virtualFile("bases-book/database", { title: "Synthetic Bases" }, { basesData: {} }),
      ],
      { layout },
    )

    expect(html).toContain("Real book")
    expect(html).toContain("1 note")
    expect(html).not.toContain("Tag Index")
    expect(html).not.toContain("Generated nested folder")
    expect(html).not.toContain("Canvas")
    expect(html).not.toContain("Bases")
  })

  it("excludes unlisted candidates, metadata, tags, dates, and counts", () => {
    const html = renderPanels(
      [
        physicalFile("visible/note", {}, { dates: { modified: new Date("2024-01-01") } }),
        virtualFile("visible/index"),
        physicalFile(
          "visible/index",
          {
            title: "Leaked title",
            description: "Leaked description",
            tags: ["leaked-tag"],
          },
          { unlisted: true, dates: { modified: new Date("2099-01-01") } },
        ),
        physicalFile("visible/hidden", {}, { unlisted: true }),
        physicalFile("secret/index", { title: "Secret" }, { unlisted: true }),
        physicalFile("secret/page", {}, { unlisted: true }),
        virtualFile("secret/index"),
      ],
      { layout, descriptionFallback: "Fallback description" },
    )

    expect(html).toContain("Visible")
    expect(html).toContain("Fallback description")
    expect(html).toContain("1 note")
    expect(html).not.toContain("Leaked")
    expect(html).not.toContain("leaked-tag")
    expect(html).not.toContain("Secret")
  })

  it("ignores throwing frontmatter accessors without invoking authored code", () => {
    let accessorReads = 0
    const frontmatter: Record<string, unknown> = {}
    for (const key of ["title", "description", "tags", "panel", "date"]) {
      Object.defineProperty(frontmatter, key, {
        enumerable: true,
        get() {
          accessorReads += 1
          throw new Error(`unexpected ${key} accessor read`)
        },
      })
    }

    const html = renderPanels(
      [physicalFile("accessor/index", frontmatter), physicalFile("accessor/note")],
      { layout, defaultIcon: "coffee", descriptionFallback: "Safe fallback" },
    )

    expect(accessorReads).toBe(0)
    expect(html).toContain("Accessor")
    expect(html).toContain("Safe fallback")
    expect(html).toContain('data-rip-icon="coffee"')
  })

  it("ignores revoked frontmatter and option proxies", () => {
    const revokedFrontmatter = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedFrontmatter.revoke()
    const revokedOptions = Proxy.revocable<Record<string, unknown>>({}, {})
    revokedOptions.revoke()
    const files = [
      physicalFile("revoked/index", revokedFrontmatter.proxy as unknown as Record<string, unknown>),
      physicalFile("revoked/note"),
    ]

    expect(() => renderPanels(files, revokedOptions.proxy)).not.toThrow()
    expect(renderPanels(files, revokedOptions.proxy)).toContain("Revoked")
  })

  it("rejects noncanonical root-panel slugs", () => {
    const html = renderPanels(
      [
        physicalFile("valid/index", { title: "Valid" }),
        physicalFile("valid/note"),
        physicalFile("/leading/index", { title: "Leading" }),
        physicalFile("/leading/note"),
        physicalFile("doubled//index", { title: "Doubled" }),
        physicalFile("doubled//note"),
        physicalFile("trailing/index/", { title: "Trailing" }),
        physicalFile("trailing/note/"),
        physicalFile("backslash\\index", { title: "Backslash" }),
        physicalFile("backslash\\note"),
      ],
      { layout },
    )

    expect(html).toContain('href="./valid/"')
    expect(html).not.toContain("Leading")
    expect(html).not.toContain("Doubled")
    expect(html).not.toContain("Trailing")
    expect(html).not.toContain("Backslash")
  })

  it("excludes the book index and virtual indexes but counts authored nested indexes", () => {
    const html = renderPanels(
      [
        physicalFile("java/index", { title: "Java" }),
        physicalFile("java/chapter/index"),
        physicalFile("java/chapter/page"),
        virtualFile("java/generated/index"),
      ],
      { layout },
    )

    expect(html).toContain("2 notes")
  })

  it("handles reserved, excluded, index-only, virtual-only, and case-sensitive names", () => {
    const html = renderPanels(
      [
        physicalFile("tags/page"),
        physicalFile("tags/index", { title: "Reserved Tags" }),
        physicalFile("archive/index", { title: "Excluded archive" }),
        physicalFile("Archive/index", { title: "Case-sensitive Archive" }),
        physicalFile("index/index", { title: "Index directory book" }),
        physicalFile("empty/index", { title: "Index-only book" }),
        virtualFile("virtual-only/index", { title: "Virtual-only book" }),
      ],
      { layout, excludeDirs: [" archive ", "archive", ""] },
    )

    expect(html).not.toContain("Reserved Tags")
    expect(html).not.toContain("Excluded archive")
    expect(html).toContain("Case-sensitive Archive")
    expect(html).toContain("Index directory book")
    expect(html).toContain('href="./index/"')
    expect(html).toContain("Index-only book")
    expect(html).toContain("0 notes")
    expect(html).not.toContain("Virtual-only book")
  })

  it("selects the listed physical index regardless of ordering and never a root note", () => {
    const html = renderPanels(
      [
        virtualFile("kernel/index", { title: "Generated title" }),
        physicalFile("kernel", {
          title: "Root impostor",
          description: "Wrong description",
          tags: ["wrong"],
        }),
        physicalFile("kernel/page"),
        physicalFile("kernel/index", {
          title: "eBPF",
          description: "Authored description",
          tags: ["linux"],
        }),
      ],
      { layout },
    )

    expect(html).toContain("eBPF")
    expect(html).toContain("Authored description")
    if (layout === "cards") expect(html).toContain("#linux")
    expect(html).not.toContain("Root impostor")
    expect(html).not.toContain("Wrong description")
    expect(html).not.toContain("Generated title")
  })

  it("preserves explicit title casing and humanizes only a slug fallback", () => {
    const html = renderPanels(
      [
        physicalFile("ios/index", { title: "iOS" }),
        physicalFile("ebpf/index", { title: "eBPF" }),
        physicalFile("foo-bar/index"),
      ],
      { layout },
    )

    expect(html).toContain("iOS")
    expect(html).toContain("eBPF")
    expect(html).toContain("Foo bar")
    expect(html).not.toContain("Ios")
    expect(html).not.toContain("Ebpf")
  })

  it("uses the canonical directory destination for a segment containing a dot", () => {
    const html = renderPanels(
      [physicalFile("git.md/index", { title: "Git book" }), physicalFile("git.md/topic")],
      { layout },
    )

    expect(html).toContain('href="./git.md/"')
    expect(html).not.toContain('href="./git.md"')
  })

  it("requires either a physical or generated book-index destination", () => {
    const withoutFolderPage = renderPanels([physicalFile("orphan/page", { title: "Page title" })], {
      layout,
    })
    const withFolderPage = renderPanels(
      [physicalFile("orphan/page"), virtualFile("orphan/index", { title: "Generated" })],
      { layout },
    )

    expect(withoutFolderPage).toContain("No books found.")
    expect(withoutFolderPage).not.toContain("Orphan")
    expect(withFolderPage).toContain("Orphan")
    expect(withFolderPage).toContain('href="./orphan/"')
    expect(withFolderPage).not.toContain("Generated")
  })

  it("uses the newest eligible descendant date rather than only the index date", () => {
    const html = renderPanels(
      [
        physicalFile(
          "alpha/index",
          { title: "Alpha" },
          { dates: { modified: new Date("2024-01-01") } },
        ),
        physicalFile("alpha/new-note", {}, { dates: { modified: new Date("2026-01-01") } }),
        physicalFile(
          "beta/index",
          { title: "Beta" },
          { dates: { modified: new Date("2025-01-01") } },
        ),
        physicalFile(
          "beta/hidden",
          {},
          { unlisted: true, dates: { modified: new Date("2099-01-01") } },
        ),
      ],
      { layout, sort: "date" },
    )

    expect(html.indexOf("Alpha")).toBeLessThan(html.indexOf("Beta"))
  })

  it("deduplicates physical slugs with the first eligible occurrence winning", () => {
    const html = renderPanels(
      [
        physicalFile("dupe/index", { title: "Unlisted duplicate" }, { unlisted: true }),
        physicalFile("dupe/index", { title: "First eligible" }),
        physicalFile("dupe/index", { title: "Second eligible" }),
        physicalFile("dupe/page"),
        physicalFile("dupe/page"),
      ],
      { layout },
    )

    expect(html).toContain("First eligible")
    expect(html).not.toContain("Unlisted duplicate")
    expect(html).not.toContain("Second eligible")
    expect(html).toContain("1 note")
  })
})

describe("book ordering", () => {
  it("sorts alphabetically by default and by count with deterministic title ties", () => {
    const files = [
      physicalFile("zulu/index", { title: "Zulu" }),
      physicalFile("zulu/one"),
      physicalFile("alpha/index", { title: "Alpha" }),
      physicalFile("alpha/one"),
      physicalFile("alpha/two"),
      physicalFile("beta/index", { title: "Beta" }),
      physicalFile("beta/one"),
    ]

    const alphabetical = renderPanels(files)
    const byCount = renderPanels(files, { sort: "docCount" })

    expect(alphabetical.indexOf("Alpha")).toBeLessThan(alphabetical.indexOf("Beta"))
    expect(alphabetical.indexOf("Beta")).toBeLessThan(alphabetical.indexOf("Zulu"))
    expect(byCount.indexOf("Alpha")).toBeLessThan(byCount.indexOf("Beta"))
    expect(byCount.indexOf("Beta")).toBeLessThan(byCount.indexOf("Zulu"))
  })

  it("uses locale-independent title and segment tie-breakers", () => {
    const books = collectBooks(
      [
        physicalFile("lower/index", { title: "alpha" }),
        physicalFile("upper-z/index", { title: "Alpha" }),
        physicalFile("upper-a/index", { title: "Alpha" }),
        physicalFile("beta/index", { title: "Beta" }),
      ],
      inventoryOptions(),
    )

    expect(books.map(({ segment }) => segment)).toEqual(["upper-a", "upper-z", "lower", "beta"])
  })

  it("accepts epoch and pre-1970 dates while sorting undated books last", () => {
    const books = collectBooks(
      [
        physicalFile("undated/index", { title: "Undated" }),
        physicalFile("pre-epoch/index", { title: "Pre-epoch" }, { date: "1960-01-01" }),
        physicalFile("epoch/index", { title: "Epoch" }, { date: 0 }),
      ],
      inventoryOptions({ sort: "date" }),
    )

    expect(books.map(({ title }) => title)).toEqual(["Epoch", "Pre-epoch", "Undated"])
    expect(books[0]?.date).toBe(0)
    expect(books[1]?.date).toBeLessThan(0)
    expect(books[2]?.date).toBe(Number.NEGATIVE_INFINITY)
  })
})

describe("runtime option normalization", () => {
  it("applies every invalid fallback and preserves case-sensitive normalized excludes", () => {
    const normalized = normalizeRootIndexPanelsOptions({
      layout: "grid",
      sort: "newest",
      showDescription: "false",
      showDocCount: null,
      showTags: 0,
      replaceExplorer: "false",
      tagCount: Number.POSITIVE_INFINITY,
      excludeDirs: [" alpha ", "alpha", "", 7, "Alpha", " beta"],
      descriptionFallback: 42,
    })

    expect(normalized.layout).toBe("cards")
    expect(normalized.sort).toBe("alphabetical")
    expect(normalized.showDescription).toBe(true)
    expect(normalized.showDocCount).toBe(true)
    expect(normalized.showTags).toBe(true)
    expect(normalized.replaceExplorer).toBe(true)
    expect(normalized.tagCount).toBe(3)
    expect(normalized.excludeDirs).toEqual(["alpha", "Alpha", "beta"])
    expect(normalized.descriptionFallback).toBe("")
  })

  it.each([
    [2.9, 2],
    [-2.9, 0],
    [0, 0],
    [Number.NaN, 3],
    [Number.NEGATIVE_INFINITY, 3],
    ["2", 3],
  ])("normalizes tagCount %j to %j", (value, expected) => {
    expect(normalizeRootIndexPanelsOptions({ tagCount: value }).tagCount).toBe(expected)
  })

  it("accepts every valid enum/boolean and preserves intentional whitespace fallback", () => {
    expect(
      normalizeRootIndexPanelsOptions({
        layout: "list",
        sort: "date",
        showDescription: false,
        showDocCount: false,
        showTags: false,
        replaceExplorer: false,
        descriptionFallback: "   ",
      }),
    ).toMatchObject({
      layout: "list",
      sort: "date",
      showDescription: false,
      showDocCount: false,
      showTags: false,
      replaceExplorer: false,
      descriptionFallback: "   ",
    })

    expect(normalizeRootIndexPanelsOptions({ layout: "cards", sort: "docCount" })).toMatchObject({
      layout: "cards",
      sort: "docCount",
    })
    expect(normalizeRootIndexPanelsOptions({ sort: "alphabetical" }).sort).toBe("alphabetical")
  })

  it("normalizes non-object option boundaries without throwing", () => {
    for (const value of [null, [], "cards", 1, true]) {
      expect(() => normalizeRootIndexPanelsOptions(value)).not.toThrow()
      expect(normalizeRootIndexPanelsOptions(value).layout).toBe("cards")
    }
  })
})

describe("inventory complexity", () => {
  it("reads each file slot once for a large synthetic inventory", () => {
    const files: PluginFile[] = []
    for (let index = 0; index < 250; index += 1) {
      files.push(physicalFile(`book-${index}/index`, { title: `Book ${index}` }))
      files.push(physicalFile(`book-${index}/note`))
    }

    let numericIndexReads = 0
    const trackedFiles = new Proxy(files, {
      get(target, property, receiver) {
        if (typeof property === "string" && /^\d+$/.test(property)) numericIndexReads += 1
        return Reflect.get(target, property, receiver)
      },
    })

    const books = collectBooks(trackedFiles, inventoryOptions())

    expect(books).toHaveLength(250)
    expect(numericIndexReads).toBe(files.length)
  })
})
