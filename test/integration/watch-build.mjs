import assert from "node:assert/strict"
import { spawn, spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { createRequire } from "node:module"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const WORKSPACE_PREFIX = "root-index-panels-watch-"
const MARKER_NAME = ".rip-watch-workspace"
const WAIT_TIMEOUT_MS = 90_000
const KEEP_WORKSPACE = process.env.RIP_KEEP_INTEGRATION === "1"
const HOST_PLUGIN_NAMES = new Set([
  "article-title",
  "content-index",
  "content-meta",
  "content-page",
  "description",
  "folder-page",
  "footer",
  "note-properties",
  "og-image",
  "table-of-contents",
  "tag-list",
  "tag-page",
  "unlisted-pages",
])

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const pluginRoot = path.resolve(scriptDirectory, "..", "..")
const linkedDirectories = new Set()
let workspace
let workspaceMarker
let localPluginSource
let watcher
let watcherOutput = ""
let watcherExit

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

function writeWorkspaceFile(relativePath, contents) {
  const target = path.resolve(workspace, relativePath)
  assertInside(workspace, target, "fixture file")
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, contents)
  return target
}

function linkDirectory(source, destination) {
  assert.ok(fs.statSync(source).isDirectory(), `directory source does not exist: ${source}`)
  assertInside(workspace, destination, "linked directory")
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.symlinkSync(source, destination, process.platform === "win32" ? "junction" : "dir")
  linkedDirectories.add(destination)
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

function copyCurrentPluginPackage(destination) {
  const files = ["package.json", "LICENSE", "THIRD_PARTY_NOTICES.md"]
  fs.mkdirSync(destination, { recursive: true })
  for (const fileName of files) {
    const source = path.join(pluginRoot, fileName)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(destination, fileName))
  }
  fs.cpSync(path.join(pluginRoot, "dist"), path.join(destination, "dist"), { recursive: true })
}

function stageHost() {
  assert.equal(
    readJson(path.join(pluginRoot, "package.json")).name,
    "@quartz-community/root-index-panels",
  )
  assert.ok(
    fs.existsSync(path.join(pluginRoot, "dist", "index.js")),
    "build plugin dist/ before running the watch diagnostic",
  )

  copyQuartzSource()
  linkDirectory(path.join(quartzRoot, "node_modules"), path.join(workspace, "node_modules"))

  for (const fileName of ["package.json", "package-lock.json", "tsconfig.json", "globals.d.ts"]) {
    const source = path.join(quartzRoot, fileName)
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(workspace, fileName))
  }

  localPluginSource = path.join(workspace, ".rip-plugin-source", "root-index-panels")
  copyCurrentPluginPackage(localPluginSource)

  const parentPlugins = path.join(quartzRoot, ".quartz", "plugins")
  const stagedPlugins = path.join(workspace, ".quartz", "plugins")
  fs.mkdirSync(stagedPlugins, { recursive: true })

  for (const entry of fs.readdirSync(parentPlugins, { withFileTypes: true })) {
    if (!entry.isDirectory() || !HOST_PLUGIN_NAMES.has(entry.name)) continue
    linkDirectory(path.join(parentPlugins, entry.name), path.join(stagedPlugins, entry.name))
  }

  linkDirectory(localPluginSource, path.join(stagedPlugins, "root-index-panels"))
  assert.equal(
    fs.readFileSync(path.join(stagedPlugins, "root-index-panels", "dist", "index.js"), "utf8"),
    fs.readFileSync(path.join(pluginRoot, "dist", "index.js"), "utf8"),
    "staged plugin output must match the current worktree dist",
  )
  writeWorkspaceFile(
    ".quartz/plugins/index.ts",
    `export const CustomOgImagesEmitterName = "CustomOgImages"\n\nexport type ContentDetails = {\n  slug: string\n  filePath: string\n  title: string\n  links: string[]\n  tags: string[]\n  content: string\n  richContent?: string\n  date?: Date\n  description?: string\n}\n`,
  )
  const lock = readJson(path.join(quartzRoot, "quartz.lock.json"))
  lock.plugins = Object.fromEntries(
    Object.entries(lock.plugins).filter(
      ([name]) => HOST_PLUGIN_NAMES.has(name) || name === "root-index-panels",
    ),
  )
  writeWorkspaceFile("quartz.lock.json", `${JSON.stringify(lock, null, 2)}\n`)
}

