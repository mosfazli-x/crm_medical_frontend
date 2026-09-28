<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- Apple-style large-title header -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('followups.title') }}</h1>
        <p class="dash-head__date">{{ t('followups.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button
          class="fu-iconbtn"
          :disabled="loading"
          :aria-label="t('followups.refresh')"
          @click="loadAll">
          <v-icon size="17" :class="{ 'fu-spin': loading }">mdi-refresh</v-icon>
        </button>
        <button
          v-if="isAdmin"
          class="asa-btn asa-btn--primary"
          :disabled="sweeping"
          @click="confirmSweep">
          <Bell class="w-4! h-4! fill-current" />
          <span>{{ t('followups.runNow') }}</span>
        </button>
      </div>
    </header>

    <!-- Patients with no phone cannot be reminded -->
    <div
      v-if="missingPhone > 0"
      class="asa-alert asa-alert--amber mb-4"
      role="status">
      <span class="asa-alert__icon" aria-hidden="true">
        <UsersGroup class="w-5! h-5! fill-current" />
        <span class="asa-alert__badge">{{ num(missingPhone) }}</span>
      </span>
      <div class="asa-alert__body">
        <p class="asa-alert__title">{{ t('followups.missingPhoneTitle', { count: num(missingPhone) }) }}</p>
        <p class="asa-alert__desc">{{ t('followups.missingPhoneDesc') }}</p>
      </div>
    </div>

    <!-- Summary metrics -->
    <div class="grid! grid-cols-2! min-[560px]:grid-cols-4! gap-3! sm:gap-4!">
      <template v-if="!summary">
        <div
          v-for="i in 4"
          :key="`sk-${i}`"
          class="asa-card asa-skel h-[5.5rem]! rounded-[22px]!" />
      </template>

      <div
        v-for="card in metrics"
        :key="card.key"
        class="asa-card fu-metric">
        <div class="asa-tint" :class="card.tint">
          <component :is="card.icon" class="w-5! h-5! fill-current" />
        </div>
        <div class="fu-metric__copy">
          <p class="fu-metric__value" :class="card.valueClass">{{ num(card.value) }}</p>
          <p class="fu-metric__label">{{ card.label }}</p>
        </div>
      </div>
    </div>

    <!-- Queue -->
    <section class="fu-card">
      <div class="fu-card__head">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <Calendar class="w-4! h-4! fill-current" />
        </span>
        <div class="fu-card__headcopy">
          <h2 class="fu-card__title">{{ t('followups.listTitle') }}</h2>
          <p class="fu-card__sub">{{ t('followups.listSub', { count: num(total) }) }}</p>
        </div>

        <div class="fu-toolbar">
          <div class="fu-search">
            <Magnify class="w-4! h-4! stroke-current" aria-hidden="true" />
            <input
              v-model="searchInput"
              type="search"
              class="fu-search__input"
              :placeholder="t('followups.searchPlaceholder')"
              :aria-label="t('followups.searchPlaceholder')"
              @keydown.enter.prevent="submitSearch">
            <button
              v-if="searchInput"
              class="fu-search__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="clearSearch">
              <X class="w-3.5! h-3.5! stroke-current" />
            </button>
          </div>

          <label class="fu-perpage">
            <span class="fu-perpage__label">{{ t('followups.perPage') }}</span>
            <select
              v-model.number="limit"
              class="fu-perpage__select"
              :aria-label="t('followups.perPage')"
              @change="applyFilters">
              <option
                v-for="opt in limitOptions"
                :key="opt"
                :value="opt">
                {{ num(opt) }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <!-- Window filter -->
      <div class="fu-filters">
        <div
          class="fu-seg"
          role="group"
          :aria-label="t('followups.window')">
          <button
            v-for="opt in windowOptions"
            :key="opt.value"
            type="button"
            class="fu-seg__btn"
            :class="{ 'fu-seg__btn--on': filters.window === opt.value }"
            :data-tone="opt.tone"
            :aria-pressed="filters.window === opt.value"
            @click="setWindow(opt.value)">
            <span class="fu-seg__label">{{ opt.label }}</span>
            <span
              v-if="typeof opt.count === 'number'"
              class="fu-seg__count">{{ num(opt.count) }}</span>
          </button>
        </div>

        <p class="fu-filters__hint">
          <Clock class="w-3.5! h-3.5! stroke-current" aria-hidden="true" />
          {{ t('followups.defaultHint', { days: num(defaultDays) }) }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="fu-skel">
        <div
          v-for="i in 6"
          :key="`r-${i}`"
          class="fu-skel__row">
          <div class="asa-skel h-9! w-9! rounded-full!" />
          <div class="asa-skel h-4! w-40! rounded-md!" />
          <div class="asa-skel h-4! w-24! rounded-md!" />
          <div class="asa-skel h-5! w-20! rounded-full!" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!items.length" class="fu-empty">
        <div class="asa-tint asa-tint--teal fu-tint-lg" aria-hidden="true">
          <ClipboardCheck class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="fu-empty__title">{{ t('followups.empty') }}</p>
          <p class="fu-empty__desc">{{ t('followups.emptyDesc') }}</p>
        </div>
      </div>

      <!-- Rows -->
      <div v-else class="fu-table-wrap">
        <table class="fu-table">
          <caption class="sr-only">
            {{ t('followups.listTitle') }}
          </caption>
          <thead>
            <tr>
              <th class="fu-pl0">{{ t('followups.patient') }}</th>
              <th>{{ t('followups.phone') }}</th>
              <th>{{ t('followups.nextVisitDate') }}</th>
              <th>{{ t('followups.reminderState') }}</th>
              <th>{{ t('followups.remindDaysBefore') }}</th>
              <th>{{ t('followups.sentAt') }}</th>
              <th class="fu-ta-end">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in items"
              :key="row.id"
              class="fu-tr">
              <td class="fu-pl0">
                <div class="fu-person">
                  <span class="fu-avatar" aria-hidden="true">{{ initial(row.patientFullName) }}</span>
                  <div class="fu-person__copy">
                    <p class="fu-person__name">{{ row.patientFullName }}</p>
                    <p class="fu-person__sub">
                      {{ t('followups.lastVisit') }}: {{ formatJalaliDateShort(row.visitDate) }}
                      <template v-if="row.visitType"> · {{ row.visitType }}</template>
                    </p>
                    <p
                      v-if="row.doctorFullName"
                      class="fu-person__sub">
                      {{ t('followups.doctor') }}: {{ row.doctorFullName }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="fu-mono">
                <span v-if="row.patientPhone">{{ row.patientPhone }}</span>
                <span v-else class="fu-amber">{{ t('followups.noPhone') }}</span>
              </td>
              <td class="fu-dt">
                <span class="fu-dt__date" :class="dateTone(row)">
                  {{ formatJalaliDateShort(row.nextVisitDate) }}
                </span>
                <span
                  v-if="relativeLabel(row)"
                  class="fu-dt__rel">
                  {{ relativeLabel(row) }}
                </span>
              </td>
              <td>
                <span class="asa-pill" :class="statePill(row.reminderState)">
                  {{ t(`followups.states.${row.reminderState}`) }}
                </span>
              </td>
              <td>
                <span class="fu-strong">{{ num(row.effectiveReminderDays) }}</span>
                <span class="fu-unit">{{ t('followups.daysUnit') }}</span>
                <span
                  v-if="row.usesDefaultReminderDays"
                  class="fu-block">
                  {{ t('followups.clinicDefault') }}
                </span>
              </td>
              <td class="fu-dt">
                <span
                  v-if="row.reminderSentAt"
                  class="fu-dt__date fu-green">
                  {{ formatJalaliDateShort(row.reminderSentAt) }}
                </span>
                <span v-else class="fu-muted">—</span>
              </td>
              <td class="fu-ta-end">
                <div class="fu-rowacts">
                  <button
                    class="fu-iconbtn"
                    :aria-label="t('followups.openVisit')"
                    @click="openVisit(row)">
                    <Calendar class="w-4! h-4! stroke-current" />
                  </button>
                  <button
                    class="fu-iconbtn fu-iconbtn--accent"
                    :aria-label="t('followups.sendNow')"
                    :disabled="sendingId === row.id || !row.patientPhone"
                    :title="row.patientPhone ? t('followups.sendNow') : t('followups.noPhone')"
                    @click="confirmSend(row)">
                    <span
                      v-if="sendingId === row.id"
                      class="fu-spinner"
                      aria-hidden="true" />
                    <ChatDots
                      v-else
                      class="w-4! h-4! fill-current" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && total > 0"
        class="fu-foot">
        <p class="fu-foot__info">
          {{ t('followups.showing', { from: num(from), to: num(to), total: num(total) }) }}
        </p>
        <v-pagination
          v-if="totalPages > 1"
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          density="comfortable"
          color="#00adb5"
          rounded="circle"
          :disabled="loading"
          @update:model-value="fetchItems" />
      </div>
    </section>

    <!-- Send confirmation -->
    <v-dialog
      v-model="sendDialog"
      max-width="460"
      persistent
      transition="dialog-bottom-transition">
      <v-card
        class="asa-dialog overflow-hidden!"
        elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('followups.sendConfirmTitle') }}</h2>
            <span class="asa-dialog__sub">{{ pending?.patientFullName }}</span>
          </div>
          <button
            class="fu-x"
            :aria-label="t('common.close')"
            @click="sendDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="fu-dialog-text">{{ t('followups.sendConfirmBody', { name: pending?.patientFullName ?? '' }) }}</p>
          <p class="fu-dialog-warn">
            <Bell class="w-4! h-4! fill-current" aria-hidden="true" />
            <span>{{ t('followups.sendConfirmWarn') }}</span>
          </p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button
            class="asa-btn asa-btn--ghost"
            @click="sendDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button
            class="asa-btn asa-btn--primary"
            :disabled="sending"
            @click="doSend">
            <ChatDots class="w-4! h-4! fill-current" />
            <span>{{ t('followups.sendNow') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sweep confirmation -->
    <v-dialog
      v-model="sweepDialog"
      max-width="460"
      persistent
      transition="dialog-bottom-transition">
      <v-card
        class="asa-dialog overflow-hidden!"
        elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('followups.sweepConfirmTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('followups.runNowHint') }}</span>
          </div>
          <button
            class="fu-x"
            :aria-label="t('common.close')"
            @click="sweepDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="fu-dialog-text">
            {{ t('followups.sweepConfirmBody', { days: num(defaultDays) }) }}
          </p>
          <p class="fu-dialog-warn">
            <Bell class="w-4! h-4! fill-current" aria-hidden="true" />
            <span>{{ t('followups.sweepConfirmWarn') }}</span>
          </p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button
            class="asa-btn asa-btn--ghost"
            @click="sweepDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button
            class="asa-btn asa-btn--primary"
            :disabled="sweeping"
            @click="doSweep">
            <Bell class="w-4! h-4! fill-current" />
            <span>{{ t('followups.runNow') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import Bell from '~/components/icons/Bell.vue'
import Calendar from '~/components/icons/Calendar.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Clock from '~/components/icons/Clock.vue'
import Magnify from '~/components/icons/Magnify.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import X from '~/components/icons/X.vue'
import { useFollowUps } from '~/composables/useFollowUps'
import type {
  FollowUp,
  FollowUpState,
  FollowUpSummary,
  FollowUpWindow,
} from '~/types/followup'

/** `useApi` throws the raw `$fetch` error, so surface its server message. */
const errorMessage = (err: unknown, fallback: string) => {
  const data = (err as { data?: { error?: string } } | null)?.data
  return data?.error || fallback
}

const { t } = useI18n()
const { $toast } = useNuxtApp()
const { user } = useAuth()
const { pn } = useLang()
const { formatJalaliDateShort } = useFormatting()
const { listFollowUps, getSummary, sendReminder, runSweep } = useFollowUps()

const items = ref<FollowUp[]>([])
const summary = ref<FollowUpSummary | null>(null)
const loading = ref(true)
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const totalPages = ref(1)

const sendingId = ref<string | null>(null)
const sending = ref(false)
const sweeping = ref(false)
const sendDialog = ref(false)
const sweepDialog = ref(false)
const pending = ref<FollowUp | null>(null)

const isAdmin = computed(() => user.value?.role === 'admin_doctor')

const filters = reactive({
  window: 'pending' as FollowUpWindow,
  search: '',
})

/** Bound to the search box; debounced into `filters.search`. */
const searchInput = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined

/** Localised digits, matching the rest of the dashboard. */
const num = (value: number | null | undefined) => pn(value ?? 0)

const defaultDays = computed(() => summary.value?.defaultReminderDays ?? 3)
const missingPhone = computed(() => summary.value?.missingPhone ?? 0)

const from = computed(() => (total.value ? (page.value - 1) * limit.value + 1 : 0))
const to = computed(() => Math.min(page.value * limit.value, total.value))

const limitOptions = [10, 20, 50, 100]

const windowOptions = computed(() => {
  const s = summary.value
  return [
    {
      value: 'pending' as FollowUpWindow,
      tone: 'teal',
      label: t('followups.windows.pending'),
      count: s?.pending,
    },
    {
      value: 'overdue' as FollowUpWindow,
      tone: 'rose',
      label: t('followups.windows.overdue'),
      count: s?.overdue,
    },
    {
      value: 'today' as FollowUpWindow,
      tone: 'amber',
      label: t('followups.windows.today'),
      count: s?.today,
    },
    {
      value: 'upcoming' as FollowUpWindow,
      tone: 'green',
      label: t('followups.windows.upcoming'),
      count: s?.upcoming,
    },
    {
      value: 'all' as FollowUpWindow,
      tone: 'neutral',
      label: t('followups.windows.all'),
      count: s?.total,
    },
  ]
})

const metrics = computed(() => {
  const s = summary.value
  return [
    {
      key: 'total',
      value: s?.total ?? 0,
      label: t('followups.stats.total'),
      icon: Calendar,
      tint: 'asa-tint--teal',
      valueClass: '',
    },
    {
      key: 'dueNow',
      value: s?.dueNow ?? 0,
      label: t('followups.stats.dueNow'),
      icon: Bell,
      tint: 'asa-tint--orange',
      valueClass: 'fu-amber',
    },
    {
      key: 'overdue',
      value: s?.overdue ?? 0,
      label: t('followups.stats.overdue'),
      icon: Clock,
      tint: 'asa-tint--rose',
      valueClass: 'fu-rose',
    },
    {
      key: 'sent',
      value: s?.sent ?? 0,
      label: t('followups.stats.sent'),
      icon: ClipboardCheck,
      tint: 'asa-tint--green',
      valueClass: 'fu-green',
    },
  ]
})

const STATE_PILL: Record<FollowUpState, string> = {
  due: 'asa-pill--amber',
  sent: 'asa-pill--green',
  scheduled: 'asa-pill--teal',
  overdue: 'asa-pill--rose',
}

const statePill = (state: FollowUpState) => STATE_PILL[state] ?? 'asa-pill--teal'

function initial(name: string | null | undefined): string {
  return (name || '?').trim().charAt(0) || '?'
}

function setWindow(value: FollowUpWindow) {
  filters.window = value
  page.value = 1
  fetchItems()
}

function applyFilters() {
  page.value = 1
  fetchItems()
}

function submitSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  filters.search = searchInput.value.trim()
  applyFilters()
}

function clearSearch() {
  searchInput.value = ''
  submitSearch()
}

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.search = value.trim()
    applyFilters()
  }, 320)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

async function fetchItems() {
  loading.value = true
  try {
    const res = await listFollowUps({
      window: filters.window,
      search: filters.search,
      page: page.value,
      limit: limit.value,
    })
    if (res?.success) {
      items.value = res.data ?? []
      total.value = res.total ?? 0
      totalPages.value = res.totalPages ?? 1
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('followups.loadError')))
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const res = await getSummary()
    if (res?.success) summary.value = res.data
  } catch {
    // Summary is decorative; the table still works without it.
  }
}

async function loadAll() {
  await Promise.all([fetchItems(), fetchSummary()])
}

function openVisit(row: FollowUp) {
  navigateTo(`/calendar?visit=${row.id}`)
}

function confirmSend(row: FollowUp) {
  pending.value = row
  sendDialog.value = true
}

async function doSend() {
  if (!pending.value) return
  sending.value = true
  try {
    const res = await sendReminder(pending.value.id)
    if (res?.success && res.data?.sent) {
      $toast.success(t('followups.sendSuccess'))
    } else {
      $toast.warning(t('followups.sendSkipped', { reason: res?.data?.reason ?? 'unknown' }))
    }
    sendDialog.value = false
    await loadAll()
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('followups.sendError')))
  } finally {
    sending.value = false
  }
}

function confirmSweep() {
  sweepDialog.value = true
}

async function doSweep() {
  sweeping.value = true
  try {
    const res = await runSweep()
    if (res?.success) {
      $toast.success(
        t('followups.sweepSuccess', {
          sent: num(res.data?.sent),
          failed: num(res.data?.failed),
          skipped: num(res.data?.skipped),
        })
      )
    }
    sweepDialog.value = false
    await loadAll()
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('followups.sweepError')))
  } finally {
    sweeping.value = false
  }
}

function dateTone(row: FollowUp): string {
  if (row.daysUntil === null) return 'fu-muted'
  if (row.daysUntil < 0) return 'fu-rose'
  if (row.daysUntil === 0) return 'fu-amber'
  return ''
}

function relativeLabel(row: FollowUp): string {
  if (row.daysUntil === null) return ''
  if (row.daysUntil === 0) return t('followups.relToday')
  if (row.daysUntil < 0) return t('followups.relPast', { days: num(Math.abs(row.daysUntil)) })
  return t('followups.relFuture', { days: num(row.daysUntil) })
}

onMounted(loadAll)

useSeoMeta({ title: t('followups.titleSeo') })
</script>

<style scoped>
/* ── Tone helpers ───────────────────────────────── */
.fu-amber {
  color: var(--asa-amber);
}

.fu-rose {
  color: var(--asa-rose);
}

.fu-green {
  color: var(--asa-green);
}

.fu-muted {
  color: var(--asa-label-2);
}

/* ── Missing-phone banner ───────────────────────── */
/* `.asa-alert` variants are page-scoped elsewhere, so define the parts here. */
.asa-alert {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin-top: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  border: 1px solid transparent;
}

.asa-alert--amber {
  background: #fff6e5;
  border-color: rgba(255, 149, 0, 0.32);
}

.dark .asa-alert--amber {
  background: rgba(255, 149, 0, 0.12);
  border-color: rgba(255, 149, 0, 0.28);
}

.asa-alert__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  flex-shrink: 0;
}

