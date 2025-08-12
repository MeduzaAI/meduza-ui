import { describe, it, expect } from "vitest"
import {
    rawConfigSchema,
    configSchema,
    registryConfigItemSchema,
    registryConfigSchema,
    DEFAULT_CONFIG
} from "../schema"

describe("schema", () => {
    it("should validate default config", () => {
        const result = rawConfigSchema.safeParse(DEFAULT_CONFIG)
        expect(result.success).toBe(true)
    })

    it("should use default values for required fields", () => {
        const result = rawConfigSchema.safeParse({})
        expect(result.success).toBe(true) // Should pass with default values

        if (result.success) {
            expect(result.data.style).toBe("default")
            expect(result.data.scss.variables).toBe("@/assets/styles/_variables.scss")
            expect(result.data.scss.mixins).toBe("@/assets/styles/_mixins.scss")
            expect(result.data.aliases.components).toBe("@/components")
            expect(result.data.aliases.ui).toBe("@/components/ui")
        }
    })

    it("should validate custom config", () => {
        const customConfig = {
            ...DEFAULT_CONFIG,
            style: "custom",
            aliases: {
                ...DEFAULT_CONFIG.aliases,
                components: "~/components",
            },
        }

        const result = rawConfigSchema.safeParse(customConfig)
        expect(result.success).toBe(true)
    })

    describe("registryConfigItemSchema", () => {
        it("should validate simple string format", () => {
            const result = registryConfigItemSchema.safeParse(
                "https://example.com/r/{name}.json"
            )
            expect(result.success).toBe(true)
        })

        it("should validate object format with name and url", () => {
            const result = registryConfigItemSchema.safeParse({
                name: "My Registry",
                url: "https://example.com/r/{name}.json"
            })
            expect(result.success).toBe(true)
        })

        it("should require {name} placeholder in URL", () => {
            const result = registryConfigItemSchema.safeParse(
                "https://example.com/r/components.json"
            )
            expect(result.success).toBe(false)
        })
    })

    describe("registryConfigSchema", () => {
        it("should validate official registry names", () => {
            const result = registryConfigSchema.safeParse({
                "meduza-ui": "https://meduza-ui.com/r/{name}.json"
            })
            expect(result.success).toBe(true)
        })

        it("should validate external registry names with @", () => {
            const result = registryConfigSchema.safeParse({
                "@company/ui": {
                    name: "Company UI",
                    url: "https://company.com/r/{name}.json"
                }
            })
            expect(result.success).toBe(true)
        })

        it("should reject invalid registry names", () => {
            const result = registryConfigSchema.safeParse({
                "Invalid_Registry": "https://example.com/r/{name}.json"
            })
            expect(result.success).toBe(false)
        })
    })
})
