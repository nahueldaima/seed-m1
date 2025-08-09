<script setup>
const items = ref([
    {
        label: 'Account',
        icon: 'i-lucide-user',
        content: 'This is the account content.'
    },
    {
        label: 'Password',
        icon: 'i-lucide-lock',
        content: 'This is the password content.'
    }
])
</script>

<template>
    <div>
        <UTabs :items="items" class="w-full" />
        hola
    </div>
</template>