import type { RootIndexPanelsTranslation } from "../types"

export const enUS: RootIndexPanelsTranslation = {
  noteCount: (count) => `${count} ${count === 1 ? "note" : "notes"}`,
  directoryLabel: (count) => (count === 1 ? "directory" : "directories"),
  totalNotesLabel: "total notes",
  lastUpdatedLabel: "last updated",
  browseDirectories: "Browse directories",
  sidebarNavigation: "Book navigation",
  home: "Home",
  notes: "Notes",
  contents: "Contents",
  overview: "Overview",
  emptyState: "No subdirectories found.",
}
