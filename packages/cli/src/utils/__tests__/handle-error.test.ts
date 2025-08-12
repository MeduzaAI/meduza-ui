import { describe, it, expect, beforeEach, vi } from "vitest"
import { handleError } from "../handle-error"

// Mock logger
vi.mock("../logger", () => ({
    logger: {
        error: vi.fn(),
    },
}))

// Mock kleur
vi.mock("kleur", () => ({
    default: {
        dim: vi.fn((text: string) => `dim(${text})`),
    },
}))

import { logger } from "../logger"
import kleur from "kleur"

const mockLoggerError = vi.mocked(logger.error)
const mockKleurDim = vi.mocked(kleur.dim)

describe("handle-error", () => {
    let mockExit: ReturnType<typeof vi.spyOn>
    let mockConsoleError: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.clearAllMocks()

        // Mock process.exit to prevent actual exit during tests
        mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('process.exit called')
        })

        // Mock console.error
        mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        mockExit.mockRestore()
        mockConsoleError.mockRestore()
    })

    it("should handle string errors", () => {
        expect(() => {
            handleError("Something went wrong")
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Something went wrong")
        expect(mockExit).toHaveBeenCalledWith(1)
    })

    it("should handle Error objects", () => {
        const error = new Error("Test error message")

        expect(() => {
            handleError(error)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Test error message")
        expect(mockExit).toHaveBeenCalledWith(1)
    })

    it("should show stack trace in development", () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = "development"

        const error = new Error("Test error")
        error.stack = "Error: Test error\n    at test.js:1:1"

        expect(() => {
            handleError(error)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Test error")
        expect(mockConsoleError).toHaveBeenCalledWith("dim(Error: Test error\n    at test.js:1:1)")
        expect(mockKleurDim).toHaveBeenCalledWith("Error: Test error\n    at test.js:1:1")

        process.env.NODE_ENV = originalEnv
    })

    it("should not show stack trace in production", () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = "production"

        const error = new Error("Test error")
        error.stack = "Error: Test error\n    at test.js:1:1"

        expect(() => {
            handleError(error)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Test error")
        expect(mockConsoleError).not.toHaveBeenCalled()
        expect(mockKleurDim).not.toHaveBeenCalled()

        process.env.NODE_ENV = originalEnv
    })

    it("should handle Error objects without stack", () => {
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = "development"

        const error = new Error("Test error")
        error.stack = undefined

        expect(() => {
            handleError(error)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Test error")
        expect(mockConsoleError).not.toHaveBeenCalled()

        process.env.NODE_ENV = originalEnv
    })

    it("should handle unknown error types", () => {
        const unknownError = { someProperty: "value" }

        expect(() => {
            handleError(unknownError)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Something went wrong. Please try again.")
        expect(mockExit).toHaveBeenCalledWith(1)
    })

    it("should handle null errors", () => {
        expect(() => {
            handleError(null)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Something went wrong. Please try again.")
        expect(mockExit).toHaveBeenCalledWith(1)
    })

    it("should handle undefined errors", () => {
        expect(() => {
            handleError(undefined)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Something went wrong. Please try again.")
        expect(mockExit).toHaveBeenCalledWith(1)
    })

    it("should handle numeric errors", () => {
        expect(() => {
            handleError(404)
        }).toThrow('process.exit called')

        expect(mockLoggerError).toHaveBeenCalledWith("Something went wrong. Please try again.")
        expect(mockExit).toHaveBeenCalledWith(1)
    })
})
