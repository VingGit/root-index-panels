import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync, spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { setTimeout as delay } from "node:timers/promises"

const integrationDir = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(integrationDir, "..", "..")
const configuredHost = process.env.RIP_QUARTZ_ROOT?.trim()
const defaultHost = path.resolve(pluginRoot, "..", "quartz-for-gitlab")
const quartzRoot = path.resolve(configuredHost || defaultHost)
const quartzScript = path.join(quartzRoot, "quartz", "bootstrap-cli.mjs")
const PLUGIN_NAME = "root-index-panels"
const ROOT_SIDEBAR_LAYOUT = { position: "left", priority: 40 }
const BASE_PATH = "/notes/"
const DETAIL_ICON_ALIAS = "custom-book"
const ROOT_LIBRARY_ROUTE_TEST_ID = "rip-library-route"

const processBaseEnv = { ...process.env }
delete processBaseEnv.RIP_QUARTZ_ROOT

if (!fs.existsSync(quartzScript)) {
  throw new Error(
    `Quartz integration root not found at ${quartzRoot}. Set RIP_QUARTZ_ROOT to a Quartz 5 checkout with installed dependencies.`,
  )
}

if (fs.realpathSync(quartzRoot) === fs.realpathSync(pluginRoot)) {
  throw new Error("RIP_QUARTZ_ROOT must point to a parent Quartz checkout, not this plugin repository")
}

const fixtureFiles = {
  "content/index.md": `---
title: Integration Root
---
# ROOT BODY SENTINEL
`,
  "content/java/index.md": `---
title: Java
panel:
  icon: terminal
  accent: ocean
---
# JAVA INDEX SENTINEL
`,
  "content/java/collections.md": `---
title: Collections
---
# Collections
`,
  "content/java/nested/index.md": `---
title: Nested Java
---
# NESTED INDEX SENTINEL
`,
  "content/java/nested/generics.md": `---
title: Generics
---
# Generics
`,
  "content/git/index.md": `---
title: Git
panel:
  icon: ${DETAIL_ICON_ALIAS}
  accent: warning
---
# GIT INDEX SENTINEL
`,
  "content/git/branches.md": `---
title: Branches
---
# Branches
`,
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function communityPlugin(name) {
  return {
    source:
      name === "folder-page"
        ? "@quartz-community/folder-page"
        : `github:quartz-community/${name}`,
    enabled: true,
    options: {},
    order: 50,
  }
}

function writeFixtureWorkspace(workspace) {
  for (const [relativePath, content] of Object.entries(fixtureFiles)) {
    const destination = path.join(workspace, relativePath)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, content)
  }
}

function writeConfig({
  locale = "en-US",
  enableSPA = false,
  rootSource,
  rootOptions = {},
  rootEnabled = true,
  includeFolderPage = true,
  includeExplorer = true,
  rootLayout = ROOT_SIDEBAR_LAYOUT,
}) {
  const plugins = [
    communityPlugin("created-modified-date"),
    communityPlugin("obsidian-flavored-markdown"),
    communityPlugin("github-flavored-markdown"),
    communityPlugin("crawl-links"),
    communityPlugin("description"),
    communityPlugin("remove-draft"),
    communityPlugin("explicit-publish"),
    communityPlugin("alias-redirects"),
    communityPlugin("content-index"),
    communityPlugin("favicon"),
    communityPlugin("content-page"),
  ]

  if (includeFolderPage) plugins.push(communityPlugin("folder-page"))
  plugins.push(communityPlugin("tag-page"))
  if (includeExplorer) plugins.push(communityPlugin("explorer"))
  plugins.push(
    communityPlugin("graph"),
    communityPlugin("search"),
    communityPlugin("backlinks"),
    communityPlugin("article-title"),
    communityPlugin("content-meta"),
    communityPlugin("tag-list"),
    communityPlugin("page-title"),
    communityPlugin("darkmode"),
    communityPlugin("reader-mode"),
    communityPlugin("breadcrumbs"),
    communityPlugin("comments"),
    communityPlugin("footer"),
    communityPlugin("recent-notes"),
    communityPlugin("spacer"),
  )

  plugins.push({
    source: rootSource,
    enabled: rootEnabled,
    options: rootOptions,
    order: 50,
    layout: rootLayout,
  })

  const config = {
    configuration: {
      pageTitle: "Root Index Panels Integration",
      pageTitleSuffix: "",
      enableSPA,
      enablePopovers: false,
      analytics: null,
      locale,
      baseUrl: "example.com",
      ignorePatterns: ["private", "templates", ".obsidian"],
      defaultDateType: "modified",
      theme: {
        fontOrigin: "local",
        cdnCaching: false,
        typography: {
          header: "Schibsted Grotesk",
          body: "Source Sans Pro",
          code: "IBM Plex Mono",
        },
        colors: {
          lightMode: {
            light: "#faf8f8",
            lightgray: "#e5e5e5",
            gray: "#b8b8b8",
            darkgray: "#4e4e4e",
            dark: "#2b2b2b",
            secondary: "#284b63",
            tertiary: "#84a59d",
            highlight: "rgba(143, 159, 169, 0.15)",
            textHighlight: "#fff23688",
          },
          darkMode: {
            light: "#161618",
            lightgray: "#393639",
            gray: "#646464",
            darkgray: "#d4d4d4",
            dark: "#ebebec",
            secondary: "#7b97aa",
            tertiary: "#84a59d",
            highlight: "rgba(143, 159, 169, 0.15)",
            textHighlight: "#b3aa0288",
          },
        },
      },
    },
    plugins,
  }

  fs.writeFileSync(path.join(workspace, "quartz.config.yaml"), yamlStringify(config))
}

function yamlStringify(value, indent = 0) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          const lines = yamlStringify(item, indent + 2).trimEnd().split("\n")
          return `${" ".repeat(indent)}- ${lines[0].trimStart()}\n${lines
            .slice(1)
            .map((line) => `${" ".repeat(2)}${line}`)
            .join("\n")}`
        }
        return `${" ".repeat(indent)}- ${JSON.stringify(item)}`
      })
      .join("\n")
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([key, item]) => {
        if (typeof item === "object" && item !== null) {
          return `${" ".repeat(indent)}${key}:\n${yamlStringify(item, indent + 2)}`
        }
        return `${" ".repeat(indent)}${key}: ${JSON.stringify(item)}`
      })
      .join("\n")
  }

  return `${" ".repeat(indent)}${JSON.stringify(value)}`
}

