import type { RootIndexPanelsTranslation } from "../types"

export const fiFI: RootIndexPanelsTranslation = {
  noteCount: (count) => `${count} ${count === 1 ? "muistiinpano" : "muistiinpanoa"}`,
  directoryLabel: (count) => (count === 1 ? "hakemisto" : "hakemistoa"),
  totalNotesLabel: "muistiinpanoja",
  lastUpdatedLabel: "päivitetty",
  browseDirectories: "Selaa hakemistoja",
  sidebarNavigation: "Kirjojen navigointi",
  switchManual: "Vaihda käsikirjaa",
  selectedManual: "valittu käsikirja",
  explorer: "Sisältöselain",
  home: "Etusivu",
  notes: "Muistiinpanot",
  contents: "Sisällys",
  overview: "Yleiskatsaus",
  emptyState: "Alikansioita ei löytynyt.",
}
