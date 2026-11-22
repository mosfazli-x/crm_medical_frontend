<template>
  <section class="asa-sec mt-6">
    <div class="sms-head">
      <div>
        <p class="asa-sec__label">{{ t('cashbook.sms.title') }}</p>
        <p class="sms-head__sub">{{ t('cashbook.sms.subtitle') }}</p>
      </div>
      <div class="sms-head__pills">
        <span class="asa-pill asa-pill--green">{{ t('cashbook.sms.statusPosted') }} · {{ formatNumber(stats.posted) }}</span>
        <span class="asa-pill" :class="stats.review ? 'asa-pill--amber' : ''">{{ t('cashbook.sms.statusReview') }} · {{
          formatNumber(stats.review) }}</span>
      </div>
    </div>

    <div class="asa-card sms-panel">
      <div class="sms-tabs">
        <button class="sms-tab" :class="{ 'is-on': tab === 'inbox' }" @click="tab = 'inbox'">
          <v-icon size="17">mdi-inbox-arrow-down-outline</v-icon>
          <span>{{ t('cashbook.sms.tabInbox') }}</span>
        </button>
        <button class="sms-tab" :class="{ 'is-on': tab === 'sources' }" @click="tab = 'sources'">
          <v-icon size="17">mdi-bank-outline</v-icon>
          <span>{{ t('cashbook.sms.tabSources') }}</span>
        </button>
        <div class="sms-tabs__spacer" />
        <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="loading" @click="refreshAll">
          <v-icon size="16" :class="{ 'sms-spin': loading }">mdi-refresh</v-icon>
        </button>
      </div>

      <!-- Inbox -->
      <div v-if="tab === 'inbox'" class="sms-body">
        <div class="sms-filters">
          <button v-for="filter in filters" :key="filter.value" class="sms-chip"
            :class="{ 'is-on': statusFilter === filter.value }" @click="setStatus(filter.value)">
            {{ filter.title }}
            <span v-if="filter.count" class="sms-chip__count">{{ formatNumber(filter.count) }}</span>
          </button>
          <div class="sms-filters__spacer" />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="openPaste">
            <v-icon size="16">mdi-content-paste</v-icon>
            <span>{{ t('cashbook.sms.paste') }}</span>
          </button>
        </div>

        <div v-if="loading && !messages.length" class="sms-list" aria-busy="true">
          <div v-for="n in 4" :key="`sms-skel-${n}`" class="asa-skel h-24 rounded-2xl" />
        </div>

        <ul v-else-if="messages.length" class="sms-list">
          <li v-for="message in messages" :key="message.id" class="sms-item" :class="`is-${message.status}`">
            <span class="sms-item__icon" :class="`tone-${message.status}`">
              <v-icon size="18">{{ statusIcon(message.status) }}</v-icon>
            </span>
            <div class="sms-item__main">
              <div class="sms-item__top">
                <span class="sms-item__amount" dir="ltr">{{ formatRial(message.amountRial) }}</span>
                <span class="sms-item__meta">{{ message.sender || t('cashbook.sms.unknownSender') }} · {{
                  formatDateTime(message.receivedAt) }}</span>
                <span class="sms-badge" :class="`tone-${message.status}`">{{ statusLabel(message.status) }}</span>
              </div>
              <p class="sms-item__text">{{ message.rawText }}</p>
              <div class="sms-item__foot">
                <span v-if="message.direction" class="sms-tag">{{ directionLabel(message.direction) }}</span>
                <span v-if="message.sourceLabel" class="sms-tag">{{ message.sourceLabel }}</span>
                <span v-if="message.accountName" class="sms-tag">{{ message.accountName }}</span>
                <span v-if="message.cardLast4" class="sms-tag" dir="ltr">****{{ message.cardLast4 }}</span>
                <span v-if="message.rejectionReason" class="sms-tag sms-tag--warn">{{ reasonLabel(message.rejectionReason) }}</span>
                <span class="sms-conf">{{ t('cashbook.sms.confidence') }} {{ formatNumber(message.confidence) }}%</span>
              </div>
            </div>
            <div v-if="canActOn(message)" class="sms-item__actions">
              <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openApprove(message)">
                <v-icon size="15">mdi-check</v-icon>
                <span>{{ t('cashbook.sms.approve') }}</span>
              </button>
              <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="ignoreMessage(message)">
                {{ t('cashbook.sms.ignore') }}
              </button>
            </div>
          </li>
        </ul>

        <UiEmptyState v-else :title="t('cashbook.sms.empty')" :description="t('cashbook.sms.emptyDesc')" class="py-10!">
          <template #icon><v-icon size="36">mdi-message-text-clock-outline</v-icon></template>
        </UiEmptyState>

        <div v-if="pagination.totalPages > 1" class="cb-pagination">
          <button class="sc-icon-btn" :disabled="page <= 1" @click="changePage(page - 1)">
            <v-icon size="17">mdi-chevron-right</v-icon>
          </button>
          <span>{{ t('cashbook.page') }} {{ formatNumber(page) }} / {{ formatNumber(pagination.totalPages) }}</span>
          <button class="sc-icon-btn" :disabled="page >= pagination.totalPages" @click="changePage(page + 1)">
            <v-icon size="17">mdi-chevron-left</v-icon>
          </button>
        </div>
      </div>

      <!-- Sources & devices -->
      <div v-else class="sms-body">
        <div class="sms-sources-head">
          <div>
            <h3 class="sms-sources-head__title">{{ t('cashbook.sms.sources') }}</h3>
            <p class="sms-sources-head__sub">{{ t('cashbook.sms.sourcesDesc') }}</p>
          </div>
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openSource()">
            <v-icon size="16">mdi-plus</v-icon>
            <span>{{ t('cashbook.sms.addSource') }}</span>
          </button>
        </div>

        <div v-if="sources.length" class="sms-source-grid">
          <article v-for="source in sources" :key="source.id" class="sms-source" :class="{ 'is-off': !source.isActive }">
            <div class="sms-source__top">
              <span class="sms-source__bank">{{ bankLabel(source.bankCode) }}</span>
              <button class="sms-source__toggle" :class="{ 'is-on': source.autoPost }" :title="t('cashbook.sms.autoPost')"
                @click="toggleAutoPost(source)">
                <v-icon size="15">{{ source.autoPost ? 'mdi-flash' : 'mdi-flash-off' }}</v-icon>
              </button>
            </div>
            <p class="sms-source__label">{{ source.label }}</p>
            <p class="sms-source__account">{{ source.accountName }}</p>
            <div class="sms-source__foot">
              <span v-if="source.cardLast4" class="sms-tag" dir="ltr">****{{ source.cardLast4 }}</span>
              <span class="sms-tag">{{ source.channel }}</span>
              <button class="sms-source__del" @click="deleteSource(source)">
                <v-icon size="15">mdi-delete-outline</v-icon>
              </button>
            </div>
          </article>
        </div>
        <UiEmptyState v-else :title="t('cashbook.sms.noSources')" :description="t('cashbook.sms.noSourcesDesc')"
          class="py-8!">
          <template #icon><v-icon size="32">mdi-bank-off-outline</v-icon></template>
        </UiEmptyState>

        <div class="sms-sources-head mt-6!">
          <div>
            <h3 class="sms-sources-head__title">{{ t('cashbook.sms.devices') }}</h3>
            <p class="sms-sources-head__sub">{{ t('cashbook.sms.devicesDesc') }}</p>
          </div>
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="openToken()">
            <v-icon size="16">mdi-cellphone-arrow-down</v-icon>
            <span>{{ t('cashbook.sms.addDevice') }}</span>
          </button>
        </div>

        <div v-if="tokens.length" class="sms-token-list">
          <div v-for="token in tokens" :key="token.id" class="sms-token" :class="{ 'is-revoked': token.isRevoked }">
            <span class="sms-token__icon"><v-icon size="17">mdi-cellphone</v-icon></span>
            <div class="sms-token__main">
              <p class="sms-token__label">{{ token.label }} <span class="sms-token__prefix" dir="ltr">{{
                token.tokenPrefix }}…</span></p>
              <p class="sms-token__meta">
                {{ token.platform }} · {{ formatNumber(token.messageCount) }} {{ t('cashbook.sms.messagesCount') }} ·
                {{ token.lastSeenAt ? formatDateTime(token.lastSeenAt) : t('cashbook.sms.neverSeen') }}
              </p>
            </div>
            <button v-if="!token.isRevoked" class="asa-btn asa-btn--ghost asa-btn--sm" @click="revokeToken(token)">
              {{ t('cashbook.sms.revoke') }}
            </button>
            <span v-else class="sms-tag sms-tag--warn">{{ t('cashbook.sms.revoked') }}</span>
          </div>
        </div>
        <p v-else class="sms-token-empty">{{ t('cashbook.sms.noDevices') }}</p>
      </div>
    </div>

    <!-- Approve dialog -->
    <UiDialog v-model="approveDialog" :title="t('cashbook.sms.approveTitle')" size="lg">
      <div class="sms-form">
        <div class="sms-form__row">
          <label class="asa-field-label">{{ t('cashbook.type') }}
            <v-select v-model="approveForm.kind" :items="kindOptions" item-title="title" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" />
          </label>
          <label class="asa-field-label">{{ t('cashbook.amountToman') }}
            <v-text-field v-model="approveForm.amountToman" type="number" min="0.1" step="0.1" variant="solo"
              density="comfortable" hide-details="auto" />
          </label>
        </div>
        <div class="sms-form__row">
          <label class="asa-field-label">{{ t('cashbook.category') }}
            <v-select v-model="approveForm.categoryId" :items="approveCategories" item-title="name" item-value="id"
              variant="solo" density="comfortable" hide-details="auto" />
          </label>
          <label class="asa-field-label">{{ t('cashbook.account') }}
            <v-select v-model="approveForm.accountId" :items="activeAccounts" item-title="name" item-value="id"
              variant="solo" density="comfortable" hide-details="auto" />
          </label>
        </div>
        <label class="asa-field-label">{{ t('cashbook.date') }}
          <v-text-field v-model="approveForm.entryDate" type="date" variant="solo" density="comfortable"
            hide-details="auto" />
        </label>
        <label class="asa-field-label">{{ t('cashbook.description') }}
          <v-text-field v-model="approveForm.description" :placeholder="t('cashbook.sms.descriptionHint')" variant="solo"
            density="comfortable" hide-details="auto" />
        </label>
        <p class="sms-raw">{{ approveTarget?.rawText }}</p>
      </div>
      <template #footer>
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="approveDialog = false">{{ t('common.cancel') }}</button>
        <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !approveValid" @click="submitApprove">
          <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#fff" />
          <template v-else><v-icon size="15">mdi-check</v-icon>{{ t('cashbook.sms.approve') }}</template>
        </button>
      </template>
    </UiDialog>

    <!-- Source dialog -->
    <UiDialog v-model="sourceDialog" :title="t('cashbook.sms.addSource')" size="md">
      <div class="sms-form">
        <label class="asa-field-label">{{ t('cashbook.sms.sourceLabel') }}
          <v-text-field v-model="sourceForm.label" variant="solo" density="comfortable" hide-details="auto" />
        </label>
        <div class="sms-form__row">
          <label class="asa-field-label">{{ t('cashbook.sms.sourceBank') }}
            <v-select v-model="sourceForm.bankCode" :items="bankOptions" item-title="title" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" />
          </label>
          <label class="asa-field-label">{{ t('cashbook.sms.sourceAccount') }}
            <v-select v-model="sourceForm.accountId" :items="activeAccounts" item-title="name" item-value="id"
              variant="solo" density="comfortable" hide-details="auto" />
          </label>
        </div>
        <div class="sms-form__row">
          <label class="asa-field-label">{{ t('cashbook.sms.sourceCard') }}
            <v-text-field v-model="sourceForm.cardLast4" maxlength="4" variant="solo" density="comfortable"
              hide-details="auto" />
          </label>
          <label class="asa-field-label">{{ t('cashbook.sms.sourceSenders') }}
            <v-text-field v-model="sourceForm.senders" :placeholder="t('cashbook.sms.sourceSendersHint')" variant="solo"
              density="comfortable" hide-details="auto" />
          </label>
        </div>
        <div class="sms-form__check">
          <v-switch v-model="sourceForm.autoPost" :label="t('cashbook.sms.autoPost')" color="primary" hide-details
            inset />
        </div>
      </div>
      <template #footer>
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="sourceDialog = false">{{ t('common.cancel') }}</button>
        <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !sourceValid" @click="submitSource">
          <v-icon size="15">mdi-check</v-icon>{{ t('common.save') }}
        </button>
      </template>
    </UiDialog>

    <!-- Token dialog -->
    <UiDialog v-model="tokenDialog" :title="t('cashbook.sms.addDevice')" size="md">
      <div v-if="!createdToken" class="sms-form">
        <label class="asa-field-label">{{ t('cashbook.sms.deviceLabel') }}
          <v-text-field v-model="tokenForm.label" variant="solo" density="comfortable" hide-details="auto" />
        </label>
        <label class="asa-field-label">{{ t('cashbook.sms.devicePlatform') }}
          <v-select v-model="tokenForm.platform" :items="platformOptions" item-title="title" item-value="value"
            variant="solo" density="comfortable" hide-details="auto" />
        </label>
      </div>
      <div v-else class="sms-token-reveal">
        <p class="sms-token-reveal__hint">{{ t('cashbook.sms.deviceTokenHint') }}</p>
        <div class="sms-token-reveal__box">
          <code dir="ltr">{{ createdToken }}</code>
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="copyToken">
            <v-icon size="15">mdi-content-copy</v-icon>{{ t('cashbook.sms.copyToken') }}
          </button>
        </div>
      </div>
      <template #footer>
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="closeToken">
          {{ createdToken ? t('common.close') : t('common.cancel') }}
        </button>
        <button v-if="!createdToken" class="asa-btn asa-btn--primary asa-btn--sm"
          :disabled="saving || !tokenForm.label" @click="submitToken">
          <v-icon size="15">mdi-plus</v-icon>{{ t('cashbook.sms.addDevice') }}
        </button>
      </template>
    </UiDialog>

    <!-- Paste dialog -->
    <UiDialog v-model="pasteDialog" :title="t('cashbook.sms.pasteTitle')" size="md">
      <div class="sms-form">
        <label class="asa-field-label">{{ t('cashbook.sms.rawText') }}
          <v-textarea v-model="pasteForm.text" rows="4" variant="solo" density="comfortable" hide-details="auto" />
        </label>
        <label class="asa-field-label">{{ t('cashbook.sms.sourceSenders') }}
          <v-text-field v-model="pasteForm.sender" :placeholder="t('cashbook.sms.sourceSendersHint')" variant="solo"
            density="comfortable" hide-details="auto" />
        </label>
      </div>
      <template #footer>
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="pasteDialog = false">{{ t('common.cancel') }}</button>
        <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !pasteForm.text.trim()"
          @click="submitPaste">
          <v-icon size="15">mdi-send</v-icon>{{ t('cashbook.sms.process') }}
        </button>
      </template>
    </UiDialog>
  </section>
