export default defineNuxtConfig({
  compatibilityDate: '2025-01-08',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['@/app/assets/styles/main.scss'],
  alias: {
    '@': '.'
  },
  content: {},
  nitro: {
    prerender: {
      routes: ['/r']
    }
  }
})
