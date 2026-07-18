import fs from "fs"
import path from "path"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requireString(value: unknown, pathLabel: string, errors: string[]): void {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${pathLabel} must be a non-empty string`)
  }
}

export function validateManifest(): void {
  const pkgPath = path.resolve("package.json")
  if (!fs.existsSync(pkgPath)) throw new Error("package.json not found")

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  const quartz = pkg.quartz
  if (!isRecord(quartz)) throw new Error("package.json must contain a quartz manifest")

  const errors: string[] = []
  requireString(quartz.name, "quartz.name", errors)
  requireString(quartz.displayName, "quartz.displayName", errors)
  requireString(quartz.description, "quartz.description", errors)
  requireString(quartz.version, "quartz.version", errors)

  const categories = Array.isArray(quartz.category) ? quartz.category : [quartz.category]
  for (const category of ["pageType", "component"]) {
    if (!categories.includes(category)) errors.push(`quartz.category must include "${category}"`)
  }

  if (!isRecord(quartz.configSchema)) {
    errors.push("quartz.configSchema is required for Quartz 5 option discovery")
  } else {
    for (const option of ["defaultIcon", "defaultAccent"]) {
      if (!isRecord(quartz.configSchema[option])) {
        errors.push(`quartz.configSchema.${option} is required`)
      }
    }
    if ("icons" in quartz.configSchema) {
      errors.push(
        "quartz.configSchema.icons must be omitted because components are TypeScript-only",
      )
    }
  }

  if ("optionSchema" in quartz) {
    errors.push("quartz.optionSchema is ignored by Quartz 5; use quartz.configSchema")
  }

  if (quartz.version !== pkg.version) {
    errors.push("quartz.version must equal package.version")
  }

  if (!isRecord(quartz.components)) {
    errors.push("quartz.components must declare exported components")
  } else {
    const component = quartz.components.RootIndexPanels
    if (!isRecord(component)) {
      errors.push("quartz.components.RootIndexPanels is required")
    } else {
      for (const field of [
        "name",
        "displayName",
        "description",
        "version",
        "quartzVersion",
        "author",
        "homepage",
      ]) {
        requireString(component[field], `quartz.components.RootIndexPanels.${field}`, errors)
      }
      if (component.version !== pkg.version) {
        errors.push("quartz.components.RootIndexPanels.version must equal package.version")
      }
      if ("defaultPosition" in component || "defaultPriority" in component) {
        errors.push(
          "quartz.components.RootIndexPanels must not define layout defaults for its Page Type body",
        )
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid Quartz plugin manifest:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    )
  }
}
