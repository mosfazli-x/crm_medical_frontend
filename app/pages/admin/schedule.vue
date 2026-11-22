<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('adminSchedule.title') }}</h1>
        <p class="dash-head__date">{{ t('adminSchedule.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="doctorsLoading || scheduleLoading" :aria-label="t('common.refresh')"
          @click="refreshAll">
          <v-icon size="16" :class="{ 'ad-spin': doctorsLoading || scheduleLoading }">mdi-refresh</v-icon>
        </button>
        <a v-if="selectedDoctor" class="asa-btn asa-btn--primary" :href="`/booking/${selectedDoctor.id}`" target="_blank"
          rel="noopener">
          <v-icon size="15">mdi-open-in-new</v-icon>
          <span class="hidden sm:inline!">{{ t('scheduling.viewBookingPage') }}</span>
        </a>
      </div>
    </header>

    <div v-if="!doctorsLoaded" class="asa-skel ad-docbar-skel" />

    <section v-else-if="doctorsError" class="asa-card ad-card ad-card--pad ad-mt">
      <div class="ad-empty ad-empty--column">
        <div class="asa-tint asa-tint--rose">
          <v-icon size="24">mdi-cloud-alert-outline</v-icon>
        </div>
        <div class="ad-empty__copy">
          <p class="ad-empty__title">{{ t('adminSchedule.fetchDoctorsError') }}</p>
          <p class="ad-empty__desc">{{ t('adminSettings.fetchErrorDesc') }}</p>
        </div>
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="refreshAll">
          <v-icon size="14">mdi-refresh</v-icon>
          <span>{{ t('common.retry') }}</span>
        </button>
      </div>
    </section>

    <section v-else-if="doctors.length === 0" class="asa-card ad-card ad-card--pad ad-mt">
      <div class="ad-empty ad-empty--column">
        <div class="asa-tint asa-tint--amber">
          <v-icon size="24">mdi-account-off-outline</v-icon>
        </div>
        <div class="ad-empty__copy">
          <p class="ad-empty__title">{{ t('adminSchedule.noBookableDoctors') }}</p>
          <p class="ad-empty__desc">{{ t('adminSchedule.noBookableDoctorsDesc') }}</p>
        </div>
        <NuxtLink to="/staff" class="asa-btn asa-btn--ghost asa-btn--sm">
          <v-icon size="14">mdi-account-group-outline</v-icon>
          <span>{{ t('adminSchedule.openStaff') }}</span>
        </NuxtLink>
      </div>
    </section>

    <template v-else>
      <section class="asa-card ad-docbar" aria-labelledby="ad-doctor-label">
        <div class="ad-docbar__field">
          <span id="ad-doctor-label" class="asa-field-label ad-docbar__label">{{ t('adminSchedule.selectDoctor') }}</span>
          <div ref="pickerRoot" class="ad-combo" :class="{ 'ad-combo--open': pickerOpen }">
            <button type="button" class="ad-combo__trigger" aria-haspopup="listbox" :aria-expanded="pickerOpen"
              @click="togglePicker">
              <span class="ad-avatar" :class="{ 'ad-avatar--empty': !selectedDoctor }" aria-hidden="true">
                <template v-if="selectedDoctor">{{ initials(selectedDoctor.fullName) }}</template>
                <v-icon v-else size="18">mdi-account-search-outline</v-icon>
              </span>
              <span class="ad-combo__copy">
                <template v-if="selectedDoctor">
                  <span class="ad-combo__name">{{ selectedDoctor.fullName }}</span>
                  <span class="ad-combo__meta" dir="ltr">{{ selectedDoctor.phone || '—' }}</span>
                </template>
                <span v-else class="ad-combo__placeholder">{{ t('adminSchedule.searchPlaceholder') }}</span>
              </span>
              <span v-if="selectedDoctor" class="asa-pill ad-combo__role" :class="rolePillClass(selectedDoctor.role)">
                {{ roleLabel(selectedDoctor.role) }}
              </span>
              <v-icon size="18" class="ad-combo__chev">mdi-chevron-down</v-icon>
            </button>

            <transition name="ad-pop">
              <div v-if="pickerOpen" class="ad-combo__panel" role="dialog" :aria-label="t('adminSchedule.selectDoctor')">
                <div class="ad-combo__search">
                  <v-icon size="16" class="ad-combo__search-ic">mdi-magnify</v-icon>
                  <input ref="searchInput" v-model="doctorQuery" type="text" class="ad-combo__input"
                    :placeholder="t('common.search')" autocomplete="off" @keydown.down.prevent="moveActive(1)"
                    @keydown.up.prevent="moveActive(-1)" @keydown.enter.prevent="pickActive"
                    @keydown.esc.prevent="closePicker" />
                  <button v-if="doctorQuery" type="button" class="ad-combo__clear" :aria-label="t('common.clear')"
                    @click="doctorQuery = ''">
                    <v-icon size="14">mdi-close</v-icon>
                  </button>
                </div>

                <ul class="ad-combo__list" role="listbox">
                  <li v-for="(doc, index) in filteredDoctors" :key="doc.id">
                    <button type="button" class="ad-option"
                      :class="{ 'ad-option--active': index === activeIndex, 'ad-option--selected': selectedDoctor?.id === doc.id }"
                      role="option" :aria-selected="selectedDoctor?.id === doc.id" @click="selectDoctor(doc)"
                      @mouseenter="activeIndex = index">
                      <span class="ad-avatar ad-avatar--sm" aria-hidden="true">{{ initials(doc.fullName) }}</span>
                      <span class="ad-option__copy">
                        <span class="ad-option__name">{{ doc.fullName }}</span>
                        <span class="ad-option__meta" dir="ltr">{{ doc.phone || '—' }}</span>
                      </span>
                      <span class="asa-pill" :class="rolePillClass(doc.role)">{{ roleLabel(doc.role) }}</span>
                      <v-icon v-if="selectedDoctor?.id === doc.id" size="16" class="ad-option__check">mdi-check</v-icon>
                    </button>
                  </li>
                  <li v-if="filteredDoctors.length === 0" class="ad-combo__empty">
                    <v-icon size="18">mdi-account-off-outline</v-icon>
                    <span>{{ t('adminSchedule.noSearchResults') }}</span>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>

        <div v-if="selectedDoctor" class="ad-docbar__aside">
          <div class="ad-docbar__stat">
            <span class="ad-docbar__stat-val">{{ pn(activeDays) }}</span>
            <span class="ad-docbar__stat-lbl">{{ t('scheduling.metricDays') }}</span>
          </div>
          <span class="ad-docbar__sep" aria-hidden="true" />
          <div class="ad-docbar__stat">
            <span class="ad-docbar__stat-val">{{ weeklyHoursLabel }}</span>
            <span class="ad-docbar__stat-lbl">{{ t('scheduling.metricHours') }}</span>
          </div>
        </div>
      </section>

      <template v-if="selectedDoctor">
        <div v-if="!scheduleLoaded" class="ad-mt grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
          <div v-for="i in 3" :key="`metric-skel-${i}`" class="asa-skel h-28! rounded-[22px]!" />
        </div>
        <div v-else class="ad-mt grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
          <div class="asa-card ad-metric">
            <div class="asa-tint asa-tint--teal">
              <v-icon size="20">mdi-calendar-check-outline</v-icon>
            </div>
            <div class="ad-metric__copy">
              <p class="ad-metric__value">{{ pn(activeDays) }}</p>
              <p class="ad-metric__label">{{ t('scheduling.metricDays') }}</p>
            </div>
          </div>
          <div class="asa-card ad-metric">
            <div class="asa-tint asa-tint--indigo">
              <v-icon size="20">mdi-clock-outline</v-icon>
            </div>
            <div class="ad-metric__copy">
              <p class="ad-metric__value">{{ pn(availability.length) }}</p>
              <p class="ad-metric__label">{{ t('scheduling.metricRanges') }}</p>
            </div>
          </div>
          <div class="asa-card ad-metric">
            <div class="asa-tint asa-tint--orange">
              <v-icon size="20">mdi-chart-timeline-variant</v-icon>
            </div>
            <div class="ad-metric__copy">
              <p class="ad-metric__value">{{ weeklyHoursLabel }}</p>
              <p class="ad-metric__label">{{ t('scheduling.metricHours') }}</p>
            </div>
          </div>
        </div>

        <section class="asa-card ad-card ad-mt">
          <div class="ad-card__head">
            <div class="ad-card__head-copy">
              <h2 class="asa-card-title">{{ t('scheduling.gridTitle') }}</h2>
              <p class="asa-card-sub">{{ t('scheduling.workingHours') }}</p>
            </div>
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openAdd()">
              <v-icon size="14">mdi-plus</v-icon>
              <span>{{ t('scheduling.addNewRange') }}</span>
            </button>
          </div>

          <div v-if="!scheduleLoaded" class="ad-skeleton">
            <div v-for="i in 8" :key="`skel-${i}`" class="ad-skeleton__row">
              <div class="asa-skel h-5! w-16! rounded-md!" />
              <div class="asa-skel h-5! flex-1! rounded-md!" />
            </div>
          </div>

          <template v-else>
            <div v-if="availability.length === 0" class="ad-note">
              <v-icon size="16">mdi-information-outline</v-icon>
              <span>{{ t('adminSchedule.noHoursHint') }}</span>
            </div>

            <div class="ad-scroll">
              <table class="ad-table">
                <thead>
                  <tr>
                    <th class="ad-th ad-th--corner">
                      <span>{{ t('scheduling.hour') }}</span>
                    </th>
                    <th v-for="day in dayHeaders" :key="day.dayOfWeek" class="ad-th"
                      :class="{ 'ad-th--today': day.dayOfWeek === todayDow }">
                      <div class="ad-th__main">
                        <span class="ad-th__name">{{ day.name }}</span>
                        <button type="button" class="ad-th__add" :aria-label="t('scheduling.addNewRange')"
                          @click="openAdd(day.dayOfWeek)">
                          <v-icon size="12">mdi-plus</v-icon>
                        </button>
                      </div>
                      <div class="ad-th__date">{{ day.date }}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="time in timeSlots" :key="time" class="ad-tr">
                    <td class="ad-td ad-td--time">{{ pn(time) }}</td>
                    <td v-for="day in dayHeaders" :key="`${day.dayOfWeek}-${time}`" class="ad-td"
                      :class="cellClass(day.dayOfWeek, time)" :title="cellTitle(day.dayOfWeek, time)"
                      @click="onCellClick(day.dayOfWeek, time)">
                      <span class="ad-cell" aria-hidden="true" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div class="ad-legend">
            <div class="ad-legend__item">
              <span class="ad-dot ad-dot--range" />
              <span>{{ t('scheduling.activeRange') }}</span>
            </div>
            <div class="ad-legend__item">
              <span class="ad-dot ad-dot--selecting" />
              <span>{{ t('scheduling.selecting') }}</span>
            </div>
            <div class="ad-legend__hint">
              <span>{{ selectionHint }}</span>
              <button v-if="selection" type="button" class="ad-link" @click="selection = null">
                {{ t('common.cancel') }}
              </button>
            </div>
          </div>
        </section>

        <section class="asa-card ad-card ad-mt">
          <div class="ad-card__head">
            <div class="ad-card__head-copy">
              <h2 class="asa-card-title">{{ t('adminSchedule.rangesTitle') }}</h2>
              <p class="asa-card-sub">{{ t('adminSchedule.rangesSub') }}</p>
            </div>
          </div>

          <div v-if="!scheduleLoaded" class="ad-skeleton">
            <div v-for="i in 6" :key="`list-skel-${i}`" class="ad-skeleton__row">
              <div class="asa-skel h-7! w-40! rounded-lg!" />
              <div class="asa-skel h-7! w-24! rounded-lg!" />
            </div>
          </div>

          <div v-else class="ad-days">
            <div v-for="day in dayHeaders" :key="`list-${day.dayOfWeek}`" class="ad-day"
              :class="{ 'ad-day--today': day.dayOfWeek === todayDow }">
              <div class="ad-day__head">
                <div class="ad-day__id">
                  <span class="ad-day__name">{{ day.name }}</span>
                  <span class="ad-day__date">{{ day.date }}</span>
                  <span v-if="day.dayOfWeek === todayDow" class="asa-pill asa-pill--green">{{ t('common.today') }}</span>
                </div>
                <div class="ad-day__actions">
                  <span class="ad-day__count">{{ pn(rangesForDay(day.dayOfWeek).length) }}</span>
                  <button type="button" class="pf-icon-btn" :disabled="rangesForDay(day.dayOfWeek).length === 0"
                    :aria-label="t('adminSchedule.copyDay')" @click="openCopy(day.dayOfWeek)">
                    <v-icon size="16">mdi-content-copy</v-icon>
                  </button>
                  <button type="button" class="pf-icon-btn" :aria-label="t('scheduling.addNewRange')"
                    @click="openAdd(day.dayOfWeek)">
                    <v-icon size="16">mdi-plus</v-icon>
                  </button>
                </div>
              </div>

              <div v-if="rangesForDay(day.dayOfWeek).length" class="ad-ranges">
                <div v-for="range in rangesForDay(day.dayOfWeek)" :key="range.id" class="ad-range">
                  <span class="ad-range__time" dir="ltr">
                    {{ pn(range.startTime) }}<span class="ad-range__dash">–</span>{{ pn(range.endTime) }}
                  </span>
                  <span class="ad-range__dur">{{ rangeDuration(range) }}</span>
                  <div class="ad-range__actions">
                    <button type="button" class="pf-icon-btn" :aria-label="t('common.edit')" @click="openEdit(range)">
                      <v-icon size="15">mdi-pencil-outline</v-icon>
                    </button>
                    <button type="button" class="pf-icon-btn pf-icon-btn--danger" :aria-label="t('common.delete')"
                      @click="askDelete(range)">
                      <v-icon size="15">mdi-trash-can-outline</v-icon>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="ad-range-empty">
                <span>{{ t('adminSchedule.noRangesDay') }}</span>
                <button type="button" class="ad-link" @click="openAdd(day.dayOfWeek)">
                  {{ t('scheduling.addNewRange') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>

      <section v-else class="asa-card ad-card ad-card--pad ad-mt">
        <div class="ad-empty ad-empty--column ad-empty--start">
          <div class="asa-tint asa-tint--indigo">
            <v-icon size="24">mdi-account-search-outline</v-icon>
          </div>
          <div class="ad-empty__copy">
            <p class="ad-empty__title">{{ t('adminSchedule.selectDoctorEmpty') }}</p>
            <p class="ad-empty__desc">{{ t('adminSchedule.selectDoctorDesc') }}</p>
          </div>
        </div>

        <div class="ad-picks">
          <button v-for="doc in doctors" :key="doc.id" type="button" class="ad-pick" @click="selectDoctor(doc)">
            <span class="ad-avatar" aria-hidden="true">{{ initials(doc.fullName) }}</span>
            <span class="ad-pick__copy">
              <span class="ad-pick__name">{{ doc.fullName }}</span>
              <span class="ad-pick__meta" dir="ltr">{{ doc.phone || '—' }}</span>
            </span>
            <span class="asa-pill" :class="rolePillClass(doc.role)">{{ roleLabel(doc.role) }}</span>
            <v-icon size="16" class="ad-pick__chev">mdi-arrow-{{ isRtl ? 'left' : 'right' }}</v-icon>
          </button>
        </div>
      </section>
    </template>

    <v-dialog v-model="rangeDialog" max-width="460" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="ad-dialog-copy">
            <h2 class="asa-dialog__title">
              {{ editing ? t('scheduling.editTitle') : t('scheduling.addNewRange') }}
            </h2>
            <span class="asa-dialog__sub">{{ selectedDoctor?.fullName }}</span>
          </div>
          <button type="button" class="ad-x" :aria-label="t('common.close')" @click="closeRange">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="ad-form">
            <label class="ad-field">
              <span class="asa-field-label">{{ t('scheduling.day') }}</span>
              <div class="ad-select">
                <select v-model="form.day" class="ad-select__input">
                  <option v-for="opt in dayOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
                </select>
                <v-icon size="18" class="ad-select__ic">mdi-chevron-down</v-icon>
              </div>
            </label>

            <div class="ad-form__row">
              <label class="ad-field">
                <span class="asa-field-label">{{ t('scheduling.startTime') }}</span>
                <div class="ad-select">
                  <select v-model="form.start" class="ad-select__input" dir="ltr">
                    <option value="">{{ t('adminSchedule.chooseTime') }}</option>
                    <option v-for="opt in timeSlots" :key="`s-${opt}`" :value="opt">{{ pn(opt) }}</option>
                  </select>
                  <v-icon size="18" class="ad-select__ic">mdi-chevron-down</v-icon>
                </div>
              </label>
              <label class="ad-field">
                <span class="asa-field-label">{{ t('scheduling.endTime') }}</span>
                <div class="ad-select">
                  <select v-model="form.end" class="ad-select__input" dir="ltr">
                    <option value="">{{ t('adminSchedule.chooseTime') }}</option>
                    <option v-for="opt in endOptions" :key="`e-${opt}`" :value="opt">{{ pn(opt) }}</option>
                  </select>
                  <v-icon size="18" class="ad-select__ic">mdi-chevron-down</v-icon>
                </div>
              </label>
            </div>

            <div v-if="form.start && form.end" class="ad-form__summary">
              <v-icon size="16">mdi-clock-outline</v-icon>
              <span dir="ltr">{{ pn(form.start) }} – {{ pn(form.end) }}</span>
              <span v-if="formDuration" class="ad-form__dur">{{ formDuration }}</span>
            </div>

            <p v-if="formError" class="ad-form__error" role="alert">{{ formError }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button v-if="editing" type="button" class="asa-btn asa-btn--rose asa-btn--sm" :disabled="saving"
            @click="deleteFromEdit">
            <v-icon size="14">mdi-trash-can-outline</v-icon>
            <span>{{ t('common.delete') }}</span>
          </button>
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="closeRange">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !canSubmit"
            @click="submitRange">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-check</v-icon>
              <span>{{ t('common.save') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="ad-dialog-copy">
            <h2 class="asa-dialog__title">{{ t('scheduling.deleteTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('scheduling.deleteConfirm') }}</span>
          </div>
          <button type="button" class="ad-x" :aria-label="t('common.close')" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div v-if="deleteTarget" class="ad-delete-target">
            <v-icon size="16">mdi-calendar-remove-outline</v-icon>
            <span class="ad-delete-target__day">{{ dayName(deleteTarget.dayOfWeek) }}</span>
            <span class="ad-delete-target__time" dir="ltr">
              {{ pn(deleteTarget.startTime) }} – {{ pn(deleteTarget.endTime) }}
            </span>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--rose asa-btn--sm" :disabled="saving" @click="confirmDelete">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-trash-can-outline</v-icon>
              <span>{{ t('common.delete') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="copyDialog" max-width="480" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="ad-dialog-copy">
            <h2 class="asa-dialog__title">{{ t('adminSchedule.copyDayTitle') }}</h2>
            <span class="asa-dialog__sub">{{ copySourceName }}</span>
          </div>
          <button type="button" class="ad-x" :aria-label="t('common.close')" @click="copyDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <p class="ad-copy__desc">{{ t('adminSchedule.copyDayDesc', { day: copySourceName }) }}</p>
          <span class="asa-field-label">{{ t('adminSchedule.copyTargets') }}</span>
          <div class="ad-copy__targets">
            <button v-for="day in copyTargetDays" :key="`copy-${day.dayOfWeek}`" type="button" class="ad-check"
              :class="{ 'ad-check--on': copyTargets.includes(day.dayOfWeek) }" role="checkbox"
              :aria-checked="copyTargets.includes(day.dayOfWeek)" @click="toggleTarget(day.dayOfWeek)">
              <span class="ad-check__box" aria-hidden="true">
                <v-icon v-if="copyTargets.includes(day.dayOfWeek)" size="12">mdi-check</v-icon>
              </span>
              <span class="ad-check__label">{{ day.name }}</span>
              <span class="ad-check__meta">{{ pn(rangesForDay(day.dayOfWeek).length) }}</span>
            </button>
          </div>
          <p v-if="copyError" class="ad-form__error" role="alert">{{ copyError }}</p>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="copyDialog = false">
            {{ t('common.cancel') }}
          </button>
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" :disabled="copying"
            @click="runCopy">
            <v-progress-circular v-if="copying" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-content-copy</v-icon>
              <span>{{ t('adminSchedule.copyAction') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'

definePageMeta({})

interface Doctor {
  id: string
  fullName: string
  phone: string
  role: string
}

interface AvailabilityRange {
  id: string
  doctorId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface ApiListResponse<T> {
  success: boolean
  data?: T[]
}

interface ApiItemResponse<T> {
  success: boolean
  data?: T
}

const { t } = useI18n()
const { pn, isRtl } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5]
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const LAST_DOCTOR_KEY = 'admin_schedule_doctor'

const todayDow = new Date().getDay()

const doctors = ref<Doctor[]>([])
const doctorsLoading = ref(false)
const doctorsLoaded = ref(false)
const doctorsError = ref(false)
const selectedDoctor = ref<Doctor | null>(null)

const availability = ref<AvailabilityRange[]>([])
const scheduleLoading = ref(false)
const scheduleLoaded = ref(false)
const saving = ref(false)
const copying = ref(false)

const pickerOpen = ref(false)
const doctorQuery = ref('')
const activeIndex = ref(0)
const pickerRoot = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const selection = ref<{ day: number; time: string } | null>(null)

const rangeDialog = ref(false)
const editing = ref<AvailabilityRange | null>(null)
const form = reactive({ day: todayDow, start: '', end: '' })

const deleteDialog = ref(false)
const deleteTarget = ref<AvailabilityRange | null>(null)

const copyDialog = ref(false)
const copySourceDay = ref<number | null>(null)
const copyTargets = ref<number[]>([])

let fetchToken = 0
let selectionRestored = false

const timeSlots = computed(() => {
  const slots: string[] = []
  for (let h = 7; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

const allTimeOptions = computed(() => {
  const slots: string[] = []
  for (let h = 7; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

const endOptions = computed(() => allTimeOptions.value.filter(value => !form.start || value > form.start))

const dayOptions = computed(() =>
  DAY_ORDER.map(dayOfWeek => ({ value: dayOfWeek, title: dayName(dayOfWeek) }))
)

const dayHeaders = computed(() => {
  const today = new Date()
  const daysSinceSaturday = (today.getDay() + 1) % 7
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - daysSinceSaturday)
  return DAY_ORDER.map((dayOfWeek, index) => {
    const date = new Date(saturday)
    date.setDate(saturday.getDate() + index)
    return {
      dayOfWeek,
      name: dayName(dayOfWeek),
      date: pn(moment(date).format('jD jMMMM')),
    }
  })
})

const filteredDoctors = computed(() => {
  const query = normalize(doctorQuery.value)
  if (!query) return doctors.value
  return doctors.value.filter(doc => normalize(doc.fullName).includes(query) || normalize(doc.phone || '').includes(query))
})

const activeDays = computed(() => new Set(availability.value.map(range => range.dayOfWeek)).size)

const weeklyMinutes = computed(() =>
  availability.value.reduce((total, range) => total + timeToMinutes(range.endTime) - timeToMinutes(range.startTime), 0)
)

const weeklyHoursLabel = computed(() => {
  const hours = Math.floor(weeklyMinutes.value / 60)
  const minutes = weeklyMinutes.value % 60
  return pn(`${hours}:${String(minutes).padStart(2, '0')}`)
})

const canSubmit = computed(() => {
  if (!form.start || !form.end) return false
  if (form.start >= form.end) return false
  return !findConflict(form.day, form.start, form.end, editing.value?.id)
})

const formError = computed(() => {
  if (!form.start || !form.end) return ''
  if (form.start >= form.end) return t('scheduling.timeOrderError')
  if (findConflict(form.day, form.start, form.end, editing.value?.id)) return t('adminSchedule.overlapError')
  return ''
})

const formDuration = computed(() => {
  if (!form.start || !form.end || form.start >= form.end) return ''
  return durationLabel(form.start, form.end)
})

const selectionHint = computed(() => {
  if (!selection.value) return t('scheduling.clickInstruction')
  return `${t('scheduling.selecting')} — ${dayName(selection.value.day)} ${pn(selection.value.time)}`
})

const copySourceName = computed(() => (copySourceDay.value === null ? '' : dayName(copySourceDay.value)))

const copyTargetDays = computed(() => dayHeaders.value.filter(day => day.dayOfWeek !== copySourceDay.value))

const copyError = ref('')

watch(selectedDoctor, doc => {
  selection.value = null
  availability.value = []
  scheduleLoaded.value = false
  if (doc) void fetchAvailability()
})

watch(doctorQuery, () => {
  activeIndex.value = 0
})

watch(filteredDoctors, list => {
  if (activeIndex.value >= list.length) activeIndex.value = Math.max(0, list.length - 1)
})

watch(() => form.start, value => {
  if (form.end && value && form.end <= value) form.end = ''
})

onMounted(() => {
  void fetchDoctors()
  document.addEventListener('mousedown', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
})

function onDocumentClick(event: MouseEvent) {
  if (!pickerOpen.value) return
  const target = event.target as Node | null
  if (target && pickerRoot.value?.contains(target)) return
  closePicker()
}

function dayName(dayOfWeek: number) {
  return t(`scheduling.days.${DAY_KEYS[dayOfWeek]}`)
}

function roleLabel(role: string) {
  if (role === 'admin_doctor' || role === 'doctor') return t(`users.roles.${role}`)
  return role
}

function rolePillClass(role: string) {
  return role === 'admin_doctor' ? 'asa-pill--indigo' : 'asa-pill--teal'
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
}

function normalize(value: string) {
  return value
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

function durationLabel(start: string, end: string) {
  const minutes = Math.max(0, timeToMinutes(end) - timeToMinutes(start))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours && rest) return t('adminSchedule.durationHM', { h: pn(hours), m: pn(rest) })
  if (hours) return t('adminSchedule.durationH', { h: pn(hours) })
  return t('adminSchedule.durationM', { m: pn(rest) })
}

function rangeDuration(range: AvailabilityRange) {
  return durationLabel(range.startTime, range.endTime)
}

function rangesForDay(dayOfWeek: number) {
  return availability.value
    .filter(range => range.dayOfWeek === dayOfWeek)
    .sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0))
}

function findConflict(dayOfWeek: number, start: string, end: string, ignoreId?: string) {
  return availability.value.find(
    range =>
      range.dayOfWeek === dayOfWeek &&
      range.id !== ignoreId &&
      start < range.endTime &&
      range.startTime < end
  )
}

function rangeAt(dayOfWeek: number, time: string) {
  return (
    availability.value.find(
      range => range.dayOfWeek === dayOfWeek && range.startTime <= time && time < range.endTime
    ) || null
  )
}

function cellClass(dayOfWeek: number, time: string) {
  const isAnchor = selection.value?.day === dayOfWeek && selection.value?.time === time
  const isSelectingDay = selection.value?.day === dayOfWeek
  return {
    'ad-td--range': Boolean(rangeAt(dayOfWeek, time)),
    'ad-td--anchor': isAnchor,
    'ad-td--selday': isSelectingDay && !isAnchor,
  }
}

function cellTitle(dayOfWeek: number, time: string) {
  const range = rangeAt(dayOfWeek, time)
  return range ? `${range.startTime} – ${range.endTime}` : ''
}

function togglePicker() {
  if (pickerOpen.value) {
    closePicker()
    return
  }
  pickerOpen.value = true
  doctorQuery.value = ''
  const index = doctors.value.findIndex(doc => doc.id === selectedDoctor.value?.id)
  activeIndex.value = index >= 0 ? index : 0
  nextTick(() => searchInput.value?.focus())
}

function closePicker() {
  pickerOpen.value = false
  doctorQuery.value = ''
}

function moveActive(delta: number) {
  const total = filteredDoctors.value.length
  if (!total) return
  activeIndex.value = (activeIndex.value + delta + total) % total
}

function pickActive() {
  const doc = filteredDoctors.value[activeIndex.value]
  if (doc) selectDoctor(doc)
}

function selectDoctor(doc: Doctor) {
  closePicker()
  if (selectedDoctor.value?.id === doc.id) return
  selectedDoctor.value = doc
  if (process.client) localStorage.setItem(LAST_DOCTOR_KEY, doc.id)
  void router.replace({ query: { ...route.query, doctor: doc.id } })
}

function restoreSelection() {
  if (selectionRestored) return
  selectionRestored = true
  if (!doctors.value.length) return
  const queryDoctor = typeof route.query.doctor === 'string' ? route.query.doctor : ''
  const storedDoctor = process.client ? localStorage.getItem(LAST_DOCTOR_KEY) || '' : ''
  const match = doctors.value.find(doc => doc.id === queryDoctor) || doctors.value.find(doc => doc.id === storedDoctor)
  if (match) {
    selectDoctor(match)
  } else if (doctors.value.length === 1) {
    selectDoctor(doctors.value[0]!)
  }
}

async function fetchDoctors() {
  doctorsLoading.value = true
  doctorsError.value = false
  try {
    const response = await apiFetch<ApiListResponse<Doctor>>('/api/scheduling/admin/doctors')
    doctors.value = response?.success ? response.data || [] : []
    if (selectedDoctor.value) {
      const stillThere = doctors.value.find(doc => doc.id === selectedDoctor.value?.id)
      if (stillThere) selectedDoctor.value = stillThere
      else selectedDoctor.value = null
    }
    if (!selectedDoctor.value) restoreSelection()
  } catch (error) {
    console.error(error)
    doctors.value = []
    doctorsError.value = true
    $toast.error(t('adminSchedule.fetchDoctorsError'))
  } finally {
    doctorsLoading.value = false
    doctorsLoaded.value = true
  }
}

async function fetchAvailability() {
  const doctor = selectedDoctor.value
  if (!doctor) {
    availability.value = []
    return
  }
  const token = ++fetchToken
  scheduleLoading.value = true
  try {
    const response = await apiFetch<ApiListResponse<AvailabilityRange>>(
      `/api/scheduling/availability/${doctor.id}`
    )
    if (token !== fetchToken) return
    availability.value = response?.success ? response.data || [] : []
  } catch (error) {
    if (token !== fetchToken) return
    console.error(error)
    availability.value = []
    $toast.error(t('adminSchedule.fetchScheduleError'))
  } finally {
    if (token === fetchToken) {
      scheduleLoading.value = false
      scheduleLoaded.value = true
    }
  }
}

function refreshAll() {
  if (selectedDoctor.value) void fetchAvailability()
  void fetchDoctors()
}

function onCellClick(dayOfWeek: number, time: string) {
  const existing = rangeAt(dayOfWeek, time)
  if (existing) {
    openEdit(existing)
    return
  }

  if (!selection.value || selection.value.day !== dayOfWeek) {
    selection.value = { day: dayOfWeek, time }
    return
  }

  if (selection.value.time === time) {
    selection.value = null
    return
  }

  const start = selection.value.time < time ? selection.value.time : time
  const end = selection.value.time < time ? time : selection.value.time
  selection.value = null
  openAdd(dayOfWeek, start, end)
}

function openAdd(dayOfWeek = todayDow, start = '', end = '') {
  editing.value = null
  form.day = dayOfWeek
  form.start = start
  form.end = end
  rangeDialog.value = true
}

function openEdit(range: AvailabilityRange) {
  editing.value = range
  form.day = range.dayOfWeek
  form.start = range.startTime
  form.end = range.endTime
  rangeDialog.value = true
}

function closeRange() {
  rangeDialog.value = false
  editing.value = null
  form.start = ''
  form.end = ''
}

async function submitRange() {
  if (!canSubmit.value || !selectedDoctor.value) {
    if (formError.value) $toast.error(formError.value)
    return
  }
  saving.value = true
  try {
    if (editing.value) {
      const response = await apiFetch<ApiItemResponse<AvailabilityRange>>(
        `/api/scheduling/availability/${editing.value.id}`,
        {
          method: 'PUT',
          body: { dayOfWeek: form.day, startTime: form.start, endTime: form.end },
        }
      )
      if (response?.success && response.data) {
        const index = availability.value.findIndex(range => range.id === editing.value?.id)
        if (index >= 0) availability.value[index] = response.data
      }
      $toast.success(t('scheduling.rangeUpdated'))
    } else {
      const response = await apiFetch<ApiItemResponse<AvailabilityRange>>('/api/scheduling/admin/availability', {
        method: 'POST',
        body: {
          doctorId: selectedDoctor.value.id,
          dayOfWeek: form.day,
          startTime: form.start,
          endTime: form.end,
        },
      })
      if (response?.success && response.data) availability.value.push(response.data)
      $toast.success(t('scheduling.rangeAdded'))
    }
    closeRange()
    await fetchAvailability()
  } catch (error) {
    console.error(error)
    $toast.error(editing.value ? t('scheduling.rangeUpdateError') : t('scheduling.rangeSaveError'))
  } finally {
    saving.value = false
  }
}

function deleteFromEdit() {
  if (!editing.value) return
  deleteTarget.value = editing.value
  rangeDialog.value = false
  editing.value = null
  deleteDialog.value = true
}

function askDelete(range: AvailabilityRange) {
  deleteTarget.value = range
  deleteDialog.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await apiFetch(`/api/scheduling/availability/${deleteTarget.value.id}`, { method: 'DELETE' })
    availability.value = availability.value.filter(range => range.id !== deleteTarget.value?.id)
    deleteTarget.value = null
    deleteDialog.value = false
    $toast.success(t('scheduling.rangeDeleted'))
    await fetchAvailability()
  } catch (error) {
    console.error(error)
    $toast.error(t('scheduling.rangeDeleteError'))
  } finally {
    saving.value = false
  }
}

function openCopy(dayOfWeek: number) {
  if (!rangesForDay(dayOfWeek).length) {
    $toast.info(t('adminSchedule.copyNothing'))
    return
  }
  copySourceDay.value = dayOfWeek
  copyTargets.value = []
  copyError.value = ''
  copyDialog.value = true
}

function toggleTarget(dayOfWeek: number) {
  const index = copyTargets.value.indexOf(dayOfWeek)
  if (index >= 0) copyTargets.value.splice(index, 1)
  else copyTargets.value.push(dayOfWeek)
  copyError.value = ''
}

async function runCopy() {
  if (copySourceDay.value === null) return
  if (!copyTargets.value.length) {
    copyError.value = t('adminSchedule.copyNoTargets')
    return
  }

  const sourceRanges = rangesForDay(copySourceDay.value)
  const doctor = selectedDoctor.value
  if (!doctor || !sourceRanges.length) return

  copying.value = true
  copyError.value = ''
  let created = 0
  let skipped = 0
  let failed = 0

  for (const targetDay of copyTargets.value) {
    for (const range of sourceRanges) {
      const conflict = availability.value.some(
        existing =>
          existing.dayOfWeek === targetDay &&
          range.startTime < existing.endTime &&
          existing.startTime < range.endTime
      )
      if (conflict) {
        skipped++
        continue
      }
      try {
        const response = await apiFetch<ApiItemResponse<AvailabilityRange>>(
          '/api/scheduling/admin/availability',
          {
            method: 'POST',
            body: {
              doctorId: doctor.id,
              dayOfWeek: targetDay,
              startTime: range.startTime,
              endTime: range.endTime,
            },
          }
        )
        if (response?.success && response.data) availability.value.push(response.data)
        created++
      } catch (error) {
        console.error(error)
        failed++
      }
    }
  }

  copying.value = false
  await fetchAvailability()

  if (created) $toast.success(t('adminSchedule.copySuccess'))
  if (skipped) $toast.info(t('adminSchedule.copySkipped'))
  if (failed) $toast.error(t('adminSchedule.copyFailed'))
  copyDialog.value = false
}
</script>

<style scoped>
.ad-mt {
  margin-top: 1.25rem;
}

.ad-spin {
  animation: ad-spin 900ms linear infinite;
}

@keyframes ad-spin {
  to {
    transform: rotate(360deg);
  }
}

.ad-docbar-skel {
  height: 7.25rem;
  border-radius: 1.25rem;
}

.ad-docbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.25rem 1.375rem;
  z-index: 20;
}

.ad-docbar__field {
  flex: 1 1 20rem;
  min-width: 0;
  max-width: 34rem;
}

.ad-docbar__label {
  margin-bottom: 0;
}

.ad-docbar__aside {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 0.35rem;
}

.ad-docbar__stat {
  display: flex;
  flex-direction: column;
}

.ad-docbar__stat-val {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.ad-docbar__stat-lbl {
  margin-top: 0.2rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.ad-docbar__sep {
  width: 1px;
  height: 2rem;
  background: var(--asa-sep);
}

.ad-combo {
  position: relative;
  margin-top: 0.5rem;
}

.ad-combo__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 3.25rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  cursor: pointer;
  text-align: start;
  transition: background-color 150ms var(--ease-default), border-color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.ad-combo__trigger:hover {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.ad-combo__trigger:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.ad-combo--open .ad-combo__trigger {
  border-color: var(--asa-accent);
  background: var(--asa-bg-card);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.ad-avatar {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-size: 0.8125rem;
  font-weight: 700;
}

.dark .ad-avatar {
  color: var(--asa-accent);
}

.ad-avatar--empty {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-3);
}

.ad-avatar--sm {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
}

.ad-combo__copy {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.ad-combo__name {
  font-size: 0.9375rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-combo__meta {
  margin-top: 0.1rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-combo__placeholder {
  font-size: 0.875rem;
  color: var(--asa-label-3);
}

.ad-combo__role {
  flex-shrink: 0;
}

.ad-combo__chev {
  flex-shrink: 0;
  color: var(--asa-label-3);
  transition: transform 200ms var(--ease-default);
}

.ad-combo--open .ad-combo__chev {
  transform: rotate(180deg);
}

.ad-combo__panel {
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(100% + 0.5rem);
  z-index: 50;
  padding: 0.5rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: var(--asa-bg-card);
  box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.35), 0 2px 6px rgba(15, 23, 42, 0.06);
}

.dark .ad-combo__panel {
  box-shadow: 0 24px 60px -24px rgba(0, 0, 0, 0.9);
}

.ad-combo__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding-inline: 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.ad-combo__search:focus-within {
  border-color: var(--asa-accent);
  background: var(--asa-bg-card);
}

.ad-combo__search-ic {
  flex-shrink: 0;
  color: var(--asa-label-3);
}

.ad-combo__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-family: inherit;
  font-size: 0.8125rem;
}

.ad-combo__input::placeholder {
  color: var(--asa-label-3);
}

.ad-combo__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
  color: var(--asa-label-3);
}

.ad-combo__clear:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.ad-combo__list {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  max-height: 17rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.ad-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: 0.75rem;
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
}

.ad-option--active {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.ad-option--selected {
  background: var(--asa-accent-soft);
}

.ad-option__copy {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.ad-option__name {
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-option__meta {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-option__check {
  flex-shrink: 0;
  color: var(--asa-accent-deep);
}

.dark .ad-option__check {
  color: var(--asa-accent);
}

.ad-combo__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label-3);
}

.ad-pop-enter-active,
.ad-pop-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}

.ad-pop-enter-from,
.ad-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.ad-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
}

.ad-metric__copy {
  min-width: 0;
}

.ad-metric__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.ad-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.ad-card {
  padding: 0;
  overflow: hidden;
}

.ad-card--pad {
  padding: 1.375rem;
}

.ad-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
}

.ad-card__head-copy {
  min-width: 0;
}

.ad-skeleton {
  padding: 0.875rem 1.375rem;
}

.ad-skeleton__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.ad-skeleton__row + .ad-skeleton__row {
  border-top: 1px solid var(--asa-sep);
}

.ad-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1rem 1.375rem 0;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: var(--asa-amber-soft);
  color: var(--asa-label);
  font-size: 0.75rem;
  line-height: 1.5;
}

.ad-note .v-icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: var(--asa-amber);
}

.ad-empty {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ad-empty--column {
  flex-wrap: wrap;
}

.ad-empty--start {
  align-items: flex-start;
}

.ad-empty__copy {
  flex: 1 1 16rem;
  min-width: 0;
}

.ad-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.ad-empty__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.ad-picks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 0.625rem;
  margin-top: 1.25rem;
}

.ad-pick {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 2.5%, transparent);
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), border-color 150ms var(--ease-default),
    transform 150ms var(--ease-default);
}

.ad-pick:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 55%, transparent);
  background: var(--asa-accent-soft);
}

.ad-pick:active {
  transform: scale(0.99);
}

.ad-pick__copy {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}

.ad-pick__name {
  font-size: 0.8125rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-pick__meta {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-pick__chev {
  flex-shrink: 0;
  color: var(--asa-label-3);
}

.ad-scroll {
  overflow-x: auto;
}

.ad-table {
  width: 100%;
  min-width: 58rem;
  border-collapse: separate;
  border-spacing: 0;
}

.ad-th {
  padding: 0.875rem 0.5rem 0.75rem;
  border-bottom: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  color: var(--asa-label-2);
}

.ad-th--corner {
  min-width: 4rem;
}

.ad-th__main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.ad-th__name {
  color: var(--asa-label);
}

.ad-th--today .ad-th__name {
  color: var(--asa-accent-deep);
}

.dark .ad-th--today .ad-th__name {
  color: var(--asa-accent);
}

.ad-th__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.ad-th__add:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.ad-th__add:active {
  transform: scale(0.9);
}

.ad-th__date {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

.ad-tr:hover .ad-td--time {
  color: var(--asa-label);
}

.ad-td {
  position: relative;
  height: 2.125rem;
  padding: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--asa-sep) 55%, transparent);
  cursor: pointer;
}

.ad-td--time {
  position: sticky;
  inset-inline-start: 0;
  z-index: 2;
  min-width: 4rem;
  padding: 0 0.5rem;
  background: var(--asa-bg-card);
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: center;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
  cursor: default;
}

.ad-cell {
  position: absolute;
  inset: 0.1875rem;
  border-radius: 0.625rem;
  transition: background-color 120ms var(--ease-default), box-shadow 120ms var(--ease-default);
}

.ad-td:hover:not(.ad-td--range):not(.ad-td--anchor):not(.ad-td--selday) .ad-cell {
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .ad-td:hover:not(.ad-td--range):not(.ad-td--anchor):not(.ad-td--selday) .ad-cell {
  background: rgba(255, 255, 255, 0.05);
}

.ad-td--range .ad-cell {
  background: var(--asa-accent-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--asa-accent) 28%, transparent);
}

.ad-td--anchor .ad-cell {
  background: var(--asa-amber-soft);
  box-shadow: inset 0 0 0 1.5px var(--asa-amber);
}

.ad-td--selday .ad-cell {
  background: color-mix(in srgb, var(--asa-amber-soft) 55%, transparent);
}

.ad-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.375rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 2.5%, transparent);
}

.ad-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.ad-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.ad-dot--range {
  background: var(--asa-accent-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--asa-accent) 28%, transparent);
}

.ad-dot--selecting {
  background: var(--asa-amber-soft);
  box-shadow: inset 0 0 0 1.5px var(--asa-amber);
}

.ad-legend__hint {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-inline-start: auto;
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

.ad-days {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 0.75rem;
  padding: 1rem 1.375rem 1.375rem;
}

.ad-day {
  padding: 0.875rem;
  border: 1px solid var(--asa-sep);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 2%, transparent);
}

.ad-day--today {
  border-color: color-mix(in srgb, var(--asa-green) 45%, transparent);
  background: var(--asa-green-soft);
}

.ad-day__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-bottom: 0.625rem;
}

.ad-day__id {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  min-width: 0;
}

.ad-day__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.ad-day__date {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

.ad-day__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

.ad-day__count {
  min-width: 1.5rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.375rem;
  text-align: center;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-ranges {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ad-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.625rem;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
}

.ad-range__time {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.ad-range__dash {
  margin: 0 0.25rem;
  color: var(--asa-label-3);
}

.ad-range__dur {
  margin-inline-start: auto;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  white-space: nowrap;
}

.ad-range__actions {
  display: flex;
  align-items: center;
  gap: 0.0625rem;
  flex-shrink: 0;
}

.ad-range__actions .pf-icon-btn {
  width: 1.75rem;
  height: 1.75rem;
}

.ad-range-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border: 1px dashed var(--asa-sep);
  border-radius: 0.625rem;
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

.ad-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
  cursor: pointer;
}

.dark .ad-link {
  color: var(--asa-accent);
}

.ad-link:hover {
  text-decoration: underline;
}

.ad-dialog-copy {
  min-width: 0;
}

.ad-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 9999px;
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.ad-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.ad-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.ad-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.ad-field {
  display: block;
  min-width: 0;
}

.ad-select {
  position: relative;
}

.ad-select__input {
  width: 100%;
  height: 2.5rem;
  padding-inline-start: 0.875rem;
  padding-inline-end: 2.25rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  font-family: inherit;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  appearance: none;
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.ad-select__input:focus {
  outline: none;
  border-color: var(--asa-accent);
  background: var(--asa-bg-card);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.dark .ad-select__input {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.ad-select__ic {
  position: absolute;
  inset-inline-end: 0.75rem;
  inset-block-start: 50%;
  transform: translateY(-50%);
  color: var(--asa-label-3);
  pointer-events: none;
}

.ad-form__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-form__dur {
  margin-inline-start: auto;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.ad-form__error {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-rose);
}

.ad-delete-target {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.875rem;
  border-radius: 0.75rem;
  background: var(--asa-rose-soft);
  font-size: 0.8125rem;
  color: var(--asa-label);
}

.ad-delete-target .v-icon {
  color: var(--asa-rose);
  flex-shrink: 0;
}

.ad-delete-target__day {
  font-weight: 600;
}

.ad-delete-target__time {
  margin-inline-start: auto;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.ad-copy__desc {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.ad-copy__targets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.ad-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), background-color 150ms var(--ease-default);
}

.ad-check:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, transparent);
}

.ad-check--on {
  border-color: var(--asa-accent);
  background: var(--asa-accent-soft);
}

.ad-check__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
  border: 1.5px solid var(--asa-label-3);
  border-radius: 0.375rem;
  color: #ffffff;
}

.ad-check--on .ad-check__box {
  border-color: var(--asa-accent);
  background: var(--asa-accent);
}

.ad-check__label {
  font-size: 0.8125rem;
  font-weight: 500;
}

.ad-check__meta {
  margin-inline-start: auto;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 639px) {
  .ad-docbar {
    align-items: flex-start;
  }

  .ad-docbar__aside {
    width: 100%;
    justify-content: flex-start;
    padding-bottom: 0;
  }

  .ad-form__row {
    grid-template-columns: 1fr;
  }

  .ad-copy__targets {
    grid-template-columns: 1fr;
  }

  .ad-legend__hint {
    margin-inline-start: 0;
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ad-spin,
  .ad-cell,
  .ad-pick,
  .ad-select__input,
  .ad-combo__chev {
    animation: none;
    transition: none;
  }
}
</style>
