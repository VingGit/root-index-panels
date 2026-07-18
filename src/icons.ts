import {
  BookOpen,
  CodeXml,
  Coffee,
  Container,
  Cpu,
  Database,
  FileCode,
  GitBranch,
  Globe,
  Layers,
  Network,
  Shield,
  Terminal,
} from "lucide-preact"
import { createElement, type JSX, type VNode } from "preact"

import { normalizeRegistryIdentifier } from "./options"
import type { PanelIconComponent, RootIndexPanelsOptions } from "./types"

type BuiltInIconName =
  | "book-open"
  | "coffee"
  | "terminal"
  | "container"
  | "layers"
  | "code-2"
  | "network"
  | "git-branch"
  | "database"
  | "shield"
  | "cpu"
  | "globe"
  | "file-code-2"

type LucideIconNode = ReadonlyArray<
  readonly [tag: keyof JSX.IntrinsicElements, attributes: JSX.SVGAttributes<SVGElement>]
>

function readLucideIconNode(icon: typeof BookOpen): LucideIconNode {
  // lucide-preact's generated icon wrapper is hook-free: invoking it only
  // returns a VNode whose props contain the pinned icon-node definition. We
  // deliberately do not render its internal Icon component, which consumes a
  // Lucide context hook and can bind to a development worktree's second Preact.
  const wrapper = icon({}) as VNode<{ iconNode?: unknown }>
  if (!Array.isArray(wrapper.props.iconNode)) {
    throw new TypeError("The pinned lucide-preact icon-node contract changed")
  }
  return wrapper.props.iconNode as LucideIconNode
}

function adaptLucideIcon(icon: typeof BookOpen): PanelIconComponent {
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

const builtInIcons = {
  "book-open": adaptLucideIcon(BookOpen),
  coffee: adaptLucideIcon(Coffee),
  terminal: adaptLucideIcon(Terminal),
  container: adaptLucideIcon(Container),
  layers: adaptLucideIcon(Layers),
  "code-2": adaptLucideIcon(CodeXml),
  network: adaptLucideIcon(Network),
  "git-branch": adaptLucideIcon(GitBranch),
  database: adaptLucideIcon(Database),
  shield: adaptLucideIcon(Shield),
  cpu: adaptLucideIcon(Cpu),
  globe: adaptLucideIcon(Globe),
  "file-code-2": adaptLucideIcon(FileCode),
} satisfies Record<BuiltInIconName, PanelIconComponent>

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
  const name = normalizeRegistryIdentifier(value)
  if (!name) return undefined

  const component = resolveCustomIcon(icons, name) ?? resolveBuiltInIcon(name)
  return component ? { name, component } : undefined
}

/** Resolves a safe custom or built-in decorative icon for one panel. */
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
