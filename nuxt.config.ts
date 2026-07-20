export default defineNuxtConfig({
  compatibilityDate: '2026-07-17',
  devtools: { enabled: true },
    modules: ['@nuxt/ui', '@nuxt/eslint'],
    components: [{ path: '~/components', pathPrefix: false }],
    css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
    fonts: false,
    theme: {
      colors: ['primary', 'neutral', 'success', 'info', 'warning', 'error'],
      defaultVariants: {
        color: 'neutral',
        size: 'md'
      }
    }
  },
  typescript: {
    strict: true,
    typeCheck: false
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Via Reversa',
      meta: [
        { name: 'description', content: 'Portal operacional de micrologística Via Reversa' }
      ]
    }
  }
})
