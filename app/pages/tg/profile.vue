<template>
  <div class="tg-fade-in px-4 pt-4">
    <div class="flex items-center gap-3 mb-4">
      <button type="button" class="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style="background: var(--tg-sec-bg);" @click="navigateTo('/tg')">
        <Icon name="lucide:arrow-right" size="20" style="color: var(--tg-text);" />
      </button>
      <h1 class="text-[17px] font-bold" style="color: var(--tg-text);">پروفایل</h1>
    </div>

    <div v-if="loading" class="tg-empty" style="min-height: 40vh;">
      <div class="w-8 h-8 rounded-full" style="border: 3px solid var(--tg-sec-bg); border-top-color: var(--tg-btn); animation: spin 0.8s linear infinite;"/>
    </div>

    <template v-else>
      <div class="tg-card mb-4 flex items-center gap-3">
        <div class="flex items-center justify-center w-12 h-12 rounded-full font-bold" style="background: color-mix(in srgb, var(--tg-btn) 14%, transparent); color: var(--tg-btn);">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-[15px] truncate" style="color: var(--tg-text);">{{ auth.user.value?.fullName || 'کاربر' }}</p>
          <p class="text-xs mt-0.5" style="color: var(--tg-hint);">{{ auth.user.value?.phone || '' }}</p>
        </div>
        <span class="tg-badge" :class="telegramLinked ? 'tg-badge-confirmed' : 'tg-badge-pending'">
          {{ telegramLinked ? 'متصل به تلگرام' : 'تلگرام متصل نیست' }}
        </span>
      </div>

      <div class="tg-card mb-4">
        <p class="text-[13px] leading-relaxed" style="color: var(--tg-hint);">
          {{ telegramLinked
            ? 'حساب تلگرام شما به این پروفایل متصل است و ورود خودکار فعال است.'
            : 'برای ورود خودکار از طریق تلگرام، در وب‌سایت کلینیک و از بخش پروفایل، حساب خود را به تلگرام متصل کنید.' }}
        </p>
      </div>

      <div class="tg-card space-y-4">
        <div v-if="!patient">
          <p class="text-[14px] font-bold mb-1" style="color: var(--tg-text);">تکمیل پرونده بیمار</p>
          <p class="text-xs mb-4" style="color: var(--tg-hint);">برای رزرو نوبت، این اطلاعات الزامی است.</p>
        </div>

        <div>
          <label class="tg-field-label">کد ملی <span style="color: var(--tg-destructive);">*</span></label>
          <input v-model="form.nationalId" type="tel" inputmode="numeric" maxlength="10" class="tg-input" placeholder="۱۰ رقم" dir="rtl" >
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="tg-field-label">نام</label>
            <input v-model="form.firstName" type="text" class="tg-input" placeholder="نام" dir="rtl" >
          </div>
          <div>
            <label class="tg-field-label">نام خانوادگی</label>
            <input v-model="form.lastName" type="text" class="tg-input" placeholder="نام خانوادگی" dir="rtl" >
          </div>
        </div>
        <div>
          <label class="tg-field-label">شماره موبایل</label>
          <input v-model="form.phone" type="tel" inputmode="numeric" maxlength="11" class="tg-input" placeholder="09123456789" dir="rtl" >
        </div>
        <div>
          <label class="tg-field-label">تاریخ تولد (اختیاری)</label>
          <input v-model="form.birthDate" type="date" class="tg-input" dir="rtl" >
        </div>
        <div>
          <label class="tg-field-label">آدرس (اختیاری)</label>
          <textarea v-model="form.address" rows="2" class="tg-input" style="resize: none;" placeholder="آدرس محل سکونت" dir="rtl"/>
        </div>

        <p v-if="error" class="text-[13px] font-semibold" style="color: var(--tg-destructive);">{{ error }}</p>

        <button type="button" class="tg-btn tg-btn-primary" :disabled="saving || !form.nationalId" @click="save">
          <span v-if="saving" class="w-4 h-4 rounded-full" style="border: 2px solid rgba(255,255,255,0.35); border-top-color: white; animation: spin 0.8s linear infinite;"/>
          <span>{{ saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات' }}</span>
        </button>
      </div>

      <button type="button" class="tg-btn tg-btn-ghost mt-4" style="color: var(--tg-destructive); background: transparent;" @click="logout">
        خروج از حساب
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useMiniAppAuth } from '~/composables/useMiniAppAuth'

definePageMeta({ layout: 'tg' })

const auth = useMiniAppAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const patient = ref<any>(null)
const telegramLinked = ref(false)

const form = reactive({
  nationalId: '',
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  address: '',
})

const initials = computed(() => (auth.user.value?.fullName || 'کاربر').trim().slice(0, 2))

const load = async () => {
  auth.hydrate()
  if (!auth.isAuthenticated.value) {
    navigateTo('/tg')
    return
  }
  try {
    const [profile, status] = await Promise.all([
      auth.api<any>('/api/miniapp/profile', { method: 'GET' }),
      auth.api<any>('/api/miniapp/auth/status', { method: 'GET' }),
    ])
    telegramLinked.value = status.linked
    patient.value = profile.patient
    if (patient.value) {
      form.nationalId = patient.value.nationalId || ''
      form.firstName = patient.value.firstName || ''
      form.lastName = patient.value.lastName || ''
      form.birthDate = patient.value.birthDate || ''
      form.address = patient.value.address || ''
      form.phone = patient.value.phone || ''
    } else {
      form.phone = ''
    }
  } catch {
    error.value = 'خطا در دریافت اطلاعات'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  error.value = ''
  if (!/^\d{10}$/.test(form.nationalId)) {
    error.value = 'کد ملی باید ۱۰ رقم باشد'
    return
  }
  if (form.phone && !/^09\d{9}$/.test(form.phone)) {
    error.value = 'شماره موبایل معتبر نیست'
    return
  }
  saving.value = true
  try {
    const res = await auth.api<any>('/api/miniapp/profile', {
      method: 'PUT',
      body: {
        nationalId: form.nationalId,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        birthDate: form.birthDate || null,
        address: form.address || undefined,
      },
    })
    if (res.token && res.user) {
      auth.refreshToken(res.token, res.user)
    }
    patient.value = res.patient
    useNuxtApp().$toast.success('اطلاعات با موفقیت ذخیره شد')
  } catch (err: any) {
    error.value = err?.data?.error || 'خطا در ذخیره اطلاعات'
  } finally {
    saving.value = false
  }
}

const logout = () => {
  auth.logout()
  navigateTo('/tg')
}

onMounted(load)

useHead({ title: 'پروفایل' })
</script>
