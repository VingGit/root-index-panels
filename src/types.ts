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
} from "@quartz-community/types";

// ── Template example types (kept for CI compatibility) ──────────────────

export interface ExampleTransformerOptions {
  highlightToken: string;
  headingClass: string;
  enableGfm: boolean;
  addHeadingSlugs: boolean;
}

export interface ExampleFilterOptions {
  allowDrafts: boolean;
  excludeTags: string[];
  excludePathPrefixes: string[];
}

export interface ExampleEmitterOptions {
  manifestSlug: string;
  includeFrontmatter: boolean;
  metadata: Record<string, unknown>;
  transformManifest?: (json: string) => string;
  manifestScriptClass?: string;
}

// ── Plugin types ────────────────────────────────────────────────────────

/** Options for the RootIndexPanels component. All fields are optional. */
export interface RootIndexPanelsOptions {
  /** Visual presentation. Default: "cards" */
  layout?: "cards" | "list";
  /** Show description from frontmatter. Default: true */
  showDescription?: boolean;
  /** Show a note-count badge on each card. Default: true */
  showDocCount?: boolean;
  /** Show tags from frontmatter (cards layout only). Default: true */
  showTags?: boolean;
  /** Maximum tags to show per card. Default: 3 */
  tagCount?: number;
  /** Sort order for the directory grid. Default: "alphabetical" */
  sort?: "alphabetical" | "docCount" | "date";
  /** First-path-segment names to omit from the grid. Default: [] */
  excludeDirs?: string[];
  /** Fallback text when a directory has no description in frontmatter. Default: "" */
  descriptionFallback?: string;
}
