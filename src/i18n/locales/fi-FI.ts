import type { RootIndexPanelsTranslation } from "../types"

export const fiFI: RootIndexPanelsTranslation = {
  noteCount: (count) => `${count} ${count === 1 ? "muistiinpano" : "muistiinpanoa"}`,
  emptyState: "Alikansioita ei löytynyt.",
}
