// RootIndexPanels remains fully usable without JavaScript. This enhancement adds
// keyboard movement between book links and an in-place sort control for the full
// library. The latest-edited preview is intentionally never reordered.

type LibrarySort = "date-desc" | "date-asc" | "title-asc" | "title-desc"

interface SortableBook {
  element: HTMLElement
  date: number
  title: string
  index: number
}

function bookValue(element: HTMLElement, index: number): SortableBook {
  const rawDate = Number(element.dataset.ripDate)
  return {
    element,
    date: Number.isFinite(rawDate) ? rawDate : Number.NEGATIVE_INFINITY,
    title: element.dataset.ripTitle ?? "",
    index,
  }
}

function compareTitle(left: SortableBook, right: SortableBook): number {
  const leftFolded = left.title.toLowerCase()
  const rightFolded = right.title.toLowerCase()
  if (leftFolded < rightFolded) return -1
  if (leftFolded > rightFolded) return 1
  if (left.title < right.title) return -1
  if (left.title > right.title) return 1
  return left.index - right.index
}

export function compareBooks(left: SortableBook, right: SortableBook, sort: LibrarySort): number {
  if (sort === "date-desc") return right.date - left.date || compareTitle(left, right)
  if (sort === "date-asc") return left.date - right.date || compareTitle(left, right)
  if (sort === "title-desc") return compareTitle(right, left) || left.index - right.index
  return compareTitle(left, right)
}

function initLibrarySort(cleanups: Array<() => void>) {
  const library = document.querySelector<HTMLElement>("#rip-books")
  const control = library?.querySelector<HTMLSelectElement>("[data-rip-sort-control]")
  const list = library?.querySelector<HTMLElement>("[data-rip-book-list]")
  if (!control || !list) return

  const originalItems = Array.from(list.children).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  )
  const items = originalItems.map(bookValue)

  const sortItems = () => {
    const sort = control.value as LibrarySort
    if (!(["date-desc", "date-asc", "title-asc", "title-desc"] as const).includes(sort)) return
    for (const item of [...items].sort((left, right) => compareBooks(left, right, sort))) {
      list.append(item.element)
    }
  }

  control.addEventListener("change", sortItems)
  sortItems()
  cleanups.push(() => control.removeEventListener("change", sortItems))
}

function initBookKeyboardNavigation(cleanups: Array<() => void>) {
  const grids = document.querySelectorAll<HTMLElement>(".rip-grid, .rip-list")

  for (const grid of grids) {
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".rip-card, .rip-list-item"))
    if (cards.length === 0) continue

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

      const active = document.activeElement
      if (!active) return

      const link = active.closest<HTMLElement>(".rip-card-link, .rip-list-link")
      const card = link?.closest<HTMLElement>(".rip-card, .rip-list-item")
      if (!card) return

      const index = cards.indexOf(card)
      if (index === -1) return

      let target: HTMLElement | undefined
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = cards[index + 1]
          break
        case "ArrowLeft":
        case "ArrowUp":
          target = cards[index - 1]
          break
        case "Home":
          target = cards[0]
          break
        case "End":
          target = cards[cards.length - 1]
          break
      }

      if (target) {
        event.preventDefault()
        target.querySelector<HTMLElement>(".rip-card-link, .rip-list-link")?.focus()
      }
    }

    grid.addEventListener("keydown", onKeyDown)
    cleanups.push(() => grid.removeEventListener("keydown", onKeyDown))
  }
}

export function initRootIndexPanels() {
  const cleanups: Array<() => void> = []
  initLibrarySort(cleanups)
  initBookKeyboardNavigation(cleanups)

  if (typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => cleanups.forEach((cleanup) => cleanup()))
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("nav", () => initRootIndexPanels())
}