</template>

<script setup lang="ts">
import type { CashbookAccount, CashbookCategory } from '~/types/finance'

const props = defineProps<{
  categories: CashbookCategory[]
  accounts: CashbookAccount[]
}>()

const emit = defineEmits<{ posted: [] }>()

const { t, locale } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

type SmsStatus = 'posted' | 'review' | 'duplicate' | 'ignored' | 'failed'
type SmsDirection = 'income' | 'expense'

interface SmsMessage {
  id: string
  sender: string | null
  rawText: string
  receivedAt: string
  status: SmsStatus
  rejectionReason: string | null
  direction: SmsDirection | null
  amountRial: string | null
  balanceRial: string | null
  cardLast4: string | null
  externalRef: string | null
  parserId: string | null
  confidence: number
  cashbookEntryId: string | null
  sourceId: string | null
  sourceLabel: string | null
  accountName: string | null
  reviewedAt: string | null
  createdAt: string
}

interface SmsSource {
  id: string
  label: string
  channel: string
  bankCode: string
  senderPatterns: unknown
  cardLast4: string | null
  accountId: string
  accountName: string
  incomeCategoryId: string | null
  expenseCategoryId: string | null
  autoPost: boolean
  isActive: boolean
  createdAt: string
}

interface SmsToken {
  id: string
  label: string
  platform: string
  tokenPrefix: string
  lastSeenAt: string | null
  messageCount: number
  isRevoked: boolean
  revokedAt: string | null
  createdAt: string
}

