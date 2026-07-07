<template>
  <UiAuthLayout
    title="فراموشی رمز عبور"
    subtitle="شماره تلفن خود را وارد کنید"
    hero-title="بازیابی رمز عبور"
    hero-subtitle="کد تایید به شماره شما ارسال خواهد شد"
  >
    <v-form @submit.prevent="handleForgotPassword" class="space-y-5">
      <v-text-field v-model="phone" label="شماره تلفن" type="tel" variant="outlined"
        density="comfortable" placeholder="09123456789" class="ltr-field"
        prepend-inner-icon="mdi-phone-outline" :rules="phoneRules" required />

      <v-btn type="submit" color="#5465ff" size="x-large" block :loading="loading"
        class="crm-btn-accent rounded-xl! h-12!">
        ارسال کد تایید
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
      رمز عبور خود را به یاد دارید؟
      <NuxtLink to="/auth/login" class="text-electric-sapphire font-medium hover:underline">ورود</NuxtLink>
    </div>
  </UiAuthLayout>
</template>

<script setup lang="ts">
const phone = ref('')
const loading = ref(false)
const phoneRules = [
  (v: string) => /^09\d{9}$/.test(v) || 'شماره تلفن معتبر نیست (مثال: 09123456789)',
]

const handleForgotPassword = async () => {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { phone: phone.value },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    useNuxtApp().$toast.success('در صورت وجود حساب، کد تایید ارسال شد.')
    await navigateTo(`/auth/reset-password?phone=${encodeURIComponent(phone.value)}`)
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 429) {
      useNuxtApp().$toast.error('تعداد درخواست‌ها بیش از حد مجاز است. ۱۰ دقیقه بعد تلاش کنید')
    } else {
      useNuxtApp().$toast.error('خطا در ارسال کد. بعداً تلاش کنید')
    }
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'فراموشی رمز عبور' })
definePageMeta({ layout: false })
</script>
