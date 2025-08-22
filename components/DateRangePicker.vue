<template>
  <UPopover v-model="isOpen" :popper="{ placement: 'bottom-start' }">
    <UButton variant="outline" color="neutral" icon="heroicons-calendar" class="whitespace-nowrap">
      {{ rangeLabel }}
    </UButton>

    <template #content>
      <div class="p-4 w-80 space-y-4">
        <!-- Quick presets -->
        <div class="flex items-center gap-2">
          <UButton
            v-for="preset in presets"
            :key="preset.label"
            :icon="preset.icon"
            size="xs"
            color="neutral"
            variant="ghost"
            class="flex-1"
            @click="selectPreset(preset)"
          >
            {{ preset.label }}
          </UButton>
        </div>

        <!-- Custom picker -->
        <div v-if="showCustom" class="space-y-4">
          <UTabs v-model="tab" :items="tabs" />

          <div v-if="tab === 'absolute'" class="space-y-4">
            <UCalendar v-model="tempRange" :range="true" />
            <div class="grid grid-cols-2 gap-2">
              <UInput v-model="startTime" type="time" placeholder="Start" />
              <UInput v-model="endTime" type="time" placeholder="End" />
            </div>
          </div>

          <div v-else class="space-y-4">
            <div v-for="group in relativeGroups" :key="group.title">
              <p class="text-sm font-medium mb-2">{{ group.title }}</p>
              <div class="grid grid-cols-5 gap-2 mb-4">
                <UButton
                  v-for="n in group.options"
                  :key="n"
                  size="xs"
                  variant="outline"
                  :color="relative.amount === n && relative.unit === group.unit ? 'primary' : 'neutral'"
                  @click="relative = { amount: n, unit: group.unit }"
                >
                  {{ n }}
                </UButton>
              </div>
            </div>
            <div class="flex gap-2">
              <UInput v-model.number="relative.amount" type="number" placeholder="Duration" class="w-24" />
              <USelect v-model="relative.unit" :items="unitItems" class="flex-1" />
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <UButton variant="ghost" color="neutral" @click="clear">Clear</UButton>
            <div class="space-x-2">
              <UButton variant="ghost" color="neutral" @click="cancel">Cancel</UButton>
              <UButton color="primary" @click="apply">Apply</UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
import { fromDate, toCalendarDate, getLocalTimeZone } from '@internationalized/date'
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ start: null, end: null })
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const showCustom = ref(false)
const tab = ref('absolute')
const tabs = [
  { label: 'Absolute', slot: 'absolute', value: 'absolute' },
  { label: 'Relative', slot: 'relative', value: 'relative' }
]

const presets = [
  { label: 'Clear', action: 'clear' },
  { label: '1m', action: '1m' },
  { label: '30m', action: '30m' },
  { label: '1h', action: '1h' },
  { label: '12h', action: '12h' },
  { label: 'Custom', action: 'custom', icon: 'heroicons-calendar' }
]

const tz = getLocalTimeZone()

const tempRange = ref(null)
const startTime = ref('00:00')
const endTime = ref('00:00')
const customLabel = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (val.start && val.end) {
      tempRange.value = {
        start: toCalendarDate(fromDate(new Date(val.start), tz)),
        end: toCalendarDate(fromDate(new Date(val.end), tz))
      }
      startTime.value = formatTime(val.start)
      endTime.value = formatTime(val.end)
    } else {
      tempRange.value = null
    }
  },
  { immediate: true }
)

const relativeGroups = [
  { title: 'Minutes', unit: 'm', options: [5, 10, 15, 30, 45] },
  { title: 'Hours', unit: 'h', options: [1, 2, 4, 6, 8, 12] },
  { title: 'Days', unit: 'd', options: [1, 2, 3, 4, 5, 6] },
  { title: 'Weeks', unit: 'w', options: [1, 2, 3, 4] }
]

const unitItems = [
  { label: 'Minutes', value: 'm' },
  { label: 'Hours', value: 'h' },
  { label: 'Days', value: 'd' },
  { label: 'Weeks', value: 'w' }
]

const relative = ref({ amount: 1, unit: 'm' })

function selectPreset(preset) {
  if (preset.action === 'clear') {
    clear()
    isOpen.value = false
    return
  }
  if (preset.action === 'custom') {
    showCustom.value = true
    return
  }
  const end = new Date()
  const start = new Date(end)
  switch (preset.action) {
    case '1m':
      start.setMinutes(start.getMinutes() - 1)
      break
    case '30m':
      start.setMinutes(start.getMinutes() - 30)
      break
    case '1h':
      start.setHours(start.getHours() - 1)
      break
    case '12h':
      start.setHours(start.getHours() - 12)
      break
  }
  emit('update:modelValue', { start, end })
  customLabel.value = preset.label
  isOpen.value = false
}

function apply() {
  if (tab.value === 'absolute' && tempRange.value?.start && tempRange.value?.end) {
    const { start: startDate, end: endDate } = tempRange.value
    const [sh, sm] = startTime.value.split(':').map(Number)
    const [eh, em] = endTime.value.split(':').map(Number)
    const start = startDate.toDate(tz)
    start.setHours(sh, sm, 0, 0)
    const end = endDate.toDate(tz)
    end.setHours(eh, em, 0, 0)
    emit('update:modelValue', { start, end })
    customLabel.value = ''
  } else if (tab.value === 'relative') {
    const end = new Date()
    const start = new Date(end)
    const amount = relative.value.amount
    switch (relative.value.unit) {
      case 'm':
        start.setMinutes(start.getMinutes() - amount)
        break
      case 'h':
        start.setHours(start.getHours() - amount)
        break
      case 'd':
        start.setDate(start.getDate() - amount)
        break
      case 'w':
        start.setDate(start.getDate() - amount * 7)
        break
    }
    emit('update:modelValue', { start, end })
    customLabel.value = formatRelative(relative.value)
  }
  showCustom.value = false
  isOpen.value = false
}

function cancel() {
  showCustom.value = false
}

function clear() {
  emit('update:modelValue', { start: null, end: null })
  tempRange.value = null
  relative.value = { amount: 1, unit: 'm' }
  customLabel.value = ''
}

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const rangeLabel = computed(() => {
  if (customLabel.value) {
    return customLabel.value
  }
  if (props.modelValue.start && props.modelValue.end) {
    return `${formatDate(props.modelValue.start)} - ${formatDate(props.modelValue.end)}`
  }
  return 'Select range'
})

function formatRelative({ amount, unit }) {
  return `${amount}${unit}`
}
</script>
