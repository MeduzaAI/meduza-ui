import { z } from "zod"

export const registryItemTypeSchema = z.enum([
    "registry:lib",
    "registry:ui",
    "registry:style",
    "registry:theme",
    "registry:example"
])

export const registryItemFileSchema = z.object({
    path: z.string(),
    content: z.string(),
    type: registryItemTypeSchema,
    target: z.string().optional()
})

// SCSS-specific schema
export const registryItemScssSchema = z.object({
    variables: z.record(z.string(), z.string()).optional(),
    mixins: z.array(z.string()).optional(),
    imports: z.array(z.string()).optional()
})

// CSS custom properties for Vue theming
export const registryItemCssVarsSchema = z.object({
    light: z.record(z.string(), z.string()).optional(),
    dark: z.record(z.string(), z.string()).optional()
})

export const registryItemSchema = z.object({
    $schema: z.string().optional(),
    name: z.string(),
    type: registryItemTypeSchema,
    description: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    devDependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    files: z.array(registryItemFileSchema).optional(),
    scss: registryItemScssSchema.optional(),
    cssVars: registryItemCssVarsSchema.optional(),
    meta: z.record(z.string(), z.any()).optional()
})

export const stylesSchema = z.array(
    z.object({
        name: z.string(),
        label: z.string()
    })
)

export const registryBaseColorSchema = z.object({
    cssVars: registryItemCssVarsSchema,
    scssVars: z.record(z.string(), z.string())
})

export type RegistryItem = z.infer<typeof registryItemSchema>
export type RegistryItemFile = z.infer<typeof registryItemFileSchema>
export type RegistryItemType = z.infer<typeof registryItemTypeSchema>
export type RegistryItemScss = z.infer<typeof registryItemScssSchema>
export type RegistryItemCssVars = z.infer<typeof registryItemCssVarsSchema>
export type Styles = z.infer<typeof stylesSchema>
export type RegistryBaseColor = z.infer<typeof registryBaseColorSchema>
