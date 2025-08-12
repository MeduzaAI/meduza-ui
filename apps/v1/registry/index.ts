import { type Registry } from "meduza-ui/registry"

import { ui } from "./registry-ui"
import { lib } from "./registry-lib"
import { themes } from "./registry-themes"

export const registry: Registry = {
    name: "meduza-ui",
    items: [
        ...ui,
        ...lib,
        ...themes,
    ],
}
