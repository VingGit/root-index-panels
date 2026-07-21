# Sidebar and root-library rework

## Durable implementation decisions

- Book and folder landing pages are ordinary Quartz routes. The plugin never creates client-only
  destinations.
- A book's physical or FolderPage-generated `index` route remains its landing destination but is not
  repeated as a visible Explorer note.
- Folder navigation and disclosure are separate controls. The row link opens the folder landing page;
  the adjacent button only changes the visibility of the already-rendered child list.
- The active book's validated accent is scoped on the sidebar navigation region so selected notes,
  selected folders, hidden active ancestors, and the exact-current home mark share one semantic
  accent source.
- Root library cards retain the configured initial order. The latest preview is always independently
  sorted by edit date, while the complete collection may be reordered by the reader without removing
  or cloning entries.
- Visible strings and edit dates come from the plugin locale catalog and `cfg.locale`.

## FolderPage prerequisite

`RootIndexPanelsPage` matches only the physical site-root `index` page. Quartz ContentPage excludes
all other `/index` slugs, so `github:quartz-community/folder-page` is required to emit every book and
nested-folder landing page. This remains true when a physical `index.md` provides the page content and
metadata. The plugin manifest declares that exact dependency source; sites must configure and enable
it before root-index-panels.

Ordinary non-index notes remain ContentPage routes. When diagnosing 404s, distinguish a missing or
disabled FolderPage prerequisite from a deployment-base mismatch by inspecting the built `public/`
artifact.
