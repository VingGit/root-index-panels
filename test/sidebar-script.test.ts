// @vitest-environment happy-dom

import type { FullSlug } from "@quartz-community/types"
import { Window as HappyDOMWindow } from "happy-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { RootIndexSidebar as BuiltRootIndexSidebar } from "../dist/index.js"
import { initRootIndexSidebar } from "../src/components/scripts/sidebar.inline"

let cleanupCallbacks: Array<() => void>
let addCleanup: ReturnType<typeof vi.fn>

function renderSwitcher(name: string): HTMLDetailsElement {
  const nav = document.createElement("nav")
  nav.className = "rip-sidebar"
  nav.innerHTML = `
    <details class="rip-sidebar-switcher">
      <summary>${name}</summary>
      <div class="rip-sidebar-switcher-menu">
        <a href="#${name}">${name}</a>
      </div>
    </details>
  `
  document.body.append(nav)
  return nav.querySelector<HTMLDetailsElement>(".rip-sidebar-switcher")!
}

function renderExplorer({
  canvas = false,
  current = false,
  kind = "note",
  landing = false,
}: {
  canvas?: boolean
  current?: boolean
  kind?: "note" | "canvas"
  landing?: boolean
} = {}): HTMLDetailsElement {
  const frame = document.createElement("div")
  frame.className = "page"
  frame.dataset.frame = canvas ? "canvas" : "default"
  const container = canvas ? document.createElement("aside") : frame
  if (canvas) container.className = "canvas-sidebar"
  const nav = document.createElement("nav")
  nav.className = "rip-sidebar"
  nav.innerHTML = `
    <a class="rip-sidebar-home-mark" href="/book/"${landing ? ' aria-current="page"' : ""}>Home</a>
    <section class="rip-sidebar-scope" aria-label="Explorer">
      <details class="rip-sidebar-explorer" open>
        <summary class="rip-sidebar-scope-title">Explorer</summary>
        <ul class="rip-sidebar-tree">
          <li><a href="${kind === "canvas" ? "/book/history.canvas" : "/book/topic"}" data-rip-node-kind="${kind}"${current ? ' aria-current="page"' : ""}>Destination</a></li>
        </ul>
      </details>
    </section>
  `
  if (canvas) frame.append(container)
  container.append(nav)
  document.body.append(frame)
  return nav.querySelector<HTMLDetailsElement>(".rip-sidebar-explorer")!
}

function setCompactExplorer(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(
      () =>
        ({
          matches,
        }) as MediaQueryList,
    ),
  })
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
  setCompactExplorer(false)
  window.history.replaceState({}, "", "/")
})

