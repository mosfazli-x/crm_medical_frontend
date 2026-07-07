<template>
  <UiAuthLayout
    title="ورود به سیستم"
    subtitle="اطلاعات خود را وارد کنید"
    hero-title="سیستم مدیریت کلینیک"
    hero-subtitle="مدیریت هوشمند بیماران، ویزیت‌ها و پرونده‌های پزشکی"
  >
    <v-form @submit.prevent="handleLogin" class="space-y-5">
      <v-text-field
        v-model="phone"
        label="شماره تلفن"
        type="tel"
        variant="outlined"
        density="comfortable"
        placeholder="09123456789"
        class="ltr-field"
        prepend-inner-icon="mdi-phone-outline"
        required
      />

      <v-text-field
        v-model="password"
        label="رمز عبور"
        :type="showPassword ? 'text' : 'password'"
        variant="outlined"
        density="comfortable"
        class="ltr-field"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        required
      />

      <div class="text-left pb-1">
        <NuxtLink to="/auth/forgot-password" class="text-sm text-electric-sapphire font-medium hover:underline">
          رمز عبور را فراموش کرده‌اید؟
        </NuxtLink>
      </div>

      <v-btn type="submit" color="#5465ff" size="x-large" block :loading="loading" class="crm-btn-accent rounded-xl! h-12!">
        ورود
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
      اولین بار است؟
      <NuxtLink to="/auth/register" class="text-electric-sapphire font-medium hover:underline">ثبت‌نام اولیه</NuxtLink>
    </div>
  </UiAuthLayout>
</template>

<script setup lang="ts">
const { login } = useAuth()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  await login({ phone: phone.value, password: password.value })
  loading.value = false
}

useSeoMeta({ title: 'ورود به سیستم' })
definePageMeta({ layout: false })
</script>
