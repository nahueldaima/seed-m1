<template>
  <UCard>
    <template #header>
      <div class="flex items-center">
        <Icon name="heroicons-funnel" class="w-4 h-4 mr-2" />
        <h3 class="text-lg font-semibold">{{ title }}</h3>
      </div>
    </template>
    
    <div class="p-6 space-y-4">
      <div :class="`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`">
        <template v-for="filter in filters" :key="filter.key">
          <template v-if="!filter.show || filter.show(filterValues)">
            <!-- Search Input -->
            <UInput
              v-if="filter.type === 'search'"
              :model-value="filterValues[filter.key]"
              @update:model-value="updateFilter(filter.key, $event)"
              :icon="filter.icon || 'heroicons-magnifying-glass'"
              :placeholder="filter.placeholder"
              :size="filter.size || 'md'"
            />

            <!-- Select Dropdown -->
            <USelect
              v-else-if="filter.type === 'select'"
              :model-value="filterValues[filter.key]"
              @update:model-value="updateFilter(filter.key, $event)"
              :options="filter.options"
              :placeholder="filter.placeholder"
              :size="filter.size || 'md'"
            />

            <!-- Date Range -->
            <div v-else-if="filter.type === 'daterange'" class="flex space-x-2">
              <UInput
                :model-value="filterValues[filter.key]?.start"
                @update:model-value="updateDateRange(filter.key, 'start', $event)"
                type="datetime-local"
                :placeholder="filter.startPlaceholder || 'Start date'"
                :size="filter.size || 'md'"
              />
              <UInput
                :model-value="filterValues[filter.key]?.end"
                @update:model-value="updateDateRange(filter.key, 'end', $event)"
                type="datetime-local"
                :placeholder="filter.endPlaceholder || 'End date'"
                :size="filter.size || 'md'"
              />
            </div>
          </template>
        </template>
      </div>
      
      <!-- Clear Filters Button -->
      <div v-if="showClearButton && hasActiveFilters" class="pt-2">
        <UButton
          variant="ghost"
          size="sm"
          icon="heroicons-x-mark"
          @click="clearAllFilters"
        >
          Clear Filters
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Filters'
  },
  filters: {
    type: Array,
    required: true
  },
  gridCols: {
    type: Number,
    default: 3
  },
  showClearButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:filters'])

// Initialize filter values
const filterValues = ref({})

// Initialize default values and keep in sync when filters change
watchEffect(() => {
  props.filters.forEach(filter => {
    if (!(filter.key in filterValues.value)) {
      if (filter.type === 'daterange') {
        filterValues.value[filter.key] = { start: '', end: '' }
      } else {
        filterValues.value[filter.key] = filter.defaultValue ?? (filter.type === 'select' ? 'all' : '')
      }
    }
  })
})

const updateFilter = (key, value) => {
  filterValues.value[key] = value
  emit('update:filters', { ...filterValues.value })
}

const updateDateRange = (key, type, value) => {
  if (!filterValues.value[key]) {
    filterValues.value[key] = { start: '', end: '' }
  }
  filterValues.value[key][type] = value
  emit('update:filters', { ...filterValues.value })
}

const clearAllFilters = () => {
  const clearedValues = {}
  props.filters.forEach(filter => {
    if (filter.type === 'daterange') {
      clearedValues[filter.key] = { start: '', end: '' }
    } else {
      clearedValues[filter.key] = filter.defaultValue ?? (filter.type === 'select' ? 'all' : '')
    }
  })
  filterValues.value = clearedValues
  emit('update:filters', { ...filterValues.value })
}

const hasActiveFilters = computed(() => {
  return props.filters.some(filter => {
    if (filter.isFilter === false) return false
    const value = filterValues.value[filter.key]
    if (filter.type === 'daterange') {
      return value?.start || value?.end
    }
    return value && value !== 'all' && value !== ''
  })
})
</script> 