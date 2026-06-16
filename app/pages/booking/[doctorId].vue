<template>
  <div dir="rtl" class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col items-center">

    <div class="w-full max-w-2xl text-center mb-8">
      <div
        class="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 mb-5">
        <div class="absolute inset-0 rounded-full bg-blue-50 animate-pulse opacity-50"></div>
        <MedicalKit class="w-10 h-10 fill-blue-600 relative z-10" />
      </div>
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">رزرو نوبت آنلاین</h1>
      <p v-if="doctorName" class="text-slate-500 mt-2 text-lg">دکتر {{ doctorName }}</p>
    </div>

    <div
      class="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">

      <div v-if="!success" class="p-6 sm:p-10">

        <div
          class="flex items-center justify-between bg-slate-50 rounded-2xl p-2 px-2 py-3 mb-8 border border-slate-100">
          <v-btn icon variant="flat" color="white" size="small" class="shadow-sm border border-slate-200"
            @click="prevDay">
            <AltArrowLeft class="w-5 h-5 fill-slate-600 rotate-180" />
          </v-btn>
          <div class="flex flex-col items-center">
            <span class="text-xs font-medium text-slate-400 mb-0.5">تاریخ نوبت</span>
            <span class="text-sm sm:text-base font-bold text-slate-800">{{ persianDate }}</span>
          </div>
          <v-btn icon variant="flat" color="white" size="small" class="shadow-sm border border-slate-200"
            @click="nextDay">
            <AltArrowLeft class="w-5 h-5 fill-slate-600" />
          </v-btn>
        </div>

        <div class="mb-8 px-2">
          <div class="flex items-center justify-between mb-4 px-2">
            <h2 class="text-lg font-bold text-slate-800">انتخاب ساعت</h2>
            <v-progress-circular v-if="fetchingSlots" indeterminate color="blue-600" size="20" width="2" />
          </div>

          <div v-if="!fetchingSlots && availableSlots.length"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button v-for="slot in availableSlots" :key="slot.startTime" @click="selectSlot(slot)"
              class="px-2 py-3 text-sm font-medium rounded-lg border-2 border-slate-400 transition-all duration-200"
              :class="selectedSlot?.startTime === slot.startTime
                ? 'border-blue-600 shadow shadow-blue-200 bg-primary'
                : 'text-slate-600 border-slate-100 hover:border-blue-200 hover:text-blue-700 bg-secondary'">
              {{ slot.startTime }} - {{ slot.endTime }}
            </button>
          </div>

          <div v-if="!loading && !availableSlots.length && !fetchingSlots"
            class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div
              class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
              <span class="text-2xl">📅</span>
            </div>
            <h3 class="text-slate-700 font-bold mb-1">نوبتی یافت نشد</h3>
            <p class="text-sm text-slate-500">لطفاً روز دیگری را بررسی کنید.</p>
          </div>
        </div>

        <v-expand-transition>
          <div class="" v-if="selectedSlot">
            <div class="h-px w-full bg-slate-100 my-8"></div>

            <div class="flex items-center justify-between mb-6 px-2">
              <h3 class="text-lg font-bold text-slate-800">اطلاعات مراجعه‌کننده</h3>
              <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
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

              <div class="mt-8 flex flex-col-reverse sm:flex-row items-center gap-3 py-3 px-3 justify-end">
                <v-btn variant="text" color="slate-500" size="large" class="w-full sm:w-auto rounded-lg font-medium"
                  @click="cancelSelection">
                  انصراف
                </v-btn>
                <v-btn variant="flat" color="blue-darken-1" size="large" :loading="submitting"
                  class="w-full sm:w-auto px-10 font-bold rounded-lg shadow-md shadow-blue-200"
                  @click="bookAppointment">
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
          <div class="flex justify-between items-center px-2 py-3">
            <span class="text-sm font-medium text-slate-500">ساعت مراجعه:</span>
            <span class="text-sm font-bold text-blue-600">{{ selectedSlot?.startTime }} الی {{ selectedSlot?.endTime
              }}</span>
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
import { ref, computed, onMounted } from 'vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'

// در صورت نیاز به ایمپورت‌های Nuxt، آنها به صورت Auto-import در دسترس هستند.
const route = useRoute()
const router = useRouter()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const doctorId = computed(() => route.params.doctorId as string)
const doctorName = ref('')
const availableSlots = ref<{ startTime: string; endTime: string }[]>([])
const selectedSlot = ref<{ startTime: string; endTime: string } | null>(null)
const loading = ref(false)
const fetchingSlots = ref(false)
const submitting = ref(false)
const success = ref(false)
const formRef = ref<any>(null)

const currentDate = ref(new Date())

const form = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
})

// قالب‌بندی تاریخ شمسی
const persianDate = computed(() => {
  const d = currentDate.value
  return d.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// استخراج تاریخ میلادی برای ارسال به API
const dateStr = computed(() => {
  const d = currentDate.value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

function prevDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  currentDate.value = d
  selectedSlot.value = null
  fetchSlots()
}

function nextDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  currentDate.value = d
  selectedSlot.value = null
  fetchSlots()
}

function selectSlot(slot: { startTime: string; endTime: string }) {
  selectedSlot.value = slot
}

function cancelSelection() {
  selectedSlot.value = null
}

function resetBooking() {
  success.value = false
  selectedSlot.value = null
  form.value = { firstName: '', lastName: '', nationalId: '', phone: '' }
  currentDate.value = new Date()
  fetchSlots()
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
    // خطا به صورت خاموش نادیده گرفته می‌شود
  }
}

async function bookAppointment() {
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  if (!selectedSlot.value) return

  submitting.value = true
  try {
    await apiFetch('/api/scheduling/appointments', {
      method: 'POST',
      body: {
        doctorId: doctorId.value,
        appointmentDate: dateStr.value,
        startTime: selectedSlot.value.startTime,
        endTime: selectedSlot.value.endTime,
        patientFirstName: form.value.firstName,
        patientLastName: form.value.lastName,
        patientNationalId: form.value.nationalId,
        patientPhone: form.value.phone,
      },
    })
    success.value = true
    $toast.success('درخواست نوبت با موفقیت ثبت و برای تایید پزشک ارسال شد')
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ثبت نوبت')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchDoctorName()
  fetchSlots()
})

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: 'رزرو نوبت | سیستم مدیریت',
})
</script>