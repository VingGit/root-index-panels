// RootIndexSidebar remains fully navigable without JavaScript. This small
// enhancement gives its native disclosure the light-dismiss behavior expected
// from a dropdown while preserving Quartz's SPA cleanup contract.

export function initRootIndexSidebar() {
  const switchers = Array.from(
    document.querySelectorAll<HTMLDetailsElement>(".rip-sidebar .rip-sidebar-switcher"),
  )
  if (switchers.length === 0) return

  const cleanups: Array<() => void> = []

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

  if (typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => {
      cleanups.forEach((cleanup) => cleanup())
    })
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("nav", () => {
    initRootIndexSidebar()
  })
}
