import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import { runTheme } from "../theme"

// Mock the registry API
vi.mock("@/registry/api", () => ({
    getAvailableColors: vi.fn().mockResolvedValue([
        { name: "slate", label: "Slate" },
        { name: "zinc", label: "Zinc" },
        { name: "midnight-blue", label: "Midnight Blue" },
        { name: "ocean-breeze", label: "Ocean Breeze" },
        { name: "forest-green", label: "Forest Green" },
    ]),
    fetchColorData: vi.fn().mockImplementation((colorName) =>
        Promise.resolve({
            name: colorName,
            label: `${colorName} Theme`,
            cssVars: {
                light: {
                    "primary-color": "#1d4ed8",
                    "primary-foreground-color": "#eff6ff",
                    "secondary-color": "#dbeafe",
                    "secondary-foreground-color": "#1e3a8a",
                    "background-color": "#ffffff",
                    "foreground-color": "#1e3a8a",
                    "card-color": "#ffffff",
                    "card-foreground-color": "#1e3a8a",
                    "popover-color": "#ffffff",
                    "popover-foreground-color": "#1e3a8a",
                    "muted-color": "#dbeafe",
                    "muted-foreground-color": "#3b82f6",
                    "accent-color": "#dbeafe",
                    "accent-foreground-color": "#1e3a8a",
                    "destructive-color": "#ef4444",
                    "destructive-foreground-color": "#eff6ff",
                    "border-color": "#bfdbfe",
                    "input-color": "#bfdbfe",
                    "ring-color": "#1e3a8a"
                },
                dark: {
                    "primary-color": "#60a5fa",
                    "primary-foreground-color": "#1e3a8a",
                    "secondary-color": "#1e3a8a",
                    "secondary-foreground-color": "#eff6ff",
                    "background-color": "#172554",
                    "foreground-color": "#eff6ff",
                    "card-color": "#172554",
                    "card-foreground-color": "#eff6ff",
                    "popover-color": "#172554",
                    "popover-foreground-color": "#eff6ff",
                    "muted-color": "#1e3a8a",
                    "muted-foreground-color": "#60a5fa",
                    "accent-color": "#1e3a8a",
                    "accent-foreground-color": "#eff6ff",
                    "destructive-color": "#dc2626",
                    "destructive-foreground-color": "#eff6ff",
                    "border-color": "#1e3a8a",
                    "input-color": "#1e3a8a",
                    "ring-color": "#93c5fd"
                }
            }
        })
    ),
    injectColorsIntoVariablesFile: vi.fn().mockResolvedValue(undefined),
}))

// Mock other dependencies
vi.mock("@/utils/get-config", () => ({
    getConfig: vi.fn(),
}))

vi.mock("@/utils/get-project-info", () => ({
    getProjectInfo: vi.fn(),
}))

vi.mock("@/utils/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        success: vi.fn(),
        break: vi.fn(),
        spin: vi.fn(),
        stopSpinner: vi.fn(),
    },
}))

vi.mock("@/utils/handle-error", () => ({
    handleError: vi.fn(),
}))

// Mock prompts
vi.mock("prompts", () => ({
    default: vi.fn(),
}))

import { getConfig } from "@/utils/get-config"
import { getProjectInfo } from "@/utils/get-project-info"
import { logger } from "@/utils/logger"
import { getAvailableColors, fetchColorData, injectColorsIntoVariablesFile } from "@/registry/api"
import prompts from "prompts"

