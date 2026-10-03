# Root Index Panels

Root Index Panels is a Quartz 5 plugin for vaults organized as first-level
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
npx quartz plugin add github:VingGit/root-index-panels
```

Enable the folder-page emitter and the `RootIndexPanelsPage` page type, then add
`RootIndexSidebar` to the left layout. The plugin manifest exposes the sidebar
component; the page type is configured in `quartz.ts`.

```ts
import * as RootIndexPanels from "@vinggit/root-index-panels"

export default {
  plugins: {
    emitters: [
      // ...
      RootIndexPanels.RootIndexPanelsPage(),
    ],
  },
}
```

## Portable book appearance

Root Index Panels shares one deliberately small frontmatter contract with
[Root Books Toolkit](https://github.com/VingGit/obsidian-root-books-workspace):

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
  excludeDirs: ["private", "templates"],
  descriptionFallback: "",
  defaultIcon: "lucide:book-open",
  defaultAccent: "theme",
})
```

| Option                | Default            | Description                                     |
| --------------------- | ------------------ | ----------------------------------------------- |
| `layout`              | `cards`            | `cards` or `list`.                              |
| `sort`                | `alphabetical`     | `alphabetical`, `docCount`, or `date`.          |
| `showDescription`     | `true`             | Show the book-index description.                |
| `showDocCount`        | `true`             | Show listed descendant counts.                  |
| `showTags`            | `true`             | Show book-index tags in card layout.            |
| `tagCount`            | `3`                | Maximum tags per card.                          |
| `excludeDirs`         | `[]`               | Case-sensitive first-level directories to omit. |
| `descriptionFallback` | `""`               | Text used when a book has no description.       |
| `defaultIcon`         | `lucide:book-open` | Portable fallback icon.                         |
| `defaultAccent`       | `theme`            | `theme` or a six-digit hex fallback.            |
| `replaceExplorer`     | `true`             | Hide only the adjacent stock Explorer.          |

`RootIndexSidebar` accepts the same options. Its book inventory and appearance
match the root page, while its Explorer model stays independent.

## Custom File Explorer Sorting

When [Custom File Explorer Sorting Support](https://github.com/VingGit/custom-file-explorer-sorting-support)
is present at the matching ecosystem version, the sidebar consumes its optional
version-1 service. Sorting specifications may reorder or hide root books, root
notes, and nested folder entries. Root Index Panels remains dependency-free and
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

## Ecosystem versions

Root Index Panels, Root Books Toolkit, and Custom File Explorer Sorting
Support release with the same semantic version. Version `0.9.0` introduces the
portable direct-hex and `lucide:` metadata contract.

## License

[MIT](LICENSE)
