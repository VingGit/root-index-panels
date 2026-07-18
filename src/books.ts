import type { QuartzPluginData } from "@quartz-community/types"

type PluginFile = QuartzPluginData & Record<string, unknown>

export interface BookInventoryOptions {
  descriptionFallback: string
  excludeDirs: readonly string[]
  sort: "alphabetical" | "docCount" | "date"
  tagCount: number
}

export interface BookEntry {
  segment: string
  title: string
  description: string
  docCount: number
  tags: string[]
  date: number
  panel: unknown
}

interface BookAccumulator {
  segment: string
  docCount: number
  date: number
  metadata?: PluginFile
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function ownValue(record: Record<string, unknown>, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function isPhysical(file: PluginFile): boolean {
  const filePath = ownValue(file, "filePath")
  return typeof filePath === "string" && filePath.length > 0
}

function toTimestamp(value: unknown): number | undefined {
  if (value instanceof Date) {
    const timestamp = value.getTime()
    return Number.isFinite(timestamp) ? timestamp : undefined
  }
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

function getFileTimestamp(file: PluginFile): number {
  const rawFrontmatter = ownValue(file, "frontmatter")
  const rawDates = ownValue(file, "dates")
  const frontmatter: Record<string, unknown> = isRecord(rawFrontmatter) ? rawFrontmatter : {}
  const dates: Record<string, unknown> = isRecord(rawDates) ? rawDates : {}
  const candidates = [
    ownValue(dates, "modified"),
    ownValue(dates, "created"),
    ownValue(dates, "published"),
    ownValue(file, "modified"),
    ownValue(file, "updated"),
    ownValue(file, "created"),
    ownValue(file, "date"),
    ownValue(frontmatter, "modified"),
    ownValue(frontmatter, "updated"),
    ownValue(frontmatter, "created"),
    ownValue(frontmatter, "published"),
    ownValue(frontmatter, "date"),
  ]

  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate)
    if (timestamp !== undefined) return timestamp
  }
  return Number.NEGATIVE_INFINITY
}

function humanizeSegment(segment: string): string {
  const text = segment.replace(/-/g, " ")
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1)
}

function compareTitle(a: BookEntry, b: BookEntry): number {
  return a.title.localeCompare(b.title) || a.segment.localeCompare(b.segment)
}

/**
 * Aggregate the physical book inventory in one pass over `allFiles`.
 * Virtual entries are consulted only as proof that a landing destination exists.
 */
export function collectBooks(allFiles: PluginFile[], options: BookInventoryOptions): BookEntry[] {
  const excluded = new Set(options.excludeDirs)
  const destinations = new Set<string>()
  const physicalSlugs = new Set<string>()
  const books = new Map<string, BookAccumulator>()

  for (const file of allFiles) {
    const rawSlug = ownValue(file, "slug")
    const slug = typeof rawSlug === "string" ? rawSlug : ""
    if (slug.length === 0) continue

    const parts = slug.split("/").filter(Boolean)
    if (parts.length < 2) continue

    const segment = parts[0]
    if (!segment || segment === "tags" || excluded.has(segment)) continue

    const physical = isPhysical(file)
    const listed = ownValue(file, "unlisted") !== true
    const isBookIndex = parts.length === 2 && parts[1] === "index"

    if (isBookIndex && listed) {
      // A listed physical index is explicit. A listed virtual index is the generated route.
      destinations.add(segment)
    }

    if (!physical || !listed || physicalSlugs.has(slug)) continue
    physicalSlugs.add(slug)

    let book = books.get(segment)
    if (!book) {
      book = { segment, docCount: 0, date: Number.NEGATIVE_INFINITY }
      books.set(segment, book)
    }

    if (slug !== `${segment}/index`) book.docCount += 1
    book.date = Math.max(book.date, getFileTimestamp(file))
    if (isBookIndex && !book.metadata) book.metadata = file
  }

  const entries: BookEntry[] = []
  for (const book of books.values()) {
    if (!destinations.has(book.segment)) continue

    const rawFrontmatter = book.metadata ? ownValue(book.metadata, "frontmatter") : undefined
    const frontmatter = isRecord(rawFrontmatter) ? rawFrontmatter : {}
    const rawTitle = ownValue(frontmatter, "title")
    const rawDescription = ownValue(frontmatter, "description")
    const rawTags = ownValue(frontmatter, "tags")

    entries.push({
      segment: book.segment,
      title: typeof rawTitle === "string" ? rawTitle : humanizeSegment(book.segment),
      description:
        typeof rawDescription === "string" ? rawDescription : options.descriptionFallback,
      docCount: book.docCount,
      tags: Array.isArray(rawTags)
        ? rawTags.filter((tag): tag is string => typeof tag === "string").slice(0, options.tagCount)
        : [],
      date: book.date,
      panel: ownValue(frontmatter, "panel"),
    })
  }

  if (options.sort === "docCount") {
    entries.sort((a, b) => b.docCount - a.docCount || compareTitle(a, b))
  } else if (options.sort === "date") {
    entries.sort((a, b) => b.date - a.date || compareTitle(a, b))
  } else {
    entries.sort(compareTitle)
  }

  return entries
}
