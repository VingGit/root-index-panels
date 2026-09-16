import { describe, expect, it } from "vitest"

import { collectFilenameListSortData } from "../src/filenameListSorting"
import { physicalFile, virtualFile } from "./helpers"

describe("filename list sorting context", () => {
  it("resolves exact folder and root policies without inheriting into nested folders", () => {
    const files = [
      physicalFile("index", { "quartz-sorting-direction": "descending" }),
      physicalFile("root-note"),
      physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("book/topic"),
      physicalFile("book/child/index", { title: "Child" }),
      physicalFile("book/child/topic"),
    ]

    expect(collectFilenameListSortData(files, "root-note")).toMatchObject({
      pageDirection: "descending",
      rootDirection: "descending",
    })
    expect(collectFilenameListSortData(files, "book/topic")).toMatchObject({
      pageDirection: "ascending",
      rootDirection: "descending",
    })
    expect(collectFilenameListSortData(files, "book/child/topic")).toEqual(
      expect.objectContaining({ rootDirection: "descending" }),
    )
    expect(collectFilenameListSortData(files, "book/child/topic").pageDirection).toBeUndefined()
  })

  it("indexes listed physical source filenames and ignores virtual or unlisted records", () => {
    const files = [
      physicalFile("index", { "quartz-sorting-direction": "ascending" }),
      physicalFile(
        "book/permalink-like-slug",
        {},
        { filePath: "book/16.09.2026_at_13-36_Untitled.md" },
      ),
      physicalFile("book/private", {}, { unlisted: true }),
      virtualFile("book/generated.canvas", {}, { canvasData: true }),
    ]

    const data = collectFilenameListSortData(files, "book/permalink-like-slug")
    expect(data.sources).toEqual([
      { slug: "index", sortName: "index" },
      {
        slug: "book/permalink-like-slug",
        sortName: "16.09.2026_at_13-36_Untitled",
      },
    ])
    expect(Object.isFrozen(data)).toBe(true)
    expect(Object.isFrozen(data.sources)).toBe(true)
  })

  it("uses only the first listed physical index policy for a folder", () => {
    const files = [
      physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("book/index", { "quartz-sorting-direction": "descending" }),
      physicalFile("book/topic"),
    ]

    expect(collectFilenameListSortData(files, "book/topic").pageDirection).toBe("ascending")
  })
})
