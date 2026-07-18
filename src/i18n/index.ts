import { enUS } from "./locales/en-US"
import { fiFI } from "./locales/fi-FI"
import type { RootIndexPanelsTranslation } from "./types"

const catalogs: Record<string, RootIndexPanelsTranslation> = {
  "en-US": enUS,
  "fi-FI": fiFI,
}

/** Selects a plugin-owned catalog for one render, with English as the fallback. */
export function i18n(locale: unknown): RootIndexPanelsTranslation {
  return typeof locale === "string" && Object.hasOwn(catalogs, locale) ? catalogs[locale]! : enUS
}

export type { RootIndexPanelsTranslation } from "./types"
