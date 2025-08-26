<template>
  <div class="space-y-6">
    <LibTitleBar title="Crear nuevo grupo" />

    <AdminGroupForm
      mode="create"
      :can-write="canWrite"
      :initial-data="initialData"
      @submit="createGroup"
      @delete="removeGroup"
    />
  </div>
</template>

<script setup>
const { apiRequest } = useApi()

const initialData = ref({ name: '', description: '' })

const canWrite = computed(() =>
 true
  // mainStore.permissions.some(p => p.code === 'GROUPS_WRITE')
)

async function createGroup(formData) {
  await apiRequest('/api/internal/groups', {
    method: 'POST',
    body: formData,
    showSuccessToast: true,
    successMessage: 'Group created'
  })
  navigateTo('/admin/groups')
}
</script>
