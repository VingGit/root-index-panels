const lucideIconSpecifierPattern = /^lucide:([a-z0-9]+(?:-[a-z0-9]+)*)$/
const hexAccentPattern = /^#[0-9a-fA-F]{6}$/

export interface NormalizedRootIndexPanelsOptions {
  layout: "cards" | "list"
  showDescription: boolean
  showDocCount: boolean
  showTags: boolean
  tagCount: number
  sort: "alphabetical" | "docCount" | "date"
  descriptionFallback: string
  defaultIcon: string
  defaultAccent: string
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

export function normalizePanelIconIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return lucideIconSpecifierPattern.test(normalized) ? normalized : undefined
}

export function lucideIconNameFromIdentifier(value: string): string | undefined {
  return lucideIconSpecifierPattern.exec(value)?.[1]
}

export function isDirectAccent(value: string): boolean {
  return hexAccentPattern.test(value)
}

export function normalizeDirectAccent(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined
  const normalized = value.trim()
  return isDirectAccent(normalized) ? normalized.toLowerCase() : undefined
}

function normalizeDefaultAccent(value: unknown): string {
  if (typeof value !== "string") return "theme"

  const normalized = value.trim()
  if (normalized === "theme") return normalized
  return normalizeDirectAccent(normalized) ?? "theme"
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
    normalizePanelIconIdentifier(ownDataValue(options, "defaultIcon")) ?? "lucide:book-open"
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
    descriptionFallback: typeof descriptionFallback === "string" ? descriptionFallback : "",
    defaultIcon,
    defaultAccent: normalizeDefaultAccent(ownDataValue(options, "defaultAccent")),
    replaceExplorer: typeof replaceExplorer === "boolean" ? replaceExplorer : true,
  }
}
