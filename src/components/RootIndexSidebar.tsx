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
import { resolvePanelIcon } from "../icons"
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
import style from "./styles/sidebar.scss"

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
      <Icon aria-hidden="true" focusable="false" width={17} height={17} stroke-width={1.8} />
    </span>
  )
}

function BookLink({
  book,
  current,
  options,
}: {
  book: SidebarBook
  current: FullSlug
  options: NormalizedRootIndexPanelsOptions
}) {
  const state = getSidebarLinkState(book.slug, current)
  return (
    <a
      class="rip-sidebar-book-link"
      href={resolveRelative(current, book.slug)}
      aria-current={state === "current" ? "page" : undefined}
      data-rip-state={state}
      {...panelAttributes(book.panel, options)}
    >
      <BookIcon panel={book.panel} options={options} />
      <span class="rip-sidebar-link-label">{book.title}</span>
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
      <span class="rip-sidebar-link-label">{title}</span>
    </a>
  )
}

function NavigationNode({
  node,
  current,
  translation,
}: {
  node: SidebarNavigationNode
  current: FullSlug
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
      <details open={state !== undefined || descendantIsActive || undefined}>
        <summary data-rip-state={summaryState}>
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
              <summary {...(selectedBook ? panelAttributes(selectedBook.panel, options) : {})}>
                {selectedBook && <BookIcon panel={selectedBook.panel} options={options} />}
                <span class="rip-sidebar-switcher-label">
                  {selectedBook?.title ?? translation.home}
                </span>
              </summary>
              <ul class="rip-sidebar-books">
                <li>
                  <a
                    class="rip-sidebar-home"
                    href={resolveRelative(current, "index" as FullSlug)}
                    aria-current={homeState === "current" ? "page" : undefined}
                    data-rip-state={homeState}
                  >
                    <span class="rip-sidebar-link-label">{translation.home}</span>
                  </a>
                </li>
                {model.books.map((book) => (
                  <li key={book.segment}>
                    <BookLink book={book} current={current} options={options} />
                  </li>
                ))}
              </ul>
            </details>

            {scope.children.length > 0 && (
              <section
                class="rip-sidebar-scope"
                aria-label={scope.kind === "book" ? translation.contents : translation.notes}
              >
                <h2 class="rip-sidebar-scope-title">
                  {scope.kind === "book" ? translation.contents : translation.notes}
                </h2>
                <ul class="rip-sidebar-tree">
                  {scope.children.map((node) => (
                    <NavigationNode
                      key={node.key}
                      node={node}
                      current={current}
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
  return RootIndexSidebar
}) satisfies QuartzComponentConstructor<RootIndexSidebarOptions>

export type { RootIndexSidebarOptions } from "../types"
