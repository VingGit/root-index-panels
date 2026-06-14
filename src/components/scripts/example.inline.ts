// ============================================================================
// Example Inline Script for Quartz Community Plugin
// ============================================================================

function _removeAllChildren(element: Element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

function _simplifySlug(slug: string) {
  if (slug.endsWith("/index")) {
    return slug.slice(0, -6)
  }
  return slug
}

function getCurrentSlug() {
  let slug = window.location.pathname
  if (slug.startsWith("/")) slug = slug.slice(1)
  if (slug.endsWith("/")) slug = slug.slice(0, -1)
  return slug || "index"
}

async function _fetchContentIndex() {
  try {
    const data = await fetchData
    return data
  } catch (error) {
    console.error("[Plugin] Error fetching content index:", error)
    return null
  }
}

function init() {
  const components = document.querySelectorAll(".example-component")
  if (components.length === 0) return

  const cleanupFns: Array<() => void> = []

  function keyboardHandler(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
      e.preventDefault()
      console.log("[ExampleComponent] Keyboard shortcut triggered!")
    }
  }

  document.addEventListener("keydown", keyboardHandler)
  cleanupFns.push(() => document.removeEventListener("keydown", keyboardHandler))

  for (const component of components) {
    const clickHandler = () => {
      console.log("[ExampleComponent] Clicked!")
    }
    component.addEventListener("click", clickHandler)
    cleanupFns.push(() => component.removeEventListener("click", clickHandler))
  }

  if (typeof window !== "undefined" && window.addCleanup) {
    window.addCleanup(() => {
      cleanupFns.forEach((fn) => fn())
    })
  }

  console.log("[ExampleComponent] Initialized with", components.length, "component(s)")
}

document.addEventListener("nav", (e) => {
  const slug = e.detail?.url || getCurrentSlug()
  console.log("[ExampleComponent] Navigation to:", slug)
  init()
})

document.addEventListener("render", () => {
  console.log("[ExampleComponent] Render event - re-initializing")
  init()
})

document.addEventListener("prenav", () => {
  const component = document.querySelector(".example-component")
  if (component) {
    sessionStorage.setItem("exampleScrollTop", component.scrollTop?.toString() || "0")
  }
})
