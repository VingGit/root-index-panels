import {
  compareFilenameSortNames,
  normalizeFilenameSortDirection,
  type FilenameSortDirection,
} from "../../filenameSorting"

// RootIndexSidebar keeps all navigation as ordinary SSR links. JavaScript only
// enhances book switcher dismissal, compact Explorer dismissal, independent folder
// disclosures, and filename ordering for compatible Quartz note-list components.

interface FilenameListSortEntry {
  sortName: string
  folderKey: string
  direction: FilenameSortDirection
}

interface FilenameListSortContext {
  index: Map<string, FilenameListSortEntry>
}

function normalizedListHref(href: string): string | undefined {
  try {
    const path = new URL(href, document.baseURI).pathname.replace(/\/+$/, "")
    return path.length > 0 ? path : "/"
  } catch {
    return undefined
  }
}

function readFilenameListSortContext(): FilenameListSortContext | undefined {
  const sidebar = document.querySelector<HTMLElement>(".rip-sidebar[data-rip-filename-sort-index]")
  if (!sidebar) return undefined

  const rawIndex = sidebar.dataset.ripFilenameSortIndex
  if (!rawIndex) return undefined

  let parsed: unknown
  try {
    parsed = JSON.parse(rawIndex)
  } catch {
    return undefined
  }
  if (!Array.isArray(parsed)) return undefined

  const index = new Map<string, FilenameListSortEntry>()
  for (const entry of parsed) {
    if (!Array.isArray(entry) || entry.length !== 4) continue
    const [href, sortName, folderKey, rawDirection] = entry
    const direction = normalizeFilenameSortDirection(rawDirection)
    if (
      typeof href !== "string" ||
      typeof sortName !== "string" ||
      typeof folderKey !== "string" ||
      !direction
    ) {
      continue
    }
    const value = { sortName, folderKey, direction }
    index.set(href, value)
    const normalized = normalizedListHref(href)
    if (normalized) index.set(normalized, value)
  }
  if (index.size === 0) return undefined

  return { index }
}

function listItemSortEntry(
  item: Element,
  index: ReadonlyMap<string, FilenameListSortEntry>,
): FilenameListSortEntry | undefined {
  const link = item.querySelector<HTMLAnchorElement>("a.internal[href]:not(.tag-link)")
  const href = link?.getAttribute("href")
  if (!href) return undefined

  const direct = index.get(href)
  if (direct !== undefined) return direct
  const normalized = normalizedListHref(href)
  return normalized ? index.get(normalized) : undefined
}

function sortFilenameList(
  list: HTMLUListElement,
  index: ReadonlyMap<string, FilenameListSortEntry>,
) {
  const children = Array.from(list.children)
  const groups = new Map<
    string,
    {
      direction: FilenameSortDirection
      sortable: Array<{ element: Element; position: number; sortName: string }>
    }
  >()

  for (let position = 0; position < children.length; position += 1) {
    const element = children[position]!
    const entry = listItemSortEntry(element, index)
    if (!entry) continue
    const group = groups.get(entry.folderKey) ?? {
      direction: entry.direction,
      sortable: [],
    }
    group.sortable.push({ element, position, sortName: entry.sortName })
    groups.set(entry.folderKey, group)
  }

  const nextChildren = [...children]
  for (const group of groups.values()) {
    if (group.sortable.length < 2) continue
    const ordered = [...group.sortable].sort((left, right) => {
      const compared = compareFilenameSortNames(left.sortName, right.sortName, group.direction)
      return compared !== 0 ? compared : left.position - right.position
    })
    for (let slot = 0; slot < group.sortable.length; slot += 1) {
      nextChildren[group.sortable[slot]!.position] = ordered[slot]!.element
    }
  }
  for (const child of nextChildren) list.append(child)
}

function initFilenameListSorting() {
  const context = readFilenameListSortContext()
  if (!context) return

  const lists = document.querySelectorAll<HTMLUListElement>(".backlinks > ul, ul.section-ul")
  for (const list of lists) {
    sortFilenameList(list, context.index)
  }
}

function compactExplorerIsActive(): boolean {
  try {
    return window.matchMedia?.("(max-width: 800px)").matches ?? window.innerWidth <= 800
  } catch {
    return window.innerWidth <= 800
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

  if (compactExplorerIsActive()) {
    for (const explorer of explorers) {
      const sidebar = explorer.closest<HTMLElement>(".rip-sidebar")
      const canvasFrame = explorer.closest<HTMLElement>('.page[data-frame="canvas"]')
      const landingPage = sidebar?.querySelector('.rip-sidebar-home-mark[aria-current="page"]')
      if (!canvasFrame && !landingPage) explorer.open = false
    }
  }

  for (const explorer of explorers) {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        !compactExplorerIsActive() ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      const target = event.target as { closest?: (selector: string) => Element | null } | null
      const link = target?.closest?.("a") as HTMLAnchorElement | null
      if (
        !link ||
        !explorer.contains(link) ||
        link.getAttribute("aria-current") === "page" ||
        link.dataset.ripNodeKind === "canvas"
      ) {
        return
      }

      explorer.open = false
    }

    explorer.addEventListener("click", onClick)
    cleanups.push(() => explorer.removeEventListener("click", onClick))
  }
}

export function initRootIndexSidebar() {
  const cleanups: Array<() => void> = []
  initFilenameListSorting()
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
