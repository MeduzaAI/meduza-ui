import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
    getConfig,
    getRawConfig,
    resolveConfigPaths,
    writeConfig
} from "../get-config"
import { DEFAULT_CONFIG } from "../../registry/schema"

// Mock cosmiconfig
vi.mock("cosmiconfig", () => ({
    cosmiconfig: vi.fn(),
}))

// Mock fs-extra
vi.mock("fs-extra", () => ({
    pathExists: vi.fn(),
    writeFile: vi.fn(),
}))

import { cosmiconfig } from "cosmiconfig"
import * as fs from "fs-extra"

const mockCosmiconfig = vi.mocked(cosmiconfig)
const mockPathExists = vi.mocked(fs.pathExists)
const mockWriteFile = vi.mocked(fs.writeFile)

describe("get-config", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("getRawConfig", () => {
        it("should return null when no config file found", async () => {
            const mockExplorer = {
                search: vi.fn().mockResolvedValue(null)
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)

            const result = await getRawConfig("/test/project")

            expect(result).toBeNull()
            expect(mockExplorer.search).toHaveBeenCalledWith("/test/project")
        })

        it("should return parsed config when valid config found", async () => {
            const mockConfig = {
                style: "custom",
                scss: {
                    variables: "@/styles/_variables.scss",
                    mixins: "@/styles/_mixins.scss",
                },
                aliases: {
                    components: "@/components",
                    ui: "@/components/ui",
                    lib: "@/lib",
                    utils: "@/lib/utils",
                }
            }

            const mockExplorer = {
                search: vi.fn().mockResolvedValue({
                    config: mockConfig,
                    filepath: "/test/project/meduza.config.json"
                })
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)

            const result = await getRawConfig("/test/project")

            expect(result).toEqual(mockConfig)
        })

        it("should return null on parse error", async () => {
            const mockExplorer = {
                search: vi.fn().mockResolvedValue({
                    config: {
                        scss: "invalid", // Invalid schema - should be object
                        aliases: "invalid" // Invalid schema - should be object
                    },
                    filepath: "/test/project/meduza.config.json"
                })
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const result = await getRawConfig("/test/project")

            expect(result).toBeNull()
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error loading configuration:",
                expect.any(Error)
            )

            consoleSpy.mockRestore()
        })

        it("should create cosmiconfig with correct search places", async () => {
            const mockExplorer = {
                search: vi.fn().mockResolvedValue(null)
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)

            await getRawConfig("/test/project")

            expect(mockCosmiconfig).toHaveBeenCalledWith("meduza", {
                searchPlaces: [
                    "meduza.config.js",
                    "meduza.config.ts",
                    "meduza.config.json",
                    ".meduzarc",
                    ".meduzarc.json",
                ],
            })
        })
    })

    describe("resolveConfigPaths", () => {
        beforeEach(() => {
            mockPathExists.mockResolvedValue(false)
        })

        it("should resolve paths correctly", async () => {
            const mockConfig = {
                style: "default",
                scss: {
                    variables: "@/assets/styles/_variables.scss",
                    mixins: "@/assets/styles/_mixins.scss",
                },
                aliases: {
                    components: "@/components",
                    ui: "@/components/ui",
                    lib: "@/lib",
                    utils: "@/lib/utils",
                    composables: "@/composables",
                    assets: "@/assets",
                    styles: "@/assets/styles"
                }
            }

            const result = await resolveConfigPaths("/test/project", mockConfig)

            expect(result.resolvedPaths).toEqual({
                cwd: "/test/project",
                scssVariables: "/test/project/@/assets/styles/_variables.scss",
                scssMixins: "/test/project/@/assets/styles/_mixins.scss",
                components: "/test/project/components",
                ui: "/test/project/components/ui",
                lib: "/test/project/lib",
                utils: "/test/project/lib/utils",
                composables: "/test/project/composables",
                assets: "/test/project/assets",
                styles: "/test/project/assets/styles"
            })
        })

        it("should prefer src directory when it exists", async () => {
            const mockConfig = {
                style: "default",
                scss: {
                    variables: "@/assets/styles/_variables.scss",
                    mixins: "@/assets/styles/_mixins.scss",
                },
                aliases: {
                    components: "@/components",
                    ui: "@/components/ui",
                    lib: "@/lib",
                    utils: "@/lib/utils",
                }
            }

            // Mock src directory exists (resolveAlias checks parent directory)
            mockPathExists.mockImplementation((path: string) => {
                if (path === "/test/project/src" || path === "/test/project/src/components") {
                    return Promise.resolve(true)
                }
                return Promise.resolve(false)
            })

            const result = await resolveConfigPaths("/test/project", mockConfig)

            expect(result.resolvedPaths.components).toBe("/test/project/src/components")
            expect(result.resolvedPaths.ui).toBe("/test/project/src/components/ui")
        })

        it("should merge with default registries", async () => {
            const mockConfig = {
                style: "default",
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
                    "custom-registry": "https://custom.com/r/{name}.json"
                }
            }

            const result = await resolveConfigPaths("/test/project", mockConfig)

            expect(result.registries).toEqual({
                ...DEFAULT_CONFIG.registries,
                "custom-registry": "https://custom.com/r/{name}.json"
            })
        })
    })

    describe("getConfig", () => {
        it("should return null when no raw config found", async () => {
            const mockExplorer = {
                search: vi.fn().mockResolvedValue(null)
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)

            const result = await getConfig("/test/project")

            expect(result).toBeNull()
        })

        it("should return resolved config when raw config found", async () => {
            const mockConfig = {
                style: "default",
                scss: {
                    variables: "@/assets/styles/_variables.scss",
                    mixins: "@/assets/styles/_mixins.scss",
                },
                aliases: {
                    components: "@/components",
                    ui: "@/components/ui",
                    lib: "@/lib",
                    utils: "@/lib/utils",
                }
            }

            const mockExplorer = {
                search: vi.fn().mockResolvedValue({
                    config: mockConfig,
                    filepath: "/test/project/meduza.config.json"
                })
            }
            mockCosmiconfig.mockReturnValue(mockExplorer as any)
            mockPathExists.mockResolvedValue(false)

            const result = await getConfig("/test/project")

            expect(result).not.toBeNull()
            expect(result?.resolvedPaths.cwd).toBe("/test/project")
        })
    })

    describe("writeConfig", () => {
        it("should write config to meduza.config.json", async () => {
            const config = {
                style: "default",
                scss: {
                    variables: "@/assets/styles/_variables.scss",
                    mixins: "@/assets/styles/_mixins.scss",
                },
                aliases: {
                    components: "@/components",
                    ui: "@/components/ui",
                    lib: "@/lib",
                    utils: "@/lib/utils",
                }
            }

            await writeConfig("/test/project", config)

            expect(mockWriteFile).toHaveBeenCalledWith(
                "/test/project/meduza.config.json",
                JSON.stringify(config, null, 2)
            )
        })
    })
})