const bankCodes = ['melli', 'mellat', 'saderat', 'resalat', 'tejarat', 'parsian', 'pasargad', 'saman', 'sepah', 'refah', 'shahr', 'keshavarzi', 'maskan', 'ayandeh', 'blubank', 'ansar', 'sarmayeh']

const tab = ref<'inbox' | 'sources'>('inbox')
const statusFilter = ref<SmsStatus | ''>('review')
const page = ref(1)
const messages = ref<SmsMessage[]>([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const stats = ref<Record<SmsStatus, number>>({ posted: 0, review: 0, duplicate: 0, ignored: 0, failed: 0 })
const sources = ref<SmsSource[]>([])
const tokens = ref<SmsToken[]>([])
const loading = ref(false)
const saving = ref(false)

const approveDialog = ref(false)
const approveTarget = ref<SmsMessage | null>(null)
const approveForm = reactive({ kind: 'expense' as SmsDirection, amountToman: '', categoryId: '', accountId: '', entryDate: '', description: '' })

const sourceDialog = ref(false)
const sourceForm = reactive({ label: '', bankCode: 'melli', accountId: '', cardLast4: '', senders: '', autoPost: true })

const tokenDialog = ref(false)
const tokenForm = reactive({ label: '', platform: 'android' })
const createdToken = ref('')

const pasteDialog = ref(false)
const pasteForm = reactive({ text: '', sender: '' })

const isFa = computed(() => locale.value === 'fa')
const activeAccounts = computed(() => props.accounts.filter((account) => !account.isArchived))
const approveCategories = computed(() => props.categories.filter((category) => !category.isArchived && category.kind === approveForm.kind))

const kindOptions = computed(() => [
  { title: t('cashbook.income'), value: 'income' as SmsDirection },
  { title: t('cashbook.expense'), value: 'expense' as SmsDirection },
])
const bankOptions = computed(() => bankCodes.map((code) => ({ value: code, title: bankLabel(code) })))
const platformOptions = computed(() => ['android', 'ios', 'web', 'unknown'].map((value) => ({
  value,
  title: t(`cashbook.sms.platform.${value}`),
})))

const filters = computed(() => ([
  { value: '' as const, title: t('cashbook.sms.filterAll'), count: totalCount.value },
  { value: 'review' as const, title: t('cashbook.sms.filterReview'), count: stats.value.review },
  { value: 'posted' as const, title: t('cashbook.sms.filterPosted'), count: stats.value.posted },
  { value: 'ignored' as const, title: t('cashbook.sms.filterIgnored'), count: stats.value.ignored },
  { value: 'failed' as const, title: t('cashbook.sms.filterFailed'), count: stats.value.failed },
]))
const totalCount = computed(() => Object.values(stats.value).reduce((sum, value) => sum + value, 0))

const approveValid = computed(() => !!approveForm.amountToman && toRial(approveForm.amountToman) !== '0' && !!approveForm.categoryId && !!approveForm.accountId && !!approveForm.entryDate)
const sourceValid = computed(() => !!sourceForm.label.trim() && !!sourceForm.bankCode && !!sourceForm.accountId)

function formatNumber(value: number | string | null | undefined): string {
  try { return new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(Number(value ?? 0)) } catch { return '0' }
}

function formatRial(value: string | null | undefined): string {
  try {
    const rial = BigInt(value ?? 0)
    const whole = rial / 10n
    const formatter = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US')
    return `${formatter.format(whole)} ${t('common.toman')}`
  } catch {
    return `0 ${t('common.toman')}`
  }
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat(isFa.value ? 'fa-IR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return '—'
  }
}

function toRial(value: string | number): string {
  const text = String(value).replace(/,/g, '').trim()
  if (!/^\d+(?:\.\d{0,1})?$/.test(text)) return '0'
  const [whole, fraction = ''] = text.split('.')
  try {
    return (BigInt(whole || '0') * 10n + BigInt(`${fraction}0`.slice(0, 1) || '0')).toString()
  } catch {
    return '0'
  }
}

function toToman(value: string | null): string {
  try {
    const rial = BigInt(value ?? '0')
    const whole = rial / 10n
    const remainder = rial % 10n
    return `${whole}${remainder ? `.${remainder}` : ''}`
  } catch {
    return ''
  }
}

function bankLabel(code: string): string {
  const key = `cashbook.sms.banks.${code}`
  const label = t(key)
  return label === key ? code : label
}

function statusIcon(status: SmsStatus): string {
  return {
    posted: 'mdi-check-circle-outline',
    review: 'mdi-alert-circle-outline',
    duplicate: 'mdi-content-duplicate',
    ignored: 'mdi-eye-off-outline',
    failed: 'mdi-close-circle-outline',
  }[status]
}

function statusLabel(status: SmsStatus): string {
  return t(`cashbook.sms.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)
}

function directionLabel(direction: SmsDirection): string {
  return direction === 'income' ? t('cashbook.income') : t('cashbook.expense')
}

function reasonLabel(reason: string): string {
  const key = `cashbook.sms.reason.${reason}`
  const label = t(key)
  return label === key ? reason : label
}

function canActOn(message: SmsMessage): boolean {
  return message.status === 'review' || message.status === 'failed'
}

async function loadMessages() {
  const params = new URLSearchParams({ page: String(page.value), limit: String(pagination.value.limit) })
  if (statusFilter.value) params.set('status', statusFilter.value)
  const response = await apiFetch<{ data: SmsMessage[]; pagination: typeof pagination.value }>(`/api/finance/messages?${params}`)
  messages.value = response.data ?? []
  pagination.value = response.pagination ?? pagination.value
}

async function loadStats() {
  const response = await apiFetch<{ data: Record<SmsStatus, number> }>('/api/finance/stats')
  if (response.data) stats.value = response.data
}

async function loadSources() {
  const response = await apiFetch<{ data: SmsSource[] }>('/api/finance/sources')
  sources.value = response.data ?? []
}

async function loadTokens() {
  const response = await apiFetch<{ data: SmsToken[] }>('/api/finance/tokens')
  tokens.value = response.data ?? []
}

async function refreshAll() {
  loading.value = true
  try {
    await Promise.all([loadMessages(), loadStats(), loadSources(), loadTokens()])
  } catch {
    $toast.error(t('cashbook.loadError'))
  } finally {
    loading.value = false
  }
}

function setStatus(value: SmsStatus | '') {
  statusFilter.value = value
  page.value = 1
  loadMessages().catch(() => $toast.error(t('cashbook.loadError')))
}

function changePage(next: number) {
  page.value = next
  loadMessages().catch(() => $toast.error(t('cashbook.loadError')))
}

function openApprove(message: SmsMessage) {
  approveTarget.value = message
  approveForm.kind = message.direction ?? 'expense'
  approveForm.amountToman = toToman(message.amountRial)
  approveForm.categoryId = ''
  approveForm.accountId = activeAccounts.value[0]?.id ?? ''
  approveForm.entryDate = new Date().toISOString().slice(0, 10)
  approveForm.description = ''
  const category = props.categories.find((item) => !item.isArchived && item.kind === approveForm.kind)
  if (category) approveForm.categoryId = category.id
  approveDialog.value = true
}

watch(() => approveForm.kind, () => {
  if (!approveCategories.value.some((category) => category.id === approveForm.categoryId)) {
    approveForm.categoryId = approveCategories.value[0]?.id ?? ''
  }
})

async function submitApprove() {
  if (!approveTarget.value) return
  saving.value = true
  try {
    await apiFetch(`/api/finance/messages/${approveTarget.value.id}/approve`, {
      method: 'POST',
      body: {
        kind: approveForm.kind,
        amountRial: toRial(approveForm.amountToman),
        categoryId: approveForm.categoryId,
        accountId: approveForm.accountId,
        entryDate: approveForm.entryDate,
        ...(approveForm.description.trim() ? { description: approveForm.description.trim() } : {}),
      },
    })
    approveDialog.value = false
    $toast.success(t('cashbook.sms.approved'))
    emit('posted')
    await Promise.all([loadMessages(), loadStats()])
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  } finally {
    saving.value = false
  }
}

async function ignoreMessage(message: SmsMessage) {
  try {
    await apiFetch(`/api/finance/messages/${message.id}/ignore`, { method: 'POST' })
    $toast.success(t('cashbook.sms.ignored'))
    await Promise.all([loadMessages(), loadStats()])
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  }
}

function openSource() {
  sourceForm.label = ''
  sourceForm.bankCode = 'melli'
  sourceForm.accountId = activeAccounts.value[0]?.id ?? ''
  sourceForm.cardLast4 = ''
  sourceForm.senders = ''
  sourceForm.autoPost = true
  sourceDialog.value = true
}

async function submitSource() {
  saving.value = true
  try {
    await apiFetch('/api/finance/sources', {
      method: 'POST',
      body: {
        label: sourceForm.label.trim(),
        bankCode: sourceForm.bankCode,
        channel: 'sms',
        accountId: sourceForm.accountId,
        cardLast4: sourceForm.cardLast4.trim() || null,
        senderPatterns: sourceForm.senders.split(',').map((item) => item.trim()).filter(Boolean),
        autoPost: sourceForm.autoPost,
      },
    })
    sourceDialog.value = false
    $toast.success(t('cashbook.sms.sourceCreated'))
    await loadSources()
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  } finally {
    saving.value = false
  }
}

async function toggleAutoPost(source: SmsSource) {
  try {
    await apiFetch(`/api/finance/sources/${source.id}`, { method: 'PATCH', body: { autoPost: !source.autoPost } })
    await loadSources()
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  }
}

async function deleteSource(source: SmsSource) {
  try {
    await apiFetch(`/api/finance/sources/${source.id}`, { method: 'DELETE' })
    $toast.success(t('cashbook.sms.sourceDeleted'))
    await loadSources()
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  }
}

function openToken() {
  tokenForm.label = ''
  tokenForm.platform = 'android'
  createdToken.value = ''
  tokenDialog.value = true
}

async function submitToken() {
  saving.value = true
  try {
    const response = await apiFetch<{ data: { token: string } }>('/api/finance/tokens', {
      method: 'POST',
      body: { label: tokenForm.label.trim(), platform: tokenForm.platform },
    })
    createdToken.value = response.data?.token ?? ''
    $toast.success(t('cashbook.sms.deviceCreated'))
    await loadTokens()
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  } finally {
    saving.value = false
  }
}

function closeToken() {
  tokenDialog.value = false
  createdToken.value = ''
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(createdToken.value)
    $toast.success(t('cashbook.sms.tokenCopied'))
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  }
}

async function revokeToken(token: SmsToken) {
  try {
    await apiFetch(`/api/finance/tokens/${token.id}`, { method: 'DELETE' })
    $toast.success(t('cashbook.sms.tokenRevoked'))
    await loadTokens()
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  }
}

function openPaste() {
  pasteForm.text = ''
  pasteForm.sender = ''
  pasteDialog.value = true
}

async function submitPaste() {
  saving.value = true
  try {
    await apiFetch('/api/finance/paste', {
      method: 'POST',
      body: { text: pasteForm.text.trim(), ...(pasteForm.sender.trim() ? { sender: pasteForm.sender.trim() } : {}) },
    })
    pasteDialog.value = false
    $toast.success(t('cashbook.sms.pasteDone'))
    emit('posted')
    await Promise.all([loadMessages(), loadStats()])
  } catch {
    $toast.error(t('cashbook.sms.actionError'))
  } finally {
    saving.value = false
  }
}

onMounted(refreshAll)
</script>

<style scoped>
.sms-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.sms-head__sub {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--asa-label-2);
}

.sms-head__pills {
  display: flex;
  gap: 6px;
}

.sms-panel {
  padding: 0;
  overflow: hidden;
}

.sms-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--asa-sep);
}

.sms-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease;
}

.sms-tab:hover {
  background: var(--asa-accent-soft);
}

.sms-tab.is-on {
  background: var(--asa-accent-soft, rgba(95, 143, 235, 0.14));
  color: var(--asa-accent);
}

.sms-tabs__spacer {
  flex: 1;
}

.sms-body {
  padding: 12px;
}

.sms-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.sms-filters__spacer {
  flex: 1;
}

.sms-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--asa-sep);
  border-radius: 999px;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.sms-chip.is-on {
  border-color: transparent;
  background: var(--asa-accent-soft, rgba(95, 143, 235, 0.14));
  color: var(--asa-accent);
}

.sms-chip__count {
  font-size: 0.68rem;
  opacity: 0.75;
}

.sms-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sms-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--asa-sep);
  border-radius: 14px;
  background: var(--asa-bg-card);
}

.sms-item.is-review {
  border-color: color-mix(in srgb, var(--asa-amber, #f59e0b) 40%, var(--asa-sep));
}

.sms-item__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex: 0 0 auto;
}

.sms-item__main {
  flex: 1;
  min-width: 0;
}

.sms-item__top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.sms-item__amount {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--asa-label);
}

.sms-item__meta {
  font-size: 0.72rem;
  color: var(--asa-label-3);
}

.sms-item__text {
  margin: 5px 0 0;
  font-size: 0.78rem;
  line-height: 1.65;
  color: var(--asa-label-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.sms-item__foot {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 7px;
}

.sms-item__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
  justify-content: center;
}

.sms-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}

.sms-tag {
  padding: 1px 7px;
  border-radius: 6px;
  background: var(--asa-track);
  color: var(--asa-label-2);
  font-size: 0.68rem;
  font-weight: 600;
}

.sms-tag--warn {
  background: color-mix(in srgb, var(--asa-amber, #f59e0b) 18%, transparent);
  color: var(--asa-amber);
}

.sms-conf {
  font-size: 0.68rem;
  color: var(--asa-label-3);
}

.tone-posted {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.tone-review {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.tone-ignored,
.tone-duplicate {
  background: var(--asa-track);
  color: var(--asa-label-3);
}

.tone-failed {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.sms-sources-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.sms-sources-head__title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--asa-label);
}

.sms-sources-head__sub {
  margin: 2px 0 0;
  font-size: 0.74rem;
  color: var(--asa-label-2);
}

.sms-source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
}

.sms-source {
  padding: 12px;
  border: 1px solid var(--asa-sep);
  border-radius: 14px;
  background: var(--asa-bg-card);
}

.sms-source.is-off {
  opacity: 0.55;
}

.sms-source__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sms-source__bank {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--asa-accent);
}

.sms-source__toggle {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: 8px;
  background: var(--asa-track);
  color: var(--asa-label-3);
  cursor: pointer;
}

.sms-source__toggle.is-on {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.sms-source__label {
  margin: 6px 0 0;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--asa-label);
}

.sms-source__account {
  margin: 2px 0 0;
  font-size: 0.74rem;
  color: var(--asa-label-2);
}

.sms-source__foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.sms-source__del {
  margin-inline-start: auto;
  border: 0;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
}

.sms-source__del:hover {
  color: var(--asa-rose);
}

.sms-token-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sms-token {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--asa-sep);
  border-radius: 12px;
}

.sms-token.is-revoked {
  opacity: 0.55;
}

.sms-token__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--asa-track);
  color: var(--asa-label-2);
}

.sms-token__main {
  flex: 1;
  min-width: 0;
}

.sms-token__label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--asa-label);
}

.sms-token__prefix {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--asa-label-3);
}

.sms-token__meta {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: var(--asa-label-3);
}

.sms-token-empty {
  margin: 0;
  font-size: 0.78rem;
  color: var(--asa-label-3);
}

.sms-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sms-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sms-form__check {
  display: flex;
}

.sms-raw {
  margin: 0;
  padding: 10px;
  border-radius: 10px;
  background: var(--asa-track);
  font-size: 0.74rem;
  line-height: 1.7;
  color: var(--asa-label-2);
  white-space: pre-wrap;
}

.sms-token-reveal__hint {
  margin: 0 0 10px;
  font-size: 0.78rem;
  color: var(--asa-label-2);
}

.sms-token-reveal__box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px dashed var(--asa-accent);
  border-radius: 10px;
  background: var(--asa-accent-soft, rgba(95, 143, 235, 0.1));
}

.sms-token-reveal__box code {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  font-size: 0.76rem;
  white-space: nowrap;
}

.sms-spin {
  animation: sms-rotate 900ms linear infinite;
}

@keyframes sms-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .sms-form__row {
    grid-template-columns: 1fr;
  }

  .sms-item {
    flex-wrap: wrap;
  }

  .sms-item__actions {
    flex-direction: row;
    width: 100%;
  }
}
</style>
