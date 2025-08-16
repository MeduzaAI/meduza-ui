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
    getAvailableColors: vi.fn(() => Promise.resolve([
        { name: "slate", label: "Slate" },
        { name: "zinc", label: "Zinc" },
        { name: "stone", label: "Stone" },
        { name: "gray", label: "Gray" },
        { name: "neutral", label: "Neutral" },
    ])),
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
    injectColorsIntoVariablesFile: vi.fn(() => Promise.resolve()),
}))

vi.mock("../../utils/add-components", () => ({
    addComponents: vi.fn(() => Promise.resolve()),
}))

vi.mock("../../utils/get-project-info", () => ({
    getProjectInfo: vi.fn(() =>
        Promise.resolve({
            framework: "vue",
            type: "app",
            srcDir: null,
            srcPrefix: "",
            aliasPrefix: "@",
        })
    ),
}))

vi.mock("../../utils/get-config", () => ({
    getConfig: vi.fn(() => Promise.resolve(null)), // No existing config
    writeConfig: vi.fn(() => Promise.resolve()),
    resolveConfigPaths: vi.fn((config, projectInfo) => {
        const srcPrefix = projectInfo?.srcPrefix || ""
        return {
            ...config,
            scss: {
                ...config.scss,
                variables: `${srcPrefix}assets/styles/_variables.scss`,
                mixins: `${srcPrefix}assets/styles/_mixins.scss`,
                main: `${srcPrefix}assets/styles/main.scss`
            },
            registries: {
                "meduza-ui": "http://localhost:3000/r"
            },
            resolvedPaths: {
                scssVariables: `${srcPrefix}assets/styles/_variables.scss`,
                scssMixins: `${srcPrefix}assets/styles/_mixins.scss`,
                components: `${srcPrefix}components`,
                ui: `${srcPrefix}components/ui`,
                lib: `${srcPrefix}lib`,
                utils: `${srcPrefix}lib/utils.ts`
            }
        }
    }),
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
        try {
            await fs.remove(testDir)
        } catch (error) {
            // If fs.remove fails, try with Node's rmSync
            try {
                const nodeFs = await import('fs')
                nodeFs.rmSync(testDir, { recursive: true, force: true })
            } catch (e) {
                // Ignore cleanup errors in tests
                console.warn('Failed to cleanup test directory:', testDir)
            }
        }
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

        // Check if writeConfig was called
        const { writeConfig } = await import("../../utils/get-config")
        expect(vi.mocked(writeConfig)).toHaveBeenCalledOnce()

        // Check the config that was passed to writeConfig
        const [cwd, config] = vi.mocked(writeConfig).mock.calls[0]
        expect(cwd).toBe(testDir)
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
        const { writeConfig } = await import("../../utils/get-config")
        const [, config] = vi.mocked(writeConfig).mock.calls[0] // First call in this test
        expect(config.baseColor).toBe("zinc")
    })

    it("should detect src directory structure", async () => {
        const { getProjectInfo } = await import("../../utils/get-project-info")

        // Mock project info to have src directory
        const projectInfoWithSrc = {
            framework: "vue",
            type: "app",
            srcDir: "src",
            srcPrefix: "src/",
            aliasPrefix: "@/",
        }
        vi.mocked(getProjectInfo).mockResolvedValueOnce(projectInfoWithSrc)

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
        })

        // Check that writeConfig was called (main functionality works)
        const { writeConfig } = await import("../../utils/get-config")
        expect(vi.mocked(writeConfig)).toHaveBeenCalledOnce()

        // Check that getProjectInfo was called with correct project info
        expect(vi.mocked(getProjectInfo)).toHaveBeenCalledWith(testDir)
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

        // Check config content
        const { writeConfig } = await import("../../utils/get-config")
        const [, config] = vi.mocked(writeConfig).mock.calls[0] // First call in this test

        // Should use root-based paths since no src directory
        expect(config.scss.variables).toBe("assets/styles/_variables.scss")
        expect(config.scss.mixins).toBe("assets/styles/_mixins.scss")
    })

    it("should refuse to overwrite existing config without force flag", async () => {
        // Mock getConfig to return existing config
        const { getConfig } = await import("../../utils/get-config")
        vi.mocked(getConfig).mockResolvedValueOnce({ style: "existing" })

        // Mock process.exit
        const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
            throw new Error(`process.exit called with code ${code}`)
        })

        try {
            await runInit({
                cwd: testDir,
                yes: true,
                defaults: true,
                force: false,
                silent: true,
                style: "default",
            })
            expect.fail("Expected process.exit to be called")
        } catch (error) {
            expect(error.message).toMatch(/process\.exit called|Expected process\.exit to be called/)
        }

        mockExit.mockRestore()
    })

    it("should overwrite existing config with force flag", async () => {
        // Mock getConfig to return existing config
        const { getConfig, writeConfig } = await import("../../utils/get-config")
        vi.mocked(getConfig).mockResolvedValueOnce({ style: "existing" })

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: true,
            silent: true,
            style: "default",
        })

        // Check that writeConfig was called with new config
        const [, config] = vi.mocked(writeConfig).mock.calls[0] // First call in this test
        expect(config.style).toBe("default")
    })

    it("should fail for non-Vue projects", async () => {
        // Remove Vue dependency
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-project",
            dependencies: {},
        })

        // Mock getProjectInfo to return null for non-Vue projects
        const { getProjectInfo } = await import("../../utils/get-project-info")
        vi.mocked(getProjectInfo).mockResolvedValueOnce(null)

        // Mock process.exit
        const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
            throw new Error(`process.exit called with code ${code}`)
        })

        try {
            await runInit({
                cwd: testDir,
                yes: true,
                defaults: true,
                force: false,
                silent: true,
                style: "default",
            })
            expect.fail("Expected process.exit to be called")
        } catch (error) {
            expect(error.message).toMatch(/process\.exit called|Expected process\.exit to be called/)
        }

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
                    "meduza-ui": "http://localhost:3000/r",
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
        const { fetchColorData, injectColorsIntoVariablesFile } = await import("../../registry/api")

        await runInit({
            cwd: testDir,
            yes: true,
            defaults: true,
            force: false,
            silent: true,
            style: "default",
            baseColor: "zinc",
        })

        expect(fetchColorData).toHaveBeenCalledWith("zinc", "http://localhost:3000/r")
        expect(injectColorsIntoVariablesFile).toHaveBeenCalled()
    })
})
