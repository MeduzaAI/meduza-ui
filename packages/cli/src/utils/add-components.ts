import { fetchRegistryItem } from "@/registry/api"
import type { RegistryItem, Config } from "@/registry/schema"
import { updateFiles } from "@/utils/updaters/update-files"
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

    // Install registry dependencies recursively
    if (allRegistryDependencies.length > 0) {
        await addComponents(allRegistryDependencies, config, { overwrite: true, silent, isInit })
    }

    // Install files
    const allFiles = items.flatMap(item => item.files || [])
    await updateFiles(allFiles, config, { overwrite, silent })

    // Show success message
    if (!silent) {
        for (const componentName of components) {
            logger.success(`Added ${componentName}`)
        }
    }
}
