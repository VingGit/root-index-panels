import { normalizeDirectAccent, normalizeRegistryIdentifier } from "./options"
import type { RootIndexPanelsOptions } from "./types"

type AccentResolutionOptions = Pick<RootIndexPanelsOptions, "accents" | "defaultAccent">

type ResolvedPanelAccent =
  | { kind: "theme" }
  | { kind: "named"; name: string; value: string }
  | { kind: "direct"; value: string }

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

function resolveNamedAccent(value: unknown, accents: unknown): ResolvedPanelAccent | undefined {
  const name = normalizeRegistryIdentifier(value)
  if (!name || name === "theme") return undefined

  const accent = normalizeDirectAccent(ownDataValue(accents, name))
  return accent ? { kind: "named", name, value: accent } : undefined
}

function resolveDefaultAccent(value: unknown, accents: unknown): ResolvedPanelAccent {
  const name = normalizeRegistryIdentifier(value)
  if (name === "theme") return themeAccent

  const named = resolveNamedAccent(name, accents)
  if (named) return named

  const direct = normalizeDirectAccent(value)
  return direct ? { kind: "direct", value: direct } : themeAccent
}

/** Resolves a validated theme, named, or direct decorative accent for one panel. */
export function resolvePanelAccent(
  panelAccent: unknown,
  options?: AccentResolutionOptions | null,
): ResolvedPanelAccent {
  const accents = ownDataValue(options, "accents")
  const name = normalizeRegistryIdentifier(panelAccent)

  if (name === "theme") return themeAccent

  const named = resolveNamedAccent(name, accents)
  if (named) return named

  const direct = normalizeDirectAccent(panelAccent)
  if (direct) return { kind: "direct", value: direct }

  return resolveDefaultAccent(ownDataValue(options, "defaultAccent"), accents)
}
