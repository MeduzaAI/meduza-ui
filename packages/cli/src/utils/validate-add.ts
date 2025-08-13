import * as fs from "fs-extra"
import * as path from "path"
import { type Config } from "@/registry/schema"
import { logger } from "./logger"

export async function validateAddCommand(
    componentNames: string[],
    config: Config
): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Check if required directories exist
    const requiredDirs = [
        config.resolvedPaths.ui,
        config.resolvedPaths.lib,
    ]

    for (const dir of requiredDirs) {
        if (!await fs.pathExists(dir)) {
            errors.push(`Required directory does not exist: ${dir}`)
        }
    }

    // Check if base utilities exist
    const utilsPath = path.resolve(config.resolvedPaths.utils + ".ts")
    if (!await fs.pathExists(utilsPath)) {
        errors.push(
            `Base utilities not found at ${utilsPath}. Please run 'npx meduza-ui init' first.`
        )
    }

    // Check if SCSS files exist
    if (!await fs.pathExists(config.resolvedPaths.scssVariables)) {
        errors.push(
            `SCSS variables file not found at ${config.resolvedPaths.scssVariables}. Please run 'npx meduza-ui init' first.`
        )
    }

    if (!await fs.pathExists(config.resolvedPaths.scssMixins)) {
        errors.push(
            `SCSS mixins file not found at ${config.resolvedPaths.scssMixins}. Please run 'npx meduza-ui init' first.`
        )
    }

    // Validate component names
    const invalidNames = componentNames.filter(name =>
        !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name) || name.length > 50
    )

    if (invalidNames.length > 0) {
        errors.push(`Invalid component names: ${invalidNames.join(", ")}`)
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

export async function checkComponentConflicts(
    componentNames: string[],
    config: Config
): Promise<string[]> {
    const conflicts: string[] = []

    for (const name of componentNames) {
        const componentPath = path.resolve(config.resolvedPaths.ui, `${name}.vue`)

        if (await fs.pathExists(componentPath)) {
            conflicts.push(name)
        }
    }

    return conflicts
}
