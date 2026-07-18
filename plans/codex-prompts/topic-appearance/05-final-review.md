# Prompt 05 — Final implementation review

## Scope and compatibility

- [ ] Only root `index` renders `RootIndexPanels`.
- [ ] Existing users with no `panel` frontmatter receive no forced icon/palette.
- [ ] Existing options, counts, tags, sorting, cards/list, and page-type behavior remain compatible.
- [ ] Explorer and normal Quartz folder/file navigation are unchanged.
- [ ] The plugin remains a layout component, not a theme package.

## Metadata and configuration

- [ ] `panel.icon` and `panel.accent` are optional, documented, and safely parsed.
- [ ] Option-provided icon aliases work; unknown input fails softly.
- [ ] Named accents, `theme`, and validated direct colours have deterministic precedence/fallback.
- [ ] No folder name, tag, or title implies an icon or colour.
- [ ] Custom CSS hooks are scoped and documented.

## Inclusive localized interaction

- [ ] Icons create no duplicate/empty accessible names or focus stops.
- [ ] Focus, hover, and keyboard navigation work with custom and fallback accents.
- [ ] Every modified visible string uses Quartz i18n.
- [ ] Two locale outputs or i18n-boundary tests demonstrate localization behavior.

## Quality gate

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes with zero warnings.
- [ ] `npm run format` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run check` passes.
- [ ] Generated `dist/` changes are committed only when repository policy requires them.

## Final response format

Report the exact changed files, final frontmatter/config API and precedence, Quartz localization strategy actually used, commands/results, and remaining compatibility limitations.