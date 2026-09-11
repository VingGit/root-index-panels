import { createElement } from "preact"
import renderToString from "preact-render-to-string"
import { describe, expect, it } from "vitest"

import { builtInIconNames, lucidePackageVersion } from "../src/built-in-icons.generated"
import { resolvePanelIcon } from "../src/icons"
import { normalizeRootIndexPanelsOptions } from "../src/options"

describe("generated built-in icon registry", () => {
  it.each(builtInIconNames)("resolves %s", (name) => {
    expect(resolvePanelIcon(name)?.name).toBe(name)
  })
})

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

    expect(html).toContain(`lucide-static@${lucidePackageVersion}/icons/book-copy.svg`)
    expect(html).toContain("width:20px")
    expect(html).toContain("height:18px")
    expect(html).toContain("background:currentColor")
    expect(html).toContain("mask:url(")
    expect(html).toContain('data-rip-lucide-icon="book-copy"')
  })

  it("accepts a direct Lucide icon as the configured default", () => {
    const options = normalizeRootIndexPanelsOptions({ defaultIcon: " lucide:book-copy " })
    expect(options.defaultIcon).toBe("lucide:book-copy")
    expect(resolvePanelIcon(undefined, options)?.name).toBe("lucide:book-copy")
  })

  it.each([
    "lucide:",
    "lucide:BookCopy",
    "lucide:book_copy",
    "lucide:book copy",
    "lucide:../book-copy",
    "lucide:https://example.com/icon.svg",
  ])("rejects malformed direct Lucide specifier %s", (name) => {
    expect(resolvePanelIcon(name, { defaultIcon: "coffee" })?.name).toBe("coffee")
  })
})
