import kleur from "kleur"
import { logger } from "./logger"

export function handleError(error: unknown): never {
    if (typeof error === "string") {
        logger.error(error)
        process.exit(1)
    }

    if (error instanceof Error) {
        logger.error(error.message)

        // Show stack trace in development
        if (process.env.NODE_ENV === "development" && error.stack) {
            console.error(kleur.dim(error.stack))
        }

        process.exit(1)
    }

    logger.error("Something went wrong. Please try again.")
    process.exit(1)
}
