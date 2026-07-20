export default defineAppConfig({
  ui: {
    colors: {
      primary: 'via-blue',
      neutral: 'via-neutral',
      success: 'via-green',
      info: 'via-cyan',
      warning: 'via-amber',
      error: 'via-red'
    },
    icons: {
      search: 'i-lucide-search',
      filter: 'i-lucide-filter',
      loading: 'i-lucide-loader-circle',
      success: 'i-lucide-circle-check',
      warning: 'i-lucide-triangle-alert',
      error: 'i-lucide-circle-x',
      info: 'i-lucide-info',
      close: 'i-lucide-x',
      chevronRight: 'i-lucide-chevron-right',
      chevronLeft: 'i-lucide-chevron-left'
    },
    button: {
      slots: {
        base: 'font-semibold rounded-[var(--radius-control)]'
      },
      defaultVariants: {
        size: 'md'
      }
    },
    input: {
      slots: {
        base: 'rounded-[var(--radius-control)]'
      }
    }
  }
})
