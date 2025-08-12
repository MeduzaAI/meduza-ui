import { execa } from "execa"
import { getPackageManager } from "@/utils/get-package-manager"
import { type Config } from "@/registry/schema"
import { logger } from "@/utils/logger"

export async function updateDependencies(
    dependencies: string[],
    devDependencies: string[],
    config: Config,
    options: {
        silent?: boolean
    } = {}
) {
    const { silent = false } = options

    if (dependencies.length === 0 && devDependencies.length === 0) {
        return
    }

    const packageManager = await getPackageManager(config.resolvedPaths.cwd)

    // Install regular dependencies
    if (dependencies.length > 0) {
        const spinner = silent ? null : logger.spin(`Installing dependencies...`)

        try {
            await installDependencies(packageManager, dependencies, false, config.resolvedPaths.cwd)

            if (!silent) {
                logger.stopSpinner(true, `Installed ${dependencies.length} dependencies.`)
            }
        } catch (error) {
            if (!silent) {
                logger.stopSpinner(false, "Failed to install dependencies.")
            }
            throw error
        }
    }

    // Install dev dependencies
    if (devDependencies.length > 0) {
        const spinner = silent ? null : logger.spin(`Installing dev dependencies...`)

        try {
            await installDependencies(packageManager, devDependencies, true, config.resolvedPaths.cwd)

            if (!silent) {
                logger.stopSpinner(true, `Installed ${devDependencies.length} dev dependencies.`)
            }
        } catch (error) {
            if (!silent) {
                logger.stopSpinner(false, "Failed to install dev dependencies.")
            }
            throw error
        }
    }
}

async function installDependencies(
    packageManager: string,
    packages: string[],
    isDev: boolean,
    cwd: string
) {
    const commands: Record<string, string[]> = {
        npm: ["install", ...(isDev ? ["--save-dev"] : []), ...packages],
        yarn: ["add", ...(isDev ? ["--dev"] : []), ...packages],
        pnpm: ["add", ...(isDev ? ["--save-dev"] : []), ...packages],
        bun: ["add", ...(isDev ? ["--development"] : []), ...packages],
    }

    const command = commands[packageManager]
    if (!command) {
        throw new Error(`Unsupported package manager: ${packageManager}`)
    }

    await execa(packageManager, command, { cwd })
}
