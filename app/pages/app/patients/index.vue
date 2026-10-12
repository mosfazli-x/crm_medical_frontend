<template>
  <div class="app-rise">
    <div class="app-search">
      <Icon class="app-search__icon" name="lucide:search" size="19" />
      <input
        v-model="query"
        class="app-input"
        type="search"
        inputmode="search"
        placeholder="جستجوی نام، شماره تماس یا کد ملی…"
        aria-label="جستجوی بیمار"
      >
    </div>

    <div v-if="total" class="app-section">
      <h2>بیماران</h2>
      <span class="app-muted" style="font-size: 12.5px; font-weight: 600;">{{ pn(total) }} پرونده</span>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading && !items.length" class="app-list app-mt-16">
      <div v-for="i in 6" :key="i" class="app-skel" style="height: 70px;" />
    </div>

    <!-- Error -->
    <div v-else-if="error && !items.length" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:wifi-off" size="26" /></span>
      <p>دریافت لیست بیماران ناموفق بود</p>
      <button type="button" class="app-btn app-btn--ghost" style="width: auto;" @click="reload">تلاش دوباره</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:user-search" size="26" /></span>
      <p>{{ query ? 'بیماری با این مشخصات یافت نشد' : 'هنوز بیماری ثبت نشده است' }}</p>
    </div>

    <!-- Results -->
    <div v-else class="app-list app-mt-16">
      <NuxtLink
        v-for="patient in items"
        :key="patient.id"
        :to="`/app/patients/${patient.id}`"
        class="app-row"
      >
        <span class="app-avatar">{{ initials(patient) }}</span>
        <span class="app-row__body">
          <span class="app-row__title">{{ fullName(patient) }}</span>
          <span class="app-row__sub">
            {{ patient.phone || 'بدون شماره تماس' }}
            <template v-if="patient.nationalId"> · {{ patient.nationalId }}</template>
          </span>
        </span>
        <span class="app-row__tail">
          <Icon class="app-muted" name="lucide:chevron-left" size="20" />
        </span>
      </NuxtLink>

      <div ref="sentinel" style="height: 1px;" />

      <div v-if="loadingMore" style="display: flex; justify-content: center; padding: 16px;">
        <span class="app-spinner" />
      </div>
      <button
        v-else-if="hasMore"
        type="button"
        class="app-btn app-btn--ghost app-mt-8"
        @click="loadMore"
      >
        بارگذاری بیشتر
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PatientListItem } from '~/types/patient'

definePageMeta({ layout: 'app', appTitle: 'بیماران', appSubtitle: 'پرونده‌ها' })

const { listPatients } = usePatients()
const { pn } = useLang()

const LIMIT = 20

const query = ref('')
const items = ref<PatientListItem[]>([])
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(false)
const sentinel = ref<HTMLElement | null>(null)

const hasMore = computed(() => page.value < totalPages.value)

const fullName = (p: PatientListItem) =>
  [p.firstName, p.lastName].filter(Boolean).join(' ') || 'بیمار بدون نام'
const initials = (p: PatientListItem) =>
  `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}` || '؟'

async function load(reset = false) {
  if (reset) {
    page.value = 1
    items.value = []
    loading.value = true
    error.value = false
  } else {
    loadingMore.value = true
  }
  try {
    const res = await listPatients({ page: page.value, limit: LIMIT, q: query.value })
    const batch = res?.data || []
    items.value = reset ? batch : [...items.value, ...batch]
    total.value = res?.pagination?.total ?? items.value.length
    totalPages.value = res?.pagination?.totalPages ?? 1
  } catch {
    error.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (loading.value || loadingMore.value || !hasMore.value) return
  page.value += 1
  void load(false)
}

function reload() {
  void load(true)
}

let debounce: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
  clearTimeout(debounce)
  debounce = setTimeout(() => void load(true), 350)
})

let observer: IntersectionObserver | null = null
watch(sentinel, (el, prev) => {
  if (prev) observer?.unobserve(prev)
  if (el) observer?.observe(el)
})

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { rootMargin: '320px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
  void load(true)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(debounce)
})
</script>
