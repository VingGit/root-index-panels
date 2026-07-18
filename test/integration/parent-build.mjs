import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const PLUGIN_NAME = "root-index-panels"
const WORKSPACE_PREFIX = "root-index-panels-integration-"
const KEEP_WORKSPACE = process.env.RIP_KEEP_INTEGRATION === "1"
const GITLAB_BASE_DIR = "/group/project"
const GITLAB_BASE_URL = "gitlab.example/group/project"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(scriptDirectory, "..", "..")
const outputDirectories = []
const linkedDirectories = new Set()
let workspace
let workspaceMarker

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function isQuartzRoot(candidate) {
  if (!candidate || !fs.existsSync(candidate)) return false

  const packagePath = path.join(candidate, "package.json")
  const bootstrapPath = path.join(candidate, "quartz", "bootstrap-cli.mjs")
  if (!fs.existsSync(packagePath) || !fs.existsSync(bootstrapPath)) return false

  try {
    return readJson(packagePath).name === "@jackyzha0/quartz"
  } catch {
    return false
  }
}

function locateQuartzRoot() {
  if (process.env.RIP_QUARTZ_ROOT) {
    const override = path.resolve(process.env.RIP_QUARTZ_ROOT)
    assert.ok(isQuartzRoot(override), `RIP_QUARTZ_ROOT is not a Quartz checkout: ${override}`)
    return override
  }

  let candidate = path.dirname(pluginRoot)
  while (candidate) {
    if (isQuartzRoot(candidate)) return candidate
    const parent = path.dirname(candidate)
    if (parent === candidate) break
    candidate = parent
  }

  throw new Error(
    "Could not locate the parent Quartz checkout. Set RIP_QUARTZ_ROOT to an explicit path.",
  )
}

const quartzRoot = locateQuartzRoot()
const requireFromQuartz = createRequire(path.join(quartzRoot, "package.json"))
const YAML = requireFromQuartz("yaml")

function assertInside(root, target, label = "path") {
  const relative = path.relative(path.resolve(root), path.resolve(target))
  assert.ok(
    relative !== "" &&
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    `${label} escaped its validated root: ${target}`,
  )
}

function validateWorkspaceForCleanup() {
  assert.ok(workspace, "temporary workspace was never created")
  const realTemp = fs.realpathSync(os.tmpdir())
  const realWorkspace = fs.realpathSync(workspace)
  const relative = path.relative(realTemp, realWorkspace)

  assert.ok(
    relative !== "" &&
      !relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative),
    `refusing to clean a path outside the system temp directory: ${realWorkspace}`,
  )
  assert.ok(
    path.basename(realWorkspace).startsWith(WORKSPACE_PREFIX),
    `refusing to clean an unexpected temporary directory: ${realWorkspace}`,
  )
  assert.equal(
    fs.readFileSync(path.join(realWorkspace, ".rip-integration-workspace"), "utf8"),
    workspaceMarker,
    "temporary workspace marker did not match",
  )
}

function writeWorkspaceFile(relativePath, contents) {
  const target = path.resolve(workspace, relativePath)
  assertInside(workspace, target, "fixture file")
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
  return target
}

function linkOrCopyDirectory(source, destination) {
  assert.ok(fs.statSync(source).isDirectory(), `directory source does not exist: ${source}`)
  assertInside(workspace, destination, "linked directory")
  fs.mkdirSync(path.dirname(destination), { recursive: true })

  try {
    fs.symlinkSync(source, destination, process.platform === "win32" ? "junction" : "dir")
    linkedDirectories.add(destination)
  } catch (error) {
    if (!error || !["EPERM", "EACCES", "EINVAL"].includes(error.code)) throw error
    fs.cpSync(source, destination, { recursive: true })
  }
}

function copyQuartzSource() {
  const source = path.join(quartzRoot, "quartz")
  const destination = path.join(workspace, "quartz")
  const ignoredCache = path.resolve(source, ".quartz-cache")

  fs.cpSync(source, destination, {
    recursive: true,
    filter: (candidate) => path.resolve(candidate) !== ignoredCache,
  })
}

