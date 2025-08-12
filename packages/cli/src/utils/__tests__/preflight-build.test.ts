import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { preFlightBuild } from "../preflight-build"
import fs from "fs-extra"
import * as path from "path"
import { temporaryDirectory } from "tempy"

describe("preFlightBuild", () => {
    let tempDir: string

    beforeEach(async () => {
        tempDir = temporaryDirectory()
    })

    afterEach(async () => {
        await fs.remove(tempDir)
    })

    it("should return resolved paths when registry file exists", async () => {
        const registryPath = path.join(tempDir, "registry.json")
        await fs.writeFile(registryPath, JSON.stringify({ name: "test" }))

        const result = await preFlightBuild({
            cwd: tempDir,
            registryFile: "./registry.json",
            outputDir: "./public/r",
            verbose: false
        })

        expect(result.resolvePaths).toBeTruthy()
        expect(result.resolvePaths?.cwd).toBe(tempDir)
        expect(result.resolvePaths?.registryFile).toBe(registryPath)
        expect(result.resolvePaths?.outputDir).toBe(path.join(tempDir, "public/r"))
        expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it("should return error when registry file does not exist", async () => {
        const result = await preFlightBuild({
            cwd: tempDir,
            registryFile: "./nonexistent.json",
            outputDir: "./public/r",
            verbose: false
        })

        expect(result.resolvePaths).toBeNull()
        expect(result.errors.MISSING_REGISTRY_FILE).toBe(true)
    })

    it("should resolve absolute paths correctly", async () => {
        const registryPath = path.join(tempDir, "custom", "registry.json")
        await fs.ensureDir(path.dirname(registryPath))
        await fs.writeFile(registryPath, JSON.stringify({ name: "test" }))

        const result = await preFlightBuild({
            cwd: tempDir,
            registryFile: "./custom/registry.json",
            outputDir: "./dist/output",
            verbose: false
        })

        expect(result.resolvePaths?.registryFile).toBe(registryPath)
        expect(result.resolvePaths?.outputDir).toBe(path.join(tempDir, "dist/output"))
    })

    it("should handle different working directories", async () => {
        const subDir = path.join(tempDir, "subproject")
        await fs.ensureDir(subDir)

        const registryPath = path.join(subDir, "registry.json")
        await fs.writeFile(registryPath, JSON.stringify({ name: "test" }))

        const result = await preFlightBuild({
            cwd: subDir,
            registryFile: "./registry.json",
            outputDir: "../output",
            verbose: false
        })

        expect(result.resolvePaths?.cwd).toBe(subDir)
        expect(result.resolvePaths?.registryFile).toBe(registryPath)
        expect(result.resolvePaths?.outputDir).toBe(path.join(tempDir, "output"))
    })
})
