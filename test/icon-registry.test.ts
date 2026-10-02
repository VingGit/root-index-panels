import { readFileSync } from "node:fs"
import { createElement } from "preact"
import renderToString from "preact-render-to-string"
import { describe, expect, it } from "vitest"

import { resolvePanelIcon } from "../src/icons"
import { normalizeRootIndexPanelsOptions } from "../src/options"

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { dependencies: { "lucide-preact": string } }

describe("direct Lucide icon specifiers", () => {
  it("renders a version-pinned, color-inheriting CDN mask", () => {
    const resolved = resolvePanelIcon("lucide:book-copy")
    expect(resolved?.name).toBe("lucide:book-copy")

    const html = renderToString(
      createElement(resolved!.component, {
        width: 20,
        height: 18,
        "aria-hidden": "true",
        focusable: "false",
      }),
    )

    expect(html).toContain(
      `lucide-static@${packageJson.dependencies["lucide-preact"]}/icons/book-copy.svg`,
    )
    expect(html).toContain("width:20px")
    expect(html).toContain("height:18px")
    expect(html).toContain("background:currentColor")
    expect(html).toContain("mask:url(")
  })

  it("normalizes a direct Lucide default and rejects every alternate syntax", () => {
    const options = normalizeRootIndexPanelsOptions({ defaultIcon: " lucide:book-copy " })
    expect(options.defaultIcon).toBe("lucide:book-copy")
    expect(resolvePanelIcon(undefined, options)?.name).toBe("lucide:book-copy")

    for (const name of [
      "book-copy",
      "lucide:",
      "lucide:BookCopy",
      "lucide:book_copy",
      "lucide:book copy",
      "lucide:../book-copy",
      "lucide:https://example.com/icon.svg",
    ]) {
      expect(resolvePanelIcon(name, { defaultIcon: "lucide:coffee" })?.name).toBe("lucide:coffee")
    }
  })
})
