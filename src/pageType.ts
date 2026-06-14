import type { QuartzPageTypePlugin } from "@quartz-community/types"
import RootIndexPanels, { type RootIndexPanelsOptions } from "./components/RootIndexPanels"

export type RootIndexPanelsPageOptions = RootIndexPanelsOptions

export const RootIndexPanelsPage: QuartzPageTypePlugin<RootIndexPanelsPageOptions> = (
  userOptions,
) => ({
  name: "RootIndexPanelsPage",
  priority: 100,
  match: ({ slug }) => slug === "index",
  layout: "content",
  body: () => RootIndexPanels(userOptions),
})