function writeQuartzEntry(includeRoot = true) {
  const rootImport = includeRoot
    ? `import { RootIndexPanels, RootIndexPanelsPage, RootIndexSidebar } from "./.quartz/plugins"\n`
    : ""
  const rootTransform = includeRoot ? "RootIndexPanels()" : ""
  const rootEmitter = includeRoot ? "RootIndexPanelsPage()" : ""
  const rootSidebar = includeRoot ? "RootIndexSidebar()" : ""

  fs.writeFileSync(
    path.join(workspace, "quartz.ts"),
    `import { QuartzConfig } from "./quartz/cfg"\nimport * as Plugin from "./quartz/plugins"\n${rootImport}\nexport default {\n  configuration: {\n    pageTitle: "Root Index Panels Integration",\n    pageTitleSuffix: "",\n    enableSPA: false,\n    enablePopovers: false,\n    analytics: null,\n    locale: "en-US",\n    baseUrl: "example.com",\n    ignorePatterns: ["private", "templates", ".obsidian"],\n    defaultDateType: "modified",\n    theme: {\n      fontOrigin: "local",\n      cdnCaching: false,\n      typography: { header: "Schibsted Grotesk", body: "Source Sans Pro", code: "IBM Plex Mono" },\n      colors: {\n        lightMode: { light: "#faf8f8", lightgray: "#e5e5e5", gray: "#b8b8b8", darkgray: "#4e4e4e", dark: "#2b2b2b", secondary: "#284b63", tertiary: "#84a59d", highlight: "rgba(143, 159, 169, 0.15)", textHighlight: "#fff23688" },\n        darkMode: { light: "#161618", lightgray: "#393639", gray: "#646464", darkgray: "#d4d4d4", dark: "#ebebec", secondary: "#7b97aa", tertiary: "#84a59d", highlight: "rgba(143, 159, 169, 0.15)", textHighlight: "#b3aa0288" },\n      },\n    },\n  },\n  plugins: {\n    transformers: [Plugin.CreatedModifiedDate(), Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }), Plugin.GitHubFlavoredMarkdown(), Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }), Plugin.Description(), ${rootTransform}],\n    filters: [Plugin.RemoveDraft(), Plugin.ExplicitPublish()],\n    emitters: [Plugin.AliasRedirects(), Plugin.ContentPage(), Plugin.FolderPage(), Plugin.TagPage(), Plugin.ContentIndex({ enableSiteMap: true, enableRSS: true }), Plugin.Favicon(), ${rootEmitter}],\n  },\n  layout: {\n    head: Plugin.Head(),\n    header: [],\n    afterBody: [],\n    pageBody: Plugin.Body(),\n    left: [Plugin.PageTitle(), Plugin.MobileOnly(Plugin.Spacer()), Plugin.Search(), Plugin.Darkmode(), Plugin.DesktopOnly(${rootSidebar || "Plugin.Explorer()"})],\n    right: [Plugin.Graph(), Plugin.DesktopOnly(Plugin.TableOfContents())],\n    footer: Plugin.Footer({ links: {} }),\n  },\n} satisfies QuartzConfig\n`,
  )
}

function copyHost(workspace) {
  for (const name of ["quartz", "package.json", "package-lock.json", "tsconfig.json"]) {
    const source = path.join(quartzRoot, name)
    const target = path.join(workspace, name)
    fs.cpSync(source, target, { recursive: true })
  }

  const modulesTarget = path.join(workspace, "node_modules")
  fs.symlinkSync(path.join(quartzRoot, "node_modules"), modulesTarget, "dir")

  const cacheTarget = path.join(workspace, ".quartz")
  fs.cpSync(path.join(quartzRoot, ".quartz"), cacheTarget, { recursive: true })
}

function assertPluginPackage() {
  assert.equal(
    readJson(path.join(pluginRoot, "package.json")).name,
    "@vinggit/root-index-panels",
  )
  assert.ok(fs.existsSync(path.join(pluginRoot, "dist", "index.js")))
}

function runQuartz(args, options = {}) {
  return execFileSync(process.execPath, [quartzScript, ...args], {
    cwd: workspace,
    env: processBaseEnv,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  })
}

function runQuartzExpectFailure(args, label, patterns) {
  let output = ""
  assert.throws(
    () => runQuartz(args),
    (error) => {
      output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`
      return true
    },
    `${label} should fail`,
  )

  for (const pattern of patterns) {
    assert.match(output, pattern, `${label} did not report ${pattern}`)
  }
}

function resetPluginCache() {
  const pluginDir = path.join(workspace, ".quartz", "plugins", PLUGIN_NAME)
  fs.rmSync(pluginDir, { recursive: true, force: true })
  const lockPath = path.join(workspace, "quartz.lock.json")
  if (fs.existsSync(lockPath)) {
    const lock = readJson(lockPath)
    delete lock.plugins?.[PLUGIN_NAME]
    fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
  }
}

function assertFreshPluginRemove() {
  resetPluginCache()
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: pluginRoot.replaceAll("\\", "/"),
    rootOptions: {},
    rootEnabled: false,
  })

  execFileSync(process.execPath, [quartzScript, "plugin", "remove", PLUGIN_NAME], {
    cwd: workspace,
    env: processBaseEnv,
    stdio: "pipe",
  })

  const config = fs.readFileSync(path.join(workspace, "quartz.config.yaml"), "utf8")
  assert.doesNotMatch(config, new RegExp(`${PLUGIN_NAME}(?:["']|\\s|$)`))
  console.log("✓ fresh plugin remove")
}

function assertFreshPluginAdd() {
  resetPluginCache()
  const config = readJson(path.join(pluginRoot, "package.json"))
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {},
    rootEnabled: false,
  })

  const yamlPath = path.join(workspace, "quartz.config.yaml")
  let text = fs.readFileSync(yamlPath, "utf8")
  const marker = `  - source: ${JSON.stringify(localSource)}\n`
  const start = text.indexOf(marker)
  assert.notEqual(start, -1, "fresh add fixture must contain root plugin config")
  const next = text.indexOf("  - source:", start + marker.length)
  text = text.slice(0, start) + (next >= 0 ? text.slice(next) : "")
  fs.writeFileSync(yamlPath, text)

  execFileSync(process.execPath, [quartzScript, "plugin", "add", localSource], {
    cwd: workspace,
    env: processBaseEnv,
    stdio: "pipe",
  })

  const installed = readJson(path.join(workspace, "quartz.config.yaml"))
  const rootEntries = installed.plugins.filter((entry) => entry.source === localSource)
  assert.equal(rootEntries.length, 1, "fresh add must create exactly one root plugin entry")
  assert.equal(rootEntries[0].enabled, false, "manifest defaultEnabled=false must survive fresh add")
  assert.equal(
    rootEntries[0].options.replaceExplorer,
    true,
    "fresh add must preserve the sidebar's Explorer replacement default",
  )
  assert.deepEqual(
    rootEntries[0].layout,
    ROOT_SIDEBAR_LAYOUT,
    "fresh add must generate exactly one RootIndexSidebar left layout stanza",
  )

  const lock = readJson(path.join(workspace, "quartz.lock.json"))
  assert.equal(
    lock.plugins[PLUGIN_NAME]?.commit,
    "local",
    "fresh add must record a local lock entry",
  )
  assert.equal(
    fs.realpathSync(lock.plugins[PLUGIN_NAME].resolved),
    fs.realpathSync(pluginRoot),
    "local lock entry must resolve to the working tree",
  )
  assert.equal(
    fs.realpathSync(path.join(workspace, ".quartz", "plugins", PLUGIN_NAME)),
    fs.realpathSync(pluginRoot),
    "installed cache must point at the local working tree",
  )
  assertRootSidebarLayoutConfig(false, "fresh local add")
}

function assertFolderPageDependencyFailure() {
  const localSource = pluginRoot.replaceAll("\\", "/")
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
      /requires "@quartz-community\/folder-page"/,
      /npx quartz plugin add @quartz-community\/folder-page/,
      /Plugin dependency validation failed/,
    ],
  )
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
}

