<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :class="`${mobile ? 'w-80 bg-white dark:bg-gray-900' : 'w-64'} h-full flex flex-col border-r bg-card`">
    <!-- Header -->
    <div class="p-6 border-b pr-2 pb-2">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Admin backoffice</h2>
          <p class="text-xs mt-1">
            <small class="mr-2">Env:</small>
            <span :class="envColorClass" class="px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
              {{ env }}
            </span>
          </p>
        </div>
        <UButton variant="ghost" size="sm" icon="i-heroicons-x-mark" @click="$emit('close')" class="p-2 lg:hidden" />
      </div>
      <!-- show admin -->
      <!-- <div v-if="!user?.isSuperAdmin" class="flex justify-start mr-1 mt-2 mb-0 p-0">
        <NuxtLink to="/admin">
          <Icon name="heroicons-cog-6-tooth" class="w-5 h-5 flex-shrink-0" />
        </NuxtLink>
      </div> -->
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <template v-for="item in navigation" :key="item.name">
        <!-- Main navigation item -->
        <NuxtLink v-if="!item.items" :to="item.href"
          class="flex items-center px-3 py-2 rounded-md transition-colors group" :class="isActive(item.href) 
            ? 'bg-primary text-primary-foreground dark:bg-primary-foreground text-white' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'">
          <Icon :name="item.icon" class="w-4 h-4 mr-3 flex-shrink-0" />
          <span class="truncate">{{ item.name }}</span>
        </NuxtLink>

        <!-- Grouped items -->
        <div v-else class="space-y-1">
          <div class="px-3 py-2 text-sm font-medium text-muted-foreground">
            {{ item.name }}
          </div>
          <NuxtLink v-for="subItem in item.items" :key="subItem.name" :to="subItem.href"
            class="flex items-center px-3 py-2 rounded-md transition-colors" :class="isActive(subItem.href) 
              ? 'bg-primary text-primary-foreground' 
              : 'text-foreground hover:bg-accent hover:text-accent-foreground'">
            <Icon :name="subItem.icon" class="w-4 h-4 mr-3 flex-shrink-0" />
            <span class="truncate">{{ subItem.name }}</span>
          </NuxtLink>
        </div>
      </template>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t space-y-3">
      <div class="flex items-center justify-end">
        <ClientOnly>
          <UButton variant="ghost" color="neutral" :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            @click="toggleColorMode" class="p-2" />
        </ClientOnly>
      </div>

      <div class="flex items-center justify-center">
        <UButton @click="$emit('logout')" variant="ghost">
          <!-- <Icon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-3 flex-shrink-0" /> -->
          <span class="truncate">Log Out</span>
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { useMainEnvironment } from '@/composables/useMainEnvironment';
const { env, switchEnv, environments } = useMainEnvironment()
defineProps({
  user: {
    type: Object,
    default: null
  },
  mobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['logout', 'close'])

const route = useRoute()

const navigation = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: 'i-heroicons-home'
  },
  {
    name: 'Procesos',
    items: [
      {
        name: 'Activos',
        href: '/processes/active',
        icon: 'i-heroicons-play'
      },
      {
        name: 'Catálogo',
        href: '/processes/catalog',
        icon: 'i-heroicons-list-bullet'
      }
    ]
  },
  {
    name: 'Administration',
    items: [
      {
        name: 'Users',
        href: '/admin/users',
        icon: 'i-heroicons-users'
      },
      {
        name: 'Permissions',
        href: '/admin/permissions',
        icon: 'i-heroicons-shield-check'
      },
      {
        name: 'MongoDB Collections',
        href: '/admin/mongo-collections',
        icon: 'i-heroicons-circle-stack'
      },
    ]
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: 'i-heroicons-user'
  },
]

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const isActive = (href) => {
  return route.path === href
}


const envColorClass = computed(() => {
  const map = {
    production: 'bg-red-600 text-white',
    demo: 'bg-amber-500 text-white',
    uat: 'bg-green-600 text-white',
    develop: 'bg-blue-600 text-white'
  }
  return `${map[env.value] || 'bg-gray-500 text-white'}`
})
</script>