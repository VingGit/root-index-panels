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

// ── Template example types (kept for CI compatibility) ──────────────────

export interface ExampleTransformerOptions {
  /** Token used to highlight text, defaults to ==highlight== */
  highlightToken: string
  /** Add a CSS class to all headings in the rendered HTML. */
  headingClass: string
  /** Enable remark-gfm for tables/task lists. */
  enableGfm: boolean
  /** Enable adding slug IDs to headings. */
  addHeadingSlugs: boolean
}

export interface ExampleFilterOptions {
  /** Allow pages marked draft: true to publish. */
  allowDrafts: boolean
  /** Exclude pages that contain any of these frontmatter tags. */
  excludeTags: string[]
  /** Exclude paths that start with any of these prefixes (relative to content root). */
  excludePathPrefixes: string[]
}

export interface ExampleEmitterOptions {
  /** Filename to emit at the site root. */
  manifestSlug: string
  /** Whether to include the frontmatter block in the manifest. */
  includeFrontmatter: boolean
  /** Extra metadata to write at the top level of the manifest. */
  metadata: Record<string, unknown>
  /** Optional hook to transform the emitted manifest JSON string. */
  transformManifest?: (json: string) => string
  /** Add a custom class to the emitted manifest <script> tag if used in HTML. */
  manifestScriptClass?: string
}

// ── Plugin types ────────────────────────────────────────────────────────

/** Options for the RootIndexPanels component. All fields are optional. */
export interface RootIndexPanelsOptions {
  /** Visual presentation. Default: "cards" */
  layout?: "cards" | "list"
  /** Show description from frontmatter. Default: true */
  showDescription?: boolean
  /** Show a note-count badge on each card. Default: true */
  showDocCount?: boolean
  /** Show tags from frontmatter (cards layout only). Default: true */
  showTags?: boolean
  /** Maximum tags to show per card. Default: 3 */
  tagCount?: number
  /** Sort order for the directory grid. Default: "alphabetical" */
  sort?: "alphabetical" | "docCount" | "date"
  /** First-path-segment names to omit from the grid. Default: [] */
  excludeDirs?: string[]
  /** Fallback text when a directory has no description in frontmatter. Default: "" */
  descriptionFallback?: string
}
