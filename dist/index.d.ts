import { RootIndexPanelsOptions } from './components/index.js';
export { RootIndexPanels } from './components/index.js';
import { QuartzPageTypePlugin } from '@quartz-community/types';
export { PageGenerator, PageMatcher, QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, QuartzEmitterPlugin, QuartzFilterPlugin, QuartzPageTypePlugin, QuartzPageTypePluginInstance, QuartzTransformerPlugin, StringResource, VirtualPage } from '@quartz-community/types';

type RootIndexPanelsPageOptions = RootIndexPanelsOptions;
declare const RootIndexPanelsPage: QuartzPageTypePlugin<RootIndexPanelsPageOptions>;

export { RootIndexPanelsOptions, RootIndexPanelsPage, type RootIndexPanelsPageOptions };
