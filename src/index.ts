export { default as RootIndexPanels } from "./components/RootIndexPanels"
export type { RootIndexPanelsOptions } from "./components/RootIndexPanels"
export { RootIndexPanelsPage } from "./pageType"
export type { RootIndexPanelsPageOptions } from "./pageType"

// Re-export shared types for consumer convenience
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
  QuartzTransformerPlugin,
  QuartzFilterPlugin,
  QuartzEmitterPlugin,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
  PageMatcher,
  PageGenerator,
  VirtualPage,
} from "@quartz-community/types"