const theme = {
  fontOrigin: "local",
  cdnCaching: true,
  typography: { header: "Arial", body: "Arial", code: "monospace" },
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
  return { source: `github:quartz-community/${name}`, enabled: true, ...extra }
}

function writeConfig(rootSource) {
  const config = {
    configuration: {
      pageTitle: "Root Index Panels Watch Diagnostic",
      pageTitleSuffix: "",
      enableSPA: false,
      enablePopovers: false,
      analytics: null,
      locale: "en-US",
      baseUrl: "watch.example",
      ignorePatterns: [],
      theme,
    },
    plugins: [
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
        options: { maxDepth: 3, minEntries: 1, showByDefault: true, collapseByDefault: false },
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
      communityPlugin("footer", { order: 50, options: { links: {} } }),
      {
        source: rootSource,
        enabled: true,
        order: 50,
        options: {
          layout: "cards",
          showDescription: true,
          showDocCount: true,
          showTags: false,
          tagCount: 0,
          sort: "alphabetical",
          excludeDirs: [],
          descriptionFallback: "",
          defaultIcon: "",
          defaultAccent: "theme",
          accents: {},
        },
      },
    ],
    layout: { groups: {}, byPageType: { content: {}, folder: {}, tag: {} } },
  }

  writeWorkspaceFile(
    "quartz.config.yaml",
    `# yaml-language-server: $schema=./quartz/plugins/quartz-plugins.schema.json\n${YAML.stringify(config, { lineWidth: 120 })}`,
  )
  writeWorkspaceFile(
    "quartz.ts",
    'import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"\n\nconst config = await loadQuartzConfig()\nexport default config\nexport const layout = await loadQuartzLayout()\n',
  )
}

