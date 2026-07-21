// RootIndexSidebar keeps all navigation as ordinary SSR links. JavaScript only
// enhances the book switcher dismissal and independent folder disclosures.

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

export function initRootIndexSidebar() {
  const cleanups: Array<() => void> = []
  initSwitchers(cleanups)
  initFolderDisclosures(cleanups)

  if (typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => cleanups.forEach((cleanup) => cleanup()))
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("nav", () => initRootIndexSidebar())
}
