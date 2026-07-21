import type { ComponentType, JSX } from "preact"

export type PanelIconComponent = ComponentType<JSX.SVGAttributes<SVGSVGElement>>

export interface RootIndexPanelsOptions {
  /** Panel presentation. Default: `cards`. */
  layout?: "cards" | "list"
  /** Show the selected book-index description. Default: `true`. */
  showDescription?: boolean
  /** Show the listed physical descendant count. Default: `true`. */
  showDocCount?: boolean
  /** Show selected book-index tags in card layout. Default: `true`. */
  showTags?: boolean
  /** Maximum tags per card. Default: `3`. */
  tagCount?: number
  /** Book ordering. Default: `alphabetical`. */
  sort?: "alphabetical" | "docCount" | "date"
  /** Case-sensitive first-segment names to omit. Default: `[]`. */
  excludeDirs?: string[]
  /** Description used when the selected book index has none. Default: `""`. */
  descriptionFallback?: string
  /** Built-in or custom icon alias used when a book does not resolve one. Default: `book-open`. */
  defaultIcon?: string
  /** TypeScript-only custom SVG icon aliases. */
  icons?: Record<string, PanelIconComponent>
  /** Theme, named, or direct accent used when a book does not resolve one. */
  defaultAccent?: string
  /** YAML-safe named accent registry. */
  accents?: Record<string, string>
  /** Replace only the stock Explorer beside RootIndexSidebar. Default: `true`. */
  replaceExplorer?: boolean
}

export type RootIndexPanelsPageOptions = RootIndexPanelsOptions
export type RootIndexSidebarOptions = RootIndexPanelsOptions

export type {
  BuildCtx,
  ChangeEvent,
  CSSResource,
  JSResource,
  ProcessedContent,
  QuartzEmitterPlugin,
  QuartzEmitterPluginInstance,
  QuartzFilterPlugin,
  QuartzFilterPluginInstance,
  QuartzPluginData,
  QuartzTransformerPlugin,
  QuartzTransformerPluginInstance,
  StaticResources,
  PageMatcher,
  PageGenerator,
  VirtualPage,
  QuartzPageTypePlugin,
  QuartzPageTypePluginInstance,
} from "@quartz-community/types"
