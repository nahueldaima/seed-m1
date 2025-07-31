<template>
  <div class="flex h-screen bg-background">
    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <Sidebar :user="user" @logout="handleLogout" />
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-50 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="absolute inset-0 bg-black/50" />
      <div class="absolute left-0 top-0 h-full">
        <Sidebar :user="user" @logout="handleLogout" @close="sidebarOpen = false" mobile />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Mobile Header -->
      <header class="lg:hidden flex items-center justify-between p-4 border-b bg-card">
        <UButton 
          variant="ghost" 
          size="sm"
          class="p-2"
          @click="sidebarOpen = true"
        >
          <Icon name="heroicons:bars-3" class="h-5 w-5" />
          <span class="sr-only">Open sidebar</span>
        </UButton>
        <h1 class="text-lg font-semibold">Job Manager</h1>
        <div class="w-10" /> <!-- Spacer for centering -->
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const sidebarOpen = ref(false)

const handleLogout = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

// Close sidebar when navigating
watch(() => useRoute().path, () => {
  sidebarOpen.value = false
})
</script> 