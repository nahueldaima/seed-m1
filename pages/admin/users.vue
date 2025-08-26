<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">User Management</h1>
        <p class="text-muted-foreground mt-2">Manage users and group membership</p>
      </div>
      <UButton v-if="canWrite" icon="i-lucide-user-plus" @click="showInvite = true">Invite User</UButton>
    </div>

    <UCard>
      <ul>
        <li v-for="u in users" :key="u.id" class="flex justify-between items-center py-2 border-b last:border-b-0">
          <div>
            <p class="font-medium">{{ u.display_name || u.email }}</p>
            <p class="text-sm text-muted-foreground">{{ u.email }}</p>
          </div>
          <UButton v-if="canWrite" size="xs" @click="openEdit(u)">Edit</UButton>
        </li>
        <li v-if="!users.length" class="py-4 text-center text-muted-foreground">No users found</li>
      </ul>
    </UCard>

    <!-- Invite Modal -->
    <UModal v-model="showInvite">
      <UCard>
        <UForm :state="inviteForm" @submit="invite" class="space-y-4">
          <UFormField label="Email">
            <UInput v-model="inviteForm.email" type="email" />
          </UFormField>
          <UFormField label="Display Name">
            <UInput v-model="inviteForm.display_name" />
          </UFormField>
          <UFormField label="Groups">
            <USelectMenu v-model="inviteForm.group_ids" :items="groupItems" multiple searchable />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showInvite = false">Cancel</UButton>
            <UButton type="submit" color="primary">Send Invite</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model="showEdit">
      <UCard>
        <UForm :state="editForm" @submit="saveUser" class="space-y-4">
          <UFormField label="Display Name">
            <UInput v-model="editForm.display_name" />
          </UFormField>
          <UFormField label="Groups">
            <USelectMenu v-model="editForm.group_ids" :items="groupItems" multiple searchable />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="showEdit = false">Cancel</UButton>
            <UButton type="submit" color="primary">Save</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const { apiRequest } = useApi()
const mainStore = useMainStore()

const users = ref([])
const groups = ref([])

const groupItems = computed(() => groups.value.map(g => ({ label: g.name, value: g.id })))

const showInvite = ref(false)
const inviteForm = reactive({ email: '', display_name: '', group_ids: [] })

const showEdit = ref(false)
const editForm = reactive({ id: '', display_name: '', group_ids: [] })

const canWrite = computed(() => mainStore.permissions.some(p => p.code === 'GROUPS_WRITE'))

async function fetchUsers() {
  const { data } = await apiRequest('/api/internal/users')
  users.value = data || []
}

async function fetchGroups() {
  const { data } = await apiRequest('/api/internal/groups')
  groups.value = data || []
}

function openEdit(user) {
  editForm.id = user.id
  editForm.display_name = user.display_name
  editForm.group_ids = (user.groups || []).map(g => g.id)
  showEdit.value = true
}

async function invite() {
  await apiRequest('/api/internal/users', {
    method: 'POST',
    body: inviteForm,
    showSuccessToast: true,
    successMessage: 'Invitation sent'
  })
  showInvite.value = false
  inviteForm.email = ''
  inviteForm.display_name = ''
  inviteForm.group_ids = []
  fetchUsers()
}

async function saveUser() {
  await apiRequest(`/api/internal/users/${editForm.id}`, {
    method: 'PUT',
    body: { display_name: editForm.display_name, group_ids: editForm.group_ids },
    showSuccessToast: true,
    successMessage: 'User updated'
  })
  showEdit.value = false
  fetchUsers()
}

onMounted(async () => {
  if (!mainStore.permissions.length) await mainStore.fetchPermissions()
  await fetchGroups()
  await fetchUsers()
})
</script>
