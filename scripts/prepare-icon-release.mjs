import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))

function file(relative) {
  return path.join(root, relative)
}

function replaceOnce(relative, before, after) {
  const target = file(relative)
  const current = fs.readFileSync(target, "utf8")
  const first = current.indexOf(before)
  if (first < 0) throw new Error(`${relative}: expected text not found`)
  if (current.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${relative}: expected text is not unique`)
  }
  fs.writeFileSync(target, current.slice(0, first) + after + current.slice(first + before.length))
}

function replaceExactCount(relative, before, after, expectedCount) {
  const target = file(relative)
  const current = fs.readFileSync(target, "utf8")
  const count = current.split(before).length - 1
  if (count !== expectedCount) {
    throw new Error(`${relative}: expected ${expectedCount} matches, found ${count}`)
  }
  fs.writeFileSync(target, current.split(before).join(after))
}

replaceExactCount("package-lock.json", '"version": "0.1.1",', '"version": "0.2.0",', 2)

replaceOnce(
  "README.md",
  "| `defaultIcon`         | `book-open`    | Built-in or TypeScript-registered icon used as a fallback.             |",
  "| `defaultIcon`         | `book-open`    | Built-in, direct Lucide, or TypeScript-registered fallback icon.       |",
)
replaceOnce(
  "README.md",
  "Set `defaultIcon` to another built-in or TypeScript-registered alias to override it.",
  "Set `defaultIcon` to another built-in, a direct `lucide:<name>` icon, or a TypeScript-registered alias to override it.",
)

const oldIconSection = `Built-in icons:\n\n\`\`\`text\nbook-open  coffee  terminal  container  layers  code-2  network\ngit-branch  database  shield  cpu  globe  file-code-2\n\`\`\`\n\n### Adding another built-in icon\n\nThe bundled book icons come from the [Lucide icon library](https://lucide.dev/icons/) and are\nimported through the pinned \`lucide-preact\` dependency. A Lucide icon name cannot be used directly in\nfrontmatter until that icon has been registered by this plugin.\n\nTo add another built-in choice:\n\n1. Find the icon on Lucide and note its exported component name, such as \`BookCopy\`.\n2. Choose a lowercase kebab-case frontmatter alias, such as \`book-copy\`.\n3. In \`src/icons.ts\`, import the component from \`lucide-preact\`, add the alias to \`BuiltInIconName\`,\n   and add \`\"book-copy\": adaptLucideIcon(BookCopy)\` to \`builtInIcons\`.\n4. Add the alias to the built-in list above and update the icon-resolution tests.\n5. Run \`npm run check\`, \`npm run build\`, \`npm run verify:dist\`, and \`npm run verify:package\`, then\n   update the plugin installation in Quartz.\n\nThe new icon can then be selected on a book index:\n\n\`\`\`yaml\npanel:\n  icon: book-copy\n\`\`\`\n`

const newIconSection = `Built-in icons:\n\n<!-- built-in-icons:start -->\n\n\`\`\`text\nbook-open  code-2  coffee  container  cpu  database  file-code-2\ngit-branch  globe  layers  network  shield  terminal\n\`\`\`\n\n<!-- built-in-icons:end -->\n\n### Use any Lucide icon without changing the plugin\n\nBrowse the [Lucide icon gallery](https://lucide.dev/icons/). The kebab-case name at the end of an\nicon page URL is the name to use. For example, \`https://lucide.dev/icons/book-copy\` corresponds to\n\`book-copy\`.\n\nPrefix that name with \`lucide:\` in book frontmatter:\n\n\`\`\`yaml\npanel:\n  icon: \"lucide:book-copy\"\n\`\`\`\n\nNo pull request or plugin registry change is required. Direct Lucide icons are loaded as decorative,\ncolor-inheriting SVG masks from jsDelivr using the same exact Lucide version pinned by this plugin.\nThey therefore require the reader's browser and Content Security Policy to allow image requests to\n\`cdn.jsdelivr.net\`. Built-in icons and TypeScript custom icons remain self-contained and make no\nexternal icon request. An icon introduced after the plugin's pinned Lucide version will not render\nuntil the plugin updates Lucide.\n\nYou can also use the direct form as the plugin fallback:\n\n\`\`\`yaml\noptions:\n  defaultIcon: \"lucide:library-big\"\n\`\`\`\n\n### Adding another built-in icon\n\nBuilt-ins are still useful when an icon should work offline, under a restrictive CSP, or as a\ncurated default. The bundled icons come from [Lucide](https://lucide.dev/icons/) through the exact\n\`lucide-preact\` version in \`package.json\`.\n\nFrom a repository checkout with dependencies installed, adding the normal case is one command:\n\n\`\`\`bash\nnpm run icon:add -- book-copy\n\`\`\`\n\nThe command infers \`BookCopy\`, verifies that export exists in the installed pinned\n\`lucide-preact\`, updates the single source of truth in \`src/built-in-icons.json\`, regenerates the\nstatic imports and this README list, formats them, then runs \`check\`, \`build\`, \`verify:dist\`, and\n\`verify:package\`. The generated TypeScript registry and exhaustive generated-registry test no\nlonger require manual editing.\n\nWhen the frontmatter alias and Lucide export do not map mechanically, pass the export explicitly:\n\n\`\`\`bash\nnpm run icon:add -- code-2 CodeXml\n\`\`\`\n\nThe icon can then be used without the \`lucide:\` prefix because it is a bundled built-in:\n\n\`\`\`yaml\npanel:\n  icon: book-copy\n\`\`\`\n`
replaceOnce("README.md", oldIconSection, newIconSection)

replaceOnce(
  "CHANGELOG.md",
  "## [Unreleased]\n\n### Added\n",
  `## [Unreleased]\n\n## [0.2.0] - 2026-09-11\n\n### Added\n\n- Allow any icon from the plugin's pinned Lucide release to be selected directly with\n  \`panel.icon: \"lucide:<name>\"\`, without a plugin pull request.\n- Add a manifest-driven built-in icon registry and \`npm run icon:add -- <name>\` helper that verifies\n  Lucide exports, regenerates code and documentation, formats changes, and runs package checks.\n`,
)
replaceOnce(
  "CHANGELOG.md",
  "[unreleased]: https://github.com/VingGit/root-index-panels/compare/v0.1.1...HEAD\n[0.1.1]:",
  "[unreleased]: https://github.com/VingGit/root-index-panels/compare/v0.2.0...HEAD\n[0.2.0]: https://github.com/VingGit/root-index-panels/releases/tag/v0.2.0\n[0.1.1]:",
)

replaceOnce(
  ".github/instructions/architecture.instructions.md",
  "Registry names match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. `theme` is reserved for accent behavior. Custom\nown aliases win built-in collisions. The normalized `defaultIcon` is `book-open`, including when a\nconfiguration omits it or supplies an empty string. Unknown authored icons fall back once to that\ndefault; an explicitly configured unresolved default still renders no icon.\n",
  "Registry names match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. `theme` is reserved for accent behavior. Direct\nLucide icon specifiers match `lucide:<lowercase-kebab-name>` and are intentionally outside the custom\nalias registry. Construct their remote SVG URL only from that validated name and the exact\n`lucide-preact` version generated from `package.json`; never accept an authored URL or arbitrary CSS\nvalue. Custom own aliases win built-in collisions. The normalized `defaultIcon` is `book-open`,\nincluding when a configuration omits it or supplies an empty string, and may explicitly be a valid\ndirect Lucide specifier. Unknown or malformed authored icons fall back once to that default; an\nexplicitly configured unresolved plain registry default still renders no icon.\n",
)
replaceOnce(
  ".github/instructions/architecture.instructions.md",
  "Icons are inert, `aria-hidden`, non-interactive content with non-focusable SVG. Custom components\nmust not introduce links, controls, focusable descendants, or accessible-name noise. Each card/list\nrow has one whole-panel anchor.\n",
  "Icons are inert, `aria-hidden`, non-interactive content with non-focusable SVG. Direct Lucide icons\nrender as fixed-origin CSS masks backed by a version-pinned `lucide-static` SVG on jsDelivr so they\ninherit the surrounding accent without inserting remote markup into the DOM. Custom components must\nnot introduce links, controls, focusable descendants, or accessible-name noise. Each card/list row\nhas one whole-panel anchor.\n",
)
replaceOnce(
  ".github/instructions/architecture.instructions.md",
  "Do not export internal inventory, navigation-model, normalization, comparator, or resolver types only\nfor tests.\n\n`tsup` produces ESM, declarations, and source maps for the root, `./types`, and `./components`. SCSS\n",
  "Do not export internal inventory, navigation-model, normalization, comparator, or resolver types only\nfor tests.\n\n`src/built-in-icons.json` is the single source of truth for bundled book icons.\n`scripts/generate-icons.mjs` deterministically generates static Lucide imports plus the README list,\nand `npm run icons:check` must fail on drift. `npm run icon:add -- <name> [ExportName]` verifies the\ninstalled pinned Lucide export and runs generation, formatting, package checks, build, and package\nverification.\n\n`tsup` produces ESM, declarations, and source maps for the root, `./types`, and `./components`. SCSS\n",
)

replaceOnce(
  ".github/instructions/verification.instructions.md",
  "- icon alias/built-in precedence, all accepted accent forms, invalid/injection forms, no raw values in\n  hooks, no cross-book appearance leakage, and theme-neutral defaults;",
  "- icon alias/built-in precedence, generated-registry synchronization, direct `lucide:<name>` validation\n  and version-pinned CDN URL construction, all accepted accent forms, invalid/injection forms, no raw\n  values in hooks, no cross-book appearance leakage, and theme-neutral defaults;",
)
replaceOnce(
  ".github/instructions/verification.instructions.md",
  "- validators, declarations, source maps, side effects/resources, dependency graph, notices, CI,\n  package allowlist, and committed `dist/` cover every changed output;",
  "- validators, declarations, source maps, side effects/resources, dependency graph, notices, CI, the\n  generated built-in icon registry/README contract, package allowlist, and committed `dist/` cover\n  every changed output;",
)

console.log("Prepared icon automation release documentation and metadata")
