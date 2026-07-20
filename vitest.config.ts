import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: [],
    hookTimeout: 120000,
    testTimeout: 60000
  }
})
