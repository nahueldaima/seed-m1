<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Credentials</h1>
      <p class="text-muted-foreground mt-2">Configure external service credentials</p>
    </div>

    <UCard>
      <UForm :state="form" @submit.prevent="handleSubmit">
        <UFormGroup label="AWS Access Key" class="mb-4">
          <div class="flex items-center space-x-2">
            <UInput
              :type="showPlain ? 'text' : 'password'"
              v-model="form.aws_access_key"
              :placeholder="existing.aws_access_key && !showPlain ? '********' : ''"
            />
          </div>
        </UFormGroup>

        <UFormGroup label="AWS Secret Key" class="mb-4">
          <UInput
            :type="showPlain ? 'text' : 'password'"
            v-model="form.aws_secret_key"
            :placeholder="existing.aws_secret_key && !showPlain ? '********' : ''"
          />
        </UFormGroup>

        <UFormGroup label="Mongo Username" class="mb-4">
          <UInput
            :type="showPlain ? 'text' : 'password'"
            v-model="form.mongo_username"
            :placeholder="existing.mongo_username && !showPlain ? '********' : ''"
          />
        </UFormGroup>

        <UFormGroup label="Mongo Password" class="mb-4">
          <UInput
            :type="showPlain ? 'text' : 'password'"
            v-model="form.mongo_password"
            :placeholder="existing.mongo_password && !showPlain ? '********' : ''"
          />
        </UFormGroup>

        <div class="flex justify-between items-center">
          <UButton
            v-if="canView"
            @click.prevent="toggleView"
            variant="ghost"
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
