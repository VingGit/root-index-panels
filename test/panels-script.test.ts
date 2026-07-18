// @vitest-environment happy-dom

import type { FullSlug } from "@quartz-community/types"
import { Window as HappyDOMWindow } from "happy-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { RootIndexPanels as BuiltRootIndexPanels } from "../dist/index.js"
import { initRootIndexPanels } from "../src/components/scripts/panels.inline"

type LayoutFixture = {
  containerClass: "rip-grid" | "rip-list"
  itemClass: "rip-card" | "rip-list-item"
  linkClass: "rip-card-link" | "rip-list-link"
}

const layouts: LayoutFixture[] = [
  {
    containerClass: "rip-grid",
    itemClass: "rip-card",
    linkClass: "rip-card-link",
  },
  {
    containerClass: "rip-list",
    itemClass: "rip-list-item",
    linkClass: "rip-list-link",
  },
]

let cleanupCallbacks: Array<() => void>
let addCleanup: ReturnType<typeof vi.fn>

function renderLayout(layout: LayoutFixture, count = 3): HTMLAnchorElement[] {
  const container = document.createElement("section")
  container.className = layout.containerClass

  for (let index = 0; index < count; index += 1) {
    const item = document.createElement("article")
    item.className = layout.itemClass

    const link = document.createElement("a")
    link.className = layout.linkClass
    link.href = `#book-${index}`
    link.textContent = `Book ${index}`

    item.append(link)
    container.append(item)
  }

  document.body.append(container)
  return Array.from(container.querySelectorAll<HTMLAnchorElement>(`.${layout.linkClass}`))
}

function press(
  link: HTMLAnchorElement,
  key: string,
  modifiers: Pick<KeyboardEventInit, "altKey" | "ctrlKey" | "metaKey" | "shiftKey"> = {},
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...modifiers,
    key,
  })
  link.dispatchEvent(event)
  return event
}

function dispatchNav(slug = "index") {
  document.dispatchEvent(
    new CustomEvent<{ url: FullSlug }>("nav", {
      detail: { url: slug as FullSlug },
    }),
  )
}

function runCleanups() {
  const callbacks = cleanupCallbacks.splice(0)
  callbacks.forEach((cleanup) => cleanup())
}

beforeEach(() => {
  document.body.replaceChildren()
  cleanupCallbacks = []
  addCleanup = vi.fn((cleanup: () => void) => cleanupCallbacks.push(cleanup))
  window.addCleanup = addCleanup
})

