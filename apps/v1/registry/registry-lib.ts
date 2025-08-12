import { type RegistryItem } from "../lib/registry-schema"

export const lib: RegistryItem[] = [
    {
        name: "utils",
        type: "registry:lib",
        description: "BEM className utility for Vue components",
        dependencies: [],
        files: [
            {
                path: "/lib/utils.ts",
                content: "", // Content will be filled by build script
                type: "registry:lib",
                target: "lib/utils.ts"
            }
        ]
    },
]