function writeFile(relativePath, content) {
  const destination = path.join(workspace, relativePath)
  ensureDir(destination)
  fs.writeFileSync(destination, content)
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
}

function pagePath(outputDir, route) {
  if (route === "/") return path.join(outputDir, "index.html")
  return path.join(outputDir, route.replace(/^\//, ""), "index.html")
}

function pageText(outputDir, route) {
  return fs.readFileSync(pagePath(outputDir, route), "utf8")
}

function assertContains(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `${label}: expected ${JSON.stringify(needle)}`)
}

function assertNotContains(haystack, needle, label) {
  assert.ok(!haystack.includes(needle), `${label}: did not expect ${JSON.stringify(needle)}`)
}

function assertRootSidebarLayoutConfig(replaceExplorer, label) {
  const configText = fs.readFileSync(path.join(workspace, "quartz.config.yaml"), "utf8")
  const rootSource = pluginRoot.replaceAll("\\", "/")
  const marker = `  - source: ${JSON.stringify(rootSource)}\n`
  const start = configText.indexOf(marker)
  assert.notEqual(start, -1, `${label}: root plugin config missing`)
  const next = configText.indexOf("  - source:", start + marker.length)
  const entry = configText.slice(start, next >= 0 ? next : undefined)
  assertContains(entry, "    layout:\n      position: \"left\"\n      priority: 40", `${label}: sidebar layout`)
  assertContains(entry, `replaceExplorer: ${replaceExplorer}`, `${label}: replaceExplorer option`)
}

function writeRootConfig(options = {}) {
  const rootSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: options.locale ?? "en-US",
    enableSPA: options.enableSPA ?? false,
    rootSource,
    rootOptions: {
      layout: options.layout ?? "cards",
      showDescription: options.showDescription ?? true,
      showDocCount: options.showDocCount ?? true,
      showTags: options.showTags ?? true,
      tagCount: options.tagCount ?? 3,
      sort: options.sort ?? "alphabetical",
      excludeDirs: options.excludeDirs ?? [],
      descriptionFallback: options.descriptionFallback ?? "",
      defaultIcon: options.defaultIcon ?? "book-open",
      defaultAccent: options.defaultAccent ?? "theme",
      accents: options.accents ?? {
        ocean: "var(--secondary)",
        warning: "#b45309",
      },
      replaceExplorer: options.replaceExplorer ?? true,
    },
    rootEnabled: true,
    includeFolderPage: true,
    includeExplorer: true,
  })
  assertRootSidebarLayoutConfig(options.replaceExplorer ?? true, "root config")
}

function addCustomIconRegistration() {
  const configPath = path.join(workspace, "quartz.config.yaml")
  const text = fs.readFileSync(configPath, "utf8")
  const marker = `defaultIcon: "book-open"`
  const replacement = `${marker}\n      icons:\n        ${DETAIL_ICON_ALIAS}: null`
  assert.ok(text.includes(marker), "custom icon fixture marker missing")
  fs.writeFileSync(configPath, text.replace(marker, replacement))
}

function replacePluginIndexWithCustomIcon() {
  const indexPath = path.join(workspace, ".quartz", "plugins", "index.ts")
  const text = fs.readFileSync(indexPath, "utf8")
  const importMarker = `import { componentRegistry } from "../../quartz/components/registry"`
  const injected = `${importMarker}\nimport { h } from "preact"`
  assert.ok(text.includes(importMarker), "plugin index registry import missing")
  const functionMarker = `export const RootIndexPanels = plugins["root-index-panels"].RootIndexPanels`
  assert.ok(text.includes(functionMarker), "RootIndexPanels wrapper marker missing")
  const registration = `\nconst CustomBookIcon = (props = {}) => h("svg", { ...props, "data-custom-book-icon": "yes" }, h("circle", { cx: 12, cy: 12, r: 8 }))\ncomponentRegistry.setOptionOverrides("root-index-panels", { icons: { "${DETAIL_ICON_ALIAS}": CustomBookIcon } })\n`
  fs.writeFileSync(indexPath, text.replace(importMarker, injected).replace(functionMarker, registration + functionMarker))
}

function writeContentIndexTitle(title) {
  const file = path.join(workspace, "content", "index.md")
  const current = fs.readFileSync(file, "utf8")
  fs.writeFileSync(file, current.replace("title: Integration Root", `title: ${title}`))
}

function writeNestedTitle(title) {
  const file = path.join(workspace, "content", "java", "nested", "generics.md")
  const current = fs.readFileSync(file, "utf8")
  fs.writeFileSync(file, current.replace("title: Generics", `title: ${title}`))
}

function writeNestedContent(content) {
  const file = path.join(workspace, "content", "java", "nested", "generics.md")
  fs.writeFileSync(file, content)
}

function ensurePluginInstalled() {
  const localSource = pluginRoot.replaceAll("\\", "/")
  const cacheDir = path.join(workspace, ".quartz", "plugins", PLUGIN_NAME)
  if (fs.existsSync(cacheDir)) return
  execFileSync(process.execPath, [quartzScript, "plugin", "add", localSource], {
    cwd: workspace,
    env: processBaseEnv,
    stdio: "pipe",
  })
}

function installFixture() {
  copyHost(workspace)
  writeFixtureWorkspace(workspace)
  assertPluginPackage()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
}

function build(outputRelative = "public") {
  runQuartz([
    "build",
    "--directory",
    "content",
    "--output",
    outputRelative,
    "--baseDir",
    BASE_PATH,
    "--concurrency",
    "1",
  ])
}

function renderMixedPreact() {
  const script = `
    import { h as hostH } from ${JSON.stringify(path.join(quartzRoot, "node_modules", "preact", "dist", "preact.mjs"))}
    import render from ${JSON.stringify(path.join(quartzRoot, "node_modules", "preact-render-to-string", "dist", "index.mjs"))}
    import { RootIndexPanels } from ${JSON.stringify(path.join(pluginRoot, "dist", "index.js"))}
    const Component = RootIndexPanels({ defaultAccent: "theme" })
    const html = render(hostH(Component, { fileData: { slug: "index" }, allFiles: [] }))
    if (!html.includes("rip-root-index")) throw new Error("mixed Preact render failed")
  `
  execFileSync(process.execPath, ["--input-type=module", "--eval", script], {
    cwd: workspace,
    env: processBaseEnv,
    stdio: "pipe",
  })
  console.log("✓ mixed-Preact built-in render")
}

function normalizePathname(urlValue) {
  const url = new URL(urlValue, "https://example.com")
  return url.pathname.replace(/\/+$/, "") || "/"
}