function stageHost() {
  assert.equal(
    readJson(path.join(pluginRoot, "package.json")).name,
    "@quartz-community/root-index-panels",
  )
  assert.ok(
    fs.existsSync(path.join(pluginRoot, "dist", "index.js")),
    "build plugin dist/ before integration",
  )

  copyQuartzSource()
  linkOrCopyDirectory(path.join(quartzRoot, "node_modules"), path.join(workspace, "node_modules"))

  for (const fileName of ["package.json", "package-lock.json", "tsconfig.json", "globals.d.ts"]) {
    const source = path.join(quartzRoot, fileName)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(workspace, fileName))
  }

  const parentPlugins = path.join(quartzRoot, ".quartz", "plugins")
  const stagedPlugins = path.join(workspace, ".quartz", "plugins")
  fs.mkdirSync(stagedPlugins, { recursive: true })

  for (const entry of fs.readdirSync(parentPlugins, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === PLUGIN_NAME) continue
    linkOrCopyDirectory(path.join(parentPlugins, entry.name), path.join(stagedPlugins, entry.name))
  }

  // Begin with the local tree in the same cache slot as the remote pin. The CLI remove/add
  // sequence below must tear this down and recreate a genuine local-development install.
  linkOrCopyDirectory(pluginRoot, path.join(stagedPlugins, PLUGIN_NAME))
  const parentIndex = path.join(parentPlugins, "index.ts")
  if (fs.existsSync(parentIndex)) fs.copyFileSync(parentIndex, path.join(stagedPlugins, "index.ts"))

  fs.copyFileSync(
    path.join(quartzRoot, "quartz.lock.json"),
    path.join(workspace, "quartz.lock.json"),
  )
}

