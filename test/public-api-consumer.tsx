import type {
  PanelIconComponent as ComponentPanelIcon,
  RootIndexPanelsOptions as ComponentOptions,
  RootIndexSidebarOptions as ComponentSidebarOptions,
} from "../src/components"
import type {
  PanelIconComponent as PackagePanelIcon,
  RootIndexPanelsOptions as PackageOptions,
  RootIndexPanelsPageOptions as PackagePageOptions,
  RootIndexSidebarOptions as PackageSidebarOptions,
} from "../src/index"
import type {
  PanelIconComponent as TypesPanelIcon,
  RootIndexPanelsOptions as TypesOptions,
  RootIndexPanelsPageOptions as TypesPageOptions,
  RootIndexSidebarOptions as TypesSidebarOptions,
} from "../src/types"

const Icon: PackagePanelIcon = (props) => <svg {...props} data-consumer-icon="true" />
const componentIcon: ComponentPanelIcon = Icon
const typesIcon: TypesPanelIcon = Icon

const options = {
  layout: "cards",
  showDescription: true,
  showDocCount: true,
  showTags: true,
  tagCount: 3,
  sort: "alphabetical",
  excludeDirs: ["archive"],
  descriptionFallback: "No description",
  defaultIcon: "custom",
  icons: { custom: Icon },
  defaultAccent: "brand",
  accents: { brand: "var(--brand)" },
  replaceExplorer: true,
} satisfies PackageOptions

const componentOptions: ComponentOptions = options
const typesOptions: TypesOptions = options
const packagePageOptions: PackagePageOptions = options
const typesPageOptions: TypesPageOptions = options
const componentSidebarOptions: ComponentSidebarOptions = options
const packageSidebarOptions: PackageSidebarOptions = options
const typesSidebarOptions: TypesSidebarOptions = options

export {
  componentIcon,
  componentOptions,
  componentSidebarOptions,
  Icon,
  options,
  packagePageOptions,
  packageSidebarOptions,
  typesIcon,
  typesOptions,
  typesPageOptions,
  typesSidebarOptions,
}
