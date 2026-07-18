import type {
  FilePath,
  FullSlug,
  QuartzComponent,
  QuartzComponentProps,
  QuartzPluginData,
} from "@quartz-community/types"
import type { ComponentChildren } from "preact"
import render from "preact-render-to-string"
import { vi } from "vitest"

vi.mock("../src/components/scripts/panels.inline.ts", () => ({ default: "" }))
vi.mock("../src/components/styles/panels.scss", () => ({ default: "" }))

import { RootIndexPanels } from "../src/components"
import type { RootIndexPanelsOptions } from "../src/types"

export type PluginFile = QuartzPluginData & Record<string, unknown>

export function fullSlug(slug: string): FullSlug {
  return slug as FullSlug
}

/** A parsed source file. The `filePath` is the observable physical-file marker. */
export function physicalFile(
  slug: string,
  frontmatter: Record<string, unknown> = {},
  data: Record<string, unknown> = {},
): PluginFile {
  return {
    slug: fullSlug(slug),
    filePath: `${slug}.md` as FilePath,
    relativePath: `${slug}.md` as FilePath,
    frontmatter,
    ...data,
  } as unknown as PluginFile
}

/** A synthetic Page Type entry. It intentionally has no `filePath`. */
export function virtualFile(
  slug: string,
  frontmatter: Record<string, unknown> = {},
  data: Record<string, unknown> = {},
): PluginFile {
  return {
    slug: fullSlug(slug),
    frontmatter,
    ...data,
  } as unknown as PluginFile
}

export function componentProps(
  slug: string,
  allFiles: PluginFile[],
  locale = "en-US",
): QuartzComponentProps {
  return {
    ctx: {},
    externalResources: { css: [], js: [], additionalHead: [] },
    fileData: physicalFile(slug),
    cfg: { locale },
    children: [] as ComponentChildren,
    tree: { type: "root", children: [] },
    allFiles,
  }
}

export function renderComponent(
  Component: QuartzComponent,
  slug: string,
  allFiles: PluginFile[],
  locale = "en-US",
): string {
  return render(Component(componentProps(slug, allFiles, locale)) as Parameters<typeof render>[0])
}

export function renderPanels(
  allFiles: PluginFile[],
  options?: RootIndexPanelsOptions | unknown,
  locale = "en-US",
  slug = "index",
): string {
  return renderComponent(RootIndexPanels(options as RootIndexPanelsOptions), slug, allFiles, locale)
}

export function countOccurrences(value: string, needle: string): number {
  return value.split(needle).length - 1
}

export function inventoryOptions(
  overrides: Partial<{
    descriptionFallback: string
    excludeDirs: string[]
    sort: "alphabetical" | "docCount" | "date"
    tagCount: number
  }> = {},
) {
  return {
    descriptionFallback: "",
    excludeDirs: [],
    sort: "alphabetical" as const,
    tagCount: 3,
    ...overrides,
  }
}
