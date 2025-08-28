<script setup>
import { h, resolveComponent } from 'vue'
const { rows, columns, autoExpand, rowClass } = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  autoExpand: {
    type: Boolean,
    default: true
  },
  rowClass: {
    type: String,
    default: ''
  }
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const NuxtTime = resolveComponent('NuxtTime')

const normalizedColumns = computed(() => {
  const sourceColumns = Array.isArray(columns) ? columns : []
  const hasExpand = sourceColumns.some(col => col && col.id === 'expand')

  const normalized = sourceColumns.map((col, index) => {
    const baseKey = col.accessorKey ?? col.key ?? col.id ?? `col_${index}`
    const id = col.id ?? baseKey
    const accessorKey = col.accessorKey ?? baseKey
    const header =
      col.header ??
      (typeof accessorKey === 'string'
        ? accessorKey.charAt(0).toUpperCase() + accessorKey.slice(1)
        : '')
    const cell =
      col.cell ??
      (({ row }) => {
        const value = row.getValue(accessorKey)


        if (col.type === 'badge') {
          const color = col.colorResolver
            ? col.colorResolver(row.original)
            : 'neutral'
          
          return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => value)
        }

        if (col.type === 'datetime') {
          return h(NuxtTime, { datetime: value, day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'numeric', year: 'numeric', locale: "es-ES" })
        }
        
        if (col.type === 'datetimeseconds') {
          return h(NuxtTime, { datetime: value, day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'numeric', year: 'numeric', locale: "es-ES" })
        }

        if (col.formatter) {
          return col.formatter(value, row.original)
        }

        return value
      })

    return {
      ...col,
      id,
      accessorKey,
      header,
      cell
    }
  })

  if (!hasExpand && autoExpand) {
    const expandColumn = {
      id: 'expand',
      cell: ({ row }) =>
        h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-lucide-chevron-down',
          square: true,
          'aria-label': 'Expand',
          ui: {
            leadingIcon: [
              'transition-transform',
              row.getIsExpanded() ? 'duration-200 rotate-180' : ''
            ]
          },
          onClick: () => row.toggleExpanded()
        })
    }
    return [expandColumn, ...normalized]
  }

  return normalized
})

const normalizedRows = computed(() => (Array.isArray(rows) ? rows : []))

const tableOptions = {
  getRowId: (row) => {
    return row?.original?.id || row?.id || row?.original?._id || row?._id 
  }
}

const expanded = ref({})
</script>

<template>
  <UTable
    v-model:expanded="expanded"
    :data="normalizedRows"
    :columns="normalizedColumns"
    :get-row-id="tableOptions.getRowId"
    :ui="{ tr: 'data-[expanded=true]:bg-elevated/50 ' + rowClass }"
    class="flex-1"
  >
    <template #expanded="{ row }">
      <slot name="expanded" :row="row">
        <pre>{{ row.original }}</pre>
      </slot>
    </template>
  </UTable>
</template>
