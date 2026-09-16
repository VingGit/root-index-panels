import { describe, expect, it } from "vitest"

import { collectFilenameListSortData } from "../src/filenameListSorting"
import { physicalFile, virtualFile } from "./helpers"

describe("filename list sorting context", () => {
  it("attaches each source note to its own exact folder policy without inheritance", () => {
    const files = [
      physicalFile("index", { "quartz-sorting-direction": "descending" }),
      physicalFile("root-note"),
      physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("book/topic"),
      physicalFile("book/child/index", { title: "Child" }),
      physicalFile("book/child/topic"),
    ]

    const data = collectFilenameListSortData(files)
    expect(data.sources).toEqual([
      { slug: "index", sortName: "index", folderKey: "", direction: "descending" },
      {
        slug: "root-note",
        sortName: "root-note",
        folderKey: "",
        direction: "descending",
      },
      {
        slug: "book/index",
        sortName: "index",
        folderKey: "book",
        direction: "ascending",
      },
      {
        slug: "book/topic",
        sortName: "topic",
        folderKey: "book",
        direction: "ascending",
      },
      { slug: "book/child/index", sortName: "index", folderKey: "book/child" },
      { slug: "book/child/topic", sortName: "topic", folderKey: "book/child" },
    ])
  })

  it("uses a backlink source folder policy even when the viewed page is elsewhere", () => {
    const data = collectFilenameListSortData([
      physicalFile("overview", { title: "Diary overview" }),
      physicalFile("diary/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("diary/entry-one", {}, { filePath: "diary/16.09.2026_at_13-36_Untitled.md" }),
      physicalFile("diary/entry-two", {}, { filePath: "diary/16.09.2026_at_12-00_Untitled.md" }),
    ])

    expect(data.sources.find((source) => source.slug === "overview")?.direction).toBeUndefined()
    expect(data.sources.find((source) => source.slug === "diary/entry-one")).toMatchObject({
      folderKey: "diary",
      direction: "ascending",
    })
    expect(data.sources.find((source) => source.slug === "diary/entry-two")).toMatchObject({
      folderKey: "diary",
      direction: "ascending",
    })
  })

  it("indexes listed physical source filenames and ignores virtual or unlisted records", () => {
    const files = [
      physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile(
        "book/permalink-like-slug",
        {},
        { filePath: "book/16.09.2026_at_13-36_Untitled.md" },
      ),
      physicalFile("book/private", {}, { unlisted: true }),
      virtualFile("book/generated.canvas", {}, { canvasData: true }),
    ]

    const data = collectFilenameListSortData(files)
    expect(data.sources).toEqual([
      {
        slug: "book/index",
        sortName: "index",
        folderKey: "book",
        direction: "ascending",
      },
      {
        slug: "book/permalink-like-slug",
        sortName: "16.09.2026_at_13-36_Untitled",
        folderKey: "book",
        direction: "ascending",
      },
    ])
    expect(Object.isFrozen(data)).toBe(true)
    expect(Object.isFrozen(data.sources)).toBe(true)
  })

  it("uses only the first listed physical index policy for a folder", () => {
    const data = collectFilenameListSortData([
      physicalFile("book/index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("book/index", { "quartz-sorting-direction": "descending" }),
      physicalFile("book/topic"),
    ])

    expect(data.sources.find((source) => source.slug === "book/topic")?.direction).toBe("ascending")
  })
})
