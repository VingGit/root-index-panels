// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from "vitest"

import { initRootIndexSidebar } from "../src/components/scripts/sidebar.inline"

type SortEntry = [
  href: string,
  sortName: string,
  folderKey: string,
  direction: "ascending" | "descending",
]

function mountContext(entries: SortEntry[]) {
  const sidebar = document.createElement("nav")
  sidebar.className = "rip-sidebar"
  sidebar.dataset.ripFilenameSortIndex = JSON.stringify(entries)
  document.body.append(sidebar)
}

function mountBacklinks(items: Array<[href: string, label: string]>): HTMLUListElement {
  const wrapper = document.createElement("div")
  wrapper.className = "backlinks"
  const list = document.createElement("ul")
  for (const [href, label] of items) {
    const item = document.createElement("li")
    item.innerHTML = `<a class="internal" href="${href}">${label}</a>`
    list.append(item)
  }
  const end = document.createElement("li")
  end.className = "overflow-end"
  list.append(end)
  wrapper.append(list)
  document.body.append(wrapper)
  return list
}

function hrefs(list: HTMLUListElement): Array<string | null> {
  return Array.from(list.children)
    .filter((item) => !item.classList.contains("overflow-end"))
    .map((item) => item.querySelector("a")?.getAttribute("href") ?? null)
}

beforeEach(() => {
  document.body.replaceChildren()
  window.history.replaceState({}, "", "/overview")
})

describe("shared Quartz filename list sorting", () => {
  it("sorts Backlinks by the backlink source folder policy, not the viewed page", () => {
    mountContext([
      ["./number", "2Thing", "diary", "ascending"],
      ["./letter", "Apple", "diary", "ascending"],
      ["./later", "17.09.2026_at_08-00_Foo", "diary", "ascending"],
      ["./dt13", "16.09.2026_at_13-36_Untitled", "diary", "ascending"],
      ["./dt12", "16.09.2026_at_12-00_Zulu", "diary", "ascending"],
      ["./date", "16.09.2026_Untitled", "diary", "ascending"],
      ["./time", "13-36_Untitled", "diary", "ascending"],
    ])
    const list = mountBacklinks([
      ["./time", "A title"],
      ["./later", "B title"],
      ["./date", "C title"],
      ["./dt13", "D title"],
      ["./letter", "Z title"],
      ["./dt12", "E title"],
      ["./number", "Y title"],
    ])

    initRootIndexSidebar()

    expect(hrefs(list)).toEqual([
      "./number",
      "./letter",
      "./dt12",
      "./dt13",
      "./later",
      "./date",
      "./time",
    ])
    expect(list.lastElementChild?.classList.contains("overflow-end")).toBe(true)
  })

  it("uses each source folder direction independently in a mixed Backlinks list", () => {
    mountContext([
      ["./a-late", "17.09.2026_A", "folder-a", "ascending"],
      ["./a-early", "16.09.2026_A", "folder-a", "ascending"],
      ["./b-alpha", "Apple", "folder-b", "descending"],
      ["./b-zulu", "Zulu", "folder-b", "descending"],
    ])
    const list = mountBacklinks([
      ["./a-late", "A late"],
      ["./b-alpha", "B alpha"],
      ["./a-early", "A early"],
      ["./b-zulu", "B zulu"],
    ])

    initRootIndexSidebar()

    expect(hrefs(list)).toEqual(["./a-early", "./b-zulu", "./a-late", "./b-alpha"])
  })

  it("sorts Quartz PageList note slots while preserving unknown generated entries", () => {
    mountContext([
      ["./later", "17.09.2026_at_08-00_Later", "book", "ascending"],
      ["./earlier", "16.09.2026_at_08-00_Earlier", "book", "ascending"],
    ])
    const list = document.createElement("ul")
    list.className = "section-ul"
    list.innerHTML = `
      <li data-fixed="folder"><a class="internal" href="./folder/index">Folder</a></li>
      <li><a class="internal" href="./later">Later</a></li>
      <li data-fixed="generated"><span>Generated entry</span></li>
      <li><a class="internal" href="./earlier">Earlier</a></li>
    `
    document.body.append(list)

    initRootIndexSidebar()

    expect(
      Array.from(list.children).map(
        (item) => item.getAttribute("data-fixed") ?? item.querySelector("a")?.getAttribute("href"),
      ),
    ).toEqual(["folder", "./earlier", "generated", "./later"])
  })

  it("leaves Backlinks and PageList order untouched without a source-folder policy", () => {
    const list = mountBacklinks([
      ["./later", "Later"],
      ["./earlier", "Earlier"],
    ])

    initRootIndexSidebar()

    expect(hrefs(list)).toEqual(["./later", "./earlier"])
  })
})
