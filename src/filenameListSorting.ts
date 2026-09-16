import type { FullSlug, QuartzPluginData } from "@quartz-community/types"

import {
  filenameSortName,
  normalizeFilenameSortDirection,
  type FilenameSortDirection,
} from "./filenameSorting"
import { parseCanonicalSlug } from "./slug"

type PluginFile = QuartzPluginData & Record<string, unknown>

export interface FilenameSortSource {
  slug: FullSlug
  sortName: string
  folderKey: string
  direction?: FilenameSortDirection
}

export interface FilenameListSortData {
  sources: readonly FilenameSortSource[]
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

function safeFiles(value: unknown): PluginFile[] {
  try {
    if (!Array.isArray(value)) return []
  } catch {
    return []
  }

  const files: PluginFile[] = []
  let length = 0
  try {
    length = value.length
  } catch {
    return files
  }

  for (let index = 0; index < length; index += 1) {
    let file: unknown
    try {
      file = value[index]
    } catch {
      continue
    }
    if (typeof file === "object" && file !== null && !Array.isArray(file)) {
      files.push(file as PluginFile)
    }
  }
  return files
}

function isListedPhysical(file: PluginFile): boolean {
  const filePath = ownDataValue(file, "filePath")
  return (
    typeof filePath === "string" && filePath.length > 0 && ownDataValue(file, "unlisted") !== true
  )
}

function fileSortDirection(file: PluginFile): FilenameSortDirection | undefined {
  const frontmatter = ownDataValue(file, "frontmatter")
  return normalizeFilenameSortDirection(ownDataValue(frontmatter, "quartz-sorting-direction"))
}

/**
 * Build the physical filename index used by note-list components. Every source note is
 * associated with the policy from the physical index.md in its own containing folder.
 * Policies never inherit into nested folders.
 */
export function collectFilenameListSortData(allFiles: unknown): FilenameListSortData {
  const seenFolders = new Set<string>()
  const folderDirections = new Map<string, FilenameSortDirection>()
  const seenSources = new Set<string>()
  const sources: Array<Omit<FilenameSortSource, "direction">> = []

  for (const file of safeFiles(allFiles)) {
    const parsed = parseCanonicalSlug(ownDataValue(file, "slug"))
    if (!parsed || !isListedPhysical(file)) continue

    if (parsed.parts.at(-1) === "index") {
      const folderKey = parsed.parts.slice(0, -1).join("/")
      if (!seenFolders.has(folderKey)) {
        seenFolders.add(folderKey)
        const direction = fileSortDirection(file)
        if (direction) folderDirections.set(folderKey, direction)
      }
    }

    if (seenSources.has(parsed.slug)) continue
    seenSources.add(parsed.slug)
    const filePath = ownDataValue(file, "filePath")
    const fallbackSegment = parsed.parts.at(-1)
    if (typeof filePath !== "string" || !fallbackSegment) continue
    sources.push({
      slug: parsed.slug,
      sortName: filenameSortName(filePath, fallbackSegment),
      folderKey: parsed.parts.slice(0, -1).join("/"),
    })
  }

  return Object.freeze({
    sources: Object.freeze(
      sources.map((source) => {
        const direction = folderDirections.get(source.folderKey)
        return Object.freeze({
          ...source,
          ...(direction ? { direction } : {}),
        })
      }),
    ),
  })
}
