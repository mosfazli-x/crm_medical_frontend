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

    <!-- Controls -->
    <div class="pl-controls">
      <label class="pl-sort">
        <Icon name="lucide:arrow-up-down" size="15" />
        <select v-model="sort" class="app-input" aria-label="ترتیب نمایش">
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </label>
      <button type="button" class="app-btn app-btn--ghost pl-filter" @click="filterOpen = true">
        <Icon name="lucide:sliders-horizontal" size="16" />
        <span>فیلتر</span>
        <span v-if="activeFilterCount" class="pl-badge">{{ pn(activeFilterCount) }}</span>
      </button>
    </div>

    <!-- Active filter chips -->
    <div v-if="activeFilterCount" class="pl-chips">
      <button
        v-for="chip in activeChips"
        :key="chip.key"
        type="button"
        class="app-pill pl-chip"
        @click="clearFilter(chip.key)"
      >
        {{ chip.label }}
        <Icon name="lucide:x" size="13" />
      </button>
      <button type="button" class="app-pill pl-chip pl-chip--clear" @click="clearAllFilters">پاک‌سازی همه</button>
    </div>

    <div v-if="total" class="app-section">
      <h2>بیماران</h2>
      <span class="app-muted" style="font-size: 12.5px; font-weight: 600;">{{ pn(total) }} پرونده</span>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading && !items.length" class="app-list app-mt-16">
      <div v-for="i in 6" :key="i" class="app-skel" style="height: 76px;" />
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
      <p>{{ hasAnyFilter ? 'بیماری با این مشخصات یافت نشد' : 'هنوز بیماری ثبت نشده است' }}</p>
      <button v-if="hasAnyFilter" type="button" class="app-btn app-btn--ghost" style="width: auto;" @click="clearAllFilters">
        پاک‌سازی فیلترها
      </button>
    </div>

    <!-- Results -->
    <div v-else class="app-list app-mt-16">
      <NuxtLink
        v-for="patient in items"
        :key="patient.id"
        :to="`/app/patients/${patient.id}`"
        class="app-row pl-row"
      >
        <span class="app-avatar">{{ initials(patient) }}</span>
        <span class="app-row__body">
          <span class="app-row__title">{{ fullName(patient) }}</span>
          <span class="app-row__sub">
            {{ patient.phone || 'بدون شماره تماس' }}
            <template v-if="patient.nationalId"> · {{ patient.nationalId }}</template>
          </span>
          <span class="pl-meta">
            <span v-if="age(patient) !== null" class="app-pill app-pill--neutral">
              {{ pn(age(patient)!) }} سال
            </span>
            <span v-if="insuranceLabel(patient)" class="app-pill app-pill--indigo">
              {{ insuranceLabel(patient) }}
            </span>
            <span v-if="patient.maritalStatus" class="app-pill app-pill--neutral">
              {{ patient.maritalStatus }}
            </span>
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

    <!-- Filter dialog -->
    <UiDialog v-model="filterOpen" title="فیلتر بیماران" size="sm">
      <div class="app-filter">
        <AppField label="وضعیت تأهل">
          <select v-model="filters.maritalStatus" class="app-input">
            <option value="all">همه</option>
            <option v-for="m in maritalOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </AppField>
        <AppField label="نوع بیمه">
          <select v-model="filters.insuranceType" class="app-input">
            <option value="all">همه</option>
            <option v-for="opt in insuranceOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
          </select>
        </AppField>
        <AppField label="بازه سنی (سال)">
          <div class="app-filter__range">
            <input v-model.number="filters.ageFrom" class="app-input" type="number" min="0" max="130" placeholder="از" dir="ltr">
            <input v-model.number="filters.ageTo" class="app-input" type="number" min="0" max="130" placeholder="تا" dir="ltr">
          </div>
        </AppField>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="resetFilters">بازنشانی</button>
        <button type="button" class="app-btn app-btn--primary" @click="applyFilters">اعمال فیلتر</button>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import type { PatientListItem } from '~/types/patient'
import { INSURANCE_TYPE_VALUES, getInsuranceInfo } from '~/types/insurance'

definePageMeta({ layout: 'app', appTitle: 'بیماران', appSubtitle: 'پرونده‌ها' })

const { listPatients } = usePatients()
const { pn } = useLang()

const LIMIT = 20

const query = ref('')
const sort = ref('created_at_desc')
const items = ref<PatientListItem[]>([])
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(false)
const sentinel = ref<HTMLElement | null>(null)

const filterOpen = ref(false)
const maritalOptions = ['مجرد', 'متاهل', 'مطلقه', 'بیوه']
const insuranceOptions = INSURANCE_TYPE_VALUES
const filters = reactive<{
  maritalStatus: string
  insuranceType: string
  ageFrom: number | null
  ageTo: number | null
}>({
  maritalStatus: 'all',
  insuranceType: 'all',
  ageFrom: null,
  ageTo: null,
})

