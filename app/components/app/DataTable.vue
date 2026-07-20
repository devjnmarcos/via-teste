<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import type {
  DataTableAction,
  DataTableColumnDef,
  DataTableLegacyColumn
} from '../../types/data-table'
import { isTypedColumn } from '../../types/data-table'

const props = withDefaults(
  defineProps<{
    columns: DataTableColumnDef<TRow>[]
    /** Quando informado, a tabela renderiza as células tipadas. Sem `rows`, usa o slot padrão no tbody (modo legado). */
    rows?: TRow[]
    rowKey?: keyof TRow & string
    minWidth?: string
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    rows: undefined,
    rowKey: 'id' as keyof TRow & string,
    minWidth: '720px',
    emptyTitle: 'Nenhum registro',
    emptyDescription: 'Não há itens para exibir.'
  }
)

const emit = defineEmits<{
  'update:switch': [payload: { row: TRow; key: string; value: boolean }]
  'update:select': [payload: { row: TRow; key: string; value: string }]
  action: [payload: { row: TRow; action: string }]
  expand: [payload: { row: TRow; expanded: boolean }]
}>()

const expandedKeys = defineModel<string[]>('expandedKeys', { default: () => [] })

const headerColumns = computed(() =>
  props.columns.map((column) => {
    if (isTypedColumn(column)) {
      return {
        key: column.key,
        label: column.type === 'actions' || column.type === 'expand'
          ? (column.label ?? '')
          : column.label,
        align: 'align' in column ? column.align : undefined,
        width: column.width,
        srOnly: column.type === 'expand' && !column.label
      }
    }
    const legacy = column as DataTableLegacyColumn
    return {
      key: legacy.key,
      label: legacy.label,
      align: legacy.align,
      width: legacy.width,
      srOnly: false
    }
  })
)

const typedMode = computed(() => Array.isArray(props.rows))

function resolveRowKey(row: TRow, index: number): string {
  const raw = row[props.rowKey]
  if (raw === undefined || raw === null) return String(index)
  return String(raw)
}

function isExpanded(row: TRow, index: number) {
  return expandedKeys.value.includes(resolveRowKey(row, index))
}

function onToggleExpand(row: TRow, index: number) {
  const key = resolveRowKey(row, index)
  const willExpand = !expandedKeys.value.includes(key)
  expandedKeys.value = willExpand
    ? [...expandedKeys.value, key]
    : expandedKeys.value.filter((entry) => entry !== key)
  emit('expand', { row, expanded: willExpand })
}

function cellValue(row: TRow, key: string): unknown {
  return row[key]
}

