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
  return {
    name: "RootIndexPanelsPage",
    priority: 100,
    match: ({ slug, fileData }) => {
      return slug === "index" && isPhysicalRoot(fileData)
    },
    layout: "content",
    body: () => RootIndexPanels(userOptions),
  }
}

export type { RootIndexPanelsPageOptions } from "./types"
