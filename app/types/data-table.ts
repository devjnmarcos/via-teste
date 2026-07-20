/** Contrato tipado da DataTable do design system (onda Cadastros). */

export type DataTableAlign = 'left' | 'right'

export interface DataTableSelectOption {
  label: string
  value: string
}

export interface DataTableAction {
  key: string
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  ariaLabel?: string
  disabled?: boolean
}

/** Coluna legada (shell + slot de linhas) — mantida para consumidores existentes. */
export interface DataTableLegacyColumn {
  key: string
  label: string
  align?: DataTableAlign
  width?: string
}

export type DataTableColumn<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | {
      type: 'text'
      key: keyof TRow & string
      label: string
      align?: DataTableAlign
      width?: string
      /** Segunda linha (small) lida de outra chave da row. */
      secondaryKey?: keyof TRow & string
    }
  | {
      type: 'switch'
      key: keyof TRow & string
      label: string
      width?: string
      disabled?: (row: TRow) => boolean
    }
  | {
      type: 'select'
      key: keyof TRow & string
      label: string
      options: DataTableSelectOption[]
      width?: string
      disabled?: (row: TRow) => boolean
    }
  | {
      type: 'actions'
      key: string
      label?: string
      width?: string
      items: DataTableAction[] | ((row: TRow) => DataTableAction[])
    }
  | {
      type: 'expand'
      key: string
      label?: string
      width?: string
    }

export type DataTableColumnDef<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | DataTableColumn<TRow>
  | DataTableLegacyColumn

export function isTypedColumn<TRow extends Record<string, unknown>>(
  column: DataTableColumnDef<TRow>
): column is DataTableColumn<TRow> {
  return 'type' in column && typeof column.type === 'string'
}

export interface DataTableSwitchPayload<TRow> {
  row: TRow
  key: string
  value: boolean
}

export interface DataTableSelectPayload<TRow> {
  row: TRow
  key: string
  value: string
}

export interface DataTableActionPayload<TRow> {
  row: TRow
  action: string
}

export interface DataTableExpandPayload<TRow> {
  row: TRow
  expanded: boolean
}