describe("theme command", () => {
    let testDir: string
    let mockConfig: any

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
        await fs.ensureDir(testDir)

        // Create project structure
        await fs.writeJson(join(testDir, "package.json"), {
            name: "test-project",
            dependencies: { vue: "^3.0.0" }
        })

        // Create mock config
        mockConfig = {
            style: "default",
            baseColor: "slate",
            scss: {
                variables: "app/assets/styles/_variables.scss",
                mixins: "app/assets/styles/_mixins.scss"
            },
            aliases: {
                components: "@/components",
                ui: "@/components/ui",
                lib: "@/lib",
                utils: "@/lib/utils"
            },
            registries: {
                "meduza-ui": "http://localhost:3000/r/{name}.json"
            },
            resolvedPaths: {
                scssVariables: join(testDir, "app/assets/styles/_variables.scss"),
                scssMixins: join(testDir, "app/assets/styles/_mixins.scss"),
                components: join(testDir, "components"),
                ui: join(testDir, "components/ui"),
                lib: join(testDir, "lib"),
                utils: join(testDir, "lib/utils.ts")
            }
        }

        // Create necessary directories and files
        await fs.ensureDir(join(testDir, "app/assets/styles"))
        await fs.writeFile(join(testDir, "app/assets/styles/_variables.scss"), `
:root {
  /* Colors - Semantic (injected by CLI) */
  --primary-color: #84cc16;
  --primary-foreground-color: #000000;
  --secondary-color: #f8fafc;
  --secondary-foreground-color: #1e293b;
  --background-color: #fefefe;
  --foreground-color: #0f172a;
}

[data-mode="dark"] {
  /* Dark mode color overrides (injected by CLI) */
  --primary-color: #a3e635;
  --primary-foreground-color: #000000;
  --secondary-color: #1e293b;
  --secondary-foreground-color: #f8fafc;
  --background-color: #0a0a0b;
  --foreground-color: #f8fafc;
}`)

        // Setup mocks
        vi.mocked(getConfig).mockResolvedValue(mockConfig)
        vi.mocked(getProjectInfo).mockResolvedValue({
            type: "nuxt",
            configFile: "nuxt.config.ts",
            srcDir: null,
            srcPrefix: "",
            aliasPrefix: "@"
        })
    })

    afterEach(async () => {
        await fs.remove(testDir)
        vi.clearAllMocks()
    })

    describe("list functionality", () => {
        it("should list available themed colors", async () => {
            await runTheme({
                cwd: testDir,
                list: true,
                force: false,
                silent: true,
                root: false,
                color: undefined,
                name: undefined,
            })

            // Verify that getAvailableColors was called with registry URL
            expect(vi.mocked(getAvailableColors)).toHaveBeenCalledWith("http://localhost:3000/r/{name}.json")

            // Should log themed colors info
            expect(vi.mocked(logger.info)).toHaveBeenCalledWith(expect.stringContaining("Available themed colors"))
        })

        it("should handle no themed colors gracefully", async () => {
            // Mock only base colors (no hyphens)
            vi.mocked(getAvailableColors).mockResolvedValueOnce([
                { name: "slate", label: "Slate" },
                { name: "zinc", label: "Zinc" },
            ])

            await runTheme({
                cwd: testDir,
                list: true,
                force: false,
                silent: true,
                root: false,
                color: undefined,
                name: undefined,
            })

            // List function should complete successfully even with no themed colors
            // It will show an empty list but not throw an error
            expect(vi.mocked(logger.info)).toHaveBeenCalledWith(expect.stringContaining("Available themed colors"))
        })
    })

    describe("theme installation", () => {
        it("should install a themed color with default name", async () => {
            await runTheme({
                cwd: testDir,
                color: "midnight-blue",
                force: false,
                silent: true,
                root: false,
                list: false,
                name: undefined,
            })

            // Verify theme was fetched and injected
            expect(vi.mocked(fetchColorData)).toHaveBeenCalledWith(
                "midnight-blue",
                "http://localhost:3000/r"
            )
            expect(vi.mocked(injectColorsIntoVariablesFile)).toHaveBeenCalledWith(
                mockConfig.resolvedPaths.scssVariables,
                expect.any(Object),
                {
                    asTheme: true,
                    themeName: "midnight-blue"
                }
            )
        })

        it("should install a themed color with custom name", async () => {
            await runTheme({
                cwd: testDir,
                color: "ocean-breeze",
                name: "brand-blue",
                force: false,
                silent: true,
                root: false,
                list: false,
            })

            expect(vi.mocked(injectColorsIntoVariablesFile)).toHaveBeenCalledWith(
                mockConfig.resolvedPaths.scssVariables,
                expect.any(Object),
                {
                    asTheme: true,
                    themeName: "brand-blue"
                }
            )
        })

        it("should install as root theme when --root flag is used", async () => {
            await runTheme({
                cwd: testDir,
                color: "forest-green",
                root: true,
                force: true, // Skip confirmation
                silent: true,
                list: false,
                name: undefined,
            })

            expect(vi.mocked(injectColorsIntoVariablesFile)).toHaveBeenCalledWith(
                mockConfig.resolvedPaths.scssVariables,
                expect.any(Object),
                {
                    asTheme: false,
                    themeName: undefined
                }
            )
        })

        it("should validate theme names", async () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`)
            })

            try {
                await runTheme({
                    cwd: testDir,
                    color: "midnight-blue",
                    name: "Invalid Name With Spaces",
                    force: false,
                    silent: true,
                    root: false,
                    list: false,
                })
                expect.fail("Expected process.exit to be called")
            } catch (error) {
                expect(error.message).toContain('process.exit called')
            }

            expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
                expect.stringContaining("Invalid theme name")
            )

            mockExit.mockRestore()
        })

        it("should accept valid kebab-case theme names", async () => {
            await runTheme({
                cwd: testDir,
                color: "midnight-blue",
                name: "my-custom-theme",
                force: false,
                silent: true,
                root: false,
                list: false,
            })

            expect(vi.mocked(injectColorsIntoVariablesFile)).toHaveBeenCalledWith(
                mockConfig.resolvedPaths.scssVariables,
                expect.any(Object),
                {
                    asTheme: true,
                    themeName: "my-custom-theme"
                }
            )
        })
    })

    describe("interactive mode", () => {
        it("should prompt for themed color when none provided", async () => {
            // Mock prompts for interactive selection
            vi.mocked(prompts)
                .mockResolvedValueOnce({ selectedColor: "midnight-blue" })
                .mockResolvedValueOnce({ customName: "brand-theme" })

            await runTheme({
                cwd: testDir,
                force: false,
                silent: true,
                root: false,
                list: false,
                color: undefined,
                name: undefined,
            })

            // Should call prompts for color selection
            expect(vi.mocked(prompts)).toHaveBeenCalledWith({
                type: "select",
                name: "selectedColor",
                message: "Which themed color would you like to add?",
                choices: expect.arrayContaining([
                    expect.objectContaining({
                        title: "Midnight Blue",
                        value: "midnight-blue"
                    })
                ])
            })

            // Should call prompts for custom name
            expect(vi.mocked(prompts)).toHaveBeenCalledWith({
                type: "text",
                name: "customName",
                message: "Enter a custom name for this theme (or press enter to use default):",
                initial: "midnight-blue",
                validate: expect.any(Function)
            })
        })

        it("should handle user cancellation gracefully", async () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`)
            })

            // Mock user canceling color selection
            vi.mocked(prompts).mockResolvedValueOnce({ selectedColor: undefined })

            try {
                await runTheme({
                    cwd: testDir,
                    force: false,
                    silent: true,
                    root: false,
                    list: false,
                    color: undefined,
                    name: undefined,
                })
                expect.fail("Expected process.exit to be called")
            } catch (error) {
                expect(error.message).toContain('process.exit called')
            }

            expect(vi.mocked(logger.warn)).toHaveBeenCalledWith("No themed color selected. Exiting.")

            mockExit.mockRestore()
        })
    })

    describe("root theme warnings", () => {
        it("should prompt for confirmation when using --root without --force", async () => {
            // Mock user confirming root theme installation
            vi.mocked(prompts).mockResolvedValueOnce({ proceed: true })

            await runTheme({
                cwd: testDir,
                color: "forest-green",
                root: true,
                force: false,
                silent: true,
                list: false,
                name: undefined,
            })

            expect(vi.mocked(prompts)).toHaveBeenCalledWith({
                type: "confirm",
                name: "proceed",
                message: expect.stringContaining("Root theme will override existing variables"),
                initial: false,
            })
        })

        it("should cancel when user rejects root theme warning", async () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`)
            })

            // Mock user rejecting root theme installation
            vi.mocked(prompts).mockResolvedValueOnce({ proceed: false })

            try {
                await runTheme({
                    cwd: testDir,
                    color: "forest-green",
                    root: true,
                    force: false,
                    silent: true,
                    list: false,
                    name: undefined,
                })
                expect.fail("Expected process.exit to be called")
            } catch (error) {
                expect(error.message).toContain('process.exit called')
            }

            mockExit.mockRestore()
        })
    })

    describe("error handling", () => {
        it("should fail if project is not initialized", async () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`)
            })

            vi.mocked(getConfig).mockResolvedValueOnce(null)

            try {
                await runTheme({
                    cwd: testDir,
                    color: "midnight-blue",
                    force: false,
                    silent: true,
                    root: false,
                    list: false,
                    name: undefined,
                })
                expect.fail("Expected process.exit to be called")
            } catch (error) {
                expect(error.message).toContain('process.exit called')
            }

            expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
                "No configuration found. Please run the init command first:"
            )

            mockExit.mockRestore()
        })

        it("should fail if not in a Vue.js project", async () => {
            const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                throw new Error(`process.exit called with code ${code}`)
            })

            vi.mocked(getProjectInfo).mockResolvedValueOnce(null)

            try {
                await runTheme({
                    cwd: testDir,
                    color: "midnight-blue",
                    force: false,
                    silent: true,
                    root: false,
                    list: false,
                    name: undefined,
                })
                expect.fail("Expected process.exit to be called")
            } catch (error) {
                expect(error.message).toContain('process.exit called')
            }

            expect(vi.mocked(logger.error)).toHaveBeenCalledWith(
                "Could not detect a Vue.js project. Please run this command in a Vue.js project directory."
            )

            mockExit.mockRestore()
        })

        it("should handle fetch errors gracefully", async () => {
            vi.mocked(fetchColorData).mockRejectedValueOnce(new Error("Network error"))

            await expect(runTheme({
                cwd: testDir,
                color: "midnight-blue",
                force: false,
                silent: true,
                root: false,
                list: false,
                name: undefined,
            })).rejects.toThrow("Network error")

            // In silent mode, stopSpinner is not called
            // We just verify the error is propagated
        })
    })

    describe("theme name validation", () => {
        const validNames = [
            "theme",
            "my-theme",
            "brand-blue",
            "dark-mode-theme",
            "theme123",
            "a"
        ]

        const invalidNames = [
            "Theme", // capital
            "my_theme", // underscore
            "my theme", // space
            "theme-", // trailing dash
            "-theme", // leading dash
            "theme--name", // double dash
            "a".repeat(51) // too long
        ]

        validNames.forEach(name => {
            it(`should accept valid theme name: ${name}`, async () => {
                await expect(runTheme({
                    cwd: testDir,
                    color: "midnight-blue",
                    name,
                    force: false,
                    silent: true,
                    root: false,
                    list: false,
                })).resolves.not.toThrow()
            })
        })

        invalidNames.forEach(name => {
            it(`should reject invalid theme name: ${name || 'empty string'}`, async () => {
                const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
                    throw new Error(`process.exit called with code ${code}`)
                })

                try {
                    await runTheme({
                        cwd: testDir,
                        color: "midnight-blue",
                        name,
                        force: false,
                        silent: true,
                        root: false,
                        list: false,
                    })
                    expect.fail("Expected process.exit to be called")
                } catch (error) {
                    expect(error.message).toContain('process.exit called')
                }

                mockExit.mockRestore()
            })
        })
    })

    describe("registry URL handling", () => {
        it("should handle string registry configuration", async () => {
            const configWithStringRegistry = {
                ...mockConfig,
                registries: {
                    "meduza-ui": "https://custom-registry.com/r/{name}.json"
                }
            }

            // Clear mock calls and set specific config for this test
            vi.mocked(getConfig).mockClear()
            vi.mocked(getAvailableColors).mockClear()
            vi.mocked(prompts).mockClear()
            vi.mocked(getConfig).mockResolvedValueOnce(configWithStringRegistry)

            // Mock prompts for interactive theme selection
            vi.mocked(prompts)
                .mockResolvedValueOnce({ selectedColor: "midnight-blue" })
                .mockResolvedValueOnce({ customName: "midnight-blue" })

            await runTheme({
                cwd: testDir,
                color: undefined, // No color provided so it will prompt and call getAvailableColors
                force: false,
                silent: true,
                root: false,
                list: false,
                name: undefined,
            })

            expect(vi.mocked(getAvailableColors)).toHaveBeenCalledWith(
                "https://custom-registry.com/r/{name}.json"
            )
        })

        it("should handle object registry configuration", async () => {
            const configWithObjectRegistry = {
                ...mockConfig,
                registries: {
                    "meduza-ui": {
                        url: "https://custom-registry.com/r/{name}.json",
                        baseUrl: "https://custom-registry.com"
                    }
                }
            }

            // Clear mock calls and set specific config for this test
            vi.mocked(getConfig).mockClear()
            vi.mocked(getAvailableColors).mockClear()
            vi.mocked(prompts).mockClear()
            vi.mocked(getConfig).mockResolvedValueOnce(configWithObjectRegistry)

            // Mock prompts for interactive theme selection
            vi.mocked(prompts)
                .mockResolvedValueOnce({ selectedColor: "midnight-blue" })
                .mockResolvedValueOnce({ customName: "midnight-blue" })

            await runTheme({
                cwd: testDir,
                color: undefined, // No color provided so it will prompt and call getAvailableColors
                force: false,
                silent: true,
                root: false,
                list: false,
                name: undefined,
            })

            expect(vi.mocked(getAvailableColors)).toHaveBeenCalledWith(
                "https://custom-registry.com/r/{name}.json"
            )
        })
    })
})
