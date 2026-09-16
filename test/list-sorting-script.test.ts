// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from "vitest"

import { initRootIndexSidebar } from "../src/components/scripts/sidebar.inline"

type SortEntry = [href: string, sortName: string]

function mountContext(direction: "ascending" | "descending", entries: SortEntry[]) {
  const sidebar = document.createElement("nav")
  sidebar.className = "rip-sidebar"
  sidebar.dataset.ripListSortDirection = direction
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
  window.history.replaceState({}, "", "/book/current")
})

describe("shared Quartz filename list sorting", () => {
  it("sorts Backlinks by source filename rather than displayed title", () => {
    mountContext("ascending", [
      ["./number", "2Thing"],
      ["./letter", "Apple"],
      ["./later", "17.09.2026_at_08-00_Foo"],
      ["./dt13", "16.09.2026_at_13-36_Untitled"],
      ["./dt12", "16.09.2026_at_12-00_Zulu"],
      ["./date", "16.09.2026_Untitled"],
      ["./time", "13-36_Untitled"],
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

  it("keeps bucket priority fixed while descending reverses values inside buckets", () => {
    mountContext("descending", [
      ["./2", "2Thing"],
      ["./10", "10Thing"],
      ["./apple", "Apple"],
      ["./zebra", "Zebra"],
      ["./early", "16.09.2026_at_12-00_First"],
      ["./late", "16.09.2026_at_13-36_Second"],
    ])
    const list = mountBacklinks([
      ["./2", "2"],
      ["./apple", "Apple"],
      ["./early", "Early"],
      ["./10", "10"],
      ["./zebra", "Zebra"],
      ["./late", "Late"],
    ])

    initRootIndexSidebar()

    expect(hrefs(list)).toEqual(["./10", "./2", "./zebra", "./apple", "./late", "./early"])
  })

  it("sorts Quartz PageList note slots while preserving unknown generated entries", () => {
    mountContext("ascending", [
      ["./later", "17.09.2026_at_08-00_Later"],
      ["./earlier", "16.09.2026_at_08-00_Earlier"],
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

  it("leaves Backlinks and PageList order untouched without an active policy", () => {
    const list = mountBacklinks([
      ["./later", "Later"],
      ["./earlier", "Earlier"],
    ])

    initRootIndexSidebar()

    expect(hrefs(list)).toEqual(["./later", "./earlier"])
  })
})