function assertMixedPreactBuiltInRender() {
  const mixedPluginRoot = path.join(workspace, "mixed-preact-plugin")
  const mixedPreactRoot = path.join(mixedPluginRoot, "node_modules", "preact")
  const hostPreactRoot = path.dirname(
    fs.realpathSync(requireFromQuartz.resolve("preact/package.json")),
  )

  fs.mkdirSync(mixedPluginRoot, { recursive: true })
  fs.cpSync(path.join(pluginRoot, "dist"), path.join(mixedPluginRoot, "dist"), {
    recursive: true,
  })
  fs.copyFileSync(path.join(pluginRoot, "package.json"), path.join(mixedPluginRoot, "package.json"))
  fs.mkdirSync(path.dirname(mixedPreactRoot), { recursive: true })
  fs.cpSync(hostPreactRoot, mixedPreactRoot, { recursive: true })

  assert.notEqual(
    fs.realpathSync(mixedPreactRoot),
    fs.realpathSync(hostPreactRoot),
    "mixed-runtime fixture must contain a physical second Preact copy",
  )

  const scriptPath = writeWorkspaceFile(
    "mixed-preact-render.mjs",
    `import { createRequire } from "node:module"
const hostRequire = createRequire(${JSON.stringify(path.join(quartzRoot, "package.json"))})
const renderModule = hostRequire("preact-render-to-string")
const render = renderModule.default ?? renderModule
const { RootIndexPanels } = await import(${JSON.stringify(pathToFileURL(path.join(mixedPluginRoot, "dist", "index.js")).href)})
const Component = RootIndexPanels({ defaultIcon: "book-open" })
const html = render(Component({
  ctx: {},
  externalResources: { css: [], js: [], additionalHead: [] },
  fileData: { slug: "index", filePath: "index.md", frontmatter: {} },
  cfg: { locale: "en-US" },
  children: [],
  tree: { type: "root", children: [] },
  allFiles: [
    { slug: "java/index", filePath: "java/index.md", frontmatter: { title: "Java" } },
    { slug: "java/note", filePath: "java/note.md", frontmatter: {} },
  ],
}))
if (!html.includes("data-rip-icon=\\"book-open\\"") || !html.includes("<svg")) {
  throw new Error("hook-free built-in icon did not render through the host renderer")
}
`,
  )

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 4 * 1024 * 1024,
    timeout: 30_000,
  })
  if (result.error || result.status !== 0) {
    throw new Error(
      `mixed-Preact built-in render failed\n${result.error?.stack ?? ""}\n` +
        `stdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }
  process.stdout.write("✓ mixed-Preact built-in render\n")
}

const theme = {
  fontOrigin: "local",
  cdnCaching: true,
  typography: {
    header: "Arial",
    body: "Arial",
    code: "monospace",
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
}

function communityPlugin(name, extra = {}) {
  return {
    source: `github:quartz-community/${name}`,
    enabled: true,
    ...extra,
  }
}

function pluginEntries(rootSource, rootOptions) {
  return [
    communityPlugin("note-properties", {
      order: 5,
      options: {
        includeAll: false,
        includedProperties: ["description", "tags", "aliases"],
        excludedProperties: [],
        hidePropertiesView: true,
        delimiters: "---",
        language: "yaml",
      },
    }),
    communityPlugin("unlisted-pages", { order: 45, options: {} }),
    communityPlugin("table-of-contents", {
      order: 50,
      options: {
        maxDepth: 3,
        minEntries: 1,
        showByDefault: true,
        collapseByDefault: false,
        layout: "modern",
      },
      layout: { position: "right", priority: 30 },
    }),
    communityPlugin("description", { order: 70 }),
    communityPlugin("content-page", { order: 50 }),
    communityPlugin("folder-page", { order: 50 }),
    communityPlugin("tag-page", { order: 50 }),
    communityPlugin("article-title", {
      order: 50,
      layout: { position: "beforeBody", priority: 10 },
    }),
    communityPlugin("content-meta", {
      order: 50,
      options: { showReadingTime: true, showComma: true },
      layout: { position: "beforeBody", priority: 20 },
    }),
    communityPlugin("tag-list", {
      order: 50,
      layout: { position: "beforeBody", priority: 30 },
    }),
    communityPlugin("footer", {
      order: 50,
      options: { links: {} },
    }),
    {
      source: rootSource,
      enabled: true,
      options: rootOptions,
      order: 50,
    },
  ]
}

function configuration({ locale, enableSPA }) {
  return {
    pageTitle: "Root Index Panels Integration",
    pageTitleSuffix: "",
    enableSPA,
    enablePopovers: false,
    analytics: null,
    locale,
    baseUrl: GITLAB_BASE_URL,
    ignorePatterns: [],
    theme,
  }
}

function writeConfig({ locale, enableSPA, rootSource, rootOptions }) {
  const config = {
    configuration: configuration({ locale, enableSPA }),
    plugins: pluginEntries(rootSource, rootOptions),
    layout: {
      groups: {},
      byPageType: {
        content: {},
        folder: {},
        tag: {},
      },
    },
  }

  writeWorkspaceFile(
    "quartz.config.yaml",
    `# yaml-language-server: $schema=./quartz/plugins/quartz-plugins.schema.json\n${YAML.stringify(config, { lineWidth: 120 })}`,
  )
}

function writeQuartzEntry(useTypeScriptOverride) {
  const override = useTypeScriptOverride
    ? `import { createElement, type JSX } from "preact"\nimport * as ExternalPlugin from "./.quartz/plugins/index"\n\nconst IntegrationIcon = (props: JSX.SVGAttributes<SVGSVGElement>) =>\n  createElement("svg", { ...props, "data-rip-test-icon": "ts-custom", viewBox: "0 0 24 24" },\n    createElement("path", { d: "M4 12h16" }),\n  )\n\nExternalPlugin.RootIndexPanelsPage({\n  defaultIcon: "custom-mark",\n  icons: { "custom-mark": IntegrationIcon },\n  defaultAccent: "#abc",\n})\n\n`
    : ""

  writeWorkspaceFile(
    "quartz.ts",
    `${override}import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"\n\nconst config = await loadQuartzConfig()\nexport default config\nexport const layout = await loadQuartzLayout()\n`,
  )
}