const sortOptions = [
  { value: 'created_at_desc', label: 'جدیدترین' },
  { value: 'created_at_asc', label: 'قدیمی‌ترین' },
  { value: 'full_name_asc', label: 'نام (الف–ی)' },
  { value: 'full_name_desc', label: 'نام (ی–الف)' },
  { value: 'birth_date_desc', label: 'بزرگ‌ترها' },
  { value: 'birth_date_asc', label: 'کوچک‌ترها' },
]

const hasMore = computed(() => page.value < totalPages.value)

const fullName = (p: PatientListItem) =>
  [p.firstName, p.lastName].filter(Boolean).join(' ') || 'بیمار بدون نام'
const initials = (p: PatientListItem) =>
  `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}` || '؟'

function age(p: PatientListItem): number | null {
  if (!p.birthDate) return null
  const d = new Date(p.birthDate)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years -= 1
  return years >= 0 && years <= 130 ? years : null
}

function insuranceLabel(p: PatientListItem): string {
  return getInsuranceInfo(p.insuranceType)?.label || ''
}

// ─── Filters ───
const activeFilterCount = computed(() => {
  let n = 0
  if (filters.maritalStatus !== 'all') n += 1
  if (filters.insuranceType !== 'all') n += 1
  if (filters.ageFrom != null || filters.ageTo != null) n += 1
  return n
})

const activeChips = computed(() => {
  const chips: { key: keyof typeof filters | 'age'; label: string }[] = []
  if (filters.maritalStatus !== 'all') chips.push({ key: 'maritalStatus', label: filters.maritalStatus })
  if (filters.insuranceType !== 'all') chips.push({ key: 'insuranceType', label: insuranceLabel({ insuranceType: filters.insuranceType } as PatientListItem) })
  if (filters.ageFrom != null || filters.ageTo != null) {
    chips.push({ key: 'age', label: `سن: ${filters.ageFrom ?? '۰'} تا ${filters.ageTo ?? '∞'}` })
  }
  return chips
})

const hasAnyFilter = computed(() => !!query.value.trim() || activeFilterCount.value > 0)

function ageToBirthRange(from: number | null, to: number | null): { birthFrom?: string; birthTo?: string } {
  const now = new Date()
  const out: { birthFrom?: string; birthTo?: string } = {}
  if (to != null) {
    const d = new Date(now.getFullYear() - to, now.getMonth(), now.getDate())
    out.birthFrom = d.toISOString().slice(0, 10)
  }
  if (from != null) {
    const d = new Date(now.getFullYear() - from - 1, now.getMonth(), now.getDate() + 1)
    out.birthTo = d.toISOString().slice(0, 10)
  }
  return out
}

function clearFilter(key: keyof typeof filters | 'age') {
  if (key === 'age') {
    filters.ageFrom = null
    filters.ageTo = null
  } else if (key === 'maritalStatus') {
    filters.maritalStatus = 'all'
  } else if (key === 'insuranceType') {
    filters.insuranceType = 'all'
  }
  void load(true)
}

function resetFilters() {
  filters.maritalStatus = 'all'
  filters.insuranceType = 'all'
  filters.ageFrom = null
  filters.ageTo = null
}

function applyFilters() {
  filterOpen.value = false
  void load(true)
}

function clearAllFilters() {
  query.value = ''
  resetFilters()
  void load(true)
}

async function load(reset = false) {
  if (reset) {
    page.value = 1
    items.value = []
    loading.value = true
    error.value = false
  } else {
    loadingMore.value = true
  }
  const range = ageToBirthRange(filters.ageFrom, filters.ageTo)
  try {
    const res = await listPatients({
      page: page.value,
      limit: LIMIT,
      q: query.value,
      maritalStatus: filters.maritalStatus,
      insuranceType: filters.insuranceType,
      birthFrom: range.birthFrom,
      birthTo: range.birthTo,
      sort: sort.value,
    })
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

watch(sort, () => void load(true))

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

<style scoped>
.pl-controls {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.pl-sort {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  padding-inline: 12px;
  border-radius: var(--app-radius);
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-muted);
}

.pl-sort .app-input {
  border: none;
  padding-inline: 0;
  background: transparent;
  font-weight: 600;
}

.pl-filter {
  position: relative;
  flex: 0 0 auto;
  width: auto;
  gap: 6px;
}

.pl-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--app-brand);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.pl-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.pl-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: 1px solid var(--app-border);
}

.pl-chip--clear {
  color: var(--app-expense);
  border-color: transparent;
  background: var(--app-rose-soft);
}

.pl-row {
  align-items: flex-start;
}

.pl-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}

.app-filter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-filter__range {
  display: flex;
  gap: 10px;
}

.app-filter__range .app-input {
  flex: 1 1 0;
  min-width: 0;
}
</style>
