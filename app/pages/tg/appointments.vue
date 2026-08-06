<template>
  <div class="tg-fade-in px-4 pt-4">
    <div class="flex items-center gap-3 mb-4">
      <button type="button" class="flex items-center justify-center w-9 h-9 rounded-full shrink-0" style="background: var(--tg-sec-bg);" @click="navigateTo('/tg')">
        <Icon name="lucide:arrow-right" size="20" style="color: var(--tg-text);" />
      </button>
      <h1 class="text-[17px] font-bold" style="color: var(--tg-text);">نوبت‌های من</h1>
    </div>

    <div class="flex gap-2 mb-4">
      <button
        type="button"
        class="tg-chip flex-1"
        :class="{ active: tab === 'upcoming' }"
        @click="tab = 'upcoming'"
      >
        نوبت‌های پیش رو ({{ upcoming.length }})
      </button>
      <button
        type="button"
        class="tg-chip flex-1"
        :class="{ active: tab === 'past' }"
        @click="tab = 'past'"
      >
        گذشته ({{ past.length }})
      </button>
    </div>

    <div v-if="loading" class="tg-empty" style="min-height: 40vh;">
      <div class="w-8 h-8 rounded-full" style="border: 3px solid var(--tg-sec-bg); border-top-color: var(--tg-btn); animation: spin 0.8s linear infinite;"/>
    </div>

    <div v-else-if="!list.length" class="tg-card tg-empty">
      <Icon name="lucide:calendar-x" size="36" style="color: var(--tg-hint);" />
      <p class="text-sm font-medium">{{ tab === 'upcoming' ? 'نوبت فعالی ندارید' : 'نوبت گذشته‌ای ندارید' }}</p>
      <NuxtLink v-if="tab === 'upcoming'" to="/tg/book" class="tg-btn tg-btn-primary mt-3 text-sm" style="padding: 11px 20px; width: auto;">رزرو نوبت</NuxtLink>
    </div>

    <div v-else class="space-y-3">
      <div v-for="a in list" :key="a.id" class="tg-card tg-fade-in">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ background: a.visitTypeColor || 'var(--tg-btn)' }"/>
            <span class="font-bold text-[14.5px]" style="color: var(--tg-text);">{{ a.visitTypeName || 'ویزیت' }}</span>
          </div>
          <span class="tg-badge" :class="badgeClass(a.status)">{{ statusLabel(a.status) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-[13px]" style="color: var(--tg-hint);">
            <div class="mb-1 font-semibold" style="color: var(--tg-text);">{{ a.doctorName }}</div>
            <div>{{ formatJalali(a.appointmentDate) }}</div>
          </div>
          <div class="text-left">
            <div class="text-[20px] font-black" style="color: var(--tg-btn);">{{ a.startTime }}</div>
            <div class="text-[11px]" style="color: var(--tg-hint);">ساعت شروع</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import { useMiniAppAuth } from '~/composables/useMiniAppAuth'

definePageMeta({ layout: 'tg' })

const auth = useMiniAppAuth()

const tab = ref<'upcoming' | 'past'>('upcoming')
const upcoming = ref<any[]>([])
const past = ref<any[]>([])
const loading = ref(true)

const list = computed(() => (tab.value === 'upcoming' ? upcoming.value : past.value))

const formatJalali = (date: string) => moment(date, 'YYYY-MM-DD').format('jDD jMMMM jYYYY')
const statusLabel = (s: string) =>
  ({ pending: 'در انتظار', confirmed: 'تأیید شده', completed: 'انجام شده', cancelled: 'لغو شده' } as Record<string, string>)[s] || s
const badgeClass = (s: string) =>
  ({ pending: 'tg-badge-pending', confirmed: 'tg-badge-confirmed', completed: 'tg-badge-completed', cancelled: 'tg-badge-cancelled' } as Record<string, string>)[s] || 'tg-badge-info'

onMounted(async () => {
  auth.hydrate()
  if (!auth.isAuthenticated.value) {
    navigateTo('/tg')
    return
  }
  try {
    const res = await auth.api<any>('/api/miniapp/appointments', { method: 'GET' })
    upcoming.value = res.upcoming || []
    past.value = res.past || []
  } catch {
    upcoming.value = []
    past.value = []
  } finally {
    loading.value = false
  }
})

useHead({ title: 'نوبت‌های من' })
</script>
