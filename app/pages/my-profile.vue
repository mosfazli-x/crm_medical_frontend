<template>
  <div class="!mx-auto !max-w-5xl !px-4 !py-10 md:!px-8 !min-h-screen !bg-slate-50/50 dark:!bg-slate-900">
    <header class="!mb-10 !flex !flex-col !gap-2">
      <h1 class="!text-3xl md:!text-4xl !font-extrabold !text-slate-900 dark:!text-white !tracking-tight">
        پروفایل من
      </h1>
      <p class="!text-sm md:!text-base !font-medium !text-slate-500 dark:!text-slate-400">
        مدیریت اطلاعات و تنظیمات امنیتی حساب کاربری شما
      </p>
    </header>

    <div
      class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !p-6 md:!p-8 !shadow-sm hover:!shadow-md !transition-shadow !duration-300 !mb-8">
      <div class="!flex !items-center !gap-6">
        <div
          class="!w-20 !h-20 !rounded-full !bg-gradient-to-tr !from-blue-600 !to-indigo-500 !p-1 !shadow-md !shrink-0">
          <div class="!w-full !h-full !rounded-full !bg-white dark:!bg-slate-900 !flex !items-center !justify-center">
            <span class="!text-3xl !font-bold !text-blue-600 dark:!text-blue-400">{{ userInitial }}</span>
          </div>
        </div>

        <div class="!flex !flex-col !min-w-0 !gap-1.5">
          <h2 class="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100 !truncate">
            {{ userData?.fullName || 'کاربر گرامی' }}
          </h2>
          <div class="!flex !items-center !gap-3 !text-sm">
            <v-chip size="small" color="primary" variant="flat" class="!font-bold !px-3">
              {{ roleLabel }}
            </v-chip>
            <span class="!text-slate-500 dark:!text-slate-400 !font-medium" dir="ltr">
              {{ userData?.phone }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="!grid !grid-cols-1 lg:!grid-cols-2 !gap-8">

      <div
        class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
          <div class="!flex !items-center !gap-3">
            <v-icon color="primary" size="x-large">mdi-account-details-outline</v-icon>
            <div>
              <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">اطلاعات هویتی</h2>
              <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">مشخصات فردی و سازمانی خود را ویرایش کنید
              </p>
            </div>
          </div>
        </div>

        <div class="!p-8">
          <v-form ref="profileFormRef" @submit.prevent="handleUpdateProfile">
            <v-text-field v-model="profileForm.fullName" label="نام و نام خانوادگی" variant="outlined"
              density="comfortable" prepend-inner-icon="mdi-account-edit-outline"
              :rules="[v => !v || v.length >= 2 || 'حداقل ۲ کاراکتر الزامی است']" class="!mb-2" dir="rtl" clearable />

            <v-text-field v-if="isLabOrPharmacy" v-model="profileForm.organizationName" label="نام سازمان / مرکز درمانی"
              variant="outlined" density="comfortable" prepend-inner-icon="mdi-domain"
              :rules="[v => !v || v.length >= 1 || 'حداقل ۱ کاراکتر الزامی است']" class="!mb-2" dir="rtl" clearable />

            <div class="!mb-6">
              <label class="!text-sm !font-semibold !text-slate-600 dark:!text-slate-300 !mb-2 !block">شماره موبایل (نام
                کاربری)</label>
              <div
                class="!flex !items-center !gap-4 !px-5 !py-4 !rounded-xl !bg-slate-100 dark:!bg-slate-900/50 !border !border-slate-200 dark:!border-slate-700">
                <v-icon class="!text-slate-500">mdi-cellphone</v-icon>
                <span dir="ltr" class="!text-base !font-bold !text-slate-800 dark:!text-slate-200 !tracking-widest">
                  {{ userData?.phone || '---' }}
                </span>
                <v-tooltip text="برای تغییر شماره با پشتیبانی تماس بگیرید" location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip v-bind="props" size="small" color="grey" variant="tonal"
                      class="!mr-auto !text-xs !font-bold !cursor-help">
                      <v-icon start icon="mdi-lock-outline" size="small"></v-icon>
                      غیرقابل تغییر
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </div>

            <v-btn type="submit" color="primary" size="x-large" block elevation="2" :loading="profileLoading"
              class="!font-bold !tracking-wide !rounded-xl !mt-2">
              <v-icon start>mdi-check-circle-outline</v-icon>
              ثبت تغییرات پروفایل
            </v-btn>
          </v-form>
        </div>
      </div>

      <div
        class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
          <div class="!flex !items-center !gap-3">
            <v-icon color="error" size="x-large">mdi-shield-lock-outline</v-icon>
            <div>
              <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">امنیت و رمز عبور</h2>
              <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">رمز عبور قوی حداقل شامل ۸ کاراکتر است</p>
            </div>
          </div>
        </div>

        <div class="!p-8">
          <v-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
            <v-text-field v-model="passwordForm.currentPassword" label="رمز عبور فعلی"
              :type="showCurrentPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
              :rules="[v => !!v || 'وارد کردن رمز عبور فعلی الزامی است']" class="ltr-field !mb-2" />

            <v-text-field v-model="passwordForm.newPassword" label="رمز عبور جدید"
              :type="showNewPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-plus-outline"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPassword = !showNewPassword" :rules="[
                v => !!v || 'رمز عبور جدید الزامی است',
                v => (v && v.length >= 8) || 'رمز عبور باید حداقل ۸ کاراکتر باشد'
              ]" class="ltr-field !mb-2" />

            <v-text-field v-model="passwordForm.confirmPassword" label="تکرار رمز عبور جدید"
              :type="showConfirmPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword" :rules="[
                v => !!v || 'تکرار رمز عبور الزامی است',
                v => v === passwordForm.newPassword || 'رمز عبور وارد شده مطابقت ندارد'
              ]" class="ltr-field !mb-6" />

            <v-btn type="submit" color="error" size="x-large" block elevation="2" variant="flat"
              :loading="passwordLoading" class="!font-bold !tracking-wide !rounded-xl">
              <v-icon start>mdi-key-variant</v-icon>
              تغییر رمز عبور
            </v-btn>
          </v-form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// -- کامپوزبل‌ها (با فرض وجود در پروژه شما) --
