<template>
  <div class="min-h-screen flex items-center justify-center bg-default dark:bg-default">
    <div class="max-w-lg w-full space-y-8 px-4">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-highlighted tracking-tight">
          Sign in to Backoffice Admin
        </h2>
        <p class="mt-2 text-sm text-muted">
          Enter your email to get started
        </p>
      </div>

      <UCard class="p-8 shadow-lg">
        <!-- Success Message with Icon -->
        <div
          v-if="message"
          class="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 flex items-start gap-3"
        >
          <UIcon name="i-lucide-mail-check" class="text-success mt-0.5 size-5 shrink-0" />
          <div>
            <p class="text-success font-medium text-sm">Magic link sent!</p>
            <p class="text-success/80 text-sm">Check your email and click the link to sign in</p>
          </div>
        </div>

        <!-- Error Alert -->
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :title="error"
          class="mb-6"
        />

        <UForm 
          :schema="currentSchema" 
          :state="form" 
          @submit="handleSubmit"
          class="space-y-6"
        >
          <!-- Email Input -->
          <div class="space-y-2">
            <UInput 
              v-model="form.email" 
              type="email" 
              placeholder="Enter your email address"
              :disabled="loading || magicLinkLoading"
              class="w-full"
              size="lg"
            />
          </div>

          <!-- Password Mode -->
          <template v-if="usePassword">
            <div class="space-y-2">
              <UInput 
                v-model="form.password" 
                type="password" 
                placeholder="Enter your password"
                :disabled="loading"
                class="w-full"
                size="lg"
              />
            </div>

            <div class="space-y-3">
              <UButton 
                type="submit" 
                block 
                size="lg"
                :loading="loading"
                :disabled="loading"
              >
                Sign In
              </UButton>

              <UButton 
                block
                variant="ghost"
                color="neutral"
                size="sm"
                @click.prevent="usePassword = false"
              >
                ← Back to Magic Link
              </UButton>
            </div>
          </template>
          
          <!-- Magic Link Mode -->
          <template v-else>
            <div class="space-y-3">
              <UButton 
                block 
                variant="solid" 
                size="lg"
                :loading="magicLinkLoading"
                :disabled="loading || magicLinkLoading || !emailIsValid"
                @click.prevent="sendMagicLink"
              >
                <UIcon name="i-lucide-mail" class="mr-2 size-4" />
                Send Magic Link
              </UButton>

              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-default" />
                </div>
                <div class="relative flex justify-center text-xs">
                  <span class="bg-default px-2 text-muted uppercase tracking-wide">or</span>
                </div>
              </div>

              <UButton 
                block 
                variant="outline" 
                color="neutral"
                size="lg"
                :disabled="loading || magicLinkLoading"
                @click.prevent="usePassword = true"
              >
                Continue with Password
              </UButton>
            </div>
          </template>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { z } from 'zod'

definePageMeta({
  layout: false,
  auth: false
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Reactive state
const loading = ref(false)
const magicLinkLoading = ref(false)
const error = ref('')
const message = ref('')
const usePassword = ref(false)

const form = reactive({
  email: '',
  password: ''
})

// Validation schema
const baseSchema = z.object({
  email: z.string().email('Invalid email')
})

const passwordSchema = baseSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const currentSchema = computed(() => (usePassword.value ? passwordSchema : baseSchema))

const emailIsValid = computed(() => baseSchema.safeParse({ email: form.email }).success)

// Redirect if already logged in
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/dashboard')
  }
}, { immediate: true })

// Handle form submission
async function handleSubmit(event) {
  try {
    loading.value = true
    error.value = ''
    message.value = ''

    const { email, password } = event.data

    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.error) {
      throw result.error
    }
  } catch (err) {
    console.error('Auth error:', err)
    error.value = err.message || 'An error occurred during authentication'
  } finally {
    loading.value = false
  }
}

// Send magic link
async function sendMagicLink() {
  if (!form.email) {
    error.value = 'Please enter your email address'
    return
  }
  // Client-side format validation
  if (!emailIsValid.value) {
    error.value = 'Invalid email format'
    return
  }

  try {
    magicLinkLoading.value = true
    error.value = ''
    message.value = ''

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (magicError) {
      throw magicError
    }

    message.value = 'Magic link sent! Check your email.'
  } catch (err) {
    console.error('Magic link error:', err)
    error.value = err.message || 'Failed to send magic link'
  } finally {
    magicLinkLoading.value = false
  }
}
</script> 