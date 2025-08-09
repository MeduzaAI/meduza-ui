/**
 * @name index
 * @description Base style system with SCSS variables and CSS custom properties
 * @type registry:style
 * @dependencies []
 * @registryDependencies ["utils"]
 */

// This file serves as metadata for the build script
// The actual styles are in the SCSS files

export const metadata = {
    name: "index",
    type: "registry:style" as const,
    description: "Base style system with SCSS variables and mixins",
    dependencies: [],
    registryDependencies: ["utils"],
    files: [
        {
            path: "assets/styles/_variables.scss",
            type: "registry:style" as const,
            target: "assets/styles/_variables.scss"
        },
        {
            path: "assets/styles/_mixins.scss",
            type: "registry:style" as const,
            target: "assets/styles/_mixins.scss"
        },

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
};