function assertRootBuild(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, "ROOT BODY SENTINEL", "root authored content")
  assertContains(root, "rip-root-index", "root library wrapper")
  assertContains(root, "data-rip-complete-library", "root complete library")
  assertContains(root, "data-rip-library-sort", "root library sort controls")
  assertContains(root, "JAVA INDEX SENTINEL", "Java authored landing content")
  assertContains(root, "GIT INDEX SENTINEL", "Git authored landing content")
  assertContains(root, "Java", "Java card")
  assertContains(root, "Git", "Git card")
  assertContains(root, "data-rip-book-path=\"java\"", "Java book data")
  assertContains(root, "data-rip-book-path=\"git\"", "Git book data")
  assertContains(root, "data-rip-latest-preview", "latest preview")
  assertContains(root, "data-rip-search-input", "library search")
  assertContains(root, "data-rip-view-toggle", "view toggle")
  assertContains(root, "data-rip-library-view", "view persistence container")
  assertContains(root, "data-rip-path=\"java\"", "Java library item")
  assertContains(root, "data-rip-path=\"git\"", "Git library item")
  assertNotContains(root, "Java/index", "raw authored index route")
}

function assertBookBuild(outputDir) {
  const java = pageText(outputDir, "/java")
  assertContains(java, "JAVA INDEX SENTINEL", "Java authored content")
  assertContains(java, "data-rip-book-switcher", "book switcher")
  assertContains(java, "data-rip-book-list", "book list")
  assertContains(java, "data-rip-book-search", "book search")
  assertContains(java, "data-rip-explorer", "scoped Explorer tree")
  assertContains(java, "data-rip-tree-node", "tree node")
  assertContains(java, "data-rip-folder", "tree folder")
  assertContains(java, "Collections", "Java tree child")
  assertContains(java, "Nested Java", "nested folder label")
  assertNotContains(java, ">Git<", "Git should not appear in Java scoped tree")
}

function assertNestedBuild(outputDir) {
  const nested = pageText(outputDir, "/java/nested")
  assertContains(nested, "NESTED INDEX SENTINEL", "nested authored index")
  assertContains(nested, "Generics", "nested page")
  assertContains(nested, "data-rip-book-switcher", "nested book switcher")
  assertContains(nested, "data-rip-explorer", "nested scoped Explorer")
}

function assertDetailBuild(outputDir) {
  const detail = pageText(outputDir, "/java/nested/generics")
  assertContains(detail, "Generics", "detail page")
  assertContains(detail, "data-rip-book-switcher", "detail book switcher")
  assertContains(detail, "data-rip-explorer", "detail scoped Explorer")
}

function assertBasePathUrls(outputDir) {
  const java = pageText(outputDir, "/java")
  assert.match(java, /href="\/notes\/java\/?"/)
  assert.match(java, /href="\/notes\/git\/?"/)
}

function assertBuiltInIcon(outputDir) {
  const java = pageText(outputDir, "/java")
  assert.match(java, /data-lucide="terminal"/)
}

function assertCustomIcon(outputDir) {
  const git = pageText(outputDir, "/git")
  assert.match(git, /data-custom-book-icon="yes"/)
}

function assertCustomAccent(outputDir) {
  const git = pageText(outputDir, "/git")
  assert.match(git, /--rip-accent:#b45309/)
}

function assertNoExplorerWhenReplacementEnabled(outputDir) {
  const detail = pageText(outputDir, "/java/nested/generics")
  assert.equal(
    (detail.match(/data-rip-explorer/g) ?? []).length,
    1,
    "replaceExplorer=true should leave exactly one Explorer surface",
  )
}

function assertExplorerPresentWhenReplacementDisabled(outputDir) {
  const detail = pageText(outputDir, "/java/nested/generics")
  assert.ok(
    (detail.match(/data-rip-explorer/g) ?? []).length >= 1,
    "replaceExplorer=false should preserve a navigation Explorer",
  )
}

function assertLocale(outputDir, locale) {
  const root = pageText(outputDir, "/")
  assertContains(root, `lang="${locale}"`, "document locale")
}

function assertNoPrivateRoute(outputDir) {
  assert.ok(!fs.existsSync(path.join(outputDir, "private")), "private directory should be filtered")
}

function assertOutputHashChanges(outputDir, route, mutate) {
  const file = pagePath(outputDir, route)
  const before = sha256(file)
  mutate()
  build(path.relative(workspace, outputDir))
  const after = sha256(file)
  assert.notEqual(before, after, `${route} output hash should change after content mutation`)
}

function assertOutputHashStable(outputDir, route, mutate) {
  const file = pagePath(outputDir, route)
  const before = sha256(file)
  mutate()
  build(path.relative(workspace, outputDir))
  const after = sha256(file)
  assert.equal(before, after, `${route} output hash should stay stable after unrelated mutation`)
}

function parseServerUrl(output) {
  const match = output.match(/http:\/\/localhost:(\d+)/)
  if (!match) return null
  return `http://localhost:${match[1]}`
}

async function waitForServer(child, buffer) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const url = parseServerUrl(buffer.value)
    if (url) {
      try {
        const response = await fetch(url)
        if (response.ok) return url
      } catch {}
    }
    if (child.exitCode !== null) {
      throw new Error(`Quartz watch process exited early (${child.exitCode}):\n${buffer.value}`)
    }
    await delay(250)
  }
  throw new Error(`Quartz watch server did not become ready:\n${buffer.value}`)
}

async function waitForText(url, needle) {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(url)
      const text = await response.text()
      if (text.includes(needle)) return text
    } catch {}
    await delay(250)
  }
  throw new Error(`Timed out waiting for ${JSON.stringify(needle)} at ${url}`)
}

async function stopChild(child) {
  if (child.exitCode !== null) return
  child.kill("SIGTERM")
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    delay(5_000).then(() => {
      if (child.exitCode === null) child.kill("SIGKILL")
    }),
  ])
}

