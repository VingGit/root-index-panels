import type { BuildCtx } from "@quartz-community/types"
import { describe, expect, it, vi } from "vitest"

vi.mock("../src/components/scripts/panels.inline.ts", () => ({ default: "" }))
vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))

import packageJson from "../package.json"
import { validateManifest } from "../src/build/validate-manifest"
import { RootIndexPanels } from "../src/components"
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

  it("removes root-only toc and reading-time data through a shallow render clone", () => {
    const pageType = RootIndexPanelsPage()
    const props = componentProps("index", [virtualFile("java/index")])
    const sharedFile = props.fileData
    const sharedFrontmatter = sharedFile.frontmatter
    sharedFile.toc = [{ depth: 2, text: "Root heading", slug: "root-heading" }]
    sharedFile.readingTime = { text: "3 min read", minutes: 3 }
    sharedFile.text = "Authored root prose used by the host's reading-time calculation."
    sharedFile.other = { retained: true }

    const transforms = pageType.treeTransforms?.({} as BuildCtx)
    expect(transforms).toHaveLength(1)
    expect(pageType.match({ slug: fullSlug("index"), fileData: sharedFile, cfg: {} })).toBe(true)
    transforms?.[0]?.({ type: "root", children: [] }, fullSlug("index"), props)

    expect(props.fileData).not.toBe(sharedFile)
    expect(props.fileData.frontmatter).toBe(sharedFrontmatter)
    expect(props.fileData.other).toBe(sharedFile.other)
    expect(props.fileData).not.toHaveProperty("toc")
    expect(props.fileData).not.toHaveProperty("readingTime")
    expect(props.fileData).not.toHaveProperty("text")
    expect(sharedFile).toHaveProperty("toc")
    expect(sharedFile).toHaveProperty("readingTime")
    expect(sharedFile).toHaveProperty("text")
  })

  it("does not clone or suppress component data for a non-root slug", () => {
    const pageType = RootIndexPanelsPage()
    const props = componentProps("java/index", [])
    const sharedFile = props.fileData
    sharedFile.toc = [{ depth: 2, text: "Java", slug: "java" }]
    sharedFile.readingTime = { text: "1 min read" }
    sharedFile.text = "Java content"

    pageType.treeTransforms?.({} as BuildCtx)[0]?.(
      { type: "root", children: [] },
      fullSlug("java/index"),
      props,
    )

    expect(props.fileData).toBe(sharedFile)
    expect(props.fileData).toHaveProperty("toc")
    expect(props.fileData).toHaveProperty("readingTime")
    expect(props.fileData).toHaveProperty("text")
  })

  it("does not suppress an unowned virtual or higher-priority root record", () => {
    const pageType = RootIndexPanelsPage()
    const transforms = pageType.treeTransforms?.({} as BuildCtx)
    const virtualProps = componentProps("index", [])
    virtualProps.fileData = virtualFile("index")
    const higherPriorityProps = componentProps("index", [])
    expect(
      pageType.match({ slug: fullSlug("index"), fileData: virtualProps.fileData, cfg: {} }),
    ).toBe(false)

    for (const props of [virtualProps, higherPriorityProps]) {
      const sharedFile = props.fileData
      sharedFile.toc = [{ depth: 2, text: "Other owner's heading", slug: "other" }]
      sharedFile.readingTime = { text: "2 min read" }
      sharedFile.text = "Other owner content"

      // Another Page Type owns this record, so this plugin's matcher is never
      // evaluated by the priority-ordered dispatcher.
      transforms?.[0]?.({ type: "root", children: [] }, fullSlug("index"), props)

      expect(props.fileData).toBe(sharedFile)
      expect(props.fileData).toHaveProperty("toc")
      expect(props.fileData).toHaveProperty("readingTime")
      expect(props.fileData).toHaveProperty("text")
    }
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
    expect(defaults).not.toHaveProperty("icons")
    expect(schema.defaultIcon).toEqual({ type: "string" })
    expect(schema.defaultAccent).toEqual({ type: "string" })
    expect(schema).not.toHaveProperty("icons")
    expect(schema).not.toHaveProperty("accents")
    expect(manifest).not.toHaveProperty("optionSchema")
  })

  it("declares both plugin categories without component layout defaults", () => {
    const manifest = packageJson.quartz
    const component = manifest.components.RootIndexPanels

    expect(manifest.category).toEqual(expect.arrayContaining(["pageType", "component"]))
    expect(component).not.toHaveProperty("defaultPosition")
    expect(component).not.toHaveProperty("defaultPriority")
    expect(component.version).toBe(packageJson.version)
    expect(manifest.version).toBe(packageJson.version)
  })

  it("exports the component and Page Type from their intended runtime barrels", () => {
    expect(packageExports.RootIndexPanels).toBe(RootIndexPanels)
    expect(packageExports.RootIndexPanelsPage).toBe(RootIndexPanelsPage)
    expect(componentExports.RootIndexPanels).toBe(RootIndexPanels)
  })
})
