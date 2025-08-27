<template>
    <div class="space-y-6">
        <!-- Header -->
        <PageHeader title="Job Dashboard" description="Monitor and manage your job executions">
            <template #actions>
                <div class="flex items-center gap-3">
                   
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
        <FiltersSection :filters="filterConfig" @update:filters="handleFiltersUpdate" @refreshFilters="refreshFilters">
            <template #subheader>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <EnvironmentSelector />
                    <DateRangePicker v-model="filterValues.dateRange" @update:model-value="handleDateRangeUpdate" />
                    <UButton
                        :color="realtimeEnabled ? 'primary' : 'gray'"
                        icon="heroicons-bolt"
                        @click="toggleRealtime"
                    >{{ realtimeEnabled ? 'Realtime On' : 'Realtime Off' }}</UButton>
                </div>
            </template>
        </FiltersSection>
      
        <!-- Jobs Table -->
        <LibDataTable
            title="Job Runs"
            description="Current and recent job executions"
            :rows="processedValuesForTable"
            :columns="tableColumns"
            :loading="loading"
        />
        <div ref="loadMoreTrigger" />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'

// -----------------------------------------------------------------------------
// Composables and clients
// -----------------------------------------------------------------------------
const { apiRequest } = useApi();
const mainStore = useMainStore()
const processes = computed(() => mainStore.processes)
const supabase = useSupabaseClient()

// -----------------------------------------------------------------------------
// Reactive state
// -----------------------------------------------------------------------------
const loading = ref(false)
const realtimeEnabled = ref(false)
const page = ref(0)
const pageSize = 100
const hasMore = ref(true)
const filterValues = ref({
    search: '',
    status: 'all',
    process: 'all',
    timeMode: 'relative',
    relative: '',
    dateRange: { start: '', end: '' }
})
const processesRuns = ref([])
const loadMoreTrigger = ref(null)

// Non-reactive locals
let observer
let realtimeChannel

// -----------------------------------------------------------------------------
// Filters
// -----------------------------------------------------------------------------
const filterConfig = ref([
    {
        key: 'search',
        type: 'search',
        placeholder: 'Buscar procesos...',
        icon: 'heroicons-magnifying-glass'
    },
    {
        key: 'status',
        type: 'select',
        placeholder: 'All Statuses',
        options: [
            { label: 'All Statuses', value: 'all' },
            { label: 'Running', value: 'RUNNING' },
            { label: 'Success', value: 'SUCCESS' },
            { label: 'Failed', value: 'FAIL' },
            { label: 'Warning', value: 'WARNING' },
            { label: 'Started', value: 'STARTED' }
        ]
    },
    {
        key: 'process',
        type: 'select',
        placeholder: 'All Processes',
        options: [
            { label: 'All Processes', value: 'all' }
        ]
    }
])

// Keep the process options in sync with the store
watch(processes, (newVal) => {
    const processFilter = filterConfig.value.find(f => f.key === 'process')
    if (processFilter) {
        processFilter.options = [{ label: 'All Processes', value: 'all' }, ...newVal.map(p => ({ label: p.name, value: p.id }))]
    }
}, { immediate: true })

// Filter handlers
const handleDateRangeUpdate = (newVal) => {
    filterValues.value.dateRange = newVal
    handleFiltersUpdate(filterValues.value)
}

const handleFiltersUpdate = (newFilters) => {
    filterValues.value = { ...newFilters }
    retrieveProcessesRuns(true)
}

const refreshFilters = () => {
    retrieveProcessesRuns(true)
}

// -----------------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------------
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
        type: 'datetimeseconds'
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
        type: 'datetimeseconds'
    },
    { key: 'finished', id: 'finished', label: 'Finalizado', formatter: (value) => value ? 'Si' : 'No' }
]

// -----------------------------------------------------------------------------
// Computed properties
// -----------------------------------------------------------------------------
const runningJobs = computed(() => processesRuns.value.filter(j => ['RUNNING', 'STARTED'].includes(j.status)).length)
const completedJobs = computed(() => processesRuns.value.filter(j => j.status === 'SUCCESS').length)
const failedJobs = computed(() => processesRuns.value.filter(j => j.status === 'FAIL').length)