async function assertWatchMode() {
  writeRootConfig({ enableSPA: true })
  writeQuartzEntry()
  const buffer = { value: "" }
  const child = spawn(
    process.execPath,
    [
      quartzScript,
      "build",
      "--serve",
      "--directory",
      "content",
      "--output",
      "public-watch",
      "--baseDir",
      BASE_PATH,
      "--concurrency",
      "1",
    ],
    {
      cwd: workspace,
      env: processBaseEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  child.stdout.on("data", (chunk) => {
    buffer.value += chunk.toString()
  })
  child.stderr.on("data", (chunk) => {
    buffer.value += chunk.toString()
  })

  try {
    const server = await waitForServer(child, buffer)
    const rootUrl = `${server}${BASE_PATH}`
    await waitForText(rootUrl, "ROOT BODY SENTINEL")
    writeContentIndexTitle("Integration Root Updated")
    await waitForText(rootUrl, "Integration Root Updated")
    console.log("✓ watch rebuild")
  } finally {
    await stopChild(child)
  }
}

function restoreFixtures() {
  writeFixtureWorkspace(workspace)
}

function assertFileMissing(file, label) {
  assert.ok(!fs.existsSync(file), `${label}: ${file}`)
}

function assertFilePresent(file, label) {
  assert.ok(fs.existsSync(file), `${label}: ${file}`)
}

function assertFileContains(file, needle, label) {
  assertFilePresent(file, label)
  assertContains(fs.readFileSync(file, "utf8"), needle, label)
}

function assertFileNotContains(file, needle, label) {
  assertFilePresent(file, label)
  assertNotContains(fs.readFileSync(file, "utf8"), needle, label)
}

function assertNoDuplicateBookIndexRoutes(outputDir) {
  assertFileMissing(path.join(outputDir, "java", "index", "index.html"), "no duplicate Java /index")
  assertFileMissing(path.join(outputDir, "git", "index", "index.html"), "no duplicate Git /index")
  assertFileMissing(
    path.join(outputDir, "java", "nested", "index", "index.html"),
    "no duplicate nested /index",
  )
}

function assertGeneratedNestedLanding(outputDir) {
  const nestedLanding = path.join(outputDir, "java", "generated", "index.html")
  assertFilePresent(nestedLanding, "generated nested landing")
  assertFileContains(nestedLanding, "Generated Leaf", "generated nested leaf")
}

function addGeneratedNestedFixture() {
  writeFile(
    "content/java/generated/leaf.md",
    `---\ntitle: Generated Leaf\n---\n# GENERATED LEAF SENTINEL\n`,
  )
}

function assertUnlistedSuppression(outputDir) {
  assertFileMissing(path.join(outputDir, "java", "hidden", "index.html"), "unlisted hidden route")
  assertFileNotContains(
    pagePath(outputDir, "/java"),
    "Hidden Page",
    "unlisted hidden page absent from Java tree",
  )
}

function addUnlistedFixture() {
  writeFile(
    "content/java/hidden.md",
    `---\ntitle: Hidden Page\nunlisted: true\n---\n# HIDDEN PAGE SENTINEL\n`,
  )
}

function assertNestedCustomIcon(outputDir) {
  const nested = pageText(outputDir, "/java/nested")
  assertContains(nested, "data-custom-book-icon=\"yes\"", "nested custom icon")
}

function setNestedCustomIcon() {
  const file = path.join(workspace, "content", "java", "nested", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Nested Java\npanel:\n  icon: ${DETAIL_ICON_ALIAS}\n---\n# NESTED INDEX SENTINEL\n`,
  )
}

function assertDirectLucideIcon(outputDir) {
  const java = pageText(outputDir, "/java")
  assertContains(java, 'data-rip-lucide-icon="book-copy"', "direct Lucide icon marker")
  assertContains(
    java,
    "cdn.jsdelivr.net/npm/lucide-static@1.25.0/icons/book-copy.svg",
    "direct Lucide CDN URL",
  )
}

function setJavaDirectLucideIcon() {
  const file = path.join(workspace, "content", "java", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Java\npanel:\n  icon: lucide:book-copy\n  accent: ocean\n---\n# JAVA INDEX SENTINEL\n`,
  )
}

function assertInvalidDirectLucideFallback(outputDir) {
  const java = pageText(outputDir, "/java")
  assertContains(java, 'data-lucide="book-open"', "invalid direct Lucide fallback")
  assertNotContains(java, "data-rip-lucide-icon", "invalid direct Lucide must not render remotely")
}

function setJavaInvalidDirectLucideIcon() {
  const file = path.join(workspace, "content", "java", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Java\npanel:\n  icon: lucide:Book-Copy\n  accent: ocean\n---\n# JAVA INDEX SENTINEL\n`,
  )
}

function assertNewestEditSort(outputDir) {
  const root = pageText(outputDir, "/")
  const gitIndex = root.indexOf('data-rip-path="git"')
  const javaIndex = root.indexOf('data-rip-path="java"')
  assert.ok(gitIndex >= 0 && javaIndex >= 0, "sort fixture book rows must exist")
}

function assertEscaping(outputDir) {
  const root = pageText(outputDir, "/")
  assertNotContains(root, "<script>alert(1)</script>", "frontmatter script tag must be escaped")
  assertContains(root, "&lt;script&gt;alert(1)&lt;/script&gt;", "escaped title")
}

function setEscapingFixture() {
  const file = path.join(workspace, "content", "git", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: "<script>alert(1)</script>"\npanel:\n  icon: ${DETAIL_ICON_ALIAS}\n  accent: warning\n---\n# GIT INDEX SENTINEL\n`,
  )
}

function assertNoOpBuildStable(outputDir) {
  const before = sha256(pagePath(outputDir, "/"))
  build(path.relative(workspace, outputDir))
  const after = sha256(pagePath(outputDir, "/"))
  assert.equal(before, after, "no-op rebuild should be byte-stable for root output")
}

function assertConfigWithoutExplorerReplacement(outputDir) {
  writeRootConfig({ replaceExplorer: false })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertExplorerPresentWhenReplacementDisabled(outputDir)
  console.log("✓ replaceExplorer=false")
}

function assertInvalidConfigFails() {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {
      layout: "invalid",
    },
  })
  writeQuartzEntry()
  runQuartzExpectFailure(
    ["build", "--directory", "content", "--output", "public-invalid", "--baseDir", BASE_PATH],
    "invalid layout rejected",
    [/Invalid option "layout"/, /Expected one of: cards, list/],
  )
  console.log("✓ invalid layout rejected")
}

function assertDisabledDependencyWarns() {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {},
    includeFolderPage: true,
  })
  const configPath = path.join(workspace, "quartz.config.yaml")
  let text = fs.readFileSync(configPath, "utf8")
  const source = 'source: "@quartz-community/folder-page"'
  const start = text.indexOf(source)
  assert.notEqual(start, -1, "FolderPage fixture must exist")
  const enabled = text.indexOf("enabled: true", start)
  assert.notEqual(enabled, -1, "FolderPage enabled flag must exist")
  text = `${text.slice(0, enabled)}enabled: false${text.slice(enabled + "enabled: true".length)}`
  fs.writeFileSync(configPath, text)
  writeQuartzEntry()

  const result = execFileSync(
    process.execPath,
    [quartzScript, "build", "--directory", "content", "--output", "public-disabled-dep"],
    {
      cwd: workspace,
      env: processBaseEnv,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  assert.match(result, /depends on "@quartz-community\/folder-page" which is disabled/)
  console.log("✓ disabled FolderPage dependency warning")
}

function assertFolderPageOrderFailure() {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({
    locale: "en-US",
    enableSPA: false,
    rootSource: localSource,
    rootOptions: {},
    includeFolderPage: true,
  })
  const configPath = path.join(workspace, "quartz.config.yaml")
  let text = fs.readFileSync(configPath, "utf8")
  const source = 'source: "@quartz-community/folder-page"'
  const start = text.indexOf(source)
  assert.notEqual(start, -1, "FolderPage fixture must exist")
  const order = text.indexOf("order: 50", start)
  assert.notEqual(order, -1, "FolderPage order must exist")
  text = `${text.slice(0, order)}order: 60${text.slice(order + "order: 50".length)}`
  fs.writeFileSync(configPath, text)
  writeQuartzEntry()

  runQuartzExpectFailure(
    ["build", "--directory", "content", "--output", "public-invalid-order"],
    "invalid FolderPage order rejected",
    [/depends on "@quartz-community\/folder-page" \(order: 60\)/, /configured to run first/],
  )
  console.log("✓ invalid FolderPage dependency order rejected")
}

function assertRootLibraryRoute(outputDir) {
  const root = pageText(outputDir, "/")
  const encoded = root.match(/data-rip-library-route="([^"]+)"/)
  assert.ok(encoded, "root library route marker missing")
  assert.equal(encoded[1], ROOT_LIBRARY_ROUTE_TEST_ID, "root library route marker")
}

