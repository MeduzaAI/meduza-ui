import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { tmpdir } from "os"
import { join } from "path"
import * as fs from "fs-extra"
import {
    fetchRegistryItem,
    fetchColorData,
    getAvailableColors,
    createVariablesFile,
    createMixinsFile,
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
        await fs.remove(testDir)
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
                                type: "file",
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
        it("should return available color options", () => {
            const colors = getAvailableColors()

            expect(colors).toHaveLength(5)
            expect(colors.map((c) => c.name)).toEqual(["slate", "zinc", "stone", "gray", "neutral"])
            expect(colors[0]).toEqual({ name: "slate", label: "Slate" })
        })
    })

    describe("createVariablesFile", () => {
        it("should create variables file with color data", async () => {
            const variablesPath = join(testDir, "assets/styles/_variables.scss")
            const colorData = {
                inlineColors: {
                    light: { primary: "slate-900" },
                    dark: { primary: "slate-50" },
                },
                cssVars: {
                    light: { "primary-color": "#0f172a", "background-color": "#ffffff" },
                    dark: { "primary-color": "#f8fafc", "background-color": "#0f172a" },
                },
                cssVarsTemplate: "",
            }

            await createVariablesFile(variablesPath, colorData)

            expect(await fs.pathExists(variablesPath)).toBe(true)
            const content = await fs.readFile(variablesPath, "utf8")

            // Check that color variables are injected
            expect(content).toContain("--primary-color: #0f172a;")
            expect(content).toContain("--background-color: #ffffff;")
            expect(content).toContain("[data-theme=\"dark\"]")
            expect(content).toContain("--primary-color: #f8fafc;")

            // Check that design system variables are included
            expect(content).toContain("--spacing-4: 16px;")
            expect(content).toContain("--text-base: 16px;")
            expect(content).toContain("--radius-base: 4px;")
            expect(content).toContain("--font-regular: 400;")
        })

        it("should create directory if it doesn't exist", async () => {
            const variablesPath = join(testDir, "nested/deep/styles/_variables.scss")
            const colorData = {
                inlineColors: { light: {}, dark: {} },
                cssVars: { light: {}, dark: {} },
                cssVarsTemplate: "",
            }

            await createVariablesFile(variablesPath, colorData)

            expect(await fs.pathExists(variablesPath)).toBe(true)
            expect(await fs.pathExists(join(testDir, "nested/deep/styles"))).toBe(true)
        })
    })

    describe("createMixinsFile", () => {
        it("should create mixins file with utilities", async () => {
            const mixinsPath = join(testDir, "assets/styles/_mixins.scss")

            await createMixinsFile(mixinsPath)

            expect(await fs.pathExists(mixinsPath)).toBe(true)
            const content = await fs.readFile(mixinsPath, "utf8")

            // Check that mixins are included
            expect(content).toContain("@mixin focus-ring")
            expect(content).toContain("@mixin text(")
            expect(content).toContain("@mixin container(")
            expect(content).toContain("&:focus-visible")
            expect(content).toContain("font-size: var(--text-base);")
            expect(content).toContain("max-width: 1024px;")
        })

        it("should create directory if it doesn't exist", async () => {
            const mixinsPath = join(testDir, "nested/styles/_mixins.scss")

            await createMixinsFile(mixinsPath)

            expect(await fs.pathExists(mixinsPath)).toBe(true)
            expect(await fs.pathExists(join(testDir, "nested/styles"))).toBe(true)
        })
    })
})
