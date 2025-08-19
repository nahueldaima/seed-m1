<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ form.name }}</h1>
        <p class="text-muted-foreground mt-2">Edit group and manage members</p>
      </div>
      <UButton v-if="canWrite" color="red" @click="removeGroup">Delete</UButton>
    </div>

    <UCard>
      <UForm :state="form" @submit="updateGroup" class="space-y-4">
        <UFormField label="Name">
          <UInput v-model="form.name" />
        </UFormField>
        <UFormField label="Description">
          <UTextarea v-model="form.description" />
        </UFormField>
        <div class="flex justify-end">
          <UButton v-if="canWrite" type="submit" color="primary">Save</UButton>
        </div>
      </UForm>
    </UCard>

    <UCard>
      <h2 class="text-xl font-semibold mb-4">Permissions</h2>
      <USelectMenu
        v-model="selectedPermissions"
        :items="permissionItems"
        multiple
        searchable
        :disabled="!canWrite"
      />
      <div class="flex justify-end mt-4">
        <UButton v-if="canWrite" @click="savePermissions">Update Permissions</UButton>
      </div>
    </UCard>

    <UCard>
      <h2 class="text-xl font-semibold mb-4">Members</h2>
      <USelectMenu
        v-model="selectedUsers"
        :items="userItems"
        multiple
        searchable
        :disabled="!canWrite"
      />
      <div class="flex justify-end mt-4">
        <UButton v-if="canWrite" @click="saveUsers">Update Members</UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const route = useRoute()
const { apiRequest } = useApi()
const mainStore = useMainStore()

const id = route.params.id
const form = reactive({ name: '', description: '' })
const selectedPermissions = ref([])
const selectedUsers = ref([])

const allPermissions = ref([])
const allUsers = ref([])

const permissionItems = computed(() =>
  allPermissions.value.map(p => ({ label: p.code, value: p.id }))
)
const userItems = computed(() =>
  allUsers.value.map(u => ({ label: u.display_name || u.email, value: u.id }))
)

const canWrite = computed(() =>
  mainStore.permissions.some(p => p.code === 'GROUPS_WRITE')
)

async function fetchData() {
  const { data } = await apiRequest(`/api/internal/groups/${id}`)
  if (data) {
    form.name = data.name
    form.description = data.description
    selectedPermissions.value = (data.permissions || []).map(p => p.id)
    selectedUsers.value = (data.users || []).map(u => u.id)
  }
  const perms = await apiRequest('/api/internal/permissions')
  allPermissions.value = perms.data || []
  const users = await apiRequest('/api/internal/users')
  allUsers.value = users.data || []
}

async function updateGroup() {
  await apiRequest(`/api/internal/groups/${id}`, {
    method: 'PUT',
    body: { name: form.name, description: form.description },
    showSuccessToast: true,
    successMessage: 'Group updated'
  })
  fetchData()
}

async function savePermissions() {
  await apiRequest(`/api/internal/groups/${id}/permissions`, {
    method: 'POST',
    body: { permission_ids: selectedPermissions.value },
    showSuccessToast: true,
    successMessage: 'Permissions updated'
  })
  fetchData()
}

async function saveUsers() {
  await apiRequest(`/api/internal/groups/${id}/users`, {
    method: 'POST',
    body: { user_ids: selectedUsers.value },
    showSuccessToast: true,
    successMessage: 'Members updated'
  })
  fetchData()
}

async function removeGroup() {
  await apiRequest(`/api/internal/groups/${id}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Group deleted'
  })
  navigateTo('/admin/groups')
}

onMounted(async () => {
  if (!mainStore.permissions.length) await mainStore.fetchPermissions()
  await fetchData()
})
</script>
