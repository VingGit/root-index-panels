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

## FolderPage independence

`RootIndexPanelsPage` matches only the physical root `index` page. It does not emit ordinary note or
folder routes and therefore cannot replace Quartz's normal content emitters. FolderPage is needed only
when a folder has no physical `index.md` but still needs a generated folder landing route. Disabling
FolderPage requires physical `index.md` files for every book or nested folder that should be
navigable as a landing page; it should not remove ordinary note pages.

If every non-root URL returns 404 after disabling FolderPage, inspect the built `public/` artifact for
those HTML files and verify the Quartz content-page emitter and GitLab Pages base URL. That symptom is
broader than this plugin's root-only Page Type matcher and is not an intended coupling.
