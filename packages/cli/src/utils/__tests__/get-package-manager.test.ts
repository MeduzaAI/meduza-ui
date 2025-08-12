import { describe, it, expect, beforeEach, vi } from "vitest"
import { getPackageManager, getPackageRunner } from "../get-package-manager"

// Mock @antfu/ni
vi.mock("@antfu/ni", () => ({
    detect: vi.fn(),
}))

import { detect } from "@antfu/ni"

const mockDetect = vi.mocked(detect)

describe("get-package-manager", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete process.env.npm_config_user_agent
    })

    describe("getPackageManager", () => {
        it("should return detected package manager", async () => {
            mockDetect.mockResolvedValue("pnpm")

            const result = await getPackageManager("/test/project")

            expect(result).toBe("pnpm")
            expect(mockDetect).toHaveBeenCalledWith({
                programmatic: true,
                cwd: "/test/project"
            })
        })

        it("should return yarn for yarn@berry", async () => {
            mockDetect.mockResolvedValue("yarn@berry")

            const result = await getPackageManager("/test/project")

            expect(result).toBe("yarn")
        })

        it("should return pnpm for pnpm@6", async () => {
            mockDetect.mockResolvedValue("pnpm@6")

            const result = await getPackageManager("/test/project")

            expect(result).toBe("pnpm")
        })

        it("should return bun for bun", async () => {
            mockDetect.mockResolvedValue("bun")

            const result = await getPackageManager("/test/project")

            expect(result).toBe("bun")
        })

        it("should fallback to npm when detection returns null", async () => {
            mockDetect.mockResolvedValue(null)

            const result = await getPackageManager("/test/project")

            expect(result).toBe("npm")
        })

        it("should fallback to npm when detection returns undefined", async () => {
            mockDetect.mockResolvedValue(undefined)

            const result = await getPackageManager("/test/project")

            expect(result).toBe("npm")
        })

        describe("with fallback enabled", () => {
            it("should use user agent fallback for yarn", async () => {
                mockDetect.mockResolvedValue(null)
                process.env.npm_config_user_agent = "yarn/1.22.0"

                const result = await getPackageManager("/test/project", { withFallback: true })

                expect(result).toBe("yarn")
            })

            it("should use user agent fallback for pnpm", async () => {
                mockDetect.mockResolvedValue(null)
                process.env.npm_config_user_agent = "pnpm/8.0.0"

                const result = await getPackageManager("/test/project", { withFallback: true })

                expect(result).toBe("pnpm")
            })

            it("should use user agent fallback for bun", async () => {
                mockDetect.mockResolvedValue(null)
                process.env.npm_config_user_agent = "bun/1.0.0"

                const result = await getPackageManager("/test/project", { withFallback: true })

                expect(result).toBe("bun")
            })

            it("should fallback to npm when user agent is unknown", async () => {
                mockDetect.mockResolvedValue(null)
                process.env.npm_config_user_agent = "unknown/1.0.0"

                const result = await getPackageManager("/test/project", { withFallback: true })

                expect(result).toBe("npm")
            })

            it("should fallback to npm when no user agent", async () => {
                mockDetect.mockResolvedValue(null)

                const result = await getPackageManager("/test/project", { withFallback: true })

                expect(result).toBe("npm")
            })
        })
    })

    describe("getPackageRunner", () => {
        it("should return yarn for yarn package manager", async () => {
            mockDetect.mockResolvedValue("yarn")

            const result = await getPackageRunner("/test/project")

            expect(result).toBe("yarn")
        })

        it("should return pnpm for pnpm package manager", async () => {
            mockDetect.mockResolvedValue("pnpm")

            const result = await getPackageRunner("/test/project")

            expect(result).toBe("pnpm")
        })

        it("should return bun for bun package manager", async () => {
            mockDetect.mockResolvedValue("bun")

            const result = await getPackageRunner("/test/project")

            expect(result).toBe("bun")
        })

        it("should return npm run for npm package manager", async () => {
            mockDetect.mockResolvedValue("npm")

            const result = await getPackageRunner("/test/project")

            expect(result).toBe("npm run")
        })

        it("should return npm run for unknown package manager", async () => {
            mockDetect.mockResolvedValue(null)

            const result = await getPackageRunner("/test/project")

            expect(result).toBe("npm run")
        })
    })
})
