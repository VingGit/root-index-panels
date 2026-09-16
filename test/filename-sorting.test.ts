import { describe, expect, it } from "vitest"

import {
  compareFilenameSortNames,
  filenameSortName,
  normalizeFilenameSortDirection,
} from "../src/filenameSorting"
import { buildSidebarNavigationModel } from "../src/navigation"
import { physicalFile } from "./helpers"

function sorted(names: string[], direction: "ascending" | "descending"): string[] {
  return [...names].sort((left, right) => compareFilenameSortNames(left, right, direction))
}

describe("folder filename sorting", () => {
  it("keeps the requested bucket order while reversing values within buckets", () => {
    const names = [
      "10Thing",
      "2Thing",
      "Zebra",
      "Apple",
      "Äiti",
      "zebra",
      "apple",
      "äiti",
      "_other",
      "17.09.2026_at_08-00_Foo",
      "16.09.2026_at_13-36_Untitled",
      "16.09.2026_at_12-00_Zulu",
      "16.09.2026_Untitled",
      "13-36_Untitled",
    ]

    expect(sorted(names, "ascending")).toEqual([
      "2Thing",
      "10Thing",
      "Apple",
      "Zebra",
      "Äiti",
      "apple",
      "zebra",
      "äiti",
      "_other",
      "16.09.2026_at_12-00_Zulu",
      "16.09.2026_at_13-36_Untitled",
      "17.09.2026_at_08-00_Foo",
      "16.09.2026_Untitled",
      "13-36_Untitled",
    ])

    expect(sorted(names, "descending")).toEqual([
      "10Thing",
      "2Thing",
      "Äiti",
      "Zebra",
      "Apple",
      "äiti",
      "zebra",
      "apple",
      "_other",
      "17.09.2026_at_08-00_Foo",
      "16.09.2026_at_13-36_Untitled",
      "16.09.2026_at_12-00_Zulu",
      "16.09.2026_Untitled",
      "13-36_Untitled",
    ])
  })

  it("parses valid date and time tokens anywhere and ignores invalid calendar values", () => {
    expect(
      sorted(
        [
          "Prefix_29.02.2024_at_23-59_Suffix",
          "Prefix_01.03.2024_at_00-00_Suffix",
          "31.02.2026_InvalidDate",
          "24-00_InvalidTime",
        ],
        "ascending",
      ),
    ).toEqual([
      "24-00_InvalidTime",
      "31.02.2026_InvalidDate",
      "Prefix_29.02.2024_at_23-59_Suffix",
      "Prefix_01.03.2024_at_00-00_Suffix",
    ])

    expect(filenameSortName("content\\notes\\16.09.2026_at_13-36_Untitled.md", "fallback")).toBe(
      "16.09.2026_at_13-36_Untitled",
    )
    expect(normalizeFilenameSortDirection("ascending")).toBe("ascending")
    expect(normalizeFilenameSortDirection("descending")).toBe("descending")
    expect(normalizeFilenameSortDirection(true)).toBeUndefined()
  })

  it("applies sorting only to direct files in the folder whose physical index opts in", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book", "quartz-sorting-direction": "ascending" }),
      physicalFile("book/16.09.2026_at_13-36_Untitled", { title: "A title that would sort first" }),
      physicalFile("book/16.09.2026_at_12-00_Zulu", { title: "Z title that would sort last" }),
      physicalFile("book/Apple", { title: "Zulu display title" }),
      physicalFile("book/apple", { title: "Alpha display title" }),
      physicalFile("book/2Numbers", { title: "Middle display title" }),
      physicalFile("book/child/index", { title: "Child" }),
      physicalFile("book/child/z-file", { title: "Alpha" }),
      physicalFile("book/child/A-file", { title: "Zulu" }),
    ])

    const book = model.books[0]
    expect(book?.children.map((node) => node.slug)).toEqual([
      "book/child/index",
      "book/2Numbers",
      "book/Apple",
      "book/apple",
      "book/16.09.2026_at_12-00_Zulu",
      "book/16.09.2026_at_13-36_Untitled",
    ])

    const child = book?.children[0]
    expect(child?.kind).toBe("folder")
    if (child?.kind !== "folder") throw new Error("Expected child folder")
    expect(child.children.map((node) => node.slug)).toEqual([
      "book/child/z-file",
      "book/child/A-file",
    ])
  })

  it("lets a nested folder choose its own descending direction without changing folder ordering", () => {
    const model = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book" }),
      physicalFile("book/a-folder/index", {
        title: "A Folder",
        "quartz-sorting-direction": "descending",
      }),
      physicalFile("book/a-folder/16.09.2026_at_12-00_First"),
      physicalFile("book/a-folder/16.09.2026_at_13-36_Second"),
      physicalFile("book/z-folder/index", { title: "Z Folder" }),
      physicalFile("book/z-folder/topic"),
    ])

    expect(model.books[0]?.children.map((node) => node.title)).toEqual(["A Folder", "Z Folder"])
    const firstFolder = model.books[0]?.children[0]
    expect(firstFolder?.kind).toBe("folder")
    if (firstFolder?.kind !== "folder") throw new Error("Expected A Folder")
    expect(firstFolder.children.map((node) => node.slug)).toEqual([
      "book/a-folder/16.09.2026_at_13-36_Second",
      "book/a-folder/16.09.2026_at_12-00_First",
    ])
  })

  it("supports the same folder-local rule on the root index and ignores invalid values", () => {
    const rootSorted = buildSidebarNavigationModel([
      physicalFile("index", { "quartz-sorting-direction": "ascending" }),
      physicalFile("16.09.2026_at_13-36_Untitled", { title: "A" }),
      physicalFile("2Numbers", { title: "Z" }),
    ])
    expect(rootSorted.rootNotes.map((node) => node.slug)).toEqual([
      "2Numbers",
      "16.09.2026_at_13-36_Untitled",
    ])

    const fallback = buildSidebarNavigationModel([
      physicalFile("book/index", { title: "Book", "quartz-sorting-direction": true }),
      physicalFile("book/Z-file", { title: "Alpha" }),
      physicalFile("book/A-file", { title: "Zulu" }),
    ])
    expect(fallback.books[0]?.children.map((node) => node.slug)).toEqual([
      "book/Z-file",
      "book/A-file",
    ])
  })
})
