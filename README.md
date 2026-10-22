# Root Books Workspace for Quartz

Root Books Workspace is a Quartz 5 plugin for vaults organized as first-level
books. It provides a root library page and a route-aware left sidebar without
changing Quartz's content model.

Each book is a first-level content directory with an `index.md` folder note:

```text
content/
├── index.md
├── research/
│   ├── index.md
│   └── methods.md
└── writing/
    ├── index.md
    └── outline.md
```

The root page shows library statistics, recently edited books, authored root
content, and the full book collection. The sidebar switches between root and
book scopes and renders ordinary, accessible links for notes, folders, Canvas,
and Bases pages.

## Installation

Install the required Folder Page plugin and this plugin with the normal Quartz
plugin manager:

```bash
npx quartz plugin add @quartz-community/folder-page
npx quartz plugin add github:obsidian-material-plugins/quartz-root-books-workspace
```

Enable the folder-page emitter and the `RootIndexPanelsPage` page type, then add
`RootIndexSidebar` to the left layout. The plugin manifest exposes the sidebar
component; the page type is configured in `quartz.ts`.

```ts
import * as RootBooks from "@obsidian-material-plugins/quartz-root-books-workspace"

export default {
  plugins: {
    emitters: [
      // ...
      RootBooks.RootIndexPanelsPage(),
    ],
  },
}
```

## Portable book appearance

Root Books Workspace implements `book-structure/v1` and `book-appearance/v1`
from the
[plugin contract catalog](https://github.com/obsidian-material-plugins/plugin-contracts)
alongside
[Root Books Toolkit](https://github.com/obsidian-material-plugins/obsidian-root-books-workspace):

```yaml
panel:
  icon: "lucide:book-open"
  accent: "#0ea5e9"
```

- `panel.icon` accepts only `lucide:<lowercase-kebab-name>`.
- `panel.accent` accepts only a direct six-digit hexadecimal color.
- Invalid or missing values fall back to the configured defaults.

Browse the [Lucide icon gallery](https://lucide.dev/icons/), copy the icon's
kebab-case name, and prefix it with `lucide:`. Direct Lucide icons render as a
version-pinned CSS mask so they inherit the book accent and remain decorative.

Named color registries, CSS variables, short/alpha hex colors, unprefixed icon
aliases, and custom TypeScript icon registries are intentionally unsupported.
This keeps Obsidian and Quartz metadata identical and portable.

## Options

```ts
RootIndexPanels.RootIndexPanelsPage({
  layout: "cards",
  sort: "alphabetical",
  showDescription: true,
  showDocCount: true,
  showTags: true,
  tagCount: 3,
  descriptionFallback: "",
  defaultIcon: "lucide:book-open",
  defaultAccent: "theme",
})
```

| Option                | Default            | Description                               |
| --------------------- | ------------------ | ----------------------------------------- |
| `layout`              | `cards`            | `cards` or `list`.                        |
| `sort`                | `alphabetical`     | `alphabetical`, `docCount`, or `date`.    |
| `showDescription`     | `true`             | Show the book-index description.          |
| `showDocCount`        | `true`             | Show listed descendant counts.            |
| `showTags`            | `true`             | Show book-index tags in card layout.      |
| `tagCount`            | `3`                | Maximum tags per card.                    |
| `descriptionFallback` | `""`               | Text used when a book has no description. |
| `defaultIcon`         | `lucide:book-open` | Portable fallback icon.                   |
| `defaultAccent`       | `theme`            | `theme` or a six-digit hex fallback.      |
| `replaceExplorer`     | `true`             | Hide only the adjacent stock Explorer.    |

`RootIndexSidebar` accepts the same options. Its book inventory and appearance
match the root page, while its Explorer model stays independent.

Use Quartz `ignorePatterns` when a directory's Markdown should not become site
content. This keeps content visibility policy in Quartz instead of maintaining a
second plugin-specific exclusion list.

## Custom File Explorer Sorting

When
[Custom File Explorer Sorting for Quartz](https://github.com/obsidian-material-plugins/quartz-custom-file-explorer-sorting)
is present, the sidebar consumes its optional `navigation-sorting/v1`
capability. Sorting specifications may reorder or hide root books, root notes,
and nested folder entries. Root Books Workspace remains dependency-free and
keeps its standalone ordering if the service is absent, invalid, or throws.

## Accessibility and hosting

The root collection and sidebar are fully linked server-rendered HTML. Client
JavaScript adds keyboard movement, sorting controls, disclosure behavior, and
mobile close behavior without replacing the underlying navigation. Decorative
icons are inert and never become a second accessible name.

All destinations use Quartz path helpers, so project subpaths and custom domains
work when the host's generated base path matches its final public URL.

## Development

```bash
npm ci
npm run check
npm run build
npm run verify:dist
npm run verify:package
```

`dist/` is committed installation output and must be rebuilt from source.

## Contract compatibility

This package releases independently. Compatibility with other plugins follows
its declared `book-structure/v1`, `book-appearance/v1`, and optional
`navigation-sorting/v1` support rather than matching package versions.

## License

[MIT](LICENSE)
