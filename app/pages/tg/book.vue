<template>
  <div class="tg-fade-in px-4 pt-4">
    <div class="flex items-center gap-3 mb-4">
      <button type="button" class="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style="background: var(--tg-sec-bg);" @click="goBack">
        <Icon name="lucide:arrow-right" size="20" style="color: var(--tg-text);" />
      </button>
      <div class="flex-1">
        <h1 class="text-[17px] font-bold" style="color: var(--tg-text);">{{ stepTitle }}</h1>
        <div class="tg-progress-track mt-2">
          <div class="tg-progress-bar" :style="{ width: `${((step - 1) / 4) * 100}%` }"/>
        </div>
      </div>
    </div>

    <div v-if="step === 5 && success" class="tg-pop text-center py-10">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5" style="background: color-mix(in srgb, var(--tg-btn) 14%, transparent);">
        <Icon name="lucide:check-circle-2" size="52" style="color: var(--tg-btn);" />
      </div>
      <h2 class="text-[20px] font-black mb-1" style="color: var(--tg-text);">نوبت شما ثبت شد</h2>
      <p class="text-sm mb-6" style="color: var(--tg-hint);">جزئیات نوبت برای شما نمایش داده می‌شود.</p>
      <div class="tg-card text-right mb-5">
        <div class="flex justify-between py-1.5 text-[14px]">
          <span style="color: var(--tg-hint);">پزشک</span>
          <span class="font-bold">{{ booked.doctorName }}</span>
        </div>
        <div class="flex justify-between py-1.5 text-[14px]">
          <span style="color: var(--tg-hint);">خدمت</span>
          <span class="font-bold">{{ booked.visitTypeName || 'ویزیت' }}</span>
        </div>
        <div class="flex justify-between py-1.5 text-[14px]">
          <span style="color: var(--tg-hint);">تاریخ</span>
          <span class="font-bold">{{ formatJalali(booked.appointmentDate) }}</span>
        </div>
        <div class="flex justify-between py-1.5 text-[14px]">
          <span style="color: var(--tg-hint);">ساعت</span>
          <span class="font-bold">{{ booked.startTime }} - {{ booked.endTime }}</span>
        </div>
      </div>
      <div class="flex gap-3">
        <NuxtLink to="/tg/appointments" class="tg-btn tg-btn-primary">مشاهده نوبت‌ها</NuxtLink>
        <button type="button" class="tg-btn tg-btn-ghost" style="width: auto; padding: 14px 20px;" @click="reset">رزرو مجدد</button>
      </div>
    </div>

    <template v-else>
      <div v-if="step === 1" class="space-y-3">
        <p class="text-sm font-semibold" style="color: var(--tg-hint);">نوع خدمت مورد نظر خود را انتخاب کنید</p>
        <button
          v-for="group in serviceGroups"
          :key="group.name"
          type="button"
          class="tg-card w-full text-right"
          :style="{ borderColor: selectedService === group.name ? 'var(--tg-btn)' : 'var(--tg-border)', background: selectedService === group.name ? 'color-mix(in srgb, var(--tg-btn) 6%, var(--tg-section-bg))' : undefined }"
          @click="selectService(group.name)"
        >
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style="background: color-mix(in srgb, var(--tg-btn) 12%, transparent);">
              <Icon name="lucide:stethoscope" size="24" style="color: var(--tg-btn);" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[15px]" style="color: var(--tg-text);">{{ group.name }}</p>
              <p class="text-xs mt-0.5" style="color: var(--tg-hint);">{{ group.doctors.length }} پزشک</p>
            </div>
            <Icon name="lucide:chevron-left" size="22" style="color: var(--tg-hint);" />
          </div>
        </button>
      </div>

      <div v-else-if="step === 2" class="space-y-3">
        <p class="text-sm font-semibold" style="color: var(--tg-hint);">{{ selectedService }} — انتخاب پزشک</p>
        <button
          v-for="doc in doctorsOfService"
          :key="doc.doctorId"
          type="button"
          class="tg-card w-full text-right"
          @click="selectDoctor(doc)"
        >
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-11 h-11 rounded-full shrink-0 font-bold" style="background: color-mix(in srgb, var(--tg-btn) 14%, transparent); color: var(--tg-btn);">
              {{ (doc.doctorName || 'د').slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[15px]" style="color: var(--tg-text);">{{ doc.doctorName }}</p>
              <p class="text-xs mt-0.5" style="color: var(--tg-hint);">
                {{ doc.durationMinutes }} دقیقه
                <template v-if="doc.price"> · {{ Number(doc.price).toLocaleString('fa-IR') }} تومان</template>
              </p>
            </div>
            <Icon name="lucide:chevron-left" size="22" style="color: var(--tg-hint);" />
          </div>
        </button>
      </div>

      <div v-else-if="step === 3">
        <p class="text-sm font-semibold mb-3" style="color: var(--tg-hint);">تاریخ مراجعه</p>
        <div class="tg-card">
          <TgDatePicker v-model="selectedDate" :min-date="todayStr" />
        </div>
        <div class="mt-4 flex gap-3">
          <button type="button" class="tg-btn tg-btn-ghost" style="width: auto; padding: 14px 22px;" @click="step--">بازگشت</button>
          <button type="button" class="tg-btn tg-btn-primary" :disabled="!selectedDate" @click="step = 4">ادامه</button>
        </div>
      </div>

      <div v-else-if="step === 4">
        <p class="text-sm font-semibold mb-1" style="color: var(--tg-hint);">انتخاب ساعت</p>
        <p class="text-[13px] font-bold mb-3" style="color: var(--tg-text);">{{ formatJalali(selectedDate) }}</p>
        <div v-if="loadingSlots" class="tg-empty" style="padding: 32px 20px;">
          <div class="w-8 h-8 rounded-full" style="border: 3px solid var(--tg-sec-bg); border-top-color: var(--tg-btn); animation: spin 0.8s linear infinite;"/>
        </div>
        <div v-else-if="!slots.length" class="tg-card tg-empty" style="padding: 32px 20px;">
          <Icon name="lucide:clock" size="34" style="color: var(--tg-hint);" />
          <p class="text-sm">در این روز زمانی خالی نیست</p>
          <button type="button" class="tg-btn tg-btn-ghost mt-2 text-sm" style="padding: 10px 18px; width: auto;" @click="step = 3">انتخاب روز دیگر</button>
        </div>
        <div v-else class="grid grid-cols-4 gap-2.5">
          <button
            v-for="slot in slots"
            :key="slot.startTime"
            type="button"
            class="tg-chip"
            :class="{ active: selectedSlot === slot.startTime }"
            @click="selectedSlot = slot.startTime"
          >
            {{ slot.startTime }}
          </button>
        </div>
        <div v-if="slots.length" class="mt-5">
          <button type="button" class="tg-btn tg-btn-primary" :disabled="!selectedSlot" @click="confirm">تأیید نوبت</button>
        </div>
      </div>

      <div v-else-if="step === 5 && !success">
        <p class="text-sm font-semibold mb-3" style="color: var(--tg-hint);">بررسی و تأیید نهایی</p>
        <div class="tg-card mb-4">
          <div class="flex justify-between py-2 text-[14.5px]">
            <span style="color: var(--tg-hint);">پزشک</span>
            <span class="font-bold" style="color: var(--tg-text);">{{ selectedDoctor?.doctorName }}</span>
          </div>
          <div class="tg-divider"/>
          <div class="flex justify-between py-2 text-[14.5px]">
            <span style="color: var(--tg-hint);">خدمت</span>
            <span class="font-bold" style="color: var(--tg-text);">{{ selectedService }}</span>
          </div>
          <div class="tg-divider"/>
          <div class="flex justify-between py-2 text-[14.5px]">
            <span style="color: var(--tg-hint);">تاریخ</span>
            <span class="font-bold" style="color: var(--tg-text);">{{ formatJalali(selectedDate) }}</span>
          </div>
          <div class="tg-divider"/>
          <div class="flex justify-between py-2 text-[14.5px]">
            <span style="color: var(--tg-hint);">ساعت</span>
            <span class="font-bold" style="color: var(--tg-text);">{{ selectedSlot }}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button type="button" class="tg-btn tg-btn-ghost" style="width: auto; padding: 14px 22px;" @click="step = 4">بازگشت</button>
          <button type="button" class="tg-btn tg-btn-primary" :disabled="submitting" @click="confirm">
            <span v-if="submitting" class="w-4 h-4 rounded-full" style="border: 2px solid rgba(255,255,255,0.35); border-top-color: white; animation: spin 0.8s linear infinite;"/>
            <span>{{ submitting ? 'در حال ثبت...' : 'ثبت نوبت' }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import { useTelegramApp } from '~/composables/useTelegramApp'
import { useMiniAppAuth } from '~/composables/useMiniAppAuth'

definePageMeta({ layout: 'tg' })

const { setBackButton } = useTelegramApp()
const auth = useMiniAppAuth()
const nuxtApp = useNuxtApp()

interface ServiceDoctor {
  doctorId: string
  doctorName: string
  visitTypeId: string
  name: string
  description: string | null
  durationMinutes: number
  price: string | null
  color: string | null
}
interface ServiceGroup { name: string; doctors: ServiceDoctor[] }

const step = ref(1)
const serviceGroups = ref<ServiceGroup[]>([])
const selectedService = ref('')
const selectedDoctor = ref<ServiceDoctor | null>(null)
const selectedDate = ref<string | null>(null)
const selectedSlot = ref('')
const slots = ref<{ startTime: string; endTime: string }[]>([])
const loadingSlots = ref(false)
const submitting = ref(false)
const success = ref(false)
const booked = ref<any>({})

const todayStr = moment().format('YYYY-MM-DD')

const stepTitle = computed(() =>
  ({ 1: 'انتخاب خدمت', 2: 'انتخاب پزشک', 3: 'انتخاب تاریخ', 4: 'انتخاب ساعت', 5: 'تأیید نوبت' } as Record<number, string>)[step.value] || ''
)

const doctorsOfService = computed(() => serviceGroups.value.find((g) => g.name === selectedService.value)?.doctors || [])

const formatJalali = (date: string) => moment(date, 'YYYY-MM-DD').format('jDD jMMMM jYYYY')

const loadServices = async () => {
  try {
    const res = await auth.api<any>('/api/miniapp/services', { method: 'GET' })
    serviceGroups.value = res.data || []
  } catch {
    serviceGroups.value = []
  }
}

const selectService = (name: string) => {
  selectedService.value = name
  step.value = 2
}

const selectDoctor = (doc: ServiceDoctor) => {
  selectedDoctor.value = doc
  step.value = 3
}

const loadSlots = async () => {
  if (!selectedDoctor.value || !selectedDate.value) return
  loadingSlots.value = true
  slots.value = []
  selectedSlot.value = ''
  try {
    const res = await auth.api<any>(`/api/miniapp/slots/${selectedDoctor.value.doctorId}?date=${selectedDate.value}`, { method: 'GET' })
    slots.value = res.data || []
  } catch {
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

const confirm = async () => {
  if (step.value === 4) {
    step.value = 5
    return
  }
  if (!selectedDoctor.value || !selectedDate.value || !selectedSlot.value) return
  submitting.value = true
  try {
    const slot = slots.value.find((s) => s.startTime === selectedSlot.value)
    const res = await auth.api<any>('/api/miniapp/book', {
      method: 'POST',
      body: {
        doctorId: selectedDoctor.value.doctorId,
        appointmentDate: selectedDate.value,
        startTime: selectedSlot.value,
        endTime: slot?.endTime || selectedSlot.value,
        visitTypeId: selectedDoctor.value.visitTypeId,
      },
    })
    booked.value = { ...res.appointment, doctorName: res.doctorName, visitTypeName: selectedService.value }
    success.value = true
    step.value = 5
  } catch (err: any) {
    nuxtApp.$toast.error(err?.data?.error || 'ثبت نوبت با خطا مواجه شد')
    await loadSlots()
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  if (success.value) {
    navigateTo('/tg')
    return
  }
  if (step.value === 1) {
    navigateTo('/tg')
    return
  }
  step.value--
}

const reset = () => {
  step.value = 1
  success.value = false
  selectedService.value = ''
  selectedDoctor.value = null
  selectedDate.value = null
  selectedSlot.value = ''
  slots.value = []
  booked.value = {}
}

watch(selectedDate, (v) => {
  if (v) {
    selectedSlot.value = ''
    loadSlots()
  }
})

onMounted(() => {
  auth.hydrate()
  if (!auth.isAuthenticated.value) {
    navigateTo('/tg')
    return
  }
  loadServices()
  setBackButton(true, () => goBack())
})

onBeforeUnmount(() => setBackButton(false))

useHead({ title: 'رزرو نوبت' })
</script>
