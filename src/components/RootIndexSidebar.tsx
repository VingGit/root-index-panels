import type {
  FullSlug,
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"
import { classNames } from "@quartz-community/utils/lang"
import { resolveRelative } from "@quartz-community/utils/path"

import { resolvePanelAccent } from "../appearance"
import { i18n, type RootIndexPanelsTranslation } from "../i18n"
import { resolvePanelIcon, sidebarIcons } from "../icons"
import {
  getSidebarLinkState,
  getSidebarNavigationModel,
  selectSidebarNavigationScope,
  type SidebarBook,
  type SidebarNavigationNode,
} from "../navigation"
import { normalizeRootIndexPanelsOptions, type NormalizedRootIndexPanelsOptions } from "../options"
import { parseCanonicalSlug } from "../slug"
import type { RootIndexSidebarOptions } from "../types"
// @ts-expect-error — .inline.ts files are processed by the tsup inline-script-loader
import script from "./scripts/sidebar.inline.ts"
import style from "./styles/sidebar.scss"

type SidebarIconComponent = (typeof sidebarIcons)[keyof typeof sidebarIcons]

function SidebarGlyph({
  className,
  icon: Icon,
  size = 15,
}: {
  className: string
  icon: SidebarIconComponent
  size?: number
}) {
  return (
    <span class={className} aria-hidden="true" inert>
      <Icon aria-hidden="true" focusable="false" width={size} height={size} stroke-width={1.8} />
    </span>
  )
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

function currentSlug(value: unknown): FullSlug {
  return parseCanonicalSlug(value)?.slug ?? ("index" as FullSlug)
}

function panelAttributes(
  panel: unknown,
  options: NormalizedRootIndexPanelsOptions,
): Record<string, string | undefined> {
  const accent = resolvePanelAccent(ownDataValue(panel, "accent"), options)
  return {
    "data-rip-accent":
      accent.kind === "named" ? accent.name : accent.kind === "direct" ? "direct" : undefined,
    style: accent.kind === "theme" ? undefined : `--rip-sidebar-accent: ${accent.value}`,
  }
}

function BookIcon({
  panel,
  options,
}: {
  panel: unknown
  options: NormalizedRootIndexPanelsOptions
}) {
  const icon = resolvePanelIcon(ownDataValue(panel, "icon"), options)
  if (!icon) return null

  const Icon = icon.component
  return (
    <span class="rip-sidebar-book-icon" data-rip-icon={icon.name} aria-hidden="true" inert>
      <Icon aria-hidden="true" focusable="false" width={14} height={14} stroke-width={1.8} />
    </span>
  )
}

function BookLink({
  book,
  current,
  options,
  selected,
  translation,
}: {
  book: SidebarBook
  current: FullSlug
  options: NormalizedRootIndexPanelsOptions
  selected: boolean
  translation: RootIndexPanelsTranslation
}) {
  const state = getSidebarLinkState(book.slug, current)
  return (
    <a
      class="rip-sidebar-book-link"
      href={resolveRelative(current, book.slug)}
      aria-current={state === "current" ? "page" : undefined}
      data-rip-state={state}
      data-rip-selected={selected ? "true" : undefined}
      {...panelAttributes(book.panel, options)}
    >
      <BookIcon panel={book.panel} options={options} />
      <span class="rip-sidebar-link-label">{book.title}</span>
      {selected && (
        <>
          <span class="rip-sidebar-sr-only">, {translation.selectedManual}</span>
          <SidebarGlyph
            className="rip-sidebar-selected-check"
            icon={sidebarIcons.check}
            size={13}
          />
        </>
      )}
    </a>
  )
}

function NavigationLink({
  slug,
  title,
  current,
  className,
}: {
  slug: FullSlug
  title: string
  current: FullSlug
  className: string
}) {
  const state = getSidebarLinkState(slug, current)
  return (
    <a
      class={className}
      href={resolveRelative(current, slug)}
      aria-current={state === "current" ? "page" : undefined}
      data-rip-state={state}
    >
      <SidebarGlyph className="rip-sidebar-node-icon" icon={sidebarIcons.file} />
      <span class="rip-sidebar-link-label">{title}</span>
    </a>
  )
}

function NavigationNode({
  node,
  current,
  depth,
  translation,
}: {
  node: SidebarNavigationNode
  current: FullSlug
  depth: number
  translation: RootIndexPanelsTranslation
}) {
  if (node.kind === "note") {
    return (
      <li class="rip-sidebar-note">
        <NavigationLink
          slug={node.slug}
          title={node.title}
          current={current}
          className="rip-sidebar-note-link"
        />
      </li>
    )
  }

  const state = node.slug ? getSidebarLinkState(node.slug, current) : undefined
  const descendantIsActive = node.children.some((child) => nodeContainsSlug(child, current))
  const summaryState = state ?? (descendantIsActive ? "ancestor" : undefined)

  return (
    <li class="rip-sidebar-folder">
      <details open={depth === 0 || state !== undefined || descendantIsActive || undefined}>
        <summary data-rip-state={summaryState}>
          <SidebarGlyph className="rip-sidebar-node-icon" icon={sidebarIcons.folder} />
          <span class="rip-sidebar-folder-label">{node.title}</span>
        </summary>
        {node.slug && (
          <NavigationLink
            slug={node.slug}
            title={translation.overview}
            current={current}
            className="rip-sidebar-overview-link"
          />
        )}
        {node.children.length > 0 && (
          <ul class="rip-sidebar-children">
            {node.children.map((child) => (
              <NavigationNode
                key={child.key}
                node={child}
                current={current}
                depth={depth + 1}
                translation={translation}
              />
            ))}
          </ul>
        )}
      </details>
    </li>
  )
}

function nodeContainsSlug(node: SidebarNavigationNode, current: FullSlug): boolean {
  if (node.slug && getSidebarLinkState(node.slug, current) !== undefined) return true
  return node.kind === "folder" && node.children.some((child) => nodeContainsSlug(child, current))
}

export default ((userOptions?: RootIndexSidebarOptions) => {
  let options: NormalizedRootIndexPanelsOptions
  try {
    options = normalizeRootIndexPanelsOptions(userOptions)
  } catch {
    options = normalizeRootIndexPanelsOptions()
  }

  const RootIndexSidebar: QuartzComponent = (props: QuartzComponentProps) => {
    const current = currentSlug(ownDataValue(props.fileData, "slug"))
    const model = getSidebarNavigationModel(props.allFiles, {
      descriptionFallback: options.descriptionFallback,
      excludeDirs: options.excludeDirs,
      sort: options.sort,
      tagCount: options.tagCount,
    })
    const scope = selectSidebarNavigationScope(model, current)
    const translation = i18n(ownDataValue(props.cfg, "locale"))
    const selectedBook = scope.kind === "book" ? scope.book : undefined
    const rootTitle = model.rootTitle ?? translation.home
    const rootSelected = selectedBook === undefined
    const homeState = getSidebarLinkState("index", current)

    return (
      <nav
        class={classNames(props.displayClass, "rip-sidebar")}
        aria-label={translation.sidebarNavigation}
        data-rip-replace-explorer={options.replaceExplorer ? "true" : undefined}
        data-rip-scope={scope.kind}
      >
        <details class="rip-sidebar-shell" open>
          <summary class="rip-sidebar-toggle">{translation.sidebarNavigation}</summary>
          <div class="rip-sidebar-content">
            <details class="rip-sidebar-switcher">
              <summary
                data-rip-selected="true"
                {...(selectedBook ? panelAttributes(selectedBook.panel, options) : {})}
              >
                {selectedBook ? (
                  <BookIcon panel={selectedBook.panel} options={options} />
                ) : (
                  <SidebarGlyph className="rip-sidebar-root-icon" icon={sidebarIcons.home} />
                )}
                <span class="rip-sidebar-switcher-label">{selectedBook?.title ?? rootTitle}</span>
                <SidebarGlyph
                  className="rip-sidebar-switcher-chevron"
                  icon={sidebarIcons.chevronsUpDown}
                  size={13}
                />
              </summary>
              <div class="rip-sidebar-switcher-menu">
                <p class="rip-sidebar-switcher-heading">{translation.switchManual}</p>
                <ul class="rip-sidebar-home-list">
                  <li>
                    <a
                      class="rip-sidebar-home"
                      href={resolveRelative(current, "index" as FullSlug)}
                      aria-current={homeState === "current" ? "page" : undefined}
                      data-rip-state={homeState}
                      data-rip-selected={rootSelected ? "true" : undefined}
                    >
                      <SidebarGlyph className="rip-sidebar-root-icon" icon={sidebarIcons.home} />
                      <span class="rip-sidebar-link-label">{rootTitle}</span>
                      {rootSelected && (
                        <>
                          <span class="rip-sidebar-sr-only">, {translation.selectedManual}</span>
                          <SidebarGlyph
                            className="rip-sidebar-selected-check"
                            icon={sidebarIcons.check}
                            size={13}
                          />
                        </>
                      )}
                    </a>
                  </li>
                </ul>
                <div class="rip-sidebar-switcher-divider" role="separator" />
                <ul class="rip-sidebar-books">
                  {model.books.map((book) => (
                    <li key={book.segment}>
                      <BookLink
                        book={book}
                        current={current}
                        options={options}
                        selected={book.segment === selectedBook?.segment}
                        translation={translation}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </details>

            {(scope.kind === "book" || scope.children.length > 0) && (
              <section class="rip-sidebar-scope" aria-label={translation.explorer}>
                <h2 class="rip-sidebar-scope-title">{translation.explorer}</h2>
                <ul class="rip-sidebar-tree">
                  {scope.kind === "book" && (
                    <li class="rip-sidebar-book-overview">
                      <NavigationLink
                        slug={scope.book.slug}
                        title={translation.overview}
                        current={current}
                        className="rip-sidebar-note-link rip-sidebar-book-overview-link"
                      />
                    </li>
                  )}
                  {scope.children.map((node) => (
                    <NavigationNode
                      key={node.key}
                      node={node}
                      current={current}
                      depth={0}
                      translation={translation}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </details>
      </nav>
    )
  }

  RootIndexSidebar.css = style
  RootIndexSidebar.afterDOMLoaded = script
  return RootIndexSidebar
}) satisfies QuartzComponentConstructor<RootIndexSidebarOptions>

export type { RootIndexSidebarOptions } from "../types"
