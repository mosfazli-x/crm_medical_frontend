<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 py-12 px-4 sm:px-6 flex flex-col items-center justify-start selection:bg-electric-sapphire/10 selection:text-electric-sapphire">
    
    <!-- نور پس‌زمینه تزیینی (Ambient Glow) -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-tr from-electric-sapphire/10 to-light-cyan/20 blur-3xl -z-10 pointer-events-none"></div>

    <!-- هدر صفحه -->
    <div class="w-full max-w-2xl text-center mb-10">
      <div class="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100/80 mb-6 transition-transform duration-300 hover:scale-105">
        <div class="absolute inset-0 rounded-2xl bg-light-cyan animate-pulse opacity-40"></div>
        <MedicalKit class="w-10 h-10 fill-electric-sapphire relative z-10" />
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{{ $t('booking.title') }}</h1>
      <p class="text-slate-500 mt-3 text-base sm:text-lg font-medium">{{ $t('booking.selectServiceDesc') }}</p>
    </div>

    <!-- بدنه اصلی (کارت رزرو) -->
    <div class="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-200/70 border border-slate-100/80 overflow-hidden transition-all duration-300">
      
      <!-- استپر پیشرفت (Stepper) -->
      <div class="px-6 sm:px-10 pt-8 pb-6 border-b border-slate-100/80 bg-slate-50/50">
        <div class="flex items-center justify-center max-w-xs mx-auto">
          <!-- مرحله ۱: سرویس‌ها -->
          <div class="flex items-center gap-2.5 cursor-pointer" @click="step = 'services'">
            <div 
              class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all duration-300"
              :class="step === 'services' 
                ? '!bg-electric-sapphire !text-white !shadow-lg !shadow-electric-sapphire/30 scale-105' 
                : '!bg-slate-200/70 !text-slate-500 hover:!bg-slate-200'"
            >
              <span>1</span>
            </div>
            <span 
              class="text-xs sm:text-sm font-bold transition-colors duration-200"
              :class="step === 'services' ? '!text-slate-800' : '!text-slate-400'"
            >
              {{ $t('booking.selectService') }}
            </span>
          </div>

          <!-- خط اتصال -->
          <div 
            class="h-1 flex-1 mx-4 rounded-full transition-all duration-500"
            :class="step === 'doctors' ? '!bg-electric-sapphire' : '!bg-slate-200/80'"
          ></div>

          <!-- مرحله ۲: پزشکان -->
          <div class="flex items-center gap-2.5">
            <div 
              class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-all duration-300"
              :class="step === 'doctors' 
                ? '!bg-electric-sapphire !text-white !shadow-lg !shadow-electric-sapphire/30 scale-105' 
                : '!bg-slate-100 !text-slate-400'"
            >
              <span>2</span>
            </div>
            <span 
              class="text-xs sm:text-sm font-bold transition-colors duration-200"
              :class="step === 'doctors' ? '!text-slate-800' : '!text-slate-400'"
            >
              {{ $t('booking.selectDoctor') }}
            </span>
          </div>
        </div>
      </div>

      <!-- محتوای استپ‌ها -->
      <div class="p-6! sm:p-10">

        <!-- حالت لودینگ -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <v-progress-circular indeterminate color="#4F46E5" size="48" width="4" />
          <span class="text-slate-500 font-medium text-sm sm:text-base animate-pulse">{{ $t('booking.servicesLoading') }}</span>
        </div>

        <!-- حالت خطا -->
        <div v-else-if="error" class="text-center py-12 px-4">
          <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
            <span class="text-2xl">⚠️</span>
          </div>
          <p class="text-slate-700 font-bold mb-1">خطایی رخ داده است</p>
          <p class="text-slate-500 text-sm font-medium">{{ error }}</p>
        </div>

        <template v-else>
          <!-- مرحله ۱: انتخاب سرویس -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
            mode="out-in"
          >
            <div v-if="step === 'services'" key="services-step">
              
              <!-- لیست خالی -->
              <div v-if="!services.length" class="text-center py-14 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <span class="text-2xl">🏥</span>
                </div>
                <h3 class="text-slate-800 font-bold mb-1.5">{{ $t('booking.noServices') }}</h3>
                <p class="text-sm text-slate-500">{{ $t('booking.noServicesDesc') }}</p>
              </div>

              <!-- لیست سرویس‌ها -->
              <div v-else class="grid gap-3.5!">
                <button
                  v-for="svc in services"
                  :key="svc.name"
                  @click="selectService(svc)"
                  class="group relative w-full text-right p-4! sm:p-5! rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4"
                  :class="selectedService?.name === svc.name
                    ? '!border-electric-sapphire !bg-light-cyan/50 !shadow-md !shadow-electric-sapphire/10'
                    : '!border-slate-100 !bg-slate-50/50 hover:!border-periwinkle hover:!bg-slate-200 hover:!shadow-lg hover:!shadow-slate-100'"
                >
                  <div class="flex items-center gap-4 min-w-0">
                    <div 
                      class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm"
                      :style="{ backgroundColor: (svc.doctors[0]?.color || '#4F46E5') + '15' }"
                    >
                      <div 
                        class="w-5 h-5 rounded-full shadow-inner"
                        :style="{ backgroundColor: svc.doctors[0]?.color || '#4F46E5' }"
                      ></div>
                    </div>
                    <div class="min-w-0">
                      <span class="font-extrabold text-base sm:text-lg text-slate-800 block truncate group-hover:text-electric-sapphire transition-colors">
                        {{ svc.name }}
                      </span>
                      <div class="inline-flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
                        <span>{{ $t('booking.serviceByDoctors', { count: svc.doctors.length }) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:!border-electric-sapphire/30 group-hover:!text-electric-sapphire group-hover:!bg-electric-sapphire/5 transition-all shrink-0">
                    <!-- آیکون فلش مناسب برای راست‌چین (RTL) -->
                    <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- مرحله ۲: انتخاب پزشک -->
            <div v-else-if="step === 'doctors'" key="doctors-step">
              
              <!-- نوار فوقانی بازگشت -->
              <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <button 
                    @click="step = 'services'" 
                    class="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-600 hover:!bg-slate-100 hover:!text-slate-900 transition-all"
                    :title="$t('common.back')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div>
                    <h2 class="text-lg font-extrabold text-slate-800">{{ $t('booking.selectDoctor') }}</h2>
                    <p class="text-xs font-medium text-electric-sapphire mt-0.5">{{ selectedService?.name }}</p>
                  </div>
                </div>
              </div>

              <!-- لیست خالی پزشکان -->
              <div v-if="!selectedService?.doctors.length" class="text-center py-14 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <span class="text-2xl">👨‍⚕️</span>
                </div>
                <h3 class="text-slate-800 font-bold mb-1.5">{{ $t('booking.noDoctors') }}</h3>
                <p class="text-sm text-slate-500">{{ $t('booking.noDoctorsDesc') }}</p>
              </div>

              <!-- لیست پزشکان -->
              <div v-else class="grid gap-4">
                <button
                  v-for="doc in selectedService!.doctors"
                  :key="doc.doctorId"
                  @click="proceedToBooking(doc)"
                  class="group w-full text-right p-5! rounded-2xl border-2 !border-slate-100 !bg-slate-50/40 hover:!border-periwinkle hover:!bg-white hover:!shadow-xl hover:!shadow-slate-200/50 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div class="flex items-start sm:items-center gap-4 min-w-0">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-sapphire to-periwinkle flex items-center justify-center shrink-0 text-white font-black text-base shadow-md shadow-electric-sapphire/20 group-hover:scale-105 transition-transform">
                      {{ getInitials(doc.doctorName) }}
                    </div>
                    
                    <div class="min-w-0 flex-1">
                      <div class="font-extrabold text-slate-800 text-base sm:text-lg group-hover:text-electric-sapphire transition-colors">
                        {{ doc.doctorName }}
                      </div>
                      
                      <p v-if="doc.description" class="text-xs font-normal text-slate-500 mt-1 mb-3 line-clamp-1">
                        {{ doc.description }}
                      </p>

                      <div class="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs">
                        <span class="inline-flex items-center gap-1.5 px-2.5! py-1! rounded-lg bg-slate-200/60 text-slate-700 font-medium">
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {{ doc.durationMinutes }} {{ $t('booking.minutes') }}
                        </span>

                        <span v-if="doc.price" class="inline-flex items-center gap-1.5 px-2.5! py-1! rounded-lg bg-light-cyan/60 text-electric-sapphire font-extrabold">
                          {{ formatPrice(doc.price) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <span class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 !bg-electric-sapphire !text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-electric-sapphire/20 group-hover:!bg-electric-sapphire/90 group-hover:!shadow-lg group-hover:!shadow-electric-sapphire/30 transition-all">
                      {{ $t('booking.selectTime') }}
                      <svg class="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </Transition>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'

const { t } = useI18n()
const router = useRouter()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

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

interface ServiceGroup {
  name: string
  doctors: ServiceDoctor[]
}

const step = ref<'services' | 'doctors'>('services')
const services = ref<ServiceGroup[]>([])
const selectedService = ref<ServiceGroup | null>(null)
const loading = ref(true)
const error = ref('')

function getInitials(name: string): string {
  if (!name) return 'DR'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function formatPrice(price: string | null): string {
  if (!price) return ''
  const num = parseInt(price, 10)
  if (isNaN(num)) return ''
  const separated = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${separated} ${t('common.toman')}`
}

function selectService(svc: ServiceGroup) {
  selectedService.value = svc
  step.value = 'doctors'
}

function proceedToBooking(doc: ServiceDoctor) {
  router.push(`/booking/${doc.doctorId}?visitTypeId=${doc.visitTypeId}`)
}

async function fetchServices() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<any>('/api/booking/services')
    if (res.success) {
      services.value = (res.data || []).map((g: any) => ({
        name: g.name,
        doctors: (g.doctors || []).map((d: any) => ({
          doctorId: d.doctorId,
          doctorName: d.doctorName,
          visitTypeId: d.visitTypeId,
          name: d.name,
          description: d.description,
          durationMinutes: d.duration_minutes ?? d.durationMinutes ?? 30,
          price: d.price ?? null,
          color: d.color || '#4F46E5',
        })),
      }))
    }
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to load services'
    $toast.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchServices()
})

definePageMeta({
  layout: false,
})

useSeoMeta({
  title: t('booking.titleSeoIndex'),
})
</script>