import fs from "fs"
import path from "path"

const layoutPositions = new Set(["left", "right", "beforeBody", "afterBody"])

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
  if (!fs.existsSync(pkgPath)) {
    throw new Error("package.json not found")
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  const quartz = pkg.quartz

  if (!quartz) {
    console.warn(
      "\x1b[33m⚠ No 'quartz' field in package.json. Plugin may not load correctly in Quartz.\x1b[0m",
    )
    return
  }

  const errors: string[] = []

  requireString(quartz.name, "quartz.name", errors)
  requireString(quartz.displayName, "quartz.displayName", errors)
  requireString(quartz.description, "quartz.description", errors)
  requireString(quartz.version, "quartz.version", errors)

  const categories = Array.isArray(quartz.category) ? quartz.category : [quartz.category]
  if (!categories.includes("component")) {
    errors.push('quartz.category must include "component"')
  }

  if (!isRecord(quartz.configSchema)) {
    errors.push("quartz.configSchema is required for Quartz 5 option discovery")
  }

  if ("optionSchema" in quartz) {
    errors.push("quartz.optionSchema is ignored by Quartz 5; use quartz.configSchema")
  }

  if (!isRecord(quartz.components)) {
    errors.push("quartz.components must declare exported components")
  } else {
    const component = quartz.components["RootIndexPanels"]
    if (!isRecord(component)) {
      errors.push("quartz.components.RootIndexPanels is required")
    } else {
      requireString(component.name, "quartz.components.RootIndexPanels.name", errors)
      requireString(component.displayName, "quartz.components.RootIndexPanels.displayName", errors)
      requireString(component.description, "quartz.components.RootIndexPanels.description", errors)
      requireString(component.version, "quartz.components.RootIndexPanels.version", errors)

      if (
        typeof component.defaultPosition === "string" &&
        !layoutPositions.has(component.defaultPosition)
      ) {
        errors.push(
          `quartz.components.RootIndexPanels.defaultPosition must be one of ${[
            ...layoutPositions,
          ].join(", ")}`,
        )
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid Quartz plugin manifest:\n${errors.map((e) => `  - ${e}`).join("\n")}`)
  }
}
