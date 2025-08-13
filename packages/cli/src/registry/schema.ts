import { z } from "zod";

// Registry configuration item schema
export const registryConfigItemSchema = z.union([
  // Simple string format: base URL without placeholder
  z.string().url(),
  // Object format with name and url
  z.object({
    name: z.string(),
    url: z.string().url(),
  }),
]);

// Registry configuration schema
export const registryConfigSchema = z.record(
  z.string().refine(
    (key) => {
      // Allow both @ prefixed (external) and simple names (official)
      return key.startsWith("@") || /^[a-z][a-z0-9-]*$/.test(key);
    },
    {
      message:
        "Registry names must start with @ (external) or be kebab-case (official)",
    },
  ),
  registryConfigItemSchema,
);

export const rawConfigSchema = z.object({
  $schema: z.string().optional(),
  style: z.string().default("default"),
  baseColor: z.string().optional(),

  // SCSS configuration (Vue-specific)
  scss: z
    .object({
      variables: z.string(),
      mixins: z.string(),
      main: z.string(),
      // Optional global imports
      imports: z.array(z.string()).optional(),
    })
    .default({
      variables: "@/assets/styles/_variables.scss",
      mixins: "@/assets/styles/_mixins.scss",
      main: "@/assets/styles/main.scss",
    }),

  // Path aliases
  aliases: z
    .object({
      components: z.string(),
      ui: z.string(),
      lib: z.string(),
      utils: z.string(),
      // Vue-specific additions
      composables: z.string().optional(),
      assets: z.string().optional(),
      styles: z.string().optional(),
    })
    .default({
      components: "@/components",
      ui: "@/components/ui",
      lib: "@/lib",
      utils: "@/lib/utils",
      composables: "@/composables",
      assets: "@/assets",
      styles: "@/assets/styles",
    }),

  framework: z
    .object({
      type: z.enum(["vue", "nuxt", "vite", "manual"]).default("vue"),
      version: z.string().optional(),
    })
    .optional(),

  registries: registryConfigSchema.optional(),
});

// Config schema with resolved paths (internal use)
export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    scssVariables: z.string(),
    scssMixins: z.string(),
    scssMain: z.string(),
    components: z.string(),
    ui: z.string(),
    lib: z.string(),
    utils: z.string(),
    composables: z.string(),
    assets: z.string(),
    styles: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;
export type RawConfig = z.infer<typeof rawConfigSchema>;

// Default configuration for Vue projects
export const DEFAULT_REGISTRIES = {
  "meduza-ui": "http://localhost:3000/r",
};

export const DEFAULT_CONFIG: RawConfig = {
  style: "default",
  baseColor: "slate",
  scss: {
    variables: "@/assets/styles/_variables.scss",
    mixins: "@/assets/styles/_mixins.scss",
    main: "@/assets/styles/main.scss",
  },
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    lib: "@/lib",
    utils: "@/lib/utils",
    composables: "@/composables",
    assets: "@/assets",
    styles: "@/assets/styles",
  },
  registries: DEFAULT_REGISTRIES,
};

// Registry file schema
export const registryFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: z
    .enum(["file", "registry:ui", "registry:lib", "registry:style"])
    .default("file"),
  target: z.string().optional(),
});

export const registryItemCssVarsSchema = z.object({
  theme: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
});

// Base color schema for the colors registry (matching shadcn)
export const registryBaseColorSchema = z.object({
  inlineColors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVars: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVarsTemplate: z.string(),
});

export const registryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  type: z.enum([
    "registry:component",
    "registry:ui",
    "registry:composable",
    "registry:lib",
    "registry:theme",
    "registry:style",
  ]),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryFileSchema).optional(),
  category: z.string().optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  docs: z.string().optional(),
});

export const registrySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  homepage: z.string().optional(),
  items: z.array(registryItemSchema),
});

// Registry index schema (simplified registry item for listing)
export const registryIndexItemSchema = z.object({
  name: z.string(),
  type: z.enum([
    "registry:component",
    "registry:ui",
    "registry:composable",
    "registry:lib",
    "registry:theme",
    "registry:style",
  ]),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const registryIndexSchema = z.array(registryIndexItemSchema);

export type RegistryFile = z.infer<typeof registryFileSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type Registry = z.infer<typeof registrySchema>;
export type RegistryBaseColor = z.infer<typeof registryBaseColorSchema>;
export type RegistryIndexItem = z.infer<typeof registryIndexItemSchema>;
export type RegistryIndex = z.infer<typeof registryIndexSchema>;
