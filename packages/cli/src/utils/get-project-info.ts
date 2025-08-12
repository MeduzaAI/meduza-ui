import fs from "fs-extra"
import * as path from "path"
import fg from "fast-glob"

export interface ProjectInfo {
    framework: "vue" | "nuxt" | "vite" | "manual"
    baseDir: string // "src", "app", or "" for root
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
        hasSrcDir,
        hasAppDir,
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
        fs.pathExists(path.resolve(cwd, "app")),
        isTypeScriptProject(cwd),
        getPackageManager(cwd),
        getAliasPrefix(cwd),
    ])

    let framework: ProjectInfo["framework"] = "manual"
    let baseDir: string = ""

    // Determine base directory based on framework and project structure
    if (configFiles.find((file) => file.startsWith("nuxt.config."))) {
        framework = "nuxt"
        // For Nuxt, use app directory if it exists, otherwise root
        baseDir = hasAppDir ? "app" : ""
    } else if (hasSrcDir) {
        // For other frameworks, use src directory if it exists
        baseDir = "src"
    }

    // Vite detection (only override if not already detected as Nuxt)
    if (framework === "manual" && configFiles.find((file) => file.startsWith("vite.config."))) {
        framework = "vite"
    }

    // Vue CLI detection (check package.json for @vue/cli-service)
    if (framework === "manual") {
        const packageJsonPath = path.resolve(cwd, "package.json")
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath)

            if (packageJson.dependencies?.["@vue/cli-service"] ||
                packageJson.devDependencies?.["@vue/cli-service"]) {
                framework = "vue"
            }
        }
    }

    return {
        framework,
        baseDir,
        isTypeScript,
        packageManager,
        aliasPrefix,
    }
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
