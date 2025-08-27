<template>
  <UCard>
    <template #header>
      <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div class="flex items-center">
          <Icon name="heroicons-funnel" class="w-4 h-4 mr-2" />
          <h3 class="text-lg font-semibold">{{ title }}</h3>
          <UButton
            variant="ghost"
            size="sm"
            class="ml-2"
            icon="heroicons-arrow-path"
            @click="refreshFilters"
          />
        </div>
        <div class="flex justify-end"> 
          <slot name="subheader" />
        </div>
      </div>
    </template>

    
    <div class="space-y-4">
      <div :class="`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`">
        <template v-for="filter in filters" :key="filter.key">
          <template v-if="!filter.show || filter.show(filterValues)">
            <!-- Search Input -->
            <UInput
              v-if="filter.type === 'search'"
              :icon="filter.icon || 'heroicons-magnifying-glass'"
              :placeholder="filter.placeholder"
              :size="filter.size || 'md'"
              :model-value="filterValues[filter.key]"
              @update:model-value="updateFilter(filter.key, $event)"
            />

            <!-- Select Dropdown -->
            <USelect
              v-else-if="filter.type === 'select'"
              :items="filter.options"
              :placeholder="filter.placeholder"
              :size="filter.size || 'md'"
              :searchable="filter.searchable"
              :model-value="filterValues[filter.key]"
              @update:model-value="updateFilter(filter.key, $event)"
            />

            <!-- Select Menu -->
            <USelectMenu
              v-else-if="filter.type === 'select-menu'"
              :id="filter.key"
              :items="filter.options"
              :placeholder="filter.placeholder"
              :size="filter.size || 'md'"
              :class="filter.class || 'w-full'"
              :model-value="filterValues[filter.key]"
              @update:model-value="updateFilter(filter.key, $event.value)"
            />

            <!-- Date Range -->
            <div v-else-if="filter.type === 'daterange'" class="flex space-x-2">
              <UInput
                type="datetime-local"
                :placeholder="filter.startPlaceholder || 'Start date'"
                :size="filter.size || 'md'"
                :model-value="filterValues[filter.key]?.start"
                @update:model-value="updateDateRange(filter.key, 'start', $event)"
              />
              <UInput
                type="datetime-local"
                :placeholder="filter.endPlaceholder || 'End date'"
                :size="filter.size || 'md'"
                :model-value="filterValues[filter.key]?.end"
                @update:model-value="updateDateRange(filter.key, 'end', $event)"
              />
            </div>
          </template>
        </template>
      </div>
      <div v-if="showClearButton && hasActiveFilters" class="pt-2 flex justify-end">
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

const emit = defineEmits(['update:filters', 'refreshFilters'])

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

const refreshFilters = () => {
  emit('refreshFilters')
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