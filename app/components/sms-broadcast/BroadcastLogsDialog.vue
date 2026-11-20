<template>
  <v-dialog :model-value="modelValue" max-width="720" transition="dialog-bottom-transition" @update:model-value="onClose">
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div>
          <h2 class="asa-dialog__title">{{ t('smsBroadcast.logsTitle') }}</h2>
          <span class="asa-dialog__sub">{{ t('smsBroadcast.logsSubtitle', { name: broadcastName }) }}</span>
        </div>
        <button type="button" class="lb-x" :aria-label="t('common.close')" @click="onClose(false)">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <v-card-text class="asa-dialog__body lb-body">
        <!-- Loading -->
        <div v-if="loading" class="lb-skel">
          <div v-for="i in 5" :key="i" class="lb-skel__row">
            <div class="asa-skel h-9! w-9! rounded-full!" />
            <div class="asa-skel h-4! w-40! rounded-md!" />
            <div class="asa-skel h-5! w-20! rounded-full!" />
            <div class="asa-skel h-4! w-28! rounded-md!" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="loadError" class="lb-empty">
          <span class="asa-tint asa-tint--rose" aria-hidden="true">
            <v-icon size="26">mdi-alert-circle-outline</v-icon>
          </span>
          <p class="lb-empty__title">{{ t('smsBroadcast.logsError') }}</p>
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="load">
            <v-icon size="15">mdi-refresh</v-icon>
            <span>{{ t('common.retry') }}</span>
          </button>
        </div>

        <!-- Empty -->
        <div v-else-if="!logs.length" class="lb-empty">
          <span class="asa-tint asa-tint--indigo" aria-hidden="true">
            <v-icon size="26">mdi-message-outline</v-icon>
          </span>
          <p class="lb-empty__title">{{ t('smsBroadcast.logsEmpty') }}</p>
        </div>

        <!-- Table -->
        <div v-else>
          <div class="lb-summary">
            <span>{{ t('smsBroadcast.statRecipients') }}: <b class="sb-nums">{{ pn(recipientCount) }}</b></span>
            <span>{{ t('smsBroadcast.logsSummary', { sent: pn(sentCount), failed: pn(failedCount) }) }}</span>
          </div>
          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>{{ t('smsBroadcast.colPatient') }}</th>
                  <th>{{ t('smsBroadcast.colPhone') }}</th>
                  <th class="lb-center">{{ t('smsBroadcast.colStatus') }}</th>
                  <th class="lb-center">{{ t('smsBroadcast.colSentAt') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logs" :key="log.id">
                  <td>{{ patientName(log) }}</td>
                  <td class="lb-mono">{{ log.phone || '-' }}</td>
                  <td class="lb-center">
                    <span class="asa-pill" :class="statusPillClass(log.status)">
                      {{ statusLabel(log.status) }}
                    </span>
                    <span v-if="log.error" class="lb-err" :title="log.error">{{ log.error }}</span>
                  </td>
                  <td class="lb-center lb-nowrap">{{ formatDateTime(log.sentAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <v-spacer />
        <button class="asa-btn asa-btn--ghost" @click="onClose(false)">{{ t('common.close') }}</button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSmsBroadcasts } from '~/composables/useSmsBroadcasts'
import { useDailyReports } from '~/composables/useDailyReports'
import { useFormatting } from '~/composables/useFormatting'
import { useLang } from '~/composables/useLang'
import type { SmsBroadcastLog, BroadcastLogStatus } from '~/types/sms-broadcast'
import type { PatientOption } from '~/types/report'

const props = defineProps<{
  modelValue: boolean
  broadcastId: string
  broadcastName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const { pn } = useLang()
const { getBroadcastLogs, getBroadcast } = useSmsBroadcasts()
const { listPatients } = useDailyReports()
const { formatJalaliDateShort } = useFormatting()

const loading = ref(false)
const loadError = ref(false)
const logs = ref<SmsBroadcastLog[]>([])
const patientsById = ref<Record<string, string>>({})
const recipientCount = ref(0)

const sentCount = computed(() => logs.value.filter((log) => log.status === 'sent').length)
const failedCount = computed(() => logs.value.filter((log) => log.status === 'failed').length)

watch(
  () => props.modelValue,
  async (open) => {
    if (open && props.broadcastId) await load()
    if (!open) {
      logs.value = []
      loadError.value = false
    }
  }
)

function patientName(log: SmsBroadcastLog): string {
  return patientsById.value[log.patientId] || log.phone || log.patientId
}

function statusLabel(status: BroadcastLogStatus): string {
  const map: Record<BroadcastLogStatus, string> = {
    sent: t('smsBroadcast.statusSent'),
    failed: t('smsBroadcast.statusFailed'),
    skipped: t('smsBroadcast.statusSkipped'),
  }
  return map[status] ?? status
}

function statusPillClass(status: BroadcastLogStatus): string {
  switch (status) {
    case 'sent': return 'asa-pill--green'
    case 'failed': return 'asa-pill--rose'
    case 'skipped': return 'asa-pill--amber'
    default: return 'asa-pill--teal'
  }
}

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = formatJalaliDateShort(iso)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

async function load() {
  if (!props.broadcastId) return
  loading.value = true
  loadError.value = false
  try {
    const [logsRes, patientsRes, detailRes] = await Promise.all([
      getBroadcastLogs(props.broadcastId, { page: 1, limit: 200 }),
      listPatients().catch(() => ({ success: false, data: [] as PatientOption[] })),
      getBroadcast(props.broadcastId).catch(() => null),
    ])
    logs.value = logsRes?.success && Array.isArray(logsRes.data) ? logsRes.data : []
    recipientCount.value = detailRes?.success ? detailRes.data.recipientCount : 0
    if (patientsRes?.success && Array.isArray(patientsRes.data)) {
      const map: Record<string, string> = {}
      for (const p of patientsRes.data) {
        map[p.id] = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.phone || p.id
      }
      patientsById.value = map
    }
  } catch {
    logs.value = []
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function onClose(value: boolean) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.lb-body {
  max-height: min(64vh, 560px);
  overflow-y: auto;
}

.lb-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.lb-x:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.lb-center {
  text-align: center;
}

.lb-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.lb-summary b {
  font-weight: 800;
  color: var(--asa-label);
}

.sb-nums {
  font-variant-numeric: tabular-nums;
  direction: ltr;
  unicode-bidi: plaintext;
}

.lb-nowrap {
  white-space: nowrap;
}

.lb-mono {
  font-variant-numeric: tabular-nums;
  direction: ltr;
  unicode-bidi: plaintext;
}

.lb-err {
  display: block;
  max-width: 12rem;
  margin: 0.25rem auto 0;
  font-size: 0.625rem;
  color: var(--asa-rose);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-skel {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.lb-skel__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 2.5rem 1rem;
  text-align: center;
}

.lb-empty__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}
</style>
