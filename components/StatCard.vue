<template>
  <UCard>
    <div class="flex p-6 flex-col md:flex-row gap-4 items-start md:items-center md:justify-between">
        <div v-if="icon" :class="[bgClass, 'p-3 rounded-full flex items-center justify-center order-none md:order-last']">
        <Icon :name="icon" :class="['w-5 h-5', iconColorClass]" />
      </div>
        <div>
        <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
        <p class="text-2xl font-bold">{{ displayValue }}</p>
        <p v-if="subtitle" class="text-xs text-muted-foreground mt-1">{{ subtitle }}</p>
      </div>
     
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'gray'].includes(value)
  },
  formatter: {
    type: Function,
    default: null
  }
})

const displayValue = computed(() => {
  if (props.formatter) {
    return props.formatter(props.value)
  }
  return props.value
})

// Determine icon and background colors based on the provided color prop
const bgClass = computed(() => {
  const map = {
    blue: 'bg-blue-500/20',
    green: 'bg-green-500/20',
    red: 'bg-red-500/20',
    yellow: 'bg-yellow-500/20',
    purple: 'bg-purple-500/20',
    gray: 'bg-gray-500/20'
  }
  return map[props.color] || 'bg-blue-500/20'
})

const iconColorClass = computed(() => {
  const map = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500'
  }
  return map[props.color] || 'text-blue-500'
})
</script> 