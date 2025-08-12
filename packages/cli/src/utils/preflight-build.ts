import fs from "fs-extra"
import * as path from "path"
import { z } from "zod"

const buildOptionsSchema = z.object({
    cwd: z.string(),
    registryFile: z.string(),
    outputDir: z.string(),
    verbose: z.boolean().optional(),
})

export async function preFlightBuild(
    options: z.infer<typeof buildOptionsSchema>
) {
    const cwd = path.resolve(options.cwd)
    const registryFile = path.resolve(cwd, options.registryFile)
    const outputDir = path.resolve(cwd, options.outputDir)

    // Check if registry file exists
    const registryExists = await fs.pathExists(registryFile)
    if (!registryExists) {
        return {
            resolvePaths: null,
            errors: {
                MISSING_REGISTRY_FILE: true,
            },
        }
    }

    return {
        resolvePaths: {
            cwd,
            registryFile,
            outputDir,
        },
        errors: {},
    }
}