function setRootLibraryRouteMarker() {
  const file = path.join(workspace, "content", "index.md")
  const current = fs.readFileSync(file, "utf8")
  fs.writeFileSync(file, `${current}\n<div data-rip-library-route="${ROOT_LIBRARY_ROUTE_TEST_ID}"></div>\n`)
}

function assertRouteLink(outputDir, route, href) {
  const html = pageText(outputDir, route)
  assertContains(html, `href="${href}"`, `${route} route link ${href}`)
}

function assertCurrentBookMarker(outputDir, route, bookPath) {
  const html = pageText(outputDir, route)
  assertContains(html, `data-rip-current-book="${bookPath}"`, `${route} current book marker`)
}

function assertDefaultIconFallback(outputDir) {
  const git = pageText(outputDir, "/git")
  assertContains(git, 'data-lucide="book-open"', "unknown custom icon fallback")
}

function clearCustomIconRegistration() {
  const configPath = path.join(workspace, "quartz.config.yaml")
  const text = fs.readFileSync(configPath, "utf8")
  const marker = `      icons:\n        ${DETAIL_ICON_ALIAS}: null\n`
  fs.writeFileSync(configPath, text.replace(marker, ""))
}

function assertDefaultDirectLucideFallback(outputDir) {
  const git = pageText(outputDir, "/git")
  assertContains(git, 'data-rip-lucide-icon="library-big"', "direct Lucide fallback marker")
}

function assertLatestPreviewCount(outputDir, expected) {
  const root = pageText(outputDir, "/")
  const preview = root.match(/data-rip-latest-preview[^>]*>([\s\S]*?)<\/section>/)
  assert.ok(preview, "latest preview section missing")
  const count = (preview[1].match(/data-rip-book-path=/g) ?? []).length
  assert.equal(count, expected, `latest preview should render ${expected} book(s)`)
}

function assertSearchIndex(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, "data-rip-search-index", "search index")
  assertContains(root, "Java", "search index Java")
  assertContains(root, "Git", "search index Git")
}

function assertSortValues(outputDir) {
  const root = pageText(outputDir, "/")
  for (const value of ["date-desc", "date-asc", "title-asc", "title-desc"]) {
    assertContains(root, `value="${value}"`, `sort option ${value}`)
  }
}

function assertBuiltInRootPageCount(outputDir) {
  const root = pageText(outputDir, "/")
  assert.equal(
    (root.match(/data-rip-book-path=/g) ?? []).length,
    4,
    "two-book root should render two preview items plus two complete-library items",
  )
}

function assertBookIndexRoute(outputDir, book) {
  assertFilePresent(path.join(outputDir, book, "index.html"), `${book} index route`)
}

function assertNestedIndexHiddenFromTree(outputDir) {
  const java = pageText(outputDir, "/java")
  assertNotContains(java, "Nested Java/index", "nested physical index should not become a leaf")
}

function assertGeneratedFolderInTree(outputDir) {
  const java = pageText(outputDir, "/java")
  assertContains(java, "Generated", "generated folder row")
}

function assertBookCounts(outputDir) {
  const root = pageText(outputDir, "/")
  assert.match(root, /data-rip-book-path="java"[\s\S]*?3 docs/)
  assert.match(root, /data-rip-book-path="git"[\s\S]*?1 doc/)
}

function assertGeneratedBookCount(outputDir) {
  const root = pageText(outputDir, "/")
  assert.match(root, /data-rip-book-path="java"[\s\S]*?4 docs/)
}

function assertNestedEditInvalidatesBookAndRoot(outputDir) {
  const rootBefore = sha256(pagePath(outputDir, "/"))
  const javaBefore = sha256(pagePath(outputDir, "/java"))
  const gitBefore = sha256(pagePath(outputDir, "/git"))
  writeNestedTitle("Generics Updated")
  build(path.relative(workspace, outputDir))
  assert.notEqual(sha256(pagePath(outputDir, "/")), rootBefore, "nested edit must invalidate root")
  assert.notEqual(sha256(pagePath(outputDir, "/java")), javaBefore, "nested edit must invalidate Java")
  assert.equal(sha256(pagePath(outputDir, "/git")), gitBefore, "nested edit must not invalidate Git")
}

function assertUnrelatedRootEditDoesNotInvalidateBook(outputDir) {
  const javaBefore = sha256(pagePath(outputDir, "/java"))
  writeContentIndexTitle("Integration Root Changed Again")
  build(path.relative(workspace, outputDir))
  assert.equal(
    sha256(pagePath(outputDir, "/java")),
    javaBefore,
    "root index edit should not invalidate Java landing",
  )
}

function assertBasePathClientScript(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, "data-rip-base-path=\"/notes\"", "base path marker")
}

function assertSidebarOnRoot(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, "data-rip-book-switcher", "root sidebar switcher")
}

function assertSidebarOnTagPage(outputDir) {
  const tagRoute = path.join(outputDir, "tags")
  if (!fs.existsSync(tagRoute)) return
  const tags = pageText(outputDir, "/tags")
  assertContains(tags, "data-rip-book-switcher", "tag page sidebar switcher")
}

function assertNoNestedBookSwitcherDuplication(outputDir) {
  const nested = pageText(outputDir, "/java/nested")
  assert.equal((nested.match(/data-rip-book-switcher/g) ?? []).length, 1)
}

function assertDefaultSort(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, 'data-rip-default-sort="alphabetical"', "default sort marker")
}

function assertViewDefaults(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, 'data-rip-default-view="cards"', "default view marker")
}

function assertRootPageTypeOwnership(outputDir) {
  const root = pageText(outputDir, "/")
  assert.equal((root.match(/ROOT BODY SENTINEL/g) ?? []).length, 1, "root body should render once")
  assert.equal((root.match(/rip-root-index/g) ?? []).length >= 1, true, "root library should render")
}

function assertNestedFolderPageOwnership(outputDir) {
  const nested = pageText(outputDir, "/java/nested")
  assert.equal(
    (nested.match(/NESTED INDEX SENTINEL/g) ?? []).length,
    1,
    "nested FolderPage content should render once",
  )
}

function assertNoRootRouteConflict(outputDir) {
  assertFilePresent(path.join(outputDir, "index.html"), "root index")
  assertFileMissing(path.join(outputDir, "index", "index.html"), "duplicate root index route")
}

function assertRouteAwareCurrentBook(outputDir) {
  assertCurrentBookMarker(outputDir, "/java", "java")
  assertCurrentBookMarker(outputDir, "/java/nested", "java")
  assertCurrentBookMarker(outputDir, "/java/nested/generics", "java")
  assertCurrentBookMarker(outputDir, "/git", "git")
}

function assertBookSwitcherRoutes(outputDir) {
  for (const route of ["/java", "/java/nested", "/java/nested/generics", "/git"]) {
    assertRouteLink(outputDir, route, "/notes/")
    assertRouteLink(outputDir, route, "/notes/java/")
    assertRouteLink(outputDir, route, "/notes/git/")
  }
}

function assertNestedFolderLink(outputDir) {
  assertRouteLink(outputDir, "/java", "/notes/java/nested/")
}

function assertGeneratedNestedFolderLink(outputDir) {
  assertRouteLink(outputDir, "/java", "/notes/java/generated/")
}

