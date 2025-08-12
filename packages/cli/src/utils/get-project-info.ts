import * as fs from "fs-extra"
import * as path from "path"
import fg from "fast-glob"

export interface ProjectInfo {
    framework: "vue" | "nuxt" | "vite" | "manual"
    isSrcDir: boolean
    isTypeScript: boolean
    packageManager: "npm" | "yarn" | "pnpm" | "bun"
    aliasPrefix: string
}

const PROJECT_IGNORE = [
    "**/node_modules/**",
    ".nuxt",
    ".output",
    "public",
    "dist",
    "build",
]

export async function getProjectInfo(cwd: string): Promise<ProjectInfo | null> {
    const [
        configFiles,
        isSrcDir,
        isTypeScript,
        packageManager,
        aliasPrefix,
    ] = await Promise.all([
        fg.glob(
            "**/{nuxt,vite,vue}.config.*|package.json",
            {
                cwd,
                deep: 3,
                ignore: PROJECT_IGNORE,
            }
        ),
        fs.pathExists(path.resolve(cwd, "src")),
        isTypeScriptProject(cwd),
        getPackageManager(cwd),
        getAliasPrefix(cwd),
    ])

    const type: ProjectInfo = {
        framework: "manual",
        isSrcDir,
        isTypeScript,
        packageManager,
        aliasPrefix,
    }

    // Nuxt.js detection
    if (configFiles.find((file) => file.startsWith("nuxt.config."))) {
        type.framework = "nuxt"
        return type
    }

    // Vite detection
    if (configFiles.find((file) => file.startsWith("vite.config."))) {
        type.framework = "vite"
        return type
    }

    // Vue CLI detection (check package.json for @vue/cli-service)
    const packageJsonPath = path.resolve(cwd, "package.json")
    if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)

        if (packageJson.dependencies?.["@vue/cli-service"] ||
            packageJson.devDependencies?.["@vue/cli-service"]) {
            type.framework = "vue"
            return type
        }
    }

    return type
}

export async function isTypeScriptProject(cwd: string): Promise<boolean> {
    const tsConfigPath = path.resolve(cwd, "tsconfig.json")
    return fs.pathExists(tsConfigPath)
}

export async function getPackageManager(cwd: string): Promise<ProjectInfo["packageManager"]> {
    // Check for lock files
    const lockFiles = await fg.glob(
        "{package-lock.json,yarn.lock,pnpm-lock.yaml,bun.lockb}",
        { cwd, deep: 1 }
    )

    if (lockFiles.includes("pnpm-lock.yaml")) return "pnpm"
    if (lockFiles.includes("yarn.lock")) return "yarn"
    if (lockFiles.includes("bun.lockb")) return "bun"
    if (lockFiles.includes("package-lock.json")) return "npm"

    // Fallback to npm
    return "npm"
}

export async function getAliasPrefix(cwd: string): Promise<string> {
    // Check tsconfig.json or jsconfig.json for path aliases
    const configFiles = ["tsconfig.json", "jsconfig.json"]

    for (const configFile of configFiles) {
        const configPath = path.resolve(cwd, configFile)
        if (await fs.pathExists(configPath)) {
            try {
                const config = await fs.readJson(configPath)
                const paths = config.compilerOptions?.paths

                if (paths) {
                    // Look for common alias patterns
                    for (const [alias] of Object.entries(paths)) {
                        if (alias.endsWith("/*")) {
                            return alias.slice(0, -2) // Remove /*
                        }
                    }
                }
            } catch {
                // Ignore JSON parse errors
            }
        }
    }

    // Default alias
    return "@"
}
