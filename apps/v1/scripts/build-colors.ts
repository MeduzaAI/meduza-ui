import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Build the color registry files to match shadcn's schema
export async function buildColorsRegistry() {
    const outputDir = join(process.cwd(), 'public/r/colors')
    mkdirSync(outputDir, { recursive: true })

    // Build individual base color files matching shadcn's registryBaseColorSchema
    const baseColors = ['slate', 'zinc', 'stone', 'gray', 'neutral']

    for (const baseColorName of baseColors) {
        const colorData = generateBaseColorData(baseColorName)

        writeFileSync(
            join(outputDir, `${baseColorName}.json`),
            JSON.stringify(colorData, null, 2)
        )
    }

    console.log('✅ Built colors registry')
}

function generateBaseColorData(baseColor: string) {
    // This matches exactly what shadcn serves at /r/colors/{color}.json
    return {
        inlineColors: {
            light: {
                background: "white",
                foreground: `${baseColor}-950`,
                card: "white",
                "card-foreground": `${baseColor}-950`,
                popover: "white",
                "popover-foreground": `${baseColor}-950`,
                primary: `${baseColor}-900`,
                "primary-foreground": `${baseColor}-50`,
                secondary: `${baseColor}-100`,
                "secondary-foreground": `${baseColor}-900`,
                muted: `${baseColor}-100`,
                "muted-foreground": `${baseColor}-500`,
                accent: `${baseColor}-100`,
                "accent-foreground": `${baseColor}-900`,
                destructive: "red-500",
                "destructive-foreground": `${baseColor}-50`,
                border: `${baseColor}-200`,
                input: `${baseColor}-200`,
                ring: `${baseColor}-950`
            },
            dark: {
                background: `${baseColor}-950`,
                foreground: `${baseColor}-50`,
                card: `${baseColor}-950`,
                "card-foreground": `${baseColor}-50`,
                popover: `${baseColor}-950`,
                "popover-foreground": `${baseColor}-50`,
                primary: `${baseColor}-50`,
                "primary-foreground": `${baseColor}-900`,
                secondary: `${baseColor}-800`,
                "secondary-foreground": `${baseColor}-50`,
                muted: `${baseColor}-800`,
                "muted-foreground": `${baseColor}-400`,
                accent: `${baseColor}-800`,
                "accent-foreground": `${baseColor}-50`,
                destructive: "red-900",
                "destructive-foreground": `${baseColor}-50`,
                border: `${baseColor}-800`,
                input: `${baseColor}-800`,
                ring: `${baseColor}-300`
            }
        },
        cssVars: getCssVarsForBaseColor(baseColor),
        cssVarsTemplate: generateCssTemplate(baseColor)
    }
}

