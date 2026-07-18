import render from "preact-render-to-string"
import { describe, expect, it, vi } from "vitest"

vi.mock("../src/components/scripts/panels.inline.ts", () => ({ default: "" }))
vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))
vi.mock("../src/components/styles/sidebar.scss", () => ({ default: "" }))

import packageJson from "../package.json"
import { validateManifest } from "../src/build/validate-manifest"
import { RootIndexPanels } from "../src/components"
import RootIndexSidebar from "../src/components/RootIndexSidebar"
import * as componentExports from "../src/components"
import * as packageExports from "../src/index"
import { RootIndexPanelsPage } from "../src/pageType"
import {
  componentProps,
  fullSlug,
  physicalFile,
  renderComponent,
  renderPanels,
  virtualFile,
} from "./helpers"

describe("plugin localization", () => {
  const singularFiles = [physicalFile("java/index", { title: "Java" }), physicalFile("java/one")]
  const pluralFiles = [
    physicalFile("java/index", { title: "Java" }),
    physicalFile("java/one"),
    physicalFile("java/two"),
  ]

  it.each([
    ["en-US", singularFiles, 1, "1 note"],
    ["en-US", pluralFiles, 2, "2 notes"],
    ["fi-FI", singularFiles, 1, "1 muistiinpano"],
    ["fi-FI", pluralFiles, 2, "2 muistiinpanoa"],
  ])("renders the exact %s count for the fixture", (locale, files, count, expected) => {
    const cards = renderPanels(files, { layout: "cards" }, locale)
    const list = renderPanels(files, { layout: "list" }, locale)

    expect(cards).toContain(`aria-hidden="true">${count}</span>`)
    expect(cards).toContain(`>${expected}</span>`)
    expect(list).toContain(`>${expected}</span>`)
  })

  it.each([
    ["en-US", "No subdirectories found."],
    ["fi-FI", "Alikansioita ei löytynyt."],
  ])("renders the exact %s empty state", (locale, expected) => {
    expect(renderPanels([physicalFile("index")], undefined, locale)).toContain(expected)
  })

  it("falls back to English for an unsupported locale", () => {
    const count = renderPanels(singularFiles, undefined, "sv-SE")
    const empty = renderPanels([physicalFile("index")], undefined, "sv-SE")

    expect(count).toContain(">1 note</span>")
    expect(empty).toContain("No subdirectories found.")
  })

  it.each([
    ["en-US", "directories", "total notes", "Browse directories"],
    ["fi-FI", "hakemistoa", "muistiinpanoja", "Selaa hakemistoja"],
  ])("localizes the %s root overview", (locale, directories, totalNotes, browse) => {
    const html = renderPanels(
      [
        physicalFile("git/index", { title: "Git" }),
        physicalFile("git/topic"),
        physicalFile("java/index", { title: "Java" }),
        physicalFile("java/one"),
        physicalFile("java/two"),
      ],
      undefined,
      locale,
    )

    expect(html).toContain(`<dt>${directories}</dt><dd>2</dd>`)
    expect(html).toContain(`<dt>${totalNotes}</dt><dd>3</dd>`)
    expect(html).toContain(`href="#rip-directories">${browse}`)
    expect(html).toContain(`id="rip-directories-heading">${browse}</h2>`)
  })

  it("formats the newest overview date in UTC and omits an empty Markdown wrapper", () => {
    const html = renderPanels([
      physicalFile(
        "java/index",
        { title: "Java" },
        { dates: { modified: new Date("2024-01-02T23:00:00-05:00") } },
      ),
      physicalFile("java/topic"),
    ])

    expect(html).toContain("<dt>last updated</dt><dd>Jan 3, 2024</dd>")
    expect(html).not.toContain("rip-root-content")
  })

  it("omits finite timestamps outside the ECMAScript Date range", () => {
    const html = renderPanels([
      physicalFile("java/index", { title: "Java" }, { date: 1e100 }),
      physicalFile("java/topic"),
    ])

    expect(html).not.toContain("<dt>last updated</dt>")
    expect(html).toContain("Java")
  })

  it("selects the locale per render rather than at module initialization", () => {
    const Component = RootIndexPanels()
    const english = renderComponent(Component, "index", pluralFiles, "en-US")
    const finnish = renderComponent(Component, "index", pluralFiles, "fi-FI")
    const englishAgain = renderComponent(Component, "index", pluralFiles, "en-US")

    expect(english).toContain(">2 notes</span>")
    expect(finnish).toContain(">2 muistiinpanoa</span>")
    expect(englishAgain).toContain(">2 notes</span>")
  })
})

