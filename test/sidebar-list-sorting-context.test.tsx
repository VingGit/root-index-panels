import type { QuartzComponentProps } from "@quartz-community/types"
import render from "preact-render-to-string"
import { describe, expect, it, vi } from "vitest"

vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "sidebar-style" }))
vi.mock("../src/components/styles/sidebar-rework.scss", () => ({
  default: "sidebar-rework-style",
}))
vi.mock("../src/components/scripts/sidebar.inline.ts", () => ({ default: "sidebar-script" }))

import RootIndexSidebar from "../src/components/RootIndexSidebar"
import { componentProps, physicalFile, type PluginFile } from "./helpers"

function renderSidebar(slug: string, allFiles: PluginFile[]): string {
  const props = componentProps(slug, allFiles) as QuartzComponentProps
  const Sidebar = RootIndexSidebar()
  return render(Sidebar(props) as Parameters<typeof render>[0])
}

describe("sidebar filename-list sorting metadata", () => {
  const files = [
    physicalFile("index", { "quartz-sorting-direction": "descending" }),
    physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
    physicalFile(
      "book/permalink-like-slug",
      { title: "Displayed title" },
      { filePath: "book/16.09.2026_at_13-36_Untitled.md" },
    ),
  ]

  it("publishes source-folder policies and source filenames independently of the viewed page", () => {
    const html = renderSidebar("somewhere/else", files)

    expect(html).not.toContain("data-rip-list-sort-direction")
    expect(html).toContain("data-rip-filename-sort-index=")
    expect(html).toContain("16.09.2026_at_13-36_Untitled")
    expect(html).toContain("permalink-like-slug")
    expect(html).toContain("ascending")
    expect(html).toContain("descending")
  })

  it("publishes the same per-source policy metadata on generated tag routes", () => {
    const html = renderSidebar("tags/example", files)

    expect(html).not.toContain("data-rip-list-sort-direction")
    expect(html).toContain("data-rip-filename-sort-index=")
    expect(html).toContain("ascending")
    expect(html).toContain("descending")
  })

  it("omits list-sorting metadata only when no physical source folder opts in", () => {
    const html = renderSidebar("book/topic", [
      physicalFile("index"),
      physicalFile("book/index"),
      physicalFile("book/topic"),
    ])

    expect(html).not.toContain("data-rip-list-sort-direction")
    expect(html).not.toContain("data-rip-filename-sort-index")
  })
})
