<template>
  <div class="space-y-6">
    <LibTitleBar :title="groupName" subtitle="Editar grupo y gestionar miembros" />

    <AdminGroupForm
      mode="edit"
      :group-id="id"
      :can-write="canWrite"
      :initial-data="initialData"
      @submit="updateGroup"
      @delete="removeGroup"
    />
  </div>
</template>

<script setup>
const route = useRoute()
const { apiRequest } = useApi()
const mainStore = useMainStore()

const id = route.params.id
const groupName = ref('')
const initialData = ref({ name: '', description: '' })

const canWrite = computed(() =>
 true
  // mainStore.permissions.some(p => p.code === 'GROUPS_WRITE')
)

async function fetchData() {
  const { data } = await apiRequest(`/api/internal/groups/${id}`)
  console.log(data)
  if (data) {
    groupName.value = data.name
    initialData.value = {
      name: data.name,
      description: data.description
    }
  }
}

async function updateGroup(_formData) {
  // The GroupForm component now handles all the API calls internally
  // We just need to refresh the data
  try {
    // Refresh the group data to show updated information
    await fetchData()
  } catch (error) {
    console.error('Failed to refresh group data:', error)
  }
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
