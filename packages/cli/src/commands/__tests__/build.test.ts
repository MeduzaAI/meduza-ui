import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { runBuild } from "../build"
import fs from "fs-extra"
import * as path from "path"
import { temporaryDirectory } from "tempy"

// Mock the logger to avoid console output during tests
vi.mock("@/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    break: vi.fn(),
  },
  spinner: vi.fn(() => ({
    start: vi.fn(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: "",
  })),
  highlighter: {
    info: (text: string) => text,
    warn: (text: string) => text,
    error: (text: string) => text,
    success: (text: string) => text,
    code: (text: string) => text,
    path: (text: string) => text,
  },
}))

// Mock console.error to prevent test output
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

describe("build command", () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = temporaryDirectory()
  })

  afterEach(async () => {
    await fs.remove(tempDir)
  })

  it("should build registry from valid configuration", async () => {
    // Setup test registry and components
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "test-registry",
      description: "A test registry",
      items: [
        {
          name: "button",
          type: "registry:ui" as const,
          description: "A button component",
          files: [
            {
              path: "Button.vue",
              type: "file" as const,
              content: '<template><button><slot /></button></template>\n\n<script setup lang="ts">\n// Button component\n</script>\n\n<style lang="scss">\n.button {\n  padding: 0.5rem 1rem;\n}\n</style>'
            }
          ]
        }
      ]
    }

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))
    await fs.writeFile(
      path.join(tempDir, "Button.vue"),
      '<template><button><slot /></button></template>\n\n<script setup lang="ts">\n// Button component\n</script>\n\n<style lang="scss">\n.button {\n  padding: 0.5rem 1rem;\n}\n</style>'
    )

    // Run build - should succeed now
    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./public/r",
      verbose: false
    })

    // Verify output
    const outputDir = path.join(tempDir, "public/r")
    expect(await fs.pathExists(path.join(outputDir, "button.json"))).toBe(true)
    expect(await fs.pathExists(path.join(outputDir, "registry.json"))).toBe(true)

    const buttonJson = await fs.readJson(path.join(outputDir, "button.json"))
    expect(buttonJson.name).toBe("button")
    expect(buttonJson.$schema).toBe("https://meduza-ui.dev/schema/registry-item.json")
    expect(buttonJson.files[0].content).toContain("<template>")
    expect(buttonJson.files[0].content).toContain("<script setup")
    expect(buttonJson.files[0].content).toContain("<style lang=\"scss\">")
  })

  it("should handle missing registry file", async () => {
    // Mock process.exit to prevent actual exit during test
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    try {
      await expect(runBuild({
        cwd: tempDir,
        registryFile: "./nonexistent.json",
        outputDir: "./public/r",
        verbose: false
      })).rejects.toThrow("process.exit called")
    } finally {
      exitSpy.mockRestore()
    }
  })

  it("should validate registry schema", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    await fs.writeFile(registryPath, JSON.stringify({ invalid: "schema" }))

    // Mock process.exit to prevent actual exit during test
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called")
    })

    try {
      await expect(runBuild({
        cwd: tempDir,
        registryFile: "./registry.json",
        outputDir: "./public/r",
        verbose: false
      })).rejects.toThrow("process.exit called")
    } finally {
      exitSpy.mockRestore()
    }
  })

  it("should handle missing component files gracefully", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "test-registry",
      description: "A test registry",
      items: [
        {
          name: "button",
          type: "registry:ui" as const,
          description: "A button component",
          files: [
            {
              path: "NonExistent.vue",
              type: "file" as const,
              content: '<template><div>Non-existent component</div></template>'
            }
          ]
        }
      ]
    }

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))

    // This should not throw, but warn about missing files
    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./public/r",
      verbose: false
    })

    // Verify output directory was still created
    const outputDir = path.join(tempDir, "public/r")
    expect(await fs.pathExists(outputDir)).toBe(true)
    expect(await fs.pathExists(path.join(outputDir, "registry.json"))).toBe(true)
  })

  it("should build multiple components with different types", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "multi-component-registry",
      description: "Registry with multiple component types",
      items: [
        {
          name: "button",
          type: "registry:ui" as const,
          description: "A button component",
          files: [
            {
              path: "components/Button.vue",
              type: "file" as const,
              content: '<template><button class="btn"><slot /></button></template>'
            }
          ],
          category: "form"
        },
        {
          name: "utils",
          type: "registry:lib" as const,
          description: "Utility functions",
          files: [
            {
              path: "lib/utils.ts",
              type: "file" as const,
              content: 'export function cn(...classes: string[]) { return classes.join(" ") }'
            }
          ]
        }
      ]
    }

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))

    // Create component directories
    await fs.ensureDir(path.join(tempDir, "components"))
    await fs.ensureDir(path.join(tempDir, "lib"))

    await fs.writeFile(
      path.join(tempDir, "components/Button.vue"),
      '<template><button class="btn"><slot /></button></template>'
    )

    await fs.writeFile(
      path.join(tempDir, "lib/utils.ts"),
      'export function cn(...classes: string[]) {\n  return classes.join(" ")\n}'
    )

    // Run build with verbose output
    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./dist/registry",
      verbose: true
    })

    // Verify all components were built
    const outputDir = path.join(tempDir, "dist/registry")
    expect(await fs.pathExists(path.join(outputDir, "button.json"))).toBe(true)
    expect(await fs.pathExists(path.join(outputDir, "utils.json"))).toBe(true)
    expect(await fs.pathExists(path.join(outputDir, "registry.json"))).toBe(true)

    // Verify content
    const buttonJson = await fs.readJson(path.join(outputDir, "button.json"))
    expect(buttonJson.type).toBe("registry:ui")
    expect(buttonJson.category).toBe("form")
    expect(buttonJson.files[0].content).toContain("<template>")

    const utilsJson = await fs.readJson(path.join(outputDir, "utils.json"))
    expect(utilsJson.type).toBe("registry:lib")
    expect(utilsJson.files[0].content).toContain("export function cn")
  })

  it("should preserve registry metadata in output", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "test-registry",
      description: "A comprehensive test registry",
      homepage: "https://test-registry.dev",
      items: []
    }

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))

    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./public/r",
      verbose: false
    })

    const outputRegistry = await fs.readJson(path.join(tempDir, "public/r", "registry.json"))
    expect(outputRegistry.name).toBe("test-registry")
    expect(outputRegistry.description).toBe("A comprehensive test registry")
    expect(outputRegistry.homepage).toBe("https://test-registry.dev")
  })

  it("should handle complex file structures", async () => {
    const registryPath = path.join(tempDir, "registry.json")
    const registry = {
      name: "complex-registry",
      items: [
        {
          name: "card",
          type: "registry:ui" as const,
          description: "A card component with multiple files",
          dependencies: ["vue"],
          registryDependencies: ["utils"],
          files: [
            {
              path: "components/ui/Card.vue",
              type: "file" as const,
              content: '<template><div class="card"><slot /></div></template>'
            },
            {
              path: "components/ui/card.scss",
              type: "file" as const,
              content: '.card { padding: 1rem; border-radius: 0.5rem; }'
            },
            {
              path: "types/card.ts",
              type: "file" as const,
              content: 'export interface CardProps { title?: string }'
            }
          ]
        }
      ]
    }

    await fs.writeFile(registryPath, JSON.stringify(registry, null, 2))

    // Create complex directory structure
    await fs.ensureDir(path.join(tempDir, "components/ui"))
    await fs.ensureDir(path.join(tempDir, "types"))

    await fs.writeFile(
      path.join(tempDir, "components/ui/Card.vue"),
      '<template>\n  <div class="card">\n    <slot />\n  </div>\n</template>\n\n<script setup lang="ts">\nimport type { CardProps } from "@/types/card"\n</script>'
    )

    await fs.writeFile(
      path.join(tempDir, "components/ui/card.scss"),
      '.card {\n  border: 1px solid #e2e8f0;\n  border-radius: 0.5rem;\n  padding: 1rem;\n}'
    )

    await fs.writeFile(
      path.join(tempDir, "types/card.ts"),
      'export interface CardProps {\n  variant?: "default" | "bordered"\n}'
    )

    await runBuild({
      cwd: tempDir,
      registryFile: "./registry.json",
      outputDir: "./output",
      verbose: false
    })

    const cardJson = await fs.readJson(path.join(tempDir, "output", "card.json"))
    expect(cardJson.files).toHaveLength(3)
    expect(cardJson.files[0].content).toContain('<template>')
    expect(cardJson.files[1].content).toContain('.card {')
    expect(cardJson.files[2].content).toContain('export interface CardProps')
    expect(cardJson.dependencies).toContain("vue")
    expect(cardJson.registryDependencies).toContain("utils")
  })
})
