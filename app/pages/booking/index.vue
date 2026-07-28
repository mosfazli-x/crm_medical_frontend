<template>
  <div dir="rtl" class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col items-center">
    <div class="w-full max-w-2xl text-center mb-8">
      <div class="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm border border-slate-100 mb-5">
        <div class="absolute inset-0 rounded-full bg-light-cyan animate-pulse opacity-50"></div>
        <MedicalKit class="w-10 h-10 fill-electric-sapphire relative z-10" />
      </div>
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">{{ $t('booking.title') }}</h1>
      <p class="text-slate-500 mt-2 text-lg">{{ $t('booking.selectServiceDesc') }}</p>
    </div>

    <div class="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 sm:px-10 pt-6 sm:pt-10 pb-2">
        <div class="flex items-center gap-2 justify-center mb-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              :class="step === 'services' ? 'bg-electric-sapphire text-white shadow-md shadow-electric-sapphire/30' : 'bg-slate-100 text-slate-400'">
              <span>1</span>
            </div>
            <span class="text-xs font-medium hidden sm:block"
              :class="step === 'services' ? 'text-electric-sapphire' : 'text-slate-400'">
              {{ $t('booking.selectService') }}
            </span>
          </div>
          <div class="h-px w-12 mx-1"
            :class="step === 'doctors' ? 'bg-electric-sapphire' : 'bg-slate-200'"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              :class="step === 'doctors' ? 'bg-electric-sapphire text-white shadow-md shadow-electric-sapphire/30' : 'bg-slate-100 text-slate-400'">
              <span>2</span>
            </div>
            <span class="text-xs font-medium hidden sm:block"
              :class="step === 'doctors' ? 'text-electric-sapphire' : 'text-slate-400'">
              {{ $t('booking.selectDoctor') }}
            </span>
          </div>
        </div>
      </div>

      <div class="p-6 sm:p-10 pt-2">

        <div v-if="loading" class="flex items-center justify-center py-20">
          <v-progress-circular indeterminate color="#4F46E5" size="48" width="4" />
          <span class="mr-3 text-slate-500 font-medium">{{ $t('booking.servicesLoading') }}</span>
        </div>

        <div v-else-if="error" class="text-center py-10">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">⚠️</span>
          </div>
          <p class="text-slate-600 font-medium">{{ error }}</p>
        </div>

        <template v-else>
          <!-- Step 1: Service Selection -->
          <div v-if="step === 'services'">
            <div v-if="!services.length" class="text-center mx-4 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                <span class="text-2xl">🏥</span>
              </div>
              <h3 class="text-slate-700 font-bold mb-1">{{ $t('booking.noServices') }}</h3>
              <p class="text-sm text-slate-500">{{ $t('booking.noServicesDesc') }}</p>
            </div>

            <div v-else class="space-y-3">
              <button
                v-for="svc in services"
                :key="svc.name"
                @click="selectService(svc)"
                class="w-full text-right p-4 rounded-xl border-2 transition-all duration-200"
                :class="selectedService?.name === svc.name
                  ? 'border-electric-sapphire! bg-light-cyan! shadow-sm shadow-electric-sapphire/20!'
                  : 'border-slate-100! hover:border-periwinkle hover:bg-slate-50! bg-slate-50!'"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: svc.doctors[0]?.color + '20' || '#e0e7ff' }">
                    <div class="w-5 h-5 rounded-full"
                      :style="{ backgroundColor: svc.doctors[0]?.color || '#4F46E5' }"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-800">{{ svc.name }}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">
                      {{ $t('booking.serviceByDoctors', { count: svc.doctors.length }) }}
                    </p>
                  </div>
                  <svg class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Step 2: Doctor Selection -->
          <div v-if="step === 'doctors'">
            <div class="flex items-center gap-3 mb-6">
              <button @click="step = 'services'" class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 class="text-lg font-bold text-slate-800">{{ $t('booking.selectDoctor') }}</h2>
                <p class="text-sm text-slate-500">{{ selectedService?.name }}</p>
              </div>
            </div>

            <div v-if="!selectedService?.doctors.length" class="text-center mx-4 py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                <span class="text-2xl">👨‍⚕️</span>
              </div>
              <h3 class="text-slate-700 font-bold mb-1">{{ $t('booking.noDoctors') }}</h3>
              <p class="text-sm text-slate-500">{{ $t('booking.noDoctorsDesc') }}</p>
            </div>

            <div v-else class="space-y-3">
              <button
                v-for="doc in selectedService!.doctors"
                :key="doc.doctorId"
                @click="proceedToBooking(doc)"
                class="w-full text-right p-4 rounded-xl border-2 border-slate-100 transition-all duration-200 hover:border-periwinkle hover:bg-slate-50 bg-slate-50"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-electric-sapphire to-periwinkle flex items-center justify-center shrink-0 text-white font-bold text-sm">
                    {{ getInitials(doc.doctorName) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-slate-800">{{ doc.doctorName }}</div>
                    <div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ doc.durationMinutes }} {{ $t('booking.minutes') }}
                      </span>
                      <span v-if="doc.price" class="flex items-center gap-1 font-bold text-electric-sapphire">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        {{ formatPrice(doc.price) }}
                      </span>
                    </div>
                    <p v-if="doc.description" class="text-xs text-slate-400 mt-1 line-clamp-1">{{ doc.description }}</p>
                  </div>
                  <div class="shrink-0">
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-electric-sapphire text-white text-xs font-bold rounded-lg hover:bg-electric-sapphire/90 transition-colors">
                      {{ $t('booking.selectTime') }}
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
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
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function formatPrice(price: string | null): string {
  if (!price) return ''
  const num = parseInt(price, 10)
  if (isNaN(num)) return ''
  const separated = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return separated + ' ' + t('common.toman')
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
