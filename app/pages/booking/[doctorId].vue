<template>
  <div dir="rtl" class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col items-center">

    <div class="w-full max-w-2xl text-center mb-8">
      <div
        class="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 mb-5">
        <div class="absolute inset-0 rounded-full bg-light-cyan animate-pulse opacity-50"></div>
        <MedicalKit class="w-10 h-10 fill-electric-sapphire relative z-10" />
      </div>
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">رزرو نوبت آنلاین</h1>
      <p v-if="doctorName" class="text-slate-500 mt-2 text-lg">دکتر {{ doctorName }}</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">

      <div class="px-6 sm:px-10 pt-6 sm:pt-10 pb-2">
        <div class="flex items-center gap-2 justify-center mb-6">
          <div v-for="(step, i) in steps" :key="i" class="flex items-center gap-2"
            :class="i < steps.length - 1 ? 'flex-1' : ''">
            <div class="flex items-center gap-2 shrink-0">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                :class="currentStep >= i
                  ? 'bg-electric-sapphire text-white shadow-md shadow-electric-sapphire/30'
                  : 'bg-slate-100 text-slate-400'">
                <span v-if="currentStep > i">✓</span>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-xs font-medium hidden sm:block"
                :class="currentStep >= i ? 'text-electric-sapphire' : 'text-slate-400'">
                {{ step }}
              </span>
            </div>
            <div v-if="i < steps.length - 1" class="h-px flex-1 mx-1"
              :class="currentStep > i ? 'bg-electric-sapphire' : 'bg-slate-200'"></div>
          </div>
        </div>
      </div>

      <div v-if="!success" class="p-6 sm:p-10 pt-2">

        <div class="pb-2" v-show="currentStep === 0">
          <div class="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-100 mx-8">
            <div class="flex flex-col items-center w-full py-2">
              <span class="text-xs font-medium text-slate-400 mb-0.5">تاریخ نوبت</span>
              <span class="text-sm sm:text-base font-bold text-slate-800">{{ persianDate }}</span>
            </div>
          </div>

          <HijriCalendar v-model="selectedJalaliDate" :marked-dates="markedDates" :loading="calendarLoading"
            @month-change="onMonthChange" />

          <div v-if="selectedJalaliDate && !fetchingSlots && !availableSlots.length"
            class="mt-4 flex items-center gap-2 justify-center py-3 px-4 bg-amber-50 border border-amber-200/60 rounded-xl mx-6">
            <svg class="w-5 h-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm font-medium text-amber-700">برای این روز نوبتی ثبت نشده است</span>
          </div>

          <div v-if="!selectedJalaliDate || fetchingSlots || availableSlots.length" class="my-2 flex justify-center">
            <v-btn variant="flat" color="#5465ff" size="large"
              class="px-14 font-bold rounded-xl shadow-md shadow-electric-sapphire/30" :disabled="!selectedJalaliDate"
              @click="currentStep = 1">
              ادامه
            </v-btn>
          </div>
        </div>

        <div v-show="currentStep === 1">
          <div class="flex items-center justify-between mb-6 px-2">
            <h2 class="text-lg font-bold text-slate-800">نوع نوبت</h2>
            <v-progress-circular v-if="fetchingVisitTypes" indeterminate color="#5465ff" size="20" width="2" />
          </div>

          <div v-if="!fetchingVisitTypes && visitTypes.length" class="space-y-3 px-2 gap-1 flex flex-col">
            <button v-for="vt in visitTypes" :key="vt.id" @click="selectVisitType(vt)"
              class="w-full text-right p-4 rounded-xl border-2 transition-all duration-200 px-3 py-2" :class="selectedVisitType?.id === vt.id
                ? 'border-electric-sapphire! bg-light-cyan! shadow-sm shadow-electric-sapphire/20!'
                : 'border-slate-100! hover:border-periwinkle hover:bg-slate-50! bg-slate-50! border-slate-500'">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: vt.color + '20' }">
                  <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: vt.color }"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 text-sm">{{ vt.name }}</span>
                    <span class="text-xs text-slate-400">({{ vt.durationMinutes }} دقیقه)</span>
                  </div>
                  <p v-if="vt.description" class="text-xs text-slate-500 mt-1 line-clamp-1">{{ vt.description }}</p>
                </div>
                <div class="text-left shrink-0">
                  <span class="text-sm font-bold text-electric-sapphire">{{ formatPrice(vt.price) }}</span>
                  <div class="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">{{ numberToWords(vt.price) }} تومان
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div v-if="!fetchingVisitTypes && !visitTypes.length"
            class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div
              class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
              <span class="text-2xl">📋</span>
            </div>
            <h3 class="text-slate-700 font-bold mb-1">نوع نوبتی تعریف نشده</h3>
            <p class="text-sm text-slate-500">این پزشک هنوز نوع نوبتی تعریف نکرده است.</p>
          </div>

          <div class="mt-8 flex items-center gap-3 justify-between px-2 py-2">
            <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
              @click="currentStep = 0">
              بازگشت
            </v-btn>
            <v-btn variant="flat" color="#5465ff" size="large" :disabled="!selectedVisitType"
              class="px-10 font-bold rounded-lg shadow-md shadow-electric-sapphire/30" @click="currentStep = 2">
              ادامه
            </v-btn>
          </div>
        </div>

        <div class="px-2" v-show="currentStep === 2">
          <div class="flex items-center justify-between mb-4 px-2">
            <h2 class="text-lg font-bold text-slate-800">انتخاب ساعت</h2>
            <v-progress-circular v-if="fetchingSlots" indeterminate color="#5465ff" size="20" width="2" />
          </div>

          <div class="bg-light-cyan/40 border border-periwinkle/40 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :style="{ backgroundColor: (selectedVisitType?.color || '#3B82F6') + '20' }">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedVisitType?.color || '#3B82F6' }">
              </div>
            </div>
            <div class="text-sm">
              <span class="text-slate-600">نوع نوبت: </span>
              <span class="font-bold text-slate-800">{{ selectedVisitType?.name }}</span>
            </div>
          </div>

          <div v-if="!fetchingSlots && availableSlots.length"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-2">
            <button v-for="slot in availableSlots" :key="slot.startTime" @click="selectSlot(slot)"
              class="px-2 py-3 text-sm font-medium rounded-lg border-2 border-slate-400 transition-all duration-200"
              :class="selectedSlot?.startTime === slot.startTime
                ? 'border-electric-sapphire shadow shadow-electric-sapphire/30 bg-primary'
                : 'text-slate-600 border-slate-100 hover:border-periwinkle hover:text-electric-sapphire bg-secondary'">
              {{ slot.startTime }} - {{ slot.endTime }}
            </button>
          </div>

          <div v-if="!fetchingSlots && !availableSlots.length"
            class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-2">
            <div
              class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
              <span class="text-2xl">📅</span>
            </div>
            <h3 class="text-slate-700 font-bold mb-1">نوبتی یافت نشد</h3>
            <p class="text-sm text-slate-500">لطفاً روز دیگری را بررسی کنید.</p>
          </div>

          <div class="mt-8 flex items-center gap-3 justify-between px-2 pb-2">
            <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
              @click="currentStep = 1">
              بازگشت
            </v-btn>
          </div>
        </div>

        <v-expand-transition class="px-2">
          <div v-if="selectedSlot">
            <div class="h-px w-full bg-slate-100 my-8"></div>
            <div class="flex items-center justify-between mb-6 px-2">
              <h3 class="text-lg font-bold text-slate-800">اطلاعات مراجعه‌کننده</h3>
              <span class="bg-light-cyan text-electric-sapphire px-3 py-1 rounded-lg text-xs font-bold">
                ساعت انتخابی: {{ selectedSlot.startTime }}
              </span>
            </div>

            <v-form ref="formRef" @submit.prevent="bookAppointment">
              <v-row class="mt-2 px-2">
                <v-col cols="12" md="6" class="py-2">
                  <label class="text-sm font-semibold text-slate-700 mb-2 block">نام <span
                      class="text-red-500">*</span></label>
                  <v-text-field v-model="form.firstName" variant="outlined" density="comfortable"
                    placeholder="مثال: علی" hide-details="auto" bg-color="white" rounded="lg" dir="rtl"
                    :rules="[v => !!v || 'نام الزامی است']" />
                </v-col>

                <v-col cols="12" md="6" class="py-2">
                  <label class="text-sm font-semibold text-slate-700 mb-2 block">نام خانوادگی <span
                      class="text-red-500">*</span></label>
                  <v-text-field v-model="form.lastName" variant="outlined" density="comfortable"
                    placeholder="مثال: محمدی" hide-details="auto" bg-color="white" rounded="lg" dir="rtl"
                    :rules="[v => !!v || 'نام خانوادگی الزامی است']" />
                </v-col>

                <v-col cols="12" md="6" class="py-2">
                  <label class="text-sm font-semibold text-slate-700 mb-2 block">کد ملی <span
                      class="text-red-500">*</span></label>
                  <v-text-field v-model="form.nationalId" variant="outlined" density="comfortable"
                    placeholder="۱۰ رقم بدون خط تیره" maxlength="10" hide-details="auto" bg-color="white" rounded="lg"
                    dir="ltr" :rules="[
                      v => !!v || 'کد ملی الزامی است',
                      v => /^\d{10}$/.test(v) || 'کد ملی باید دقیقاً ۱۰ عدد باشد'
                    ]" class="text-right" />
                </v-col>

                <v-col cols="12" md="6" class="py-2">
                  <label class="text-sm font-semibold text-slate-700 mb-2 block">شماره موبایل <span
                      class="text-red-500">*</span></label>
                  <v-text-field v-model="form.phone" variant="outlined" density="comfortable" placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    hide-details="auto" bg-color="white" rounded="lg" :rules="[v => !!v || 'شماره موبایل الزامی است']"
                    dir="ltr" class="text-right" />
                </v-col>
              </v-row>

              <div class="mt-8 flex flex-col-reverse sm:flex-row items-center gap-3 py-3 px-3 justify-between">
                <div>
                  <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
                    @click="goBackToSlots">
                    بازگشت
                  </v-btn>
                </div>
                <v-btn variant="flat" color="#5465ff" size="large" :loading="submitting"
                  class="px-10 font-bold rounded-lg shadow-md shadow-electric-sapphire/30" @click="bookAppointment">
                  تایید و ثبت نوبت
                </v-btn>
              </div>
            </v-form>
          </div>
        </v-expand-transition>
      </div>

      <div v-else class="p-10 text-center">
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto my-6">
          <span class="text-5xl">✅</span>
        </div>
        <h2 class="text-2xl font-extrabold text-slate-800 mb-3">نوبت با موفقیت ثبت شد</h2>
        <p class="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
          درخواست نوبت شما ثبت شد و پس از تایید پزشک قطعی می‌گردد.
        </p>

        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-right space-y-3">
          <div class="flex justify-between items-center border-b border-slate-200 pb-3 px-2 py-3">
            <span class="text-sm font-medium text-slate-500">تاریخ مراجعه:</span>
            <span class="text-sm font-bold text-slate-800">{{ persianDate }}</span>
          </div>
          <div class="flex justify-between items-center border-b border-slate-200 px-2 py-3">
            <span class="text-sm font-medium text-slate-500">نوع نوبت:</span>
            <span class="text-sm font-bold text-electric-sapphire">{{ selectedVisitType?.name }}</span>
          </div>
          <div class="flex justify-between items-center px-2 py-3">
            <span class="text-sm font-medium text-slate-500">ساعت مراجعه:</span>
            <span class="text-sm font-bold text-electric-sapphire">{{ selectedSlot?.startTime }} الی {{
              selectedSlot?.endTime }}</span>
          </div>
        </div>

        <v-btn variant="outlined" color="slate-700" size="large" class="px-8 font-bold rounded-xl my-4"
          @click="resetBooking">
          ثبت نوبت جدید
        </v-btn>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment-jalaali'
