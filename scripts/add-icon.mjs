import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const manifestPath = path.join(root, "src", "built-in-icons.json")
const packagePath = path.join(root, "package.json")
const registryNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const exportNamePattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const npmCli = process.env.npm_execpath

function fail(message) {
  console.error(message)
  process.exit(1)
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function runNpm(args) {
  if (!npmCli) fail("npm_execpath is unavailable; run this script through npm")
  run(process.execPath, [npmCli, ...args])
}

function getLatestLucideVersion() {
  if (!npmCli) return null

  const result = spawnSync(process.execPath, [npmCli, "view", "lucide-preact", "version"], {
    cwd: root,
    encoding: "utf8",
  })
  if (result.error || result.status !== 0) return null

  const version = result.stdout.trim()
  return version.length > 0 ? version : null
}

function inferExportName(alias) {
  return alias
    .split("-")
    .map((part) => (part.length === 0 ? "" : part[0].toUpperCase() + part.slice(1)))
    .join("")
}

const [alias, explicitExportName, ...extra] = process.argv.slice(2)
if (!alias || extra.length > 0) {
  fail(
    "Usage: npm run icon:add -- <lucide-kebab-name> [LucideComponentExport]\n" +
      "Example: npm run icon:add -- book-copy\n" +
      "Override example: npm run icon:add -- code-2 CodeXml\n" +
      "Browse icons at https://lucide.dev/icons/",
  )
}
if (!registryNamePattern.test(alias)) {
  fail(`Invalid icon alias ${JSON.stringify(alias)}. Use lowercase kebab-case.`)
}

const exportName = explicitExportName ?? inferExportName(alias)
if (!exportNamePattern.test(exportName)) {
  fail(`Invalid Lucide export name ${JSON.stringify(exportName)}`)
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
const lucideVersion = packageJson.dependencies?.["lucide-preact"]
const lucide = await import("lucide-preact")
if (!Object.hasOwn(lucide, exportName) || typeof lucide[exportName] !== "function") {
  const latestVersion = getLatestLucideVersion()
  const installedVersion = lucideVersion ?? "(unknown version)"
  const updateHint =
    latestVersion && latestVersion !== lucideVersion
      ? `The project uses lucide-preact ${installedVersion}, while npm latest is ${latestVersion}.\n` +
        "The icon may have been added after the installed release. Update Lucide (or pull the latest main) and retry:\n" +
        "  npm install --save-exact lucide-preact@latest\n" +
        `  npm run icon:add -- ${alias}${explicitExportName ? ` ${explicitExportName}` : ""}\n`
      : ""

  fail(
    `lucide-preact ${installedVersion} does not export ${exportName}.\n` +
      updateHint +
      `Browse https://lucide.dev/icons/${alias} and, if needed, pass the component export explicitly:\n` +
      `  npm run icon:add -- ${alias} <LucideComponentExport>`,
  )
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
if (Object.hasOwn(manifest, alias) && manifest[alias] !== exportName) {
  fail(
    `${alias} is already registered as ${manifest[alias]}; edit src/built-in-icons.json explicitly to change an existing mapping.`,
  )
}
manifest[alias] = exportName

const sortedManifest = Object.fromEntries(
  Object.entries(manifest).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)),
)
fs.writeFileSync(manifestPath, `${JSON.stringify(sortedManifest, null, 2)}\n`)

run(process.execPath, [path.join(root, "scripts", "generate-icons.mjs")])
runNpm([
  "exec",
  "--",
  "prettier",
  "--write",
  "src/built-in-icons.json",
  "src/built-in-icons.generated.ts",
  "README.md",
])
runNpm(["run", "check"])
runNpm(["run", "build"])
runNpm(["run", "verify:dist"])
runNpm(["run", "verify:package"])

console.log(`Added built-in icon ${alias} -> ${exportName}`)
