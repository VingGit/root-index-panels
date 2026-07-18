import type { FullSlug } from "@quartz-community/types"
import { isFullSlug } from "@quartz-community/utils/path"

export interface ParsedCanonicalSlug {
  slug: FullSlug
  parts: string[]
}

/** Accept only canonical Quartz slugs: no empty, dot, parent, or backslash segments. */
export function parseCanonicalSlug(value: unknown): ParsedCanonicalSlug | undefined {
  if (typeof value !== "string" || !isFullSlug(value) || value.includes("\\")) return undefined

  const parts = value.split("/")
  if (
    parts.length === 0 ||
    parts.some((part) => part.length === 0 || part === "." || part === "..")
  ) {
    return undefined
  }

  return { slug: value, parts }
}
