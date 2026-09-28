<template>
  <UiPageContainer class="relative! max-w-[1400px]! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('messaging.title') }}</h1>
        <p class="dash-head__date">{{ t('messaging.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="loading" :aria-label="t('common.refresh')" @click="refresh">
          <v-icon size="16" :class="{ 'ms-spin': refreshing }">mdi-refresh</v-icon>
        </button>
        <button class="asa-btn asa-btn--primary" @click="openCompose">
          <Plus class="w-4! h-4! stroke-current" />
          <span>{{ t('messaging.newMessage') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Hero summary ─── -->
    <section class="ms-hero">
      <span class="ms-hero__glow" aria-hidden="true" />
      <div class="ms-hero__lead">
        <span class="ms-hero__eyebrow">{{ t('messaging.heroEyebrow') }}</span>
        <h2 class="ms-hero__title">{{ t('messaging.heroTitle') }}</h2>
        <p class="ms-hero__desc">{{ t('messaging.heroDesc') }}</p>
      </div>
      <dl class="ms-hero__stats">
        <div class="ms-stat">
          <span class="ms-stat__ico"><FolderOpen class="w-4! h-4! stroke-current" /></span>
          <dt class="ms-stat__label">{{ t('messaging.statInbox') }}</dt>
          <dd class="ms-stat__value">{{ num(inbox.length) }}</dd>
        </div>
        <div class="ms-stat">
          <span class="ms-stat__ico"><Bell class="w-4! h-4! fill-current" /></span>
          <dt class="ms-stat__label">{{ t('messaging.statUnread') }}</dt>
          <dd class="ms-stat__value">{{ num(unreadTotal) }}</dd>
        </div>
        <div class="ms-stat">
          <span class="ms-stat__ico"><FileText class="w-4! h-4! fill-current" /></span>
          <dt class="ms-stat__label">{{ t('messaging.statSent') }}</dt>
          <dd class="ms-stat__value">{{ num(sent.length) }}</dd>
        </div>
        <div class="ms-stat">
          <span class="ms-stat__ico"><ShieldCheck class="w-4! h-4! fill-current" /></span>
          <dt class="ms-stat__label">{{ t('messaging.statConfidential') }}</dt>
          <dd class="ms-stat__value">{{ num(confidentialTotal) }}</dd>
        </div>
      </dl>
    </section>

    <!-- ─── Two-pane workspace ─── -->
    <div class="ms-shell" :class="{ 'ms-shell--reader': isNarrow && mobileView === 'reader' }">
      <!-- ── List pane ── -->
      <aside class="ms-pane ms-pane--list" :aria-label="t('messaging.listLabel')">
        <div class="ms-pane__head">
          <div class="ms-seg" role="tablist" :aria-label="t('messaging.listLabel')">
            <button
              v-for="opt in tabs"
              :key="opt.value"
              type="button"
              role="tab"
              class="ms-seg__btn"
              :class="{ 'is-active': tab === opt.value }"
              :aria-selected="tab === opt.value"
              @click="setTab(opt.value)"
            >
              <span>{{ opt.label }}</span>
              <span v-if="opt.value === 'inbox' && opt.badge > 0" class="ms-seg__badge">{{ num(opt.badge) }}</span>
            </button>
          </div>

          <div class="ms-search">
            <Search class="ms-search__icon stroke-current" />
            <input
              v-model="query"
              type="search"
              class="ms-search__input"
              :placeholder="t('messaging.searchPlaceholder')"
              :aria-label="t('messaging.searchPlaceholder')"
            >
            <button v-if="query" type="button" class="ms-search__clear" :aria-label="t('messaging.clearSearch')" @click="query = ''">
              <X class="w-3! h-3! stroke-current" />
            </button>
          </div>

          <div class="ms-filters">
            <button type="button" class="ms-chipbtn" :class="{ 'is-on': unreadOnly }" :aria-pressed="unreadOnly" @click="unreadOnly = !unreadOnly">
              <Bell class="w-3! h-3! fill-current" />
              <span>{{ t('common.unreadOnly') }}</span>
            </button>
            <span v-if="filteredList.length" class="ms-count">
              {{ t('messaging.resultsCount', { count: num(filteredList.length), total: num(activeList.length) }) }}
            </span>
          </div>
        </div>

        <div class="ms-pane__body">
          <!-- Loading -->
          <div v-if="loading" class="ms-skel-list" aria-hidden="true">
            <div v-for="i in 6" :key="i" class="ms-skel-item">
              <div class="asa-skel rounded-full!" style="width: 2.5rem; height: 2.5rem" />
              <div class="ms-skel-item__lines">
                <div class="asa-skel rounded-md! h-3! w-2/5" />
                <div class="asa-skel rounded-md! h-2.5! w-4/5" />
                <div class="asa-skel rounded-md! h-2.5! w-1/3" />
              </div>
            </div>
          </div>

          <!-- Load failure -->
          <div v-else-if="loadError" class="ms-empty">
            <span class="asa-tint asa-tint--rose ms-empty__ico">
              <Activity class="w-6! h-6! stroke-current" />
            </span>
            <p class="ms-empty__title">{{ t('messaging.fetchError') }}</p>
            <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="refresh">
              {{ t('common.retry') }}
            </button>
          </div>

          <!-- Empty -->
          <div v-else-if="!filteredList.length" class="ms-empty">
            <span class="asa-tint asa-tint--indigo ms-empty__ico">
              <ChatDots class="w-6! h-6! fill-current" />
            </span>
            <p class="ms-empty__title">
              {{ hasQuery ? t('messaging.emptySearchTitle') : (tab === 'inbox' ? t('messaging.emptyInbox') : t('messaging.emptySent')) }}
            </p>
            <p class="ms-empty__desc">
              {{ hasQuery ? t('messaging.emptySearchDesc') : (tab === 'inbox' ? t('messaging.noInboxMessages') : t('messaging.noSentMessages')) }}
            </p>
          </div>

          <!-- Messages -->
          <ul v-else class="ms-list">
            <li v-for="m in filteredList" :key="m.id">
              <button
                type="button"
                class="ms-item"
                :class="{ 'is-active': m.id === selectedId, 'is-unread': !m.isRead }"
                :aria-current="m.id === selectedId ? 'true' : undefined"
                @click="openMessage(m)"
              >
                <span class="ms-avatar" :class="avatarClass(m)">{{ initialsOf(counterpartName(m)) }}</span>
                <span class="ms-item__body">
                  <span class="ms-item__row">
                    <span class="ms-item__name">{{ counterpartName(m) }}</span>
                    <span class="ms-item__time">{{ listTime(m.createdAt) }}</span>
                  </span>
                  <span class="ms-item__subject">{{ headline(m) }}</span>
                  <span class="ms-item__preview">{{ preview(m) }}</span>
                  <span v-if="m.patientId || m.isConfidential" class="ms-item__tags">
                    <span v-if="m.patientId" class="asa-pill ms-pill-soft">
                      <UserDeatils class="w-3! h-3! fill-current" />
                      {{ patientLabel(m) }}
                    </span>
                    <span v-if="m.isConfidential" class="asa-pill asa-pill--amber">
                      <ShieldCheck class="w-3! h-3! fill-current" />
                      {{ t('messaging.statConfidential') }}
                    </span>
                  </span>
                </span>
                <span v-if="!m.isRead" class="ms-item__dot" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- ── Reader pane ── -->
      <section class="ms-pane ms-pane--reader" :aria-label="t('messaging.readerLabel')">
        <template v-if="selected">
          <header class="ms-reader__head">
            <div class="ms-reader__tags">
              <span v-if="selected.isConfidential" class="asa-pill asa-pill--amber">
                <ShieldCheck class="w-3! h-3! fill-current" />
                {{ t('messaging.statConfidential') }}
              </span>
              <span class="asa-pill" :class="selected.isRead ? 'asa-pill--teal' : 'asa-pill--rose'">
                {{ selected.isRead ? t('messaging.readAt') : t('messaging.notReadYet') }}
              </span>
            </div>
            <div class="ms-reader__tools">
              <button type="button" class="ms-iconbtn" :aria-label="t('messaging.copyBody')" @click="copyBody">
                <DocumentText class="w-4! h-4! fill-current" />
              </button>
              <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="startReply(selected)">
                <ArrowRightLeft class="w-3.5! h-3.5! stroke-current" />
                {{ t('messaging.reply') }}
              </button>
              <button type="button" class="ms-iconbtn ms-iconbtn--danger" :aria-label="t('messaging.deleteMessage')" @click="askDelete(selected)">
                <TrashBin class="w-4! h-4! fill-current" />
              </button>
            </div>
          </header>

          <div class="ms-reader__scroll">
            <button v-if="isNarrow" type="button" class="ms-back" @click="mobileView = 'list'">
              <AltArrowLeft class="w-4! h-4! fill-current rtl:scale-x-[-1]" />
              <span>{{ t('messaging.backToList') }}</span>
            </button>

            <h2 class="ms-reader__subject">{{ headline(selected) }}</h2>

            <div class="ms-meta">
              <span class="ms-avatar ms-avatar--lg" :class="avatarClass(selected)">
                {{ initialsOf(counterpartName(selected)) }}
              </span>
              <div class="ms-meta__lines">
                <p class="ms-meta__strong">
                  {{ counterpartName(selected) }}
                  <span class="ms-meta__role">· {{ counterpartRole(selected) }}</span>
                </p>
                <p class="ms-meta__sub">
                  {{ tab === 'inbox' ? t('messaging.sender') : t('messaging.recipient') }}
                  · {{ formatFull(selected.createdAt) }}
                </p>
              </div>
            </div>

            <NuxtLink v-if="selected.patientId" class="ms-patient" :to="`/patients/${selected.patientId}`">
              <span class="asa-tint asa-tint--sm asa-tint--teal">
                <UserDeatils class="w-4! h-4! fill-current" />
              </span>
              <span class="ms-patient__lines">
                <span class="ms-patient__label">{{ t('messaging.patientRecord') }}</span>
                <span class="ms-patient__name">{{ patientLabel(selected) }}</span>
                <span v-if="selectedPatientCard" class="ms-patient__rows">
                  <span v-if="selectedPatientCard.nationalId" class="ms-patient__cell">
                    <b>{{ t('patients.nationalId') }}</b>
                    <span dir="ltr">{{ selectedPatientCard.nationalId }}</span>
                  </span>
                  <span v-if="selectedPatientCard.phone" class="ms-patient__cell">
                    <b>{{ t('patients.phone') }}</b>
                    <span dir="ltr">{{ selectedPatientCard.phone }}</span>
                  </span>
                </span>
              </span>
              <span class="ms-patient__cta">{{ t('messaging.viewPatient') }}</span>
            </NuxtLink>

            <div class="ms-body">{{ selected.body }}</div>
          </div>
        </template>

        <div v-else class="ms-empty ms-empty--reader">
          <span class="asa-tint asa-tint--indigo ms-empty__ico">
            <ChatDots class="w-7! h-7! fill-current" />
          </span>
          <p class="ms-empty__title">{{ t('messaging.selectMessage') }}</p>
          <p class="ms-empty__desc">{{ t('messaging.selectMessageHint') }}</p>
        </div>
      </section>
    </div>

    <!-- ─── Compose dialog ─── -->
    <v-dialog v-model="composeDialog" max-width="680" persistent scrollable transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('messaging.composeTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('messaging.composeDesc') }}</span>
          </div>
          <button type="button" class="ms-iconbtn" :aria-label="t('common.close')" @click="composeDialog = false">
            <X class="w-4! h-4! stroke-current" />
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <!-- Recipients -->
          <div class="ms-field">
            <span class="asa-field-label">{{ t('messaging.recipient') }}</span>
            <div class="ms-slots">
              <div v-if="canPickPatient" class="ms-slot">
                <div v-if="selectedPatient" class="ms-slot__card">
                  <span class="ms-avatar ms-avatar--green">
                    <UserDeatils class="w-4! h-4! fill-current" />
                  </span>
                  <span class="ms-slot__lines">
                    <span class="ms-slot__name">{{ fullName(selectedPatient) }}</span>
                    <span class="ms-slot__sub">{{ patientSubtitle(selectedPatient) }}</span>
                  </span>
                  <button type="button" class="ms-iconbtn" :aria-label="t('messaging.removePatient')" @click="selectedPatient = null">
                    <X class="w-3! h-3! stroke-current" />
                  </button>
                </div>
                <button v-else type="button" class="ms-addbtn" @click="patientSearchDialog = true">
                  <UserDeatils class="w-4! h-4! fill-current" />
                  <span>{{ t('messaging.searchAndSelectPatient') }}</span>
                </button>
              </div>

              <div class="ms-slot">
                <div v-if="composeForm.staff" class="ms-slot__card">
                  <span class="ms-avatar ms-avatar--indigo">
                    <Users class="w-4! h-4! fill-current" />
                  </span>
                  <span class="ms-slot__lines">
                    <span class="ms-slot__name">{{ composeForm.staff.fullName }}</span>
                    <span class="ms-slot__sub">{{ roleValue(composeForm.staff.role) }}</span>
                  </span>
                  <button type="button" class="ms-iconbtn" :aria-label="t('messaging.removeStaff')" @click="composeForm.staff = null">
                    <X class="w-3! h-3! stroke-current" />
                  </button>
                </div>
                <div v-else class="ms-picker">
                  <button type="button" class="ms-addbtn" :aria-expanded="staffOpen" @click="staffOpen = !staffOpen">
                    <Users class="w-4! h-4! fill-current" />
                    <span>{{ t('messaging.chooseStaff') }}</span>
                  </button>
                  <div v-if="staffOpen" class="ms-picker__panel">
                    <div class="ms-search ms-search--flat">
                      <Search class="ms-search__icon stroke-current" />
                      <input v-model="staffQuery" type="search" class="ms-search__input" :placeholder="t('common.search')" :aria-label="t('messaging.chooseStaff')">
                    </div>
                    <p v-if="!filteredStaff.length" class="ms-picker__none">{{ t('messaging.noStaffFound') }}</p>
                    <ul v-else class="ms-picker__list">
                      <li v-for="s in filteredStaff" :key="s.id">
                        <button type="button" class="ms-picker__opt" @click="pickStaff(s)">
                          <span class="ms-avatar ms-avatar--sm ms-avatar--indigo">{{ initialsOf(s.fullName) }}</span>
                          <span class="ms-picker__lines">
                            <span class="ms-picker__name">{{ s.fullName }}</span>
                            <span class="ms-picker__sub">{{ roleValue(s.role) }}</span>
                          </span>
                        </button>
                      </li>
                    </ul>
                    <p class="ms-picker__hint">{{ t('messaging.staffSearchHint') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Subject -->
          <div class="ms-field">
            <label class="asa-field-label" for="ms-subject">{{ t('messaging.subject') }}</label>
            <div class="ms-control">
              <input
                id="ms-subject"
                v-model="composeForm.subject"
                type="text"
                class="ms-input"
                :placeholder="t('messaging.subjectPlaceholder')"
                maxlength="200"
              >
              <button type="button" class="ms-pen" :aria-label="t('messaging.subject')" @click="openHandwriting('subject')">
                <svg class="ms-pen__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="ms-field">
            <label class="asa-field-label" for="ms-body">{{ t('messaging.messageBody') }}</label>
            <div class="ms-control">
              <textarea
                id="ms-body"
                v-model="composeForm.body"
                class="ms-textarea"
                rows="8"
                :placeholder="t('messaging.messageBodyPlaceholder')"
              />
              <button type="button" class="ms-pen" :aria-label="t('messaging.messageBody')" @click="openHandwriting('body')">
                <svg class="ms-pen__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confidential -->
          <label class="ms-conf">
            <input v-model="composeForm.confidential" type="checkbox" class="ms-conf__input">
            <span class="ms-conf__switch" aria-hidden="true"><span class="ms-conf__knob" /></span>
            <span class="ms-conf__lines">
              <span class="ms-conf__title">{{ t('messaging.confidentialLabel') }}</span>
              <span class="ms-conf__desc">{{ t('messaging.confidentialDesc') }}</span>
            </span>
          </label>
        </v-card-text>

        <div class="asa-dialog__foot ms-foot">
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="sending" @click="composeDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="sending" @click="sendMessage">
            {{ sending ? t('common.sending') : t('messaging.sendMessage') }}
          </button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ─── Delete confirmation ─── -->
    <v-dialog v-model="deleteDialog" max-width="440" transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('messaging.deleteTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('messaging.deleteWarning') }}</span>
          </div>
          <span class="asa-tint asa-tint--sm asa-tint--rose">
            <TrashBin class="w-4! h-4! fill-current" />
          </span>
        </div>
        <div class="asa-dialog__foot ms-foot">
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="deleting" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--rose" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? t('common.loading') : t('common.delete') }}
          </button>
        </div>
      </v-card>
    </v-dialog>

    <PatientSearchDialog v-model="patientSearchDialog" @select="onPatientSelected" />
    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import moment from 'moment-jalaali'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import PatientSearchDialog from '~/components/PatientSearchDialog.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import FileText from '~/components/icons/FileText.vue'
import Bell from '~/components/icons/Bell.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import ArrowRightLeft from '~/components/icons/ArrowRightLeft.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import UserDeatils from '~/components/icons/UserDeatils.vue'
import Users from '~/components/icons/Users.vue'
import Search from '~/components/icons/Search.vue'
import Plus from '~/components/icons/Plus.vue'
import X from '~/components/icons/X.vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import Activity from '~/components/icons/Activity.vue'

definePageMeta({})

type MessageRow = {
  id: string
  senderId: string
  senderRole: string
  senderFullName?: string | null
  receiverId?: string | null
  receiverRole?: string | null
  receiverFullName?: string | null
  patientId?: string | null
  subject?: string | null
  body: string
  isRead: boolean
  readAt?: string | null
  isConfidential: boolean
  createdAt: string
}

type StaffMember = { id: string; fullName: string; role: string }
type PatientRef = {
  id: string
  firstName?: string | null
  lastName?: string | null
  nationalId?: string | null
  phone?: string | null
  mobile?: string | null
  gender?: string | null
}

const { t, locale } = useI18n()
const { toPersianNum } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()

/* ─────────────────────── state ─────────────────────── */

const tab = ref<'inbox' | 'sent'>('inbox')
const inbox = ref<MessageRow[]>([])
const sent = ref<MessageRow[]>([])
const loading = ref(false)
const refreshing = ref(false)
const loadError = ref(false)
const selectedId = ref<string | null>(null)
const query = ref('')
const unreadOnly = ref(false)
const mobileView = ref<'list' | 'reader'>('list')
const isNarrow = ref(false)

const patientMap = ref<Record<string, PatientRef | null>>({})
const inflightPatients = new Map<string, Promise<PatientRef | null>>()

const composeDialog = ref(false)
const patientSearchDialog = ref(false)
const sending = ref(false)
const selectedPatient = ref<PatientRef | null>(null)
const staffList = ref<StaffMember[]>([])
const staffQuery = ref('')
const staffOpen = ref(false)
const composeForm = ref({ staff: null as StaffMember | null, subject: '', body: '', confidential: false })

const deleteDialog = ref(false)
const pendingDelete = ref<MessageRow | null>(null)
const deleting = ref(false)

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } = useHandwritingFields({
  fieldLabels: { subject: t('messaging.subject'), body: t('messaging.messageBody') },
  target: composeForm,
})

/* ─────────────────────── derived ─────────────────────── */

const userId = computed(() => user.value?.id ?? null)
const isPatientUser = computed(() => user.value?.role === 'patient')
const canPickPatient = computed(() => user.value?.role === 'doctor' || user.value?.role === 'admin_doctor')

const activeList = computed(() => (tab.value === 'inbox' ? inbox.value : sent.value))
const selected = computed(() => activeList.value.find((m) => m.id === selectedId.value) ?? null)
const hasQuery = computed(() => query.value.trim().length > 0)

const unreadTotal = computed(() => inbox.value.filter((m) => !m.isRead).length)
const confidentialTotal = computed(() => [...inbox.value, ...sent.value].filter((m) => m.isConfidential).length)
const selectedPatientCard = computed<PatientRef | null>(() =>
  patientOf(selected.value?.patientId),
)

const filteredList = computed(() => {
  const q = query.value.trim().toLowerCase()
  return activeList.value.filter((m) => {
    // keep the open message visible even when the "unread only" filter is on
    if (unreadOnly.value && m.isRead && m.id !== selectedId.value) return false
    if (!q) return true
    return [m.subject, m.body, m.senderFullName, m.receiverFullName].some(
      (v) => typeof v === 'string' && v.toLowerCase().includes(q),
    )
  })
})

const tabs = computed(() => [
  { value: 'inbox' as const, label: t('messaging.inbox'), badge: unreadTotal.value },
  { value: 'sent' as const, label: t('messaging.sent'), badge: 0 },
])

const filteredStaff = computed(() => {
  const q = staffQuery.value.trim().toLowerCase()
  return staffList.value
    .filter((s) => s.id !== userId.value)
    .filter((s) => !q || s.fullName.toLowerCase().includes(q))
    .slice(0, 40)
})

/* ─────────────────────── formatting ─────────────────────── */

function num(value: number | string): string {
  const s = String(value)
  return locale.value === 'fa' ? toPersianNum(s) : s
}

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function listTime(value?: string | null): string {
  const date = toDate(value)
  if (!date) return '—'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diff = Math.round((today - day) / 86_400_000)
  if (diff === 0) return num(moment(date).format('HH:mm'))
  if (diff === 1) return t('common.yesterday')
  return locale.value === 'fa' ? num(moment(date).format('jDD jMMM')) : moment(date).format('jMM/jDD')
}

function formatFull(value?: string | null): string {
  const date = toDate(value)
  if (!date) return '—'
  const m = moment(date)
  return locale.value === 'fa'
    ? `${toPersianNum(m.format('jDD jMMMM jYYYY'))} ${t('messaging.atTime')} ${toPersianNum(m.format('HH:mm'))}`
    : `${m.format('jYYYY/jMM/jDD')} ${t('messaging.atTime')} ${m.format('HH:mm')}`
}

function roleValue(role?: string | null): string {
  if (!role) return t('messaging.unknownUser')
  const key = `users.roles.${role}`
  const translated = t(key)
  return translated === key ? role : translated
}

function initialsOf(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2)
  return parts[0][0] + parts[parts.length - 1][0]
}

function fullName(patient: PatientRef): string {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim() || t('messaging.patient')
}

function patientSubtitle(patient: PatientRef): string {
  return patient.nationalId || patient.phone || patient.mobile || t('messaging.patientRecord')
}

function headline(m: MessageRow): string {
  const subject = m.subject?.trim()
  return subject || t('messaging.noSubject')
}

function preview(m: MessageRow): string {
  const body = (m.body || '').replace(/\s+/g, ' ').trim()
  return body.length > 130 ? `${body.slice(0, 130)}…` : body
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { data?: { error?: string }; response?: { data?: { error?: string } } } | null
  return e?.data?.error || e?.response?.data?.error || fallback
}

/* ─────────────────────── messages ─────────────────────── */

function patientOf(id?: string | null): PatientRef | null {
  return id ? patientMap.value[id] ?? null : null
}

function patientLabel(m: MessageRow): string {
  return fullName(patientOf(m.patientId) ?? { id: m.patientId ?? '' })
}

function recipientLabel(m: MessageRow): string {
  if (m.receiverFullName) return m.receiverFullName
  if (m.patientId) return patientLabel(m)
  if (m.receiverRole) return t('messaging.allOfRole', { role: roleValue(m.receiverRole) })
  return t('messaging.unknownUser')
}

function counterpartName(m: MessageRow): string {
  if (tab.value === 'sent') return recipientLabel(m)
  return m.senderFullName || t('messaging.unknownUser')
}

function counterpartRole(m: MessageRow): string {
  if (tab.value === 'sent') {
    if (m.receiverRole) return roleValue(m.receiverRole)
    return m.patientId ? t('users.roles.patient') : t('messaging.unknownUser')
  }
  return roleValue(m.senderRole)
}

function avatarClass(m: MessageRow): string {
  const role = tab.value === 'inbox' ? m.senderRole : m.receiverRole || m.senderRole
  const map: Record<string, string> = {
    doctor: 'ms-avatar--teal',
    admin_doctor: 'ms-avatar--indigo',
    patient: 'ms-avatar--green',
    lab: 'ms-avatar--amber',
    pharmacy: 'ms-avatar--rose',
  }
  return map[role || ''] || 'ms-avatar--teal'
}

async function resolvePatient(id: string): Promise<PatientRef | null> {
  if (!id || !canPickPatient.value) return null
  if (Object.prototype.hasOwnProperty.call(patientMap.value, id)) return patientMap.value[id]
  const pending = inflightPatients.get(id)
  if (pending) return pending

  const task = (async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: PatientRef }>(`/api/patients/${id}`)
      const data = res?.data ?? null
      patientMap.value = { ...patientMap.value, [id]: data }
      return data
    } catch {
      patientMap.value = { ...patientMap.value, [id]: null }
      return null
    } finally {
      inflightPatients.delete(id)
    }
  })()

  inflightPatients.set(id, task)
  return task
}

async function loadMessages(silent = false) {
  if (silent) refreshing.value = true
  else loading.value = true
  loadError.value = false
  try {
    const [inboxRes, sentRes] = await Promise.all([
      apiFetch<{ success: boolean; data: MessageRow[] }>('/api/messaging/inbox'),
      apiFetch<{ success: boolean; data: MessageRow[] }>('/api/messaging/sent'),
    ])
    inbox.value = Array.isArray(inboxRes?.data) ? inboxRes.data : []
    sent.value = Array.isArray(sentRes?.data) ? sentRes.data : []
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function refresh() {
  loadMessages(true)
}

function setTab(next: 'inbox' | 'sent') {
  if (tab.value === next) return
  tab.value = next
  selectedId.value = null
  query.value = ''
  unreadOnly.value = false
  mobileView.value = 'list'
}

async function openMessage(m: MessageRow) {
  selectedId.value = m.id
  if (isNarrow.value) mobileView.value = 'reader'
  if (m.patientId) resolvePatient(m.patientId)
  if (isPatientUser.value || m.isRead || !m.id) return
  if (m.receiverId !== userId.value) return

  m.isRead = true
  m.readAt = new Date().toISOString()
  try {
    await apiFetch(`/api/messaging/${m.id}/read`, { method: 'PATCH' })
  } catch {
    m.isRead = false
    m.readAt = null
  }
}

function askDelete(m: MessageRow) {
  pendingDelete.value = m
  deleteDialog.value = true
}

async function confirmDelete() {
  const target = pendingDelete.value
  if (!target) return
  deleting.value = true
  try {
    await apiFetch(`/api/messaging/${target.id}`, { method: 'DELETE' })
    inbox.value = inbox.value.filter((m) => m.id !== target.id)
    sent.value = sent.value.filter((m) => m.id !== target.id)
    if (selectedId.value === target.id) selectedId.value = null
    if (isNarrow.value) mobileView.value = 'list'
    $toast.success(t('messaging.deleteSuccess'))
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('messaging.deleteError')))
  } finally {
    deleting.value = false
    deleteDialog.value = false
    pendingDelete.value = null
  }
}

async function copyBody() {
  const m = selected.value
  if (!m) return
  try {
    await navigator.clipboard.writeText(m.body || '')
    $toast.success(t('messaging.copied'))
  } catch {
    $toast.error(t('messaging.copyFailed'))
  }
}

/* ─────────────────────── compose ─────────────────────── */

function resetCompose() {
  composeForm.value = { staff: null, subject: '', body: '', confidential: false }
  selectedPatient.value = null
  staffQuery.value = ''
  staffOpen.value = false
}

async function loadStaff() {
  if (staffList.value.length) return
  try {
    const res = await apiFetch<{ success: boolean; data: StaffMember[] }>('/api/users/doctors')
    staffList.value = Array.isArray(res?.data) ? res.data : []
  } catch {
    staffList.value = []
  }
}

function openCompose() {
  resetCompose()
  composeDialog.value = true
  loadStaff()
}

async function startReply(m: MessageRow) {
  resetCompose()
  const subject = m.subject?.trim()
  composeForm.value.subject = subject ? (/^re:/i.test(subject) ? subject : `Re: ${subject}`) : ''
  composeForm.value.confidential = !!m.isConfidential
  composeForm.value.body = `\n\n———\n${counterpartName(m)} · ${formatFull(m.createdAt)}\n${m.body}`

  if (m.patientId) {
    selectedPatient.value = patientOf(m.patientId) ?? { id: m.patientId }
    resolvePatient(m.patientId)
  }

  const counterpartId = tab.value === 'inbox' ? m.senderId : m.receiverId
  await loadStaff()
  if (counterpartId) composeForm.value.staff = staffList.value.find((s) => s.id === counterpartId) ?? null

  composeDialog.value = true
}

function pickStaff(staff: StaffMember) {
  composeForm.value.staff = staff
  staffQuery.value = ''
  staffOpen.value = false
}

function onPatientSelected(patient: PatientRef) {
  const ref: PatientRef = {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    nationalId: patient.nationalId,
    phone: patient.phone,
    mobile: patient.mobile,
    gender: patient.gender,
  }
  selectedPatient.value = ref
  patientMap.value = { ...patientMap.value, [ref.id]: ref }
}

async function sendMessage() {
  const { staff, subject, body, confidential } = composeForm.value
  if (!selectedPatient.value && !staff) {
    $toast.error(t('messaging.chooseRecipientError'))
    return
  }
  const trimmedBody = body.trim()
  if (!trimmedBody) {
    $toast.error(t('messaging.enterBodyError'))
    return
  }

  sending.value = true
  try {
    const payload: Record<string, unknown> = {
      body: trimmedBody,
      subject: subject.trim() || undefined,
      is_confidential: !!confidential,
    }
    if (selectedPatient.value) payload.patient_id = selectedPatient.value.id
    if (staff) payload.receiver_id = staff.id

    await apiFetch('/api/messaging/send', { method: 'POST', body: payload })
    $toast.success(t('messaging.sendSuccess'))
    composeDialog.value = false
    resetCompose()
    setTab('sent')
    await loadMessages(true)
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('messaging.sendError')))
  } finally {
    sending.value = false
  }
}

/* ─────────────────────── lifecycle ─────────────────────── */

function syncViewport() {
  isNarrow.value = window.innerWidth < 900
  if (!isNarrow.value) mobileView.value = 'list'
}

watch(filteredList, (list) => {
  if (!canPickPatient.value) return
  list.slice(0, 6).forEach((m) => {
    if (m.patientId && !Object.prototype.hasOwnProperty.call(patientMap.value, m.patientId)) resolvePatient(m.patientId)
  })
})

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport, { passive: true })
  loadMessages()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})

