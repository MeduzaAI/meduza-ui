import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { addComponents } from "../add-components"
import type { Config, RegistryItem } from "../../registry/schema"

// Mock dependencies
vi.mock("../logger", () => ({
    logger: {
        spin: vi.fn(),
        stopSpinner: vi.fn(),
        success: vi.fn(),
    },
}))

vi.mock("../../registry/api", () => ({
    fetchRegistryItem: vi.fn(),
}))

vi.mock("../updaters/update-files", () => ({
    updateFiles: vi.fn(),
    updateFilesWithConflictCheck: vi.fn(),
}))

vi.mock("../updaters/update-dependencies", () => ({
    updateDependencies: vi.fn(),
}))

describe("addComponents", () => {
    const mockConfig: Config = {
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
            cwd: "/test",
            scssVariables: "/test/assets/styles/_variables.scss",
            scssMixins: "/test/assets/styles/_mixins.scss",
            components: "/test/components",
            ui: "/test/components/ui",
            lib: "/test/lib",
            utils: "/test/lib/utils",
            composables: "/test/composables",
            assets: "/test/assets",
            styles: "/test/assets/styles",
        },
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should fetch and install components", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")
        const { updateFilesWithConflictCheck } = await import("../updaters/update-files")
        const { updateDependencies } = await import("../updaters/update-dependencies")

        const mockItem: RegistryItem = {
            name: "button",
            type: "registry:ui",
            description: "A button component",
            dependencies: ["vue"],
            devDependencies: ["@types/node"],
            files: [
                {
                    path: "ui/button.vue",
                    content: "<template><button>Button</button></template>",
                    type: "file",
                },
            ],
        }

            ; (fetchRegistryItem as any).mockResolvedValue(mockItem)

        await addComponents(["button"], mockConfig, { silent: true })

        expect(fetchRegistryItem).toHaveBeenCalledWith("https://meduza-ui.com/r", "button")
        expect(updateDependencies).toHaveBeenCalledWith(["vue"], ["@types/node"], mockConfig, { silent: true })
        expect(updateFilesWithConflictCheck).toHaveBeenCalledWith(mockItem.files, mockConfig, { overwrite: false, silent: true })
    })

    it("should handle registry dependencies recursively", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")

        const utilsItem: RegistryItem = {
            name: "utils",
            type: "registry:lib",
            description: "Utility functions",
            files: [
                {
                    path: "lib/utils.ts",
                    content: "export const cn = () => {}",
                    type: "file",
                },
            ],
        }

        const buttonItem: RegistryItem = {
            name: "button",
            type: "registry:ui",
            description: "A button component",
            registryDependencies: ["utils"],
            files: [
                {
                    path: "ui/button.vue",
                    content: "<template><button>Button</button></template>",
                    type: "file",
                },
            ],
        }

            ; (fetchRegistryItem as any).mockImplementation((url: string, name: string) => {
                if (name === "button") return Promise.resolve(buttonItem)
                if (name === "utils") return Promise.resolve(utilsItem)
                throw new Error(`Unknown component: ${name}`)
            })

        await addComponents(["button"], mockConfig, { silent: true })

        // Should fetch both button and utils
        expect(fetchRegistryItem).toHaveBeenCalledWith("https://meduza-ui.com/r", "button")
        expect(fetchRegistryItem).toHaveBeenCalledWith("https://meduza-ui.com/r", "utils")
    })

    it("should handle multiple components", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")

        const buttonItem: RegistryItem = {
            name: "button",
            type: "registry:ui",
            description: "A button component",
            files: [],
        }

        const inputItem: RegistryItem = {
            name: "input",
            type: "registry:ui",
            description: "An input component",
            files: [],
        }

            ; (fetchRegistryItem as any).mockImplementation((url: string, name: string) => {
                if (name === "button") return Promise.resolve(buttonItem)
                if (name === "input") return Promise.resolve(inputItem)
                throw new Error(`Unknown component: ${name}`)
            })

        await addComponents(["button", "input"], mockConfig, { silent: true })

        expect(fetchRegistryItem).toHaveBeenCalledTimes(2)
        expect(fetchRegistryItem).toHaveBeenCalledWith("https://meduza-ui.com/r", "button")
        expect(fetchRegistryItem).toHaveBeenCalledWith("https://meduza-ui.com/r", "input")
    })

    it("should handle empty component list", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")

        await addComponents([], mockConfig, { silent: true })

        expect(fetchRegistryItem).not.toHaveBeenCalled()
    })

    it("should throw error for failed component fetch", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")
            ; (fetchRegistryItem as any).mockRejectedValue(new Error("Component not found"))

        await expect(addComponents(["nonexistent"], mockConfig, { silent: true })).rejects.toThrow(
            "Component not found"
        )
    })

    it("should handle object-style registry config", async () => {
        const { fetchRegistryItem } = await import("../../registry/api")

        const configWithObjectRegistry = {
            ...mockConfig,
            registries: {
                "meduza-ui": {
                    name: "meduza-ui",
                    url: "https://custom.example.com/registry",
                },
            },
        }

        const mockItem: RegistryItem = {
            name: "button",
            type: "registry:ui",
            description: "A button component",
            files: [],
        }

            ; (fetchRegistryItem as any).mockResolvedValue(mockItem)

        await addComponents(["button"], configWithObjectRegistry, { silent: true })

        expect(fetchRegistryItem).toHaveBeenCalledWith("https://custom.example.com/registry", "button")
    })

    it("should throw error for missing registry config", async () => {
        const configWithoutRegistry = {
            ...mockConfig,
            registries: {},
        }

        await expect(addComponents(["button"], configWithoutRegistry, { silent: true })).rejects.toThrow(
            "No meduza-ui registry configured"
        )
    })
})
