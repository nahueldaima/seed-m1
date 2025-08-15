<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Process Catalog" description="Browse all available processes">
      <template #actions>
        <div class="flex items-center gap-2">
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

    <!-- Refresh button -->
    <div class="flex justify-end">
      <UButton icon="i-heroicons-arrow-path" color="primary" @click="refreshProcesses">
        Refresh
      </UButton>
    </div>

    <!-- Processes Table -->
    <LibDataTable :rows="filteredProcesses" :columns="columns">
      <template #expanded="{ row }">
        <dl class="p-4 text-sm grid gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
            <dt class="font-medium text-gray-700">Description</dt>
            <dd class="capitalize">{{ row.original.name || '-' }}</dd>
            </div>
          <div>
            <dt class="font-medium text-gray-700">Description</dt>
            <dd>{{ row.original.description || '-' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-700">Account</dt>
            <dd>
              <UBadge v-if="row.original.account" variant="subtle" color="neutral">
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
            <dt class="font-medium text-gray-700">CRON Details</dt>
            <dd>
              <pre>{{ row.original.cron_details || '-' }}</pre>
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

    <UModal v-model:open="isCreateOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Crear proceso</h3>
          </template>
          <form class="space-y-4" @submit.prevent="createProcess">
            <div>
              <label class="block text-sm font-medium mb-1">Name</label>
              <UInput v-model="newProcess.name" required class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <UInput v-model="newProcess.description" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Account</label>
              <UInput v-model="newProcess.account" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Log Group</label>
              <UInput v-model="newProcess.log_group" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Log Stream</label>
              <UInput v-model="newProcess.log_stream" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Environment</label>
              <USelectMenu v-model="newProcess.environment" :items="envOptions" placeholder="Select environment" multiple class="w-full"/>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">CRON Details</label>
              <UInput v-model="newProcess.cron_details" class="w-full" />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <UButton type="button" variant="ghost" color="neutral" @click="isCreateOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary">
                Crear
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'

const mainStore = useMainStore()
const processes = computed(() => mainStore.processes)
// const canCreate = computed(() => mainStore.getPermissions?.includes('PROCESSES_WRITE'))
const canCreate = ref(true)
const currentEnv = computed(() => mainStore.getCurrentEnv.value)

onMounted(async () => {
  if (!processes.value.length) {
    await mainStore.processesGetAll()
  }
})

const filterValues = ref({
  search: '',
  account: 'all',
  environment: 'all'
})


const accounts = computed(() =>
  Array.from(new Set(processes.value.map(p => p.account).filter(Boolean)))
)

const accountsOptions = computed(() => [
  { label: 'All Accounts', value: 'all' },
  ...accounts.value.map(a => ({ label: a, value: a }))
])

watch(currentEnv, () => {
  filterValues.value.account = 'all'
  filterValues.value.environment = 'all'
})


const filterConfig = computed(() => [
  { key: 'search', type: 'search', placeholder: 'Search processes...' },
  { key: 'account', type: 'select-menu', placeholder: 'All Accounts', options: accountsOptions.value},
  { key: 'environment', type: 'select-menu', placeholder: 'All Environments', options: envOptions.value}
])

const handleFiltersUpdate = (newFilters) => {
  filterValues.value = { ...filterValues.value, ...newFilters }
}

const filteredProcesses = computed(() => {
  let list = processes.value
  const term = filterValues.value.search?.toLowerCase()
  if (term) {
    list = list.filter(p =>
      [p.name, p.account, p.description].some(v => v && v.toLowerCase().includes(term))
    )
  }

  console.log(filterValues.value)

  if (filterValues.value.environment !== 'all' && filterValues.value.environment !== '') {
    list = list.filter(p => p.environment === filterValues.value.environment)
  }


  if (filterValues.value.account !== 'all' && filterValues.value.account !== '') {
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
  newProcess.environment = ''
  newProcess.log_group = ''
  newProcess.log_stream = ''
  newProcess.cron_details = ''
  isCreateOpen.value = true
}

const refreshProcesses = async () => {
  await mainStore.processesGetAll()
}

const createProcess = async () => {
  await mainStore.processesCreate({ ...newProcess });
  await refreshProcesses();
  isCreateOpen.value = false
}

</script>
