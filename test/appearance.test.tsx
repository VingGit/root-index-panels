import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import type { PanelIconComponent, RootIndexPanelsOptions } from "../src/types"
import { countOccurrences, physicalFile, renderPanels } from "./helpers"

const CustomIcon: PanelIconComponent = (props) => <svg {...props} data-custom-icon="true" />
const CollisionIcon: PanelIconComponent = (props) => <svg {...props} data-custom-icon="collision" />

function bookFiles(panel?: unknown) {
  return [physicalFile("alpha/index", { title: "Alpha", panel }), physicalFile("alpha/note")]
}

function renderAppearance(panel?: unknown, options?: RootIndexPanelsOptions | unknown): string {
  return renderPanels(bookFiles(panel), options)
}

function appearancePanel(html: string): string {
  const start = html.indexOf('<a href="./alpha/"')
  const end = html.indexOf("</a>", start)
  return start >= 0 && end > start ? html.slice(start, end + 4) : ""
}

const layouts = ["cards", "list"] as const
const styleSource = readFileSync(
  new URL("../src/components/styles/panels.scss", import.meta.url),
  "utf8",
)

describe.each(layouts)("appearance resolution and markup (%s)", (layout) => {
  it("renders untouched defaults without an icon or accent hook", () => {
    const html = renderPanels(bookFiles(), { layout })

    expect(html).not.toContain("rip-panel-icon")
    expect(html).not.toContain("data-rip-icon")
    expect(html).not.toContain("data-rip-accent")
    expect(html).not.toContain("--rip-panel-accent")
  })

  it("treats defaultIcon as an explicit opt-in", () => {
    const html = renderPanels(bookFiles(), { layout, defaultIcon: "book-open" })

    expect(html).toContain('data-rip-icon="book-open"')
    expect(html).toContain('class="rip-panel-icon"')
  })

  it("lets a custom alias win a collision with a built-in", () => {
    const html = renderPanels(bookFiles({ icon: "book-open" }), {
      layout,
      icons: { "book-open": CollisionIcon },
    })

    expect(html).toContain('data-rip-icon="book-open"')
    expect(html).toContain('data-custom-icon="collision"')
  })

  it("resolves named appearance per book without leaking it to another panel", () => {
    const html = renderPanels(
      [
        physicalFile("alpha/index", {
          title: "Alpha",
          panel: { icon: "terminal", accent: "brand" },
        }),
        physicalFile("alpha/page"),
        physicalFile("beta/index", { title: "Beta" }),
        physicalFile("beta/page"),
      ],
      { layout, accents: { brand: "#1a2b3c" } },
    )

    expect(countOccurrences(html, 'data-rip-icon="terminal"')).toBe(1)
    expect(countOccurrences(html, 'data-rip-accent="brand"')).toBe(1)
    expect(countOccurrences(html, "--rip-panel-accent: #1a2b3c")).toBe(1)
    expect(countOccurrences(html, "rip-panel-icon")).toBe(1)
  })
})

describe("appearance style contract", () => {
  it("shows a persistent list accent even when no icon resolves", () => {
    expect(styleSource).toMatch(
      /\.rip-list-link[\s\S]*?&\[data-rip-accent\][\s\S]*?border-inline-start-color:\s*var\(--rip-panel-accent\)/,
    )
    expect(styleSource).toMatch(
      /forced-colors:\s*active[\s\S]*?\.rip \.rip-list-link\[data-rip-accent\][\s\S]*?border-inline-start-color:\s*LinkText/,
    )
  })
})

