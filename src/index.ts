export { default as RootIndexPanels } from "./components/RootIndexPanels"
export { default as RootIndexSidebar } from "./components/RootIndexSidebar"
export { RootIndexPanelsPage } from "./pageType"
export type {
  PanelIconComponent,
  RootIndexPanelsOptions,
  RootIndexPanelsPageOptions,
  RootIndexSidebarOptions,
} from "./types"

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
