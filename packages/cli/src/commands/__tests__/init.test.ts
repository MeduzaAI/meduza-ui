import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runInit } from "../init"

// Mock dependencies
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        success: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        break: vi.fn(),
        spin: vi.fn(),
        stopSpinner: vi.fn(),
    },
}))

vi.mock("../../registry/api", () => ({
    getAvailableColors: vi.fn(() => [
        { name: "slate", label: "Slate" },
        { name: "zinc", label: "Zinc" },
        { name: "stone", label: "Stone" },
        { name: "gray", label: "Gray" },
        { name: "neutral", label: "Neutral" },
    ]),
    fetchColorData: vi.fn(() =>
        Promise.resolve({
            inlineColors: {
                light: { primary: "slate-900", background: "white" },
                dark: { primary: "slate-50", background: "slate-950" },
            },
            cssVars: {
                light: { "primary-color": "#0f172a", "background-color": "#ffffff" },
                dark: { "primary-color": "#f8fafc", "background-color": "#0f172a" },
            },
            cssVarsTemplate: ":root {\n  --primary-color: #0f172a;\n}",
        })
    ),
    createVariablesFile: vi.fn(() => Promise.resolve()),
    createMixinsFile: vi.fn(() => Promise.resolve()),
}))

vi.mock("../../utils/add-components", () => ({
    addComponents: vi.fn(() => Promise.resolve()),
}))

describe("init command", () => {
    let testDir: string

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
        await fs.ensureDir(testDir)

        // Create a basic Vue project structure
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-project",
            dependencies: {
                vue: "^3.0.0",
            },
            devDependencies: {
                "@vue/cli-service": "^5.0.0",
            },
        })

        // Create src directory
        await fs.ensureDir(join(testDir, "src"))
    })

    afterEach(async () => {
        await fs.remove(testDir)
        vi.clearAllMocks()
    })

    it("should initialize a Vue project with default config", async () => {
        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
        })

        // Check if config file was created
        const configPath = join(testDir, "meduza.config.json")
        expect(await fs.pathExists(configPath)).toBe(true)

        // Check config content
        const config = await fs.readJson(configPath)
        expect(config.style).toBe("default")
        expect(config.baseColor).toBe("slate")
        expect(config.scss.variables).toBeDefined()
        expect(config.scss.mixins).toBeDefined()
        expect(config.aliases.components).toBeDefined()
        expect(config.aliases.ui).toBeDefined()
        expect(config.aliases.lib).toBeDefined()
        expect(config.aliases.utils).toBeDefined()
        expect(config.registries["meduza-ui"]).toBeDefined()
    })

    it("should initialize with specific base color", async () => {
        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
            baseColor: "zinc",
        })

        // Check config content
        const configPath = join(testDir, "meduza.config.json")
        const config = await fs.readJson(configPath)
        expect(config.baseColor).toBe("zinc")
    })

    it("should detect src directory structure", async () => {
        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
        })

        const configPath = join(testDir, "meduza.config.json")
        const config = await fs.readJson(configPath)

        // Should use src-based paths since src directory exists
        expect(config.scss.variables).toContain("src/assets/styles/_variables.scss")
        expect(config.scss.mixins).toContain("src/assets/styles/_mixins.scss")
    })

    it("should handle projects without src directory", async () => {
        // Remove src directory
        await fs.remove(join(testDir, "src"))

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
        })

        const configPath = join(testDir, "meduza.config.json")
        const config = await fs.readJson(configPath)

        // Should use root-based paths since no src directory
        expect(config.scss.variables).toBe("assets/styles/_variables.scss")
        expect(config.scss.mixins).toBe("assets/styles/_mixins.scss")
    })

    it("should refuse to overwrite existing config without force flag", async () => {
        // Create existing config
        await fs.writeJson(join(testDir, "meduza.config.json"), {
            style: "existing",
        })

        // Mock process.exit
        const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
            throw new Error("process.exit called")
        })

        await expect(
            runInit({
                cwd: testDir,
                yes: true,
                defaults: true,
                force: false,
                silent: true,
                style: "default",
            })
        ).rejects.toThrow("process.exit called")

        mockExit.mockRestore()
    })

    it("should overwrite existing config with force flag", async () => {
        // Create existing config
        await fs.writeJson(join(testDir, "meduza.config.json"), {
            style: "existing",
        })

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: true,
            silent: true,
            style: "default",
        })

        const configPath = join(testDir, "meduza.config.json")
        const config = await fs.readJson(configPath)
        expect(config.style).toBe("default")
    })

    it("should fail for non-Vue projects", async () => {
        // Remove Vue dependency
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-project",
            dependencies: {},
        })

        // Mock process.exit
        const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
            throw new Error("process.exit called")
        })

        await expect(
            runInit({
                cwd: testDir,
                yes: true,
                defaults: true,
                force: false,
                silent: true,
                style: "default",
            })
        ).rejects.toThrow("process.exit called")

        mockExit.mockRestore()
    })

    it("should call addComponents with correct base components", async () => {
        const { addComponents } = await import("../../utils/add-components")

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
        })

        expect(addComponents).toHaveBeenCalledWith(
            ["utils", "index"],
            expect.objectContaining({
                registries: expect.objectContaining({
                    "meduza-ui": "https://meduza-ui.com/r",
                }),
            }),
            {
                overwrite: true,
                silent: true,
                isInit: true,
            }
        )
    })

    it("should call color injection functions", async () => {
        const { fetchColorData, createVariablesFile, createMixinsFile } = await import("../../registry/api")

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
            baseColor: "zinc",
        })

        expect(fetchColorData).toHaveBeenCalledWith("zinc", "https://meduza-ui.com/r")
        expect(createVariablesFile).toHaveBeenCalled()
        expect(createMixinsFile).toHaveBeenCalled()
    })
})
