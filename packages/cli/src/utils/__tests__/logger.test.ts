import { describe, it, expect, beforeEach, vi } from "vitest"
import { Logger, logger, spinner, highlighter } from "../logger"

// Mock ora
vi.mock("ora", () => ({
    default: vi.fn(),
}))

// Mock kleur
vi.mock("kleur", () => ({
    default: {
        blue: vi.fn((text: string) => `blue(${text})`),
        green: vi.fn((text: string) => `green(${text})`),
        yellow: vi.fn((text: string) => `yellow(${text})`),
        red: vi.fn((text: string) => `red(${text})`),
        cyan: vi.fn((text: string) => `cyan(${text})`),
        gray: vi.fn((text: string) => `gray(${text})`),
        dim: vi.fn((text: string) => `dim(${text})`),
    },
}))

import ora from "ora"
import kleur from "kleur"

const mockOra = vi.mocked(ora)
const mockKleur = vi.mocked(kleur)

describe("logger", () => {
    let mockConsoleLog: ReturnType<typeof vi.spyOn>
    let mockSpinner: any

    beforeEach(() => {
        vi.clearAllMocks()

        mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => { })

        mockSpinner = {
            start: vi.fn().mockReturnThis(),
            succeed: vi.fn(),
            fail: vi.fn(),
        }

        mockOra.mockReturnValue(mockSpinner)
    })

    afterEach(() => {
        mockConsoleLog.mockRestore()
    })

    describe("Logger class", () => {
        let loggerInstance: Logger

        beforeEach(() => {
            loggerInstance = new Logger()
        })

        describe("info", () => {
            it("should log info message with blue icon", () => {
                loggerInstance.info("Test info message")

                expect(mockConsoleLog).toHaveBeenCalledWith("blue(ℹ)", "Test info message")
                expect(mockKleur.blue).toHaveBeenCalledWith("ℹ")
            })
        })

        describe("success", () => {
            it("should log success message with green icon", () => {
                loggerInstance.success("Test success message")

                expect(mockConsoleLog).toHaveBeenCalledWith("green(✓)", "Test success message")
                expect(mockKleur.green).toHaveBeenCalledWith("✓")
            })
        })

        describe("warn", () => {
            it("should log warning message with yellow icon", () => {
                loggerInstance.warn("Test warning message")

                expect(mockConsoleLog).toHaveBeenCalledWith("yellow(⚠)", "Test warning message")
                expect(mockKleur.yellow).toHaveBeenCalledWith("⚠")
            })
        })

        describe("error", () => {
            it("should log error message with red icon", () => {
                loggerInstance.error("Test error message")

                expect(mockConsoleLog).toHaveBeenCalledWith("red(✖)", "Test error message")
                expect(mockKleur.red).toHaveBeenCalledWith("✖")
            })
        })

        describe("log", () => {
            it("should log plain message", () => {
                loggerInstance.log("Test plain message")

                expect(mockConsoleLog).toHaveBeenCalledWith("Test plain message")
            })
        })

        describe("break", () => {
            it("should log empty line", () => {
                loggerInstance.break()

                expect(mockConsoleLog).toHaveBeenCalledWith()
            })
        })

        describe("spin", () => {
            it("should start spinner with message", () => {
                loggerInstance.spin("Loading...")

                expect(mockOra).toHaveBeenCalledWith("Loading...")
                expect(mockSpinner.start).toHaveBeenCalled()
            })
        })

        describe("stopSpinner", () => {
            beforeEach(() => {
                // Start a spinner first
                loggerInstance.spin("Loading...")
            })

            it("should succeed spinner by default", () => {
                loggerInstance.stopSpinner()

                expect(mockSpinner.succeed).toHaveBeenCalledWith(undefined)
            })

            it("should succeed spinner with custom message", () => {
                loggerInstance.stopSpinner(true, "Done!")

                expect(mockSpinner.succeed).toHaveBeenCalledWith("Done!")
            })

            it("should fail spinner when success is false", () => {
                loggerInstance.stopSpinner(false, "Failed!")

                expect(mockSpinner.fail).toHaveBeenCalledWith("Failed!")
            })

            it("should do nothing when no spinner is active", () => {
                const newLogger = new Logger()

                newLogger.stopSpinner()

                expect(mockSpinner.succeed).not.toHaveBeenCalled()
                expect(mockSpinner.fail).not.toHaveBeenCalled()
            })
        })
    })

    describe("exported logger instance", () => {
        it("should be an instance of Logger", () => {
            expect(logger).toBeInstanceOf(Logger)
        })

        it("should work with all methods", () => {
            logger.info("test")
            logger.success("test")
            logger.warn("test")
            logger.error("test")
            logger.log("test")
            logger.break()

            expect(mockConsoleLog).toHaveBeenCalledTimes(6)
        })
    })

    describe("spinner function", () => {
        it("should create ora spinner with message", () => {
            const result = spinner("Test message")

            expect(mockOra).toHaveBeenCalledWith("Test message")
            expect(result).toBe(mockSpinner)
        })
    })

    describe("highlighter", () => {
        it("should have info method", () => {
            const result = highlighter.info("test")

            expect(result).toBe("cyan(test)")
            expect(mockKleur.cyan).toHaveBeenCalledWith("test")
        })

        it("should have warn method", () => {
            const result = highlighter.warn("test")

            expect(result).toBe("yellow(test)")
            expect(mockKleur.yellow).toHaveBeenCalledWith("test")
        })

        it("should have error method", () => {
            const result = highlighter.error("test")

            expect(result).toBe("red(test)")
            expect(mockKleur.red).toHaveBeenCalledWith("test")
        })

        it("should have success method", () => {
            const result = highlighter.success("test")

            expect(result).toBe("green(test)")
            expect(mockKleur.green).toHaveBeenCalledWith("test")
        })

        it("should have code method", () => {
            const result = highlighter.code("test")

            expect(result).toBe("gray(test)")
            expect(mockKleur.gray).toHaveBeenCalledWith("test")
        })

        it("should have path method", () => {
            const result = highlighter.path("test")

            expect(result).toBe("dim(test)")
            expect(mockKleur.dim).toHaveBeenCalledWith("test")
        })
    })
})
