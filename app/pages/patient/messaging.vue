<template>
  <UiPageContainer>
    <UiPageHeader title="ارتباط با پزشک" subtitle="ارسال پیام، طرح سوالات و پیگیری روند درمان" />

    <div class="flex! flex-col! lg:flex-row! gap-6! h-[calc(100vh-16rem)]! min-h-[650px]!">
      
      <UiContentCard card-class="w-full! lg:w-[380px]! shrink-0! flex! flex-col! bg-white! border! border-slate-200/60! shadow-sm! rounded-2xl!">
        <div class="px-4! pt-4! border-b! border-slate-100! space-y-4!">
          <v-btn 
            color="#4F46E5" 
            block 
            class="font-bold! tracking-wide! rounded-xl! shadow-md! shadow-blue-500/20!" 
            prepend-icon="mdi-plus" 
            height="44"
            @click="startCompose"
          >
            پیام جدید به پزشک
          </v-btn>
          
          <v-tabs v-model="tab" color="#4F46E5" bg-color="transparent" density="compact" class="border-b! border-slate-100! text-slate-600!">
            <v-tab value="inbox" class="text-xs! font-bold! tracking-wide!">
              دریافتی‌ها
              <v-badge v-if="unreadCount > 0" :content="unreadCount" color="error" inline class="mr-1.5!" />
            </v-tab>
            <v-tab value="sent" class="text-xs! font-bold! tracking-wide!">ارسال شده</v-tab>
          </v-tabs>
        </div>

        <div class="flex-1! overflow-y-auto! bg-slate-50/30!">
          <div v-if="loading" class="flex! flex-col! items-center! justify-center! py-20!">
            <v-progress-circular indeterminate size="28" color="#4F46E5" width="3" />
            <p class="mt-4! text-xs! font-semibold! text-slate-400!">در حال همگام‌سازی...</p>
          </div>

          <div v-else-if="!messages.length" class="flex! flex-col! items-center! justify-center! py-20! px-6! text-center!">
            <div class="w-14! h-14! bg-white! rounded-2xl! flex! items-center! justify-center! mb-4! border! border-slate-100! shadow-sm!">
              <v-icon size="24" color="slate-300">mdi-message-outline</v-icon>
            </div>
            <h3 class="text-sm! font-bold! text-slate-700!">{{ tab === 'inbox' ? 'پیام جدیدی ندارید' : 'پیامی ارسال نکرده‌اید' }}</h3>
            <p class="text-xs! text-slate-400! mt-2! leading-relaxed!">{{ tab === 'inbox' ? 'پاسخ‌های پزشک در این قسمت نمایش داده می‌شوند.' : 'برای طرح سوال جدید روی دکمه بالا کلیک کنید.' }}</p>
          </div>

          <div v-else class="divide-y! divide-slate-100/80!">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="px-5! py-4! cursor-pointer! transition-colors! duration-200!"
              :class="selected?.id === msg.id ? 'bg-blue-50/50! border-r-2! border-blue-500!' : 'hover:bg-white!'"
              @click="selectMessage(msg)"
            >
              <div class="flex! items-start! justify-between! gap-3!">
                <div class="flex-1! min-w-0!">
                  <div class="flex! items-center! gap-2! mb-1.5!">
                    <span v-if="msg.isRead === false && tab === 'inbox'" class="w-2! h-2! rounded-full! bg-blue-500! shrink-0!" />
                    <span class="text-sm! font-bold! text-slate-800! truncate!">
                      {{ tab === 'inbox' ? `دکتر ${msg.receiverFullName}` : msg.subject }}
                    </span>
                  </div>
                  <p class="text-xs! font-medium! text-slate-500! truncate!">{{ tab === 'inbox' ? msg.subject : `به: دکتر ${msg.recipient_name}` }}</p>
                </div>
                <span class="text-[10px]! font-medium! text-slate-400! shrink-0! mt-1!">{{ formatShortDate(msg.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </UiContentCard>

      <UiContentCard card-class="flex-1! flex! flex-col! bg-white! border! border-slate-200/60! shadow-sm! rounded-2xl! overflow-hidden!">
        
        <template v-if="composing">
          <div class="px-8! py-5! border-b! border-slate-100! flex! items-center! justify-between! bg-slate-50/30!">
            <div>
              <h2 class="text-base! font-extrabold! text-slate-800!">پیام جدید</h2>
              <p class="text-xs! text-slate-500! mt-1!">سوال یا درخواست خود را به صورت واضح بیان کنید.</p>
            </div>
            <v-btn icon variant="text" size="small" color="slate-400" @click="cancelCompose">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          
          <div class="flex-1! overflow-y-auto! p-8!">
            <div class="max-w-2xl! space-y-6!">
              <div>
                <label class="block! text-xs! font-bold! text-slate-700! mb-2!">پزشک معالج <span class="text-red-500!">*</span></label>
                <v-select
                  v-model="composeForm.doctor_id"
                  :items="doctors"
                  item-title="fullName"
                  item-value="id"
                  variant="outlined"
                  density="comfortable"
                  placeholder="پزشک خود را انتخاب کنید"
                  hide-details
                  class="bg-white!"
                  rounded="lg"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.specialty" class="text-sm! font-medium!"></v-list-item>
                  </template>
                </v-select>
              </div>

              <div>
                <label class="block! text-xs! font-bold! text-slate-700! mb-2!">موضوع پیام <span class="text-red-500!">*</span></label>
                <v-text-field
                  v-model="composeForm.subject"
                  variant="outlined"
                  density="comfortable"
                  placeholder="مثال: تداخل دارویی یا عوارض جانبی"
                  hide-details
                  class="bg-white!"
                  rounded="lg"
                />
              </div>

              <div>
                <label class="block! text-xs! font-bold! text-slate-700! mb-2!">اولویت بررسی</label>
                <v-select
                  v-model="composeForm.priority"
                  :items="priorityOptions"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="bg-white!"
                  rounded="lg"
                />
              </div>

              <div>
                <label class="block! text-xs! font-bold! text-slate-700! mb-2!">شرح کامل <span class="text-red-500!">*</span></label>
                <v-textarea
                  v-model="composeForm.body"
                  variant="outlined"
                  placeholder="علائم، سوالات یا توضیحات خود را اینجا بنویسید..."
                  rows="6"
                  hide-details
                  class="bg-white!"
                  rounded="lg"
                  auto-grow
                />
              </div>
            </div>
          </div>
          
          <div class="p-6! border-t! border-slate-100! bg-slate-50/50! flex! justify-end! gap-3!">
            <v-btn variant="text" color="slate-600" class="font-bold! tracking-wide!" @click="cancelCompose">
              انصراف
            </v-btn>
            <v-btn
              color="#4F46E5"
              class="font-bold! tracking-wide! rounded-xl! px-8!"
              :loading="sending"
              :disabled="sending"
              elevation="0"
              @click="sendMessage"
            >
              ارسال به پزشک
            </v-btn>
          </div>
        </template>

        <template v-else-if="!selected">
          <div class="flex-1! flex! flex-col! items-center! justify-center! p-10! text-center! bg-slate-50/20!">
            <div class="w-20! h-20! rounded-full! bg-slate-50! flex! items-center! justify-center! mb-6! border! border-slate-100!">
              <v-icon size="32" color="slate-300">mdi-text-box-search-outline</v-icon>
            </div>
            <h3 class="text-base! font-extrabold! text-slate-700!">محتوای پیام</h3>
            <p class="text-sm! text-slate-400! mt-2! max-w-xs!">برای مشاهده جزئیات، یکی از گفتگوهای لیست کناری را انتخاب کنید.</p>
          </div>
        </template>

        <template v-else>
          <div class="px-8! py-6! border-b! border-slate-100! bg-white!">
            <div class="flex! items-start! justify-between! gap-4!">
              <div>
                <h2 class="text-lg! font-black! text-slate-800! leading-tight! mb-3!">{{ selected.subject }}</h2>
                <div class="flex! items-center! gap-3! text-xs! font-medium!">
                  <div class="flex! items-center! gap-1.5! bg-slate-50! px-2.5! py-1! rounded-lg! border! border-slate-100!">
                    <v-icon size="14" color="slate-400">mdi-doctor</v-icon>
                    <span class="text-slate-600!">
                      {{ tab === 'inbox' ? `دکتر ${selected.receiverFullName}` : `ارسال به دکتر ${selected.recipient_name}` }}
                    </span>
                  </div>
                  <span class="text-slate-400!">{{ formatLongDate(selected.created_at) }}</span>
                  <span v-if="selected.priority === 'urgent'" class="px-2! py-1! bg-red-50! text-red-600! rounded-lg! font-bold!">فوری</span>
                </div>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="slate-400"
                  class="!shrink-0! !opacity-60! hover:!opacity-100! hover:!text-red-500! transition-all! duration-200!"
                  :loading="deleting"
                  :disabled="deleting"
                  @click="deleteMessage(selected)"
                >
                  <v-icon size="20">mdi-trash-can-outline</v-icon>
                  <v-tooltip activator="parent" location="bottom">حذف پیام</v-tooltip>
                </v-btn>
              </div>

            </div>
          </div>
          
          <div class="flex-1! overflow-y-auto! p-8! bg-slate-50/10!">
            <div class="bg-white! border! border-slate-100! rounded-2xl! p-6! shadow-sm!">
              <p class="text-sm! text-slate-700! leading-8! whitespace-pre-wrap! font-medium!">{{ selected.body }}</p>
            </div>
          </div>
        </template>

      </UiContentCard>
    </div>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import moment from 'moment-jalaali'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()

const tab = ref<'inbox' | 'sent'>('inbox')
const messages = ref<any[]>([])
const doctors = ref<any[]>([])
const selected = ref<any>(null)
const loading = ref(false)
const unreadCount = ref<number>(0)
const composing = ref(false)
const sending = ref(false)
const deleting = ref(false)
const initialized = ref(false)

const composeForm = ref({
  doctor_id: null as number | null,
  subject: '',
  body: '',
  priority: 'normal',
})

const priorityOptions = [
  { title: 'عادی (پاسخ در زمان آزاد پزشک)', value: 'normal' },
  { title: 'فوری (نیاز به توجه سریع)', value: 'urgent' },
]

async function fetchDoctors() {
  try {
    const res = await apiFetch<any>('/api/patient/doctors')
    if (res.success) {
      doctors.value = res.data
      if (doctors.value.length === 1) {
        composeForm.value.doctor_id = doctors.value[0].id
      }
    }
  } catch {
    // silent
  }
}

async function fetchMessages() {
  loading.value = true
  try {
    const endpoint = tab.value === 'inbox' ? '/api/messaging/inbox' : '/api/messaging/sent'
    const res = await apiFetch<any>(endpoint)
    if (res.success) {
      messages.value = res.data
    }
  } catch {
    $toast.error('خطا در دریافت لیست پیام‌ها')
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

  // بررسی وضعیت دقیق isRead بجای read
  if (tab.value === 'inbox' && msg.isRead === false) {
    // اعمال فوری روی رابط کاربری (Optimistic UI Update)
    msg.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    
    try {
      await apiFetch(`/api/messaging/${msg.id}/read`, { method: 'PATCH' })
    } catch {
      // در صورت بروز خطا در سرور، می‌توان وضعیت را به حالت قبل بازگرداند
      // msg.isRead = false
      // unreadCount.value++
    }
  }
}

async function sendMessage() {
  const { doctor_id, subject, body, priority } = composeForm.value
  
  if (!doctor_id) {
    $toast.error('لطفاً پزشک مورد نظر را انتخاب کنید')
    return
  }
  if (!subject.trim()) {
    $toast.error('وارد کردن موضوع پیام الزامی است')
    return
  }
  if (!body.trim()) {
    $toast.error('لطفاً متن پیام خود را بنویسید')
    return
  }

  sending.value = true
  try {
    const payload = { 
      receiver_id: doctor_id, 
      subject: subject.trim(), 
      body: body.trim(), 
      priority 
    }

    const res = await apiFetch<any>('/api/messaging/send', {
      method: 'POST',
      body: payload,
    })
    
    if (res.success) {
      $toast.success('پیام شما با موفقیت برای پزشک ارسال شد')
      composing.value = false
      resetForm()
      if (tab.value === 'sent') {
        await fetchMessages()
      } else {
        tab.value = 'sent' 
      }
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'مشکلی در ارسال پیام به وجود آمد')
  } finally {
    sending.value = false
  }
}

async function deleteMessage(msg: any) {
  if (!msg?.id) return
  const confirmed = confirm('آیا از حذف این پیام اطمینان دارید؟')
  if (!confirmed) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/messaging/${msg.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success('پیام با موفقیت حذف شد')
      messages.value = messages.value.filter(m => m.id !== msg.id)
      if (selected.value?.id === msg.id) {
        selected.value = messages.value.length > 0 ? messages.value[0] : null
      }
      if (tab.value === 'inbox' && unreadCount.value > 0) {
        await fetchUnreadCount()
      }
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در حذف پیام')
  } finally {
    deleting.value = false
  }
}

function startCompose() {
  composing.value = true
  selected.value = null
  if (doctors.value.length === 1) {
    composeForm.value.doctor_id = doctors.value[0].id
  }
}

function cancelCompose() {
  composing.value = false
  resetForm()
}

function resetForm() {
  composeForm.value = {
    doctor_id: doctors.value.length === 1 ? doctors.value[0].id : null,
    subject: '',
    body: '',
    priority: 'normal',
  }
}

function formatShortDate(dateStr: string) {
  if (!dateStr) return ''
  return moment(dateStr).format('jDD jMMMM')
}

function formatLongDate(dateStr: string) {
  if (!dateStr) return ''
  return moment(dateStr).format('jDD jMMMM jYYYY - ساعت HH:mm')
}

watch(tab, () => {
  selected.value = null
  composing.value = false
  fetchMessages()
})

onMounted(() => {
  if (initialized.value) return
  initialized.value = true
  fetchDoctors()
  fetchMessages()
  fetchUnreadCount()
})

useSeoMeta({
  title: 'پیام‌ها | پنل بیمار',
})
</script>