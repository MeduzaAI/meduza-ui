import { Command } from "commander"
import { z } from "zod"
import * as path from "path"
import prompts from "prompts"
import kleur from "kleur"

import { getConfig } from "@/utils/get-config"
import { getProjectInfo } from "@/utils/get-project-info"
import { logger } from "@/utils/logger"
import { handleError } from "@/utils/handle-error"
import { addComponents } from "@/utils/add-components"
import { fetchRegistryIndex } from "@/registry/api"
import { type Config, type RegistryIndex } from "@/registry/schema"

const addOptionsSchema = z.object({
    components: z.array(z.string()).optional(),
    yes: z.boolean(),
    overwrite: z.boolean(),
    cwd: z.string(),
    all: z.boolean(),
    silent: z.boolean(),
})

const DEPRECATED_COMPONENTS = [
    // Add any deprecated components here as they arise
    // Example:
    // {
    //   name: "old-button",
    //   deprecatedBy: "button",
    //   message: "The old-button component is deprecated. Use the button component instead.",
    // },
]

export const add = new Command()
    .name("add")
    .description("add components to your project")
    .argument("[components...]", "component names to add")
    .option("-y, --yes", "skip confirmation prompt.", false)
    .option("-o, --overwrite", "overwrite existing files.", false)
    .option(
        "-c, --cwd <cwd>",
        "the working directory. defaults to the current directory.",
        process.cwd()
    )
    .option("-a, --all", "add all available components", false)
    .option("-s, --silent", "mute output.", false)
    .action(async (components, opts) => {
        try {
            const options = addOptionsSchema.parse({
                components,
                cwd: path.resolve(opts.cwd),
                ...opts,
            })

            await runAdd(options)
        } catch (error) {
            handleError(error)
        }
    })

export async function runAdd(options: z.infer<typeof addOptionsSchema>) {
    // Check if project is initialized
    const config = await getConfig(options.cwd)

    if (!config) {
        logger.error("No configuration found. Please run the init command first:")
        logger.info("  " + kleur.cyan("npx meduza-ui init"))
        process.exit(1)
    }

    const projectInfo = await getProjectInfo(options.cwd)

    if (!projectInfo) {
        logger.error("Could not detect a Vue.js project. Please run this command in a Vue.js project directory.")
        process.exit(1)
    }

    if (!options.silent) {
        logger.info(`Adding components to ${kleur.cyan(projectInfo.framework)} project.`)
    }

    // Determine components to install
    let selectedComponents: string[]

    if (options.components?.length) {
        selectedComponents = options.components
    } else {
        selectedComponents = await promptForComponents(options, config)
    }

    // Check for deprecated components
    const deprecatedComponentsFound = selectedComponents.filter(component =>
        DEPRECATED_COMPONENTS.some(dep => dep.name === component)
    )

    if (deprecatedComponentsFound.length > 0) {
        for (const component of deprecatedComponentsFound) {
            const deprecated = DEPRECATED_COMPONENTS.find(dep => dep.name === component)
            if (deprecated) {
                logger.warn(deprecated.message)
            }
        }

        if (!options.yes) {
            const { proceed } = await prompts({
                type: "confirm",
                name: "proceed",
                message: "Do you want to continue with deprecated components?",
                initial: false,
            })

            if (!proceed) {
                process.exit(0)
            }
        }
    }

    // Install components
    await addComponents(selectedComponents, config, {
        overwrite: options.overwrite,
        silent: options.silent,
    })

    if (!options.silent) {
        logger.success(`Successfully added ${selectedComponents.length} component(s).`)
        logger.break()
        logger.info("Import the components in your Vue files:")

        selectedComponents.forEach(component => {
            const componentName = component.charAt(0).toUpperCase() + component.slice(1)
            logger.info(`  ${kleur.cyan(`import ${componentName} from '${config.aliases.ui}/${component}.vue'`)}`)
        })
    }
}

async function promptForComponents(
    options: z.infer<typeof addOptionsSchema>,
    config: Config
): Promise<string[]> {
    // Fetch registry index
    const spinner = logger.spin("Fetching registry...")

    let registryIndex: RegistryIndex
    try {
        const registryConfig = config.registries?.["meduza-ui"]
        if (!registryConfig) {
            throw new Error("No meduza-ui registry configured")
        }
        const registryUrl = typeof registryConfig === "string" ? registryConfig : registryConfig.url
        // Remove the {name} template as fetchRegistryIndex builds the full URL
        const baseUrl = registryUrl.replace("/{name}.json", "").replace("{name}", "")
        registryIndex = await fetchRegistryIndex(baseUrl)
        logger.stopSpinner(true, "Registry fetched.")
    } catch (error) {
        logger.stopSpinner(false, "Failed to fetch registry.")
        throw new Error("Failed to fetch components from registry. Please check your internet connection.")
    }

    if (!registryIndex || registryIndex.length === 0) {
        logger.error("No components found in registry.")
        process.exit(1)
    }

    // Filter for UI components only
    const uiComponents = registryIndex.filter(
        (entry) =>
            entry.type === "registry:ui" &&
            !DEPRECATED_COMPONENTS.some(dep => dep.name === entry.name)
    )

    if (uiComponents.length === 0) {
        logger.error("No UI components found in registry.")
        process.exit(1)
    }

    // Handle --all flag
    if (options.all) {
        return uiComponents.map(component => component.name)
    }

    // Interactive selection
    const { components } = await prompts({
        type: "multiselect",
        name: "components",
        message: "Which components would you like to add?",
        hint: "Space to select. A to toggle all. Enter to submit.",
        instructions: false,
        choices: uiComponents.map((entry) => ({
            title: entry.name,
            value: entry.name,
            description: entry.description || `Add ${entry.name} component`,
        })),
    })

    if (!components?.length) {
        logger.warn("No components selected. Exiting.")
        process.exit(1)
    }

    const result = z.array(z.string()).safeParse(components)
    if (!result.success) {
        logger.error("Something went wrong with component selection. Please try again.")
        process.exit(1)
    }

    return result.data
}