afterEach(() => {
  runCleanups()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe.each(layouts)("$containerClass keyboard navigation", (layout) => {
  it.each([
    ["ArrowRight", 0, 1],
    ["ArrowDown", 0, 1],
    ["ArrowLeft", 1, 0],
    ["ArrowUp", 1, 0],
    ["Home", 2, 0],
    ["End", 0, 2],
  ] as const)("handles %s and focuses the target", (key, startIndex, targetIndex) => {
    const links = renderLayout(layout)
    initRootIndexPanels()

    const start = links[startIndex]
    const target = links[targetIndex]
    expect(start).toBeDefined()
    expect(target).toBeDefined()

    start!.focus()
    const focus = vi.spyOn(target!, "focus")
    const event = press(start!, key)

    expect(event.defaultPrevented).toBe(true)
    expect(focus).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(target)
  })

  it.each([
    ["ArrowRight", 2],
    ["ArrowDown", 2],
    ["ArrowLeft", 0],
    ["ArrowUp", 0],
  ] as const)(
    "leaves focus and browser behavior unchanged for %s at its boundary",
    (key, index) => {
      const links = renderLayout(layout)
      initRootIndexPanels()

      const link = links[index]
      expect(link).toBeDefined()
      link!.focus()
      const focus = vi.spyOn(link!, "focus")
      const event = press(link!, key)

      expect(event.defaultPrevented).toBe(false)
      expect(focus).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(link)
    },
  )

  it.each([
    ["Home", 0],
    ["End", 2],
  ] as const)("keeps %s deterministic when focus is already at its boundary", (key, index) => {
    const links = renderLayout(layout)
    initRootIndexPanels()

    const link = links[index]
    expect(link).toBeDefined()
    link!.focus()
    const focus = vi.spyOn(link!, "focus")
    const event = press(link!, key)

    expect(event.defaultPrevented).toBe(true)
    expect(focus).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(link)
  })

  it.each([
    ["Alt+ArrowRight", "ArrowRight", { altKey: true }],
    ["Control+Home", "Home", { ctrlKey: true }],
    ["Meta+End", "End", { metaKey: true }],
    ["Shift+ArrowDown", "ArrowDown", { shiftKey: true }],
  ] as const)("leaves modified browser shortcut %s untouched", (_label, key, modifiers) => {
    const links = renderLayout(layout)
    initRootIndexPanels()

    const link = links[1]
    const target = key === "Home" ? links[0] : links[2]
    expect(link).toBeDefined()
    expect(target).toBeDefined()
    link!.focus()
    const focus = vi.spyOn(target!, "focus")
    const event = press(link!, key, modifiers)

    expect(event.defaultPrevented).toBe(false)
    expect(focus).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(link)
  })
})

describe("initialization and Quartz SPA lifecycle", () => {
  it("uses the nav event registration to initialize production markup", () => {
    const links = renderLayout(layouts[0]!)

    dispatchNav()
    links[0]!.focus()
    const event = press(links[0]!, "ArrowRight")

    expect(addCleanup).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(links[1])
  })

  it("removes direct-initializer listeners through the registered cleanup", () => {
    const links = renderLayout(layouts[0]!)
    initRootIndexPanels()
    expect(addCleanup).toHaveBeenCalledOnce()

    runCleanups()
    links[0]!.focus()
    const event = press(links[0]!, "ArrowRight")

    expect(event.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(links[0])
  })

  it("handles no grids, empty grids, and a single item without errors", () => {
    expect(() => initRootIndexPanels()).not.toThrow()
    expect(addCleanup).not.toHaveBeenCalled()

    const emptyGrid = document.createElement("section")
    emptyGrid.className = "rip-grid"
    document.body.append(emptyGrid)
    expect(() => initRootIndexPanels()).not.toThrow()

    runCleanups()
    document.body.replaceChildren()
    const [onlyLink] = renderLayout(layouts[1]!, 1)
    initRootIndexPanels()
    expect(onlyLink).toBeDefined()

    onlyLink!.focus()
    const arrow = press(onlyLink!, "ArrowDown")
    expect(arrow.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(onlyLink)

    const home = press(onlyLink!, "Home")
    const end = press(onlyLink!, "End")
    expect(home.defaultPrevented).toBe(true)
    expect(end.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(onlyLink)
  })

  it("tears down on SPA departure and installs one handler when returning", () => {
    const firstVisitLinks = renderLayout(layouts[0]!)
    dispatchNav()
    expect(addCleanup).toHaveBeenCalledTimes(1)

    runCleanups()
    document.body.replaceChildren()
    dispatchNav("away")
    expect(addCleanup).toHaveBeenCalledTimes(1)

    const returnVisitLinks = renderLayout(layouts[0]!)
    dispatchNav()
    expect(addCleanup).toHaveBeenCalledTimes(2)

    returnVisitLinks[0]!.focus()
    const event = press(returnVisitLinks[0]!, "ArrowRight")
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(returnVisitLinks[1])
    expect(document.activeElement).not.toBe(returnVisitLinks[2])

    firstVisitLinks[0]!.focus()
    const staleEvent = press(firstVisitLinks[0]!, "ArrowRight")
    expect(staleEvent.defaultPrevented).toBe(false)
  })
})

describe("built inline artifact", () => {
  it("executes the committed afterDOMLoaded script and wires keyboard navigation", () => {
    const afterDOMLoaded = BuiltRootIndexPanels().afterDOMLoaded
    expect(typeof afterDOMLoaded).toBe("string")
    if (typeof afterDOMLoaded !== "string") throw new Error("Expected one bundled inline script")

    const builtWindow = new HappyDOMWindow()
    const builtDocument = builtWindow.document
    const builtCleanups: Array<() => void> = []
    Object.assign(builtWindow, {
      addCleanup: (cleanup: () => void) => builtCleanups.push(cleanup),
    })

    const executeInlineScript = new Function("window", "document", afterDOMLoaded)
    executeInlineScript(builtWindow, builtDocument)

    builtDocument.body.innerHTML = `
      <ul class="rip-grid">
        <li class="rip-card"><a class="rip-card-link" href="#one">One</a></li>
        <li class="rip-card"><a class="rip-card-link" href="#two">Two</a></li>
      </ul>
    `
    const links = Array.from(builtDocument.querySelectorAll("a"))
    expect(links).toHaveLength(2)

    builtDocument.dispatchEvent(new builtWindow.CustomEvent("nav"))
    links[0]!.focus()
    const event = new builtWindow.KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "ArrowRight",
    })
    links[0]!.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(builtDocument.activeElement).toBe(links[1])
    expect(builtCleanups).toHaveLength(1)

    builtCleanups.forEach((cleanup) => cleanup())
    builtWindow.close()
  })
})
