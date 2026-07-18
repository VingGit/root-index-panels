import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync } from "node:child_process"

const packageRoot = process.cwd()
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "root-index-panels-pack-"))
const resolvedTemporaryParent = fs.realpathSync(os.tmpdir())

function junction(target, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.symlinkSync(target, destination, process.platform === "win32" ? "junction" : "dir")
}

try {
  const npmCli = process.env.npm_execpath
  if (!npmCli) throw new Error("npm_execpath is unavailable; run this check through npm")

  const packOutput = execFileSync(
    process.execPath,
    [npmCli, "pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: packageRoot, encoding: "utf8" },
  )
  const [packResult] = JSON.parse(packOutput)
  if (!packResult?.filename || !Array.isArray(packResult.files)) {
    throw new Error("npm pack did not return the expected file manifest")
  }

  const packedPaths = new Set(packResult.files.map((file) => file.path))
  for (const required of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/types.js",
    "dist/types.d.ts",
    "dist/components/index.js",
    "dist/components/index.d.ts",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "README.md",
    "CHANGELOG.md",
    "package.json",
  ]) {
    if (!packedPaths.has(required)) throw new Error(`packed artifact is missing ${required}`)
  }

  const extractionRoot = path.join(temporaryRoot, "extract")
  fs.mkdirSync(extractionRoot)
  execFileSync("tar", ["-xf", path.join(temporaryRoot, packResult.filename), "-C", extractionRoot])

  const modulesRoot = path.join(temporaryRoot, "node_modules")
  const installedPackage = path.join(modulesRoot, "@quartz-community", "root-index-panels")
  fs.mkdirSync(path.dirname(installedPackage), { recursive: true })
  fs.renameSync(path.join(extractionRoot, "package"), installedPackage)

  junction(path.join(packageRoot, "node_modules", "preact"), path.join(modulesRoot, "preact"))
  junction(
    path.join(packageRoot, "node_modules", "@quartz-community", "types"),
    path.join(modulesRoot, "@quartz-community", "types"),
  )

  const runtimeConsumer = path.join(temporaryRoot, "consumer.mjs")
  fs.writeFileSync(
    runtimeConsumer,
    `
      const root = await import("@quartz-community/root-index-panels")
      const components = await import("@quartz-community/root-index-panels/components")
      await import("@quartz-community/root-index-panels/types")
      if (typeof root.RootIndexPanels !== "function") throw new Error("missing root component")
      if (typeof root.RootIndexPanelsPage !== "function") throw new Error("missing Page Type")
      if (typeof root.RootIndexSidebar !== "function") throw new Error("missing root sidebar")
      if (typeof components.RootIndexPanels !== "function") throw new Error("missing component entry")
      if (typeof components.RootIndexSidebar !== "function") {
        throw new Error("missing component sidebar entry")
      }
      if (typeof root.RootIndexPanels().afterDOMLoaded !== "string") {
        throw new Error("built inline script is unavailable")
      }
    `,
  )
  execFileSync(process.execPath, [runtimeConsumer], { cwd: temporaryRoot, stdio: "inherit" })

  const typeConsumer = path.join(temporaryRoot, "consumer.ts")
  fs.writeFileSync(
    typeConsumer,
    `
      import type {
        PanelIconComponent,
        RootIndexPanelsOptions,
        RootIndexPanelsPageOptions,
        RootIndexSidebarOptions,
      } from "@quartz-community/root-index-panels"
      import type {
        PanelIconComponent as ComponentIcon,
        RootIndexPanelsOptions as ComponentOptions,
        RootIndexSidebarOptions as ComponentSidebarOptions,
      } from "@quartz-community/root-index-panels/components"
      import type {
        PanelIconComponent as TypesIcon,
        RootIndexPanelsOptions as TypesOptions,
        RootIndexSidebarOptions as TypesSidebarOptions,
      } from "@quartz-community/root-index-panels/types"

      declare const icon: PanelIconComponent
      const options = {
        defaultIcon: "custom",
        icons: { custom: icon },
        defaultAccent: "brand",
        accents: { brand: "var(--brand)" },
      } satisfies RootIndexPanelsOptions
      const pageOptions: RootIndexPanelsPageOptions = options
      const sidebarOptions: RootIndexSidebarOptions = options
      const componentOptions: ComponentOptions = options
      const componentSidebarOptions: ComponentSidebarOptions = options
      const typesOptions: TypesOptions = options
      const typesSidebarOptions: TypesSidebarOptions = options
      const componentIcon: ComponentIcon = icon
      const typesIcon: TypesIcon = icon
      void [
        pageOptions,
        sidebarOptions,
        componentOptions,
        componentSidebarOptions,
        typesOptions,
        typesSidebarOptions,
        componentIcon,
        typesIcon,
      ]
    `,
  )
  const typeConfig = path.join(temporaryRoot, "tsconfig.json")
  fs.writeFileSync(
    typeConfig,
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        files: ["consumer.ts"],
      },
      null,
      2,
    ),
  )
  execFileSync(
    process.execPath,
    [path.join(packageRoot, "node_modules", "typescript", "bin", "tsc"), "-p", typeConfig],
    { cwd: temporaryRoot, stdio: "inherit" },
  )

  console.log("packed package runtime, exports, declarations, and allowlist verified")
} finally {
  const resolvedTarget = path.resolve(temporaryRoot)
  const allowedPrefix = `${resolvedTemporaryParent}${path.sep}`
  if (!resolvedTarget.startsWith(allowedPrefix) || path.basename(resolvedTarget).length < 20) {
    throw new Error(`refusing to remove unexpected temporary path: ${resolvedTarget}`)
  }
  fs.rmSync(resolvedTarget, { recursive: true, force: true })
}
