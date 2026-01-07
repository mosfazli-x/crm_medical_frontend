<template>
  <v-locale-provider rtl>
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-2" dir="rtl">
      <!-- سمت راست: فرم ثبت‌نام اولیه -->
      <div class="flex items-center justify-center bg-gray-50 px-6!">
        <Transition name="fade">
          <div class="bg-white rounded-3xl shadow-2xl p-10! max-w-md w-full">
            <div class="text-center mb-10">
              <h2 class="text-3xl font-bold text-slate-800">ثبت‌نام اولیه</h2>
              <p class="text-slate-600 mt-3">اگر تاکنون حسابی ندارید، می‌توانید از این طریق حساب جدید بسازید</p>
            </div>

            <v-form @submit.prevent="handleRegister" class="space-y-6">
              <!-- فیلد شماره تلفن -->
              <v-text-field v-model="phone" label="شماره تلفن" type="tel" variant="outlined" density="comfortable" placeholder="09123456789" class="ltr-field" prepend-inner-icon="mdi-phone-outline" required />

              <!-- فیلد نام کامل -->
              <v-text-field v-model="fullName" label="نام کامل" variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-outline" class="text-end" dir="rtl" required />

              <!-- فیلد انتخاب نقش — حرفه‌ای و هماهنگ با بقیه فیلدها -->
              <v-select v-model="role" label="نقش شما" :items="roleItems" variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-group-outline" required class="text-end" dir="rtl" />

              <!-- فیلد رمز عبور -->
              <v-text-field v-model="password" label="رمز عبور" :type="showPassword ? 'text' : 'password'" variant="outlined" density="comfortable" class="ltr-field" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword" required />

              <!-- دکمه ثبت‌نام -->
              <v-btn type="submit" variant="elevated" color="teal" size="x-large" block :loading="loading" class="font-semibold">
                ساخت حساب
              </v-btn>
            </v-form>

            <div class="text-center mt-8 text-sm text-slate-600">
              قبلاً حساب دارید؟
              <nuxt-link to="/auth/login" class="text-teal-600 font-medium hover:underline">
                ورود
              </nuxt-link>
            </div>
          </div>
        </Transition>
      </div>

      <!-- سمت چپ: Illustration پزشکی -->
      <div class="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-700 text-white p-12!">
        <div class="text-center max-w-lg">
          <h1 class="text-5xl font-bold mb-6">خوش آمدید به کلینیک</h1>
          <p class="text-xl opacity-90">حساب کاربری جدید بسازید</p>
          <!-- لوگو کلینیک -->
          <div class="mt-12">
            <div class="bg-white/20 backdrop-blur rounded-3xl w-80 h-80 mx-auto p-6!">
              <ClinicLogo class="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-locale-provider>
</template>

<script setup lang="ts">
import ClinicLogo from '~/components/icons/ClinicLogo.vue'
import { useAuth } from '~/composables/useAuth'

const { register } = useAuth()

const phone = ref('')
const fullName = ref('')
const password = ref('')
const role = ref<'doctor' | 'lab' | 'pharmacy' | 'patient'>('doctor') // پیش‌فرض پزشک
const loading = ref(false)
const showPassword = ref(false)

// لیست نقش‌ها — نمایش فارسی، مقدار انگلیسی (برای بک‌اند)
const roleItems = [
  { title: 'پزشک', value: 'doctor' },
  { title: 'آزمایشگاه', value: 'lab' },
  { title: 'داروخانه', value: 'pharmacy' },
  { title: 'بیمار', value: 'patient' },
]

const handleRegister = async () => {
  loading.value = true
  await register({
    phone: phone.value,
    fullName: fullName.value,
    password: password.value,
    role: role.value,
  })
  loading.value = false
}

useSeoMeta({
  title: 'ثبت‌نام',
})
definePageMeta({
  layout: false,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.ltr-field .v-field__input) {
  text-align: left !important;
}

:deep(.ltr-field ::placeholder) {
  text-align: left !important;
  direction: ltr;
  opacity: 0.7;
}
</style>