const { apiFetch } = useApi()
const { user: authUser } = useAuth()
const toast = useNuxtApp().$toast

// -- متغیرهای ری‌اکتیو --
const userData = computed(() => authUser.value)

const profileFormRef = ref<any>(null)
const passwordFormRef = ref<any>(null)

const profileLoading = ref(false)
const passwordLoading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({
  fullName: '',
  organizationName: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// -- لاجیک و Computed ها --
const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin_doctor: 'مدیر کلینیک',
    doctor: 'پزشک',
    pharmacy: 'مسئول داروخانه',
    lab: 'آزمایشگاه',
    patient: 'بیمار',
  }
  return roles[userData.value?.role] || 'کاربر سیستم'
})

const userInitial = computed(() => {
  return userData.value?.fullName?.charAt(0) || 'U'
})

const isLabOrPharmacy = computed(() => {
  const role = userData.value?.role
  return role === 'lab' || role === 'pharmacy'
})

onMounted(() => {
  if (userData.value) {
    profileForm.fullName = userData.value.fullName || ''
    profileForm.organizationName = userData.value.organizationName || ''
  }
})

// -- توابع هندلر --
async function handleUpdateProfile() {
  const form = profileFormRef.value
  if (!form) return

  const { valid } = await form.validate()
  if (!valid) return

  profileLoading.value = true
  try {
    const body: Record<string, string> = {}

    if (profileForm.fullName && profileForm.fullName !== userData.value?.fullName) {
      body.fullName = profileForm.fullName
    }
    if (isLabOrPharmacy.value && profileForm.organizationName !== undefined && profileForm.organizationName !== userData.value?.organizationName) {
      body.organizationName = profileForm.organizationName
    }

    if (!Object.keys(body).length) {
      toast.info('هیچ تغییری برای ذخیره وجود ندارد.')
      return
    }

    const res: any = await apiFetch('/api/auth/profile', {
      method: 'PATCH',
      body,
    })

    if (res.success) {
      authUser.value = res.user
      toast.success(res.message || 'پروفایل با موفقیت به‌روزرسانی شد.')
    }
  } catch (err: any) {
    const msg = err?.data?.error || 'خطا در به‌روزرسانی اطلاعات پروفایل.'
    toast.error(msg)
  } finally {
    profileLoading.value = false
  }
}

async function handleChangePassword() {
  const form = passwordFormRef.value
  if (!form) return

  const { valid } = await form.validate()
  if (!valid) return

  passwordLoading.value = true
  try {
    const res: any = await apiFetch('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    })

    if (res.success) {
      toast.success(res.message || 'رمز عبور شما با موفقیت تغییر یافت.')

      // پاک کردن فرم پس از موفقیت
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordFormRef.value?.resetValidation()

      showCurrentPassword.value = false
      showNewPassword.value = false
      showConfirmPassword.value = false
    }
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      toast.error('رمز عبور فعلی اشتباه است.')
    } else {
      toast.error(err?.data?.error || 'مشکلی در تغییر رمز عبور رخ داد.')
    }
  } finally {
    passwordLoading.value = false
  }
}

// -- تنظیمات سئو و متا --
useSeoMeta({
  title: 'پروفایل من | سیستم مدیریت',
  ogTitle: 'پروفایل من',
})

definePageMeta({
  // Auth is handled globally by auth.global.ts middleware
})
</script>

<style scoped>
/* استفاده از important برای غلبه بر استایل‌های داخلی Vuetify */
:deep(.ltr-field .v-field__input) {
  text-align: left !important;
  direction: ltr !important;
  font-family: ui-sans-serif, system-ui, sans-serif !important;
  /* بهتر است پسوردها فونت استاندارد انگلیسی داشته باشند */
  letter-spacing: 0.05em !important;
}

:deep(.ltr-field ::placeholder) {
  text-align: right !important;
  /* راست‌چین نگه داشتن placeholder در فرم‌های چپ‌چین */
  direction: rtl !important;
  opacity: 0.6 !important;
  font-family: inherit !important;
  letter-spacing: normal !important;
}

:deep(.v-field--disabled .v-field__input) {
  opacity: 0.6 !important;
}

/* نرم کردن فوکوس اینپوت‌های Vuetify برای ظاهر مدرن‌تر */
:deep(.v-field--active) {
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.1) !important;
  transition: box-shadow 0.2s ease-in-out !important;
}
</style>