describe("icon resolution", () => {
  it.each([
    "book-open",
    "coffee",
    "terminal",
    "container",
    "layers",
    "code-2",
    "network",
    "git-branch",
    "database",
    "shield",
    "cpu",
    "globe",
    "file-code-2",
  ])("resolves the curated built-in %s", (name) => {
    expect(renderAppearance({ icon: name })).toContain(`data-rip-icon="${name}"`)
  })

  it("resolves valid custom icons and forwards the decorative SVG props", () => {
    const html = renderAppearance({ icon: "custom" }, { icons: { custom: CustomIcon } })

    expect(html).toContain('data-rip-icon="custom"')
    expect(html).toContain('data-custom-icon="true"')
    expect(html).toContain('focusable="false"')
  })

  it.each([
    ["unknown", "coffee"],
    ["Bad_Name", "coffee"],
    ["   ", "coffee"],
    [17, "coffee"],
    [null, "coffee"],
  ])("falls back from malformed or unknown panel icon %j", (panelIcon, expected) => {
    const html = renderAppearance({ icon: panelIcon }, { defaultIcon: expected as string })

    expect(html).toContain(`data-rip-icon="${expected}"`)
  })

  it("trims a valid icon identifier before resolving it", () => {
    expect(renderAppearance({ icon: " terminal " }, { defaultIcon: "coffee" })).toContain(
      'data-rip-icon="terminal"',
    )
  })

  it("renders no icon when neither the panel nor default name resolves", () => {
    const html = renderAppearance({ icon: "unknown" }, { defaultIcon: "also-unknown" })

    expect(html).not.toContain("data-rip-icon")
    expect(html).not.toContain("rip-panel-icon")
  })

  it("ignores invalid keys, non-function aliases, and inherited aliases", () => {
    const inheritedIcons = Object.create({ inherited: CustomIcon }) as Record<
      string,
      PanelIconComponent
    >
    Object.assign(inheritedIcons, {
      Bad_Key: CustomIcon,
      broken: "not a function",
    })

    for (const icon of ["inherited", "Bad_Key", "broken"]) {
      const html = renderAppearance({ icon }, {
        icons: inheritedIcons,
        defaultIcon: "terminal",
      } as unknown as RootIndexPanelsOptions)
      expect(html).toContain('data-rip-icon="terminal"')
      expect(html).not.toContain("data-custom-icon")
    }
  })

  it("does not resolve Object prototype properties as aliases", () => {
    for (const icon of ["constructor", "to-string"]) {
      const html = renderAppearance({ icon }, { defaultIcon: "coffee" })
      expect(html).toContain('data-rip-icon="coffee"')
    }
  })

  it.each([null, [], 42, "panel", Object.create({ icon: "coffee" }), { accent: "#abc" }])(
    "handles non-record, inherited, and partial panel metadata %# without throwing",
    (panel) => {
      expect(() => renderAppearance(panel)).not.toThrow()
      expect(renderAppearance(panel)).not.toContain("data-rip-icon")
    },
  )

  it("ignores accessor properties without invoking authored code", () => {
    let getterCalls = 0
    const panel = Object.defineProperty({}, "icon", {
      enumerable: true,
      get() {
        getterCalls += 1
        return "coffee"
      },
    })

    expect(renderAppearance(panel)).not.toContain("data-rip-icon")
    expect(getterCalls).toBe(0)
  })
})

