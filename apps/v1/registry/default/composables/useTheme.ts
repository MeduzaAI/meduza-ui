/**
 * @name useTheme
 * @description Enhanced theme management composable with support for both light/dark modes and custom themes
 * @type registry:composable
 * @dependencies []
 */

export interface ThemeConfig {
    name: string           // 'default' | 'midnight-blue' | 'ocean-breeze' | etc.
    mode: 'light' | 'dark' | 'auto'
}

export const useTheme = () => {
    const mode = ref<'light' | 'dark'>('light')
    const themeName = ref<string>('default')

    const setMode = (newMode: 'light' | 'dark') => {
        mode.value = newMode

        if (process.client) {
            // Use data-mode for light/dark switching
            document.documentElement.setAttribute('data-mode', newMode)
            localStorage.setItem('theme-mode', newMode)
        }
    }

    const setThemeName = (name: string) => {
        themeName.value = name

        if (process.client) {
            if (name === 'default') {
                // Remove data-theme for default theme
                document.documentElement.removeAttribute('data-theme')
                localStorage.removeItem('theme-name')
            } else {
                // Use data-theme for custom themes only
                document.documentElement.setAttribute('data-theme', name)
                localStorage.setItem('theme-name', name)
            }
        }
    }

    const setTheme = (config: ThemeConfig) => {
        setThemeName(config.name)
        if (config.mode !== 'auto') {
            setMode(config.mode)
        }
    }

    const toggleMode = () => {
        setMode(mode.value === 'light' ? 'dark' : 'light')
    }

    const initializeTheme = () => {
        if (process.client) {
            // Initialize mode
            const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
            if (savedMode) {
                setMode(savedMode)
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                setMode(prefersDark ? 'dark' : 'light')
            }

            // Initialize theme name
            const savedThemeName = localStorage.getItem('theme-name')
            if (savedThemeName) {
                setThemeName(savedThemeName)
            } else {
                setThemeName('default')
            }

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
                if (!localStorage.getItem('theme-mode')) {
                    setMode(e.matches ? 'dark' : 'light')
                }
            }
            mediaQuery.addEventListener('change', handleChange)

            return () => mediaQuery.removeEventListener('change', handleChange)
        }
    }

    return {
        mode: readonly(mode),
        themeName: readonly(themeName),
        setMode,
        setThemeName,
        setTheme,
        toggleMode,
        initializeTheme,
        // Legacy support for existing code
        theme: readonly(mode),
        toggleTheme: toggleMode
    }
}

export const metadata = {
    name: "useTheme",
    type: "registry:composable" as const,
    description: "Enhanced theme management composable with support for both light/dark modes and custom themes",
    dependencies: [],
    files: [
        {
            path: "composables/useTheme.ts",
            type: "registry:composable" as const,
            target: "composables/useTheme.ts"
        }
    ]
};