import HijriCalendar from '~/components/HijriCalendar.vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'

const route = useRoute()
const router = useRouter()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const steps = ['تاریخ', 'نوع نوبت', 'زمان', 'اطلاعات']

const doctorId = computed(() => route.params.doctorId as string)
const doctorName = ref('')
const currentStep = ref(0)

const visitTypes = ref<any[]>([])
const selectedVisitType = ref<any | null>(null)
const fetchingVisitTypes = ref(false)

const availableSlots = ref<{ startTime: string; endTime: string }[]>([])
const selectedSlot = ref<{ startTime: string; endTime: string } | null>(null)
const loading = ref(false)
const fetchingSlots = ref(false)
const submitting = ref(false)
const success = ref(false)
const formRef = ref<any>(null)

const now = moment()
const selectedJalaliDate = ref(
  `${now.jYear()}/${String(now.jMonth() + 1).padStart(2, '0')}/${String(now.jDate()).padStart(2, '0')}`
)

const markedDates = ref<string[]>([])
const calendarLoading = ref(false)
const markedDatesCache: Record<string, string[]> = {}

const currentDate = computed(() => {
  if (!selectedJalaliDate.value) return new Date()
  const m = moment(selectedJalaliDate.value, 'jYYYY/jMM/jDD')
  return m.toDate()
})

