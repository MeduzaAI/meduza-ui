import { cosmiconfig } from "cosmiconfig"
import fs from "fs-extra"
import * as path from "path"
import { z } from "zod"
import { configSchema, rawConfigSchema, DEFAULT_CONFIG, type Config, type RawConfig } from "../registry/schema"
import { getProjectInfo, type ProjectInfo } from "./get-project-info"

const MEDUZA_CONFIG_FILES = [
    "meduza.config.js",
    "meduza.config.ts",
    "meduza.config.json",
    ".meduzarc",
    ".meduzarc.json",
]

export async function getConfig(cwd: string): Promise<Config | null> {
    const config = await getRawConfig(cwd)

    if (!config) {
        return null
    }

    return await resolveConfigPaths(cwd, config)
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
    try {
        const explorer = cosmiconfig("meduza", {
            searchPlaces: MEDUZA_CONFIG_FILES,
        })

        const result = await explorer.search(cwd)

        if (!result) {
            return null
        }

        return rawConfigSchema.parse(result.config)
    } catch (error) {
        console.error("Error loading configuration:", error)
        return null
    }
}

export async function resolveConfigPaths(
    cwd: string,
    config: RawConfig
): Promise<Config> {
    // Merge with default registries
    const mergedConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        registries: {
            ...DEFAULT_CONFIG.registries,
            ...(config.registries || {}),
        },
    }

    // Get project info for intelligent path resolution
    const projectInfo = await getProjectInfo(cwd)

    return configSchema.parse({
        ...mergedConfig,
        resolvedPaths: {
            cwd,
            components: await resolveAlias(cwd, mergedConfig.aliases.components, projectInfo),
            ui: await resolveAlias(cwd, mergedConfig.aliases.ui, projectInfo),
            lib: await resolveAlias(cwd, mergedConfig.aliases.lib, projectInfo),
            utils: await resolveAlias(cwd, mergedConfig.aliases.utils, projectInfo),
            composables: await resolveAlias(cwd, mergedConfig.aliases.composables || "@/composables", projectInfo),
            assets: await resolveAlias(cwd, mergedConfig.aliases.assets || "@/assets", projectInfo),
            styles: await resolveAlias(cwd, mergedConfig.aliases.styles || "@/assets/styles", projectInfo)
        },
    })
}

async function resolveAlias(cwd: string, alias: string, projectInfo: ProjectInfo | null): Promise<string> {
    // Handle @ alias
    if (alias.startsWith("@/")) {
        const relativePath = alias.slice(2)

        // Use project info to determine the correct base directory
        if (projectInfo?.baseDir) {
            return path.resolve(cwd, projectInfo.baseDir, relativePath)
        }

        // Fallback to the old logic if project info is not available
        const srcPath = path.resolve(cwd, "src", relativePath)
        const appPath = path.resolve(cwd, "app", relativePath)
        const rootPath = path.resolve(cwd, relativePath)

        // Check if app directory exists (Nuxt 4) and prefer it
        if (await fs.pathExists(path.dirname(appPath))) {
            return appPath
        }

        // Check if src directory exists and prefer it
        if (await fs.pathExists(path.dirname(srcPath))) {
            return srcPath
        }

        return rootPath
    }

    // Handle other aliases (can be extended for different alias patterns)
    return path.resolve(cwd, alias)
}

export async function writeConfig(cwd: string, config: RawConfig): Promise<void> {
    const configPath = path.resolve(cwd, "meduza.config.json")
    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
}
