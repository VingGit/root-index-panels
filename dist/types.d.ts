import { ComponentType, JSX } from 'preact';
export { BuildCtx, CSSResource, ChangeEvent, JSResource, PageGenerator, PageMatcher, ProcessedContent, QuartzEmitterPlugin, QuartzEmitterPluginInstance, QuartzFilterPlugin, QuartzFilterPluginInstance, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzPluginData, QuartzTransformerPlugin, QuartzTransformerPluginInstance, StaticResources, VirtualPage } from '@quartz-community/types';

type PanelIconComponent = ComponentType<JSX.SVGAttributes<SVGSVGElement>>;
interface RootIndexPanelsOptions {
    /** Panel presentation. Default: `cards`. */
    layout?: "cards" | "list";
    /** Show the selected book-index description. Default: `true`. */
    showDescription?: boolean;
    /** Show the listed physical descendant count. Default: `true`. */
    showDocCount?: boolean;
    /** Show selected book-index tags in card layout. Default: `true`. */
    showTags?: boolean;
    /** Maximum tags per card. Default: `3`. */
    tagCount?: number;
    /** Book ordering. Default: `alphabetical`. */
    sort?: "alphabetical" | "docCount" | "date";
    /** Case-sensitive first-segment names to omit. Default: `[]`. */
    excludeDirs?: string[];
    /** Description used when the selected book index has none. Default: `""`. */
    descriptionFallback?: string;
    /** Built-in or custom icon alias used when a book does not resolve one. */
    defaultIcon?: string;
    /** TypeScript-only custom SVG icon aliases. */
    icons?: Record<string, PanelIconComponent>;
    /** Theme, named, or direct accent used when a book does not resolve one. */
    defaultAccent?: string;
    /** YAML-safe named accent registry. */
    accents?: Record<string, string>;
    /** Replace only the stock Explorer beside RootIndexSidebar. Default: `true`. */
    replaceExplorer?: boolean;
}
type RootIndexPanelsPageOptions = RootIndexPanelsOptions;
type RootIndexSidebarOptions = RootIndexPanelsOptions;

export type { PanelIconComponent, RootIndexPanelsOptions, RootIndexPanelsPageOptions, RootIndexSidebarOptions };
