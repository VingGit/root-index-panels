import fs from "node:fs"
import path from "node:path"

const distributionRoot = path.resolve("dist")

function sourceMaps(directory) {
  const results = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name)
    if (entry.isDirectory()) results.push(...sourceMaps(candidate))
    else if (entry.isFile() && entry.name.endsWith(".map")) results.push(candidate)
  }

  return results
}

if (!fs.existsSync(distributionRoot)) {
  throw new Error(`source-map normalization requires an existing dist/: ${distributionRoot}`)
}

const maps = sourceMaps(distributionRoot)
if (maps.length === 0) throw new Error("source-map normalization found no dist/**/*.map files")

for (const mapPath of maps) {
  const sourceMap = JSON.parse(fs.readFileSync(mapPath, "utf8"))

  if (Array.isArray(sourceMap.sourcesContent)) {
    sourceMap.sourcesContent = sourceMap.sourcesContent.map((source) =>
      typeof source === "string" ? source.replace(/\r\n?/g, "\n") : source,
    )
  }

  fs.writeFileSync(mapPath, `${JSON.stringify(sourceMap)}\n`)
}

console.log(`normalized embedded source line endings in ${maps.length} source maps`)
