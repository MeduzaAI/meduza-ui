import { detect } from "@antfu/ni"

export async function getPackageManager(
    targetDir: string,
    { withFallback }: { withFallback?: boolean } = { withFallback: false }
): Promise<"yarn" | "pnpm" | "bun" | "npm"> {
    const packageManager = await detect({ programmatic: true, cwd: targetDir })

    if (packageManager === "yarn@berry") return "yarn"
    if (packageManager === "pnpm@6") return "pnpm"
    if (packageManager === "bun") return "bun"

    if (!withFallback) {
        return packageManager ?? "npm"
    }

    // Fallback to user agent if not detected
    const userAgent = process.env.npm_config_user_agent || ""

    if (userAgent.startsWith("yarn")) {
        return "yarn"
    }

    if (userAgent.startsWith("pnpm")) {
        return "pnpm"
    }

    if (userAgent.startsWith("bun")) {
        return "bun"
    }

    return "npm"
}

export async function getPackageRunner(cwd: string): Promise<string> {
    const packageManager = await getPackageManager(cwd)

    // Return the appropriate run command for each package manager
    switch (packageManager) {
        case "yarn":
            return "yarn"
        case "pnpm":
            return "pnpm"
        case "bun":
            return "bun"
        default:
            return "npm run"
    }
}
