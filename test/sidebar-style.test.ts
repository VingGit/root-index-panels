import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const styleSource = readFileSync(
  new URL("../src/components/styles/sidebar.scss", import.meta.url),
  "utf8",
)

describe("RootIndexSidebar Explorer replacement styles", () => {
  it("hides only a direct Explorer sibling in the same left layout slot", () => {
    expect(styleSource).toContain(
      '.left.sidebar:has(> .rip-sidebar[data-rip-replace-explorer="true"]) > .explorer',
    )
    expect(styleSource).not.toContain("rip-sidebar-explorer-replaced")
    expect(styleSource).not.toMatch(/\.(?:right|graph|toc|backlinks|search|page-title)\b/)
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
})
