<template>
  <div>
    <h1>Dashboard</h1>
  </div>
</template>


<script setup>
const mainStore = useMainStore()

onMounted(async () => {
  await mainStore.processesGetAll();
})
</script>