<template>
  <div class="space-y-6 p-4 sm:p-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Credentials</h1>
      <p class="text-muted-foreground mt-2">Configure external service credentials</p>
    </div>

    <UCard class="max-w-2xl mx-auto">
      <UForm :state="form" @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UFormGroup label="AWS Access Key">
            <UInput
              :type="showPlain ? 'text' : 'password'"
              v-model="form.aws_access_key"
              :placeholder="existing.aws_access_key && !showPlain ? '********' : ''"
              class="w-full"
            />
          </UFormGroup>

          <UFormGroup label="AWS Secret Key">
            <UInput
              :type="showPlain ? 'text' : 'password'"
              v-model="form.aws_secret_key"
              :placeholder="existing.aws_secret_key && !showPlain ? '********' : ''"
              class="w-full"
            />
          </UFormGroup>

          <UFormGroup label="Mongo Username">
            <UInput
              :type="showPlain ? 'text' : 'password'"
              v-model="form.mongo_username"
              :placeholder="existing.mongo_username && !showPlain ? '********' : ''"
              class="w-full"
            />
          </UFormGroup>

          <UFormGroup label="Mongo Password">
            <UInput
              :type="showPlain ? 'text' : 'password'"
              v-model="form.mongo_password"
              :placeholder="existing.mongo_password && !showPlain ? '********' : ''"
              class="w-full"
            />
          </UFormGroup>
        </div>

        <div class="flex justify-between items-center">
          <UButton
            v-if="canView"
            @click.prevent="toggleView"
            variant="outline"
            :label="showPlain ? 'Hide' : 'View'"
          />
          <UButton type="submit" color="primary">Save</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
const { apiRequest } = useApi();
const mainStore = useMainStore();

const form = reactive({
  aws_access_key: '',
  aws_secret_key: '',
  mongo_username: '',
  mongo_password: ''
});

const existing = reactive({
  aws_access_key: false,
  aws_secret_key: false,
  mongo_username: false,
  mongo_password: false
});

const showPlain = ref(false);
const canView = computed(() => mainStore.permissions.includes('CREDENTIALS_VIEW'));

const fetchCredentials = async () => {
  const { data } = await apiRequest('/api/internal/credentials');
  if (data) {
    existing.aws_access_key = !!data.aws_access_key;
    existing.aws_secret_key = !!data.aws_secret_key;
    existing.mongo_username = !!data.mongo_username;
    existing.mongo_password = !!data.mongo_password;
    form.aws_access_key = '';
    form.aws_secret_key = '';
    form.mongo_username = '';
    form.mongo_password = '';
    showPlain.value = false;
  }
};

const fetchPlainCredentials = async () => {
  const { data } = await apiRequest('/api/internal/credentials?plain=true');
  if (data) {
    form.aws_access_key = data.aws_access_key || '';
    form.aws_secret_key = data.aws_secret_key || '';
    form.mongo_username = data.mongo_username || '';
    form.mongo_password = data.mongo_password || '';
    existing.aws_access_key = !!data.aws_access_key;
    existing.aws_secret_key = !!data.aws_secret_key;
    existing.mongo_username = !!data.mongo_username;
    existing.mongo_password = !!data.mongo_password;
    showPlain.value = true;
  }
};

const toggleView = async () => {
  if (showPlain.value) {
    await fetchCredentials();
  } else if (canView.value) {
    await fetchPlainCredentials();
  }
};

const handleSubmit = async () => {
  const payload = {};
  if (form.aws_access_key || !existing.aws_access_key) payload.aws_access_key = form.aws_access_key;
  if (form.aws_secret_key || !existing.aws_secret_key) payload.aws_secret_key = form.aws_secret_key;
  if (form.mongo_username || !existing.mongo_username) payload.mongo_username = form.mongo_username;
  if (form.mongo_password || !existing.mongo_password) payload.mongo_password = form.mongo_password;
  await apiRequest('/api/internal/credentials', {
    method: 'PUT',
    body: payload,
    showSuccessToast: true,
    successMessage: 'Credentials saved'
  });
  await fetchCredentials();
};

onMounted(async () => {
  if (!mainStore.permissions.length) await mainStore.fetchPermissions();
  await fetchCredentials();
});
</script>
