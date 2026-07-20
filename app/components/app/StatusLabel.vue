<script setup lang="ts">
import type { StatusKey } from '../../types/domain'
import { statusMeta } from '../../types/domain'

const props = defineProps<{
  status: StatusKey
  label?: string
}>()

const meta = computed(() => statusMeta[props.status])
</script>

<template>
  <span
    class="inline-flex min-w-0 items-center gap-[7px] text-[11px] leading-[1.3] whitespace-normal text-via-ink"
    :class="meta.tone === 'danger' ? 'text-via-red' : undefined"
  >
    <i
      data-status-dot
      class="size-[7px] shrink-0 rounded-full"
      :style="{ backgroundColor: meta.color }"
      aria-hidden="true"
    />
    <span>{{ label ?? meta.label }}</span>
  </span>
</template>
