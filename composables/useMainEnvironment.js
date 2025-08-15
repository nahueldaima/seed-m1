export const useMainEnvironment = () => {
  const store = useMainStore();

  // Create a computed ref for reactive environment value
  const env = computed({
    get: () => store.mainEnv,
    set: (value) => store.switchEnv(value)
  });

  const switchEnv = (newEnv) => store.switchEnv(newEnv);
  const currentEnv = computed(() => store.getCurrentEnv);
  const environments = store.getEnvironments;

  return { env, switchEnv, currentEnv, environments }
}