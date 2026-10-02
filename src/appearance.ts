import { normalizeDirectAccent } from "./options"
import type { RootIndexPanelsOptions } from "./types"

type AccentResolutionOptions = Pick<RootIndexPanelsOptions, "defaultAccent">

type ResolvedPanelAccent = { kind: "theme" } | { kind: "direct"; value: string }

const themeAccent = Object.freeze({ kind: "theme" as const })

function ownDataValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined

  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function resolveDefaultAccent(value: unknown): ResolvedPanelAccent {
  if (value === "theme") return themeAccent
  const direct = normalizeDirectAccent(value)
  return direct ? { kind: "direct", value: direct } : themeAccent
}

/** Resolves a validated direct-hex decorative accent for one panel. */
export function resolvePanelAccent(
  panelAccent: unknown,
  options?: AccentResolutionOptions | null,
): ResolvedPanelAccent {
  const direct = normalizeDirectAccent(panelAccent)
  if (direct) return { kind: "direct", value: direct }
  return resolveDefaultAccent(ownDataValue(options, "defaultAccent"))
}
