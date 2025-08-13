import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { resolveConfigPaths } from "../get-config"
import type { RawConfig } from "../../registry/schema";

describe("get-config Nuxt path resolution", () => {
    let testDir: string

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-nuxt-test-${Date.now()}`)
        await fs.ensureDir(testDir)
    })

    afterEach(async () => {
        await fs.remove(testDir)
    })

    it("should resolve paths correctly for Nuxt project with app directory", async () => {
        // Create Nuxt project structure with app directory
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-nuxt-project",
            dependencies: {
                nuxt: "^3.0.0",
            },
        })

        // Create nuxt.config.ts to identify as Nuxt project
        await fs.writeFile(join(testDir, "nuxt.config.ts"), `
      export default defineNuxtConfig({
        // Nuxt config
      })
    `)

        // Create app directory structure
        await fs.ensureDir(join(testDir, "app"))
        await fs.ensureDir(join(testDir, "app/components"))
        await fs.ensureDir(join(testDir, "app/assets"))

        const rawConfig: RawConfig = {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "@/assets/styles/_variables.scss",
                mixins: "@/assets/styles/_mixins.scss",
                main: "@/assets/styles/main.scss",
            },
            aliases: {
                components: "@/components",
                ui: "@/components/ui",
                lib: "@/lib",
                utils: "@/lib/utils",
                composables: "@/composables",
                assets: "@/assets",
                styles: "@/assets/styles",
            },
        }

        const config = await resolveConfigPaths(testDir, rawConfig)

        // Verify paths are resolved to app directory
        expect(config.resolvedPaths.components).toBe(join(testDir, "app/components"))
        expect(config.resolvedPaths.ui).toBe(join(testDir, "app/components/ui"))
        expect(config.resolvedPaths.lib).toBe(join(testDir, "app/lib"))
        expect(config.resolvedPaths.utils).toBe(join(testDir, "app/lib/utils"))
        expect(config.resolvedPaths.composables).toBe(join(testDir, "app/composables"))
        expect(config.resolvedPaths.assets).toBe(join(testDir, "app/assets"))
        expect(config.resolvedPaths.styles).toBe(join(testDir, "app/assets/styles"))
    })

    it("should resolve paths correctly for Nuxt project without app directory", async () => {
        // Create Nuxt project structure without app directory
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-nuxt-project",
            dependencies: {
                nuxt: "^3.0.0",
            },
        })

        // Create nuxt.config.ts to identify as Nuxt project
        await fs.writeFile(join(testDir, "nuxt.config.ts"), `
      export default defineNuxtConfig({
        // Nuxt config
      })
    `)

        // Create root-level directories (traditional Nuxt 3 structure)
        await fs.ensureDir(join(testDir, "components"))
        await fs.ensureDir(join(testDir, "assets"))

        const rawConfig: RawConfig = {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "@/assets/styles/_variables.scss",
                mixins: "@/assets/styles/_mixins.scss",
                main: "@/assets/styles/main.scss",
            },
            aliases: {
                components: "@/components",
                ui: "@/components/ui",
                lib: "@/lib",
                utils: "@/lib/utils",
                composables: "@/composables",
                assets: "@/assets",
                styles: "@/assets/styles",
            },
        }

        const config = await resolveConfigPaths(testDir, rawConfig)

        // Verify paths are resolved to root directory (no app/)
        expect(config.resolvedPaths.components).toBe(join(testDir, "components"))
        expect(config.resolvedPaths.ui).toBe(join(testDir, "components/ui"))
        expect(config.resolvedPaths.lib).toBe(join(testDir, "lib"))
        expect(config.resolvedPaths.utils).toBe(join(testDir, "lib/utils"))
        expect(config.resolvedPaths.composables).toBe(join(testDir, "composables"))
        expect(config.resolvedPaths.assets).toBe(join(testDir, "assets"))
        expect(config.resolvedPaths.styles).toBe(join(testDir, "assets/styles"))
    })

    it("should resolve paths correctly for Vue project with src directory", async () => {
        // Create Vue project structure with src directory
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-vue-project",
            dependencies: {
                vue: "^3.0.0",
            },
            devDependencies: {
                "@vue/cli-service": "^5.0.0",
            },
        })

        // Create src directory structure
        await fs.ensureDir(join(testDir, "src"))
        await fs.ensureDir(join(testDir, "src/components"))
        await fs.ensureDir(join(testDir, "src/assets"))

        const rawConfig: RawConfig = {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "@/assets/styles/_variables.scss",
                mixins: "@/assets/styles/_mixins.scss",
                main: "@/assets/styles/main.scss",
            },
            aliases: {
                components: "@/components",
                ui: "@/components/ui",
                lib: "@/lib",
                utils: "@/lib/utils",
                composables: "@/composables",
                assets: "@/assets",
                styles: "@/assets/styles",
            },
        }

        const config = await resolveConfigPaths(testDir, rawConfig)

        // Verify paths are resolved to src directory
        expect(config.resolvedPaths.components).toBe(join(testDir, "src/components"))
        expect(config.resolvedPaths.ui).toBe(join(testDir, "src/components/ui"))
        expect(config.resolvedPaths.lib).toBe(join(testDir, "src/lib"))
        expect(config.resolvedPaths.utils).toBe(join(testDir, "src/lib/utils"))
        expect(config.resolvedPaths.composables).toBe(join(testDir, "src/composables"))
        expect(config.resolvedPaths.assets).toBe(join(testDir, "src/assets"))
        expect(config.resolvedPaths.styles).toBe(join(testDir, "src/assets/styles"))
    })
})
