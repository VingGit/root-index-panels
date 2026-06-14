import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types"
// @ts-expect-error — .inline.ts files are processed by the tsup inline-script-loader
import script from "./scripts/panels.inline.ts"
import style from "./styles/panels.scss"

// ── Options ───────────────────────────────────────────────────────────────────────

export interface RootIndexPanelsOptions {
  /** "cards" (default) or "list" */
  layout?: "cards" | "list"
  /** Show description from frontmatter. Default: true */
  showDescription?: boolean
  /** Show note-count badge. Default: true */
  showDocCount?: boolean
  /** Show tags from frontmatter (cards only). Default: true */
  showTags?: boolean
  /** Max tags per card. Default: 3 */
  tagCount?: number
  /** Sort order. Default: "alphabetical" */
  sort?: "alphabetical" | "docCount" | "date"
  /** Directory names (first path segment) to exclude. Default: [] */
  excludeDirs?: string[]
  /** Fallback description when frontmatter has none. Default: "" */
  descriptionFallback?: string
}

// ── Internal types ───────────────────────────────────────────────────────────────────

interface DirEntry {
  seg: string
  title: string
  description: string
  docCount: number
  tags: string[]
  date: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────────────

/**
 * Returns the relative path from the current page back to the site root.
 * For the root index ("index"), this is ".".
 */
function relativeBase(slug: string): string {
  const parts = slug.split("/").filter(Boolean)
  if (parts[parts.length - 1] === "index") parts.pop()
  return parts.length === 0 ? "." : parts.map(() => "..").join("/")
}

function toTimestamp(value: unknown): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function getFileTimestamp(file: QuartzComponentProps["fileData"]): number {
  const data = file as Record<string, unknown>
  const frontmatter = (file.frontmatter ?? {}) as Record<string, unknown>
  const dates = (data["dates"] ?? {}) as Record<string, unknown>

  const candidates = [
    dates["modified"],
    dates["created"],
    dates["published"],
    data["modified"],
    data["updated"],
    data["created"],
    data["date"],
    frontmatter["modified"],
    frontmatter["updated"],
    frontmatter["created"],
    frontmatter["published"],
    frontmatter["date"],
  ]

  for (const candidate of candidates) {
    const timestamp = toTimestamp(candidate)
    if (timestamp > 0) return timestamp
  }
  return 0
}

function noteCountLabel(count: number): string {
  return `${count} ${count === 1 ? "note" : "notes"}`
}

// ── Component ──────────────────────────────────────────────────────────────────────────

export default ((userOpts?: RootIndexPanelsOptions) => {
  const opts: Required<RootIndexPanelsOptions> = {
    layout: "cards",
    showDescription: true,
    showDocCount: true,
    showTags: true,
    tagCount: 3,
    sort: "alphabetical",
    excludeDirs: [],
    descriptionFallback: "",
    ...userOpts,
  }

  const RootIndexPanels: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const slug = String(fileData.slug ?? "")

    // Only render on the vault's root index page
    if (slug !== "index") return <></>

    // ── Collect first-level directory slugs ────────────────────────────────────────
    const seenDirs = new Set<string>()
    for (const f of allFiles) {
      const s = String(f.slug ?? "")
      const parts = s.split("/").filter(Boolean)
      if (parts.length < 2) continue

      const head = parts[0]
      if (head && head !== "index" && !opts.excludeDirs.includes(head)) {
        seenDirs.add(head)
      }
    }

    // ── Build a DirEntry for each directory ────────────────────────────────────────
    const entries: DirEntry[] = []

    for (const seg of seenDirs) {
      // Prefer <seg>/index.md for metadata; fall back to any file at <seg>
      const indexFile = allFiles.find((f) => {
        const s = String(f.slug ?? "")
        return s === `${seg}/index` || s === seg
      })

      const directoryFiles = allFiles.filter((f) => {
        const s = String(f.slug ?? "")
        return s === seg || s.startsWith(`${seg}/`)
      })

      // Count notes inside the directory, excluding the index itself
      const docCount = directoryFiles.filter((f) => {
        const s = String(f.slug ?? "")
        return s.startsWith(`${seg}/`) && s !== `${seg}/index`
      }).length

      const fm = (indexFile?.frontmatter ?? {}) as Record<string, unknown>

      const rawTitle = typeof fm["title"] === "string" ? fm["title"] : seg
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).replace(/-/g, " ")

      const rawTags = fm["tags"]
      const tags = Array.isArray(rawTags)
        ? rawTags.filter((t): t is string => typeof t === "string").slice(0, opts.tagCount)
        : []

      const description =
        typeof fm["description"] === "string" ? fm["description"] : opts.descriptionFallback

      const date = Math.max(...directoryFiles.map(getFileTimestamp), 0)

      entries.push({ seg, title, description, docCount, tags, date })
    }

    // ── Sort ──────────────────────────────────────────────────────────────────────────
    if (opts.sort === "alphabetical") {
      entries.sort((a, b) => a.title.localeCompare(b.title))
    } else if (opts.sort === "docCount") {
      entries.sort((a, b) => b.docCount - a.docCount)
    } else if (opts.sort === "date") {
      entries.sort((a, b) => b.date - a.date || a.title.localeCompare(b.title))
    }

    const base = relativeBase(slug)

    // ── Empty state ───────────────────────────────────────────────────────────────────
    if (entries.length === 0) {
      return (
        <div class="rip">
          <p class="rip-empty">No subdirectories found.</p>
        </div>
      )
    }

    // ── List layout ───────────────────────────────────────────────────────────────────
    if (opts.layout === "list") {
      return (
        <div class="rip rip--list">
          <ul class="rip-list">
            {entries.map((entry) => (
              <li class="rip-list-item" key={entry.seg}>
                <a href={`${base}/${entry.seg}`} class="rip-list-link">
                  <div class="rip-list-row">
                    <span class="rip-list-title">{entry.title}</span>
                    {opts.showDocCount && (
                      <span class="rip-count">{noteCountLabel(entry.docCount)}</span>
                    )}
                  </div>
                  {opts.showDescription && entry.description && (
                    <p class="rip-desc">{entry.description}</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // ── Cards layout (default) ────────────────────────────────────────────────────────────
    return (
      <div class="rip rip--cards">
        <ul class="rip-grid">
          {entries.map((entry) => (
            <li class="rip-card" key={entry.seg}>
              <a href={`${base}/${entry.seg}`} class="rip-card-link">
                <div class="rip-card-top">
                  <span class="rip-card-title">{entry.title}</span>
                  {opts.showDocCount && <span class="rip-count">{entry.docCount}</span>}
                </div>
                {opts.showDescription && entry.description && (
                  <p class="rip-desc">{entry.description}</p>
                )}
                {opts.showTags && entry.tags.length > 0 && (
                  <div class="rip-tags">
                    {entry.tags.map((tag) => (
                      <span class="rip-tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  RootIndexPanels.css = style
  RootIndexPanels.afterDOMLoaded = script
  return RootIndexPanels
}) satisfies QuartzComponentConstructor
