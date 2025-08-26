<template>
  <div class="space-y-6">
    <UForm :state="form" class="space-y-6" @submit="onSubmit">
      <!-- 3-Column Responsive Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Column 1: Basic Group Information -->
        <UCard class="lg:col-span-1">
          <div class="space-y-4">
            <h2 class="text-lg font-semibold">Basic Information</h2>
            <UFormField label="Name">
              <UInput v-model="form.name" :disabled="!canWrite" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="form.description" :disabled="!canWrite" rows="4" />
            </UFormField>
          </div>
        </UCard>

        <!-- Column 2: Permissions -->
        <UCard class="lg:col-span-1">
          <div class="space-y-4">
            <h2 class="text-lg font-semibold">Permissions</h2>
            <UCheckboxGroup
              v-model="selectedPermissions"
              class="max-h-60 overflow-y-auto"
              :items="permissionItems"
              multiple
              searchable
              :disabled="!canWrite"
            />
          </div>
        </UCard>

        <!-- Column 3: Members -->
        <UCard class="lg:col-span-1">
          <div class="space-y-4">
            <h2 class="text-lg font-semibold">Members</h2>
            <UCheckboxGroup
              v-model="selectedUsers"
              :items="userItems"
              multiple
              searchable
              class="max-h-60 overflow-y-auto"
              :disabled="!canWrite"
            />
          </div>
        </UCard>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
        <div class="order-2 sm:order-1">
          <!-- Delete Button (only for edit mode) -->
          <UButton 
            v-if="mode === 'edit' && canWrite" 
            color="red" 
            variant="outline"
            @click="$emit('delete')"
          >
            Delete Group
          </UButton>
        </div>
        
        <div class="flex gap-2 order-1 sm:order-2">
          <UButton 
            v-if="canWrite" 
            type="submit" 
            color="primary"
            size="lg"
          >
            {{ mode === 'create' ? 'Create Group' : 'Save Changes' }}
          </UButton>
        </div>
      </div>
    </UForm>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create' or 'edit'
    validator: (value) => ['create', 'edit'].includes(value)
  },
  groupId: {
    type: String,
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({ name: '', description: '' })
  },
  canWrite: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['submit', 'cancel', 'delete', 'permissions-updated', 'members-updated'])

const { apiRequest } = useApi()
const toast = useToast()

// Form state
const form = reactive({
  name: props.initialData.name || '',
  description: props.initialData.description || ''
})

// Permissions and users state
const selectedPermissions = ref([])
const selectedUsers = ref([])
const allPermissions = ref([])
const allUsers = ref([])

// Computed properties
const permissionItems = computed(() =>
  allPermissions.value.map(p => ({ label: p.code, value: p.id }))
)

const userItems = computed(() =>
  allUsers.value.map(u => ({ label: u.display_name || u.email, value: u.id }))
)

// Methods
async function onSubmit() {
  const formData = {
    ...form,
    permission_ids: selectedPermissions.value,
    user_ids: selectedUsers.value
  }
  
  if (props.mode === 'edit') {
    // In edit mode, we need to handle all updates together
    await handleEditSubmit(formData)
  } else {
    // In create mode, everything is handled in one API call
    emit('submit', formData)
  }
}

async function handleEditSubmit(formData) {
  const { permission_ids, user_ids, ...basicData } = formData
  
  try {
    // Update all three sections in parallel for better performance
    await Promise.all([
      // Update basic group information
      apiRequest(`/api/internal/groups/${props.groupId}`, {
        method: 'PUT',
        body: basicData,
        showSuccessToast: false
      }),
      
      // Update permissions
      apiRequest(`/api/internal/groups/${props.groupId}/permissions`, {
        method: 'POST',
        body: { permission_ids },
        showSuccessToast: false
      }),
      
      // Update members
      apiRequest(`/api/internal/groups/${props.groupId}/users`, {
        method: 'POST',
        body: { user_ids },
        showSuccessToast: false
      })
    ])
    
    // Show single success message for all updates
    toast.add({
      title: 'Success',
      description: 'Group updated successfully',
      color: 'green',
      timeout: 3000
    })
    
    emit('submit', formData)
    
  } catch (error) {
    console.error('Error updating group:', error)
    throw error
  }
}



async function fetchPermissionsAndUsers() {
  const [perms, users] = await Promise.all([
    apiRequest('/api/internal/permissions'),
    apiRequest('/api/internal/users')
  ])
  
  allPermissions.value = perms.data || []
  allUsers.value = users.data || []
}

async function loadGroupData() {
  if (props.mode === 'edit' && props.groupId) {
    const { data } = await apiRequest(`/api/internal/groups/${props.groupId}`)
    if (data) {
      form.name = data.name
      form.description = data.description
      selectedPermissions.value = (data.permissions || []).map(p => p.id)
      selectedUsers.value = (data.users || []).map(u => u.id)
    }
  }
}

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.name = newData.name || ''
    form.description = newData.description || ''
  }
}, { immediate: true })

watch(() => props.groupId, () => {
  if (props.mode === 'edit') {
    loadGroupData()
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await fetchPermissionsAndUsers()
  if (props.mode === 'edit') {
    await loadGroupData()
  }
})

// Expose methods for parent components
defineExpose({
  resetForm: () => {
    form.name = ''
    form.description = ''
    selectedPermissions.value = []
    selectedUsers.value = []
  },
  updateForm: (data) => {
    form.name = data.name || ''
    form.description = data.description || ''
    if (data.permissions) {
      selectedPermissions.value = data.permissions.map(p => p.id)
    }
    if (data.users) {
      selectedUsers.value = data.users.map(u => u.id)
    }
  }
})
</script>