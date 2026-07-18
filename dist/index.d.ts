export { RootIndexPanels, RootIndexSidebar } from './components/index.js';
import { QuartzPageTypePlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';
import { RootIndexPanelsPageOptions } from './types.js';
export { PanelIconComponent, RootIndexPanelsOptions, RootIndexSidebarOptions } from './types.js';
import 'preact';

declare const RootIndexPanelsPage: QuartzPageTypePlugin<RootIndexPanelsPageOptions>;

export { RootIndexPanelsPage, RootIndexPanelsPageOptions };
