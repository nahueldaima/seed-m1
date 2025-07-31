<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Processes</h1>
      <p class="text-muted-foreground mt-2">
        Manage and monitor your background processes
      </p>
    </div>

    <UCard>
      <div class="p-8 text-center">
        <Icon name="heroicons:cog-6-tooth" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Processes Page</h3>
        <p class="text-muted-foreground">This page will be implemented next in our migration plan.</p>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script> 