describe("RootIndexPanelsPage", () => {
  it("owns only the root index at exact priority 100 with the content layout", () => {
    const pageType = RootIndexPanelsPage()

    expect(pageType.name).toBe("RootIndexPanelsPage")
    expect(pageType.priority).toBe(100)
    expect(pageType.layout).toBe("content")
    expect(pageType.generate).toBeUndefined()
    expect(
      pageType.match({ slug: fullSlug("index"), fileData: physicalFile("index"), cfg: {} }),
    ).toBe(true)
    expect(
      pageType.match({ slug: fullSlug("index"), fileData: virtualFile("index"), cfg: {} }),
    ).toBe(false)
    let filePathReads = 0
    const accessorRoot = virtualFile("index")
    Object.defineProperty(accessorRoot, "filePath", {
      get() {
        filePathReads += 1
        throw new Error("filePath accessor must not run")
      },
    })
    expect(pageType.match({ slug: fullSlug("index"), fileData: accessorRoot, cfg: {} })).toBe(false)
    expect(filePathReads).toBe(0)
    expect(
      pageType.match({
        slug: fullSlug("java/index"),
        fileData: physicalFile("java/index"),
        cfg: {},
      }),
    ).toBe(false)
  })

  it("captures factory options for the Page Type body", () => {
    const pageType = RootIndexPanelsPage({ layout: "list" })
    const html = renderComponent(pageType.body(), "index", [
      physicalFile("java/index"),
      physicalFile("java/note"),
    ])

    expect(html).toContain("rip--list")
    expect(html).not.toContain("rip--cards")
  })

  it("keeps the component inert away from the root index", () => {
    const html = renderPanels(
      [physicalFile("java/index"), physicalFile("java/note")],
      undefined,
      "en-US",
      "java/index",
    )

    expect(html).toBe("")
  })

  it("renders the authored root HAST and preserves TOC and reading-time component data", () => {
    const pageType = RootIndexPanelsPage()
    const props = componentProps("index", [
      physicalFile("java/index", { title: "Java" }),
      physicalFile("java/topic"),
    ])
    const sharedFile = props.fileData
    sharedFile.toc = [{ depth: 2, text: "Root heading", slug: "root-heading" }]
    sharedFile.readingTime = { text: "3 min read", minutes: 3 }
    sharedFile.text = "Authored root prose used by the host's reading-time calculation."
    props.tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "root-heading" },
          children: [{ type: "text", value: "Root heading" }],
        },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "Authored root prose sentinel." }],
        },
      ],
    }

    expect(pageType.treeTransforms).toBeUndefined()
    expect(pageType.match({ slug: fullSlug("index"), fileData: sharedFile, cfg: {} })).toBe(true)

    const html = render(pageType.body()(props) as Parameters<typeof render>[0])
    expect(html).toContain('id="root-heading"')
    expect(html).toContain("Authored root prose sentinel.")
    expect(html).toContain('id="rip-directories"')
    expect(props.fileData).toBe(sharedFile)
    expect(props.fileData).toHaveProperty("toc")
    expect(props.fileData).toHaveProperty("readingTime")
    expect(props.fileData).toHaveProperty("text")
  })
})

describe("manifest and runtime public surface", () => {
  it("validates the checked-in Quartz manifest", () => {
    expect(() => validateManifest()).not.toThrow()
  })

  it("declares YAML-safe appearance defaults without function-valued claims", () => {
    const manifest = packageJson.quartz
    const defaults = manifest.defaultOptions
    const schema = manifest.configSchema

    expect(defaults.defaultIcon).toBe("")
    expect(defaults.defaultAccent).toBe("theme")
    expect(defaults.accents).toEqual({})
    expect(defaults.replaceExplorer).toBe(true)
    expect(defaults).not.toHaveProperty("icons")
    expect(schema.defaultIcon).toEqual({ type: "string" })
    expect(schema.defaultAccent).toEqual({ type: "string" })
    expect(schema.replaceExplorer).toEqual({ type: "boolean" })
    expect(schema).not.toHaveProperty("icons")
    expect(schema).not.toHaveProperty("accents")
    expect(manifest).not.toHaveProperty("optionSchema")
  })

  it("declares both plugin categories and exactly one left sidebar layout component", () => {
    const manifest = packageJson.quartz
    const component = manifest.components.RootIndexSidebar

    expect(manifest.category).toEqual(expect.arrayContaining(["pageType", "component"]))
    expect(Object.keys(manifest.components)).toEqual(["RootIndexSidebar"])
    expect(component.defaultPosition).toBe("left")
    expect(component.defaultPriority).toBe(40)
    expect(component.version).toBe(packageJson.version)
    expect(manifest.version).toBe(packageJson.version)
  })

  it("exports the component and Page Type from their intended runtime barrels", () => {
    expect(packageExports.RootIndexPanels).toBe(RootIndexPanels)
    expect(packageExports.RootIndexSidebar).toBe(RootIndexSidebar)
    expect(packageExports.RootIndexPanelsPage).toBe(RootIndexPanelsPage)
    expect(componentExports.RootIndexPanels).toBe(RootIndexPanels)
    expect(componentExports.RootIndexSidebar).toBe(RootIndexSidebar)
  })
})
