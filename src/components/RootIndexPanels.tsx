import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { htmlToJsx } from "@quartz-community/utils/jsx"
import { resolveRelative } from "@quartz-community/utils/path"
import { resolvePanelAccent } from "../appearance"
import { collectBooks, type BookEntry } from "../books"
import { i18n, type RootIndexPanelsTranslation } from "../i18n"
import { resolvePanelIcon } from "../icons"
import { normalizeRootIndexPanelsOptions, type NormalizedRootIndexPanelsOptions } from "../options"
import type { RootIndexPanelsOptions } from "../types"
// @ts-expect-error — .inline.ts files are processed by the tsup inline-script-loader
import script from "./scripts/panels.inline.ts"
import libraryStyle from "./styles/root-library.scss"
import style from "./styles/panels.scss"

interface RenderEntry extends BookEntry {
  href: string
  icon: ReturnType<typeof resolvePanelIcon>
  accent: ReturnType<typeof resolvePanelAccent>
  dateDisplay?: string
  dateIso?: string
}

const maximumDateTimestamp = 8_640_000_000_000_000

function formatUpdatedDate(
  timestamp: number,
  locale: unknown,
): { display: string; iso: string } | undefined {
  if (!Number.isFinite(timestamp) || Math.abs(timestamp) > maximumDateTimestamp) return undefined
  const requestedLocale = typeof locale === "string" ? locale : "en-US"
  const locales = requestedLocale === "en-US" ? [requestedLocale] : [requestedLocale, "en-US"]

  for (const candidateLocale of locales) {
    try {
      const date = new Date(timestamp)
      return {
        display: new Intl.DateTimeFormat(candidateLocale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }).format(date),
        iso: date.toISOString().slice(0, 10),
      }
    } catch {
      // Try the stable fallback, then omit the optional date.
    }
  }
  return undefined
}

function compareTitle(left: RenderEntry, right: RenderEntry): number {
  const leftFolded = left.title.toLowerCase()
  const rightFolded = right.title.toLowerCase()
  if (leftFolded < rightFolded) return -1
  if (leftFolded > rightFolded) return 1
  if (left.title < right.title) return -1
  if (left.title > right.title) return 1
  return left.segment < right.segment ? -1 : left.segment > right.segment ? 1 : 0
}

function ownDataValue(value: unknown, key: string): unknown {
  try {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
  }
}

