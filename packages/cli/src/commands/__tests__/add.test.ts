import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runAdd } from "../add"

// Mock registry responses
vi.mock("@/registry/api", () => ({
    fetchRegistryIndex: vi.fn().mockResolvedValue([
        { name: "button", type: "registry:ui", description: "A button component" },
        { name: "card", type: "registry:ui", description: "A card component" },
    ]),
    fetchRegistryItem: vi.fn().mockImplementation((url, name) => ({
        name,
        type: "registry:ui",
        dependencies: [],
        registryDependencies: [],
        files: [
            {
                path: `components/ui/${name}.vue`,
                content: `<template><div class="${name}"><slot /></div></template>\n\n<script setup lang="ts">\n// ${name} component\n</script>\n\n<style lang="scss">\n.${name} {\n  // Component styles\n}\n</style>`,
                type: "registry:ui",
                target: `components/ui/${name}.vue`
            }
        ],
    })),
}))

describe("add command", () => {
    let testDir: string

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
        await fs.ensureDir(testDir)

        // Create project structure
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-project",
            dependencies: { vue: "^3.0.0" }
        })

        // Create config file with current schema
        await fs.writeJson(join(testDir, "meduza.config.json"), {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "src/assets/styles/_variables.scss",
                mixins: "src/assets/styles/_mixins.scss",
                main: "src/assets/styles/main.scss",
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
            framework: {
                type: "vite"
            },
            registries: {
                "meduza-ui": "https://meduza-ui.com/r",
            },
        })

        // Create necessary directories
        await fs.ensureDir(join(testDir, "src/components/ui"))
        await fs.ensureDir(join(testDir, "src/lib"))
        await fs.ensureDir(join(testDir, "src/assets/styles"))

        // Create required files
        await fs.writeFile(join(testDir, "src/lib/utils.ts"), "// utils")
        await fs.writeFile(join(testDir, "src/assets/styles/_variables.scss"), "// variables")
        await fs.writeFile(join(testDir, "src/assets/styles/_mixins.scss"), "// mixins")
    })

    afterEach(async () => {
        await fs.remove(testDir)
    })

    it("should add a single component", async () => {
        await runAdd({
            components: ["button"],
            cwd: testDir,
            yes: true,
            overwrite: false,
            all: false,
            silent: true,
        })

        // Check if component was created
        const buttonPath = join(testDir, "src/components/ui/button.vue")
        expect(await fs.pathExists(buttonPath)).toBe(true)

        const content = await fs.readFile(buttonPath, "utf8")
        expect(content).toContain("button")
    })

    it("should add multiple components", async () => {
        await runAdd({
            components: ["button", "card"],
            cwd: testDir,
            yes: true,
            overwrite: false,
            all: false,
            silent: true,
        })

        // Check if both components were created
        expect(await fs.pathExists(join(testDir, "src/components/ui/button.vue"))).toBe(true)
        expect(await fs.pathExists(join(testDir, "src/components/ui/card.vue"))).toBe(true)
    })

    it("should fail if project is not initialized", async () => {
        // Remove config file
        await fs.remove(join(testDir, "meduza.config.json"))

        await expect(runAdd({
            components: ["button"],
            cwd: testDir,
            yes: true,
            overwrite: false,
            all: false,
            silent: true,
        })).rejects.toThrow()
    })

    it("should detect component conflicts", async () => {
        // Create existing component
        await fs.writeFile(join(testDir, "src/components/ui/button.vue"), "existing component")

        await expect(runAdd({
            components: ["button"],
            cwd: testDir,
            yes: true,
            overwrite: false,
            all: false,
            silent: true,
        })).rejects.toThrow("Components already exist")
    })

    it("should overwrite components when overwrite flag is set", async () => {
        // Create existing component
        await fs.writeFile(join(testDir, "src/components/ui/button.vue"), "existing component")

        await runAdd({
            components: ["button"],
            cwd: testDir,
            yes: true,
            overwrite: true,
            all: false,
            silent: true,
        })

        // Check if component was overwritten
        const content = await fs.readFile(join(testDir, "src/components/ui/button.vue"), "utf8")
        expect(content).toContain("<template>")
        expect(content).not.toContain("existing component")
    })
})
