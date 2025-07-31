<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground mt-2">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center space-x-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  }
})
</script> 