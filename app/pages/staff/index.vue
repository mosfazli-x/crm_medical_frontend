<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('staff.title') }}</h1>
        <p class="dash-head__date">{{ t('staff.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button
          class="asa-btn asa-btn--ghost"
          :disabled="loading"
          :aria-label="t('staff.refresh')"
          :title="t('staff.refresh')"
          @click="refreshAll"
        >
          <v-icon size="16" :class="{ 'pf-spin': loading }">mdi-refresh</v-icon>
        </button>
        <button class="asa-btn asa-btn--primary" @click="openCreate">
          <Plus class="w-4! h-4! stroke-current" />
          <span>{{ t('staff.addNew') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Hero summary ─── -->
    <section class="asa-hero">
      <span class="asa-hero__orb asa-hero__orb--a" aria-hidden="true" />
      <span class="asa-hero__orb asa-hero__orb--b" aria-hidden="true" />

      <div class="asa-hero__inner">
        <div class="asa-hero__copy">
          <p class="asa-hero__eyebrow">{{ todayLabel }}</p>
          <h2 class="asa-hero__title">{{ t('staff.heroTitle') }}</h2>
          <p class="asa-hero__desc">{{ t('staff.heroDesc') }}</p>
        </div>
        <div class="asa-hero__avatar" aria-hidden="true">
          <UsersGroup class="w-6! h-6! stroke-current" />
        </div>
      </div>

      <div class="asa-hero__stats">
        <div v-for="stat in heroStats" :key="stat.key" class="asa-hero__stat">
          <span class="asa-hero__stat-ic">
            <component :is="stat.icon" class="w-3.5! h-3.5! stroke-current" />
          </span>
          <span class="asa-hero__stat-copy">
            <span class="asa-hero__stat-value">{{ pn(stat.value) }}</span>
            <span class="asa-hero__stat-label">{{ stat.label }}</span>
          </span>
        </div>
      </div>
    </section>

    <!-- ─── Roster ─── -->
    <div class="asa-card pf-table-card mt-5!">
      <!-- Toolbar: search + status segments + position filter -->
      <div class="pf-toolbar">
        <div class="pf-toolbar__search">
          <span class="pf-toolbar__search-ic">
            <Magnify class="w-4! h-4! stroke-current" />
          </span>
          <input
            v-model="query"
            type="search"
            class="pf-toolbar__input"
            :placeholder="t('staff.searchPlaceholder')"
            :aria-label="t('staff.searchPlaceholder')"
          >
          <button
            v-if="query"
            class="pf-toolbar__clear"
            type="button"
            :aria-label="t('common.clear')"
            @click="query = ''"
          >
            <v-icon size="15">mdi-close</v-icon>
          </button>
        </div>

        <div class="pf-seg" role="group" :aria-label="t('staff.status')">
          <button
            v-for="seg in statusSegments"
            :key="seg.value"
            type="button"
            class="pf-seg__btn"
            :class="{ 'pf-seg__btn--on': status === seg.value }"
            :aria-pressed="status === seg.value"
            @click="status = seg.value"
          >
            <span>{{ seg.label }}</span>
            <span class="pf-seg__count">{{ pn(seg.count) }}</span>
          </button>
        </div>

        <div class="pf-toolbar__tail">
          <v-select
            v-model="position"
            :items="positionOptions"
            variant="solo"
            density="compact"
            hide-details
            clearable
            :placeholder="t('staff.allPositions')"
            :aria-label="t('staff.position')"
            prepend-inner-icon="mdi-briefcase-outline"
            class="stf-select"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading">
        <div class="pf-skel">
          <div v-for="i in 6" :key="`sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-32! rounded-md!" />
            <div class="asa-skel h-4! w-44! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
          </div>
        </div>
      </div>

      <!-- Load error -->
      <div v-else-if="error" class="pf-empty">
        <div class="asa-tint asa-tint--rose pf-tint-lg">
          <v-icon size="26">mdi-cloud-alert-outline</v-icon>
        </div>
        <div>
          <p class="pf-empty__title">{{ t('staff.loadErrorTitle') }}</p>
          <p class="pf-empty__desc">{{ t('staff.fetchError') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="fetchStaff">
            <v-icon size="15">mdi-refresh</v-icon>
            <span>{{ t('staff.retry') }}</span>
          </button>
        </div>
      </div>

      <!-- Completely empty -->
      <div v-else-if="!staffList.length" class="pf-empty">
        <div class="asa-tint asa-tint--teal pf-tint-lg">
          <UsersGroup class="w-6! h-6! stroke-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('staff.noStaff') }}</p>
          <p class="pf-empty__desc">{{ t('staff.noStaffDescription') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreate">
            <Plus class="w-4! h-4! stroke-current" />
            <span>{{ t('staff.addNew') }}</span>
          </button>
        </div>
      </div>

      <!-- No search/filter matches -->
      <div v-else-if="!visibleStaff.length" class="pf-empty">
        <div class="asa-tint asa-tint--indigo pf-tint-lg">
          <Magnify class="w-6! h-6! stroke-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('staff.noMatches') }}</p>
          <p class="pf-empty__desc">{{ t('staff.noMatchesDesc') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="resetFilters">
            <v-icon size="15">mdi-filter-remove-outline</v-icon>
            <span>{{ t('staff.clearFilters') }}</span>
          </button>
        </div>
      </div>

      <!-- Desktop: sortable table -->
      <div v-else class="stf-table-wrap asa-table-wrap">
        <table class="pf-table">
          <thead>
            <tr>
              <th class="pf-pl0">
                <button
                  type="button"
                  class="pf-th-btn"
                  :class="{ 'pf-th-btn--active': sortKey === 'fullName' }"
                  :aria-sort="ariaSort('fullName')"
                  @click="toggleSort('fullName')"
                >
                  <span>{{ t('staff.name') }}</span>
                  <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'fullName' }]">
                    {{ sortIcon('fullName') }}
                  </v-icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  class="pf-th-btn"
                  :class="{ 'pf-th-btn--active': sortKey === 'position' }"
                  :aria-sort="ariaSort('position')"
                  @click="toggleSort('position')"
                >
                  <span>{{ t('staff.position') }}</span>
                  <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'position' }]">
                    {{ sortIcon('position') }}
                  </v-icon>
                </button>
              </th>
              <th>{{ t('staff.phone') }}</th>
              <th>
                <button
                  type="button"
                  class="pf-th-btn"
                  :class="{ 'pf-th-btn--active': sortKey === 'employmentDate' }"
                  :aria-sort="ariaSort('employmentDate')"
                  @click="toggleSort('employmentDate')"
                >
                  <span>{{ t('staff.hireDate') }}</span>
                  <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'employmentDate' }]">
                    {{ sortIcon('employmentDate') }}
                  </v-icon>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  class="pf-th-btn"
                  :class="{ 'pf-th-btn--active': sortKey === 'isActive' }"
                  :aria-sort="ariaSort('isActive')"
                  @click="toggleSort('isActive')"
                >
                  <span>{{ t('staff.status') }}</span>
                  <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'isActive' }]">
                    {{ sortIcon('isActive') }}
                  </v-icon>
                </button>
              </th>
              <th class="pf-ta-end">{{ t('staff.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in visibleStaff" :key="member.id">
              <td class="pf-pl0">
                <div class="stf-cell">
                  <span class="stf-avatar" :class="isActive(member) ? 'stf-avatar--on' : 'stf-avatar--off'">
                    {{ initials(member) }}
                  </span>
                  <span class="stf-cell__copy">
                    <span class="stf-cell__name">{{ member.fullName }}</span>
                    <span v-if="!member.position" class="stf-cell__sub">{{ t('staff.noPosition') }}</span>
                  </span>
                </div>
              </td>
              <td>
                <span v-if="member.position" class="asa-pill asa-pill--teal">{{ member.position }}</span>
                <span v-else class="pf-pill--neutral asa-pill">---</span>
              </td>
              <td>
                <a :href="`tel:${member.phone}`" class="stf-tel pf-ip" dir="ltr">{{ member.phone }}</a>
              </td>
              <td class="pf-dt">{{ formatHireDate(member.employmentDate) }}</td>
              <td>
                <span class="asa-pill" :class="isActive(member) ? 'asa-pill--green' : 'pf-pill--neutral'">
                  <span v-if="isActive(member)" class="pf-pulse" />
                  {{ isActive(member) ? t('staff.activeStaff') : t('staff.inactiveStaff') }}
                </span>
              </td>
              <td class="pf-ta-end">
                <div class="stf-actions">
                  <button
                    class="pf-icon-btn"
                    type="button"
                    :title="t('staff.quickView')"
                    :aria-label="t('staff.quickView')"
                    @click="openDetails(member)"
                  >
                    <Eye class="w-4! h-4! stroke-current" />
                  </button>
                  <button
                    class="pf-icon-btn"
                    type="button"
                    :title="t('staff.edit')"
                    :aria-label="t('staff.edit')"
                    @click="openEdit(member)"
                  >
                    <Pencil />
                  </button>
                  <button
                    class="pf-icon-btn"
                    :class="{ 'pf-icon-btn--danger': isActive(member) }"
                    type="button"
                    :title="isActive(member) ? t('staff.deactivate') : t('staff.activate')"
                    :aria-label="isActive(member) ? t('staff.deactivate') : t('staff.activate')"
                    @click="askToggle(member)"
                  >
                    <v-icon size="19">
                      {{ isActive(member) ? 'mdi-account-cancel-outline' : 'mdi-account-check-outline' }}
                    </v-icon>
                  </button>
                  <button
                    class="pf-icon-btn pf-icon-btn--danger"
                    type="button"
                    :title="t('staff.delete')"
                    :aria-label="t('staff.delete')"
                    @click="askDelete(member)"
                  >
                    <TrashBin class="w-4! h-4! stroke-current" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile: roster cards -->
      <div v-if="!loading && !error && visibleStaff.length" class="pf-roster stf-roster">
        <div v-for="member in visibleStaff" :key="member.id" class="pf-roster__item">
          <span class="stf-avatar" :class="isActive(member) ? 'stf-avatar--on' : 'stf-avatar--off'">
            {{ initials(member) }}
          </span>
          <div class="pf-roster__body">
            <div class="pf-roster__top">
              <span class="pf-roster__name">{{ member.fullName }}</span>
              <span class="asa-pill" :class="isActive(member) ? 'asa-pill--green' : 'pf-pill--neutral'">
                <span v-if="isActive(member)" class="pf-pulse" />
                {{ isActive(member) ? t('staff.activeStaff') : t('staff.inactiveStaff') }}
              </span>
            </div>
            <div class="pf-roster__meta">
              <span v-if="member.position">
                <v-icon size="13">mdi-briefcase-outline</v-icon>
                {{ member.position }}
              </span>
              <a :href="`tel:${member.phone}`" class="stf-tel" dir="ltr">{{ member.phone }}</a>
              <span v-if="member.employmentDate">
                <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                {{ formatHireDate(member.employmentDate) }}
              </span>
            </div>
          </div>
          <div class="pf-roster__actions">
            <button
              class="pf-icon-btn"
              type="button"
              :title="t('staff.quickView')"
              :aria-label="t('staff.quickView')"
              @click="openDetails(member)"
            >
              <Eye class="w-4! h-4! stroke-current" />
            </button>
            <button
              class="pf-icon-btn"
              type="button"
              :title="t('staff.edit')"
              :aria-label="t('staff.edit')"
              @click="openEdit(member)"
            >
              <Pencil />
            </button>
            <button
              class="pf-icon-btn pf-icon-btn--danger"
              type="button"
              :title="t('staff.delete')"
              :aria-label="t('staff.delete')"
              @click="askDelete(member)"
            >
              <TrashBin class="w-4! h-4! stroke-current" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!loading && !error && staffList.length" class="pf-card-foot">
        <p class="pf-card-foot__info">
          {{ t('staff.showing', { shown: visibleStaff.length, total: staffList.length }) }}
        </p>
        <p v-if="presentToday" class="stf-foot-note">
          <span class="pf-pulse" />
          {{ t('staff.presentTodayNote', { count: presentToday }) }}
        </p>
      </div>
    </div>

    <!-- ─── Quick view dialog ─── -->
    <v-dialog v-model="detailsOpen" max-width="620" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="stf-dlg-head">
            <span class="stf-avatar stf-avatar--lg" :class="details && isActive(details) ? 'stf-avatar--on' : 'stf-avatar--off'">
              {{ details ? initials(details) : '' }}
            </span>
            <div class="stf-dlg-head__copy">
              <h2 class="asa-dialog__title">{{ details?.fullName || '---' }}</h2>
              <span class="asa-dialog__sub">{{ details?.position || t('staff.noPosition') }}</span>
            </div>
          </div>
          <button class="pf-x" type="button" :aria-label="t('common.close')" @click="detailsOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text v-if="detailsLoading" class="asa-dialog__body">
          <div class="pf-info-grid">
            <div v-for="i in 6" :key="`d-${i}`">
              <div class="asa-skel h-3! w-16! rounded-md! mb-2!" />
              <div class="asa-skel h-4! w-28! rounded-md!" />
            </div>
          </div>
        </v-card-text>

        <v-card-text v-else-if="details" class="asa-dialog__body">
          <div class="pf-info-grid">
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.status') }}</p>
              <span class="asa-pill" :class="isActive(details) ? 'asa-pill--green' : 'pf-pill--neutral'">
                <span v-if="isActive(details)" class="pf-pulse" />
                {{ isActive(details) ? t('staff.activeStaff') : t('staff.inactiveStaff') }}
              </span>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.position') }}</p>
              <p class="pf-info-value">{{ details.position || t('staff.noPosition') }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.phone') }}</p>
              <a :href="`tel:${details.phone}`" class="pf-info-value stf-tel" dir="ltr">{{ details.phone }}</a>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.hireDate') }}</p>
              <p class="pf-info-value">{{ formatHireDate(details.employmentDate) }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.tenure') }}</p>
              <p class="pf-info-value">{{ formatTenure(details.employmentDate) }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.accountStatus') }}</p>
              <span class="asa-pill" :class="accountPillClass(details.status)">
                {{ t(`staff.accountStates.${details.status || 'unknown'}`, details.status || '---') }}
              </span>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.createdAt') }}</p>
              <p class="pf-info-value">{{ formatFullDate(details.createdAt) }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('staff.weeklyHours') }}</p>
              <p class="pf-info-value">{{ formatWeeklyHours(details.weeklySchedule) }}</p>
            </div>
            <div v-if="details.notes" class="pf-info-cell pf-info-cell--full">
              <p class="pf-info-label">{{ t('staffForm.notes') }}</p>
              <p class="pf-ua">{{ details.notes }}</p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="detailsOpen = false">
            <span>{{ t('common.close') }}</span>
          </button>
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="goToProfile">
            <Profile class="w-4! h-4! stroke-current" />
            <span>{{ t('staff.viewProfile') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="editFromDetails">
            <Pencil />
            <span>{{ t('staff.edit') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Confirm activate / deactivate ─── -->
    <v-dialog v-model="toggleOpen" max-width="440" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="stf-dlg-head">
            <span class="asa-tint" :class="toggleTargetIsActive ? 'asa-tint--orange' : 'asa-tint--green'">
              <v-icon size="20">
                {{ toggleTargetIsActive ? 'mdi-account-cancel-outline' : 'mdi-account-check-outline' }}
              </v-icon>
            </span>
            <div class="stf-dlg-head__copy">
              <h2 class="asa-dialog__title">
                {{ toggleTargetIsActive ? t('staff.deactivate') : t('staff.activate') }}
              </h2>
              <span class="asa-dialog__sub">{{ toggleTarget?.fullName }}</span>
            </div>
          </div>
          <button class="pf-x" type="button" :aria-label="t('common.close')" @click="toggleOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="stf-confirm-text">{{ t('staff.confirmToggle', { action: toggleActionLabel }) }}</p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button
            class="asa-btn asa-btn--ghost asa-btn--sm"
            :disabled="busy"
            @click="toggleOpen = false"
          >
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button
            class="asa-btn asa-btn--sm"
            :class="toggleTargetIsActive ? 'asa-btn--rose' : 'asa-btn--primary'"
            :disabled="busy"
            @click="confirmToggle"
          >
            <span>{{ toggleTargetIsActive ? t('staff.deactivate') : t('staff.activate') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Confirm delete ─── -->
    <v-dialog v-model="deleteOpen" max-width="440" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="stf-dlg-head">
            <span class="asa-tint asa-tint--rose">
              <TrashBin class="w-4! h-4! stroke-current" />
            </span>
            <div class="stf-dlg-head__copy">
              <h2 class="asa-dialog__title">{{ t('staff.deleteTitle') }}</h2>
              <span class="asa-dialog__sub">{{ deleteTarget?.fullName }}</span>
            </div>
          </div>
          <button class="pf-x" type="button" :aria-label="t('common.close')" @click="deleteOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="stf-confirm-text">{{ t('staff.confirmDelete', { name: deleteTarget?.fullName || '' }) }}</p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button
            class="asa-btn asa-btn--ghost asa-btn--sm"
            :disabled="busy"
            @click="deleteOpen = false"
          >
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="busy" @click="confirmDelete">
            <v-icon size="15">mdi-trash-can-outline</v-icon>
            <span>{{ t('staff.delete') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <StaffFormDialog v-model="formOpen" :staff="formTarget" :edit-mode="editMode" @saved="fetchStaff" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment-jalaali'
import Plus from '~/components/icons/Plus.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import UserX from '~/components/icons/UserX.vue'
import Activity from '~/components/icons/Activity.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Eye from '~/components/icons/Eye.vue'
import Pencil from '~/components/icons/Pencil.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import Profile from '~/components/icons/Profile.vue'
import Clock from '~/components/icons/Clock.vue'
import StaffFormDialog from '~/components/staff/StaffFormDialog.vue'

interface StaffMember {
  id: string
  fullName: string
  phone: string
  role: string
  status: string | null
  createdAt: string | null
  profileId: string | null
  position: string | null
  employmentDate: string | null
  isActive: boolean | null
}

interface StaffDetail extends StaffMember {
  updatedAt?: string | null
  weeklySchedule?: Record<string, { start: string; end: string }> | null
  notes?: string | null
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

type SortKey = 'fullName' | 'position' | 'employmentDate' | 'isActive'
type StatusFilter = 'all' | 'active' | 'inactive'

const { t, locale } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { todayJalali } = useFormatting()
const router = useRouter()
useAuth()

const staffList = ref<StaffMember[]>([])
const loading = ref(true)
const error = ref(false)
const presentToday = ref(0)

const query = ref('')
const status = ref<StatusFilter>('all')
const position = ref<string | null>(null)
const sortKey = ref<SortKey>('fullName')
const sortDir = ref<'asc' | 'desc'>('asc')

const formOpen = ref(false)
const formTarget = ref<StaffMember | null>(null)
const editMode = ref(false)

const detailsOpen = ref(false)
const detailsLoading = ref(false)
const details = ref<StaffDetail | null>(null)

const toggleOpen = ref(false)
const toggleTarget = ref<StaffMember | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<StaffMember | null>(null)
const busy = ref(false)

/* ── Derived ───────────────────────────────────────────────────── */

const isActive = (member: StaffMember | null | undefined): boolean => member?.isActive !== false

const activeCount = computed(() => staffList.value.filter(isActive).length)
const inactiveCount = computed(() => staffList.value.length - activeCount.value)

const statusSegments = computed(() => [
  { value: 'all' as StatusFilter, label: t('staff.filterAll'), count: staffList.value.length },
  { value: 'active' as StatusFilter, label: t('staff.activeStaff'), count: activeCount.value },
  { value: 'inactive' as StatusFilter, label: t('staff.inactiveStaff'), count: inactiveCount.value },
])

const heroStats = computed(() => [
  { key: 'total', value: staffList.value.length, label: t('staff.totalStaff'), icon: UsersGroup },
  { key: 'active', value: activeCount.value, label: t('staff.activeStaff'), icon: Activity },
  { key: 'inactive', value: inactiveCount.value, label: t('staff.inactiveStaff'), icon: UserX },
  { key: 'today', value: presentToday.value, label: t('staff.todayPresent'), icon: Clock },
])

/** Distinct positions actually in use, so the filter never offers dead options. */
const positionOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const member of staffList.value) {
    const label = member.position?.trim()
    if (label && !seen.has(label)) seen.set(label, label)
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b))
})

const filteredStaff = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return staffList.value.filter((member) => {
    if (status.value === 'active' && !isActive(member)) return false
    if (status.value === 'inactive' && isActive(member)) return false
    if (position.value && member.position !== position.value) return false
    if (needle) {
      const haystack = `${member.fullName || ''} ${member.phone || ''} ${member.position || ''}`
      if (!haystack.toLowerCase().includes(needle)) return false
    }
    return true
  })
})

const visibleStaff = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredStaff.value].sort((a, b) => {
    let result: number
    if (sortKey.value === 'isActive') {
      // Ascending reads as "active first", which is the useful default.
      result = Number(isActive(b)) - Number(isActive(a))
    } else if (sortKey.value === 'employmentDate') {
      const ta = a.employmentDate ? moment(a.employmentDate).valueOf() : 0
      const tb = b.employmentDate ? moment(b.employmentDate).valueOf() : 0
      result = ta - tb
    } else {
      const va = (a[sortKey.value] || '').toString()
      const vb = (b[sortKey.value] || '').toString()
      result = va.localeCompare(vb, locale.value)
    }
    return result === 0 ? a.fullName.localeCompare(b.fullName, locale.value) : result * dir
  })
})

const toggleTargetIsActive = computed(() => isActive(toggleTarget.value))
const toggleActionLabel = computed(() =>
  toggleTargetIsActive.value ? t('staff.deactivate') : t('staff.activate'))

/* ── Formatting ────────────────────────────────────────────────── */

// `pn` (not toPersianNum) so English keeps Latin digits.
const todayLabel = computed(() => {
  const now = moment()
  return locale.value === 'fa'
    ? pn(now.format('dddd jDD jMMMM jYYYY'))
    : now.format('dddd, D MMMM YYYY')
})

function formatHireDate(date: string | null | undefined): string {
  if (!date) return '---'
  const m = moment(date)
  if (!m.isValid()) return '---'
  return locale.value === 'fa'
    ? pn(m.format('jDD jMM jYYYY'))
    : m.format('YYYY/MM/DD')
}

function formatFullDate(date: string | null | undefined): string {
  if (!date) return '---'
  const m = moment(date)
  if (!m.isValid()) return '---'
  return locale.value === 'fa'
    ? pn(m.format('jDD jMMMM jYYYY'))
    : m.format('D MMMM YYYY')
}

function formatTenure(date: string | null | undefined): string {
  if (!date) return '---'
  const start = moment(date)
  if (!start.isValid()) return '---'
  const months = Math.max(0, moment().diff(start, 'month'))
  if (months < 1) return t('staff.tenureThisMonth')
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (!rest) return t('staff.tenureYears', { count: years })
  if (!years) return t('staff.tenureMonths', { count: rest })
  return t('staff.tenureYearsMonths', { years, months: rest })
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

function formatWeeklyHours(
  schedule: Record<string, { start: string; end: string }> | null | undefined,
): string {
  if (!schedule) return '---'
  const entries = Object.entries(schedule).filter(([, v]) => v?.start && v?.end)
  if (!entries.length) return t('staff.noSchedule')
  return entries
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([day, v]) => {
      const label = t(`staff.days.${DAY_KEYS[Number(day)] ?? 'sun'}`, DAY_KEYS[Number(day)] ?? day)
      return `${label}: ${v.start}–${v.end}`
    })
    .join('  ·  ')
}

function accountPillClass(statusValue: string | null | undefined): string {
  if (statusValue === 'approved') return 'asa-pill--green'
  if (statusValue === 'pending') return 'asa-pill--amber'
  return 'pf-pill--neutral'
}

function initials(member: StaffMember): string {
  const parts = (member.fullName || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].charAt(0)
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
}

/* ── Sorting ───────────────────────────────────────────────────── */

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    // Dates and names read best ascending; status reads best active-first.
    sortDir.value = 'asc'
  }
}

function sortIcon(key: SortKey): string {
  if (sortKey.value !== key) return 'mdi-unfold-more-horizontal'
  return sortDir.value === 'asc' ? 'mdi-chevron-up' : 'mdi-chevron-down'
}

function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function resetFilters() {
  query.value = ''
  status.value = 'all'
  position.value = null
}

/* ── Data ──────────────────────────────────────────────────────── */

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const data = (err as { data?: { error?: string; message?: string } }).data
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  return fallback
}

async function fetchStaff() {
  loading.value = true
  error.value = false
  try {
    const res = await apiFetch<ApiEnvelope<StaffMember[]>>('/api/staff')
    staffList.value = res.success && Array.isArray(res.data) ? res.data : []
    // Keep a stale filter from hiding the whole roster.
    if (position.value && !positionOptions.value.includes(position.value)) position.value = null
  } catch {
    staffList.value = []
    error.value = true
    $toast.error(t('staff.fetchError'))
  } finally {
    loading.value = false
  }
}

async function fetchPresentToday() {
  try {
    // Attendance rows are keyed by Jalali dates, so this must not be Gregorian.
    const today = todayJalali()
    const res = await apiFetch<ApiEnvelope<{ records?: { staffId: string; status: string }[] }>>(
      `/api/staff/attendance/report?startDate=${today}&endDate=${today}`,
    )
    const records = res.success ? res.data?.records : undefined
    presentToday.value = Array.isArray(records)
      ? records.filter(r => r.status === 'present' || r.status === 'late').length
      : 0
  } catch {
    presentToday.value = 0
  }
}

async function refreshAll() {
  await Promise.all([fetchStaff(), fetchPresentToday()])
}

/* ── Actions ───────────────────────────────────────────────────── */

function openCreate() {
  formTarget.value = null
  editMode.value = false
  formOpen.value = true
}

function openEdit(member: StaffMember) {
  formTarget.value = member
  editMode.value = true
  formOpen.value = true
}

async function openDetails(member: StaffMember) {
  detailsOpen.value = true
  detailsLoading.value = true
  details.value = { ...member }
  try {
    const res = await apiFetch<ApiEnvelope<StaffDetail>>(`/api/staff/${member.id}`)
    if (res.success && res.data) details.value = res.data
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('staff.fetchError')))
  } finally {
    detailsLoading.value = false
  }
}

function editFromDetails() {
  if (!details.value) return
  const target: StaffMember = {
    id: details.value.id,
    fullName: details.value.fullName,
    phone: details.value.phone,
    role: details.value.role,
    status: details.value.status,
    createdAt: details.value.createdAt,
    profileId: details.value.profileId,
    position: details.value.position,
    employmentDate: details.value.employmentDate,
    isActive: details.value.isActive,
  }
  detailsOpen.value = false
  openEdit(target)
}

function goToProfile() {
  if (!details.value) return
  detailsOpen.value = false
  router.push(`/staff/${details.value.id}`)
}

function askToggle(member: StaffMember) {
  toggleTarget.value = member
  toggleOpen.value = true
}

async function confirmToggle() {
  const target = toggleTarget.value
  if (!target) return
  busy.value = true
  const action = isActive(target) ? 'deactivate' : 'activate'
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/staff/${target.id}/${action}`, {
      method: 'POST',
    })
    if (res.success) {
      // Optimistic: reflect the new state immediately, then reconcile.
      const row = staffList.value.find(s => s.id === target.id)
      if (row) row.isActive = !isActive(target)
      $toast.success(
        toggleTargetIsActive.value ? t('staff.deactivatedSuccess') : t('staff.activatedSuccess'),
      )
      toggleOpen.value = false
      void refreshAll()
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('staff.statusChangeError')))
  } finally {
    busy.value = false
  }
}

function askDelete(member: StaffMember) {
  deleteTarget.value = member
  deleteOpen.value = true
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target) return
  busy.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/staff/${target.id}`, { method: 'DELETE' })
    if (res.success) {
      staffList.value = staffList.value.filter(s => s.id !== target.id)
      if (detailsOpen.value && details.value?.id === target.id) detailsOpen.value = false
      $toast.success(t('staff.deleteSuccess'))
      deleteOpen.value = false
      void refreshAll()
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('staff.deleteError')))
  } finally {
    busy.value = false
  }
}

