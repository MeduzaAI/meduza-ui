import { defineConfig } from "tsup"

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["src/index.ts", "src/registry/index.ts"],
    format: ["esm"],
    sourcemap: true,
    minify: false, // Keep readable for debugging during development
    target: "node18",
    outDir: "dist",
    treeshake: true,
    banner: {
        js: "#!/usr/bin/env node",
    },
})
