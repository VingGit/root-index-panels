from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    source = target.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one replacement target, found {count}")
    target.write_text(source.replace(old, new), encoding="utf-8")


replace_once(
    "src/components/styles/sidebar.scss",
    ".rip-sidebar-switcher-menu {\n  position: absolute;",
    ".rip-sidebar-switcher-menu {\n  --rip-sidebar-accent: var(--secondary);\n\n  position: absolute;",
)

replace_once(
    "test/sidebar-style.test.ts",
    """    expect(styleSource).toMatch(
      /\\.rip-sidebar-switcher-menu\\s*\\{[\\s\\S]*?position:\\s*absolute;[\\s\\S]*?z-index:\\s*20;[\\s\\S]*?top:\\s*calc\\(100% \\+ 0\\.35rem\\);[\\s\\S]*?inset-inline:\\s*0;[\\s\\S]*?overflow:\\s*hidden;[\\s\\S]*?background:\\s*var\\(--light\\);[\\s\\S]*?box-shadow:/,
    )
""",
    """    expect(styleSource).toMatch(
      /\\.rip-sidebar-switcher-menu\\s*\\{[\\s\\S]*?position:\\s*absolute;[\\s\\S]*?z-index:\\s*20;[\\s\\S]*?top:\\s*calc\\(100% \\+ 0\\.35rem\\);[\\s\\S]*?inset-inline:\\s*0;[\\s\\S]*?overflow:\\s*hidden;[\\s\\S]*?background:\\s*var\\(--light\\);[\\s\\S]*?box-shadow:/,
    )
    expect(styleSource).toMatch(
      /\\.rip-sidebar-switcher-menu\\s*\\{[\\s\\S]*?--rip-sidebar-accent:\\s*var\\(--secondary\\);/,
    )
""",
)

replace_once(
    ".github/instructions/architecture.instructions.md",
    """Current-state backgrounds and rails must be anchored to the interactive row itself; broad descendant
state selectors must not tint a containing folder or the full sidebar tree.
""",
    """Current-state backgrounds and rails must be anchored to the interactive row itself; broad descendant
state selectors must not tint a containing folder or the full sidebar tree. The switcher menu resets
its inherited accent to the host `--secondary` token, after which each book entry may apply its own
validated accent. Root and theme-default entries must never inherit the selected book's custom accent.
""",
)

replace_once(
    ".github/instructions/verification.instructions.md",
    """Switcher popup containment, print, forced colors, reduced motion, and coarse pointers. Freeze the card radial
""",
    """Switcher popup containment, per-entry accent isolation, print, forced colors, reduced motion, and coarse
pointers. The switcher menu must reset the selected book's inherited custom accent while preserving
book-specific overrides. Freeze the card radial
""",
)

replace_once(
    "CHANGELOG.md",
    """### Removed

- Remove the bottom return-to-library action and the redundant latest-preview explanatory sentence.
""",
    """### Fixed

- Prevent the selected book's custom accent from recoloring root and theme-default entries in the book
  switcher; each entry now uses its own accent or the host theme color.

### Removed

- Remove the bottom return-to-library action and the redundant latest-preview explanatory sentence.
""",
)

replace_once(
    "README.md",
    """Built-in icons:

```text
book-open  coffee  terminal  container  layers  code-2  network
git-branch  database  shield  cpu  globe  file-code-2
```

An accent can be:
""",
    """Built-in icons:

```text
book-open  coffee  terminal  container  layers  code-2  network
git-branch  database  shield  cpu  globe  file-code-2
```

### Adding another built-in icon

The bundled book icons come from the [Lucide icon library](https://lucide.dev/icons/) and are
imported through the pinned `lucide-preact` dependency. A Lucide icon name cannot be used directly in
frontmatter until that icon has been registered by this plugin.

To add another built-in choice:

1. Find the icon on Lucide and note its exported component name, such as `BookCopy`.
2. Choose a lowercase kebab-case frontmatter alias, such as `book-copy`.
3. In `src/icons.ts`, import the component from `lucide-preact`, add the alias to `BuiltInIconName`,
   and add `\"book-copy\": adaptLucideIcon(BookCopy)` to `builtInIcons`.
4. Add the alias to the built-in list above and update the icon-resolution tests.
5. Run `npm run check`, `npm run build`, `npm run verify:dist`, and `npm run verify:package`, then
   update the plugin installation in Quartz.

The new icon can then be selected on a book index:

```yaml
panel:
  icon: book-copy
```

An accent can be:
""",
)

replace_once(
    "README.md",
    """3. authored Markdown from `content/index.md`, followed by a contextual return-to-library link; and
4. the complete card or list library with reader-controlled sorting.
""",
    """3. authored Markdown from `content/index.md`; and
4. the complete card or list library with reader-controlled sorting.
""",
)
