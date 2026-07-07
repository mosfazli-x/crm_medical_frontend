<template>
  <UiPageContainer>
    <UiPageHeader title="نوبت‌های بیماران" subtitle="مدیریت، تایید و بررسی وضعیت نوبت‌ها">
      <template #actions>
        <UiDateNavigator :label="displayDate" @prev="prevDay" @next="nextDay" />
      </template>
    </UiPageHeader>

    <UiContentCard>
      <UiLoadingSpinner v-if="loading" text="در حال دریافت لیست نوبت‌ها..." />

      <UiEmptyState
        v-else-if="!appointments.length"
        title="نوبتی برای این تاریخ ثبت نشده است"
        description="برای مشاهده نوبت‌های بیماران، از طریق تقویم بالا تاریخ دیگری را انتخاب کنید."
      >
        <template #icon>
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </template>
      </UiEmptyState>

      <template v-else>
        <div class="crm-card-header">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-300 tracking-wide">
            {{ appointments.length }} نوبت ثبت شده
          </span>
        </div>

        <div>
          <div v-for="appt in appointments" :key="appt.id" class="crm-list-item group">
            <div class="crm-list-time">
              <span class="crm-list-time-value">{{ appt.startTime?.slice(0, 5) }}</span>
              <span class="crm-list-time-end">تا {{ appt.endTime?.slice(0, 5) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">
                  {{ appt.patientFirstName }} {{ appt.patientLastName }}
                </h3>
                <UiStatusBadge :status="appt.status" />
              </div>

              <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <div v-if="appt.visitTypeName" class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: appt.visitTypeColor || '#5465ff' }"></div>
                  <span class="text-slate-700 dark:text-slate-300 font-medium">{{ appt.visitTypeName }}</span>
                </div>
                <span v-if="appt.visitTypeName" class="crm-divider-dot"></span>
                <span>کد ملی: {{ appt.patientNationalId }}</span>
                <span class="crm-divider-dot"></span>
                <span>موبایل: <span class="crm-ltr">{{ appt.patientPhone }}</span></span>
                <span class="crm-divider-dot"></span>
                <span>تاریخ: {{ formatJalaliDate(appt.appointmentDate) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <template v-if="appt.status === 'pending'">
                <button class="crm-btn crm-btn-success" @click="updateStatus(appt.id, 'confirmed')">تایید نوبت</button>
                <button class="crm-btn crm-btn-danger" @click="updateStatus(appt.id, 'rejected')">رد</button>
              </template>
              <template v-else-if="appt.status === 'confirmed'">
                <button class="crm-btn crm-btn-primary" @click="updateStatus(appt.id, 'completed')">تکمیل شد</button>
                <button class="crm-btn crm-btn-ghost" @click="updateStatus(appt.id, 'cancelled')">لغو نوبت</button>
              </template>
              <button class="crm-btn crm-btn-primary" @click.stop="openSmsModal(appt)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                ارسال پیامک
              </button>
            </div>
          </div>
        </div>
      </template>
    </UiContentCard>

    <v-dialog v-model="smsDialog" max-width="500">
      <div class="crm-dialog">
        <div class="crm-dialog-header">
          <h3 class="crm-dialog-title">ارسال پیامک به بیمار</h3>
          <v-btn icon variant="text" size="small" @click="smsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="crm-dialog-body">
          <div v-if="selectedSmsAppointment" class="crm-info-box">
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">گیرنده:</p>
            <p class="font-bold text-electric-sapphire text-sm">
              {{ selectedSmsAppointment.patientFirstName }} {{ selectedSmsAppointment.patientLastName }}
            </p>
            <div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span class="crm-ltr font-mono">{{ selectedSmsAppointment.patientPhone }}</span>
              <span class="crm-divider-dot"></span>
              <span>{{ formatJalaliDate(selectedSmsAppointment.appointmentDate) }} — {{ selectedSmsAppointment.startTime?.slice(0, 5) }}</span>
            </div>
          </div>

          <label class="crm-label">متن پیام</label>
          <textarea v-model="smsText" rows="4" maxlength="500" class="crm-input crm-textarea"
            placeholder="متن پیامک خود را اینجا بنویسید..." />
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-slate-400">{{ smsText.length }}/500</span>
            <span v-if="smsText.length > 500" class="text-xs text-red-500 font-bold">متن پیامک نباید بیشتر از 500 کاراکتر باشد</span>
          </div>
        </div>

        <div class="crm-dialog-footer">
          <button class="crm-btn crm-btn-danger" @click="smsDialog = false">انصراف</button>
          <button class="crm-btn crm-btn-accent" :disabled="!smsText.trim() || smsText.length > 500 || sendingSms" @click="sendSms">
            {{ sendingSms ? 'در حال ارسال...' : 'ارسال پیامک' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate, toDateStr } = useFormatting()

const appointments = ref<any[]>([])
const loading = ref(false)
const currentDate = ref(new Date())

const displayDate = computed(() => formatJalaliDate(currentDate.value.toISOString(), {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
}))

const dateStr = computed(() => toDateStr(currentDate.value))

function prevDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  currentDate.value = d
  fetchAppointments()
}

function nextDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  currentDate.value = d
  fetchAppointments()
}

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments?date=${dateStr.value}`)
    if (res.success) appointments.value = res.data
  } catch {
    $toast.error('خطا در دریافت نوبت‌ها')
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, status: string) {
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments/${id}/status`, {
      method: 'PUT', body: { status },
    })
    if (res.success) {
      $toast.success('وضعیت نوبت به‌روزرسانی شد')
      await fetchAppointments()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در به‌روزرسانی وضعیت')
  }
}

const smsDialog = ref(false)
const selectedSmsAppointment = ref<any>(null)
const smsText = ref('')
const sendingSms = ref(false)

function openSmsModal(appt: any) {
  selectedSmsAppointment.value = appt
  smsText.value = ''
  smsDialog.value = true
}

async function sendSms() {
  if (!smsText.value.trim()) { $toast.error('لطفاً متن پیامک را وارد کنید'); return }
  if (smsText.value.length > 500) { $toast.error('متن پیامک نباید بیشتر از 500 کاراکتر باشد'); return }
  const appt = selectedSmsAppointment.value
  if (!appt) return

  sendingSms.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments/${appt.id}/send-sms`, {
      method: 'POST', body: { text: smsText.value },
    })
    if (res.success) {
      $toast.success('پیامک با موفقیت ارسال شد')
      smsDialog.value = false
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارسال پیامک')
  } finally {
    sendingSms.value = false
  }
}

onMounted(() => fetchAppointments())

useSeoMeta({ title: 'نوبت‌های بیماران | سیستم مدیریت' })
</script>