function getCssVarsForBaseColor(baseColor: string) {
    // Hex color mappings for each base color - matches shadcn exactly
    const colorMappings = {
        slate: {
            light: {
                "primary-color": "#0f172a",           // slate-900
                "primary-foreground-color": "#f8fafc", // slate-50
                "secondary-color": "#f1f5f9",         // slate-100
                "secondary-foreground-color": "#0f172a", // slate-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#0f172a",        // slate-900
                "card-color": "#ffffff",              // white
                "card-foreground-color": "#0f172a",   // slate-900
                "popover-color": "#ffffff",           // white
                "popover-foreground-color": "#0f172a", // slate-900
                "muted-color": "#f1f5f9",             // slate-100
                "muted-foreground-color": "#64748b",  // slate-500
                "accent-color": "#f1f5f9",            // slate-100
                "accent-foreground-color": "#0f172a", // slate-900
                "destructive-color": "#ef4444",       // red-500
                "destructive-foreground-color": "#f8fafc", // slate-50
                "border-color": "#e2e8f0",            // slate-200
                "input-color": "#e2e8f0",             // slate-200
                "ring-color": "#0f172a"               // slate-900
            },
            dark: {
                "primary-color": "#f8fafc",           // slate-50
                "primary-foreground-color": "#0f172a", // slate-900
                "secondary-color": "#1e293b",         // slate-800
                "secondary-foreground-color": "#f8fafc", // slate-50
                "background-color": "#0f172a",        // slate-900
                "foreground-color": "#f8fafc",        // slate-50
                "card-color": "#0f172a",              // slate-900
                "card-foreground-color": "#f8fafc",   // slate-50
                "popover-color": "#0f172a",           // slate-900
                "popover-foreground-color": "#f8fafc", // slate-50
                "muted-color": "#1e293b",             // slate-800
                "muted-foreground-color": "#94a3b8",  // slate-400
                "accent-color": "#1e293b",            // slate-800
                "accent-foreground-color": "#f8fafc", // slate-50
                "destructive-color": "#dc2626",       // red-600
                "destructive-foreground-color": "#f8fafc", // slate-50
                "border-color": "#1e293b",            // slate-800
                "input-color": "#1e293b",             // slate-800
                "ring-color": "#cbd5e1"               // slate-300
            }
        },
        zinc: {
            light: {
                "primary-color": "#18181b",           // zinc-900
                "primary-foreground-color": "#fafafa", // zinc-50
                "secondary-color": "#f4f4f5",         // zinc-100
                "secondary-foreground-color": "#18181b", // zinc-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#18181b",        // zinc-900
                "card-color": "#ffffff",              // white
                "card-foreground-color": "#18181b",   // zinc-900
                "popover-color": "#ffffff",           // white
                "popover-foreground-color": "#18181b", // zinc-900
                "muted-color": "#f4f4f5",             // zinc-100
                "muted-foreground-color": "#71717a",  // zinc-500
                "accent-color": "#f4f4f5",            // zinc-100
                "accent-foreground-color": "#18181b", // zinc-900
                "destructive-color": "#ef4444",       // red-500
                "destructive-foreground-color": "#fafafa", // zinc-50
                "border-color": "#e4e4e7",            // zinc-200
                "input-color": "#e4e4e7",             // zinc-200
                "ring-color": "#18181b"               // zinc-900
            },
            dark: {
                "primary-color": "#fafafa",           // zinc-50
                "primary-foreground-color": "#18181b", // zinc-900
                "secondary-color": "#27272a",         // zinc-800
                "secondary-foreground-color": "#fafafa", // zinc-50
                "background-color": "#09090b",        // zinc-950
                "foreground-color": "#fafafa",        // zinc-50
                "card-color": "#09090b",              // zinc-950
                "card-foreground-color": "#fafafa",   // zinc-50
                "popover-color": "#09090b",           // zinc-950
                "popover-foreground-color": "#fafafa", // zinc-50
                "muted-color": "#27272a",             // zinc-800
                "muted-foreground-color": "#a1a1aa",  // zinc-400
                "accent-color": "#27272a",            // zinc-800
                "accent-foreground-color": "#fafafa", // zinc-50
                "destructive-color": "#dc2626",       // red-600
                "destructive-foreground-color": "#fafafa", // zinc-50
                "border-color": "#27272a",            // zinc-800
                "input-color": "#27272a",             // zinc-800
                "ring-color": "#d4d4d8"               // zinc-300
            }
        },
        stone: {
            light: {
                "primary-color": "#1c1917",           // stone-900
                "primary-foreground-color": "#fafaf9", // stone-50
                "secondary-color": "#f5f5f4",         // stone-100
                "secondary-foreground-color": "#1c1917", // stone-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#1c1917",        // stone-900
                "card-color": "#ffffff",              // white
                "card-foreground-color": "#1c1917",   // stone-900
                "popover-color": "#ffffff",           // white
                "popover-foreground-color": "#1c1917", // stone-900
                "muted-color": "#f5f5f4",             // stone-100
                "muted-foreground-color": "#78716c",  // stone-500
                "accent-color": "#f5f5f4",            // stone-100
                "accent-foreground-color": "#1c1917", // stone-900
                "destructive-color": "#ef4444",       // red-500
                "destructive-foreground-color": "#fafaf9", // stone-50
                "border-color": "#e7e5e4",            // stone-200
                "input-color": "#e7e5e4",             // stone-200
                "ring-color": "#1c1917"               // stone-900
            },
            dark: {
                "primary-color": "#fafaf9",           // stone-50
                "primary-foreground-color": "#1c1917", // stone-900
                "secondary-color": "#292524",         // stone-800
                "secondary-foreground-color": "#fafaf9", // stone-50
                "background-color": "#0c0a09",        // stone-950
                "foreground-color": "#fafaf9",        // stone-50
                "card-color": "#0c0a09",              // stone-950
                "card-foreground-color": "#fafaf9",   // stone-50
                "popover-color": "#0c0a09",           // stone-950
                "popover-foreground-color": "#fafaf9", // stone-50
                "muted-color": "#292524",             // stone-800
                "muted-foreground-color": "#a8a29e",  // stone-400
                "accent-color": "#292524",            // stone-800
                "accent-foreground-color": "#fafaf9", // stone-50
                "destructive-color": "#dc2626",       // red-600
                "destructive-foreground-color": "#fafaf9", // stone-50
                "border-color": "#292524",            // stone-800
                "input-color": "#292524",             // stone-800
                "ring-color": "#d6d3d1"               // stone-300
            }
        },
        gray: {
            light: {
                "primary-color": "#111827",           // gray-900
                "primary-foreground-color": "#f9fafb", // gray-50
                "secondary-color": "#f3f4f6",         // gray-100
                "secondary-foreground-color": "#111827", // gray-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#111827",        // gray-900
                "card-color": "#ffffff",              // white
                "card-foreground-color": "#111827",   // gray-900
                "popover-color": "#ffffff",           // white
                "popover-foreground-color": "#111827", // gray-900
                "muted-color": "#f3f4f6",             // gray-100
                "muted-foreground-color": "#6b7280",  // gray-500
                "accent-color": "#f3f4f6",            // gray-100
                "accent-foreground-color": "#111827", // gray-900
                "destructive-color": "#ef4444",       // red-500
                "destructive-foreground-color": "#f9fafb", // gray-50
                "border-color": "#e5e7eb",            // gray-200
                "input-color": "#e5e7eb",             // gray-200
                "ring-color": "#111827"               // gray-900
            },
            dark: {
                "primary-color": "#f9fafb",           // gray-50
                "primary-foreground-color": "#111827", // gray-900
                "secondary-color": "#1f2937",         // gray-800
                "secondary-foreground-color": "#f9fafb", // gray-50
                "background-color": "#030712",        // gray-950
                "foreground-color": "#f9fafb",        // gray-50
                "card-color": "#030712",              // gray-950
                "card-foreground-color": "#f9fafb",   // gray-50
                "popover-color": "#030712",           // gray-950
                "popover-foreground-color": "#f9fafb", // gray-50
                "muted-color": "#1f2937",             // gray-800
                "muted-foreground-color": "#9ca3af",  // gray-400
                "accent-color": "#1f2937",            // gray-800
                "accent-foreground-color": "#f9fafb", // gray-50
                "destructive-color": "#dc2626",       // red-600
                "destructive-foreground-color": "#f9fafb", // gray-50
                "border-color": "#1f2937",            // gray-800
                "input-color": "#1f2937",             // gray-800
                "ring-color": "#d1d5db"               // gray-300
            }
        },
        neutral: {
            light: {
                "primary-color": "#171717",           // neutral-900
                "primary-foreground-color": "#fafafa", // neutral-50
                "secondary-color": "#f5f5f5",         // neutral-100
                "secondary-foreground-color": "#171717", // neutral-900
                "background-color": "#ffffff",        // white
                "foreground-color": "#171717",        // neutral-900
                "card-color": "#ffffff",              // white
                "card-foreground-color": "#171717",   // neutral-900
                "popover-color": "#ffffff",           // white
                "popover-foreground-color": "#171717", // neutral-900
                "muted-color": "#f5f5f5",             // neutral-100
                "muted-foreground-color": "#737373",  // neutral-500
                "accent-color": "#f5f5f5",            // neutral-100
                "accent-foreground-color": "#171717", // neutral-900
                "destructive-color": "#ef4444",       // red-500
                "destructive-foreground-color": "#fafafa", // neutral-50
                "border-color": "#e5e5e5",            // neutral-200
                "input-color": "#e5e5e5",             // neutral-200
                "ring-color": "#171717"               // neutral-900
            },
            dark: {
                "primary-color": "#fafafa",           // neutral-50
                "primary-foreground-color": "#171717", // neutral-900
                "secondary-color": "#262626",         // neutral-800
                "secondary-foreground-color": "#fafafa", // neutral-50
                "background-color": "#0a0a0a",        // neutral-950
                "foreground-color": "#fafafa",        // neutral-50
                "card-color": "#0a0a0a",              // neutral-950
                "card-foreground-color": "#fafafa",   // neutral-50
                "popover-color": "#0a0a0a",           // neutral-950
                "popover-foreground-color": "#fafafa", // neutral-50
                "muted-color": "#262626",             // neutral-800
                "muted-foreground-color": "#a3a3a3",  // neutral-400
                "accent-color": "#262626",            // neutral-800
                "accent-foreground-color": "#fafafa", // neutral-50
                "destructive-color": "#dc2626",       // red-600
                "destructive-foreground-color": "#fafafa", // neutral-50
                "border-color": "#262626",            // neutral-800
                "input-color": "#262626",             // neutral-800
                "ring-color": "#d4d4d4"               // neutral-300
            }
        }
    }

    return colorMappings[baseColor] || colorMappings.slate
}

function generateCssTemplate(baseColor: string) {
    const cssVars = getCssVarsForBaseColor(baseColor)

    const lightVars = Object.entries(cssVars.light)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join('\n')

    const darkVars = Object.entries(cssVars.dark)
        .map(([key, value]) => `  --${key}: ${value};`)
        .join('\n')

    return `:root {
${lightVars}
}

[data-theme="dark"] {
${darkVars}
}`
}
