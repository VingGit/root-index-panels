import { describe, expect, it, vi } from "vitest"
import render from "preact-render-to-string"
import type { FullSlug, QuartzComponentProps, QuartzPluginData } from "@quartz-community/types"
import { RootIndexPanels } from "../src/components"
import { RootIndexPanelsPage } from "../src/pageType"

vi.mock("../src/components/scripts/panels.inline.ts", () => ({ default: "" }))
vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))

function fileData(
  slug: string,
  frontmatter: Record<string, unknown> = {},
  data: Record<string, unknown> = {},
): QuartzPluginData {
  return {
    slug,
    frontmatter,
    ...data,
  } as QuartzPluginData
}

function fullSlug(slug: string): FullSlug {
  return slug as FullSlug
}

function renderPanels(
  slug: string,
  allFiles: QuartzPluginData[],
  options?: Parameters<typeof RootIndexPanels>[0],
): string {
  const Component = RootIndexPanels(options)
  const rendered = Component({
    ctx: {} as QuartzComponentProps["ctx"],
    externalResources: { css: [], js: [], additionalHead: [] },
    fileData: fileData(slug),
    cfg: {} as QuartzComponentProps["cfg"],
    children: [],
    tree: { type: "root", children: [] } as QuartzComponentProps["tree"],
    allFiles,
  }) as Parameters<typeof render>[0]

  return render(rendered)
}

describe("RootIndexPanels", () => {
  it("renders only on the root index page", () => {
    const html = renderPanels("notes/page", [fileData("notes/index"), fileData("notes/page")])

    expect(html).toBe("")
  })

  it("collects first-level directories without promoting root-level notes", () => {
    const html = renderPanels(
      "index",
      [
        fileData("index"),
        fileData("lonely-note", { title: "Lonely Note" }),
        fileData("alpha/index", {
          title: "Alpha Area",
          description: "Alpha description",
          tags: ["one", "two", "three"],
        }),
        fileData("alpha/first"),
        fileData("alpha/nested/second"),
        fileData("beta/index", { title: "Beta Area", description: "Beta description" }),
        fileData("beta/first"),
      ],
      { layout: "list" },
    )

    expect(html).toContain('href="./alpha"')
    expect(html).toContain("Alpha Area")
    expect(html).toContain("Alpha description")
    expect(html).toContain("2 notes")
    expect(html).toContain('href="./beta"')
    expect(html).not.toContain("Lonely Note")
    expect(html).not.toContain('href="./lonely-note"')
  })

  it("limits card tags and honors excluded directories", () => {
    const html = renderPanels(
      "index",
      [
        fileData("alpha/index", { title: "Alpha", tags: ["one", "two", "three"] }),
        fileData("alpha/page"),
        fileData("archive/index", { title: "Archive", tags: ["old"] }),
        fileData("archive/page"),
      ],
      { excludeDirs: ["archive"], tagCount: 2 },
    )

    expect(html).toContain("#one")
    expect(html).toContain("#two")
    expect(html).not.toContain("#three")
    expect(html).not.toContain("Archive")
  })

  it("sorts by newest directory date when requested", () => {
    const html = renderPanels(
      "index",
      [
        fileData("old/index", { title: "Old" }, { dates: { modified: new Date("2024-01-01") } }),
        fileData("old/page"),
        fileData("new/index", { title: "New" }, { dates: { modified: new Date("2025-01-01") } }),
        fileData("new/page"),
      ],
      { sort: "date" },
    )

    expect(html.indexOf("New")).toBeLessThan(html.indexOf("Old"))
  })

  it("shows an empty state when no directories exist", () => {
    const html = renderPanels("index", [fileData("index"), fileData("lonely-note")])

    expect(html).toContain("No subdirectories found.")
  })

  it("provides a high-priority page type for the root index", () => {
    const pageType = RootIndexPanelsPage({ layout: "list" })

    expect(pageType.priority).toBeGreaterThan(0)
    expect(pageType.match({ slug: fullSlug("index"), fileData: fileData("index"), cfg: {} })).toBe(
      true,
    )
    expect(
      pageType.match({ slug: fullSlug("alpha/index"), fileData: fileData("alpha/index"), cfg: {} }),
    ).toBe(false)
    expect(
      render(
        pageType.body(undefined)({
          ctx: {} as QuartzComponentProps["ctx"],
          externalResources: { css: [], js: [], additionalHead: [] },
          fileData: fileData("index"),
          cfg: {} as QuartzComponentProps["cfg"],
          children: [],
          tree: { type: "root", children: [] } as QuartzComponentProps["tree"],
          allFiles: [fileData("alpha/index"), fileData("alpha/page")],
        }) as Parameters<typeof render>[0],
      ),
    ).toContain("rip--list")
  })
})