afterEach(() => {
  runCleanups()
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe("RootIndexSidebar dropdown enhancement", () => {
  it("closes on outside pointer input and link activation", () => {
    const switcher = renderSwitcher("First")
    initRootIndexSidebar()

    switcher.open = true
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    expect(switcher.open).toBe(false)

    switcher.open = true
    switcher.querySelector("a")!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    expect(switcher.open).toBe(false)
    expect(addCleanup).toHaveBeenCalledOnce()
  })

  it("closes on Escape, prevents the handled key, and returns focus to the summary", () => {
    const switcher = renderSwitcher("First")
    const summary = switcher.querySelector<HTMLElement>("summary")!
    initRootIndexSidebar()
    switcher.open = true

    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
    document.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(switcher.open).toBe(false)
    expect(document.activeElement).toBe(summary)
  })

  it("allows only one plugin switcher to remain open", () => {
    const first = renderSwitcher("First")
    const second = renderSwitcher("Second")
    initRootIndexSidebar()

    first.open = true
    first.dispatchEvent(new Event("toggle"))
    second.open = true
    second.dispatchEvent(new Event("toggle"))

    expect(first.open).toBe(false)
    expect(second.open).toBe(true)
  })

  it("removes all listeners through Quartz cleanup", () => {
    const switcher = renderSwitcher("First")
    initRootIndexSidebar()
    expect(addCleanup).toHaveBeenCalledOnce()

    runCleanups()
    switcher.open = true
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    expect(switcher.open).toBe(true)
  })

  it("initializes on Quartz navigation and ignores pages without the component", () => {
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", { detail: { url: "index" as FullSlug } }),
    )
    expect(addCleanup).not.toHaveBeenCalled()

    const switcher = renderSwitcher("First")
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", { detail: { url: "index" as FullSlug } }),
    )
    expect(addCleanup).toHaveBeenCalledOnce()

    switcher.open = true
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    expect(switcher.open).toBe(false)
  })

  it("reinitializes after Quartz cleans up the previous SPA page", () => {
    const first = renderSwitcher("First")
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", { detail: { url: "index" as FullSlug } }),
    )
    expect(addCleanup).toHaveBeenCalledOnce()

    runCleanups()
    first.remove()
    const second = renderSwitcher("Second")
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", { detail: { url: "book/topic" as FullSlug } }),
    )
    expect(addCleanup).toHaveBeenCalledTimes(2)

    second.open = true
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    expect(second.open).toBe(false)
  })

  it("closes compact non-landing Explorer after every navigation source", () => {
    setCompactExplorer(true)
    const sourceExplorer = renderExplorer()
    initRootIndexSidebar()
    expect(sourceExplorer.open).toBe(false)

    sourceExplorer.open = true
    sourceExplorer
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
    expect(sourceExplorer.open).toBe(false)

    runCleanups()
    document.body.replaceChildren()
    const destinationExplorer = renderExplorer()
    window.history.replaceState({}, "", "/book/topic")
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", {
        detail: { url: "book/topic" as FullSlug },
      }),
    )

    expect(destinationExplorer.open).toBe(false)
  })

  it("leaves compact book and root landing Explorers open", () => {
    setCompactExplorer(true)
    const landingExplorer = renderExplorer({ landing: true })
    initRootIndexSidebar()

    expect(landingExplorer.open).toBe(true)
  })

  it("leaves Explorer open during desktop ordinary-page navigation", () => {
    const sourceExplorer = renderExplorer()
    initRootIndexSidebar()

    sourceExplorer
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
    expect(sourceExplorer.open).toBe(true)

    runCleanups()
    document.body.replaceChildren()
    const destinationExplorer = renderExplorer()
    window.history.replaceState({}, "", "/book/topic")
    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", {
        detail: { url: "book/topic" as FullSlug },
      }),
    )

    expect(destinationExplorer.open).toBe(true)
  })

  it("preserves current-page and modified compact Explorer activations", () => {
    setCompactExplorer(true)
    const currentExplorer = renderExplorer({ current: true })
    const modifiedExplorer = renderExplorer()
    initRootIndexSidebar()

    currentExplorer.open = true
    modifiedExplorer.open = true

    currentExplorer
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
    modifiedExplorer
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0, ctrlKey: true }))

    expect(currentExplorer.open).toBe(true)
    expect(modifiedExplorer.open).toBe(true)
  })

  it("leaves Explorer open while navigating to and rendering a Canvas page", () => {
    setCompactExplorer(true)
    const sourceExplorer = renderExplorer({ kind: "canvas", landing: true })
    initRootIndexSidebar()

    sourceExplorer
      .querySelector("a")!
      .dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0 }))
    expect(sourceExplorer.open).toBe(true)

    runCleanups()
    document.body.replaceChildren()
    const canvasExplorer = renderExplorer({ canvas: true })
    window.history.replaceState({}, "", "/book/history.canvas")

    document.dispatchEvent(
      new CustomEvent<{ url: FullSlug }>("nav", {
        detail: { url: "book/history.canvas" as FullSlug },
      }),
    )

    expect(canvasExplorer.open).toBe(true)
  })
})

describe("built sidebar artifact", () => {
  it("contains an executable light-dismiss script", () => {
    const afterDOMLoaded = BuiltRootIndexSidebar().afterDOMLoaded
    expect(typeof afterDOMLoaded).toBe("string")
    if (typeof afterDOMLoaded !== "string") throw new Error("Expected one bundled inline script")
    expect(afterDOMLoaded).not.toContain("scrollIntoView")
    expect(afterDOMLoaded).not.toContain("sessionStorage")
    expect(afterDOMLoaded).not.toContain("rip-sidebar-explorer-navigation")

    const builtWindow = new HappyDOMWindow()
    const builtDocument = builtWindow.document
    const builtCleanups: Array<() => void> = []
    Object.assign(builtWindow, {
      addCleanup: (cleanup: () => void) => builtCleanups.push(cleanup),
    })

    const executeInlineScript = new Function("window", "document", afterDOMLoaded)
    executeInlineScript(builtWindow, builtDocument)
    builtDocument.body.innerHTML = `
      <nav class="rip-sidebar">
        <details class="rip-sidebar-switcher">
          <summary>Knowledge Base</summary>
          <a href="#book">Book</a>
        </details>
      </nav>
    `

    const switcher = builtDocument.querySelector("details")!
    const summary = builtDocument.querySelector("summary")!
    builtDocument.dispatchEvent(new builtWindow.CustomEvent("nav"))
    switcher.open = true
    const event = new builtWindow.KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    })
    builtDocument.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(switcher.open).toBe(false)
    expect(builtDocument.activeElement).toBe(summary)
    expect(builtCleanups).toHaveLength(1)

    builtCleanups.forEach((cleanup) => cleanup())
    builtWindow.close()
  })
})
