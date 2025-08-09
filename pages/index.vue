<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <NuxtLoadingIndicator />
    <div class="text-center">
      <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
      <p class="text-gray-600 dark:text-gray-400">Redirecting...</p>
    </div>
  </div>
</template>

<script setup>
// Force middleware execution
const user = useSupabaseUser();

if (!user?.data?.user) {
  await navigateTo('/login')
} else {
  await navigateTo('/dashboard')
}
</script>
