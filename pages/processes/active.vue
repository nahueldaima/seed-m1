<template>
    <div class="space-y-6">
        <!-- Header -->
        <PageHeader title="Job Dashboard" description="Monitor and manage your job executions">
            <template #actions>
                <div class="flex items-center gap-3">
                    <EnvironmentSelector />
                    <!-- <UButton 
              icon="heroicons-play" 
              size="lg"
              @click="runNewJob"
            >
              Run New Job
            </UButton> -->
                </div>
            </template>
        </PageHeader>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Jobs" :value="processesRuns.length" icon="heroicons-arrow-path" color="blue" />

            <StatCard title="Running" :value="runningJobs" icon="heroicons-play" color="green" />

            <StatCard title="Completed" :value="completedJobs" icon="heroicons-check-circle" color="blue" />

            <StatCard title="Failed" :value="failedJobs" icon="heroicons-exclamation-circle" color="red" />
        </div>

        <!-- Filters -->
        <FiltersSection :filters="filterConfig" @update:filters="handleFiltersUpdate">
            <template #mainfilter>
                <DateRangePicker v-model="range" />
            </template>
        </FiltersSection>
      
        <!-- Jobs Table -->
        <LibDataTable title="Job Runs" description="Current and recent job executions" :rows="processedValuesForTable"
            :columns="tableColumns" :loading="loading" />
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
const { apiRequest } = useApi();
const mainStore = useMainStore()
const processes = computed(() => mainStore.processes)

const supabase = useSupabaseClient()

const range = ref({
  start: null,
  end: null
})

// Reactive state
const loading = ref(false)
const filterValues = ref({
    search: '',
    status: 'all',
    process: 'all'
})
const processesRuns = ref([])

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
    { key: 'process_id', label: 'Proceso', id: 'process_id' },
    { key: 'account', label: 'Cuenta', id: 'account' },
    {
        key: 'status',
        label: 'Status',
        type: 'badge',
        id: 'status',
        props: { size: 'xl' },
        colorResolver: (row) => getStatusColor(row.status)
    },
    
    {
        key: 'created_at',
        id: 'created_at',
        label: 'Inicio',
        type: 'datetime'
    },
    {
        key: 'duration_ms',
        id: 'duration_ms',
        label: 'Duración',
        formatter: (value) => value ? `${String(value / 1000).slice(0, 4)}s` : '-'
    },
    {
        key: 'updated_at',
        id: 'updated_at',
        label: 'Última actualización',
        type: 'datetime'
    },
    { key: 'finished', id: 'finished', label: 'Finalizado', formatter: (value) => value ? 'Si' : 'No' }
]

// Computed properties
const runningJobs = computed(() => processesRuns.value.filter(j => ['RUNNING', 'STARTED'].includes(j.status)).length)
const completedJobs = computed(() => processesRuns.value.filter(j => j.status === 'SUCCESS').length)
const failedJobs = computed(() => processesRuns.value.filter(j => j.status === 'FAIL').length)

const processedValuesForTable = computed(() => {
    let values = processesRuns.value;

    return values.map(value => {
        return {
            ...value,
            process_id: processes.value.find(p => p.id === value.process_id)?.name,
        }
    })


    if (filterValues.value.search) {
        const searchTerm = filterValues.value.search.toLowerCase()
        filtered = filtered.filter(job =>
            (job.process_id && String(job.process_id).toLowerCase().includes(searchTerm)) ||
            (job.account && String(job.account).toLowerCase().includes(searchTerm))
        )
    }

    if (filterValues.value.status !== 'all') {
        const status = filterValues.value.status;
        if (status === 'running') {
            filtered = filtered.filter(job => ['RUNNING', 'STARTED'].includes(job.status))
        } else if (status === 'completed') {
            filtered = filtered.filter(job => job.status === 'SUCCESS')
        } else if (status === 'failed') {
            filtered = filtered.filter(job => job.status === 'FAIL')
        } else if (status === 'queued') {
            filtered = filtered.filter(job => job.status === 'QUEUED')
        }
    }

    if (filterValues.value.process !== 'all') {
        filtered = filtered.filter(job => job.process_id === filterValues.value.process)
    }

    return filtered
})

// Methods
const getStatusColor = (status) => {
    const colors = {
        STARTED: 'neutral',
        RUNNING: 'neutral',
        WARNING: 'warning',
        SUCCESS: 'success',
        FAIL: 'error'
    }
    return colors[status] || 'neutral'
}

const handleFiltersUpdate = (newFilters) => {
    filterValues.value = { ...newFilters }
}

const retrieveProcessesRuns = async () => {
    const { data, error } = await apiRequest('/api/internal/processes/processes_runs', { showSuccessToast: true })
    if (error) {
        console.error('Error fetching data:', error)
    } else {
        processesRuns.value = data;
    }
}

const subscribeToProcessesRuns = async () => {
    supabase.channel('realtime:processes_runs').on('postgres_changes', { event: '*', schema: 'public', table: 'processes_runs', filter: `created_at > '2025-08-15 10:00:00'` }, (payload) => {
        console.log('payload', payload.eventType, payload);
        
        if (payload.eventType === 'INSERT') {
            // Add new record
            processesRuns.value.push(payload.new);
        } else if (payload.eventType === 'UPDATE') {
            // Update existing record
            const index = processesRuns.value.findIndex(run => run.id === payload.new.id);
            if (index !== -1) {
                processesRuns.value[index] = payload.new;
            }
        } else if (payload.eventType === 'DELETE') {
            // Remove deleted record
            const index = processesRuns.value.findIndex(run => run.id === payload.old.id);
            if (index !== -1) {
                processesRuns.value.splice(index, 1);
            }
        }
    }).subscribe();
}

// on Mounted
onMounted(async () => {
    await retrieveProcessesRuns();
    await subscribeToProcessesRuns();

    // check if processes are loaded
    if (processes.value.length === 0) {
        await mainStore.processesGetAll();
    }
})


// on Unmounted
onUnmounted(() => {
    supabase.channel('realtime:processes_runs').unsubscribe();
})

</script>