.asa-alert--amber .asa-alert__icon {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.asa-alert__badge {
  position: absolute;
  top: -0.375rem;
  inset-inline-end: -0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  border-radius: 9999px;
  /* Darker than the #ff453a used elsewhere: at 0.625rem/700 the brighter red
     only reaches ~3.4:1 against white, which fails WCAG AA for small text. */
  background: #d70015;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.asa-alert__body {
  flex: 1 1 14rem;
  min-width: 0;
}

.asa-alert__title {
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--asa-label);
}

.asa-alert__desc {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-label-2);
}

@media (max-width: 480px) {
  .asa-alert {
    padding: 0.75rem 0.875rem;
  }

  .asa-alert__body {
    flex-basis: calc(100% - 4.5rem);
  }
}

/* ── Header controls ────────────────────────────── */
.fu-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.fu-iconbtn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--asa-label) 9%, transparent);
  color: var(--asa-label);
}

.fu-iconbtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fu-iconbtn--accent:hover:not(:disabled) {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .fu-iconbtn--accent:hover:not(:disabled) {
  color: var(--asa-accent);
}

.fu-spin {
  animation: fu-spin 800ms linear infinite;
}

@keyframes fu-spin {
  to {
    transform: rotate(360deg);
  }
}

.fu-spinner {
  width: 0.9375rem;
  height: 0.9375rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 9999px;
  animation: fu-spin 700ms linear infinite;
}

/* ── Metric cards ───────────────────────────────── */
.fu-metric {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 1.25rem;
}

.fu-metric__copy {
  min-width: 0;
}

.fu-metric__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.fu-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* ── Queue card ─────────────────────────────────── */
.fu-card {
  position: relative;
  margin-top: 1.5rem;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.375rem;
  box-shadow: var(--asa-card-shadow);
  color: var(--asa-label);
  overflow: hidden;
}

.fu-card__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1.125rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-bg-card) 55%, transparent);
}

