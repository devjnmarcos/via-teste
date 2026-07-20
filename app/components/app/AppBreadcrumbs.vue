<script setup lang="ts">
import type { BreadcrumbItem } from '../../utils/breadcrumbs'

const props = defineProps<{
  items: BreadcrumbItem[]
}>()

function isCurrent(index: number) {
  return index === props.items.length - 1
}

function isLink(item: BreadcrumbItem, index: number) {
  return Boolean(item.to) && !isCurrent(index)
}
</script>

<template>
  <nav
    class="flex items-center gap-2 text-xs text-via-muted"
    aria-label="Navegação estrutural"
  >
    <template
      v-for="(item, index) in items"
      :key="`${item.label}-${index}`"
    >
      <UIcon
        v-if="index"
        name="i-lucide-chevron-right"
        class="size-[13px] shrink-0 text-via-muted"
        aria-hidden="true"
      />
      <NuxtLink
        v-if="isLink(item, index)"
        :to="item.to"
        class="cursor-pointer text-inherit no-underline transition-[color,text-decoration-color] duration-150 ease-in-out hover:text-via-blue-strong hover:underline hover:decoration-[color-mix(in_srgb,var(--via-blue-strong)_45%,transparent)] hover:underline-offset-[3px]"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else-if="isCurrent(index)"
        class="font-bold text-via-ink"
        aria-current="page"
      >
        {{ item.label }}
      </span>
      <span
        v-else
        class="text-via-muted"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