function runQuartz(args, label, timeout = 120_000) {
  const result = spawnSync(
    process.execPath,
    [path.join(workspace, "quartz", "bootstrap-cli.mjs"), ...args],
    {
      cwd: workspace,
      env: { ...process.env, CI: "1", NO_COLOR: "1" },
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      timeout,
    },
  )
  if (result.error || result.status !== 0) {
    throw new Error(
      `${label} failed\n${result.error?.stack ?? ""}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }
}

function exerciseFreshLocalInstall() {
  runQuartz(["plugin", "remove", "root-index-panels", "--concurrency", "1"], "fresh plugin remove")
  runQuartz(["plugin", "add", localPluginSource, "--concurrency", "1"], "fresh local plugin add")

  const lock = readJson(path.join(workspace, "quartz.lock.json"))
  assert.equal(lock.plugins["root-index-panels"]?.commit, "local")
  assert.equal(
    fs.realpathSync(lock.plugins["root-index-panels"].resolved),
    fs.realpathSync(localPluginSource),
  )
  assert.equal(
    fs.realpathSync(path.join(workspace, ".quartz", "plugins", "root-index-panels")),
    fs.realpathSync(localPluginSource),
  )
  process.stdout.write("✓ public plugin remove/add installed the temporary local package\n")
}

function bookIndex(description, body) {
  return `---\ntitle: Java Book\ndescription: ${description}\n---\n# ${body}\n`
}

function writeFixture() {
  writeWorkspaceFile("content/index.md", "---\ntitle: Home\n---\n# Root source\n")
  writeWorkspaceFile("content/java/index.md", bookIndex("OLD WATCH DESCRIPTION", "OLD BOOK BODY"))
  writeWorkspaceFile("content/java/one.md", "---\ntitle: One\n---\n# One note\n")
}

function rootHtml() {
  return fs.readFileSync(path.join(workspace, "public", "watch", "index.html"), "utf8")
}

function javaPanel(html) {
  const hrefIndex = html.indexOf('href="./java/"')
  assert.notEqual(
    hrefIndex,
    -1,
    `root output is missing the Java book panel; rendered Root Index Panels fragment: ${html.match(/<div class="rip[\s\S]{0,1000}/)?.[0] ?? "none"}`,
  )
  const start = html.lastIndexOf("<a", hrefIndex)
  const end = html.indexOf("</a>", hrefIndex)
  assert.ok(start >= 0 && end > hrefIndex, "could not isolate the Java book panel")
  return html.slice(start, end + 4)
}

function panelCount(html) {
  const match = javaPanel(html).match(/<span class="rip-count"[^>]*>(\d+)<\/span>/)
  assert.ok(match, "Java panel is missing its document count")
  return Number(match[1])
}

function panelDescription(html) {
  const match = javaPanel(html).match(/<p class="rip-desc"[^>]*>([^<]*)<\/p>/)
  assert.ok(match, "Java panel is missing its description")
  return match[1]
}

function stripAnsi(value) {
  return value.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`, "g"), "")
}

function watcherLog() {
  return stripAnsi(watcherOutput)
}

function countRebuilds() {
  return watcherLog().match(/Done rebuilding/g)?.length ?? 0
}

function outputTail() {
  return watcherLog().slice(-8_000)
}

async function waitUntil(predicate, label, timeout = WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (predicate()) return
    if (watcherExit?.settled) {
      throw new Error(`${label}: watch process exited unexpectedly\n${outputTail()}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`${label}: timed out after ${timeout}ms\n${outputTail()}`)
}

async function waitForRebuild(previousCount, label) {
  await waitUntil(() => countRebuilds() > previousCount, label)
}

function quartzArguments(extra) {
  return [
    path.join(workspace, "quartz", "bootstrap-cli.mjs"),
    "build",
    "--directory",
    "content",
    "--output",
    path.join("public", "watch"),
    "--concurrency",
    "1",
    ...extra,
  ]
}

async function startWatcher() {
  watcherOutput = ""
  watcherExit = { settled: false, code: undefined, signal: undefined }
  watcher = spawn(process.execPath, quartzArguments(["--watch"]), {
    cwd: workspace,
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  })
  watcher.stdout.on("data", (chunk) => {
    watcherOutput += chunk.toString()
  })
  watcher.stderr.on("data", (chunk) => {
    watcherOutput += chunk.toString()
  })
  watcher.on("exit", (code, signal) => {
    watcherExit = { settled: true, code, signal }
  })

  await waitUntil(
    () => watcherLog().includes("hint: exit with ctrl+c"),
    "initial watch build did not become ready",
  )
}

async function stopWatcher() {
  if (!watcher || watcherExit?.settled) return

  watcher.kill("SIGTERM")
  const deadline = Date.now() + 5_000
  while (!watcherExit.settled && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (!watcherExit.settled) {
    watcher.kill("SIGKILL")
    const killDeadline = Date.now() + 5_000
    while (!watcherExit.settled && Date.now() < killDeadline) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  assert.ok(watcherExit.settled, `watch process ${watcher.pid} did not terminate`)
}

function runFullBuild() {
  const result = spawnSync(process.execPath, quartzArguments([]), {
    cwd: workspace,
    env: { ...process.env, CI: "1", NO_COLOR: "1" },
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 300_000,
  })
  if (result.error || result.status !== 0) {
    throw new Error(
      `clean/full Quartz build failed\n${result.error?.stack ?? ""}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
    )
  }
}

function classify(actual, stale, fresh) {
  assert.ok(
    actual === stale || actual === fresh,
    `watch output was neither the prior aggregate (${JSON.stringify(stale)}) nor the correct aggregate (${JSON.stringify(fresh)}): ${JSON.stringify(actual)}`,
  )
  return actual === stale ? "STALE (known limitation reproduced)" : "FRESH (host behavior improved)"
}

async function runDiagnostic() {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), WORKSPACE_PREFIX))
  workspaceMarker = randomUUID()
  fs.writeFileSync(path.join(workspace, MARKER_NAME), workspaceMarker)

  stageHost()
  writeConfig("github:VingGit/root-index-panels")
  exerciseFreshLocalInstall()
  writeConfig(localPluginSource.replaceAll("\\", "/"))
  writeFixture()
  await startWatcher()

  let html = rootHtml()
  assert.equal(panelCount(html), 1, "initial full watch build must count one Java note")
  assert.equal(
    panelDescription(html),
    "OLD WATCH DESCRIPTION",
    "initial full watch build must render the original Java description",
  )
  process.stdout.write("✓ initial watch build rendered count=1 and the original description\n")

  let previousRebuilds = countRebuilds()
  writeWorkspaceFile("content/java/two.md", "---\ntitle: Two\n---\n# ADDED NOTE SENTINEL\n")
  await waitForRebuild(previousRebuilds, "watcher did not process the nested add")
  assert.match(
    fs.readFileSync(path.join(workspace, "public", "watch", "java", "two.html"), "utf8"),
    /ADDED NOTE SENTINEL/,
    "watcher reported a rebuild without emitting the added nested page",
  )
  html = rootHtml()
  const addCount = panelCount(html)
  process.stdout.write(`• nested add: root count=${addCount} — ${classify(addCount, 1, 2)}\n`)

  previousRebuilds = countRebuilds()
  writeWorkspaceFile(
    "content/java/index.md",
    bookIndex("NEW WATCH DESCRIPTION", "UPDATED BOOK BODY SENTINEL"),
  )
  await waitForRebuild(previousRebuilds, "watcher did not process the nested index change")
  assert.match(
    fs.readFileSync(path.join(workspace, "public", "watch", "java", "index.html"), "utf8"),
    /UPDATED BOOK BODY SENTINEL/,
    "watcher reported a rebuild without emitting the changed book index",
  )
  html = rootHtml()
  const changedDescription = panelDescription(html)
  process.stdout.write(
    `• nested change: root description=${JSON.stringify(changedDescription)} — ${classify(changedDescription, "OLD WATCH DESCRIPTION", "NEW WATCH DESCRIPTION")}\n`,
  )

  previousRebuilds = countRebuilds()
  writeWorkspaceFile(
    "content/index.md",
    "---\ntitle: Home\n---\n# ROOT AGGREGATE REFRESH SENTINEL\n",
  )
  await waitForRebuild(previousRebuilds, "watcher did not process the direct root refresh")
  html = rootHtml()
  assert.equal(panelCount(html), 2, "direct root refresh must establish a two-note aggregate")
  assert.equal(
    panelDescription(html),
    "NEW WATCH DESCRIPTION",
    "direct root refresh must establish the changed book description",
  )
  process.stdout.write("✓ direct root refresh established count=2 and the changed description\n")

  previousRebuilds = countRebuilds()
  fs.unlinkSync(path.join(workspace, "content", "java", "two.md"))
  await waitForRebuild(previousRebuilds, "watcher did not process the nested delete")
  html = rootHtml()
  const deleteCount = panelCount(html)
  process.stdout.write(
    `• nested delete: root count=${deleteCount} — ${classify(deleteCount, 2, 1)}\n`,
  )

  await stopWatcher()
  runFullBuild()
  html = rootHtml()
  assert.equal(panelCount(html), 1, "clean/full build must refresh the Java count to one")
  assert.equal(
    panelDescription(html),
    "NEW WATCH DESCRIPTION",
    "clean/full build must refresh the Java description",
  )
  process.stdout.write("✓ clean/full build refreshed count=1 and the changed description\n")

  const staleObservations = [
    addCount === 1,
    changedDescription === "OLD WATCH DESCRIPTION",
    deleteCount === 2,
  ].filter(Boolean).length
  if (staleObservations > 0) {
    process.stdout.write(
      `EXPECTED LIMITATION: reproduced ${staleObservations}/3 stale root aggregate observations; the diagnostic exits successfully because clean/full-build correctness passed.\n`,
    )
  } else {
    process.stdout.write(
      "INFO: watch invalidation was fresh for all observations; the host may now invalidate aggregate dependencies.\n",
    )
  }
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
    fs.readFileSync(path.join(realWorkspace, MARKER_NAME), "utf8"),
    workspaceMarker,
    "temporary workspace marker did not match",
  )
}

try {
  await runDiagnostic()
} catch (error) {
  process.exitCode = 1
  console.error(error?.stack ?? error)
} finally {
  await stopWatcher()
  if (workspace) {
    try {
      validateWorkspaceForCleanup()
      if (KEEP_WORKSPACE) {
        console.log(`RIP_KEEP_INTEGRATION=1 preserved workspace: ${workspace}`)
        console.log(`Preserved output: ${path.join(workspace, "public", "watch")}`)
      } else {
        for (const linked of [...linkedDirectories].sort((a, b) => b.length - a.length)) {
          if (fs.existsSync(linked) && fs.lstatSync(linked).isSymbolicLink()) fs.unlinkSync(linked)
        }
        fs.rmSync(workspace, { recursive: true, force: true, maxRetries: 3 })
      }
    } catch (cleanupError) {
      process.exitCode = 1
      console.error(`Watch workspace cleanup failed: ${cleanupError?.stack ?? cleanupError}`)
    }
  }
}