.fu-card__headcopy {
  min-width: 0;
  margin-inline-end: auto;
}

.fu-card__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.fu-card__sub {
  margin-top: 0.1875rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

/* ── Toolbar ────────────────────────────────────── */
.fu-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.fu-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.375rem;
  min-width: 13rem;
  padding: 0 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label-2);
  transition: box-shadow 150ms var(--ease-default), background-color 150ms var(--ease-default);
}

.fu-search:focus-within {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.fu-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--asa-label);
  font: inherit;
  font-size: 0.8125rem;
  outline: none;
}

.fu-search__input::placeholder {
  color: var(--asa-label-2);
}

/* Native search cancel button would duplicate our own. */
.fu-search__input::-webkit-search-cancel-button {
  appearance: none;
}

.fu-search__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 10%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
}

.fu-perpage {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.375rem;
  padding: 0 0.25rem 0 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label-2);
}

.fu-perpage__label {
  font-size: 0.75rem;
  white-space: nowrap;
}

.fu-perpage__select {
  border: none;
  background: transparent;
  color: var(--asa-label);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  outline: none;
  padding-inline-end: 0.25rem;
}

/* ── Window filter ──────────────────────────────── */
.fu-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.875rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
}

.fu-seg {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  flex-wrap: wrap;
}

.fu-seg__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 2rem;
  padding: 0 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.6875rem;
  background: transparent;
  color: var(--asa-label-2);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    border-color 150ms var(--ease-default);
}

