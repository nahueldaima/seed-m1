<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex-1">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground mt-1 text-sm sm:mt-2 sm:text-base">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:space-x-2">
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