function runQuartz(args, label, timeout = 300_000) {
  const executable = path.join(workspace, "quartz", "bootstrap-cli.mjs")
  const result = spawnSync(process.execPath, [executable, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    maxBuffer: 16 * 1024 * 1024,
    timeout,
  })

  if (result.error || result.status !== 0) {
    throw new Error(
      `${label} failed${result.status === null ? "" : ` with exit code ${result.status}`}\n` +
        `${result.error ? `${result.error.stack ?? result.error}\n` : ""}` +
        `stdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }

  process.stdout.write(`✓ ${label}\n`)
  return result
}

function sourceName(source) {
  const value = typeof source === "string" ? source : (source?.name ?? source?.repo ?? "")
  const normalized = String(value).replaceAll("\\", "/").replace(/\/$/, "")
  return normalized.startsWith("github:")
    ? normalized.split("/").at(-1)
    : path.posix.basename(normalized)
}

function exerciseFreshLocalInstall() {
  const remoteOptions = {
    layout: "cards",
    showDescription: true,
    showDocCount: true,
    showTags: true,
    tagCount: 3,
    sort: "alphabetical",
    excludeDirs: [],
    descriptionFallback: "",
  }
  writeConfig({
    locale: "en-US",
    enableSPA: true,
    rootSource: "github:VingGit/root-index-panels",
    rootOptions: remoteOptions,
  })
  writeQuartzEntry(false)

  runQuartz(["plugin", "remove", PLUGIN_NAME, "--concurrency", "1"], "fresh plugin remove")
  runQuartz(["plugin", "add", pluginRoot, "--concurrency", "1"], "fresh local plugin add")

  const addedConfig = YAML.parse(
    fs.readFileSync(path.join(workspace, "quartz.config.yaml"), "utf8"),
  )
  const rootEntries = addedConfig.plugins.filter(
    (entry) => sourceName(entry.source) === PLUGIN_NAME,
  )
  assert.equal(rootEntries.length, 1, "fresh add must create exactly one plugin config entry")
  assert.equal(
    rootEntries[0].enabled,
    false,
    "manifest defaultEnabled=false must survive fresh add",
  )
  assert.equal(
    Object.hasOwn(rootEntries[0], "layout"),
    false,
    "fresh add must not generate a RootIndexPanels component layout stanza",
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
}

const fixtureFiles = {
  "content/index.md": `---
title: Integration Root
---
# ROOT BODY SENTINEL

This authored prose must be replaced by the panels page body. It is intentionally long enough to
produce a reading-time label in the host ContentMeta component before the page transform runs.

## Root stale section one

More hidden root prose.

## Root stale section two

More hidden root prose.
`,
  "content/loose.md": `---
title: Loose root note
---
# Loose
`,
  "content/java.md": `---
title: WRONG ROOT JAVA METADATA
description: Wrong root-note description
tags: [wrong-root-tag]
---
# Metadata trap
`,
  "content/java/index.md": `---
title: iOS
description: Java authored description
tags: [jvm, language, trimmed]
panel:
  icon: coffee
  accent: ocean
---
# Java index body
`,
  "content/java/topic.md": `---
title: Java Topic
tags: [topic-tag]
---
# TOPIC BODY SENTINEL

The regular content page must retain host frame components.

## Topic deep section

Topic details.
`,
  "content/java/nested/index.md": `---
title: Authored nested index
---
# Nested index
`,
  "content/java/private.md": `---
title: Hidden Java page
unlisted: true
tags: [secret]
---
# Hidden
`,
  "content/generated/one.md": `---
title: Generated folder note
---
# Generated
`,
  "content/git.md/guide.md": `---
title: Dotted directory guide
---
# Git dotted directory
`,
  "content/custom/index.md": `---
title: Custom Book
panel:
  icon: custom-mark
---
# Custom icon book
`,
  "content/safe/index.md": `---
title: Safe Direct
panel:
  accent: "#1234"
---
# Safe direct accent
`,
  "content/unsafe/index.md": `---
title: Unsafe
panel:
  icon: constructor
  accent: "#fff;outline:none"
---
# Invalid appearance
`,
  "content/hidden-only/secret.md": `---
title: Hidden-only note
unlisted: true
---
# Hidden only
`,
  "content/tags/manual.md": `---
title: Reserved tags note
---
# Reserved tags namespace
`,
}

function writeFixture() {
  for (const [relativePath, contents] of Object.entries(fixtureFiles)) {
    writeWorkspaceFile(relativePath, contents)
  }
}

function classCount(html, className) {
  let count = 0
  for (const match of html.matchAll(/\bclass="([^"]*)"/g)) {
    if (match[1].split(/\s+/).includes(className)) count += 1
  }
  return count
}

function anchorForHref(html, href) {
  const marker = `href="${href}"`
  const markerIndex = html.indexOf(marker)
  assert.notEqual(markerIndex, -1, `missing panel link ${href}`)
  const start = html.lastIndexOf("<a", markerIndex)
  const end = html.indexOf("</a>", markerIndex)
  assert.ok(start >= 0 && end > markerIndex, `could not isolate panel link ${href}`)
  return html.slice(start, end + 4)
}

function panelHrefs(html) {
  const hrefs = []
  for (const match of html.matchAll(/<a\b[^>]*>/g)) {
    if (!/\bclass="[^"]*\brip-(?:card|list)-link\b/.test(match[0])) continue
    const href = match[0].match(/\bhref="([^"]+)"/)?.[1]
    if (href) hrefs.push(href)
  }
  return hrefs
}

function assertAssetReferencesResolve(htmlPath, outputRoot) {
  const html = fs.readFileSync(htmlPath, "utf8")
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+\.(?:css|js)(?:\?[^"#]*)?)"/g)].map(
    (match) => match[1],
  )
  assert.ok(references.length >= 3, `expected CSS and JS assets in ${htmlPath}`)

  for (const reference of references) {
    if (/^(?:https?:)?\/\//.test(reference)) continue
    const cleanReference = decodeURIComponent(reference.split("?")[0])
    const resolved = path.resolve(path.dirname(htmlPath), cleanReference)
    const relative = path.relative(outputRoot, resolved)
    assert.ok(
      relative === "" ||
        (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative)),
      `asset reference escapes build output: ${reference} in ${htmlPath}`,
    )
    assert.ok(
      fs.existsSync(resolved),
      `asset reference does not resolve: ${reference} in ${htmlPath}`,
    )
  }
}

function assertCommonRoot(outputRoot, expectedCountText) {
  const rootPath = path.join(outputRoot, "index.html")
  const rootHtml = fs.readFileSync(rootPath, "utf8")
  const headHtml = rootHtml.slice(rootHtml.indexOf("<head>"), rootHtml.indexOf("</head>") + 7)
  const bodyHtml = rootHtml.slice(rootHtml.indexOf("<body"), rootHtml.indexOf("</body>") + 7)
  const expectedHrefs = [
    "./custom/",
    "./generated/",
    "./git.md/",
    "./java/",
    "./safe/",
    "./unsafe/",
  ]

  assert.equal(classCount(rootHtml, "rip"), 1, "root must render exactly one .rip body")
  assert.deepEqual(
    panelHrefs(rootHtml).sort(),
    expectedHrefs,
    "root panel inventory or canonical hrefs drifted",
  )
  assert.match(
    rootHtml,
    /data-basepath="\/group\/project"/,
    "GitLab subpath must reach the host frame",
  )
  assert.match(
    rootHtml,
    /<span class="rip-card-title"[^>]*>iOS<\/span>|<span class="rip-list-title"[^>]*>iOS<\/span>/,
  )
  assert.match(rootHtml, /Java authored description/)
  assert.doesNotMatch(
    rootHtml,
    /WRONG ROOT JAVA METADATA|Wrong root-note description|wrong-root-tag/,
  )
  assert.doesNotMatch(bodyHtml, /ROOT BODY SENTINEL|Root stale section/)
  assert.match(
    headHtml,
    /ROOT BODY SENTINEL/,
    "authored root source should remain available to independent social/description emitters",
  )
  assert.doesNotMatch(
    rootHtml,
    /<undefined\b/,
    "fixture frame must not contain an undefined footer",
  )
  assert.equal(classCount(bodyHtml, "toc"), 0, "root must not retain a TOC for replaced Markdown")
  assert.equal(
    classCount(bodyHtml, "content-meta"),
    0,
    "root must not retain stale reading-time metadata",
  )
  assert.doesNotMatch(rootHtml, /\.\/tags\/|\.\/hidden-only\/|\.\/loose\//)
  assert.doesNotMatch(rootHtml, /#fff;outline:none/)
  assert.match(anchorForHref(rootHtml, "./java/"), /data-rip-icon="coffee"/)
  assert.match(anchorForHref(rootHtml, "./java/"), /data-rip-accent="ocean"/)
  assert.match(anchorForHref(rootHtml, "./java/"), /--rip-panel-accent: #0f766e/)
  assert.match(anchorForHref(rootHtml, "./safe/"), /data-rip-accent="direct"/)
  assert.match(anchorForHref(rootHtml, "./safe/"), /--rip-panel-accent: #1234/)
  if (classCount(rootHtml, "rip--cards") === 1) {
    assert.match(anchorForHref(rootHtml, "./java/"), /#jvm/)
    assert.match(anchorForHref(rootHtml, "./java/"), /#language/)
    assert.doesNotMatch(anchorForHref(rootHtml, "./java/"), /#trimmed|#secret/)
  } else {
    assert.equal(classCount(rootHtml, "rip-tags"), 0, "list layout must retain its tag-free markup")
  }

  for (const [href, text] of Object.entries(expectedCountText)) {
    assert.match(anchorForHref(rootHtml, href), new RegExp(text))
  }

  for (const segment of ["custom", "generated", "git.md", "java", "safe", "unsafe"]) {
    assert.ok(
      fs.existsSync(path.join(outputRoot, segment, "index.html")),
      `missing destination ${segment}/index.html`,
    )
  }
  assert.ok(
    fs.existsSync(path.join(outputRoot, "tags", "index.html")),
    "TagPage virtual index was not emitted",
  )
  assert.equal(
    classCount(fs.readFileSync(path.join(outputRoot, "tags", "index.html"), "utf8"), "rip"),
    0,
  )

  const topicPath = path.join(outputRoot, "java", "topic.html")
  const topicHtml = fs.readFileSync(topicPath, "utf8")
  assert.match(topicHtml, /TOPIC BODY SENTINEL/)
  assert.equal(classCount(topicHtml, "content-meta"), 1, "regular content page lost ContentMeta")
  assert.equal(classCount(topicHtml, "toc"), 1, "regular content page lost TableOfContents")
  assert.equal(classCount(topicHtml, "tags"), 1, "regular content page lost TagList")
  assert.match(topicHtml, /topic-tag/)
  assert.equal(classCount(topicHtml, "rip"), 0, "root Page Type leaked onto a non-root page")

  assertAssetReferencesResolve(rootPath, outputRoot)
  assertAssetReferencesResolve(topicPath, outputRoot)
  return rootHtml
}

function emittedJavaScript(outputRoot) {
  const contents = []
  const pending = [outputRoot]
  while (pending.length > 0) {
    const directory = pending.pop()
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const candidate = path.join(directory, entry.name)
      if (entry.isDirectory()) pending.push(candidate)
      else if (entry.isFile() && entry.name.endsWith(".js")) {
        contents.push(fs.readFileSync(candidate, "utf8"))
      }
    }
  }
  return contents.join("\n")
}

function buildVariant({ name, locale, enableSPA, rootOptions, typeScriptOverride, assertVariant }) {
  const localSource = pluginRoot.replaceAll("\\", "/")
  writeConfig({ locale, enableSPA, rootSource: localSource, rootOptions })
  writeQuartzEntry(typeScriptOverride)

  const outputRoot = path.join(workspace, "public", name)
  assertInside(workspace, outputRoot, "build output")
  outputDirectories.push(outputRoot)
  runQuartz(
    [
      "build",
      "--directory",
      "content",
      "--output",
      path.relative(workspace, outputRoot),
      "--baseDir",
      GITLAB_BASE_DIR,
      "--concurrency",
      "1",
      "--verbose",
    ],
    `${name} Quartz build`,
  )
  assertVariant(outputRoot)
}

function runIntegration() {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), WORKSPACE_PREFIX))
  workspaceMarker = randomUUID()
  fs.writeFileSync(path.join(workspace, ".rip-integration-workspace"), workspaceMarker)

  stageHost()
  assertMixedPreactBuiltInRender()
  exerciseFreshLocalInstall()
  writeFixture()

  buildVariant({
    name: "spa-en-us-yaml",
    locale: "en-US",
    enableSPA: true,
    typeScriptOverride: false,
    rootOptions: {
      layout: "cards",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      excludeDirs: [],
      descriptionFallback: "YAML fallback",
      defaultIcon: "book-open",
      defaultAccent: "ocean",
      accents: { ocean: "#0f766e" },
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(outputRoot, {
        "./custom/": ">0 notes</span>",
        "./generated/": ">1 note</span>",
        "./git.md/": ">1 note</span>",
        "./java/": ">2 notes</span>",
      })
      assert.match(anchorForHref(rootHtml, "./custom/"), /data-rip-icon="book-open"/)
      assert.match(anchorForHref(rootHtml, "./unsafe/"), /data-rip-accent="ocean"/)
      assert.match(emittedJavaScript(outputRoot), /route-announcer/)
    },
  })

  buildVariant({
    name: "no-spa-fi-ts",
    locale: "fi-FI",
    enableSPA: false,
    typeScriptOverride: true,
    rootOptions: {
      layout: "list",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      excludeDirs: [],
      descriptionFallback: "YAML fallback",
      defaultIcon: "terminal",
      defaultAccent: "theme",
      accents: { ocean: "#0f766e" },
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(outputRoot, {
        "./custom/": "0 muistiinpanoa",
        "./generated/": "1 muistiinpano",
        "./git.md/": "1 muistiinpano",
        "./java/": "2 muistiinpanoa",
      })
      const custom = anchorForHref(rootHtml, "./custom/")
      assert.match(custom, /data-rip-icon="custom-mark"/)
      assert.match(custom, /data-rip-test-icon="ts-custom"/)
      assert.match(custom, /data-rip-accent="direct"/)
      assert.match(custom, /--rip-panel-accent: #abc/)
      assert.match(anchorForHref(rootHtml, "./unsafe/"), /--rip-panel-accent: #abc/)
      const scripts = emittedJavaScript(outputRoot)
      assert.doesNotMatch(scripts, /route-announcer/)
      assert.match(scripts, /location\.assign/)
    },
  })

  buildVariant({
    name: "spa-en-gb-fallback-subpath",
    locale: "en-GB",
    enableSPA: true,
    typeScriptOverride: false,
    rootOptions: {
      layout: "cards",
      showDescription: true,
      showDocCount: true,
      showTags: true,
      tagCount: 2,
      sort: "alphabetical",
      excludeDirs: [],
      descriptionFallback: "YAML fallback",
      defaultIcon: "",
      defaultAccent: "theme",
      accents: { ocean: "#0f766e" },
    },
    assertVariant(outputRoot) {
      const rootHtml = assertCommonRoot(outputRoot, {
        "./custom/": ">0 notes</span>",
        "./generated/": ">1 note</span>",
        "./git.md/": ">1 note</span>",
        "./java/": ">2 notes</span>",
      })
      assert.doesNotMatch(anchorForHref(rootHtml, "./custom/"), /data-rip-icon=|rip-panel-icon/)
      const unsafe = anchorForHref(rootHtml, "./unsafe/")
      assert.doesNotMatch(unsafe, /data-rip-accent=|--rip-panel-accent/)
      assert.match(emittedJavaScript(outputRoot), /route-announcer/)
    },
  })

  process.stdout.write("✓ parent Quartz integration assertions passed\n")
}

try {
  runIntegration()
} catch (error) {
  process.exitCode = 1
  console.error(error?.stack ?? error)
} finally {
  if (workspace && KEEP_WORKSPACE) {
    console.log(`RIP_KEEP_INTEGRATION=1 preserved workspace: ${workspace}`)
    for (const output of outputDirectories) console.log(`Preserved output: ${output}`)
  } else if (workspace) {
    try {
      validateWorkspaceForCleanup()
      for (const linked of [...linkedDirectories].sort((a, b) => b.length - a.length)) {
        if (fs.existsSync(linked) && fs.lstatSync(linked).isSymbolicLink()) fs.unlinkSync(linked)
      }
      fs.rmSync(workspace, { recursive: true, force: true, maxRetries: 3 })
    } catch (cleanupError) {
      process.exitCode = 1
      console.error(`Integration workspace cleanup failed: ${cleanupError?.stack ?? cleanupError}`)
    }
  }
}
