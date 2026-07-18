# Prompt 04 — Document the writer and theme-author experience

## Objective

Update public documentation so writers, Quartz site owners, and theme authors understand the feature without treating this plugin as a visual theme.

## Required updates

1. **README / Directory Metadata**
   - Add complete `panel.icon` and `panel.accent` YAML.
   - State that `panel` is optional and omission preserves the site theme.
   - List supported built-in icon names, or link to an in-repo versioned list that guarantees the names resolve.
   - Explain aliases and unknown-icon fallback.

2. **README / Options**
   - Document `defaultIcon`, `icons`, `defaultAccent`, and `accents`: types, defaults, precedence, and a typed `quartz.layout.ts` example.
   - Show `theme` and `var(--tertiary)`. Recommend named theme-token accents for light/dark support instead of literal hex values.

3. **README / Theme integration**
   - State that the plugin owns layout and semantic hooks, not a palette.
   - Document the intentionally stable scoped hooks/classes/custom property and fallback behavior.
   - Explain that Quartz theme packages may override those hooks.

4. **Translations**
   - State that component labels follow Quartz's configured locale and identify the actual API/version expectation.

5. **CHANGELOG and examples**
   - Add an Unreleased entry for optional metadata, aliases, and localization.
   - Follow repository release policy before changing a version.
   - Update `EXAMPLES.md` only if it matches existing documentation patterns; avoid duplicate tables.

## Acceptance criteria

A writer can copy one YAML block; a non-TypeScript writer never needs to create an icon component; a site owner can reuse aliases/accents; docs explicitly reject a default "Linux = terminal/green" mapping; and docs distinguish theme defaults from author overrides.
