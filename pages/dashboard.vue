<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Job Dashboard"
      description="Monitor and manage your job executions"
    >
      <template #actions>
        <div class="flex items-center gap-3">
          <EnvironmentSelector />
          <UButton 
            icon="heroicons-play" 
            size="lg"
            @click="runNewJob"
          >
            Run New Job
          </UButton>
        </div>
      </template>
    </PageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Total Jobs"
        :value="jobs.length"
        icon="heroicons-arrow-path"
        color="blue"
      />
      
      <StatCard
        title="Running"
        :value="runningJobs"
        icon="heroicons-play"
        color="green"
      />
      
      <StatCard
        title="Completed"
        :value="completedJobs"
        icon="heroicons-check-circle"
        color="blue"
      />
      
      <StatCard
        title="Failed"
        :value="failedJobs"
        icon="heroicons-exclamation-circle"
        color="red"
      />
    </div>

    <!-- Filters -->
    <FiltersSection
      :filters="filterConfig"
      @update:filters="handleFiltersUpdate"
    />

    <!-- Jobs Table -->
    <DataTable
      title="Job Runs"
      description="Current and recent job executions"
      :rows="filteredJobs"
      :columns="tableColumns"
      :loading="loading"
    >
      <template #name-data="{ row }">
        <div class="font-medium">{{ row.name }}</div>
      </template>
      
      <template #progress-data="{ row }">
        <div class="flex items-center space-x-2">
          <UProgress 
            :value="row.progress" 
            :color="getStatusColor(row.status)"
            size="sm"
            class="w-20"
          />
          <span class="text-xs text-muted-foreground">{{ row.progress }}%</span>
        </div>
      </template>
      
      <template #actions-data="{ row }">
        <div class="flex space-x-1">
          <UButton
            v-if="row.status === 'running'"
            icon="heroicons-pause"
            size="2xs"
            color="gray"
            variant="ghost"
            @click="handleJobAction(row.id, 'pause')"
          />
          <UButton
            v-if="row.status === 'queued'"
            icon="heroicons-play"
            size="2xs"
            color="green"
            variant="ghost"
            @click="handleJobAction(row.id, 'start')"
          />
          <UButton
            icon="heroicons-stop"
            size="2xs"
            color="red"
            variant="ghost"
            @click="handleJobAction(row.id, 'stop')"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
const {apiRequest} = useApi()

// Reactive state
const loading = ref(false)
const filterValues = ref({
  search: '',
  status: 'all',
  process: 'all'
})

// Mock data - replace with actual API calls
const jobs = ref([
  {
    id: '1',
    name: 'Data Import Process',
    process: 'data-import',
    status: 'running',
    startTime: '2025-01-15T10:30:00Z',
    duration: '00:15:32',
    progress: 65
  },
  {
    id: '2',
    name: 'Report Generation',
    process: 'report-gen',
    status: 'completed',
    startTime: '2025-01-15T09:45:00Z',
    duration: '00:08:15',
    progress: 100
  },
  {
    id: '3',
    name: 'Email Notifications',
    process: 'email-notif',
    status: 'failed',
    startTime: '2025-01-15T11:00:00Z',
    duration: '00:02:45',
    progress: 25
  },
  {
    id: '4',
    name: 'Database Cleanup',
    process: 'db-cleanup',
    status: 'queued',
    startTime: null,
    duration: null,
    progress: 0
  }
])

// Filter configuration
const filterConfig = [
  {
    key: 'search',
    type: 'search',
    placeholder: 'Search jobs...',
    icon: 'heroicons-magnifying-glass'
  },
  {
    key: 'status',
    type: 'select',
    placeholder: 'All Statuses',
    options: [
      { label: 'All Statuses', value: 'all' },
      { label: 'Running', value: 'running' },
      { label: 'Completed', value: 'completed' },
      { label: 'Failed', value: 'failed' },
      { label: 'Queued', value: 'queued' }
    ]
  },
  {
    key: 'process',
    type: 'select',
    placeholder: 'All Processes',
    options: [
      { label: 'All Processes', value: 'all' },
      { label: 'Data Import', value: 'data-import' },
      { label: 'Report Generation', value: 'report-gen' },
      { label: 'Email Notifications', value: 'email-notif' },
      { label: 'Database Cleanup', value: 'db-cleanup' }
    ]
  }
]

