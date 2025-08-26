<template>
    <div class="flex items-center ">
        <UButton variant="ghost" size="sm" class="pr-4 mr-2" @click="router.back()">
            <Icon name="mdi:arrow-left" size="26" />
        </UButton>
        <div class="w-full">
            <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
            <p v-if="subtitle" class="text-muted-foreground mt-1">{{ subtitle }}</p>
        </div>
    </div>
</template>

<script setup>
const router = useRouter()

defineProps({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: false,
        default: ''
    }
})
</script>