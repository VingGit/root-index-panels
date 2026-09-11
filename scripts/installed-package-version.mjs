import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export function getInstalledPackageVersion(packageName) {
  let resolvedUrl
  try {
    resolvedUrl = import.meta.resolve(packageName)
  } catch {
    return null
  }

  let directory = path.dirname(fileURLToPath(resolvedUrl))
  while (true) {
    const packagePath = path.join(directory, "package.json")
    if (fs.existsSync(packagePath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
        if (packageJson.name === packageName && typeof packageJson.version === "string") {
          return packageJson.version
        }
      } catch {
        // Keep walking upward if this is not the package root we are looking for.
      }
    }

    const parent = path.dirname(directory)
    if (parent === directory) return null
    directory = parent
  }
}
