// Main plugin export
export { default as RootIndexPanels } from "./components/RootIndexPanels";
export type { RootIndexPanelsOptions } from "./components/RootIndexPanels";

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
} from "@quartz-community/types";

// Template examples kept for reference — not part of the plugin's public API
export { ExampleTransformer } from "./transformer";
export { ExampleFilter } from "./filter";
export { ExampleEmitter } from "./emitter";
export { default as ExampleComponent } from "./components/ExampleComponent";

export type {
  ExampleTransformerOptions,
  ExampleFilterOptions,
  ExampleEmitterOptions,
} from "./types";

export type { ExampleComponentOptions } from "./components/ExampleComponent";
