import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import {
    fetchRegistryItem,
    fetchColorData,
    getAvailableColors,
    injectColorsIntoVariablesFile,
} from "../api"

// Mock node-fetch
vi.mock("node-fetch", () => ({
    default: vi.fn(),
}))

describe("Registry API", () => {
    let testDir: string

    beforeEach(async () => {
        testDir = join(tmpdir(), `meduza-ui-test-${Date.now()}`)
        await fs.ensureDir(testDir)
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

    describe("fetchRegistryItem", () => {
        it("should fetch and parse registry item", async () => {
            const mockFetch = (await import("node-fetch")).default as any
            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        name: "button",
                        type: "registry:ui",
                        description: "A button component",
                        files: [
                            {
                                path: "ui/button.vue",
                                content: "<template><button>Button</button></template>",
                                type: "registry:ui",
                            },
                        ],
                    }),
            })

            const result = await fetchRegistryItem("https://example.com/r", "button")

            expect(mockFetch).toHaveBeenCalledWith("https://example.com/r/styles/default/button.json")
            expect(result.name).toBe("button")
            expect(result.type).toBe("registry:ui")
            expect(result.files).toHaveLength(1)
        })

        it("should throw error for failed fetch", async () => {
            const mockFetch = (await import("node-fetch")).default as any
            mockFetch.mockResolvedValue({
                ok: false,
                statusText: "Not Found",
            })

            await expect(fetchRegistryItem("https://example.com/r", "nonexistent")).rejects.toThrow(
                "Failed to fetch component nonexistent: Not Found"
            )
        })
    })

    describe("fetchColorData", () => {
        it("should fetch and parse color data", async () => {
            const mockFetch = (await import("node-fetch")).default as any
            mockFetch.mockResolvedValue({
                ok: true,
                json: () =>
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
                    }),
            })

            const result = await fetchColorData("slate", "https://example.com/r")

            expect(mockFetch).toHaveBeenCalledWith("https://example.com/r/colors/slate.json")
            expect(result.cssVars.light["primary-color"]).toBe("#0f172a")
            expect(result.cssVars.dark["primary-color"]).toBe("#f8fafc")
        })

        it("should throw error for failed color fetch", async () => {
            const mockFetch = (await import("node-fetch")).default as any
            mockFetch.mockResolvedValue({
                ok: false,
                statusText: "Not Found",
            })

            await expect(fetchColorData("invalid", "https://example.com/r")).rejects.toThrow(
                "Failed to fetch color data for invalid: Not Found"
            )
        })
    })

    describe("getAvailableColors", () => {
        it("should return available color options", async () => {
            const colors = await getAvailableColors()

            expect(colors).toHaveLength(5)
            expect(colors.map((c) => c.name)).toEqual(["slate", "zinc", "stone", "gray", "neutral"])
            expect(colors[0]).toEqual({ name: "slate", label: "Slate" })
        })
    })

    describe("injectColorsIntoVariablesFile", () => {
        it("should inject colors into existing variables file", async () => {
            const variablesPath = join(testDir, "_variables.scss")

            // Create a variables file with existing content (like from registry)
            const existingContent = `:root {
    /* Colors - Semantic */
    --primary-color: #334155;
    --background-color: #ffffff;

    /* Surface colors */
    --surface-color: #ffffff;
    --card-color: #ffffff;
}

[data-mode="dark"] {
    --primary-color: #e2e8f0;
    --background-color: #0f172a;
}`

            await fs.writeFile(variablesPath, existingContent, "utf8")

            const colorData = {
                name: "zinc",
                label: "Zinc",
                cssVars: {
                    light: {
                        "primary-color": "#18181b",
                        "background-color": "#fafafa",
                    },
                    dark: {
                        "primary-color": "#fafafa",
                        "background-color": "#18181b",
                    },
                },
            }

            await injectColorsIntoVariablesFile(variablesPath, colorData, { asTheme: false })

            const content = await fs.readFile(variablesPath, "utf8")
            expect(content).toContain("--primary-color: #18181b")
            expect(content).toContain("--background-color: #fafafa")
            expect(content).toContain("[data-mode=\"dark\"]")
            expect(content).toContain("--primary-color: #fafafa")
            expect(content).toContain("--background-color: #18181b")
        })

        it("should throw error if variables file doesn't exist", async () => {
            const variablesPath = join(testDir, "_variables.scss")

            const colorData = {
                name: "zinc",
                label: "Zinc",
                cssVars: {
                    light: { "primary-color": "#18181b" },
                    dark: { "primary-color": "#fafafa" },
                },
            }

            await expect(injectColorsIntoVariablesFile(variablesPath, colorData))
                .rejects.toThrow("Variables file not found")
        })
    })
})
