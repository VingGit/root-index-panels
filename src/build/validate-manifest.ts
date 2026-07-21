import fs from "fs"
import path from "path"

const REQUIRED_PLUGIN_DEPENDENCIES = ["github:quartz-community/folder-page"] as const

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
    for (const option of ["defaultIcon", "defaultAccent", "replaceExplorer"]) {
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

  if (
    !Array.isArray(quartz.dependencies) ||
    quartz.dependencies.length !== REQUIRED_PLUGIN_DEPENDENCIES.length ||
    quartz.dependencies.some(
      (dependency, index) => dependency !== REQUIRED_PLUGIN_DEPENDENCIES[index],
    )
  ) {
    errors.push(`quartz.dependencies must equal ${JSON.stringify(REQUIRED_PLUGIN_DEPENDENCIES)}`)
  }

  if (!isRecord(quartz.components)) {
    errors.push("quartz.components must declare exported components")
  } else {
    const componentNames = Object.keys(quartz.components)
    if (componentNames.length !== 1 || componentNames[0] !== "RootIndexSidebar") {
      errors.push(
        "quartz.components must declare exactly RootIndexSidebar so the CLI installs one left component",
      )
    }

    const component = quartz.components.RootIndexSidebar
    if (!isRecord(component)) {
      errors.push("quartz.components.RootIndexSidebar is required")
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
        requireString(component[field], `quartz.components.RootIndexSidebar.${field}`, errors)
      }
      if (component.version !== pkg.version) {
        errors.push("quartz.components.RootIndexSidebar.version must equal package.version")
      }
      if (component.defaultPosition !== "left") {
        errors.push("quartz.components.RootIndexSidebar.defaultPosition must equal left")
      }
      if (component.defaultPriority !== 40) {
        errors.push("quartz.components.RootIndexSidebar.defaultPriority must equal 40")
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid Quartz plugin manifest:\n${errors.map((error) => `  - ${error}`).join("\n")}`,
    )
  }
}
