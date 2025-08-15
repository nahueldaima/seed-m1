import { defineStore } from 'pinia';

export const environments = [
  { label: 'Production', value: 'production', id: 'production' },
  { label: 'Demo', value: 'demo', id: 'demo' },
  { label: 'UAT', value: 'uat', id: 'uat' },
  { label: 'Develop', value: 'develop', id: 'develop' }
];

export const useMainStore = defineStore('main', {
  state: () => {
    return {
      someState: 'hello pinia 222',
      permissions: [],
      mainEnv: 'production',
      processes: []
    }
  },
  getters: {
    getSomeState: (state) => state.someState,
    getPermissions: (state) => state.permissions,
    getCurrentEnv: (state) => {
      return environments.find(e => e.value === state.mainEnv) || environments[0];
    },
    getEnvironments: () => environments,
    getProcesses: (state) => state.processes
  },
  actions: {
    async fetchPermissions() {
      const {apiRequest} = useApi();
      const {data, error} =await apiRequest('/api/internal/user-data/permissions', {showSuccessToast: false});

      this.permissions = data?.perms || [];
    },
    switchEnv(newEnv) {
      if (environments.some(e => e.value === newEnv)) {
        this.mainEnv = newEnv;
      } else {
        console.warn(`Invalid environment: ${newEnv}`);
      }
    },
    async processesGetAll() {
      const {apiRequest} = useApi();
      const {data, error} =await apiRequest('/api/internal/processes/processes', {showSuccessToast: false});

      this.processes = data || [];
    },
    async processesCreate(payload) {
      const { apiRequest } = useApi();
      const { data, error } = await apiRequest('/api/internal/processes/processes', {
        method: 'POST',
        body: {
          ...payload,
          environment: payload?.environment?.map(e => e.value)
        },
        showSuccessToast: true,
        successMessage: 'Process created'
      });
      if (!error && data) {
        const created = Array.isArray(data) ? data[0] : data;
        this.processes = [created, ...this.processes];
      }
      return { data, error };
    },
  },
  persist: true,
})