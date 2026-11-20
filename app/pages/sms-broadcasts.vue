<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- Access gate -->
    <template v-if="!canManage">
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('smsBroadcast.title') }}</h1>
          <p class="dash-head__date">{{ t('smsBroadcast.subtitle') }}</p>
        </div>
      </header>
      <div class="asa-card sb-denied">
        <span class="asa-tint asa-tint--rose" aria-hidden="true">
          <v-icon size="24">mdi-shield-lock-outline</v-icon>
        </span>
        <div>
          <p class="sb-denied__title">{{ t('adminSettings.deniedTitle') }}</p>
          <p class="sb-denied__desc">{{ t('adminSettings.deniedDesc') }}</p>
        </div>
        <NuxtLink to="/dashboard" class="asa-btn asa-btn--ghost asa-btn--sm">
          <v-icon size="16">mdi-home-outline</v-icon>
          <span>{{ t('dashboard.title') }}</span>
        </NuxtLink>
      </div>
    </template>

    <template v-else>
      <!-- Header -->
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('smsBroadcast.title') }}</h1>
          <p class="dash-head__date">{{ t('smsBroadcast.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <button
            class="asa-btn asa-btn--ghost"
            :disabled="runningDue"
            @click="runDueDialog = true">
            <v-icon v-if="runningDue" size="16" class="sb-spin">mdi-loading</v-icon>
            <v-icon v-else size="16">mdi-playlist-play</v-icon>
            <span>{{ t('smsBroadcast.runDueNow') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary" @click="openCreate">
            <v-icon size="16">mdi-plus</v-icon>
            <span>{{ t('smsBroadcast.newBroadcast') }}</span>
          </button>
        </div>
      </header>

      <!-- Load failure -->
      <div v-if="loadFailed && !loading" class="asa-alert asa-alert--rose" role="alert">
        <span class="asa-alert__icon" aria-hidden="true">
          <v-icon size="20">mdi-alert-circle-outline</v-icon>
        </span>
        <div class="asa-alert__body">
          <p class="asa-alert__title">{{ t('smsBroadcast.loadError') }}</p>
        </div>
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="load">
          <v-icon size="15">mdi-refresh</v-icon>
          <span>{{ t('common.retry') }}</span>
        </button>
      </div>

      <template v-else>
        <!-- Metrics -->
        <div class="sb-metrics">
          <template v-if="loading">
            <div v-for="i in 4" :key="`sk-${i}`" class="asa-card asa-skel sb-metric-skel" />
          </template>
          <template v-else>
            <div class="asa-card sb-metric">
              <span class="asa-tint asa-tint--indigo"><v-icon size="20">mdi-cellphone-sms</v-icon></span>
              <div class="sb-metric__copy">
                <p class="sb-metric__value">{{ num(broadcasts.length) }}</p>
                <p class="sb-metric__label">{{ t('smsBroadcast.totalCount') }}</p>
              </div>
            </div>
            <div class="asa-card sb-metric">
              <span class="asa-tint asa-tint--green"><v-icon size="20">mdi-check-decagram-outline</v-icon></span>
              <div class="sb-metric__copy">
                <p class="sb-metric__value">{{ num(activeCount) }}</p>
                <p class="sb-metric__label">{{ t('smsBroadcast.activeCount') }}</p>
              </div>
            </div>
            <div class="asa-card sb-metric">
              <span class="asa-tint asa-tint--teal"><v-icon size="20">mdi-check-all</v-icon></span>
              <div class="sb-metric__copy">
                <p class="sb-metric__value">{{ num(totalSent) }}</p>
                <p class="sb-metric__label">{{ t('smsBroadcast.statSent') }}</p>
              </div>
            </div>
            <div class="asa-card sb-metric">
              <span class="asa-tint asa-tint--rose"><v-icon size="20">mdi-close-circle-outline</v-icon></span>
              <div class="sb-metric__copy">
                <p class="sb-metric__value">{{ num(totalFailed) }}</p>
                <p class="sb-metric__label">{{ t('smsBroadcast.statFailed') }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- Loading list -->
        <div v-if="loading" class="sb-list">
          <div v-for="i in 3" :key="`ls-${i}`" class="asa-card asa-skel sb-card-skel" />
        </div>

        <!-- Empty -->
        <div v-else-if="!broadcasts.length" class="asa-card sb-empty">
          <span class="asa-tint asa-tint--indigo sb-empty__tint" aria-hidden="true">
            <v-icon size="30">mdi-cellphone-sms</v-icon>
          </span>
          <p class="sb-empty__title">{{ t('smsBroadcast.empty') }}</p>
          <p class="sb-empty__desc">{{ t('smsBroadcast.emptyDesc') }}</p>
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreate">
            <v-icon size="15">mdi-plus</v-icon>
            <span>{{ t('smsBroadcast.newBroadcast') }}</span>
          </button>
        </div>

        <!-- Broadcast cards -->
        <div v-else class="sb-list">
          <article v-for="b in broadcasts" :key="b.id" class="asa-card sb-card">
            <div class="sb-card__main">
              <div class="sb-card__head">
                <div class="sb-card__titlewrap">
                  <h2 class="sb-card__title">{{ b.name }}</h2>
                  <span class="asa-pill" :class="b.isActive ? 'asa-pill--green' : 'asa-pill--amber'">
                    {{ b.isActive ? t('smsBroadcast.active') : t('smsBroadcast.inactive') }}
                  </span>
                </div>
                <div class="sb-card__actions">
                  <button
                    type="button"
                    class="sb-iact"
                    :class="b.isActive ? 'sb-iact--amber' : 'sb-iact--green'"
                    :title="b.isActive ? t('smsBroadcast.deactivate') : t('smsBroadcast.activate')"
                    :aria-label="b.isActive ? t('smsBroadcast.deactivate') : t('smsBroadcast.activate')"
                    :disabled="togglingId === b.id"
                    @click="toggleActive(b)">
                    <v-icon v-if="togglingId === b.id" size="18" class="sb-spin">mdi-loading</v-icon>
                    <v-icon v-else size="18">{{ b.isActive ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline' }}</v-icon>
                  </button>
                  <button type="button" class="sb-iact sb-iact--teal" :title="t('smsBroadcast.edit')" :aria-label="t('smsBroadcast.edit')" @click="openEdit(b)">
                    <v-icon size="18">mdi-pencil-outline</v-icon>
                  </button>
                  <button
                    type="button"
                    class="sb-iact sb-iact--green"
                    :class="{ 'sb-iact--disabled': !b.isActive }"
                    :title="t('smsBroadcast.sendNow')"
                    :aria-label="t('smsBroadcast.sendNow')"
                    :disabled="!b.isActive"
                    @click="askRun(b)">
                    <v-icon size="18">mdi-send-outline</v-icon>
                  </button>
                  <button type="button" class="sb-iact sb-iact--indigo" :title="t('smsBroadcast.logs')" :aria-label="t('smsBroadcast.logs')" @click="openLogs(b)">
                    <v-icon size="18">mdi-text-box-search-outline</v-icon>
                  </button>
                  <button type="button" class="sb-iact sb-iact--rose" :title="t('smsBroadcast.delete')" :aria-label="t('smsBroadcast.delete')" @click="askDelete(b)">
                    <v-icon size="18">mdi-trash-can-outline</v-icon>
                  </button>
                </div>
              </div>

              <p v-if="b.message" class="sb-card__msg">{{ b.message }}</p>

              <div class="sb-card__chips">
                <span class="sb-chip-info">
                  <v-icon size="14">mdi-calendar-week</v-icon>
                  <span>{{ daysLabel(b.daysOfWeek) }}</span>
                </span>
                <span class="sb-chip-info">
                  <v-icon size="14">mdi-clock-outline</v-icon>
                  <span class="sb-nums">{{ formatBroadcastTime(b.hour, b.minute) }}</span>
                </span>
                <span class="sb-chip-info">
                  <v-icon size="14">mdi-account-multiple-outline</v-icon>
                  <span>{{ recipientText(b) }}</span>
                </span>
                <span class="sb-chip-info" :class="b.isActive ? 'sb-chip-info--ok' : ''">
                  <v-icon size="14">{{ b.isActive ? 'mdi-calendar-clock' : 'mdi-pause-circle-outline' }}</v-icon>
                  <span v-if="b.nextRunAt && b.isActive">{{ t('smsBroadcast.nextRun') }}: {{ formatDateTime(b.nextRunAt) }}</span>
                  <span v-else>{{ b.isActive ? t('smsBroadcast.nextRun') + ': —' : t('smsBroadcast.inactive') }}</span>
                </span>
              </div>
            </div>

            <div class="sb-card__foot">
              <div class="sb-card__stats">
                <span class="sb-stat sb-stat--ok">
                  <b class="sb-nums">{{ num(b.totalSent) }}</b> {{ t('smsBroadcast.statSent') }}
                </span>
                <span class="sb-stat sb-stat--bad">
                  <b class="sb-nums">{{ num(b.totalFailed) }}</b> {{ t('smsBroadcast.statFailed') }}
                </span>
              </div>
              <span class="sb-card__last">
                {{ t('smsBroadcast.lastRun') }}:
                {{ b.lastRunAt ? formatDateTime(b.lastRunAt) : t('smsBroadcast.never') }}
              </span>
            </div>
          </article>
        </div>
      </template>
    </template>

    <!-- Create / Edit dialog -->
    <BroadcastFormDialog v-model="formOpen" :edit="editing" @saved="load" />

    <!-- Logs dialog -->
    <BroadcastLogsDialog
      v-model="logsOpen"
      :broadcast-id="logsTarget?.id ?? ''"
      :broadcast-name="logsTarget?.name ?? ''"
    />

    <!-- Run-now confirmation -->
    <v-dialog v-model="runDialog" max-width="460" transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('smsBroadcast.sendConfirmTitle') }}</h2>
            <span class="asa-dialog__sub">{{ runTarget?.name }}</span>
          </div>
          <button type="button" class="sb-dlg-x" :aria-label="t('common.close')" @click="runDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="sb-dlg-text">{{ t('smsBroadcast.sendConfirmBody', { name: runTarget?.name ?? '' }) }}</p>
          <p class="sb-dlg-text">
            {{ t('smsBroadcast.sendConfirmRecipients', { count: num(runRecipientCount) }) }}
          </p>
          <p v-if="runRecipientCount === 0" class="sb-dlg-warn">
            <v-icon size="16">mdi-account-alert-outline</v-icon>
            <span>{{ t('smsBroadcast.noRecipients') }}</span>
          </p>
          <label class="sb-check">
            <input v-model="runForce" type="checkbox" :disabled="running">
            <span>{{ t('smsBroadcast.resendToday') }}</span>
          </label>
          <p class="sb-hint">{{ t('smsBroadcast.resendTodayHint') }}</p>
          <p class="sb-dlg-warn">
            <v-icon size="16">mdi-alert-circle-outline</v-icon>
            <span>{{ t('smsBroadcast.sendConfirmWarn') }}</span>
          </p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost" :disabled="running" @click="runDialog = false">
            {{ t('common.cancel') }}
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--primary" :disabled="running || runRecipientCount === 0" @click="confirmRun">
            <v-icon v-if="running" size="15" class="sb-spin">mdi-loading</v-icon>
            <v-icon v-else size="15">mdi-send-outline</v-icon>
            <span>{{ t('smsBroadcast.sendNow') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Run-due confirmation -->
    <v-dialog v-model="runDueDialog" max-width="460" transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('smsBroadcast.runDue') }}</h2>
          </div>
          <button type="button" class="sb-dlg-x" :aria-label="t('common.close')" @click="runDueDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="sb-dlg-warn">
            <v-icon size="16">mdi-alert-circle-outline</v-icon>
            <span>{{ t('smsBroadcast.sendConfirmWarn') }}</span>
          </p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost" :disabled="runningDue" @click="runDueDialog = false">
            {{ t('common.cancel') }}
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--primary" :disabled="runningDue" @click="confirmRunDue">
            <v-icon v-if="runningDue" size="15" class="sb-spin">mdi-loading</v-icon>
            <v-icon v-else size="15">mdi-playlist-play</v-icon>
            <span>{{ t('smsBroadcast.runDueNow') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog" max-width="440" transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('smsBroadcast.delete') }}</h2>
            <span class="asa-dialog__sub">{{ deleteTarget?.name }}</span>
          </div>
          <button type="button" class="sb-dlg-x" :aria-label="t('common.close')" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="sb-dlg-text">{{ t('smsBroadcast.deleteConfirm', { name: deleteTarget?.name ?? '' }) }}</p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost" :disabled="deleting" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--rose" :disabled="deleting" @click="confirmDelete">
            <v-icon v-if="deleting" size="15" class="sb-spin">mdi-loading</v-icon>
            <v-icon v-else size="15">mdi-trash-can-outline</v-icon>
            <span>{{ t('smsBroadcast.delete') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BroadcastFormDialog from '~/components/sms-broadcast/BroadcastFormDialog.vue'
import BroadcastLogsDialog from '~/components/sms-broadcast/BroadcastLogsDialog.vue'
import { useSmsBroadcasts } from '~/composables/useSmsBroadcasts'
import { useLang } from '~/composables/useLang'
import { useFormatting } from '~/composables/useFormatting'
import {
  WEEKDAYS_BY_VALUE,
  formatBroadcastTime,
  type SmsBroadcast,
} from '~/types/sms-broadcast'

definePageMeta({ roles: ['admin_doctor', 'doctor'] })

const { t } = useI18n()
const { pn } = useLang()
const { user } = useAuth()
const { $toast } = useNuxtApp()
const { formatJalaliDateShort } = useFormatting()
const { listBroadcasts, deleteBroadcast, updateBroadcast, runBroadcast, runDueBroadcasts } = useSmsBroadcasts()

const loading = ref(true)
const loadFailed = ref(false)
const broadcasts = ref<SmsBroadcast[]>([])

const formOpen = ref(false)
const editing = ref<SmsBroadcast | null>(null)

const logsOpen = ref(false)
const logsTarget = ref<SmsBroadcast | null>(null)

const runDialog = ref(false)
const runTarget = ref<SmsBroadcast | null>(null)
const running = ref(false)
const runForce = ref(false)

const togglingId = ref('')

const runDueDialog = ref(false)
const runningDue = ref(false)

const deleteDialog = ref(false)
const deleteTarget = ref<SmsBroadcast | null>(null)
const deleting = ref(false)

const canManage = computed(() => {
  const role = user.value?.role
  return role === 'admin_doctor' || role === 'doctor'
})

const num = (value: number | null | undefined) => pn(value ?? 0)

const activeCount = computed(() => broadcasts.value.filter((b) => b.isActive).length)
const totalSent = computed(() => broadcasts.value.reduce((s, b) => s + (b.totalSent || 0), 0))
const totalFailed = computed(() => broadcasts.value.reduce((s, b) => s + (b.totalFailed || 0), 0))

const runRecipientCount = computed(() => {
  const b = runTarget.value
  if (!b) return 0
  if (typeof b.recipientCount === 'number') return b.recipientCount
  return b.targetType === 'specific' ? (b.targetPatientIds?.length ?? 0) : 0
})

function daysLabel(days: number[]): string {
  if (!Array.isArray(days) || !days.length) return '—'
  return days.map((d) => WEEKDAYS_BY_VALUE[d]?.label ?? String(d)).filter(Boolean).join('، ')
}

function recipientText(b: SmsBroadcast): string {
  const fallback = b.targetType === 'specific' ? b.targetPatientIds?.length ?? 0 : 0
  const count = b.recipientCount ?? fallback
  return b.targetType === 'specific'
    ? t('smsBroadcast.recipientSpecificCount', { count: num(count) })
    : t('smsBroadcast.recipientAllCount', { count: num(count) })
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = formatJalaliDateShort(iso)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { error?: string; message?: string } } | null)?.data
  return data?.error || data?.message || fallback
}

async function load() {
  if (!canManage.value) return
  loading.value = true
  loadFailed.value = false
  try {
    const res = await listBroadcasts({ page: 1, limit: 100 })
    if (res?.success && Array.isArray(res.data)) {
      broadcasts.value = res.data
    } else {
      loadFailed.value = true
    }
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(b: SmsBroadcast) {
  editing.value = b
  formOpen.value = true
}

function openLogs(b: SmsBroadcast) {
  logsTarget.value = b
  logsOpen.value = true
}

function askRun(b: SmsBroadcast) {
  runTarget.value = b
  runForce.value = false
  runDialog.value = true
}

async function toggleActive(b: SmsBroadcast) {
  if (togglingId.value) return
  togglingId.value = b.id
  try {
    const res = await updateBroadcast(b.id, { isActive: !b.isActive })
    if (res?.success) {
      b.isActive = res.data.isActive
      b.nextRunAt = res.data.nextRunAt
      $toast.success(b.isActive ? t('smsBroadcast.activated') : t('smsBroadcast.deactivated'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('smsBroadcast.toggleError')))
  } finally {
    togglingId.value = ''
  }
}

async function confirmRun() {
  const b = runTarget.value
  if (!b || running.value) return
  running.value = true
  try {
    const res = await runBroadcast(b.id, runForce.value)
    if (res?.success) {
      const s = res.data
      if (s.reason === 'already_ran') {
        $toast.info(t('smsBroadcast.alreadyRan'))
      } else if (s.reason === 'channel_disabled') {
        $toast.error(t('smsBroadcast.channelDisabled'))
      } else if (s.reason === 'no_credit') {
        $toast.error(t('smsBroadcast.noCredit'))
      } else {
        $toast.success(
          t('smsBroadcast.sendDone', { sent: num(s.sent), failed: num(s.failed), skipped: num(s.skipped) })
        )
      }
      runDialog.value = false
      await load()
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('smsBroadcast.sendError')))
  } finally {
    running.value = false
  }
}

async function confirmRunDue() {
  if (runningDue.value) return
  runningDue.value = true
  try {
    const res = await runDueBroadcasts()
    if (res?.success) {
      const s = res.data
      $toast.success(
        t('smsBroadcast.runDueDone', {
          broadcasts: num(s.broadcasts),
          sent: num(s.sent),
          failed: num(s.failed),
          skipped: num(s.skipped),
        })
      )
      runDueDialog.value = false
      await load()
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('smsBroadcast.runDueError')))
  } finally {
    runningDue.value = false
  }
}

function askDelete(b: SmsBroadcast) {
  deleteTarget.value = b
  deleteDialog.value = true
}

async function confirmDelete() {
  const b = deleteTarget.value
  if (!b || deleting.value) return
  deleting.value = true
  try {
    const res = await deleteBroadcast(b.id)
    if (res?.success) {
      $toast.success(t('smsBroadcast.deleted'))
      broadcasts.value = broadcasts.value.filter((x) => x.id !== b.id)
      deleteDialog.value = false
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('smsBroadcast.deleteError')))
  } finally {
    deleting.value = false
  }
}

watch(
  () => user.value?.role,
  (role) => {
    if (role === 'admin_doctor' || role === 'doctor') load()
  },
  { immediate: true }
)

useSeoMeta({ title: () => t('smsBroadcast.titleSeo') })
</script>

<style scoped>
/* Metrics */
.sb-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 720px) {
  .sb-metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.sb-metric {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
}

.sb-metric-skel {
  height: 5rem;
}

.sb-metric__value {
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.sb-metric__label {
  margin-top: 0.1875rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* List */
.sb-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-top: 1.25rem;
}

.sb-card-skel {
  height: 9.5rem;
}

.sb-card {
  padding: 1.125rem 1.25rem;
}

.sb-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sb-card__titlewrap {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  min-width: 0;
}

.sb-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--asa-label);
  overflow: hidden;
  text-overflow: ellipsis;
}

.sb-card__actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.sb-iact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.sb-iact:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
}

.sb-iact--teal:hover { color: var(--asa-accent-deep); }
.sb-iact--green:hover { color: var(--asa-green); }
.sb-iact--indigo:hover { color: var(--asa-indigo); }
.sb-iact--rose:hover { color: var(--asa-rose); }
.sb-iact--amber:hover { color: var(--asa-amber); }

.sb-iact:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sb-iact:disabled:hover {
  background: transparent;
  color: var(--asa-label-2);
}

.sb-card__msg {
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sb-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.875rem;
}

.sb-chip-info {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 500;
}

.sb-chip-info--ok {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.sb-nums {
  font-variant-numeric: tabular-nums;
  direction: ltr;
  unicode-bidi: plaintext;
}

.sb-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
}

.sb-card__stats {
  display: flex;
  gap: 1.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.sb-stat b {
  font-weight: 800;
}

.sb-stat--ok b { color: var(--asa-green); }
.sb-stat--bad b { color: var(--asa-rose); }

.sb-card__last {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

/* Empty */
.sb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 3rem 1.5rem;
  margin-top: 1.25rem;
  text-align: center;
}

.sb-empty__tint {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.125rem;
}

.sb-empty__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--asa-label);
}

.sb-empty__desc {
  max-width: 28rem;
  margin-top: -0.375rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* Denied */
.sb-denied {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.sb-denied__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
}

.sb-denied__desc {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

/* Dialog helpers */
.sb-dlg-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
}

.sb-dlg-x:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
}

.sb-dlg-text {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--asa-label-2);
}

.sb-dlg-warn {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.75rem;
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
  font-size: 0.75rem;
  line-height: 1.55;
}

.sb-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  cursor: pointer;
}

.sb-check input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--asa-accent);
  cursor: pointer;
}

.sb-check input:disabled {
  cursor: not-allowed;
}

.sb-hint {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--asa-label-3);
}

.sb-spin {
  animation: sb-spin 0.8s linear infinite;
}

@keyframes sb-spin {
  to { transform: rotate(360deg); }
}
</style>