onMounted(refreshAll)

useSeoMeta({ title: t('staff.titleSeo') })
</script>

<style scoped>
/* ── Avatar ───────────────────────────────────────────────────── */
.stf-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  user-select: none;
}

.stf-avatar--on {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .stf-avatar--on {
  color: var(--asa-accent);
}

.stf-avatar--off {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-3);
}

.stf-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

/* ── Table cell (name + position) ─────────────────────────────── */
.stf-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stf-cell__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stf-cell__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.stf-cell__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.stf-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

.stf-tel {
  color: inherit;
  text-decoration: none;
  transition: color 150ms var(--ease-default);
}

.stf-tel:hover {
  color: var(--asa-accent-deep);
  text-decoration: underline;
}

.dark .stf-tel:hover {
  color: var(--asa-accent);
}

/* Desktop table / mobile roster are mutually exclusive. */
.stf-roster {
  display: none;
}

@media (max-width: 899px) {
  .stf-table-wrap {
    display: none;
  }

  .stf-roster {
    display: flex;
  }
}

/* ── Position filter sizing ────────────────────────────────────── */
.stf-select {
  flex: 0 1 13rem;
  min-width: 9rem;
  max-width: 13rem;
}

.stf-select :deep(.v-field) {
  border-radius: 0.75rem;
  font-size: 0.8125rem;
}

@media (max-width: 640px) {
  .stf-select {
    flex: 1 1 100%;
    max-width: none;
  }
}

/* ── Dialog internals ──────────────────────────────────────────── */
.stf-dlg-head {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.stf-dlg-head__copy {
  min-width: 0;
}

.stf-confirm-text {
  font-size: 0.875rem;
  line-height: 1.75;
  color: var(--asa-label-2);
}

.stf-foot-note {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}
</style>
