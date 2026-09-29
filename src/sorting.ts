export const NAVIGATION_SORTING_SERVICE_SYMBOL =
  "@vinggit/custom-file-explorer-sorting-support/service/v1"

export interface NavigationSortInput<T> {
  value: T
  path: string
  isFolder: boolean
}

interface NavigationSortResult<T> {
  matched: boolean
  items: T[]
}

export interface NavigationSortingService {
  readonly apiVersion: 1
  sort<T>(
    folderPath: string,
    items: readonly NavigationSortInput<T>[],
    allFiles: unknown,
  ): NavigationSortResult<T>
}

/** Resolve the optional service at use time so plugin load order does not matter. */
export function getNavigationSortingService(): NavigationSortingService | undefined {
  try {
    const candidate = (globalThis as unknown as Record<symbol, unknown>)[
      Symbol.for(NAVIGATION_SORTING_SERVICE_SYMBOL)
    ]
    if (typeof candidate !== "object" || candidate === null) return undefined
    const service = candidate as Partial<NavigationSortingService>
    return service.apiVersion === 1 && typeof service.sort === "function"
      ? (service as NavigationSortingService)
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Ask a compatible sorting plugin for an order. Invalid or foreign results
 * are ignored so this plugin keeps its standalone behavior.
 */
export function sortWithNavigationService<T>(
  folderPath: string,
  items: readonly NavigationSortInput<T>[],
  allFiles: unknown,
): T[] | undefined {
  const service = getNavigationSortingService()
  if (!service) return undefined

  try {
    const result = service.sort(folderPath, items, allFiles)
    if (!result?.matched || !Array.isArray(result.items)) return undefined

    const available = new Set(items.map((item) => item.value))
    const seen = new Set<T>()
    for (const item of result.items) {
      if (!available.has(item) || seen.has(item)) return undefined
      seen.add(item)
    }
    return result.items
  } catch {
    return undefined
  }
}
