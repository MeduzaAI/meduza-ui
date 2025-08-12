import { Command } from "commander"
import { readFileSync } from "fs"
import { join } from "path"
import { fileURLToPath } from "url"

// Import commands (will be implemented in subsequent specs)
// import { init } from "@/commands/init"
// import { add } from "@/commands/add"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

// Read package.json for version
let packageJson: { version?: string }
try {
    const packagePath = join(__dirname, "../package.json")
    packageJson = JSON.parse(readFileSync(packagePath, "utf-8"))
} catch {
    packageJson = { version: "0.1.0" }
}

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

async function main() {
    const program = new Command()
        .name("meduza-ui")
        .description("Add Vue.js components with SCSS styling to your project")
        .version(
            packageJson.version || "0.1.0",
            "-v, --version",
            "display the version number"
        )

    // Commands will be added in subsequent specs
    // program.addCommand(init)
    // program.addCommand(add)

    // For now, show help when no command is provided
    if (process.argv.length <= 2) {
        program.help()
    }

    program.parse()
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
