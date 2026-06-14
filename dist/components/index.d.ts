import { QuartzComponent } from '@quartz-community/types';

interface RootIndexPanelsOptions {
    /** "cards" (default) or "list" */
    layout?: "cards" | "list";
    /** Show description from frontmatter. Default: true */
    showDescription?: boolean;
    /** Show note-count badge. Default: true */
    showDocCount?: boolean;
    /** Show tags from frontmatter (cards only). Default: true */
    showTags?: boolean;
    /** Max tags per card. Default: 3 */
    tagCount?: number;
    /** Sort order. Default: "alphabetical" */
    sort?: "alphabetical" | "docCount" | "date";
    /** Directory names (first path segment) to exclude. Default: [] */
    excludeDirs?: string[];
    /** Fallback description when frontmatter has none. Default: "" */
    descriptionFallback?: string;
}
declare const _default: (userOpts?: RootIndexPanelsOptions) => QuartzComponent;

export { _default as RootIndexPanels, type RootIndexPanelsOptions };