const form = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
})

const persianDate = computed(() => {
  const d = currentDate.value
  return d.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const dateStr = computed(() => {
  const d = currentDate.value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

watch(selectedJalaliDate, () => {
  selectedSlot.value = null
  fetchSlots()
}, { immediate: true })

// === تابع جدید تبدیل عدد به حروف با افزودن صحیح حرف «و» ===
function numberToWords(num: number): string {
  if (num === 0) return 'صفر'

  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه']
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده']
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود']
  const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد']
  const units = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون']

  function convertTriplet(n: number): string {
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10

    const parts = []
    if (h > 0) parts.push(hundreds[h])

    if (t === 1) {
      parts.push(teens[o])
    } else {
      if (t > 1) parts.push(tens[t])
      if (o > 0) parts.push(ones[o])
    }

    // متصل کردن اعداد با حرف «و»
    return parts.join(' و ')
  }

  const tripletWords = []
  let groupIndex = 0

  while (num > 0) {
    const triplet = num % 1000
    if (triplet > 0) {
      const tripletWord = convertTriplet(triplet)
      const unitWord = units[groupIndex] ? ' ' + units[groupIndex] : ''
      tripletWords.push(tripletWord + unitWord)
    }
    num = Math.floor(num / 1000)
    groupIndex++
  }

  // برعکس کردن آرایه و متصل کردن بخش‌های هزارتایی/میلیونی با حرف «و»
  return tripletWords.reverse().join(' و ')
}

// === تابع جدید فرمت قیمت با جداسازی ۳ رقمی دقیق ===
function formatPrice(price: number) {
  if (price == null) return '۰ تومان'

  // جداسازی سه رقم سه رقم با RegEx برای جلوگیری از مشکلات hydration
  const separated = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // تبدیل اعداد انگلیسی به فارسی 
  const persianDigits = separated.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])

  return persianDigits + ' تومان'
}

function selectVisitType(vt: any) {
  selectedVisitType.value = vt
}

function selectSlot(slot: { startTime: string; endTime: string }) {
  selectedSlot.value = slot
  currentStep.value = 3
}

function goBackToSlots() {
  selectedSlot.value = null
  currentStep.value = 2
}

function resetBooking() {
  success.value = false
  currentStep.value = 0
  selectedSlot.value = null
  selectedVisitType.value = null
  form.value = { firstName: '', lastName: '', nationalId: '', phone: '' }

  const today = moment()
  selectedJalaliDate.value = `${today.jYear()}/${String(today.jMonth() + 1).padStart(2, '0')}/${String(today.jDate()).padStart(2, '0')}`

  fetchVisitTypes()

  Object.keys(markedDatesCache).forEach(k => delete markedDatesCache[k])
  fetchMonthAvailability(today.jYear(), today.jMonth() + 1)
}

function onMonthChange(payload: { year: number; month: number }) {
  fetchMonthAvailability(payload.year, payload.month)
}

async function fetchMonthAvailability(year: number, month: number) {
  const cacheKey = `${year}-${month}`
  if (markedDatesCache[cacheKey]) {
    markedDates.value = markedDatesCache[cacheKey]
    return
  }

  calendarLoading.value = true
  markedDates.value = []

  const todayJalali = `${now.jYear()}/${String(now.jMonth() + 1).padStart(2, '0')}/${String(now.jDate()).padStart(2, '0')}`
  const daysInMonth = moment.jDaysInMonth(year, month - 1)
  const promises = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStrJ = `${year}/${String(month).padStart(2, '0')}/${String(d).padStart(2, '0')}`
    if (dateStrJ < todayJalali) continue

    const gregDate = moment(dateStrJ, 'jYYYY/jMM/jDD').toDate()
    const apiDateStr = `${gregDate.getFullYear()}-${String(gregDate.getMonth() + 1).padStart(2, '0')}-${String(gregDate.getDate()).padStart(2, '0')}`

    promises.push(
      apiFetch<any>(`/api/scheduling/slots/${doctorId.value}?date=${apiDateStr}`)
        .then(res => ({ dateStr: dateStrJ, hasSlots: res.success && res.data?.length > 0 }))
        .catch(() => ({ dateStr: dateStrJ, hasSlots: false }))
    )
  }

  const results = await Promise.allSettled(promises)
  const dates: string[] = []
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.hasSlots) {
      dates.push(r.value.dateStr)
    }
  })

  markedDatesCache[cacheKey] = dates
  markedDates.value = dates
  calendarLoading.value = false
}

