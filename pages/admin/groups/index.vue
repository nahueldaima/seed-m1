<template>
  <div class="space-y-6">
    <LibTitleBar title="Grupos" subtitle="Gestiona los grupos de usuarios" />

    <div class="flex items-center justify-between">
      <UInput v-model="search" placeholder="Search groups" class="w-64" @keyup.enter="fetchGroups" />
      <UButton v-if="canWrite" icon="i-lucide-plus" @click="navigateTo('/admin/groups/new')">New Group</UButton>
    </div>

    <UCard>
      <ul>
        <li v-for="g in groups" :key="g.id" class="flex justify-between items-center py-2 border-b last:border-b-0">
          <NuxtLink :to="`/admin/groups/${g.id}`" class="flex-1">{{ g.name }}</NuxtLink>
          <UBadge v-if="g.description" variant="subtle" class="ml-2">{{ g.description }}</UBadge>
        </li>
        <li v-if="!groups.length" class="py-4 text-center text-muted-foreground">No groups found</li>
      </ul>
    </UCard>
  </div>
</template>

<script setup>
const { apiRequest } = useApi()
const mainStore = useMainStore()

const groups = ref([])
const search = ref('')
const showCreate = ref(false)
const groupFormRef = ref(null)

const canWrite = computed(() =>
  true
  // mainStore.permissions.some(p => p.code === 'GROUPS_WRITE')
)

async function fetchGroups() {
  const query = search.value ? `?search=${encodeURIComponent(search.value)}` : ''
  const { data } = await apiRequest(`/api/internal/groups${query}`)
  groups.value = data || []
}

onMounted(async () => {
  if (!mainStore.permissions.length) await mainStore.fetchPermissions()
  await fetchGroups()
})
</script>
