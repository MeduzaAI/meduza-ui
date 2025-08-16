import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { COLORS } from './colors'

// Build the color registry files
export async function buildColorsRegistry() {
    const outputDir = join(process.cwd(), 'public/r/colors')
    mkdirSync(outputDir, { recursive: true })

    // Get all available colors from the COLORS dictionary
    const allColors = Object.keys(COLORS)

    // Build individual color files
    for (const colorName of allColors) {
        const colorData = generateColorData(colorName)
        writeFileSync(
            join(outputDir, `${colorName}.json`),
            JSON.stringify(colorData, null, 2)
        )
    }

    // Build colors index
    const colorsIndex = allColors.map(name => ({
        name,
        label: name.split('-').map(capitalize).join(' ')
    }))

    writeFileSync(
        join(outputDir, 'index.json'),
        JSON.stringify(colorsIndex, null, 2)
    )

    console.log('✅ Built colors registry')
}

function generateColorData(colorName: string) {
    return {
        cssVars: COLORS[colorName],
        cssVarsTemplate: generateCssTemplate(colorName)
    }
}

function generateCssTemplate(colorName: string) {
    const cssVars = COLORS[colorName]

    const lightVars = Object.entries(cssVars.light)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join('\n')

    const darkVars = Object.entries(cssVars.dark)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join('\n')

    return `:root {
${lightVars}
}

[data-mode="dark"] {
${darkVars}
}`
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}