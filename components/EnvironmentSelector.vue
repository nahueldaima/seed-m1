<template>
    <USelect
      v-model="selectedEnv"
      :items="environments"
      size="sm"
      class="w-40"
      icon="i-heroicons-globe-asia-australia"
    />
  </template>
  
  <script setup>
  import { useMainEnvironment } from '@/composables/useMainEnvironment'
  
  const { env, switchEnv, environments } = useMainEnvironment()
  
  // Computed binding for v-model
  const selectedEnv = computed({
    get: () => env.value,
    set: (val) => switchEnv(val)
  })
  </script>