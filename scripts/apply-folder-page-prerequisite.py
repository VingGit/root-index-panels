from pathlib import Path


FOLDER_PAGE_SOURCE = "github:quartz-community/folder-page"


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    source = target.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one replacement target, found {count}")
    target.write_text(source.replace(old, new), encoding="utf-8")


replace_once(
    "package.json",
    '    "dependencies": [],',
    f'    "dependencies": ["{FOLDER_PAGE_SOURCE}"],',
)

replace_once(
    "src/build/validate-manifest.ts",
    'import path from "path"\n',
    'import path from "path"\n\nconst REQUIRED_PLUGIN_DEPENDENCIES = ["github:quartz-community/folder-page"] as const\n',
)
replace_once(
    "src/build/validate-manifest.ts",
    '  if (quartz.version !== pkg.version) {\n    errors.push("quartz.version must equal package.version")\n  }\n\n  if (!isRecord(quartz.components)) {',
    '''  if (quartz.version !== pkg.version) {
    errors.push("quartz.version must equal package.version")
  }

  if (
    !Array.isArray(quartz.dependencies) ||
    quartz.dependencies.length !== REQUIRED_PLUGIN_DEPENDENCIES.length ||
    quartz.dependencies.some(
      (dependency, index) => dependency !== REQUIRED_PLUGIN_DEPENDENCIES[index],
    )
  ) {
    errors.push(
      `quartz.dependencies must equal ${JSON.stringify(REQUIRED_PLUGIN_DEPENDENCIES)}`,
    )
  }

  if (!isRecord(quartz.components)) {''',
)

replace_once(
    "test/locales-page-type-manifest.test.tsx",
    '    expect(manifest.category).toEqual(expect.arrayContaining(["pageType", "component"]))\n    expect(Object.keys(manifest.components)).toEqual(["RootIndexSidebar"])',
    '''    expect(manifest.category).toEqual(expect.arrayContaining(["pageType", "component"]))
    expect(manifest.dependencies).toEqual(["github:quartz-community/folder-page"])
    expect(Object.keys(manifest.components)).toEqual(["RootIndexSidebar"])''',
)

replace_once(
    "scripts/check-packed-package.mjs",
    '  fs.renameSync(path.join(extractionRoot, "package"), installedPackage)\n\n  junction(path.join(packageRoot, "node_modules", "preact"), path.join(modulesRoot, "preact"))',
    '''  fs.renameSync(path.join(extractionRoot, "package"), installedPackage)

  const packedPackageJson = JSON.parse(
    fs.readFileSync(path.join(installedPackage, "package.json"), "utf8"),
  )
  const expectedPluginDependencies = ["github:quartz-community/folder-page"]
  if (
    JSON.stringify(packedPackageJson.quartz?.dependencies) !==
    JSON.stringify(expectedPluginDependencies)
  ) {
    throw new Error(
      `packed manifest dependencies must equal ${JSON.stringify(expectedPluginDependencies)}`,
    )
  }

  junction(path.join(packageRoot, "node_modules", "preact"), path.join(modulesRoot, "preact"))''',
)

replace_once(
    "test/integration/parent-build.mjs",
    "function pluginEntries(rootSource, rootOptions) {\n  return [",
    "function pluginEntries(rootSource, rootOptions, includeFolderPage = true) {\n  const entries = [",
)
replace_once(
    "test/integration/parent-build.mjs",
    '''  ]
}

function configuration({ locale, enableSPA }) {''',
    '''  ]

  return includeFolderPage
    ? entries
    : entries.filter((entry) => entry.source !== "github:quartz-community/folder-page")
}

function configuration({ locale, enableSPA }) {''',
)
replace_once(
    "test/integration/parent-build.mjs",
    "function writeConfig({ locale, enableSPA, rootSource, rootOptions }) {",
    "function writeConfig({ locale, enableSPA, rootSource, rootOptions, includeFolderPage = true }) {",
)
replace_once(
    "test/integration/parent-build.mjs",
    "    plugins: pluginEntries(rootSource, rootOptions),",
    "    plugins: pluginEntries(rootSource, rootOptions, includeFolderPage),",
)
replace_once(
    "test/integration/parent-build.mjs",
    '''  process.stdout.write(`✓ ${label}\n`)
  return result
}

function sourceName(source) {''',
    '''  process.stdout.write(`✓ ${label}\n`)
  return result
}

function runQuartzExpectFailure(args, label, expectedPatterns, timeout = 300_000) {
  const executable = path.join(workspace, "quartz", "bootstrap-cli.mjs")
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 16 * 1024 * 1024,
    timeout,
  })

  if (result.error) {
    throw new Error(`${label} could not run\n${result.error.stack ?? result.error}`)
  }
  if (result.status === 0) {
    throw new Error(
      `${label} unexpectedly succeeded\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }

  const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  for (const pattern of expectedPatterns) {
    assert.match(combinedOutput, pattern, `${label} did not report ${pattern}`)
  }

  process.stdout.write(`✓ ${label}\n`)
  return result
}

function sourceName(source) {''',
)
replace_once(
    "test/integration/parent-build.mjs",
    '''const fixtureFiles = {''',
    '''function assertFolderPageDependencyFailure() {
  const localSource = pluginRoot.replaceAll("\\\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {},
    includeFolderPage: false,
  })
  writeQuartzEntry(false)

  runQuartzExpectFailure(
    [
      "build",
      "--directory",
      "content",
      "--output",
      "public/missing-folder-page",
      "--baseDir",
      BASE_PATH,
      "--concurrency",
      "1",
    ],
    "missing FolderPage dependency rejected",
    [
      /requires "folder-page"/,
      /npx quartz plugin add github:quartz-community\\/folder-page/,
      /Plugin dependency validation failed/,
    ],
  )
}

const fixtureFiles = {''',
)
replace_once(
    "test/integration/parent-build.mjs",
    '''  exerciseFreshLocalInstall()
  writeFixture()

  buildVariant({''',
    '''  exerciseFreshLocalInstall()
  writeFixture()
  assertFolderPageDependencyFailure()

  buildVariant({''',
)

