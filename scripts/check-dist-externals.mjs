import fs from "node:fs"
import path from "node:path"
import { builtinModules } from "node:module"

const distDirectory = path.resolve("dist")
if (!fs.existsSync(distDirectory)) {
  throw new Error("dist/ is missing; run npm run build first")
}

function javascriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return javascriptFiles(target)
    return entry.isFile() && entry.name.endsWith(".js") ? [target] : []
  })
}

const allowedPackages = ["preact", "@jackyzha0/quartz", "vfile", "unified"]
const builtins = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]))
const importPattern =
  /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']|\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g
const unexpected = new Map()
const bundledSingletonMarkers = [
  "node_modules/preact/",
  "node_modules/@jackyzha0/quartz/",
  "node_modules/vfile/",
  "node_modules/unified/",
]
const bundledSingletons = new Map()
const importsByFile = new Map()

for (const file of javascriptFiles(distDirectory)) {
  const content = fs.readFileSync(file, "utf8")
  const fileImports = new Set()
  importsByFile.set(path.resolve(file), fileImports)
  for (const marker of bundledSingletonMarkers) {
    if (!content.includes(marker)) continue
    const locations = bundledSingletons.get(marker) ?? []
    locations.push(path.relative(process.cwd(), file))
    bundledSingletons.set(marker, locations)
  }

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2]
    if (!specifier || specifier.startsWith(".") || specifier.startsWith("/")) continue
    fileImports.add(specifier)
    if (builtins.has(specifier)) continue
    if (allowedPackages.some((name) => specifier === name || specifier.startsWith(`${name}/`))) {
      continue
    }

    const relativeFile = path.relative(process.cwd(), file)
    const locations = unexpected.get(specifier) ?? []
    locations.push(relativeFile)
    unexpected.set(specifier, locations)
  }
}

for (const uiEntry of [
  path.join(distDirectory, "index.js"),
  path.join(distDirectory, "components", "index.js"),
]) {
  const imports = importsByFile.get(path.resolve(uiEntry))
  if (
    !imports ||
    ![...imports].some((specifier) => specifier === "preact" || specifier.startsWith("preact/"))
  ) {
    throw new Error(
      `${path.relative(process.cwd(), uiEntry)} does not externalize the Preact singleton`,
    )
  }
}

if (bundledSingletons.size > 0) {
  const details = [...bundledSingletons.entries()]
    .map(([marker, files]) => `  - ${marker} (${[...new Set(files)].join(", ")})`)
    .join("\n")
  throw new Error(`dist/ bundles Quartz host singletons:\n${details}`)
}

if (unexpected.size > 0) {
  const details = [...unexpected.entries()]
    .map(([specifier, files]) => `  - ${specifier} (${[...new Set(files)].join(", ")})`)
    .join("\n")
  throw new Error(`dist/ contains unexpected bare runtime imports:\n${details}`)
}

console.log("dist/ externals verified across every JavaScript entry")
