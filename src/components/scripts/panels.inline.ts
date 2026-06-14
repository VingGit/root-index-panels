// ============================================================================
// RootIndexPanels — client-side script
//
// Initialised on every Quartz "nav" event (initial load + SPA navigations).
// Adds keyboard navigation between cards (arrow keys, Home, End).
// All event listeners are registered with window.addCleanup so Quartz's SPA
// router can tear them down before the next navigation.
// ============================================================================

function initRootIndexPanels() {
  const grids = document.querySelectorAll<HTMLElement>(".rip-grid, .rip-list");
  if (grids.length === 0) return;

  const cleanups: Array<() => void> = [];

  for (const grid of grids) {
    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>(".rip-card, .rip-list-item"),
    );
    if (cards.length === 0) continue;

    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      if (!active) return;

      const link = active.closest<HTMLElement>(
        ".rip-card-link, .rip-list-link",
      );
      if (!link) return;

      const card = link.closest<HTMLElement>(".rip-card, .rip-list-item");
      if (!card) return;

      const idx = cards.indexOf(card);
      if (idx === -1) return;

      let target: HTMLElement | undefined;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = cards[idx + 1];
          break;
        case "ArrowLeft":
        case "ArrowUp":
          target = cards[idx - 1];
          break;
        case "Home":
          target = cards[0];
          break;
        case "End":
          target = cards[cards.length - 1];
          break;
      }

      if (target) {
        e.preventDefault();
        target
          .querySelector<HTMLElement>(".rip-card-link, .rip-list-link")
          ?.focus();
      }
    }

    grid.addEventListener("keydown", onKeyDown);
    cleanups.push(() => grid.removeEventListener("keydown", onKeyDown));
  }

  if (typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => {
      cleanups.forEach((fn) => fn());
    });
  }
}

document.addEventListener("nav", () => {
  initRootIndexPanels();
});