replace_once(
    "README.md",
    '''Your Quartz site must contain `content/index.md`.

A first-level directory becomes a book when it contains at least one listed Markdown page and has a
landing route. The landing route can be either:

- a physical `content/<book>/index.md`; or
- `<book>/index` generated by Quartz FolderPage.

Nested folders may use the same model. When a nested folder has an `index` route, its sidebar row
opens that landing page while the index note stays hidden from the visible navigation tree.

If FolderPage is disabled, add a physical `index.md` to every book or nested folder that needs a
landing page. Disabling FolderPage does not disable ordinary note pages.
''',
    '''Your Quartz site must:

- contain `content/index.md`; and
- have `github:quartz-community/folder-page` installed and enabled.

FolderPage is a required Quartz-plugin prerequisite. Quartz ContentPage intentionally excludes every
slug ending in `/index`; FolderPage is the Page Type that emits book and nested-folder landing pages.
A physical `content/<book>/index.md` supplies authored content and book metadata, but it still needs
FolderPage to become a published landing page. When no physical index exists, FolderPage may generate
the logical `<book>/index` route from the folder's listed contents.

A first-level directory becomes a book when it contains at least one listed Markdown page and has a
FolderPage-backed landing route. Nested folders use the same emitter. Their `index` notes remain hidden
from the visible navigation tree while the folder row opens the emitted landing page.
''',
)
replace_once(
    "README.md",
    '''```bash
npx quartz plugin add github:VingGit/root-index-panels
npx quartz plugin enable root-index-panels
```

The installer adds one component, `RootIndexSidebar`, to the left layout at priority `40`. The root
page body is supplied separately by the plugin's Page Type; do not add `RootIndexPanels` to a layout
slot.
''',
    '''```bash
npx quartz plugin add github:quartz-community/folder-page
npx quartz plugin enable folder-page
npx quartz plugin add github:VingGit/root-index-panels
npx quartz plugin enable root-index-panels
```

The root-index-panels manifest declares FolderPage as a dependency. Quartz stops configuration loading
and prints the required `plugin add` command when FolderPage is absent. Quartz currently emits only a
warning when a configured dependency is disabled, so keep the FolderPage entry explicitly enabled.

The installer adds one component, `RootIndexSidebar`, to the left layout at priority `40`. The root
page body is supplied separately by the plugin's Page Type; do not add `RootIndexPanels` to a layout
slot.
''',
)
replace_once(
    "README.md",
    '''plugins:
  - source: github:VingGit/root-index-panels
    enabled: true
''',
    '''plugins:
  - source: github:quartz-community/folder-page
    enabled: true

  - source: github:VingGit/root-index-panels
    enabled: true
''',
)
replace_once(
    "README.md",
    '''## FolderPage and hosting diagnostics

FolderPage is an optional provider of folder landing routes; it is not an ordinary-page emitter for
this plugin. With FolderPage disabled:

- physical `index.md` files continue to provide book and nested-folder landing routes;
- ordinary notes should still be generated; and
- only folders without a physical index should lose their generated landing page.

If every non-root URL returns 404, inspect the generated Pages artifact first. If the expected
''',
    '''## FolderPage prerequisite and hosting diagnostics

FolderPage is required for every book and nested-folder landing route, including routes backed by a
physical `index.md`. The ordinary ContentPage plugin deliberately does not emit `/index` slugs. Do not
disable or remove FolderPage while root-index-panels is enabled.

A missing FolderPage configuration entry is rejected by Quartz dependency validation. A configured but
disabled FolderPage currently produces a Quartz warning rather than a hard failure and can leave the
library pointing to landing pages that were never emitted.

If every non-root URL returns 404, inspect the generated Pages artifact first. If the expected
''',
)

replace_once(
    "CHANGELOG.md",
    '''### Changed

- Rename the primary root action''',
    '''### Changed

- Declare `github:quartz-community/folder-page` as a required Quartz-plugin prerequisite and reject
  builds where its configuration entry is missing.
- Rename the primary root action''',
)

