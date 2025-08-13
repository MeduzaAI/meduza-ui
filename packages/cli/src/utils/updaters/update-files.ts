import fs from "fs-extra"
import * as path from "path"
import prompts from "prompts"
import { type RegistryFile, type Config } from "@/registry/schema"
import { logger } from "@/utils/logger"
import { checkComponentConflicts } from "@/utils/validate-add"

export async function updateFiles(
    files: RegistryFile[],
    config: Config,
    options: {
        overwrite?: boolean
        silent?: boolean
    } = {}
) {
    const { overwrite = false, silent = false } = options

    if (files.length === 0) return

    for (const file of files) {
        const targetPath = getTargetPath(file, config)

        // Create directory if it doesn't exist
        await fs.ensureDir(path.dirname(targetPath))

        // Check if file exists
        const exists = await fs.pathExists(targetPath)

        if (exists && !overwrite) {
            if (!silent) {
                logger.warn(`File ${targetPath} already exists. Skipping.`)
            }
            continue
        }

        // Write file
        await fs.writeFile(targetPath, file.content, "utf8")

        if (!silent) {
            logger.success(`Created ${path.relative(config.resolvedPaths.cwd, targetPath)}`)
        }
    }
}

export async function updateFilesWithConflictCheck(
    files: RegistryFile[],
    config: Config,
    options: {
        overwrite?: boolean
        silent?: boolean
    } = {}
) {
    const { overwrite = false, silent = false } = options

    if (files.length === 0) return

    // Check for conflicts only for UI components
    const componentFiles = files.filter(file => file.type === "registry:ui")

    if (componentFiles.length > 0) {
        const componentNames = componentFiles.map(file => path.basename(file.path, ".vue"))
        const conflicts = await checkComponentConflicts(componentNames, config)

        if (conflicts.length > 0 && !overwrite) {
            if (!silent) {
                logger.warn(`The following components already exist: ${conflicts.join(", ")}`)

                const { proceed } = await prompts({
                    type: "confirm",
                    name: "proceed",
                    message: "Do you want to overwrite existing components?",
                    initial: false,
                })

                if (!proceed) {
                    logger.info("Installation cancelled.")
                    process.exit(0)
                }
            } else {
                throw new Error(`Components already exist: ${conflicts.join(", ")}. Use --overwrite to replace them.`)
            }
        }
    }

    // Use regular updateFiles for the actual file operations
    await updateFiles(files, config, { overwrite: true, silent })
}

function getTargetPath(file: RegistryFile, config: Config): string {
    const target = file.target || file.path

    // Handle different file types
    if (file.type === "file") {
        // Handle SCSS files first
        if (target.includes("_variables.scss")) {
            return config.resolvedPaths.scssVariables
        }
        if (target.includes("_mixins.scss")) {
            return config.resolvedPaths.scssMixins
        }
        if (target.includes("main.scss")) {
            return config.resolvedPaths.scssMain
        }

        // Handle lib files
        if (target.startsWith("lib/")) {
            const relativePath = target.slice("lib/".length)
            return path.resolve(config.resolvedPaths.lib, relativePath)
        }
        if (target.includes("utils.ts")) {
            const filename = path.basename(target)
            return path.resolve(config.resolvedPaths.lib, filename)
        }

        // Handle UI component files  
        if (target.startsWith("components/ui/")) {
            const relativePath = target.slice("components/ui/".length)
            return path.resolve(config.resolvedPaths.ui, relativePath)
        }
        if (target.startsWith("ui/")) {
            const relativePath = target.slice("ui/".length)
            return path.resolve(config.resolvedPaths.ui, relativePath)
        }
    }

    if (file.type === "registry:lib") {
        // Lib files go to the lib directory
        if (target.startsWith("lib/")) {
            const relativePath = target.slice("lib/".length)
            return path.resolve(config.resolvedPaths.lib, relativePath)
        }
        if (target.includes("utils")) {
            const filename = path.basename(target)
            return path.resolve(config.resolvedPaths.lib, filename)
        }
    }

    if (file.type === "registry:ui") {
        // UI components go to the ui directory
        if (target.startsWith("ui/")) {
            const relativePath = target.slice("ui/".length)
            return path.resolve(config.resolvedPaths.ui, relativePath)
        }
        if (target.startsWith("components/ui/")) {
            const relativePath = target.slice("components/ui/".length)
            return path.resolve(config.resolvedPaths.ui, relativePath)
        }
    }

    if (file.type === "registry:style") {
        // Style files go to their respective locations
        if (target.includes("_variables.scss")) {
            return config.resolvedPaths.scssVariables
        }
        if (target.includes("_mixins.scss")) {
            return config.resolvedPaths.scssMixins
        }
        if (target.includes("main.scss")) {
            return config.resolvedPaths.scssMain
        }
    }

    // Default: resolve relative to cwd
    return path.resolve(config.resolvedPaths.cwd, target)
}
