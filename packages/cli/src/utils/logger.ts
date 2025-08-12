import kleur from "kleur"
import ora, { type Ora } from "ora"

export class Logger {
    private spinner: Ora | null = null

    info(message: string): void {
        console.log(kleur.blue("ℹ"), message)
    }

    success(message: string): void {
        console.log(kleur.green("✓"), message)
    }

    warn(message: string): void {
        console.log(kleur.yellow("⚠"), message)
    }

    error(message: string): void {
        console.log(kleur.red("✖"), message)
    }

    log(message: string): void {
        console.log(message)
    }

    break(): void {
        console.log()
    }

    spin(message: string): void {
        this.spinner = ora(message).start()
    }

    stopSpinner(success: boolean = true, message?: string): void {
        if (this.spinner) {
            if (success) {
                this.spinner.succeed(message)
            } else {
                this.spinner.fail(message)
            }
            this.spinner = null
        }
    }
}

export const logger = new Logger()

// Create a spinner utility function
export function spinner(message: string): Ora {
    return ora(message)
}

// Create a highlighter utility for consistent formatting
export const highlighter = {
    info: (text: string) => kleur.cyan(text),
    warn: (text: string) => kleur.yellow(text),
    error: (text: string) => kleur.red(text),
    success: (text: string) => kleur.green(text),
    code: (text: string) => kleur.gray(text),
    path: (text: string) => kleur.dim(text),
}