function safeStringArray(value: unknown): string[] {
  try {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

function rootArticleClass(fileData: unknown, layout: "cards" | "list"): string {
  const frontmatter = ownDataValue(fileData, "frontmatter")
  return [
    "rip",
    "popover-hint",
    `rip--${layout}`,
    ...safeStringArray(ownDataValue(frontmatter, "cssclasses")),
  ].join(" ")
}

function hasRootContent(tree: unknown): boolean {
  try {
    const children = ownDataValue(tree, "children")
    return Array.isArray(children) && children.length > 0
  } catch {
    return false
  }
}

function panelAttributes(entry: RenderEntry): Record<string, string | undefined> {
  return {
    "data-rip-icon": entry.icon?.name,
    "data-rip-accent":
      entry.accent.kind === "named"
        ? entry.accent.name
        : entry.accent.kind === "direct"
          ? "direct"
          : undefined,
    "data-rip-title": entry.title,
    "data-rip-date": Number.isFinite(entry.date) ? String(entry.date) : "",
    style: entry.accent.kind === "theme" ? undefined : `--rip-panel-accent: ${entry.accent.value}`,
  }
}

function PanelIcon({ entry }: { entry: RenderEntry }) {
  if (!entry.icon) return null
  const Icon = entry.icon.component
  return (
    <span class="rip-panel-icon" aria-hidden="true" inert>
      <Icon aria-hidden="true" focusable="false" width={20} height={20} stroke-width={1.8} />
    </span>
  )
}

function UpdatedDate({
  entry,
  translation,
}: {
  entry: RenderEntry
  translation: RootIndexPanelsTranslation
}) {
  if (!entry.dateDisplay || !entry.dateIso) return null
  return (
    <time class="rip-updated" dateTime={entry.dateIso}>
      {translation.updatedLabel(entry.dateDisplay)}
    </time>
  )
}

function ListPanel({
  entry,
  idPrefix,
  options,
  translation,
}: {
  entry: RenderEntry
  idPrefix: string
  options: NormalizedRootIndexPanelsOptions
  translation: RootIndexPanelsTranslation
}) {
  const titleId = `${idPrefix}-title`
  const countId = `${idPrefix}-count`
  const descriptionId = `${idPrefix}-description`
  const describedBy = [
    options.showDocCount ? countId : undefined,
    options.showDescription && entry.description ? descriptionId : undefined,
  ].filter((id): id is string => id !== undefined)

  return (
    <li class="rip-list-item" {...panelAttributes(entry)}>
      <a
        href={entry.href}
        class="rip-list-link"
        aria-labelledby={titleId}
        aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
      >
        <div class="rip-list-row">
          <span class="rip-panel-heading">
            <PanelIcon entry={entry} />
            <span class="rip-list-title" id={titleId}>
              {entry.title}
            </span>
          </span>
          {options.showDocCount && (
            <span class="rip-count" id={countId}>
              {translation.noteCount(entry.docCount)}
            </span>
          )}
        </div>
        {options.showDescription && entry.description && (
          <p class="rip-desc" id={descriptionId}>
            {entry.description}
          </p>
        )}
        <UpdatedDate entry={entry} translation={translation} />
      </a>
    </li>
  )
}

function CardPanel({
  entry,
  idPrefix,
  options,
  translation,
}: {
  entry: RenderEntry
  idPrefix: string
  options: NormalizedRootIndexPanelsOptions
  translation: RootIndexPanelsTranslation
}) {
  const titleId = `${idPrefix}-title`
  const countId = `${idPrefix}-count`
  const descriptionId = `${idPrefix}-description`
  const tagsId = `${idPrefix}-tags`
  const describedBy = [
    options.showDocCount ? countId : undefined,
    options.showDescription && entry.description ? descriptionId : undefined,
    options.showTags && entry.tags.length > 0 ? tagsId : undefined,
  ].filter((id): id is string => id !== undefined)

  return (
    <li class="rip-card" {...panelAttributes(entry)}>
      <a
        href={entry.href}
        class="rip-card-link"
        aria-labelledby={titleId}
        aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
      >
        <div class="rip-card-top">
          <span class="rip-panel-heading">
            <PanelIcon entry={entry} />
            <span class="rip-card-title" id={titleId}>
              {entry.title}
            </span>
          </span>
          {options.showDocCount && (
            <>
              <span class="rip-count" aria-hidden="true">
                {entry.docCount}
              </span>
              <span class="rip-sr-only" id={countId}>
                {translation.noteCount(entry.docCount)}
              </span>
            </>
          )}
        </div>
        {options.showDescription && entry.description && (
          <p class="rip-desc" id={descriptionId}>
            {entry.description}
          </p>
        )}
        {options.showTags && entry.tags.length > 0 && (
          <div class="rip-tags" id={tagsId}>
            {entry.tags.map((tag, index) => (
              <span class="rip-tag" key={`${tag}-${index}`}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <UpdatedDate entry={entry} translation={translation} />
      </a>
    </li>
  )
}

function BookCollection({
  entries,
  idPrefix,
  options,
  translation,
}: {
  entries: RenderEntry[]
  idPrefix: string
  options: NormalizedRootIndexPanelsOptions
  translation: RootIndexPanelsTranslation
}) {
  if (options.layout === "list") {
    return (
      <ul class="rip-list" data-rip-book-list>
        {entries.map((entry, index) => (
          <ListPanel
            key={entry.segment}
            entry={entry}
            idPrefix={`${idPrefix}-${index}`}
            options={options}
            translation={translation}
          />
        ))}
      </ul>
    )
  }

  return (
    <ul class="rip-grid" data-rip-book-list>
      {entries.map((entry, index) => (
        <CardPanel
          key={entry.segment}
          entry={entry}
          idPrefix={`${idPrefix}-${index}`}
          options={options}
          translation={translation}
        />
      ))}
    </ul>
  )
}

function RootOverview({
  entries,
  locale,
  translation,
}: {
  entries: RenderEntry[]
  locale: unknown
  translation: RootIndexPanelsTranslation
}) {
  const totalNotes = entries.reduce(
    (total, entry) => Math.min(Number.MAX_SAFE_INTEGER, total + entry.docCount),
    0,
  )
  const latestTimestamp = entries.reduce(
    (latest, entry) => Math.max(latest, entry.date),
    Number.NEGATIVE_INFINITY,
  )
  const updated = formatUpdatedDate(latestTimestamp, locale)

  return (
    <div class="rip-overview">
      <dl class="rip-stats">
        <div class="rip-stat">
          <dt>{translation.bookCount(entries.length)}</dt>
          <dd>{entries.length}</dd>
        </div>
        <div class="rip-stat">
          <dt>{translation.totalNotesLabel}</dt>
          <dd>{totalNotes}</dd>
        </div>
        {updated && (
          <div class="rip-stat">
            <dt>{translation.lastUpdatedLabel}</dt>
            <dd>
              <time dateTime={updated.iso}>{updated.display}</time>
            </dd>
          </div>
        )}
      </dl>
      {entries.length > 0 && (
        <a class="rip-browse-link" href="#rip-books">
          {translation.exploreBooks}
          <span aria-hidden="true">↓</span>
        </a>
      )}
    </div>
  )
}

export default ((userOptions?: RootIndexPanelsOptions) => {
  const options = normalizeRootIndexPanelsOptions(userOptions)

  const RootIndexPanels: QuartzComponent = ({
    fileData,
    allFiles,
    cfg,
    tree,
  }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const translation = i18n(cfg.locale)
    const entries = collectBooks(allFiles, options).map((entry): RenderEntry => {
      const formattedDate = formatUpdatedDate(entry.date, cfg.locale)
      return {
        ...entry,
        href: resolveRelative(fileData.slug as FullSlug, `${entry.segment}/index` as FullSlug),
        icon: resolvePanelIcon(ownDataValue(entry.panel, "icon"), options),
        accent: resolvePanelAccent(ownDataValue(entry.panel, "accent"), options),
        dateDisplay: formattedDate?.display,
        dateIso: formattedDate?.iso,
      }
    })
    const latestEntries = [...entries].sort((left, right) => right.date - left.date || compareTitle(left, right)).slice(0, 3)
    const showRootContent = hasRootContent(tree)

    return (
      <article class={rootArticleClass(fileData, options.layout)}>
        <RootOverview entries={entries} locale={cfg.locale} translation={translation} />
        {latestEntries.length > 0 && (
          <section class="rip-latest" aria-labelledby="rip-latest-heading">
            <div class="rip-section-heading rip-section-heading--stacked">
              <div>
                <h2 id="rip-latest-heading">{translation.latestBooks}</h2>
                <p>{translation.latestBooksDescription}</p>
              </div>
            </div>
            <BookCollection
              entries={latestEntries}
              idPrefix="rip-latest-book"
              options={options}
              translation={translation}
            />
          </section>
        )}
        {showRootContent && (
          <div class="rip-root-content markdown-preview-view markdown-rendered">
            {htmlToJsx(tree as Parameters<typeof htmlToJsx>[0])}
            <a class="rip-return-link" href="#rip-books">
              {translation.returnToLibrary}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        )}
        <section id="rip-books" class="rip-directories" aria-labelledby="rip-books-heading">
          <div class="rip-library-heading">
            <div class="rip-section-heading">
              <h2 id="rip-books-heading">{translation.allBooks}</h2>
              <span aria-hidden="true">{entries.length}</span>
            </div>
            {entries.length > 1 && (
              <label class="rip-sort">
                <span>{translation.sortBooks}</span>
                <select data-rip-sort-control>
                  <option value="date-desc">{translation.sortNewest}</option>
                  <option value="date-asc">{translation.sortOldest}</option>
                  <option value="title-asc">{translation.sortTitleAscending}</option>
                  <option value="title-desc">{translation.sortTitleDescending}</option>
                </select>
              </label>
            )}
          </div>
          {entries.length === 0 ? (
            <p class="rip-empty">{translation.emptyState}</p>
          ) : (
            <BookCollection
              entries={entries}
              idPrefix="rip-book"
              options={options}
              translation={translation}
            />
          )}
        </section>
      </article>
    )
  }

  RootIndexPanels.css = `${style}\n${libraryStyle}`
  RootIndexPanels.afterDOMLoaded = script
  return RootIndexPanels
}) satisfies QuartzComponentConstructor<RootIndexPanelsOptions>

export type { RootIndexPanelsOptions } from "../types"