const processedValuesForTable = computed(() => {
    return processesRuns.value.map(value => {
        return {
            ...value,
            process_id: processes.value.find(p => p.id === value.process_id)?.name,
        }
    })
})

// -----------------------------------------------------------------------------
// Data fetching
// -----------------------------------------------------------------------------
const retrieveProcessesRuns = async (reset = false) => {
    if (loading.value || (!hasMore.value && !reset)) return
    loading.value = true

    if (reset) {
        page.value = 0
        processesRuns.value = []
        hasMore.value = true
    }

    const params = new URLSearchParams()
    params.set('environment', mainStore.mainEnv)
    params.set('limit', pageSize)
    params.set('offset', page.value * pageSize)

    if (filterValues.value.search) {
        const term = filterValues.value.search.trim()
        if (term) {
            params.set('search', term)
            const matched = processes.value
                .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
                .map(p => p.id)
            if (matched.length) {
                params.set('processIds', matched.join(','))
            }
        }
    }

    if (filterValues.value.status !== 'all') {
        params.set('status', filterValues.value.status)
    }

    if (filterValues.value.process !== 'all') {
        params.set('processId', filterValues.value.process)
    }

    if (
        filterValues?.value?.dateRange?.start &&
        filterValues?.value?.dateRange?.end
    ) {
        const startDate = new Date(filterValues.value.dateRange.start)
        const endDate = new Date(filterValues.value.dateRange.end)
        if (!isNaN(startDate) && !isNaN(endDate)) {
            params.set('from', startDate.toISOString())
            params.set('to', endDate.toISOString())
        }
    }

    const { data, error } = await apiRequest(`/api/internal/processes/processes_runs?${params.toString()}`, { showSuccessToast: false })
    if (!error && data) {
        processesRuns.value.push(...data)
        if (data.length < pageSize) {
            hasMore.value = false
        } else {
            page.value += 1
        }
    } else if (error) {
        console.error('Error fetching data:', error)
    }
    loading.value = false
}

// -----------------------------------------------------------------------------
// Realtime subscriptions
// -----------------------------------------------------------------------------
const subscribeToProcessesRuns = () => {
    realtimeChannel = supabase.channel('realtime:processes_runs').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'processes_runs', filter: `environment=eq.${mainStore.mainEnv}` },
        (payload) => {
            if (payload.eventType === 'INSERT') {
                processesRuns.value.unshift(payload.new)
            } else if (payload.eventType === 'UPDATE') {
                const index = processesRuns.value.findIndex(run => run.id === payload.new.id)
                if (index !== -1) {
                    processesRuns.value[index] = payload.new
                }
            } else if (payload.eventType === 'DELETE') {
                const index = processesRuns.value.findIndex(run => run.id === payload.old.id)
                if (index !== -1) {
                    processesRuns.value.splice(index, 1)
                }
            }
        }
    ).subscribe()
}

const unsubscribeFromProcessesRuns = () => {
    if (realtimeChannel) {
        realtimeChannel.unsubscribe()
        realtimeChannel = null
    }
}

const toggleRealtime = () => {
    realtimeEnabled.value = !realtimeEnabled.value
    if (realtimeEnabled.value) {
        subscribeToProcessesRuns()
    } else {
        unsubscribeFromProcessesRuns()
    }
}

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------
onMounted(async () => {
    await retrieveProcessesRuns(true)

    if (processes.value.length === 0) {
        await mainStore.processesGetAll()
    }

    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            retrieveProcessesRuns()
        }
    })
    if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value)
})

watch(() => mainStore.mainEnv, () => {
    retrieveProcessesRuns(true)
    if (realtimeEnabled.value) {
        unsubscribeFromProcessesRuns()
        subscribeToProcessesRuns()
    }
})

onUnmounted(() => {
    observer?.disconnect()
    unsubscribeFromProcessesRuns()
})
</script>