useSeoMeta({ title: () => t('messaging.titleSeo') })
</script>

<style scoped>
/* ═══════════════ hero ═══════════════ */
.ms-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.125rem;
  padding: 1.375rem 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #00adb5 0%, #0b8f99 52%, #0d6f86 100%);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.06), 0 18px 34px -18px rgba(0, 122, 130, 0.65);
  color: #fff;
}

.ms-hero__glow {
  position: absolute;
  inset-block-start: -55%;
  inset-inline-end: -8%;
  width: 46%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.26) 0%, transparent 68%);
  pointer-events: none;
}

.ms-hero__lead {
  position: relative;
  min-width: 0;
  max-width: 30rem;
}

.ms-hero__eyebrow {
  display: inline-block;
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.ms-hero__title {
  margin-top: 0.5rem;
  font-size: clamp(1.25rem, 2.6vw, 1.625rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.ms-hero__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.82);
}

.ms-hero__stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 0;
  flex: 1 1 20rem;
  min-width: 0;
}

.ms-stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 0.75rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(6px);
}

.ms-stat__ico {
  display: inline-flex;
  color: rgba(255, 255, 255, 0.9);
}

.ms-stat__label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
}

.ms-stat__value {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.dark .ms-hero {
  background: linear-gradient(135deg, #0e8b93 0%, #0a6b74 52%, #084f61 100%);
}

/* ═══════════════ shell ═══════════════ */
.ms-shell {
  display: grid;
  grid-template-columns: minmax(0, 21rem) minmax(0, 1fr);
  gap: 1rem;
  height: clamp(34rem, calc(100dvh - 21rem), 56rem);
}

.ms-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.375rem;
  box-shadow: var(--asa-card-shadow);
  overflow: hidden;
}

.ms-pane__head {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.875rem;
  border-bottom: 1px solid var(--asa-sep);
}

.ms-pane__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ═══════════════ segmented control ═══════════════ */
.ms-seg {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.ms-seg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  flex: 1;
  height: 2.125rem;
  padding: 0 0.75rem;
  border: none;
  border-radius: 0.6875rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.ms-seg__btn.is-active {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.1), 0 4px 10px -6px rgba(17, 24, 39, 0.3);
}

.dark .ms-seg__btn.is-active {
  background: rgba(255, 255, 255, 0.14);
  color: var(--asa-label);
}

.ms-seg__btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.ms-seg__badge {
  min-width: 1.25rem;
  padding: 0 0.3125rem;
  border-radius: 9999px;
  background: var(--asa-rose);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-align: center;
}

/* ═══════════════ search ═══════════════ */
.ms-search {
  position: relative;
  display: flex;
  align-items: center;
}

.ms-search__icon {
  position: absolute;
  inset-inline-start: 0.6875rem;
  width: 1rem;
  height: 1rem;
  color: var(--asa-label-3);
  pointer-events: none;
}

.ms-search__input {
  width: 100%;
  height: 2.25rem;
  padding-inline: 2.125rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-family: inherit;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.ms-search__input::placeholder {
  color: var(--asa-label-3);
}

.ms-search__input:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--asa-accent) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.ms-search__input::-webkit-search-cancel-button {
  display: none;
}

.ms-search__clear {
  position: absolute;
  inset-inline-end: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  border: none;
  border-radius: 50%;
  background: var(--asa-track);
  color: var(--asa-bg-card);
  cursor: pointer;
}

.ms-search--flat .ms-search__input {
  height: 2rem;
  padding-inline: 0.75rem;
  border-color: transparent;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

/* ═══════════════ filters ═══════════════ */
.ms-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ms-chipbtn {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  height: 1.75rem;
  padding: 0 0.625rem;
  border: 1px solid var(--asa-sep);
  border-radius: 9999px;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    border-color 150ms var(--ease-default);
}

.ms-chipbtn:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.ms-chipbtn.is-on {
  background: var(--asa-accent-soft);
  border-color: color-mix(in srgb, var(--asa-accent) 40%, transparent);
  color: var(--asa-accent-deep);
}

.dark .ms-chipbtn.is-on,
.dark .ms-chipbtn:hover {
  color: var(--asa-accent);
}

.ms-chipbtn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.ms-count {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-3);
  white-space: nowrap;
}

/* ═══════════════ list ═══════════════ */
.ms-list {
  margin: 0;
  padding: 0.375rem;
  list-style: none;
}

.ms-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.6875rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.ms-item::before {
  content: '';
  position: absolute;
  inset-block: 0.625rem;
  inset-inline-start: 0;
  width: 3px;
  border-radius: 9999px;
  background: var(--asa-accent);
  opacity: 0;
  transition: opacity 150ms var(--ease-default);
}

.ms-item:hover {
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.ms-item.is-active {
  background: var(--asa-accent-soft);
}

.ms-item.is-active::before {
  opacity: 1;
}

.ms-item:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: -2px;
}

.ms-item__body {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  min-width: 0;
  flex: 1;
}

.ms-item__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.ms-item__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-item.is-unread .ms-item__name {
  font-weight: 800;
  color: var(--asa-label);
}

.ms-item__time {
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 500;
  color: var(--asa-label-3);
  white-space: nowrap;
}

.ms-item__subject {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-item__preview {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-label-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ms-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.ms-pill-soft {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.ms-item__dot {
  width: 0.5rem;
  height: 0.5rem;
  margin-top: 0.375rem;
  border-radius: 50%;
  background: var(--asa-accent);
  flex-shrink: 0;
}

/* ═══════════════ avatars ═══════════════ */
.ms-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.ms-avatar--lg {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  font-size: 0.875rem;
}

.ms-avatar--sm {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  font-size: 0.625rem;
}

.ms-avatar--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.ms-avatar--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.ms-avatar--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.ms-avatar--amber {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.ms-avatar--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.dark .ms-avatar--teal {
  color: var(--asa-accent);
}

/* ═══════════════ empty / skeleton ═══════════════ */
.ms-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.ms-empty--reader {
  flex: 1;
  height: 100%;
}

.ms-empty__ico {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.125rem;
  margin-bottom: 0.25rem;
}

.ms-empty__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
}

.ms-empty__desc {
  max-width: 20rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.ms-skel-list {
  padding: 0.375rem;
}

.ms-skel-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.ms-skel-item__lines {
  display: flex;
  flex-direction: column;
  gap: 0.4375rem;
  flex: 1;
  min-width: 0;
}

/* ═══════════════ reader ═══════════════ */
.ms-reader__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--asa-sep);
}

.ms-reader__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  min-width: 0;
}

.ms-reader__tools {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.ms-reader__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1.25rem 1.5rem 2rem;
}

.ms-reader__subject {
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.ms-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.125rem;
}

.ms-meta__lines {
  min-width: 0;
}

.ms-meta__strong {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.ms-meta__role {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.ms-meta__sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* patient card */
.ms-patient {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  text-decoration: none;
  transition: border-color 150ms var(--ease-default), background-color 150ms var(--ease-default);
}

.ms-patient:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 40%, transparent);
  background: var(--asa-accent-soft);
}

.ms-patient__lines {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.ms-patient__label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.ms-patient__name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.ms-patient__rows {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.ms-patient__cell {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.ms-patient__cell b {
  font-weight: 600;
  color: var(--asa-label-3);
}

.ms-patient__cta {
  flex-shrink: 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
  white-space: nowrap;
}

.dark .ms-patient__cta {
  color: var(--asa-accent);
}

/* body */
.ms-body {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.9375rem;
  line-height: 1.9;
  color: var(--asa-label);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* mobile back */
.ms-back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.875rem;
  padding-block: 0.375rem;
  padding-inline-start: 0.5rem;
  padding-inline-end: 0.75rem;
  border: none;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-accent-deep);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.dark .ms-back {
  color: var(--asa-accent);
}

/* ═══════════════ icon buttons ═══════════════ */
.ms-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.ms-iconbtn:hover {
  background: var(--asa-track);
  color: var(--asa-label);
}

.ms-iconbtn--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.ms-iconbtn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

/* ═══════════════ compose fields ═══════════════ */
.ms-field + .ms-field {
  margin-top: 1rem;
}

.ms-slots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ms-slot {
  min-width: 0;
}

.ms-slot__card,
.ms-addbtn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: start;
}

.ms-slot__card {
  border: 1px solid color-mix(in srgb, var(--asa-accent) 35%, transparent);
  background: var(--asa-accent-soft);
  color: var(--asa-label);
}

.ms-addbtn {
  border: 1px dashed var(--asa-sep);
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), color 150ms var(--ease-default),
    background-color 150ms var(--ease-default);
}

.ms-addbtn:hover {
  border-color: var(--asa-accent);
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .ms-addbtn:hover {
  color: var(--asa-accent);
}

.ms-slot__lines {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.ms-slot__name {
  font-weight: 700;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.ms-slot__sub {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* staff picker */
.ms-picker {
  position: relative;
}

.ms-picker__panel {
  margin-top: 0.375rem;
  padding: 0.5rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: var(--asa-bg-card);
}

.ms-picker__list {
  margin: 0.375rem 0 0;
  padding: 0;
  list-style: none;
  max-height: 12rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.ms-picker__opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4375rem 0.5rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.ms-picker__opt:hover {
  background: var(--asa-accent-soft);
}

.ms-picker__lines {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ms-picker__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.ms-picker__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.ms-picker__none,
.ms-picker__hint {
  padding: 0.5rem;
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.ms-picker__none {
  text-align: center;
}

/* inputs */
.ms-control {
  position: relative;
}

.ms-input,
.ms-textarea {
  width: 100%;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: var(--asa-bg-card);
  color: var(--asa-label);
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.7;
  padding-inline: 0.875rem;
  padding-inline-end: 2.5rem;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.ms-input {
  height: 2.625rem;
}

.ms-textarea {
  min-height: 9rem;
  padding-block: 0.625rem;
  resize: vertical;
}

.ms-input::placeholder,
.ms-textarea::placeholder {
  color: var(--asa-label-3);
}

.ms-input:focus,
.ms-textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--asa-accent) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.ms-pen {
  position: absolute;
  inset-inline-end: 0.5rem;
  top: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.ms-pen:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent);
}

.ms-pen__ico {
  width: 1rem;
  height: 1rem;
}

/* confidential switch */
.ms-conf {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--asa-sep);
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  cursor: pointer;
}

.ms-conf__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.ms-conf__switch {
  position: relative;
  width: 2.875rem;
  height: 1.75rem;
  border-radius: 9999px;
  background: var(--asa-track);
  flex-shrink: 0;
  margin-top: 0.125rem;
  transition: background-color 200ms var(--ease-default);
}

.ms-conf__knob {
  position: absolute;
  top: 0.1875rem;
  inset-inline-start: 0.1875rem;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: inset-inline-start 200ms var(--ease-premium);
}

.ms-conf__input:checked + .ms-conf__switch {
  background: var(--asa-amber);
}

.ms-conf__input:checked + .ms-conf__switch .ms-conf__knob {
  inset-inline-start: calc(100% - 1.5625rem);
}

.ms-conf__input:focus-visible + .ms-conf__switch {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.ms-conf__lines {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  min-width: 0;
}

.ms-conf__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--asa-label);
}

.ms-conf__desc {
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.ms-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ═══════════════ misc ═══════════════ */
.ms-spin {
  animation: ms-rotate 900ms linear infinite;
}

@keyframes ms-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* ═══════════════ responsive ═══════════════ */
@media (max-width: 899px) {
  .ms-shell {
    grid-template-columns: minmax(0, 1fr);
    height: clamp(30rem, calc(100dvh - 22rem), 46rem);
  }

  .ms-shell--reader .ms-pane--list {
    display: none;
  }

  .ms-shell:not(.ms-shell--reader) .ms-pane--reader {
    display: none;
  }

  .ms-reader__scroll {
    padding: 1.125rem 1.125rem 1.75rem;
  }
}

@media (max-width: 639px) {
  .ms-hero {
    padding: 1.125rem;
    border-radius: 1.25rem;
  }

  .ms-hero__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ms-pane {
    border-radius: 1.125rem;
  }

  .ms-reader__head {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ms-spin {
    animation: none;
  }
}
</style>
