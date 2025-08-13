export default defineNuxtConfig({
  compatibilityDate: '2025-01-08',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['assets/styles/main.scss'],
  content: {},
  nitro: {
    prerender: {
      routes: ['/r']
    }
  }
})
