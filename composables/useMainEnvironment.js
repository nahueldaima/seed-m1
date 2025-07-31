export const environments = [
  { label: 'Production', value: 'production', id: 'production' },
  { label: 'Demo', value: 'demo', id: 'demo' },
  { label: 'UAT', value: 'uat', id: 'uat' },
  { label: 'Develop', value: 'develop', id: 'develop' }
]

export const useMainEnvironment = () => {
  const env = useCookie('mainEnv', {
    default: () => 'production',
    watch: true,
    maxAge: 60 * 60 * 24 * 30
  })

  // ✅ Helper: Change env safely
  const switchEnv = (newEnv) => {
    if (environments.some(e => e.value === newEnv)) {
      env.value = newEnv
    } else {
      console.warn(`Invalid environment: ${newEnv}`)
    }
  }

  // ✅ Helper: Get current environment object (label/value/id)
  const currentEnv = computed(() => {
    return environments.find(e => e.value === env.value) || environments[0]
  })

  return { env, switchEnv, currentEnv, environments }
}