// Table columns with enhanced configuration
const tableColumns = [
  { key: 'name', label: 'Job Name', id: 'name' },
  { 
    key: 'process', 
    label: 'Process',
    type: 'badge',
    id: 'process',
    props: { variant: 'subtle', size: 'sm' }
  },
  { 
    key: 'status', 
    label: 'Status',
    type: 'badge',
    id: 'status',
    props: { variant: 'solid', size: 'sm' },
    colorResolver: (row) => getStatusColor(row.status)
  },
     { 
     key: 'startTime', 
     id: 'startTime',
     label: 'Start Time',
     formatter: (value) => value ? new Date(value).toLocaleString() : '-'
   },
  { 
    key: 'duration', 
    id: 'duration',
    label: 'Duration',
    formatter: (value) => value || '-'
  },
  { key: 'progress', id: 'progress', label: 'Progress' },
  { key: 'actions', id: 'actions', label: 'Actions' }
]

// Computed properties
const runningJobs = computed(() => jobs.value.filter(j => j.status === 'running').length)
const completedJobs = computed(() => jobs.value.filter(j => j.status === 'completed').length)
const failedJobs = computed(() => jobs.value.filter(j => j.status === 'failed').length)

const filteredJobs = computed(() => {
  let filtered = jobs.value

  if (filterValues.value.search) {
    filtered = filtered.filter(job => 
      job.name.toLowerCase().includes(filterValues.value.search.toLowerCase()) ||
      job.process.toLowerCase().includes(filterValues.value.search.toLowerCase())
    )
  }

  if (filterValues.value.status !== 'all') {
    filtered = filtered.filter(job => job.status === filterValues.value.status)
  }

  if (filterValues.value.process !== 'all') {
    filtered = filtered.filter(job => job.process === filterValues.value.process)
  }

  return filtered
})

// Methods
const getStatusColor = (status) => {
  const colors = {
    running: 'blue',
    completed: 'green',
    failed: 'red',
    queued: 'gray'
  }
  return colors[status] || 'gray'
}

// formatDate function moved inline to table column formatter

const handleJobAction = (jobId, action) => {
  // Mock job actions - replace with actual API calls
  console.log(`${action} job ${jobId}`)
  
  // Show toast notification
  const toast = useToast()
  toast.add({
    title: 'Job Action',
    description: `${action} action triggered for job ${jobId}`,
    color: 'primary'
  })
}

const handleFiltersUpdate = (newFilters) => {
  filterValues.value = { ...newFilters }
}

const runNewJob = () => {
  // Mock run new job - replace with actual functionality
  console.log('Running new job...')
  
  const toast = useToast()
  toast.add({
    title: 'New Job',
    description: 'New job creation started',
    color: 'primary'
  })
}

// Add test toast on mount
onMounted(async () => {
  // const toast = useToast()
  // toast.add({
  //   title: 'Dashboard Loaded',
  //   description: 'Welcome to the Job Dashboard!',
  //   color: 'error',
  //   timeout: 5000
  // });

  // fetch backend data
  const {data, error} =await apiRequest('/api/internal/processes/processes_runs', {showSuccessToast: true})
  // const supabase = useSupabaseClient()
  // const { data: { session } } = await supabase.auth.getSession();

  // console.log('session?.access_token', session?.access_token)
  // const { data, error } = await useFetch('/api/internal/processes/processes_runs', {
  //   headers: {
  //     Authorization: `Bearer ${session?.access_token}`
  //   }
  // })
  
  if (error) {
    console.error('Error fetching data:', error)
  } else {
    console.log('AAA fetched:', data)
  }
})
</script> 