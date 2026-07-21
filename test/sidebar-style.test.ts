import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const styleSource = readFileSync(
  new URL("../src/components/styles/sidebar.scss", import.meta.url),
  "utf8",
)
const compactStyleSource = styleSource.replace(/\s+/g, "")
const reworkStyleSource = readFileSync(
  new URL("../src/components/styles/sidebar-rework.scss", import.meta.url),
  "utf8",
)

describe("RootIndexSidebar Explorer replacement styles", () => {
  it("renders the native manual switcher as a bounded overlay surface", () => {
    expect(styleSource).toMatch(
      /\.rip-sidebar-switcher\s*{[\s\S]*?position:\s*relative;[\s\S]*?z-index:\s*5;/,
    )
    expect(styleSource).toMatch(
      /\.rip-sidebar-switcher\s*>\s*summary\s*{[\s\S]*?border:\s*1px solid var\(--lightgray\);[\s\S]*?border-radius:\s*0\.5rem;[\s\S]*?background:/,
    )
    expect(styleSource).toMatch(
      /\.rip-sidebar-switcher-menu\s*{[\s\S]*?position:\s*absolute;[\s\S]*?z-index:\s*20;[\s\S]*?top:\s*calc\(100% \+ 0\.35rem\);[\s\S]*?inset-inline:\s*0;[\s\S]*?overflow:\s*hidden;[\s\S]*?background:\s*var\(--light\);[\s\S]*?box-shadow:/,
    )
    expect(styleSource).toMatch(
      /\.rip-sidebar-books\s*{[\s\S]*?max-height:\s*min\(14rem, calc\(100dvh - 12rem\)\);[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior:\s*contain;/,
    )
    expect(styleSource).toMatch(
      /\.rip-sidebar-switcher\[open\] \+ \.rip-sidebar-scope\s*{[\s\S]*?visibility:\s*hidden;[\s\S]*?pointer-events:\s*none;/,
    )
  })

  it("hides only a direct Explorer sibling in the same left layout slot", () => {
    expect(styleSource).toContain(
      '.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer',
    )
    expect(styleSource).not.toContain("rip-sidebar-explorer-replaced")
    expect(styleSource).not.toMatch(/\.(?:right|graph|toc|backlinks|search|page-title)\b/)
  })

  it("hides only a direct CanvasFrame Explorer sibling when replacement is enabled", () => {
    expect(compactStyleSource).toContain(
      '.page[data-frame="canvas"]>#quartz-body>.center.canvas-frame>.canvas-sidebar:has(>.rip-sidebar[data-rip-replace-explorer="true"])>.explorer{display:none!important;}',
    )
    expect(styleSource.match(/\.page\[data-frame="canvas"\]/g)).toHaveLength(2)
    expect(styleSource).not.toContain('[data-rip-replace-explorer="false"]')
  })

  it("contains an open CanvasFrame drawer inside the viewport when the plugin is mounted", () => {
    expect(compactStyleSource).toContain(
      '.page[data-frame="canvas"]>#quartz-body>.center.canvas-frame:has(>.canvas-sidebar>.rip-sidebar){box-sizing:border-box;}',
    )
    expect(styleSource).not.toContain(".canvas-stage")
    expect(styleSource).not.toContain(".canvas-container")
    expect(styleSource).not.toContain(".canvas-controls")
  })

  it("hides only the redundant root breadcrumb on default-frame book routes", () => {
    expect(compactStyleSource).toContain(
      '.page[data-frame="default"]:has(>#quartz-body>.left.sidebar>.rip-sidebar[data-rip-scope="book"])>#quartz-body>.center>.page-header>.popover-hint>.breadcrumb-container>.breadcrumb-element:first-child:not(:only-child){display:none;}',
    )
    expect(styleSource.match(/\[data-rip-scope="book"\]/g)).toHaveLength(1)
    expect(styleSource.match(/:first-child:not\(:only-child\)/g)).toHaveLength(1)
  })

  it("contains the default Quartz grid without targeting right-side components", () => {
    const defaultFrameSelector =
      '.page[data-frame="default"]:has(> #quartz-body > .left.sidebar > .rip-sidebar)'

    expect(
      styleSource.match(
        new RegExp(defaultFrameSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      ),
    ).toHaveLength(2)
    expect(styleSource).toMatch(
      /@media \(min-width: 800px\) and \(max-width: 1200px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 20rem\) minmax\(0, 1fr\)/,
    )
    expect(styleSource).toMatch(
      /@media \(max-width: 800px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) !important/,
    )
  })

  it("uses a contained native shell disclosure at the mobile breakpoint", () => {
    expect(styleSource).toContain("@media (max-width: 800px)")
    expect(styleSource).toContain(".rip-sidebar-toggle")
    expect(styleSource).toContain("min-height: 2.75rem")
    expect(styleSource).toMatch(
      /\.rip-sidebar-home,[\s\S]*?\.rip-sidebar-overview-link\s*{[\s\S]*?min-height:\s*2\.75rem/,
    )
    expect(styleSource).toMatch(
      /\.rip-sidebar-folder\s*>\s*details\s*>\s*summary\s*{[\s\S]*?min-height:\s*2\.75rem/,
    )
    expect(styleSource).toContain(".rip-sidebar-shell:not([open]) > .rip-sidebar-content")
    expect(styleSource).toMatch(
      /\.left\.sidebar:has\(> \.rip-sidebar\)\s*{[\s\S]*?min-width:\s*0;[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*100%;[\s\S]*?flex-wrap:\s*wrap;[\s\S]*?overflow-wrap:\s*anywhere;/,
    )
  })

  it("cannot strand a mobile-collapsed shell when the viewport widens", () => {
    expect(styleSource).toMatch(
      /@media \(min-width: 801px\)[\s\S]*?\.rip-sidebar-shell:not\(\[open\]\)\s*>\s*\.rip-sidebar-content\s*{[\s\S]*?display:\s*block;/,
    )
  })
  it("contains current backgrounds and rails to interactive rows", () => {
    expect(styleSource).not.toContain('.rip-sidebar [data-rip-state="current"]')
    expect(styleSource).not.toContain('.rip-sidebar [data-rip-state="ancestor"]')
    expect(styleSource).toContain('.rip-sidebar-note-link[data-rip-state="current"]')
    expect(reworkStyleSource).toMatch(/\.rip-sidebar-note-link\s*\{[\s\S]*?position:\s*relative;/)
  })
})
