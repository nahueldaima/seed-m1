<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader title="Process Catalog" description="Browse all available processes">
      <template #actions>
        <EnvironmentSelector />
      </template>
    </PageHeader>

    <!-- Filters -->
    <FiltersSection :filters="filterConfig" @update:filters="handleFiltersUpdate" />

    <!-- Processes Table -->
    <LibDataTable :rows="filteredProcesses" :columns="columns">
      <template #expanded="{ row }">
        <div class="p-4 grid gap-2 text-sm md:grid-cols-2">
          <div>
            <span class="font-medium">Description:</span>
            <span class="block">{{ row.original.description || '-' }}</span>
          </div>
          <div>
            <span class="font-medium">Account:</span>
            <span>{{ row.original.account || '-' }}</span>
          </div>
          <div>
            <span class="font-medium">Environment:</span>
            <span>{{ row.original.environment }}</span>
          </div>
          <div>
            <span class="font-medium">Logs:</span>
            <template v-if="row.original.log_group && row.original.log_stream">
              <a
                :href="awsLogLink(row.original)"
                target="_blank"
                rel="noopener"
                class="text-primary underline"
              >
                View logs
              </a>
            </template>
            <span v-else>-</span>
          </div>
          <div>
            <span class="font-medium">Created:</span>
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
          </div>
          <div>
            <span class="font-medium">Updated:</span>
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
          </div>
        </div>
      </template>
    </LibDataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const mainStore = useMainStore()
const processes = computed(() => mainStore.processes)

onMounted(async () => {
  if (!processes.value.length) {
    await mainStore.processesGetAll()
  }
})

const filterValues = ref({
  search: '',
  account: 'all'
})

const accountsOptions = computed(() => {
  const accs = Array.from(new Set(processes.value.map(p => p.account).filter(Boolean)))
  return [{ label: 'All Accounts', value: 'all' }, ...accs.map(a => ({ label: a, value: a }))]
})

const filterConfig = computed(() => [
  { key: 'search', type: 'search', placeholder: 'Search processes...' },
  { key: 'account', type: 'select', placeholder: 'All Accounts', options: accountsOptions.value }
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
  const region = 'us-east-1'
  const group = encodeURIComponent(row.log_group)
  const stream = encodeURIComponent(row.log_stream)
  return `https://console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/${group}/log-events/${stream}`
}
</script>
