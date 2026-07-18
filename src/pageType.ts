import type { QuartzPageTypePlugin } from "@quartz-community/types"
import RootIndexPanels from "./components/RootIndexPanels"
import type { RootIndexPanelsPageOptions } from "./types"

function isPhysicalRoot(fileData: object): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(fileData, "filePath")
    return (
      descriptor !== undefined &&
      "value" in descriptor &&
      typeof descriptor.value === "string" &&
      descriptor.value.length > 0
    )
  } catch {
    return false
  }
}

export const RootIndexPanelsPage: QuartzPageTypePlugin<RootIndexPanelsPageOptions> = (
  userOptions,
) => {
  const ownedRootFiles = new WeakSet<object>()

  return {
    name: "RootIndexPanelsPage",
    priority: 100,
    match: ({ slug, fileData }) => {
      const ownsRoot = slug === "index" && isPhysicalRoot(fileData)
      if (ownsRoot) ownedRootFiles.add(fileData)
      return ownsRoot
    },
    layout: "content",
    body: () => RootIndexPanels(userOptions),
    treeTransforms: () => [
      (_root, slug, componentData) => {
        if (slug !== "index" || !ownedRootFiles.has(componentData.fileData)) return

        const renderFileData = { ...componentData.fileData }
        delete renderFileData.toc
        delete renderFileData.readingTime
        delete renderFileData.text
        componentData.fileData = renderFileData
      },
    ],
  }
}

export type { RootIndexPanelsPageOptions } from "./types"
