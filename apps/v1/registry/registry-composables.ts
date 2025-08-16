import type { Registry } from "meduza-ui/registry"

export const composables: Registry["items"] = [
    {
        name: "useTheme",
        description: "Enhanced theme management composable with support for both light/dark modes and custom themes",
        type: "registry:composable",
        dependencies: [],
        files: [
            {
                path: "composables/useTheme.ts",
                type: "file",
                content: "",
                target: "composables/useTheme.ts"
            }
        ]
    }
]
