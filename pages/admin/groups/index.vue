<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Groups</h1>
      <p class="text-muted-foreground mt-2">Manage user groups</p>
    </div>

    <div class="flex items-center justify-between">
      <UInput
        v-model="search"
        placeholder="Search groups"
        class="w-64"
        @keyup.enter="fetchGroups"
      />
      <UButton v-if="canWrite" icon="i-lucide-plus" @click="showCreate = true">New Group</UButton>
    </div>

    <UCard>
      <ul>
        <li
          v-for="g in groups"
          :key="g.id"
          class="flex justify-between items-center py-2 border-b last:border-b-0"
        >
          <NuxtLink :to="`/admin/groups/${g.id}`" class="flex-1">{{ g.name }}</NuxtLink>
          <UBadge v-if="g.description" variant="subtle" class="ml-2">{{ g.description }}</UBadge>
        </li>
        <li v-if="!groups.length" class="py-4 text-center text-muted-foreground">No groups found</li>
      </ul>
    </UCard>

    <UModal v-model="showCreate">
      <UCard>
        <UForm :state="form" @submit="createGroup" class="space-y-4">
          <UFormField label="Name">
            <UInput v-model="form.name" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="form.description" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showCreate = false">Cancel</UButton>
            <UButton type="submit" color="primary">Create</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const { apiRequest } = useApi()
const mainStore = useMainStore()

const groups = ref([])
const search = ref('')
const showCreate = ref(false)
const form = reactive({ name: '', description: '' })

const canWrite = computed(() =>
  mainStore.permissions.some(p => p.code === 'GROUPS_WRITE')
)

async function fetchGroups() {
  const query = search.value ? `?search=${encodeURIComponent(search.value)}` : ''
  const { data } = await apiRequest(`/api/internal/groups${query}`)
  groups.value = data || []
}

async function createGroup() {
  await apiRequest('/api/internal/groups', {
    method: 'POST',
    body: form,
    showSuccessToast: true,
    successMessage: 'Group created'
  })
  showCreate.value = false
  form.name = ''
  form.description = ''
  fetchGroups()
}

onMounted(async () => {
  if (!mainStore.permissions.length) await mainStore.fetchPermissions()
  await fetchGroups()
})
</script>
