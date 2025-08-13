import fs from "fs-extra"
import * as path from "path"
import { fetchRegistryItem } from "@/registry/api"
import type { RegistryItem, Config } from "@/registry/schema"
import { updateFiles, updateFilesWithConflictCheck } from "@/utils/updaters/update-files"
import { updateDependencies } from "@/utils/updaters/update-dependencies"
import { logger } from "./logger"

export async function addComponents(
    components: string[],
    config: Config,
    options: {
        overwrite?: boolean
        silent?: boolean
        isInit?: boolean
    } = {}
) {
    if (components.length === 0) return

    const { overwrite = false, silent = false, isInit = false } = options

    // Fetch components from registry
    const spinner = silent ? null : logger.spin("Fetching components from registry...")

    const items: RegistryItem[] = []
    for (const componentName of components) {
        try {
            const registryConfig = config.registries?.["meduza-ui"]
            if (!registryConfig) {
                throw new Error("No meduza-ui registry configured")
            }
            const registryUrl = typeof registryConfig === "string" ? registryConfig : registryConfig.url
            // Remove the {name} template as fetchRegistryItem builds the full URL
            const baseUrl = registryUrl.replace("/{name}.json", "").replace("{name}", "")
            const item = await fetchRegistryItem(baseUrl, componentName)
            items.push(item)
        } catch (error) {
            if (!silent) {
                logger.stopSpinner(false, `Failed to fetch ${componentName}`)
            }
            throw error
        }
    }

    if (!silent) {
        logger.stopSpinner(true, "Components fetched.")
    }

    // Install dependencies
    const allDependencies = items.flatMap(item => item.dependencies || [])
    const allDevDependencies = items.flatMap(item => item.devDependencies || [])
    const allRegistryDependencies = items.flatMap(item => item.registryDependencies || [])

    if (allDependencies.length > 0 || allDevDependencies.length > 0) {
        await updateDependencies(allDependencies, allDevDependencies, config, { silent })
    }

    // Install registry dependencies recursively (skip if already exist)
    if (allRegistryDependencies.length > 0) {
        // Filter out dependencies that don't need to be installed
        const dependenciesToInstall = await filterExistingDependencies(allRegistryDependencies, config)

        if (dependenciesToInstall.length > 0) {
            if (!silent) {
                logger.info(`Installing dependencies: ${dependenciesToInstall.join(", ")}`)
            }
            // Don't overwrite existing dependency files to preserve user modifications
            await addComponents(dependenciesToInstall, config, { overwrite: false, silent: true, isInit })
        }
    }

    // Install files
    const allFiles = items.flatMap(item => item.files || [])

    // Use conflict checking only if not in init mode
    if (isInit) {
        await updateFiles(allFiles, config, { overwrite, silent })
    } else {
        await updateFilesWithConflictCheck(allFiles, config, { overwrite, silent })
    }

    // Show success message
    if (!silent) {
        for (const componentName of components) {
            logger.success(`Added ${componentName}`)
        }
    }
}

async function filterExistingDependencies(
    dependencies: string[],
    config: Config
): Promise<string[]> {
    const filteredDependencies: string[] = []

    for (const dependency of dependencies) {
        const shouldInstall = await checkIfDependencyNeeded(dependency, config)
        if (shouldInstall) {
            filteredDependencies.push(dependency)
        }
    }

    return filteredDependencies
}

async function checkIfDependencyNeeded(
    dependencyName: string,
    config: Config
): Promise<boolean> {
    // Check common dependency files that might already exist
    const commonPaths = [
        // For utils dependency
        path.resolve(config.resolvedPaths.utils + ".ts"),
        path.resolve(config.resolvedPaths.utils + ".js"),
        path.resolve(config.resolvedPaths.lib, "utils.ts"),
        path.resolve(config.resolvedPaths.lib, "utils.js"),
        // For UI component dependencies
        path.resolve(config.resolvedPaths.ui, `${dependencyName}.vue`),
        path.resolve(config.resolvedPaths.ui, `${dependencyName}.tsx`),
        path.resolve(config.resolvedPaths.ui, `${dependencyName}.ts`),
        // For composables dependencies
        path.resolve(config.resolvedPaths.composables, `${dependencyName}.ts`),
        path.resolve(config.resolvedPaths.composables, `${dependencyName}.js`),
        path.resolve(config.resolvedPaths.composables, `use${dependencyName}.ts`),
        path.resolve(config.resolvedPaths.composables, `use${dependencyName}.js`),
        path.resolve(config.resolvedPaths.composables, `use${dependencyName.charAt(0).toUpperCase() + dependencyName.slice(1)}.ts`),
        path.resolve(config.resolvedPaths.composables, `use${dependencyName.charAt(0).toUpperCase() + dependencyName.slice(1)}.js`),
    ]

    // If any of the common files for this dependency exist, skip installation
    for (const filePath of commonPaths) {
        if (await fs.pathExists(filePath)) {
            return false // Dependency already exists, don't install
        }
    }

    return true // Dependency doesn't exist, should install
}
