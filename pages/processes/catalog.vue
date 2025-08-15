<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Process Catalog" description="Browse all available processes">
      <template #actions>
        <div class="flex items-center gap-2">
          <EnvironmentSelector />
          <UButton
            v-if="canCreate"
            icon="i-heroicons-plus"
            color="primary"
            @click="openCreateModal"
          >
            New Process
          </UButton>
        </div>
      </template>
    </PageHeader>

    <!-- Filters -->
    <FiltersSection :filters="filterConfig" @update:filters="handleFiltersUpdate" />

    <!-- Processes Table -->
    <LibDataTable :rows="filteredProcesses" :columns="columns">
      <template #expanded="{ row }">
        <dl class="p-4 text-sm grid gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <dt class="font-medium text-gray-700">Description</dt>
            <dd>{{ row.original.description || '-' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Account</dt>
            <dd>
              <UBadge v-if="row.original.account" variant="subtle" color="neutral" class="capitalize">
                {{ row.original.account }}
              </UBadge>
              <span v-else>-</span>
            </dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Environment</dt>
            <dd>{{ row.original.environment }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Logs</dt>
            <dd>
              <a
                v-if="row.original.log_group && row.original.log_stream"
                :href="awsLogLink(row.original)"
                target="_blank"
                rel="noopener"
                class="text-primary underline"
              >
                View logs
              </a>
              <span v-else>-</span>
            </dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Created</dt>
            <dd>
              <NuxtTime
                v-if="row.original.created_at"
                :datetime="row.original.created_at"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="2-digit"
                minute="2-digit"
              />
              <span v-else>-</span>
            </dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Updated</dt>
            <dd>
              <NuxtTime
                v-if="row.original.updated_at"
                :datetime="row.original.updated_at"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="2-digit"
                minute="2-digit"
              />
              <span v-else>-</span>
            </dd>
          </div>
        </dl>
      </template>
    </LibDataTable>

    <UModal v-model="isCreateOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create Process</h3>
        </template>
        <form class="space-y-4" @submit.prevent="createProcess">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <UInput v-model="newProcess.name" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <UInput v-model="newProcess.description" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Account</label>
            <UInput v-model="newProcess.account" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Environment</label>
            <USelect v-model="newProcess.environment" :options="envOptions" placeholder="Select environment" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <UButton type="button" variant="ghost" color="neutral" @click="isCreateOpen = false">
              Cancel
            </UButton>
            <UButton type="submit" color="primary">
              Create
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'

const mainStore = useMainStore()
const processes = computed(() => mainStore.processes)
const canCreate = computed(() => mainStore.getPermissions?.includes('PROCESSES_WRITE'))

onMounted(async () => {
  if (!processes.value.length) {
    await mainStore.processesGetAll()
  }
})

const filterValues = ref({
  search: '',
  account: 'all'
})

const accounts = computed(() => Array.from(new Set(processes.value.map(p => p.account).filter(Boolean))))
const accountsOptions = computed(() => [
  { label: 'All Accounts', value: 'all' },
  ...accounts.value.map(a => ({ label: a, value: a }))
])

const filterConfig = computed(() => [
  { key: 'search', type: 'search', placeholder: 'Search processes...' },
  { key: 'account', type: 'select', placeholder: 'All Accounts', options: accountsOptions.value, searchable: true }
])

const handleFiltersUpdate = (newFilters) => {
  filterValues.value = { ...newFilters }
}

const filteredProcesses = computed(() => {
  let list = processes.value
  const term = filterValues.value.search?.toLowerCase()
  if (term) {
    list = list.filter(p =>
      [p.name, p.description].some(v => v && v.toLowerCase().includes(term))
    )
  }
  if (filterValues.value.account !== 'all') {
    list = list.filter(p => p.account === filterValues.value.account)
  }
  return list
})

const columns = [
  { key: 'name', id: 'name', label: 'Name' },
  { key: 'account', id: 'account', label: 'Account' },
  { key: 'environment', id: 'environment', label: 'Environment' },
  { key: 'created_at', id: 'created_at', label: 'Created', type: 'datetime' }
]

const awsLogLink = (row) => {
  const region = 'eu-west-1'
  const group = encodeURIComponent(row.log_group)
  const stream = encodeURIComponent(row.log_stream)
  return `https://console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${group}/log-events/${stream}`
}

const envOptions = computed(() => mainStore.getEnvironments.map(e => ({ label: e.label, value: e.value })))
const isCreateOpen = ref(false)
const newProcess = reactive({ name: '', description: '', account: '', environment: '' })

const openCreateModal = () => {
  newProcess.name = ''
  newProcess.description = ''
  newProcess.account = ''
  newProcess.environment = mainStore.getCurrentEnv.value
  isCreateOpen.value = true
}

const createProcess = async () => {
  await mainStore.processesCreate({ ...newProcess })
  isCreateOpen.value = false
}
</script>