.fu-seg__btn:hover:not(.fu-seg__btn--on) {
  color: var(--asa-label);
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

/* 4% keeps the count above 4.5:1; 8% measured 3.93:1 against --asa-label-2. */
/* No badge fill: the count inherits the chip's tone and the surrounding tint
   measures 4.6:1 (light) and 11.3:1 (dark). A filled badge compounded the
   container tint and dropped the 11px/700 numerals to 3.93:1. No opacity here
   either -- it would pull the light-theme ratio back down to ~2.6:1. */
.fu-seg__count {
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: inherit;
}

.fu-seg__btn--on {
  background: var(--asa-bg-card);
  box-shadow: var(--asa-card-shadow);
  border-color: var(--asa-card-ring);
}

.fu-seg__btn--on[data-tone="teal"] {
  /* Darkened from --asa-accent-deep (4.06:1) so 12px/600 clears 4.5:1. */
  color: color-mix(in srgb, var(--asa-accent-deep) 90%, #000000);
}

.dark .fu-seg__btn--on[data-tone="teal"] {
  color: var(--asa-accent);
}

.fu-seg__btn--on[data-tone="rose"] {
  color: var(--asa-rose);
}

.fu-seg__btn--on[data-tone="amber"] {
  color: var(--asa-amber);
}

.fu-seg__btn--on[data-tone="green"] {
  color: var(--asa-green);
}

.fu-filters__hint {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-inline-start: auto;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Table ──────────────────────────────────────── */
.fu-table-wrap {
  overflow-x: auto;
}

.fu-table {
  width: 100%;
  min-width: 56rem;
  border-collapse: collapse;
  text-align: start;
}

.fu-table thead th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.fu-table tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  white-space: nowrap;
  border-top: 1px solid var(--asa-sep);
  vertical-align: middle;
}

.fu-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.fu-table tbody tr:hover {
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .fu-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.04);
}

.fu-pl0 {
  padding-inline-start: 1.375rem !important;
}

.fu-ta-end {
  text-align: end !important;
  padding-inline-end: 1.375rem !important;
}

/* Patient cell */
.fu-person {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.fu-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.dark .fu-avatar {
  color: var(--asa-accent);
}

.fu-person__copy {
  min-width: 0;
}

.fu-person__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.fu-person__sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.fu-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
  direction: ltr;
  text-align: start;
}

.fu-amber {
  font-weight: 600;
}

/* Date cell */
.fu-dt {
  font-variant-numeric: tabular-nums;
}

.fu-dt__date {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.fu-dt__rel {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.fu-strong {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.fu-unit {
  margin-inline-start: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.fu-block {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

/* Row actions */
.fu-rowacts {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.fu-rowacts .fu-iconbtn {
  width: 2.125rem;
  height: 2.125rem;
  border-color: transparent;
  background: transparent;
}

.fu-rowacts .fu-iconbtn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
}

/* ── Loading ────────────────────────────────────── */
.fu-skel {
  padding: 0.25rem 0;
}

.fu-skel__row {
  display: grid;
  grid-template-columns: 2.25rem 1fr 0.6fr 0.5fr;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
}

.fu-skel__row:last-child {
  border-bottom: none;
}

/* ── Empty ──────────────────────────────────────── */
.fu-tint-lg {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
}

.fu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3.25rem 1.5rem;
  text-align: center;
}

.fu-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.fu-empty__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

/* ── Footer ─────────────────────────────────────── */
.fu-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.375rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.fu-foot__info {
  font-size: 0.75rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

/* ── Dialog bits ────────────────────────────────── */
.fu-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 9999px;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.fu-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.fu-dialog-text {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--asa-label-2);
}

.fu-dialog-warn {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
  font-size: 0.75rem;
  line-height: 1.6;
  font-weight: 500;
}

.fu-dialog-warn svg {
  flex-shrink: 0;
  margin-top: 0.0625rem;
}

@media (prefers-reduced-motion: reduce) {

  .fu-spin,
  .fu-spinner {
    animation: none;
  }
}
</style>
