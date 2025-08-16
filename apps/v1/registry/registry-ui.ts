import { type RegistryItem } from "meduza-ui/registry"

export const ui: RegistryItem[] = [
    {
        name: "button",
        type: "registry:ui",
        description: "A flexible button component with multiple variants and sizes",
        dependencies: [],
        registryDependencies: ["utils"],
        files: [
            {
                path: "ui/button.vue",
                type: "registry:ui",
                target: "button.vue"
            },
        ],
    },
]
