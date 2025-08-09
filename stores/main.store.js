import { defineStore } from 'pinia';


export const useMainStore = defineStore('main', {
  state: () => {
    return {
      someState: 'hello pinia 222',
      permissions: []
    }
  },
  getters: {
    getSomeState: (state) => state.someState,
    getPermissions: (state) => state.permissions,
  },
  actions: {
    async fetchPermissions() {
      const {apiRequest} = useApi();
      const {data, error} =await apiRequest('/api/internal/user-data/permissions', {showSuccessToast: false});
      console.log(data, error);
      this.permissions = data?.perms || [];
    }
  },
  persist: true,
})