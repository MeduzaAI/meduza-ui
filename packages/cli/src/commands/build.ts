import { Command } from "commander"
import { z } from "zod"
import fs from "fs-extra"
import * as path from "path"
import kleur from "kleur"

import { logger, spinner, highlighter } from "@/utils/logger"
import { handleError } from "@/utils/handle-error"
import { registrySchema, registryItemSchema } from "@/registry/schema"
import { preFlightBuild } from "@/utils/preflight-build"

const buildOptionsSchema = z.object({
    cwd: z.string(),
    registryFile: z.string(),
    outputDir: z.string(),
    verbose: z.boolean().optional().default(false),
})

export const build = new Command()
    .name("build")
    .description("build components for a Meduza UI registry")
    .argument("[registry]", "path to registry.json file", "./registry.json")
    .option(
        "-o, --output <path>",
        "destination directory for json files",
        "./public/r"
    )
    .option(
        "-c, --cwd <cwd>",
        "the working directory. defaults to the current directory.",
        process.cwd()
    )
    .option("-v, --verbose", "verbose output", false)
    .action(async (registry: string, opts) => {
        try {
            const options = buildOptionsSchema.parse({
                cwd: path.resolve(opts.cwd),
                registryFile: registry,
                outputDir: opts.output,
                verbose: opts.verbose,
            })

            await runBuild(options)
        } catch (error) {
            handleError(error)
        }
    })

export async function runBuild(options: z.infer<typeof buildOptionsSchema>) {
    const { resolvePaths } = await preFlightBuild(options)

    if (!resolvePaths) {
        logger.error(
            `We could not find a registry file at ${highlighter.info(
                path.resolve(options.cwd, options.registryFile)
            )}.`
        )
        process.exit(1)
    }

    // Read and validate registry configuration
    const content = await fs.readFile(resolvePaths.registryFile, "utf-8")
    const result = registrySchema.safeParse(JSON.parse(content))

    if (!result.success) {
        logger.error(
            `Invalid registry file found at ${highlighter.info(
                resolvePaths.registryFile
            )}.`
        )
        logger.break()
        if (options.verbose) {
            console.error(kleur.dim(result.error.toString()))
        }
        process.exit(1)
    }

    // Ensure output directory exists
    await fs.ensureDir(resolvePaths.outputDir)

    const buildSpinner = spinner("Building registry...")
    const registry = result.data

    try {
        buildSpinner.start()

        // Process each component in the registry
        for (const registryItem of registry.items) {
            if (!registryItem.files) {
                continue
            }

            if (options.verbose) {
                buildSpinner.text = `Building ${registryItem.name}...`
            }

            // Add the schema reference
            registryItem["$schema"] = "https://meduza-ui.dev/schema/registry-item.json"

            // Read and process component files
            for (const file of registryItem.files) {
                const absPath = path.resolve(resolvePaths.cwd, file.path)

                try {
                    const stat = await fs.stat(absPath)
                    if (!stat.isFile()) {
                        continue
                    }

                    // Read file content and add to registry item
                    file["content"] = await fs.readFile(absPath, "utf-8")
                } catch (err) {
                    logger.warn(`Could not read file: ${file.path}`)
                    continue
                }
            }

            // Validate the component registry item
            const itemResult = registryItemSchema.safeParse(registryItem)
            if (!itemResult.success) {
                logger.error(
                    `Invalid registry item found for ${highlighter.info(
                        registryItem.name
                    )}.`
                )
                if (options.verbose) {
                    console.error(kleur.dim(itemResult.error.toString()))
                }
                continue
            }

            // Write individual component JSON file
            const outputPath = path.resolve(resolvePaths.outputDir, `${itemResult.data.name}.json`)
            await fs.writeFile(
                outputPath,
                JSON.stringify(itemResult.data, null, 2)
            )

            if (options.verbose) {
                logger.log(`  ✓ ${itemResult.data.name} → ${path.relative(options.cwd, outputPath)}`)
            }
        }

        // Copy main registry.json to output directory
        const registryOutputPath = path.resolve(resolvePaths.outputDir, "registry.json")
        await fs.writeFile(
            registryOutputPath,
            JSON.stringify(registry, null, 2)
        )

        buildSpinner.succeed("Building registry.")

        // Summary output
        if (options.verbose) {
            logger.break()
            logger.info(`Registry built successfully:`)
            logger.log(`  ${highlighter.info(registry.items.length.toString())} components processed`)
            logger.log(`  Output directory: ${highlighter.info(path.relative(options.cwd, resolvePaths.outputDir))}`)
            logger.break()

            // List all built components
            for (const item of registry.items) {
                logger.log(`  - ${item.name} (${highlighter.info(item.type)})`)
                if (item.files) {
                    for (const file of item.files) {
                        logger.log(`    - ${file.path}`)
                    }
                }
            }
        } else {
            logger.info(`Built ${registry.items.length} components to ${path.relative(options.cwd, resolvePaths.outputDir)}`)
        }

    } catch (error) {
        buildSpinner.fail("Failed to build registry.")
        throw error
    }
}
