<script setup lang="ts">
import {
  clampPage,
  DEFAULT_PAGE_SIZE_OPTIONS,
  paginationSummary,
  totalPages,
  visiblePageItems
} from '../../utils/pagination'

const props = withDefaults(
  defineProps<{
    total: number
    pageSizeOptions?: number[]
    showPageSize?: boolean
    showSummary?: boolean
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    pageSizeOptions: () => [...DEFAULT_PAGE_SIZE_OPTIONS],
    showPageSize: true,
    showSummary: true,
    disabled: false,
    ariaLabel: 'Paginação'
  }
)

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const pagesCount = computed(() => totalPages(props.total, pageSize.value))
const summary = computed(() => paginationSummary(page.value, pageSize.value, props.total))
const pageItems = computed(() => visiblePageItems(page.value, props.total, pageSize.value))

const pageSizeSelectItems = computed(() =>
  props.pageSizeOptions.map((value) => ({
    label: String(value),
    value
  }))
)

watch(
  [() => props.total, pageSize],
  () => {
    const next = clampPage(page.value, props.total, pageSize.value)
    if (next !== page.value) page.value = next
  },
  { immediate: true }
)

function goTo(target: number) {
  if (props.disabled) return
  page.value = clampPage(target, props.total, pageSize.value)
}

function onPageSizeChange(value: number | undefined) {
  if (props.disabled || value === undefined) return
  pageSize.value = value
  page.value = clampPage(1, props.total, value)
}
</script>

<template>
  <div
    class="pagination flex min-h-[52px] items-center justify-between gap-3 border-t border-via-line bg-via-surface px-[18px] py-2 max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:py-2.5"
    :class="{ 'opacity-70': disabled }"
  >
    <p
      v-if="showSummary"
      class="m-0 text-[11px] leading-[1.35] text-via-muted"
      aria-live="polite"
    >
      {{ summary }}
    </p>

    <div class="ml-auto flex items-center gap-3.5 max-[900px]:ml-0 max-[900px]:flex-wrap max-[900px]:justify-between">
      <label
        v-if="showPageSize"
        class="inline-flex items-center gap-2"
      >
        <span class="whitespace-nowrap text-[11px] font-[650] text-via-muted">Itens por página</span>
        <USelectMenu
          :model-value="pageSize"
          value-key="value"
          :items="pageSizeSelectItems"
          :disabled="disabled"
          class="w-[88px]"
          aria-label="Itens por página"
          @update:model-value="onPageSizeChange"
        />
      </label>

      <nav
        class="inline-flex items-center gap-0.5 [&_.app-button]:min-h-[30px] [&_.app-button]:min-w-[30px] [&_.app-button]:px-1.5"
        :aria-label="ariaLabel"
      >
        <AppButton
          variant="ghost"
          icon="i-lucide-chevron-left"
          aria-label="Página anterior"
          :disabled="disabled || page <= 1 || total === 0"
          @click="goTo(page - 1)"
        />

        <template
          v-for="(item, index) in pageItems"
          :key="`${item}-${index}`"
        >
          <span
            v-if="item === 'ellipsis'"
            class="inline-flex min-w-6 items-center justify-center text-xs text-via-muted"
            aria-hidden="true"
          >…</span>
          <button
            v-else
            type="button"
            class="inline-flex min-h-[30px] min-w-[30px] cursor-pointer items-center justify-center rounded-via-control border-0 bg-transparent px-1.5 text-xs font-[650] text-via-ink transition-[background-color,color] duration-150 hover:enabled:not-aria-[current=page]:bg-via-surface-2 disabled:cursor-not-allowed disabled:opacity-55"
            :class="item === page
              ? 'cursor-default bg-[color-mix(in_srgb,var(--via-blue-soft)_35%,transparent)] text-via-blue-strong'
              : undefined"
            :aria-current="item === page ? 'page' : undefined"
            :aria-label="`Página ${item}`"
            :disabled="disabled || total === 0"
            @click="goTo(item)"
          >
            {{ item }}
          </button>
        </template>

        <AppButton
          variant="ghost"
          icon="i-lucide-chevron-right"
          aria-label="Próxima página"
          :disabled="disabled || page >= pagesCount || total === 0"
          @click="goTo(page + 1)"
        />
      </nav>
    </div>
  </div>
</template>