function asString(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function asBoolean(value: unknown): boolean {
  return Boolean(value)
}

function resolveActions(column: Extract<DataTableColumnDef<TRow>, { type: 'actions' }>, row: TRow): DataTableAction[] {
  return typeof column.items === 'function' ? column.items(row) : column.items
}

function onSwitch(row: TRow, key: string, value: boolean) {
  emit('update:switch', { row, key, value })
}

function onSelect(row: TRow, key: string, value: string) {
  emit('update:select', { row, key, value })
}

function onAction(row: TRow, action: string, event: Event) {
  event.stopPropagation()
  emit('action', { row, action })
}

function colSpan() {
  return props.columns.length
}

const cellBase = 'border-b border-via-line px-3 py-[11px] align-middle text-xs'
</script>

<template>
  <div class="data-table-wrap min-w-0 overflow-auto">
    <EmptyState
      v-if="typedMode && !(rows?.length)"
      :title="emptyTitle"
      :description="emptyDescription"
      icon="i-lucide-inbox"
    />
    <table
      v-else
      class="data-table w-full table-fixed border-collapse [&_tbody_tr:not(.data-table__expand-row)]:transition-colors [&_tbody_tr:not(.data-table__expand-row)]:duration-160 [&_tbody_tr:hover:not(.data-table__expand-row)]:bg-[color-mix(in_oklch,var(--via-blue-soft)_45%,var(--via-surface))] [&_td]:border-b [&_td]:border-via-line [&_td]:px-3 [&_td]:py-[11px] [&_td]:align-middle [&_td]:text-xs [&_td]:text-via-ink [&_td.is-right]:text-right [&_th.is-right]:text-right [&_td_strong]:block [&_td_strong]:text-xs [&_td_small]:mt-0.5 [&_td_small]:block [&_td_small]:text-[11px] [&_td_small]:text-via-muted"
      :style="{ minWidth }"
    >
      <thead>
        <tr>
          <th
            v-for="column in headerColumns"
            :key="column.key"
            :style="column.width ? { width: column.width, minWidth: column.width } : undefined"
            :class="[
              cellBase,
              'overflow-hidden bg-via-surface-2 text-[10px] font-bold tracking-[0.04em] text-ellipsis whitespace-nowrap text-via-muted uppercase',
              column.align === 'right' ? 'text-right' : 'text-left'
            ]"
          >
            <span v-if="column.srOnly" class="sr-only">{{ column.label || 'Expandir' }}</span>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody v-if="!typedMode">
        <slot />
      </tbody>
      <tbody v-else>
        <template
          v-for="(row, index) in rows"
          :key="resolveRowKey(row, index)"
        >
          <tr>
            <template
              v-for="column in columns"
              :key="isTypedColumn(column) ? `${column.type}-${column.key}` : column.key"
            >
              <td
                v-if="isTypedColumn(column) && column.type === 'text'"
                :style="column.width ? { width: column.width, minWidth: column.width } : undefined"
                :class="[cellBase, 'min-w-0 overflow-hidden', column.align === 'right' ? 'text-right' : 'text-left']"
              >
                <strong class="block overflow-hidden text-ellipsis whitespace-nowrap">{{ asString(cellValue(row, column.key)) }}</strong>
                <small
                  v-if="column.secondaryKey"
                  class="block overflow-hidden text-ellipsis whitespace-nowrap"
                >{{ asString(cellValue(row, column.secondaryKey)) }}</small>
              </td>
              <td
                v-else-if="isTypedColumn(column) && column.type === 'switch'"
                :style="column.width ? { width: column.width, minWidth: column.width } : undefined"
                :class="[cellBase, 'overflow-hidden']"
                @click.stop
              >
                <USwitch
                  :model-value="asBoolean(cellValue(row, column.key))"
                  :disabled="column.disabled?.(row)"
                  size="sm"
                  @update:model-value="onSwitch(row, column.key, Boolean($event))"
                />
              </td>
              <td
                v-else-if="isTypedColumn(column) && column.type === 'select'"
                :style="column.width ? { width: column.width, minWidth: column.width } : undefined"
                :class="[cellBase, 'min-w-0 overflow-hidden']"
                @click.stop
              >
                <USelectMenu
                  :model-value="asString(cellValue(row, column.key))"
                  value-key="value"
                  :items="column.options"
                  :disabled="column.disabled?.(row)"
                  class="w-full min-w-0 max-w-full"
                  @update:model-value="onSelect(row, column.key, String($event ?? ''))"
                />
              </td>
              <td
                v-else-if="isTypedColumn(column) && column.type === 'actions'"
                :style="column.width ? { width: column.width, minWidth: column.width } : undefined"
                :class="[cellBase, 'w-[1%] whitespace-nowrap']"
                @click.stop
              >
                <div class="inline-flex items-center gap-0.5 [&_.app-button]:min-h-[30px] [&_.app-button]:px-2">
                  <AppButton
                    v-for="item in resolveActions(column, row)"
                    :key="item.key"
                    :variant="item.variant ?? 'ghost'"
                    :icon="item.icon"
                    :aria-label="item.ariaLabel ?? item.label"
                    :disabled="item.disabled"
                    @click="onAction(row, item.key, $event)"
                  >
                    <span v-if="!item.icon">{{ item.label }}</span>
                  </AppButton>
                </div>
              </td>
              <td
                v-else-if="isTypedColumn(column) && column.type === 'expand'"
                :class="[cellBase, 'w-12']"
                @click.stop
              >
                <AppButton
                  class="min-h-[30px] px-2"
                  variant="ghost"
                  :icon="isExpanded(row, index) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  :aria-label="isExpanded(row, index) ? 'Recolher' : 'Expandir'"
                  :aria-expanded="isExpanded(row, index)"
                  @click="onToggleExpand(row, index)"
                />
              </td>
              <td
                v-else-if="!isTypedColumn(column)"
                :class="[cellBase, column.align === 'right' ? 'text-right is-right' : 'text-left']"
              >
                {{ asString(cellValue(row, column.key)) }}
              </td>
            </template>
          </tr>
          <tr
            v-if="columns.some((column) => isTypedColumn(column) && column.type === 'expand') && isExpanded(row, index)"
            class="data-table__expand-row"
          >
            <td
              class="border-b border-via-line bg-via-surface-2 p-0"
              :colspan="colSpan()"
            >
              <div class="border-t border-via-line px-4 pt-3 pb-4">
                <slot
                  name="expand"
                  :row="row"
                  :index="index"
                />
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
