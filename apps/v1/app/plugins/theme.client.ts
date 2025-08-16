import { useTheme } from "@/composables/useTheme"

export default defineNuxtPlugin(() => {
    const { initializeTheme } = useTheme()

    // Initialize theme on app mount
    onMounted(() => {
        initializeTheme()
    })
})
