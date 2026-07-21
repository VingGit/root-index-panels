import { describe, expect, it } from "vitest"

import {
  buildSidebarNavigationModel,
  getSidebarLinkState,
  type SidebarFolderNode,
} from "../src/navigation"

function physical(slug: string, title: string) {
  return {
    slug,
    filePath: `${slug}.md`,
    frontmatter: { title },
  }
}

describe("sidebar folder landing model", () => {
  it("keeps book and nested folder indexes as destinations instead of visible notes", () => {
    const model = buildSidebarNavigationModel([
      physical("index", "Library"),
      physical("book/index", "Book"),
      physical("book/chapter/index", "Chapter"),
      physical("book/chapter/topic", "Topic"),
    ])

    expect(model.books).toHaveLength(1)
    expect(model.books[0]?.children).toHaveLength(1)

    const chapter = model.books[0]?.children[0] as SidebarFolderNode
    expect(chapter.kind).toBe("folder")
    expect(chapter.slug).toBe("book/chapter/index")
    expect(chapter.children.map((child) => child.slug)).toEqual(["book/chapter/topic"])
    expect(chapter.children.some((child) => child.slug?.endsWith("/index") === true)).toBe(false)
  })

  it("marks a closed ancestor without changing the selected route", () => {
    expect(getSidebarLinkState("book/chapter/index", "book/chapter/topic")).toBe("ancestor")
    expect(getSidebarLinkState("book/chapter/topic", "book/chapter/topic")).toBe("current")
  })
})
