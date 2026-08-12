// RootIndexSidebar keeps all navigation as ordinary SSR links. JavaScript only
// enhances disclosure behavior and compact Explorer navigation.

const explorerNavigationKey = "rip-sidebar-explorer-navigation"
let pendingExplorerNavigation = false

function compactNavigationIsActive(): boolean {
  try {
    return window.matchMedia?.("(max-width: 800px)").matches ?? window.innerWidth <= 800
  } catch {
    return window.innerWidth <= 800
  }
}

function rememberExplorerNavigation() {
  pendingExplorerNavigation = true
  try {
    window.sessionStorage?.setItem(explorerNavigationKey, "true")
  } catch {
    // The in-memory flag still covers Quartz SPA navigation when storage is unavailable.
  }
}

function consumeExplorerNavigation(): boolean {
  let stored = false
  try {
    stored = window.sessionStorage?.getItem(explorerNavigationKey) === "true"
    window.sessionStorage?.removeItem(explorerNavigationKey)
  } catch {
    // Fall back to the in-memory flag.
  }

  const shouldPositionContent = pendingExplorerNavigation || stored
  pendingExplorerNavigation = false
  return shouldPositionContent
}

function positionFirstAuthoredLine() {
  const position = () => {
    const firstAuthoredElement = document.querySelector<HTMLElement>(
      '.page[data-frame="default"] > #quartz-body > .center .markdown-preview-view.markdown-rendered > :first-child',
    )
    firstAuthoredElement?.scrollIntoView({ behavior: "auto", block: "start" })
  }

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => window.requestAnimationFrame(position))
  } else {
    window.setTimeout(position, 0)
  }
}

function initSwitchers(cleanups: Array<() => void>) {
  const switchers = Array.from(
    document.querySelectorAll<HTMLDetailsElement>(".rip-sidebar .rip-sidebar-switcher"),
  )

  for (const switcher of switchers) {
    const onToggle = () => {
      if (!switcher.open) return
      for (const peer of switchers) {
        if (peer !== switcher) peer.open = false
      }
    }
    const onClick = (event: MouseEvent) => {
      const target = event.target as { closest?: (selector: string) => Element | null } | null
      if (target?.closest?.("a")) switcher.open = false
    }

    switcher.addEventListener("toggle", onToggle)
    switcher.addEventListener("click", onClick)
    cleanups.push(() => {
      switcher.removeEventListener("toggle", onToggle)
      switcher.removeEventListener("click", onClick)
    })
  }

  if (switchers.length === 0) return

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as Node | null
    if (!target) return
    for (const switcher of switchers) {
      if (switcher.open && !switcher.contains(target)) switcher.open = false
    }
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    const openSwitcher = switchers.find((switcher) => switcher.open)
    if (!openSwitcher) return

    event.preventDefault()
    openSwitcher.open = false
    const summary = openSwitcher.firstElementChild as { focus?: () => void } | null
    summary?.focus?.()
  }

  document.addEventListener("pointerdown", onPointerDown)
  document.addEventListener("keydown", onKeyDown)
  cleanups.push(() => {
    document.removeEventListener("pointerdown", onPointerDown)
    document.removeEventListener("keydown", onKeyDown)
  })
}

function initFolderDisclosures(cleanups: Array<() => void>) {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".rip-sidebar [data-rip-disclosure]"),
  )

  for (const button of buttons) {
    const onClick = () => {
      const controls = button.getAttribute("aria-controls")
      if (!controls) return
      const children = document.getElementById(controls)
      const folder = button.closest<HTMLElement>(".rip-sidebar-folder")
      if (!children || !folder) return

      const open = button.getAttribute("aria-expanded") === "true"
      const nextOpen = !open
      button.setAttribute("aria-expanded", String(nextOpen))
      children.hidden = !nextOpen
      folder.dataset.ripOpen = String(nextOpen)
    }

    button.addEventListener("click", onClick)
    cleanups.push(() => button.removeEventListener("click", onClick))
  }
}

function initExplorerNavigation(cleanups: Array<() => void>) {
  const explorers = Array.from(
    document.querySelectorAll<HTMLDetailsElement>(".rip-sidebar .rip-sidebar-explorer"),
  )

  for (const explorer of explorers) {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        !compactNavigationIsActive() ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      const target = event.target as { closest?: (selector: string) => Element | null } | null
      const link = target?.closest?.("a")
      if (!link || !explorer.contains(link)) return

      explorer.open = false
      if (link.getAttribute("aria-current") === "page") {
        event.preventDefault()
        event.stopPropagation()
        positionFirstAuthoredLine()
      } else {
        rememberExplorerNavigation()
      }
    }

    explorer.addEventListener("click", onClick)
    cleanups.push(() => explorer.removeEventListener("click", onClick))
  }

  if (consumeExplorerNavigation()) {
    explorers.forEach((explorer) => {
      explorer.open = false
    })
    positionFirstAuthoredLine()
  }
}

export function initRootIndexSidebar() {
  const cleanups: Array<() => void> = []
  initSwitchers(cleanups)
  initExplorerNavigation(cleanups)
  initFolderDisclosures(cleanups)

  if (cleanups.length > 0 && typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => cleanups.forEach((cleanup) => cleanup()))
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("nav", () => initRootIndexSidebar())
}