describe("accent resolution and validation", () => {
  it.each(["#abc", "#abcd", "#a1b2c3", "#A1B2C3D4", "var(--brand)", "var(--_accent9)"])(
    "accepts the direct accent %s",
    (accent) => {
      const html = renderAppearance({ accent })

      expect(html).toContain('data-rip-accent="direct"')
      expect(html).toContain(`--rip-panel-accent: ${accent}`)
      expect(html).not.toMatch(
        new RegExp(`class="[^"]*${accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
      )
      expect(html).not.toContain(`data-rip-accent="${accent}"`)
    },
  )

  it("trims allowed direct values and emits a safe direct hook", () => {
    const html = renderAppearance({ accent: "  #abc  " })

    expect(html).toContain('data-rip-accent="direct"')
    expect(html).toContain("--rip-panel-accent: #abc")
    expect(html).not.toContain("  #abc  ")
  })

  it("resolves a valid own named accent and puts only the safe key in the hook", () => {
    const html = renderAppearance(
      { accent: " brand " },
      { accents: { brand: "var(--book-brand)" } },
    )

    expect(html).toContain('data-rip-accent="brand"')
    expect(html).toContain("--rip-panel-accent: var(--book-brand)")
    expect(html).not.toContain('data-rip-accent="var(--book-brand)"')
  })

  it("lets panel theme bypass a configured default", () => {
    const html = renderAppearance(
      { accent: "theme" },
      { defaultAccent: "brand", accents: { brand: "#abc" } },
    )

    expect(html).not.toContain("data-rip-accent")
    expect(html).not.toContain("--rip-panel-accent")
  })

  it("falls back from missing, unknown, and invalid panel values to a named default", () => {
    for (const panel of [undefined, { accent: "unknown" }, { accent: "red" }, { accent: 7 }]) {
      const html = renderAppearance(panel, {
        defaultAccent: "brand",
        accents: { brand: "#123456" },
      })
      expect(html).toContain('data-rip-accent="brand"')
      expect(html).toContain("--rip-panel-accent: #123456")
    }
  })

  it("supports theme, named, and direct defaults and turns invalid defaults into theme", () => {
    const named = renderAppearance(undefined, {
      defaultAccent: "brand",
      accents: { brand: "#abc" },
    })
    const direct = renderAppearance(undefined, { defaultAccent: "#abcdef12" })
    const theme = renderAppearance(undefined, { defaultAccent: "theme" })
    const invalid = renderAppearance(undefined, { defaultAccent: "red" })

    expect(named).toContain('data-rip-accent="brand"')
    expect(direct).toContain('data-rip-accent="direct"')
    expect(direct).toContain("--rip-panel-accent: #abcdef12")
    for (const html of [theme, invalid]) {
      expect(html).not.toContain("data-rip-accent")
      expect(html).not.toContain("--rip-panel-accent")
    }
  })

  it("does not recurse through registry aliases", () => {
    const html = renderAppearance(undefined, {
      defaultAccent: "first",
      accents: { first: "second", second: "#abc" },
    })

    expect(html).not.toContain("data-rip-accent")
    expect(html).not.toContain("--rip-panel-accent")
  })

  it("ignores inherited, reserved, malformed, and invalid registry entries", () => {
    const accents = Object.create({ inherited: "#abc" }) as Record<string, string>
    Object.assign(accents, {
      theme: "#def",
      Bad_Key: "#123",
      invalid: "red",
      valid: "#456",
    })

    for (const accent of ["inherited", "constructor", "theme", "Bad_Key", "invalid"]) {
      const html = renderAppearance({ accent }, {
        accents,
        defaultAccent: "#789",
      } as RootIndexPanelsOptions)
      if (accent === "theme") {
        expect(html).not.toContain("data-rip-accent")
      } else {
        expect(html).toContain('data-rip-accent="direct"')
        expect(html).toContain("--rip-panel-accent: #789")
      }
      expect(html).not.toContain(`data-rip-accent="${accent}"`)
    }

    expect(renderAppearance({ accent: "valid" }, { accents })).toContain('data-rip-accent="valid"')
  })

  it.each([
    "#fff;outline:none",
    "#fff}",
    "#12",
    "#12345",
    "red",
    "transparent",
    "url(https://example.com/x)",
    "linear-gradient(red, blue)",
    "rgb(1 2 3)",
    "var(--x, red)",
    "var( --x)",
    "var(--x);color:red",
    "{color:red}",
    "\u0000#fff",
    "#fff\noutline:none",
  ])("rejects the injection or out-of-grammar accent %j", (accent) => {
    const direct = renderAppearance({ accent })
    const fromDefault = renderAppearance(undefined, { defaultAccent: accent })
    const fromRegistry = renderAppearance({ accent: "unsafe" }, { accents: { unsafe: accent } })

    for (const html of [direct, fromDefault, fromRegistry]) {
      const panel = appearancePanel(html)
      expect(panel).not.toContain("data-rip-accent")
      expect(panel).not.toContain("--rip-panel-accent")
      expect(panel).not.toContain(accent)
    }
  })
})

describe.each(layouts)("decorative icon accessibility (%s)", (layout) => {
  it.each([
    ["built-in", { defaultIcon: "coffee" }],
    ["custom", { defaultIcon: "custom", icons: { custom: CustomIcon } }],
  ] as const)("keeps a %s icon inert and the title as the only link name", (_kind, options) => {
    const html = renderAppearance(undefined, { ...options, layout })
    const panel = appearancePanel(html)

    expect(countOccurrences(panel, "<a ")).toBe(1)
    expect(countOccurrences(panel, "</a>")).toBe(1)
    expect(panel).toContain('aria-labelledby="rip-panel-0-title"')
    expect(panel).toContain('id="rip-panel-0-title">Alpha</span>')
    expect(panel).toContain('aria-describedby="rip-panel-0-count"')
    if (layout === "cards") {
      expect(panel).toContain('<span class="rip-count" aria-hidden="true">1</span>')
      expect(panel).toContain('<span class="rip-sr-only" id="rip-panel-0-count">1 note</span>')
    } else {
      expect(panel).toContain('<span class="rip-count" id="rip-panel-0-count">1 note</span>')
    }
    expect(panel).not.toContain('aria-label="Alpha')
    expect(panel).toContain('<span class="rip-panel-icon" aria-hidden="true" inert>')
    expect(panel).toContain('focusable="false"')
    expect(panel).toContain("Alpha")
    expect(panel).not.toContain("tabindex")
    expect(panel).not.toContain("<button")
    expect(panel).not.toContain("<input")
  })
})
