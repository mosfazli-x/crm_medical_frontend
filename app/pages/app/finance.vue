<template>
  <div class="app-rise">
    <!-- Loading -->
    <div v-if="showSkeleton" class="app-list">
      <div class="app-skel" style="height: 56px;" />
      <div class="app-stats">
        <div v-for="i in 3" :key="i" class="app-skel" style="height: 92px;" />
      </div>
      <div v-for="i in 4" :key="i" class="app-skel" style="height: 68px;" />
    </div>

    <!-- Restricted -->
    <div v-else-if="showRestricted" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:lock" size="26" /></span>
      <p>دسترسی به بخش مالی برای نقش شما فعال نیست</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError && !summary" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:triangle-alert" size="26" /></span>
      <p>دریافت اطلاعات مالی ناموفق بود</p>
      <button type="button" class="app-btn app-btn--ghost" style="width: auto;" @click="refresh">تلاش دوباره</button>
    </div>

    <template v-else>
      <!-- Period navigator -->
      <div class="app-section" style="margin-top: 2px;">
        <button type="button" class="app-iconbtn" aria-label="دورهٔ قبل" @click="shiftMonth(-1)">
          <Icon name="lucide:chevron-right" size="18" />
        </button>
        <h2>{{ monthLabel }}</h2>
        <button type="button" class="app-iconbtn" aria-label="دورهٔ بعد" @click="shiftMonth(1)">
          <Icon name="lucide:chevron-left" size="18" />
        </button>
      </div>

      <!-- Totals -->
      <section class="app-stats">
        <div class="app-stat">
          <span class="app-stat__label"><Icon name="lucide:trending-up" size="14" /> درآمد</span>
          <span class="app-stat__value app-stat__value--income">{{ formatRial(currentTotals.incomeRial) }}</span>
          <span v-if="deltaText(deltas.income)" class="app-stat__hint">{{ deltaText(deltas.income) }}</span>
        </div>
        <div class="app-stat">
          <span class="app-stat__label"><Icon name="lucide:trending-down" size="14" /> هزینه</span>
          <span class="app-stat__value app-stat__value--expense">{{ formatRial(currentTotals.expenseRial) }}</span>
          <span v-if="deltaText(deltas.expense)" class="app-stat__hint">{{ deltaText(deltas.expense) }}</span>
        </div>
        <div class="app-stat">
          <span class="app-stat__label"><Icon name="lucide:wallet" size="14" /> مانده</span>
          <span class="app-stat__value">{{ formatRial(currentTotals.netRial) }}</span>
          <span class="app-stat__hint">{{ pn(currentTotals.entryCount) }} تراکنش</span>
        </div>
      </section>

      <!-- Entries -->
      <div class="app-section">
        <h2>آخرین تراکنش‌ها</h2>
        <NuxtLink to="/finance">مشاهدهٔ همه</NuxtLink>
      </div>

      <div v-if="!recentEntries.length" class="app-empty">
        <span class="app-empty__icon"><Icon name="lucide:receipt" size="26" /></span>
        <p>در این دوره تراکنشی ثبت نشده است</p>
      </div>

      <div v-else class="app-list">
        <div v-for="entry in recentEntries" :key="entry.id" class="app-row">
          <span
            class="app-avatar"
            style="width: 40px; height: 40px; border-radius: 13px;"
            :style="{ background: entry.kind === 'income' ? 'var(--app-green-soft)' : 'var(--app-rose-soft)', color: entry.kind === 'income' ? 'var(--app-income)' : 'var(--app-expense)' }"
          >
            <Icon :name="entry.kind === 'income' ? 'lucide:arrow-down-left' : 'lucide:arrow-up-right'" size="19" />
          </span>
          <span class="app-row__body">
            <span class="app-row__title">{{ entry.description || entry.categoryName }}</span>
            <span class="app-row__sub">{{ entry.categoryName }} · {{ formatGregorianDate(entry.entryDate) }}</span>
          </span>
          <span class="app-row__tail">
            <span
              style="font-size: 14px; font-weight: 800;"
              :style="{ color: entry.kind === 'income' ? 'var(--app-income)' : 'var(--app-expense)' }"
            >
              {{ entry.kind === 'income' ? '+' : '−' }}{{ formatRial(entry.amountRial) }}
            </span>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'app', appTitle: 'مالی', appSubtitle: 'صندوق کلینیک' })

const { locale } = useI18n()
const { pn } = useLang()
const { user } = useAuth()
const { formatGregorianDate } = useFormatting()
const { $toast } = useNuxtApp()

const {
  canEdit,
  loadError,
  summary,
  currentTotals,
  deltas,
  entries,
  monthLabel,
  shiftMonth,
  refresh,
} = useFinance()

const isFa = computed(() => locale.value === 'fa')
const showRestricted = computed(() => !!user.value && !canEdit.value)
const showSkeleton = computed(() => {
  if (!user.value) return true
  if (!canEdit.value) return false
  return !summary.value && !loadError.value
})

const recentEntries = computed(() => entries.value.slice(0, 12))

function formatRial(value?: string | number | null): string {
  try {
    const rial = BigInt(value ?? 0)
    const negative = rial < 0n
    const absolute = negative ? -rial : rial
    const whole = absolute / 10n
    const remainder = absolute % 10n
    const formatter = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US')
    const sign = negative ? '-' : ''
    const wholeText = formatter.format(whole)
    if (!remainder) return `${sign}${wholeText} تومان`
    const decimal = formatter.formatToParts(1.1).find((part) => part.type === 'decimal')?.value || '.'
    return `${sign}${wholeText}${decimal}${formatter.format(remainder)} تومان`
  } catch {
    return '0 تومان'
  }
}

function deltaText(delta: number | null): string {
  if (delta === null || !Number.isFinite(delta)) return ''
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '•'
  return `${arrow} ${pn(Math.abs(delta).toFixed(1))}٪ نسبت به دورهٔ قبل`
}

watch(loadError, (value) => {
  if (value) $toast.error('دریافت اطلاعات مالی ناموفق بود')
})
</script>