function assertTreeFileLink(outputDir) {
  assertRouteLink(outputDir, "/java", "/notes/java/collections")
}

function assertRootCardsLink(outputDir) {
  assertRouteLink(outputDir, "/", "/notes/java/")
  assertRouteLink(outputDir, "/", "/notes/git/")
}

function assertFolderRouteIndexCanonical(outputDir) {
  const nested = pageText(outputDir, "/java/nested")
  assertNotContains(nested, "/notes/java/nested/index", "nested canonical index path")
}

function assertCustomIconNoRemoteRequest(outputDir) {
  const git = pageText(outputDir, "/git")
  assertNotContains(git, "cdn.jsdelivr.net", "custom TypeScript icon should not use CDN")
}

function assertBuiltInIconNoRemoteRequest(outputDir) {
  const java = pageText(outputDir, "/java")
  assertNotContains(java, "cdn.jsdelivr.net", "built-in icon should not use CDN")
}

function assertNoArbitraryRemoteIcon(outputDir) {
  const java = pageText(outputDir, "/java")
  assertNotContains(java, "evil.example", "arbitrary remote icon URL")
}

function setArbitraryRemoteIconAttempt() {
  const file = path.join(workspace, "content", "java", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Java\npanel:\n  icon: "https://evil.example/icon.svg"\n---\n# JAVA INDEX SENTINEL\n`,
  )
}

function assertAccentSanitization(outputDir) {
  const java = pageText(outputDir, "/java")
  assertNotContains(java, "javascript:", "unsafe accent")
}

function setUnsafeAccent() {
  const file = path.join(workspace, "content", "java", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Java\npanel:\n  icon: terminal\n  accent: "url(javascript:alert(1))"\n---\n# JAVA INDEX SENTINEL\n`,
  )
}

function assertSearchDataNormalized(outputDir) {
  const root = pageText(outputDir, "/")
  assertContains(root, "data-rip-search-title=\"java\"", "normalized Java search title")
  assertContains(root, "data-rip-search-title=\"git\"", "normalized Git search title")
}

function assertLatestPreviewBookLimit(outputDir) {
  assertLatestPreviewCount(outputDir, 2)
}

function assertCompleteLibraryBookCount(outputDir) {
  const root = pageText(outputDir, "/")
  const library = root.match(/data-rip-complete-library[^>]*>([\s\S]*?)<\/section>/)
  assert.ok(library, "complete library missing")
  assert.equal((library[1].match(/data-rip-path=/g) ?? []).length, 2)
}

function assertRouteNotEscaped(outputDir) {
  const root = pageText(outputDir, "/")
  assertNotContains(root, "../", "route traversal")
}

function assertHiddenIndexExcluded(outputDir) {
  const root = pageText(outputDir, "/")
  assertNotContains(root, "index.md", "physical index filename should not display")
}

function assertRootNotesExcluded(outputDir) {
  writeFile("content/root-note.md", "---\ntitle: Root Note\n---\n# ROOT NOTE\n")
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "Root Note", "root-level note should not create a book")
}

function assertExcludedDir(outputDir) {
  writeFile("content/archive/index.md", "---\ntitle: Archive\n---\n# ARCHIVE\n")
  writeFile("content/archive/old.md", "---\ntitle: Old\n---\n# OLD\n")
  writeRootConfig({ excludeDirs: ["archive"] })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "Archive", "excluded directory")
}

function assertEmptyDirIgnored(outputDir) {
  fs.mkdirSync(path.join(workspace, "content", "empty"), { recursive: true })
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "Empty", "empty directory")
}

function assertTagsDirIgnored(outputDir) {
  writeFile("content/tags/index.md", "---\ntitle: Tags Override\n---\n# TAGS OVERRIDE\n")
  writeFile("content/tags/custom.md", "---\ntitle: Custom Tag\n---\n# CUSTOM TAG\n")
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "Tags Override", "tags pseudo-directory book")
}

function assertDescriptionFallback(outputDir) {
  writeRootConfig({ descriptionFallback: "No description" })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertContains(root, "No description", "description fallback")
}

function assertTagCount(outputDir) {
  const file = path.join(workspace, "content", "java", "index.md")
  fs.writeFileSync(
    file,
    `---\ntitle: Java\ntags: [one, two, three, four]\npanel:\n  icon: terminal\n  accent: ocean\n---\n# JAVA INDEX SENTINEL\n`,
  )
  writeRootConfig({ tagCount: 2 })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertContains(root, "one", "tag one")
  assertContains(root, "two", "tag two")
}

function assertNoTagsWhenDisabled(outputDir) {
  writeRootConfig({ showTags: false })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "rip-book-tags", "tags disabled")
}

function assertNoDescriptionsWhenDisabled(outputDir) {
  writeRootConfig({ showDescription: false })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "rip-book-description", "descriptions disabled")
}

function assertNoCountsWhenDisabled(outputDir) {
  writeRootConfig({ showDocCount: false })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertNotContains(root, "rip-book-count", "counts disabled")
}

function assertListLayout(outputDir) {
  writeRootConfig({ layout: "list" })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertContains(root, 'data-rip-default-view="list"', "list default view")
}

function assertDateSortDefault(outputDir) {
  writeRootConfig({ sort: "date" })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertContains(root, 'data-rip-default-sort="date-desc"', "date sort default")
}

function assertDocCountSortDefault(outputDir) {
  writeRootConfig({ sort: "docCount" })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  const root = pageText(outputDir, "/")
  assertContains(root, 'data-rip-default-sort="doc-count-desc"', "doc count sort default")
}

function assertDirectDefaultIcon(outputDir) {
  writeRootConfig({ defaultIcon: "lucide:library-big" })
  writeQuartzEntry()
  clearCustomIconRegistration()
  build(path.relative(workspace, outputDir))
  assertDefaultDirectLucideFallback(outputDir)
}

function assertLocaleBuild(outputDir) {
  writeRootConfig({ locale: "fi-FI" })
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertLocale(outputDir, "fi-FI")
}

function assertUnsafeAccentFallback(outputDir) {
  setUnsafeAccent()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertAccentSanitization(outputDir)
}

function assertArbitraryRemoteIconFallback(outputDir) {
  setArbitraryRemoteIconAttempt()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertNoArbitraryRemoteIcon(outputDir)
  assertInvalidDirectLucideFallback(outputDir)
}

function assertDirectLucideRendering(outputDir) {
  setJavaDirectLucideIcon()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertDirectLucideIcon(outputDir)
}

function assertInvalidDirectLucideRendering(outputDir) {
  setJavaInvalidDirectLucideIcon()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertInvalidDirectLucideFallback(outputDir)
}

function assertNestedCustomIconRendering(outputDir) {
  setNestedCustomIcon()
  writeRootConfig()
  addCustomIconRegistration()
  writeQuartzEntry()
  ensurePluginInstalled()
  replacePluginIndexWithCustomIcon()
  build(path.relative(workspace, outputDir))
  assertNestedCustomIcon(outputDir)
}

function assertEscapedMetadata(outputDir) {
  setEscapingFixture()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertEscaping(outputDir)
}

