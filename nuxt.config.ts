// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@nuxtjs/color-mode',
    '@nuxt/ui',
    '@nuxt/icon'
  ],
  colorMode: {
    classSuffix: ''
  },
  icon: {
    // Ensure heroicons icons are served from the Nuxt server bundle (fix 404)
    serverBundle: {
      // Explicitly include the heroicons collection that we installed as a dev dependency
      collections: ['heroicons', 'lucide']
    }
  },
  css: [
    // '~/assets/css/supabase.css', 
    '~/assets/css/main.css'],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/dashboard',
      include: ['/*'],
      exclude: ['/', '/login'] 
    }
  },
  devServer: {
    port: 3100
  }
})