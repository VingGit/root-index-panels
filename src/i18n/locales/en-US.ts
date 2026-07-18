import type { RootIndexPanelsTranslation } from "../types"

export const enUS: RootIndexPanelsTranslation = {
  noteCount: (count) => `${count} ${count === 1 ? "note" : "notes"}`,
  emptyState: "No subdirectories found.",
}