replace_once(
    ".github/instructions/architecture.instructions.md",
    '''The manifest retains `pageType` and `component` categories but declares exactly one component:
`RootIndexSidebar`, with `defaultPosition: "left"` and `defaultPriority: 40`. A fresh CLI add must
create one left-layout declaration. `RootIndexPanels` remains exported but absent from component
discovery so the installer cannot create a second body.
''',
    '''The manifest retains `pageType` and `component` categories but declares exactly one component:
`RootIndexSidebar`, with `defaultPosition: "left"` and `defaultPriority: 40`. It declares exactly
`github:quartz-community/folder-page` in `quartz.dependencies`. A fresh CLI add must create one
left-layout declaration. `RootIndexPanels` remains exported but absent from component discovery so the
installer cannot create a second body.
''',
)
replace_once(
    ".github/instructions/architecture.instructions.md",
    '''3. A listed physical or ordinary generated FolderPage `<segment>/index` may prove a destination.
   Canvas/Bases-provenance records cannot prove it.
''',
    '''3. A listed physical or FolderPage-generated `<segment>/index` may prove the logical destination.
   The required FolderPage plugin emits both physical and generated `/index` routes;
   Canvas/Bases-provenance records cannot prove a destination.
''',
)
replace_once(
    ".github/instructions/architecture.instructions.md",
    '''FolderPage is an optional provider of folder/index destinations, not a dependency of the root-only
Page Type or ordinary content emitter. With FolderPage disabled, physical `index.md` files continue
to provide landing routes and ordinary notes must still build. A site-wide non-root 404 indicates a
host emitter, artifact, or base-URL problem rather than intended plugin coupling.
''',
    '''FolderPage is a required Quartz-plugin prerequisite. Quartz ContentPage excludes every slug ending
in `/index`; FolderPage emits book and nested-folder routes whether their source is a physical
`index.md` or a generated virtual page. The manifest dependency source is exactly
`github:quartz-community/folder-page`. Missing configuration must fail Quartz dependency validation;
a disabled entry is unsupported even if the current host reports only a warning.
''',
)

replace_once(
    ".github/instructions/verification.instructions.md",
    '''- FolderPage absence with physical indexes versus folders that genuinely lack a destination.
''',
    '''- required FolderPage-backed destinations and negative dependency validation when its config entry
  is absent.
''',
)
replace_once(
    ".github/instructions/verification.instructions.md",
    '''- sidebar metadata/version/default left position/priority and boolean `replaceExplorer` schema/default
  are aligned;
''',
    '''- sidebar metadata/version/default left position/priority and boolean `replaceExplorer` schema/default
  are aligned;
- `packageJson.quartz.dependencies` is exactly
  `["github:quartz-community/folder-page"]` in source and the packed artifact;
''',
)
replace_once(
    ".github/instructions/verification.instructions.md",
    '''- FolderPage enabled and disabled, with physical-index controls; and
''',
    '''- FolderPage enabled for physical and generated indexes, plus a missing-dependency build that fails
  with the exact installation command; and
''',
)
replace_once(
    ".github/instructions/verification.instructions.md",
    '''5. verify that disabling FolderPage removes only generated folder landing routes when physical
   indexes are absent.

A root-only Page Type cannot explain existing ordinary `.html` files becoming unreachable under an
inconsistent public base path.
''',
    '''5. verify that FolderPage is configured and enabled before interpreting missing `/index` routes as a
   hosting failure.

FolderPage emits physical and generated folder indexes. The ordinary ContentPage emitter continues to
own non-index notes, while a root-only Page Type cannot explain already-generated ordinary `.html`
files becoming unreachable under an inconsistent public base path.
''',
)

replace_once(
    ".github/reference/sidebar-root-library-rework.md",
    '''## FolderPage independence

`RootIndexPanelsPage` matches only the physical root `index` page. It does not emit ordinary note or
folder routes and therefore cannot replace Quartz's normal content emitters. FolderPage is needed only
when a folder has no physical `index.md` but still needs a generated folder landing route. Disabling
FolderPage requires physical `index.md` files for every book or nested folder that should be
navigable as a landing page; it should not remove ordinary note pages.

If every non-root URL returns 404 after disabling FolderPage, inspect the built `public/` artifact for
those HTML files and verify the Quartz content-page emitter and GitLab Pages base URL. That symptom is
broader than this plugin's root-only Page Type matcher and is not an intended coupling.
''',
    '''## FolderPage prerequisite

`RootIndexPanelsPage` matches only the physical site-root `index` page. Quartz ContentPage excludes
all other `/index` slugs, so `github:quartz-community/folder-page` is required to emit every book and
nested-folder landing page. This remains true when a physical `index.md` provides the page content and
metadata. The plugin manifest declares that exact dependency source; sites must configure and enable
it before root-index-panels.

Ordinary non-index notes remain ContentPage routes. When diagnosing 404s, distinguish a missing or
disabled FolderPage prerequisite from a deployment-base mismatch by inspecting the built `public/`
artifact.
''',
)