async function fetchSlots() {
  fetchingSlots.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/slots/${doctorId.value}?date=${dateStr.value}`)
    if (res.success) {
      availableSlots.value = res.data
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در دریافت زمان‌های خالی')
  } finally {
    fetchingSlots.value = false
  }
}

async function fetchVisitTypes() {
  fetchingVisitTypes.value = true
  try {
    const res = await apiFetch<any>(`/api/visit-types/${doctorId.value}`)
    if (res.success) {
      visitTypes.value = (res.data || []).filter((vt: any) => {
        const active = vt.is_active ?? vt.isActive ?? true
        return active
      }).map((vt: any) => ({
        id: vt.id,
        name: vt.name,
        description: vt.description,
        durationMinutes: vt.duration_minutes ?? vt.durationMinutes ?? 30,
        price: vt.price ?? 0,
        color: vt.color || '#3B82F6',
        isActive: vt.is_active ?? vt.isActive ?? true,
      }))
    }
  } catch {
    $toast.error('خطا در دریافت انواع نوبت')
  } finally {
    fetchingVisitTypes.value = false
  }
}

async function fetchDoctorName() {
  try {
    const res = await apiFetch<any>('/api/scheduling/doctors')
    if (res.success) {
      const doctor = res.data.find((d: any) => d.id === doctorId.value)
      if (doctor) {
        doctorName.value = doctor.fullName
      }
    }
  } catch {
    // silently fail
  }
}

async function bookAppointment() {
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  if (!selectedSlot.value || !selectedVisitType.value) return

  submitting.value = true
  try {
    await apiFetch('/api/scheduling/appointments', {
      method: 'POST',
      body: {
        doctorId: doctorId.value,
        appointmentDate: dateStr.value,
        startTime: selectedSlot.value.startTime,
        endTime: selectedSlot.value.endTime,
        visitTypeId: selectedVisitType.value.id,
        patientFirstName: form.value.firstName,
        patientLastName: form.value.lastName,
        patientNationalId: form.value.nationalId,
        patientPhone: form.value.phone,
      },
    })
    success.value = true
    Object.keys(markedDatesCache).forEach(k => delete markedDatesCache[k])
    $toast.success('درخواست نوبت با موفقیت ثبت و برای تایید پزشک ارسال شد')
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ثبت نوبت')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDoctorName()
  fetchVisitTypes()
  fetchMonthAvailability(now.jYear(), now.jMonth() + 1)
})

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'رزرو نوبت | سیستم مدیریت',
})
</script>