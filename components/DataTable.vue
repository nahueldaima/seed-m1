<template>
  <UCard>
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-else-if="title" #header>
      <div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p v-if="description" class="text-sm text-muted-foreground mt-1">{{ description }}</p>
      </div>
    </template>
    
    <UTable 
      :rows="rows" 
      :columns="columns"
      :loading="loading"
      :class="tableClass"
    >
      <!-- Dynamic slot forwarding for each column -->
      <template v-for="column in columns" :key="column.key" #[`${column.key}-data`]="slotProps">
        <slot :name="`${column.key}-data`" v-bind="slotProps">
          <!-- Default rendering based on column type -->
          <component 
            :is="getColumnComponent(column)" 
            v-bind="getColumnProps(column, slotProps)" 
          >
            {{ getColumnValue(column, slotProps.row) }}
          </component>
        </slot>
      </template>
      
      <!-- Forward other table slots -->
      <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
        <slot v-if="!slotName.endsWith('-data') && slotName !== 'header'" :name="slotName" v-bind="slotProps" />
      </template>
    </UTable>
  </UCard>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  rows: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  tableClass: {
    type: String,
    default: 'w-full'
  }
})

// Helper functions for column rendering
const getColumnComponent = (column) => {
  switch (column.type) {
    case 'badge':
      return 'UBadge'
    case 'button':
      return 'UButton'
    case 'progress':
      return 'UProgress'
    default:
      return 'span'
  }
}

const getColumnProps = (column, slotProps) => {
  const baseProps = column.props || {}
  
  switch (column.type) {
    case 'badge':
      return {
        ...baseProps,
        color: column.colorResolver ? column.colorResolver(slotProps.row) : baseProps.color,
        variant: baseProps.variant || 'solid',
        size: baseProps.size || 'sm'
      }
    case 'button':
      return {
        ...baseProps,
        onClick: () => column.onClick?.(slotProps.row)
      }
    case 'progress':
      return {
        ...baseProps,
        value: getColumnValue(column, slotProps.row),
        color: column.colorResolver ? column.colorResolver(slotProps.row) : baseProps.color
      }
    default:
      return baseProps
  }
}

const getColumnValue = (column, row) => {
  if (column.formatter) {
    return column.formatter(row[column.key], row)
  }
  return row[column.key]
}
</script> 