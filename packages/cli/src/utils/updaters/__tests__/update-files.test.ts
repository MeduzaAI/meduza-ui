import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { updateFiles } from "../update-files"
import type { Config, RegistryFile } from "../../../registry/schema"

// Mock logger
vi.mock("../../logger", () => ({
    logger: {
        warn: vi.fn(),
        success: vi.fn(),
    },
}))

describe("updateFiles", () => {
    let testDir: string
    let mockConfig: Config

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
        await fs.ensureDir(testDir)

        mockConfig = {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "@/assets/styles/_variables.scss",
                mixins: "@/assets/styles/_mixins.scss",
            },
            aliases: {
                components: "@/components",
                ui: "@/components/ui",
                lib: "@/lib",
                utils: "@/lib/utils",
            },
            registries: {
                "meduza-ui": "https://meduza-ui.com/r",
            },
            resolvedPaths: {
                cwd: testDir,
                scssVariables: join(testDir, "assets/styles/_variables.scss"),
                scssMixins: join(testDir, "assets/styles/_mixins.scss"),
                components: join(testDir, "components"),
                ui: join(testDir, "components/ui"),
                lib: join(testDir, "lib"),
                utils: join(testDir, "lib/utils"),
                composables: join(testDir, "composables"),
                assets: join(testDir, "assets"),
                styles: join(testDir, "assets/styles"),
            },
        }
    })

    afterEach(async () => {
        await fs.remove(testDir)
        vi.clearAllMocks()
    })

    it("should create UI component files", async () => {
        const files: RegistryFile[] = [
            {
                path: "ui/button.vue",
                content: "<template><button>Button</button></template>",
                type: "registry:ui",
                target: "ui/button.vue",
            },
        ]

        await updateFiles(files, mockConfig, { silent: true })

        const buttonPath = join(testDir, "components/ui/button.vue")
        expect(await fs.pathExists(buttonPath)).toBe(true)
        const content = await fs.readFile(buttonPath, "utf8")
        expect(content).toBe("<template><button>Button</button></template>")
    })

    it("should create lib files", async () => {
        const files: RegistryFile[] = [
            {
                path: "lib/utils.ts",
                content: "export const cn = () => {}",
                type: "registry:lib",
                target: "lib/utils.ts",
            },
        ]

        await updateFiles(files, mockConfig, { silent: true })

        const utilsPath = join(testDir, "lib/utils.ts")
        expect(await fs.pathExists(utilsPath)).toBe(true)
        const content = await fs.readFile(utilsPath, "utf8")
        expect(content).toBe("export const cn = () => {}")
    })

    it("should create style files", async () => {
        const files: RegistryFile[] = [
            {
                path: "assets/styles/_variables.scss",
                content: ":root { --primary: blue; }",
                type: "registry:style",
                target: "assets/styles/_variables.scss",
            },
            {
                path: "assets/styles/_mixins.scss",
                content: "@mixin focus-ring { outline: 2px solid blue; }",
                type: "registry:style",
                target: "assets/styles/_mixins.scss",
            },
        ]

        await updateFiles(files, mockConfig, { silent: true })

        const variablesPath = join(testDir, "assets/styles/_variables.scss")
        const mixinsPath = join(testDir, "assets/styles/_mixins.scss")

        expect(await fs.pathExists(variablesPath)).toBe(true)
        expect(await fs.pathExists(mixinsPath)).toBe(true)

        const variablesContent = await fs.readFile(variablesPath, "utf8")
        const mixinsContent = await fs.readFile(mixinsPath, "utf8")

        expect(variablesContent).toBe(":root { --primary: blue; }")
        expect(mixinsContent).toBe("@mixin focus-ring { outline: 2px solid blue; }")
    })

    it("should skip existing files without overwrite", async () => {
        const { logger } = await import("../../logger")

        // Create existing file
        const buttonPath = join(testDir, "components/ui/button.vue")
        await fs.ensureDir(join(testDir, "components/ui"))
        await fs.writeFile(buttonPath, "existing content")

        const files: RegistryFile[] = [
            {
                path: "ui/button.vue",
                content: "new content",
                type: "registry:ui",
                target: "ui/button.vue",
            },
        ]

        await updateFiles(files, mockConfig, { overwrite: false, silent: false })

        // File should still have existing content
        const content = await fs.readFile(buttonPath, "utf8")
        expect(content).toBe("existing content")

        // Should have warned about skipping
        expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("already exists. Skipping."))
    })

    it("should overwrite existing files with overwrite flag", async () => {
        // Create existing file
        const buttonPath = join(testDir, "components/ui/button.vue")
        await fs.ensureDir(join(testDir, "components/ui"))
        await fs.writeFile(buttonPath, "existing content")

        const files: RegistryFile[] = [
            {
                path: "ui/button.vue",
                content: "new content",
                type: "registry:ui",
                target: "ui/button.vue",
            },
        ]

        await updateFiles(files, mockConfig, { overwrite: true, silent: true })

        // File should have new content
        const content = await fs.readFile(buttonPath, "utf8")
        expect(content).toBe("new content")
    })

    it("should create nested directories", async () => {
        const files: RegistryFile[] = [
            {
                path: "ui/forms/input.vue",
                content: "<template><input /></template>",
                type: "registry:ui",
                target: "ui/forms/input.vue",
            },
        ]

        await updateFiles(files, mockConfig, { silent: true })

        const inputPath = join(testDir, "components/ui/forms/input.vue")
        expect(await fs.pathExists(inputPath)).toBe(true)
        expect(await fs.pathExists(join(testDir, "components/ui/forms"))).toBe(true)
    })

    it("should handle generic file type with fallback path resolution", async () => {
        const files: RegistryFile[] = [
            {
                path: "custom/file.ts",
                content: "export const custom = true",
                type: "file",
                target: "custom/file.ts",
            },
        ]

        await updateFiles(files, mockConfig, { silent: true })

        const customPath = join(testDir, "custom/file.ts")
        expect(await fs.pathExists(customPath)).toBe(true)
    })

    it("should handle empty files array", async () => {
        await updateFiles([], mockConfig, { silent: true })
        // Should not throw error
    })
})
