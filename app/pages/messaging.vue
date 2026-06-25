<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 min-h-screen">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">پیام‌ها</h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-300 dark:text-slate-400 mt-2">ارسال و دریافت پیام‌های داخلی</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-5 h-[calc(100vh-16rem)] min-h-[600px]">
      <!-- Left Sidebar -->
      <div class="min-w-[360px] shrink-0 bg-white dark:bg-blue-grey! rounded-2xl border border-slate-200/60 dark:border-slate-600! flex flex-col overflow-hidden">
        <div class="px-2 pt-2 border-b border-slate-200/60 space-y-3">
          <div class="flex items-center gap-2">
            <v-btn color="#5465ff" class="flex-1 font-bold" prepend-icon="mdi-pencil" @click="startCompose">
              نوشتن پیام جدید
            </v-btn>
            <v-btn icon variant="text" color="slate" class="dark:text-slate-400!" @click="refreshMessages">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
          <v-tabs v-model="tab" color="#5465ff" bg-color="transparent" density="compact" class="border-b border-slate-200 text-slate-800 dark:text-slate-300!">
            <v-tab value="inbox" class="text-xs font-bold tracking-wide">
              صندوق دریافتی
              <v-badge v-if="unreadCount > 0" :content="unreadCount" color="red" inline class="mr-1" />
            </v-tab>
            <v-tab value="sent" class="text-xs font-bold tracking-wide">ارسال شده</v-tab>
          </v-tabs>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16">
            <v-progress-circular indeterminate size="32" color="#5465ff" />
            <p class="mt-3 text-xs font-medium text-slate-500">در حال دریافت پیام‌ها...</p>
          </div>

          <div v-else-if="!messages.length" class="flex flex-col items-center justify-center py-16 px-4">
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
              <v-icon size="28" color="slate-300">mdi-email-outline</v-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ tab === 'inbox' ? 'صندوق دریافتی خالی است' : 'پیامی ارسال نکرده‌اید' }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{{ tab === 'inbox' ? 'هیچ پیامی برای شما ارسال نشده است' : 'روی دکمه بالا کلیک کنید تا پیام جدیدی ارسال کنید' }}</p>
          </div>

          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="px-4 py-3.5 cursor-pointer transition-all duration-150"
              :class="selected?.id === msg.id ? 'bg-light-cyan/80 border-r-2 border-electric-sapphire' : 'hover:bg-white/60'"
              @click="selectMessage(msg)"
            >
              <div class="flex items-start gap-2.5">
                <div class="flex-1 min-w-0 py-2">
                  <div class="flex items-center gap-2 mb-1">
                    <span v-if="!msg.read && tab === 'inbox'" class="w-2 h-2 rounded-full bg-electric-sapphire shrink-0" />
                    <span v-if="msg.priority === 'urgent'" class="w-2 h-2 rounded-full bg-red-500 shrink-0" title="فوری" />
                    <span class="text-sm font-bold text-slate-800 truncate">
                      {{ tab === 'inbox' ? msg.sender_name : (msg.patient ? `${msg.patient.firstName} ${msg.patient.lastName}` : msg.recipient_name) }}
                    </span>
                  </div>
                  <p class="text-xs font-semibold text-slate-500 truncate mt-0.5">{{ msg.subject }}</p>
                  <div v-if="tab === 'sent' && msg.patient" class="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span v-if="msg.patient.nationalId" class="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <v-icon size="12" color="slate-400">mdi-card-account-details-outline</v-icon>
                      <span dir="ltr">{{ msg.patient.nationalId }}</span>
                    </span>
                    <span v-if="msg.patient.phone" class="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <v-icon size="12" color="slate-400">mdi-phone-outline</v-icon>
                      <span dir="ltr">{{ msg.patient.phone }}</span>
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1">{{ formatDate(msg.createdAt) }}</p>
                </div>
                <div v-if="msg.confidential" class="shrink-0">
                  <span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded text-[10px] font-bold">محرمانه</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="flex-1 bg-white dark:bg-blue-grey! rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-600! overflow-hidden flex flex-col px-3 py-2">
        <!-- Compose Form -->
        <template v-if="composing">
          <div class="p-6 border-b border-slate-100">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-extrabold text-slate-800 dark:text-slate-300">ارسال پیام جدید</h2>
              <v-btn icon variant="text" size="small" color="slate" @click="cancelCompose">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Selected patient display -->
            <div v-if="selectedPatient" class="flex items-start gap-3.5 mb-4 p-4 rounded-xl bg-light-cyan/80 border border-periwinkle/60">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-light-cyan to-periwinkle flex items-center justify-center shrink-0 mt-0.5">
                <v-icon size="20" color="#5465ff">mdi-account</v-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-sm font-bold text-slate-800 truncate">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</p>
                  <span v-if="selectedPatient.gender" class="text-[11px] text-slate-400 bg-white/60 px-2 py-0.5 rounded-md shrink-0">
                    {{ selectedPatient.gender === 'male' ? 'مرد' : selectedPatient.gender === 'female' ? 'زن' : selectedPatient.gender }}
                  </span>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <div v-if="selectedPatient.nationalId" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-card-account-details-outline</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ selectedPatient.nationalId }}</span>
                  </div>
                  <div v-if="selectedPatient.phone" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-phone-outline</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ selectedPatient.phone }}</span>
                  </div>
                  <div v-if="selectedPatient.mobile" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-cellphone</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ selectedPatient.mobile }}</span>
                  </div>
                </div>
              </div>
              <v-btn icon variant="text" size="x-small" color="slate" class="mt-0.5 shrink-0" @click="removeSelectedPatient">
                <v-icon size="18">mdi-close-circle</v-icon>
              </v-btn>
            </div>

            <!-- Patient search button and manual entry -->
            <div v-if="!selectedPatient" class="mb-4">
              <v-btn variant="outlined" color="#5465ff" block class="mb-3" prepend-icon="mdi-account-search" @click="patientSearchDialog = true">
                جستجو و انتخاب بیمار
              </v-btn>
              <v-text-field
                v-model="composeForm.recipient"
                label="گیرنده (شناسه کاربر یا نام)"
                variant="outlined"
                density="compact"
                hide-details
                class="dark:text-slate-300 dark:bg-blue-grey! dark:border-slate-600!"
                placeholder="یا نام کاربر را وارد کنید..."
              />
            </div>

            <v-select
              v-model="composeForm.priority"
              :items="priorityOptions"
              label="اولویت"
              variant="outlined"
              density="compact"
              class="mb-4 dark:text-slate-300 dark:bg-blue-grey! dark:border-slate-600!"
              hide-details
            />
            <v-text-field
              v-model="composeForm.subject"
              label="موضوع"
              variant="outlined"
              density="compact"
              class="mb-4 dark:text-slate-300 dark:bg-blue-grey! dark:border-slate-600!"
              hide-details
            />
            <v-textarea
              v-model="composeForm.body"
              label="متن پیام"
              variant="outlined"
              density="compact"
              class="mb-4 dark:text-slate-300 dark:bg-blue-grey! dark:border-slate-600!"
              rows="8"
              hide-details
            />
            <v-checkbox
              v-model="composeForm.confidential"
              label="محرمانه"
              color="amber"
              density="compact"
              hide-details
              class="mb-4 dark:text-slate-300 dark:bg-blue-grey! dark:border-slate-600!"
            />
            <div class="flex justify-end gap-3 pt-2">
              <v-btn variant="tonal" color="slate" class="bg-slate-100/80!" @click="cancelCompose">انصراف</v-btn>
              <v-btn
                color="#5465ff"
                :loading="sending"
                :disabled="sending"
                @click="sendMessage"
              >
                ارسال پیام
              </v-btn>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <template v-else-if="!selected">
          <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
              <v-icon size="36" color="slate-300">mdi-email-open-outline</v-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">پیامی را انتخاب کنید</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">برای مشاهده متن پیام، یکی از پیام‌های سمت چپ را انتخاب کنید</p>
          </div>
        </template>

        <!-- Message View -->
        <template v-else>
          <div class="p-6 border-b border-slate-100">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h2 class="text-lg font-extrabold text-slate-800 truncate">{{ selected.subject }}</h2>
                  <span v-if="selected.confidential" class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded text-[11px] font-bold shrink-0">محرمانه</span>
                  <span v-if="selected.priority === 'urgent'" class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200/60 rounded text-[11px] font-bold shrink-0">فوری</span>
                  <span v-else-if="selected.priority === 'low'" class="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[11px] font-bold shrink-0">کم اولویت</span>
                </div>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <template v-if="tab === 'sent' && selected.patient">
                    <span class="font-medium">گیرنده:</span>
                    <span class="text-slate-700 font-bold">{{ selected.patient.firstName }} {{ selected.patient.lastName }}</span>
                    <span class="w-1 h-1 rounded-full bg-slate-300" />
                    <span class="inline-flex items-center gap-1">
                      <v-icon size="14" color="slate-400">mdi-card-account-details-outline</v-icon>
                      <span dir="ltr" class="text-slate-600 font-medium">{{ selected.patient.nationalId }}</span>
                    </span>
                    <span v-if="selected.patient.phone" class="inline-flex items-center gap-1">
                      <v-icon size="14" color="slate-400">mdi-phone-outline</v-icon>
                      <span dir="ltr" class="text-slate-600 font-medium">{{ selected.patient.phone }}</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="font-medium">
                      {{ tab === 'inbox' ? 'فرستنده' : 'گیرنده' }}: <span class="text-slate-700">{{ tab === 'inbox' ? selected.sender_name : selected.recipient_name }}</span>
                    </span>
                  </template>
                  <span class="w-1 h-1 rounded-full bg-slate-300" />
                  <span class="font-medium">{{ formatDate(selected.created_at) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <v-btn variant="tonal" color="#5465ff" size="small" prepend-icon="mdi-reply" @click="replyTo">
                  پاسخ
                </v-btn>
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-6">
            <p class="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{{ selected.body }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>

  <PatientSearchDialog v-model="patientSearchDialog" @select="onPatientSelected" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment-jalaali'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()

const tab = ref<'inbox' | 'sent'>('inbox')
const messages = ref<any[]>([])
const selected = ref<any>(null)
const loading = ref(false)
const unreadCount = ref<number | null>(null)
const composing = ref(false)
const sending = ref(false)
const initialized = ref(false)
const patientSearchDialog = ref(false)
const selectedPatient = ref<any>(null)

const composeForm = ref({
  recipient: '',
  subject: '',
  body: '',
  priority: 'normal',
  confidential: false,
})

const priorityOptions = [
  { title: 'عادی', value: 'normal' },
  { title: 'فوری', value: 'urgent' },
  { title: 'کم اولویت', value: 'low' },
]

async function fetchMessages() {
  loading.value = true
  try {
    const endpoint = tab.value === 'inbox' ? '/api/messaging/inbox' : '/api/messaging/sent'
    const res = await apiFetch<any>(endpoint)
    if (res.success) {
      messages.value = res.data
    }
  } catch {
    $toast.error('خطا در دریافت پیام‌ها')
  } finally {
    loading.value = false
  }
}

async function fetchUnreadCount() {
  try {
    const res = await apiFetch<any>('/api/messaging/unread-count')
    if (res.success) {
      unreadCount.value = res.data ?? 0
    }
  } catch {
    unreadCount.value = 0
  }
}

async function selectMessage(msg: any) {
  selected.value = msg
  composing.value = false

  if (tab.value === 'inbox' && !msg.read) {
    try {
      await apiFetch(`/api/messaging/${msg.id}/read`, { method: 'PATCH' })
      msg.read = true
      unreadCount.value = Math.max(0, (unreadCount.value ?? 0) - 1)
    } catch {
      // silent
    }
  }
}

async function sendMessage() {
  const { recipient, subject, body, priority, confidential } = composeForm.value
  if (!recipient.trim() && !selectedPatient.value) {
    $toast.error('لطفاً گیرنده را انتخاب کنید')
    return
  }
  if (!subject.trim()) {
    $toast.error('لطفاً موضوع را وارد کنید')
    return
  }
  if (!body.trim()) {
    $toast.error('لطفاً متن پیام را وارد کنید')
    return
  }

  sending.value = true
  try {
    const payload: any = { subject: subject.trim(), body: body.trim(), priority, confidential }
    if (selectedPatient.value) {
      payload.patient_id = selectedPatient.value.id
    } else {
      payload.recipient_id = recipient.trim()
    }

    const res = await apiFetch<any>('/api/messaging/send', {
      method: 'POST',
      body: payload,
    })
    if (res.success) {
      $toast.success('پیام با موفقیت ارسال شد')
      composing.value = false
      composeForm.value = { recipient: '', subject: '', body: '', priority: 'normal', confidential: false }
      selectedPatient.value = null
      selected.value = null
      if (tab.value === 'sent') {
        await fetchMessages()
      }
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارسال پیام')
  } finally {
    sending.value = false
  }
}

function startCompose() {
  composing.value = true
  selected.value = null
  selectedPatient.value = null
}

function onPatientSelected(patient: any) {
  selectedPatient.value = patient
}

function removeSelectedPatient() {
  selectedPatient.value = null
}

function cancelCompose() {
  composing.value = false
  composeForm.value = { recipient: '', subject: '', body: '', priority: 'normal', confidential: false }
  selectedPatient.value = null
}

function replyTo() {
  if (!selected.value) return
  composing.value = true
  selectedPatient.value = null
  composeForm.value = {
    recipient: tab.value === 'inbox' ? selected.value.sender_name : selected.value.recipient_name,
    subject: selected.value.subject.startsWith('پاسخ:') ? selected.value.subject : `پاسخ: ${selected.value.subject}`,
    body: '',
    priority: 'normal',
    confidential: false,
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return moment(dateStr).format('jDD jMMMM jYYYY ساعت HH:mm')
}

function refreshMessages() {
  fetchMessages()
  fetchUnreadCount()
}

watch(tab, () => {
  selected.value = null
  composing.value = false
  fetchMessages()
})

onMounted(() => {
  if (initialized.value) return
  initialized.value = true
  fetchMessages()
  fetchUnreadCount()
})

useSeoMeta({
  title: 'پیام‌ها | سیستم مدیریت',
})
</script>
