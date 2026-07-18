import type {
  PanelIconComponent as ComponentPanelIcon,
  RootIndexPanelsOptions as ComponentOptions,
} from "../src/components"
import type {
  PanelIconComponent as PackagePanelIcon,
  RootIndexPanelsOptions as PackageOptions,
  RootIndexPanelsPageOptions as PackagePageOptions,
} from "../src/index"
import type {
  PanelIconComponent as TypesPanelIcon,
  RootIndexPanelsOptions as TypesOptions,
  RootIndexPanelsPageOptions as TypesPageOptions,
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
} satisfies PackageOptions

const componentOptions: ComponentOptions = options
const typesOptions: TypesOptions = options
const packagePageOptions: PackagePageOptions = options
const typesPageOptions: TypesPageOptions = options

export {
  componentIcon,
  componentOptions,
  Icon,
  options,
  packagePageOptions,
  typesIcon,
  typesOptions,
  typesPageOptions,
}
