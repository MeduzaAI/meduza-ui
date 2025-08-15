export default defineNuxtConfig({
  compatibilityDate: '2025-01-08',
  devtools: { enabled: true },

  // Modules configuration
  modules: ['@nuxt/content'],

  // CSS configuration
  css: ['@/assets/styles/main.scss'],

  // Auto-import components
  components: [
    '@/components',
    {
      path: '@/components/docs',
      prefix: 'Docs'
    },
    {
      path: '@/components/content',
      prefix: ''
    }
  ],
  content: {},
  nitro: {
    prerender: {
      routes: ['/r']
    }
  }
})
