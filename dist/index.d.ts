export { RootIndexPanels, RootIndexSidebar } from './components/index.js';
import { QuartzPageTypePlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
import { RootIndexPanelsPageOptions } from './types.js';
export { PanelIconComponent, RootIndexPanelsOptions, RootIndexSidebarOptions } from './types.js';
import 'preact';

declare const RootIndexPanelsPage: QuartzPageTypePlugin<RootIndexPanelsPageOptions>;

declare const NAVIGATION_SORTING_SERVICE_SYMBOL = "@vinggit/custom-file-explorer-sorting-support/service/v1";
interface NavigationSortInput<T> {
    value: T;
    path: string;
    isFolder: boolean;
}
interface NavigationSortResult<T> {
    matched: boolean;
    items: T[];
}
interface NavigationSortingService {
    readonly apiVersion: 1;
    sort<T>(folderPath: string, items: readonly NavigationSortInput<T>[], allFiles: unknown): NavigationSortResult<T>;
}
/** Resolve the optional service at use time so plugin load order does not matter. */
declare function getNavigationSortingService(): NavigationSortingService | undefined;
/**
 * Ask a compatible sorting plugin for an order. Invalid or foreign results
 * are ignored so this plugin keeps its standalone behavior.
 */
declare function sortWithNavigationService<T>(folderPath: string, items: readonly NavigationSortInput<T>[], allFiles: unknown): T[] | undefined;

export { NAVIGATION_SORTING_SERVICE_SYMBOL, type NavigationSortInput, type NavigationSortingService, RootIndexPanelsPage, RootIndexPanelsPageOptions, getNavigationSortingService, sortWithNavigationService };
