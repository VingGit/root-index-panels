import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Folder,
  House,
  TableProperties,
  Workflow,
} from "lucide-preact"
import { createElement, type JSX, type VNode } from "preact"

import {
  builtInIconNames,
  builtInLucideIcons,
  lucidePackageVersion,
  type BuiltInIconName,
} from "./built-in-icons.generated"
import { lucideIconNameFromIdentifier, normalizePanelIconIdentifier } from "./options"
import type { PanelIconComponent, RootIndexPanelsOptions } from "./types"

type LucideIconNode = ReadonlyArray<
  readonly [tag: keyof JSX.IntrinsicElements, attributes: JSX.SVGAttributes<SVGElement>]
>

type LucideComponent = typeof Folder

type LucideWrapperProps = {
  iconNode?: unknown
  icon?: unknown
}

function readLucideIconNode(icon: LucideComponent): LucideIconNode {
  const wrapper = icon({}) as VNode<LucideWrapperProps>

  if (Array.isArray(wrapper.props.iconNode)) {
    return wrapper.props.iconNode as LucideIconNode
  }

  const iconData = wrapper.props.icon
  if (
    typeof iconData === "object" &&
    iconData !== null &&
    !Array.isArray(iconData) &&
    Array.isArray((iconData as { node?: unknown }).node)
  ) {
    return (iconData as { node: LucideIconNode }).node
  }

  throw new TypeError("The lucide-preact icon-node contract changed")
}

function adaptLucideIcon(icon: LucideComponent): PanelIconComponent {
  const iconNode = readLucideIconNode(icon)

  return ({ children, ...props }) =>
    createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: 24,
        height: 24,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 2,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        ...props,
      },
      ...iconNode.map(([tag, attributes]) => createElement(tag, attributes)),
      children,
    )
}

/** Decorative glyphs used by the plugin-owned sidebar chrome. */
export const sidebarIcons = Object.freeze({
  base: adaptLucideIcon(TableProperties),
  canvas: adaptLucideIcon(Workflow),
  check: adaptLucideIcon(Check),
  chevronRight: adaptLucideIcon(ChevronRight),
  chevronsUpDown: adaptLucideIcon(ChevronsUpDown),
  folder: adaptLucideIcon(Folder),
  home: adaptLucideIcon(House),
  note: adaptLucideIcon(FileText),
})

const builtInIcons = Object.freeze(
  Object.fromEntries(
    builtInIconNames.map((name) => [name, adaptLucideIcon(builtInLucideIcons[name])]),
  ) as Record<BuiltInIconName, PanelIconComponent>,
)

const lucideStaticBaseUrl = `https://cdn.jsdelivr.net/npm/lucide-static@${lucidePackageVersion}/icons`
const remoteLucideIcons = new Map<string, PanelIconComponent>()

function safeIconDimension(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.min(512, value)
    : 24
}

function remoteLucideIcon(iconName: string): PanelIconComponent {
  const cached = remoteLucideIcons.get(iconName)
  if (cached) return cached

  const url = `${lucideStaticBaseUrl}/${iconName}.svg`
  const component: PanelIconComponent = (props) => {
    const width = safeIconDimension(props.width)
    const height = safeIconDimension(props.height)
    const mask = `url(${url})`
    return createElement("span", {
      "aria-hidden": "true",
      "data-rip-lucide-icon": iconName,
      style: [
        "display:block",
        `width:${width}px`,
        `height:${height}px`,
        "background:currentColor",
        `-webkit-mask:${mask} center/contain no-repeat`,
        `mask:${mask} center/contain no-repeat`,
        "pointer-events:none",
      ].join(";"),
    })
  }

  remoteLucideIcons.set(iconName, component)
  return component
}

type IconResolutionOptions = Pick<RootIndexPanelsOptions, "defaultIcon" | "icons">

interface ResolvedPanelIcon {
  name: string
  component: PanelIconComponent
}

function ownDataValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined

  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function resolveCustomIcon(value: unknown, name: string): PanelIconComponent | undefined {
  const component = ownDataValue(value, name)
  return typeof component === "function" ? (component as PanelIconComponent) : undefined
}

function resolveBuiltInIcon(name: string): PanelIconComponent | undefined {
  if (!Object.hasOwn(builtInIcons, name)) return undefined
  return builtInIcons[name as BuiltInIconName]
}

function resolveIconName(value: unknown, icons: unknown): ResolvedPanelIcon | undefined {
  const name = normalizePanelIconIdentifier(value)
  if (!name) return undefined

  const lucideName = lucideIconNameFromIdentifier(name)
  if (lucideName) return { name, component: remoteLucideIcon(lucideName) }

  const component = resolveCustomIcon(icons, name) ?? resolveBuiltInIcon(name)
  return component ? { name, component } : undefined
}

/** Resolves a safe custom, built-in, or direct Lucide decorative icon for one panel. */
export function resolvePanelIcon(
  panelIcon: unknown,
  options?: IconResolutionOptions | null,
): ResolvedPanelIcon | undefined {
  const icons = ownDataValue(options, "icons")
  return (
    resolveIconName(panelIcon, icons) ??
    resolveIconName(ownDataValue(options, "defaultIcon"), icons)
  )
}
