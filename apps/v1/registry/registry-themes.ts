import { type RegistryItem } from "meduza-ui/registry"

export const themes: RegistryItem[] = [
  {
    name: "index",
    type: "registry:style",
    description: "Base style system with SCSS variables and mixins",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [
      {
        path: "assets/styles/_variables.scss",
        type: "file",
        target: "assets/styles/_variables.scss"
      },
      {
        path: "assets/styles/_mixins.scss",
        type: "file",
        target: "assets/styles/_mixins.scss"
      },
      {
        path: "assets/styles/_main.scss",
        type: "file",
        target: "assets/styles/main.scss"
      }
    ],
    cssVars: {
      light: {
        "primary-color": "#334155",
        "primary-foreground-color": "#f8fafc",
        "secondary-color": "#f1f5f9",
        "secondary-foreground-color": "#0f172a",
        "background-color": "#ffffff",
        "foreground-color": "#0f172a",
        "border-color": "#e2e8f0"
      },
      dark: {
        "primary-color": "#e2e8f0",
        "primary-foreground-color": "#0f172a",
        "secondary-color": "#1e293b",
        "secondary-foreground-color": "#f8fafc",
        "background-color": "#0f172a",
        "foreground-color": "#f8fafc",
        "border-color": "#334155"
      }
    }
  }
]
