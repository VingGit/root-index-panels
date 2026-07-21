import type { PanelIconComponent } from "./types"

const registryIdentifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const hexAccentPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const customPropertyAccentPattern = /^var\(--[A-Za-z_][A-Za-z0-9_-]*\)$/

export interface NormalizedRootIndexPanelsOptions {
  layout: "cards" | "list"
  showDescription: boolean
  showDocCount: boolean
  showTags: boolean
  tagCount: number
  sort: "alphabetical" | "docCount" | "date"
  excludeDirs: string[]
  descriptionFallback: string
  defaultIcon: string
  icons: Record<string, PanelIconComponent>
  defaultAccent: string
  accents: Record<string, string>
  replaceExplorer: boolean
}

function isObjectRecord(value: unknown): value is Record<PropertyKey, unknown> {
  try {
    return typeof value === "object" && value !== null && !Array.isArray(value)
  } catch {
    return false
  }
}

function ownDataValue(value: unknown, key: string): unknown {
  if (!isObjectRecord(value)) return undefined

  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function ownDataEntries(value: unknown): Array<[string, unknown]> {
  if (!isObjectRecord(value)) return []

  try {
    const entries: Array<[string, unknown]> = []
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)
      if (descriptor && "value" in descriptor) entries.push([key, descriptor.value])
    }
    return entries
  } catch {
    return []
  }
}

export function isRegistryIdentifier(value: string): boolean {
  return registryIdentifierPattern.test(value)
}

export function normalizeRegistryIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return isRegistryIdentifier(normalized) ? normalized : undefined
}

export function isDirectAccent(value: string): boolean {
  return hexAccentPattern.test(value) || customPropertyAccentPattern.test(value)
}

export function normalizeDirectAccent(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return isDirectAccent(normalized) ? normalized : undefined
}

function normalizeIconRegistry(value: unknown): Record<string, PanelIconComponent> {
  const icons = Object.create(null) as Record<string, PanelIconComponent>

  for (const [rawName, component] of ownDataEntries(value)) {
    const name = normalizeRegistryIdentifier(rawName)
    if (!name || typeof component !== "function" || Object.hasOwn(icons, name)) continue
    icons[name] = component as PanelIconComponent
  }

  return icons
}

function normalizeAccentRegistry(value: unknown): Record<string, string> {
  const accents = Object.create(null) as Record<string, string>

  for (const [rawName, rawAccent] of ownDataEntries(value)) {
    const name = normalizeRegistryIdentifier(rawName)
    const accent = normalizeDirectAccent(rawAccent)
    if (!name || name === "theme" || !accent || Object.hasOwn(accents, name)) continue
    accents[name] = accent
  }

  return accents
}

function normalizeDefaultAccent(value: unknown, accents: Record<string, string>): string {
  if (typeof value !== "string") return "theme"

  const normalized = value.trim()
  if (normalized === "theme") return normalized

  const name = normalizeRegistryIdentifier(normalized)
  if (name && Object.hasOwn(accents, name)) return name

  return normalizeDirectAccent(normalized) ?? "theme"
}

function normalizeExcludeDirs(value: unknown): string[] {
  const directories: string[] = []
  try {
    if (!Array.isArray(value)) return directories
    const seen = new Set<string>()
    for (let index = 0; index < value.length; index += 1) {
      let item: unknown
      try {
        item = value[index]
      } catch {
        continue
      }
      if (typeof item !== "string") continue
      const directory = item.trim()
      if (directory.length === 0 || seen.has(directory)) continue
      seen.add(directory)
      directories.push(directory)
    }
  } catch {
    return directories
  }
  return directories
}

/**
 * Defensively normalizes the runtime plugin boundary. Quartz discovery metadata
 * describes configuration but does not validate values passed from TypeScript.
 */
export function normalizeRootIndexPanelsOptions(
  options: unknown = undefined,
): NormalizedRootIndexPanelsOptions {
  const layout = ownDataValue(options, "layout")
  const sort = ownDataValue(options, "sort")
  const tagCount = ownDataValue(options, "tagCount")
  const descriptionFallback = ownDataValue(options, "descriptionFallback")
  const showDescription = ownDataValue(options, "showDescription")
  const showDocCount = ownDataValue(options, "showDocCount")
  const showTags = ownDataValue(options, "showTags")
  const defaultIcon =
    normalizeRegistryIdentifier(ownDataValue(options, "defaultIcon")) ?? "book-open"
  const icons = normalizeIconRegistry(ownDataValue(options, "icons"))
  const accents = normalizeAccentRegistry(ownDataValue(options, "accents"))
  const replaceExplorer = ownDataValue(options, "replaceExplorer")

  return {
    layout: layout === "list" || layout === "cards" ? layout : "cards",
    showDescription: typeof showDescription === "boolean" ? showDescription : true,
    showDocCount: typeof showDocCount === "boolean" ? showDocCount : true,
    showTags: typeof showTags === "boolean" ? showTags : true,
    tagCount:
      typeof tagCount === "number" && Number.isFinite(tagCount)
        ? Math.max(0, Math.floor(tagCount))
        : 3,
    sort: sort === "alphabetical" || sort === "docCount" || sort === "date" ? sort : "alphabetical",
    excludeDirs: normalizeExcludeDirs(ownDataValue(options, "excludeDirs")),
    descriptionFallback: typeof descriptionFallback === "string" ? descriptionFallback : "",
    defaultIcon,
    icons,
    defaultAccent: normalizeDefaultAccent(ownDataValue(options, "defaultAccent"), accents),
    accents,
    replaceExplorer: typeof replaceExplorer === "boolean" ? replaceExplorer : true,
  }
}