function assertGeneratedNestedLandingRendering(outputDir) {
  addGeneratedNestedFixture()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertGeneratedNestedLanding(outputDir)
  assertGeneratedFolderInTree(outputDir)
  assertGeneratedNestedFolderLink(outputDir)
  assertGeneratedBookCount(outputDir)
}

function assertUnlistedRendering(outputDir) {
  addUnlistedFixture()
  writeRootConfig()
  writeQuartzEntry()
  build(path.relative(workspace, outputDir))
  assertUnlistedSuppression(outputDir)
}

function assertInitialBuild(outputDir) {
  restoreFixtures()
  writeRootConfig()
  addCustomIconRegistration()
  writeQuartzEntry()
  ensurePluginInstalled()
  replacePluginIndexWithCustomIcon()
  setRootLibraryRouteMarker()
  build(path.relative(workspace, outputDir))

  assertRootBuild(outputDir)
  assertBookBuild(outputDir)
  assertNestedBuild(outputDir)
  assertDetailBuild(outputDir)
  assertBasePathUrls(outputDir)
  assertBuiltInIcon(outputDir)
  assertBuiltInIconNoRemoteRequest(outputDir)
  assertCustomIcon(outputDir)
  assertCustomIconNoRemoteRequest(outputDir)
  assertCustomAccent(outputDir)
  assertNoExplorerWhenReplacementEnabled(outputDir)
  assertNoPrivateRoute(outputDir)
  assertNoDuplicateBookIndexRoutes(outputDir)
  assertNestedIndexHiddenFromTree(outputDir)
  assertBookCounts(outputDir)
  assertRootLibraryRoute(outputDir)
  assertSearchIndex(outputDir)
  assertSearchDataNormalized(outputDir)
  assertSortValues(outputDir)
  assertLatestPreviewBookLimit(outputDir)
  assertCompleteLibraryBookCount(outputDir)
  assertBuiltInRootPageCount(outputDir)
  assertBookIndexRoute(outputDir, "java")
  assertBookIndexRoute(outputDir, "git")
  assertRouteAwareCurrentBook(outputDir)
  assertBookSwitcherRoutes(outputDir)
  assertNestedFolderLink(outputDir)
  assertTreeFileLink(outputDir)
  assertRootCardsLink(outputDir)
  assertFolderRouteIndexCanonical(outputDir)
  assertBasePathClientScript(outputDir)
  assertSidebarOnRoot(outputDir)
  assertSidebarOnTagPage(outputDir)
  assertNoNestedBookSwitcherDuplication(outputDir)
  assertDefaultSort(outputDir)
  assertViewDefaults(outputDir)
  assertRootPageTypeOwnership(outputDir)
  assertNestedFolderPageOwnership(outputDir)
  assertNoRootRouteConflict(outputDir)
  assertHiddenIndexExcluded(outputDir)
  console.log("✓ initial full integration build")
}

function assertIncrementalBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  build(path.relative(workspace, outputDir))
  assertNestedEditInvalidatesBookAndRoot(outputDir)
  assertUnrelatedRootEditDoesNotInvalidateBook(outputDir)
  console.log("✓ incremental invalidation")
}

function assertNoOpRebuild(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  build(path.relative(workspace, outputDir))
  assertNoOpBuildStable(outputDir)
  console.log("✓ no-op rebuild")
}

function assertMetadataFallback(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  clearCustomIconRegistration()
  build(path.relative(workspace, outputDir))
  assertDefaultIconFallback(outputDir)
  console.log("✓ unknown custom icon fallback")
}

function assertRootNotesBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  assertRootNotesExcluded(outputDir)
  console.log("✓ root-level note exclusion")
}

function assertExcludedDirBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  assertExcludedDir(outputDir)
  console.log("✓ excluded directory")
}

function assertEmptyDirBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  assertEmptyDirIgnored(outputDir)
  console.log("✓ empty directory")
}

function assertTagsDirBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  assertTagsDirIgnored(outputDir)
  console.log("✓ tags directory exclusion")
}

function assertOptionBehavior(outputDir) {
  restoreFixtures()
  writeRootConfig()
  writeQuartzEntry()
  ensurePluginInstalled()
  assertDescriptionFallback(outputDir)
  restoreFixtures()
  assertTagCount(outputDir)
  restoreFixtures()
  assertNoTagsWhenDisabled(outputDir)
  restoreFixtures()
  assertNoDescriptionsWhenDisabled(outputDir)
  restoreFixtures()
  assertNoCountsWhenDisabled(outputDir)
  restoreFixtures()
  assertListLayout(outputDir)
  restoreFixtures()
  assertDateSortDefault(outputDir)
  restoreFixtures()
  assertDocCountSortDefault(outputDir)
  console.log("✓ option rendering")
}

function assertDirectIconBehavior(outputDir) {
  restoreFixtures()
  assertDirectLucideRendering(outputDir)
  restoreFixtures()
  assertInvalidDirectLucideRendering(outputDir)
  restoreFixtures()
  assertArbitraryRemoteIconFallback(outputDir)
  restoreFixtures()
  assertDirectDefaultIcon(outputDir)
  console.log("✓ direct Lucide icon rendering")
}

function assertSecurityBehavior(outputDir) {
  restoreFixtures()
  assertUnsafeAccentFallback(outputDir)
  restoreFixtures()
  assertEscapedMetadata(outputDir)
  console.log("✓ metadata safety")
}

function assertGeneratedAndUnlistedBehavior(outputDir) {
  restoreFixtures()
  assertGeneratedNestedLandingRendering(outputDir)
  restoreFixtures()
  assertUnlistedRendering(outputDir)
  console.log("✓ generated and unlisted folder behavior")
}

function assertNestedCustomIconBehavior(outputDir) {
  restoreFixtures()
  assertNestedCustomIconRendering(outputDir)
  console.log("✓ nested custom icon rendering")
}

function assertLocaleBehavior(outputDir) {
  restoreFixtures()
  assertLocaleBuild(outputDir)
  console.log("✓ locale rendering")
}

function resetOutput(outputDir) {
  fs.rmSync(outputDir, { recursive: true, force: true })
}

function runIntegration() {
  renderMixedPreact()
  assertFreshPluginRemove()
  assertFreshPluginAdd()
  assertFolderPageDependencyFailure()
  console.log("✓ missing FolderPage dependency rejected")
  assertDisabledDependencyWarns()
  assertFolderPageOrderFailure()

  restoreFixtures()
  const outputDir = path.join(workspace, "public")
  resetOutput(outputDir)
  assertInitialBuild(outputDir)

  restoreFixtures()
  assertConfigWithoutExplorerReplacement(outputDir)

  restoreFixtures()
  assertInvalidConfigFails()

  restoreFixtures()
  resetOutput(outputDir)
  assertIncrementalBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertNoOpRebuild(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertMetadataFallback(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertRootNotesBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertExcludedDirBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertEmptyDirBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertTagsDirBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertOptionBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertDirectIconBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertSecurityBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertGeneratedAndUnlistedBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertNestedCustomIconBehavior(outputDir)

  restoreFixtures()
  resetOutput(outputDir)
  assertLocaleBehavior(outputDir)
}

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "root-index-panels-integration-"))

try {
  installFixture()
  runIntegration()
} finally {
  fs.rmSync(workspace, { recursive: true, force: true })
}
