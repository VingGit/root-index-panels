import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { resolveRelative } from "@quartz-community/utils/path"
import { resolvePanelAccent } from "../appearance"
import { collectBooks, type BookEntry } from "../books"
import { i18n, type RootIndexPanelsTranslation } from "../i18n"
import { resolvePanelIcon } from "../icons"
import { normalizeRootIndexPanelsOptions } from "../options"
import type { RootIndexPanelsOptions } from "../types"
// @ts-expect-error — .inline.ts files are processed by the tsup inline-script-loader
import script from "./scripts/panels.inline.ts"
import style from "./styles/panels.scss"

interface RenderEntry extends BookEntry {
  href: string
  icon: ReturnType<typeof resolvePanelIcon>
  accent: ReturnType<typeof resolvePanelAccent>
}

function ownDataValue(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined

  try {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    return descriptor && "value" in descriptor ? descriptor.value : undefined
  } catch {
    return undefined
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

function ListPanel({
  entry,
  idPrefix,
  showDescription,
  showDocCount,
  translation,
}: {
  entry: RenderEntry
  idPrefix: string
  showDescription: boolean
  showDocCount: boolean
  translation: RootIndexPanelsTranslation
}) {
  const titleId = `${idPrefix}-title`
  const countId = `${idPrefix}-count`
  const descriptionId = `${idPrefix}-description`
  const describedBy = [
    showDocCount ? countId : undefined,
    showDescription && entry.description ? descriptionId : undefined,
  ].filter((id): id is string => id !== undefined)

  return (
    <li class="rip-list-item">
      <a
        href={entry.href}
        class="rip-list-link"
        aria-labelledby={titleId}
        aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
        {...panelAttributes(entry)}
      >
        <div class="rip-list-row">
          <span class="rip-panel-heading">
            <PanelIcon entry={entry} />
            <span class="rip-list-title" id={titleId}>
              {entry.title}
            </span>
          </span>
          {showDocCount && (
            <span class="rip-count" id={countId}>
              {translation.noteCount(entry.docCount)}
            </span>
          )}
        </div>
        {showDescription && entry.description && (
          <p class="rip-desc" id={descriptionId}>
            {entry.description}
          </p>
        )}
      </a>
    </li>
  )
}

function CardPanel({
  entry,
  idPrefix,
  showDescription,
  showDocCount,
  showTags,
  translation,
}: {
  entry: RenderEntry
  idPrefix: string
  showDescription: boolean
  showDocCount: boolean
  showTags: boolean
  translation: RootIndexPanelsTranslation
}) {
  const countLabel = translation.noteCount(entry.docCount)
  const titleId = `${idPrefix}-title`
  const countId = `${idPrefix}-count`
  const descriptionId = `${idPrefix}-description`
  const tagsId = `${idPrefix}-tags`
  const describedBy = [
    showDocCount ? countId : undefined,
    showDescription && entry.description ? descriptionId : undefined,
    showTags && entry.tags.length > 0 ? tagsId : undefined,
  ].filter((id): id is string => id !== undefined)

  return (
    <li class="rip-card">
      <a
        href={entry.href}
        class="rip-card-link"
        aria-labelledby={titleId}
        aria-describedby={describedBy.length > 0 ? describedBy.join(" ") : undefined}
        {...panelAttributes(entry)}
      >
        <div class="rip-card-top">
          <span class="rip-panel-heading">
            <PanelIcon entry={entry} />
            <span class="rip-card-title" id={titleId}>
              {entry.title}
            </span>
          </span>
          {showDocCount && (
            <>
              <span class="rip-count" aria-hidden="true">
                {entry.docCount}
              </span>
              <span class="rip-sr-only" id={countId}>
                {countLabel}
              </span>
            </>
          )}
        </div>
        {showDescription && entry.description && (
          <p class="rip-desc" id={descriptionId}>
            {entry.description}
          </p>
        )}
        {showTags && entry.tags.length > 0 && (
          <div class="rip-tags" id={tagsId}>
            {entry.tags.map((tag, index) => (
              <span class="rip-tag" key={`${tag}-${index}`}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </a>
    </li>
  )
}

export default ((userOptions?: RootIndexPanelsOptions) => {
  const options = normalizeRootIndexPanelsOptions(userOptions)

  const RootIndexPanels: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return <></>

    const translation = i18n(cfg.locale)
    const entries: RenderEntry[] = collectBooks(allFiles, options).map((entry) => ({
      ...entry,
      href: resolveRelative(fileData.slug as FullSlug, `${entry.segment}/index` as FullSlug),
      icon: resolvePanelIcon(ownDataValue(entry.panel, "icon"), options),
      accent: resolvePanelAccent(ownDataValue(entry.panel, "accent"), options),
    }))

    if (entries.length === 0) {
      return (
        <div class="rip">
          <p class="rip-empty">{translation.emptyState}</p>
        </div>
      )
    }

    if (options.layout === "list") {
      return (
        <div class="rip rip--list">
          <ul class="rip-list">
            {entries.map((entry, index) => (
              <ListPanel
                key={entry.segment}
                entry={entry}
                idPrefix={`rip-panel-${index}`}
                showDescription={options.showDescription}
                showDocCount={options.showDocCount}
                translation={translation}
              />
            ))}
          </ul>
        </div>
      )
    }

    return (
      <div class="rip rip--cards">
        <ul class="rip-grid">
          {entries.map((entry, index) => (
            <CardPanel
              key={entry.segment}
              entry={entry}
              idPrefix={`rip-panel-${index}`}
              showDescription={options.showDescription}
              showDocCount={options.showDocCount}
              showTags={options.showTags}
              translation={translation}
            />
          ))}
        </ul>
      </div>
    )
  }

  RootIndexPanels.css = style
  RootIndexPanels.afterDOMLoaded = script
  return RootIndexPanels
}) satisfies QuartzComponentConstructor<RootIndexPanelsOptions>

export type { RootIndexPanelsOptions } from "../types"
