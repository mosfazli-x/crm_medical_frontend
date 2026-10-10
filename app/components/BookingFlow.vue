<template>
  <div class="bk" :dir="dir">
    <!-- ══════════ Public header ══════════ -->
    <header class="bk__bar">
      <div class="bk__bar-in">
        <NuxtLink to="/" class="bk__brand">
          <span class="bk__brand-mark">
            <v-icon size="18">mdi-stethoscope</v-icon>
          </span>
          <span class="bk__brand-text">
            <strong>{{ t('booking.clinicName') }}</strong>
            <small>{{ t('booking.clinicTagline') }}</small>
          </span>
        </NuxtLink>

        <div class="bk__bar-tools">
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" :aria-label="t('booking.switchLanguage')"
            :title="t('booking.switchLanguage')" @click="toggleLang">
            <v-icon size="15">mdi-translate</v-icon>
            <span>{{ otherLangLabel }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="bk__main">
      <!-- ══════════ Title ══════════ -->
      <div class="bk__intro">
        <h1 class="bk__title">{{ t('booking.title') }}</h1>
        <p class="bk__subtitle">{{ subtitle }}</p>
      </div>

      <!-- ══════════ Stepper ══════════ -->
      <nav class="bk__steps" :aria-label="t('booking.title')">
        <ol class="bk__steps-list">
          <li v-for="(s, i) in visibleSteps" :key="s.key" class="bk__step" :class="{
            'bk__step--on': i === stepIndex,
            'bk__step--done': i < stepIndex,
          }">
            <button type="button" class="bk__step-btn" :disabled="i > stepIndex"
              :aria-current="i === stepIndex ? 'step' : undefined" @click="goToStep(i)">
              <span class="bk__step-dot">
                <v-icon v-if="i < stepIndex" size="12">mdi-check</v-icon>
                <template v-else>{{ pn(i + 1) }}</template>
              </span>
              <span class="bk__step-label">{{ t(s.labelKey) }}</span>
            </button>
          </li>
        </ol>
        <div class="bk__progress" aria-hidden="true">
          <span :style="{ width: `${progressPercent}%` }" />
        </div>
        <p class="bk__counter">{{ t('booking.stepCounter', {
          current: pn(stepIndex + 1), total: pn(visibleSteps.length)
          }) }}
        </p>
      </nav>

      <!-- ══════════ Selection summary rail ══════════ -->
      <aside v-if="showRail" class="bk__rail">
        <div v-for="item in railItems" :key="item.key" class="bk__rail-item">
          <span class="asa-tint asa-tint--sm" :class="item.tint">
            <v-icon size="14" class="fill-current">{{ item.icon }}</v-icon>
          </span>
          <span class="bk__rail-copy">
            <span class="bk__rail-label">{{ item.label }}</span>
            <span class="bk__rail-value">{{ item.value }}</span>
          </span>
        </div>
      </aside>

      <!-- ══════════ Step panel ══════════ -->
      <section v-show="!success" ref="panelEl" class="bk__panel asa-card" tabindex="-1" :aria-busy="busy">
        <!-- ───── 0 · Service ───── -->
        <template v-if="step === 'service'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.selectService') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.selectServiceDesc') }}</p>
          </div>

          <div v-if="servicesLoading" class="bk__grid">
            <div v-for="n in 4" :key="n" class="asa-card asa-skel bk__skel-card" />
          </div>

          <div v-else-if="servicesError" class="pf-empty">
            <span class="asa-tint asa-tint--rose pf-tint-lg">
              <v-icon size="24" class="fill-current">mdi-alert-circle</v-icon>
            </span>
            <div>
              <p class="pf-empty__title">{{ t('booking.loadFailed') }}</p>
              <p class="pf-empty__desc">{{ servicesError }}</p>
            </div>
            <div class="pf-empty__actions">
              <button class="asa-btn asa-btn--primary" @click="fetchServices">
                <v-icon size="16" class="stroke-current">mdi-refresh</v-icon>
                <span>{{ t('booking.retry') }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="!services.length" class="pf-empty">
            <span class="asa-tint asa-tint--teal pf-tint-lg">
              <v-icon size="24" class="fill-current">mdi-stethoscope</v-icon>
            </span>
            <div>
              <p class="pf-empty__title">{{ t('booking.noServices') }}</p>
              <p class="pf-empty__desc">{{ t('booking.noServicesDesc') }}</p>
            </div>
          </div>

          <ul v-else class="bk__grid">
            <li v-for="svc in services" :key="svc.name">
              <button type="button" class="bk__tile" @click="selectService(svc)">
                <span class="bk__tile-top">
                  <span class="bk__tile-title">{{ svc.name }}</span>
                  <span class="asa-pill asa-pill--teal">{{ pn(svc.doctors.length) }} {{ t('booking.doctorsSuffix')
                    }}</span>
                </span>
                <span class="bk__tile-desc">{{ t('booking.serviceByDoctors', { count: pn(svc.doctors.length) })
                  }}</span>
              </button>
            </li>
          </ul>
        </template>

        <!-- ───── 1 · Doctor ───── -->
        <template v-else-if="step === 'doctor'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.selectDoctor') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.selectDoctorDesc') }}</p>
          </div>

          <p v-if="selectedService" class="bk__context">
            <v-icon size="15" class="stroke-current">mdi-filter-variant</v-icon>
            <span>{{ selectedService.name }}</span>
          </p>

          <div v-if="doctorsLoading" class="bk__grid">
            <div v-for="n in 3" :key="n" class="asa-card asa-skel bk__skel-card" />
          </div>

          <div v-else-if="!doctorsInService.length" class="pf-empty">
            <span class="asa-tint asa-tint--amber pf-tint-lg">
              <v-icon size="24" class="fill-current">mdi-account-off</v-icon>
            </span>
            <div>
              <p class="pf-empty__title">{{ t('booking.noDoctors') }}</p>
              <p class="pf-empty__desc">{{ t('booking.noDoctorsDesc') }}</p>
            </div>
            <div class="pf-empty__actions">
              <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="goToStepByKey('service')">
                <v-icon size="15" class="stroke-current">mdi-arrow-right</v-icon>
                <span>{{ t('booking.changeService') }}</span>
              </button>
            </div>
          </div>

          <ul v-else class="bk__grid">
            <li v-for="doc in doctorsInService" :key="doc.doctorId + doc.visitTypeId">
              <button type="button" class="bk__tile bk__tile--doc" @click="selectDoctor(doc)">
                <span class="bk__avatar" :style="doc.color ? { background: doc.color, color: doc.onColor } : undefined"
                  aria-hidden="true">{{ getInitials(doc.doctorName) }}</span>
                <span class="bk__tile-body">
                  <span class="bk__tile-title">{{ doc.doctorName }}</span>
                  <span v-if="doc.name" class="bk__tile-desc">{{ doc.name }}</span>
                  <span class="bk__tile-meta">
                    <span v-if="doc.durationMinutes" class="asa-pill asa-pill--indigo">
                      {{ pn(doc.durationMinutes) }} {{ t('booking.minutes') }}
                    </span>
                    <span v-if="doc.price" class="asa-pill asa-pill--green">
                      {{ formatPrice(doc.price) }}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </template>

        <!-- ───── 2 · Visit type + date ───── -->
        <template v-else-if="step === 'date'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.pickDate') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.pickDateDesc') }}</p>
          </div>

          <p v-if="activeDoctor" class="bk__context">
            <v-icon size="15" class="stroke-current">mdi-account-heart-outline</v-icon>
            <span>{{ t('booking.bookWithDoctor', { doctor: activeDoctor }) }}</span>
          </p>

          <!-- Visit type picker -->
          <div class="asa-sec">
            <p class="asa-sec__label">{{ t('booking.visitType') }}</p>

            <div v-if="visitTypesLoading" class="bk__chips">
              <span v-for="n in 3" :key="n" class="asa-skel bk__chip-skel" />
            </div>

            <div v-else-if="!visitTypes.length" class="pf-empty">
              <span class="asa-tint asa-tint--amber pf-tint-lg">
                <v-icon size="22" class="fill-current">mdi-tag-alert-outline</v-icon>
              </span>
              <div>
                <p class="pf-empty__title">{{ t('booking.noVisitTypes') }}</p>
                <p class="pf-empty__desc">{{ t('booking.noVisitTypesDesc') }}</p>
              </div>
            </div>

            <div v-else class="pf-seg bk__segs" role="radiogroup" :aria-label="t('booking.visitType')">
              <button v-for="vt in visitTypes" :key="vt.id" type="button" role="radio" class="pf-seg__btn bk__seg"
                :class="{ 'pf-seg__btn--on': selectedVisitType?.id === vt.id }"
                :aria-checked="selectedVisitType?.id === vt.id" @click="selectVisitType(vt)">
                <span class="bk__seg-text">{{ vt.name }}</span>
                <span v-if="vt.price" class="bk__seg-price">{{ formatPrice(vt.price) }}</span>
              </button>
            </div>
          </div>

          <!-- Calendar -->
          <div class="asa-sec">
            <p class="asa-sec__label">{{ t('booking.appointmentDate') }}</p>
            <HijriCalendar v-model="selectedJalaliDate" :marked-dates="markedDates" :loading="calendarLoading"
              :has-marks="availabilityLoaded" @month-change="onMonthChange" />
          </div>
        </template>

        <!-- ───── 3 · Time ───── -->
        <template v-else-if="step === 'time'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.selectTime') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.selectTimeDesc', { date: longDate }) }}</p>
          </div>

          <div v-if="fetchingSlots" class="bk__chips">
            <span v-for="n in 8" :key="n" class="asa-skel bk__chip-skel" />
          </div>

          <div v-else-if="slotsError" class="pf-empty">
            <span class="asa-tint asa-tint--rose pf-tint-lg">
              <v-icon size="24" class="fill-current">mdi-alert-circle</v-icon>
            </span>
            <div>
              <p class="pf-empty__title">{{ t('booking.loadFailed') }}</p>
              <p class="pf-empty__desc">{{ slotsError }}</p>
            </div>
            <div class="pf-empty__actions">
              <button class="asa-btn asa-btn--primary" @click="fetchSlots">
                <v-icon size="16" class="stroke-current">mdi-refresh</v-icon>
                <span>{{ t('booking.retry') }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="!availableSlots.length" class="pf-empty">
            <span class="asa-tint asa-tint--teal pf-tint-lg">
              <v-icon size="24" class="fill-current">mdi-calendar-blank-outline</v-icon>
            </span>
            <div>
              <p class="pf-empty__title">{{ t('booking.noSlotsForDay') }}</p>
              <p class="pf-empty__desc">{{ t('booking.noSlotsFoundDesc') }}</p>
            </div>
            <div class="pf-empty__actions">
              <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="goToStepByKey('date')">
                <v-icon size="15" class="stroke-current">mdi-calendar-month-outline</v-icon>
                <span>{{ t('booking.pickAnotherDate') }}</span>
              </button>
            </div>
          </div>

          <div v-else class="bk__slots-head">
            <p class="pf-info-label">{{ t('booking.freeSlotCount', { count: pn(availableSlots.length) }) }}</p>
            <div v-if="selectedSlot" class="asa-pill asa-pill--teal">
              <v-icon size="12" class="stroke-current">mdi-check-circle</v-icon>
              <span>{{ selectedSlot.startTime }} — {{ selectedSlot.endTime }}</span>
            </div>
          </div>

          <div v-if="availableSlots.length" class="bk__slots">
            <button v-for="slot in availableSlots" :key="slot.startTime" type="button" class="bk__slot"
              :class="{ 'bk__slot--on': selectedSlot?.startTime === slot.startTime }"
              :aria-pressed="selectedSlot?.startTime === slot.startTime" @click="selectSlot(slot)">
              <span class="bk__slot-time">{{ slot.startTime }}</span>
              <span class="bk__slot-end">{{ slot.endTime }}</span>
            </button>
          </div>
        </template>

        <!-- ───── 4 · Patient details ───── -->
        <template v-else-if="step === 'info'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.patientInfo') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.patientInfoDesc') }}</p>
          </div>

          <div class="pf-info-grid bk__visit">
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('booking.visitDate') }}</p>
              <p class="pf-info-value">{{ longDate }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('booking.visitTime') }}</p>
              <p class="pf-info-value">{{ selectedSlot ? `${selectedSlot.startTime} ${t('booking.timeTo')}
                ${selectedSlot.endTime}` : '—' }}</p>
            </div>
          </div>

          <div v-if="errorCount" class="asa-alert bk__alert" role="alert">
            <v-icon size="18" class="stroke-current">mdi-alert-circle-outline</v-icon>
            <span>{{ t('booking.stepInvalid', { count: pn(errorCount) }) }}</span>
          </div>

          <form class="bk__form" novalidate @submit.prevent="submit">
            <div class="bk__field">
              <label class="asa-field-label" for="bk-firstName">{{ t('booking.firstName') }}</label>
              <div class="bk__input-wrap">
                <input id="bk-firstName" v-model.trim="form.firstName" type="text" class="asa-input"
                  :class="{ 'asa-input--err': errors.firstName }" :placeholder="t('booking.firstNamePlaceholder')"
                  :aria-invalid="!!errors.firstName"
                  :aria-describedby="errors.firstName ? 'bk-err-firstName' : undefined" autocomplete="given-name"
                  @input="clearError('firstName')">
                <button type="button" class="bk__hand" :aria-label="t('booking.writeByHand')"
                  :title="t('booking.writeByHand')" @click="openHandwriting('firstName')">
                  <v-icon size="16" class="stroke-current">mdi-gesture-tap-button</v-icon>
                </button>
              </div>
              <p v-if="errors.firstName" id="bk-err-firstName" class="bk__err">{{ errors.firstName }}</p>
            </div>

            <div class="bk__field">
              <label class="asa-field-label" for="bk-lastName">{{ t('booking.lastName') }}</label>
              <div class="bk__input-wrap">
                <input id="bk-lastName" v-model.trim="form.lastName" type="text" class="asa-input"
                  :class="{ 'asa-input--err': errors.lastName }" :placeholder="t('booking.lastNamePlaceholder')"
                  :aria-invalid="!!errors.lastName" :aria-describedby="errors.lastName ? 'bk-err-lastName' : undefined"
                  autocomplete="family-name" @input="clearError('lastName')">
                <button type="button" class="bk__hand" :aria-label="t('booking.writeByHand')"
                  :title="t('booking.writeByHand')" @click="openHandwriting('lastName')">
                  <v-icon size="16" class="stroke-current">mdi-gesture-tap-button</v-icon>
                </button>
              </div>
              <p v-if="errors.lastName" id="bk-err-lastName" class="bk__err">{{ errors.lastName }}</p>
            </div>

            <div class="bk__field">
              <label class="asa-field-label" for="bk-nationalId">{{ t('booking.nationalId') }}</label>
              <div class="bk__input-wrap">
                <input id="bk-nationalId" :value="form.nationalId" type="text" inputmode="numeric" class="asa-input"
                  :class="{ 'asa-input--err': errors.nationalId }" :placeholder="t('booking.nationalIdPlaceholder')"
                  :aria-invalid="!!errors.nationalId"
                  :aria-describedby="errors.nationalId ? 'bk-err-nationalId' : undefined" maxlength="12"
                  autocomplete="off" @input="onNationalIdInput" @blur="validateField('nationalId')">
                <button type="button" class="bk__hand" :aria-label="t('booking.writeByHand')"
                  :title="t('booking.writeByHand')" @click="openHandwriting('nationalId')">
                  <v-icon size="16" class="stroke-current">mdi-gesture-tap-button</v-icon>
                </button>
              </div>
              <p v-if="errors.nationalId" id="bk-err-nationalId" class="bk__err">{{ errors.nationalId }}</p>
            </div>

            <div class="bk__field">
              <label class="asa-field-label" for="bk-phone">{{ t('booking.phone') }}</label>
              <div class="bk__input-wrap">
                <input id="bk-phone" :value="form.phone" type="tel" inputmode="tel" class="asa-input"
                  :class="{ 'asa-input--err': errors.phone }" :placeholder="t('booking.phonePlaceholder')"
                  :aria-invalid="!!errors.phone" :aria-describedby="errors.phone ? 'bk-err-phone' : undefined"
                  autocomplete="tel" @input="onPhoneInput" @blur="validateField('phone')">
                <button type="button" class="bk__hand" :aria-label="t('booking.writeByHand')"
                  :title="t('booking.writeByHand')" @click="openHandwriting('phone')">
                  <v-icon size="16" class="stroke-current">mdi-gesture-tap-button</v-icon>
                </button>
              </div>
              <p v-if="errors.phone" id="bk-err-phone" class="bk__err">{{ errors.phone }}</p>
            </div>
          </form>
        </template>

        <!-- ───── 5 · Review ───── -->
        <template v-else-if="step === 'review'">
          <div class="bk__panel-head">
            <h2 class="bk__panel-title">{{ t('booking.reviewTitle') }}</h2>
            <p class="bk__panel-desc">{{ t('booking.reviewDesc') }}</p>
          </div>

          <div class="asa-sec">
            <p class="asa-sec__label">{{ t('booking.summaryTitle') }}</p>
            <div class="bk__review">
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.doctor') }}</p>
                <p class="pf-info-value">{{ activeDoctor || '—' }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.visitType') }}</p>
                <p class="pf-info-value">{{ selectedVisitType?.name || '—' }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.date') }}</p>
                <p class="pf-info-value">{{ longDate }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.time') }}</p>
                <p class="pf-info-value">{{ selectedSlot ? `${selectedSlot.startTime} ${t('booking.timeTo')}
                  ${selectedSlot.endTime}` : '—' }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.patient') }}</p>
                <p class="pf-info-value">{{ fullName }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.phone') }}</p>
                <p class="pf-info-value" dir="ltr">{{ form.phone }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.nationalId') }}</p>
                <p class="pf-info-value" dir="ltr">{{ form.nationalId }}</p>
              </div>
              <div class="pf-info-cell">
                <p class="pf-info-label">{{ t('booking.summary.price') }}</p>
                <p class="pf-info-value">{{ selectedVisitType?.price ? formatPrice(selectedVisitType.price) : '—' }}</p>
              </div>
            </div>
          </div>

          <p class="bk__disclaimer">
            <v-icon size="15" class="stroke-current">mdi-information-outline</v-icon>
            <span>{{ t('booking.disclaimer') }}</span>
          </p>
        </template>
      </section>

      <!-- ══════════ Success ══════════ -->
      <section v-if="success" class="bk__panel asa-card bk__success" aria-live="polite">
        <span class="asa-tint asa-tint--green pf-tint-lg bk__success-mark">
          <v-icon size="30" class="stroke-current">mdi-check-bold</v-icon>
        </span>
        <h2 class="bk__panel-title">{{ t('booking.bookingSuccess') }}</h2>
        <p class="bk__panel-desc">{{ t('booking.bookingSuccessDesc') }}</p>

        <div class="bk__review bk__success-grid">
          <div class="pf-info-cell">
            <p class="pf-info-label">{{ t('booking.visitDate') }}</p>
            <p class="pf-info-value">{{ longDate }}</p>
          </div>
          <div class="pf-info-cell">
            <p class="pf-info-label">{{ t('booking.visitTypeLabel') }}</p>
            <p class="pf-info-value">{{ selectedVisitType?.name }}</p>
          </div>
          <div class="pf-info-cell">
            <p class="pf-info-label">{{ t('booking.visitTime') }}</p>
            <p class="pf-info-value">{{ selectedSlot?.startTime }} {{ t('booking.timeTo') }} {{ selectedSlot?.endTime }}
            </p>
          </div>
          <div class="pf-info-cell">
            <p class="pf-info-label">{{ t('booking.summary.doctor') }}</p>
            <p class="pf-info-value">{{ activeDoctor }}</p>
          </div>
        </div>

        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary" @click="resetBooking">
            <v-icon size="16" class="stroke-current">mdi-calendar-plus</v-icon>
            <span>{{ t('booking.bookNew') }}</span>
          </button>
        </div>
      </section>

      <!-- ══════════ Actions ══════════ -->
      <footer v-if="!success" class="bk__actions">
        <button v-if="stepIndex > 0" type="button" class="asa-btn asa-btn--ghost" :disabled="busy"
          @click="goToStep(stepIndex - 1)">
          <v-icon size="16" class="stroke-current">mdi-arrow-{{ isRtl ? 'right' : 'left' }}</v-icon>
          <span>{{ t('booking.back') }}</span>
        </button>
        <span v-else />

        <button v-if="step === 'review'" type="button" class="asa-btn asa-btn--primary bk__confirm"
          :disabled="submitting" @click="submit">
          <v-icon v-if="submitting" size="16" class="pf-spin">mdi-loading</v-icon>
          <v-icon v-else size="16" class="stroke-current">mdi-check-circle-outline</v-icon>
          <span>{{ submitting ? t('booking.submitting') : t('booking.confirmBooking') }}</span>
        </button>

        <button v-else type="button" class="asa-btn asa-btn--primary" :disabled="!canGoNext" @click="goNext">
          <span>{{ t('booking.continue') }}</span>
          <v-icon size="16" class="stroke-current">mdi-arrow-{{ isRtl ? 'left' : 'right' }}</v-icon>
        </button>
      </footer>
    </main>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
      @insert="applyHandwriting" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import HijriCalendar from '~/components/HijriCalendar.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import { useLang } from '~/composables/useLang'
import { useFormatting } from '~/composables/useFormatting'

const props = defineProps<{
  initialDoctorId?: string
  initialVisitTypeId?: string
}>()

const { t, locale } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { pn, isRtl, toggleLang, lang } = useLang()
const { formatPrice, formatJalaliLong } = useFormatting()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))
const otherLangLabel = computed(() => (lang.value === 'fa' ? t('layout.langEn') : t('layout.langFa')))

/* ══════════════════════════════════════════════════════════
   Step model
   ══════════════════════════════════════════════════════════ */

type StepKey = 'service' | 'doctor' | 'date' | 'time' | 'info' | 'review'

const ALL_STEPS: { key: StepKey; labelKey: string }[] = [
  { key: 'service', labelKey: 'booking.steps.service' },
  { key: 'doctor', labelKey: 'booking.steps.doctor' },
  { key: 'date', labelKey: 'booking.steps.date' },
  { key: 'time', labelKey: 'booking.steps.time' },
  { key: 'info', labelKey: 'booking.steps.info' },
  { key: 'review', labelKey: 'booking.steps.review' },
]

/** Deep links start at the doctor-specific steps and hide the chooser steps. */
const doctorLocked = computed(() => !!props.initialDoctorId)
const visibleSteps = computed(() =>
  doctorLocked.value
    ? ALL_STEPS.filter((s) => s.key === 'date' || s.key === 'time' || s.key === 'info' || s.key === 'review')
    : ALL_STEPS
)

const stepIndex = ref(0)
const step = computed<StepKey>(
  () => visibleSteps.value[Math.min(stepIndex.value, visibleSteps.value.length - 1)]!.key
)

const progressPercent = computed(() => ((stepIndex.value + 1) / visibleSteps.value.length) * 100)

/* Steps after the furthest point reached are only reachable once satisfied. */
const reachedIndex = ref(0)

function goToStep(index: number) {
  const clamped = Math.max(0, Math.min(index, visibleSteps.value.length - 1))
  if (clamped > reachedIndex.value) return
  stepIndex.value = clamped
}

function goToStepByKey(key: StepKey) {
  const index = visibleSteps.value.findIndex((s) => s.key === key)
  if (index !== -1) goToStep(index)
}

/* ══════════════════════════════════════════════════════════
   State
   ══════════════════════════════════════════════════════════ */

interface ServiceDoctor {
  doctorId: string
  doctorName: string
  visitTypeId: string
  name: string
  description: string | null
  durationMinutes: number
  price: string | null
  color: string | null
  /** Readable ink for the initials sitting on `color`. */
  onColor: string
}

interface ServiceGroup {
  name: string
  doctors: ServiceDoctor[]
}

interface VisitType {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number | string | null
}

interface Slot {
  startTime: string
  endTime: string
}

/* Raw payload shapes — the booking API returns snake_case rows. */
interface ApiServiceDoctor {
  doctorId: string
  doctorName: string
  visitTypeId: string
  name: string
  description?: string | null
  duration_minutes?: number
  durationMinutes?: number
  price?: string | number | null
  color?: string | null
}

interface ApiServiceGroup {
  name: string
  doctors?: ApiServiceDoctor[]
}

interface ApiDoctor {
  id: string
  fullName: string
}

interface ApiVisitType {
  id: string
  name: string
  description?: string | null
  duration_minutes?: number
  durationMinutes?: number
  price?: number | string | null
  is_active?: boolean
  isActive?: boolean
}

interface Envelope<T> {
  success: boolean
  data?: T
}

const services = ref<ServiceGroup[]>([])
const selectedService = ref<ServiceGroup | null>(null)
const selectedDoctor = ref<ServiceDoctor | null>(null)

const visitTypes = ref<VisitType[]>([])
const selectedVisitType = ref<VisitType | null>(null)
const pendingVisitTypeId = ref<string | null>(props.initialVisitTypeId ?? null)

const availableSlots = ref<Slot[]>([])
const selectedSlot = ref<Slot | null>(null)

const servicesLoading = ref(true)
const servicesError = ref('')
const visitTypesLoading = ref(false)
const calendarLoading = ref(false)
const availabilityLoaded = ref(false)
const fetchingSlots = ref(false)
const slotsError = ref('')
const submitting = ref(false)
const success = ref(false)

const markedDates = ref<string[]>([])
const panelEl = ref<HTMLElement | null>(null)
const resolvedDoctorName = ref('')

const todayJalali = moment()
const selectedJalaliDate = ref(
  `${todayJalali.jYear()}/${String(todayJalali.jMonth() + 1).padStart(2, '0')}/${String(todayJalali.jDate()).padStart(2, '0')}`
)

const form = ref({ firstName: '', lastName: '', nationalId: '', phone: '' })

const busy = computed(() =>
  servicesLoading.value || visitTypesLoading.value || calendarLoading.value || fetchingSlots.value || submitting.value
)

const activeDoctorId = computed(() => selectedDoctor.value?.doctorId ?? props.initialDoctorId ?? '')
const activeDoctor = computed(
  () => resolvedDoctorName.value || selectedDoctor.value?.doctorName || ''
)

const doctorsInService = computed(() => selectedService.value?.doctors ?? [])

const currentDate = computed(() => {
  if (!selectedJalaliDate.value) return new Date()
  const m = moment(selectedJalaliDate.value.replace(/-/g, '/'), 'jYYYY/jMM/jDD')
  return m.isValid() ? m.toDate() : new Date()
})

/** Gregorian YYYY-MM-DD, the format the slots endpoint expects. */
const gregorianDate = computed(() => {
  const d = currentDate.value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const longDate = computed(() => formatJalaliLong(currentDate.value))

const subtitle = computed(() => {
  switch (step.value) {
    case 'service': return t('booking.selectServiceDesc')
    case 'doctor': return t('booking.selectDoctorDesc')
    case 'date': return t('booking.pickDateDesc')
    case 'time': return t('booking.selectTimeDesc', { date: longDate.value })
    case 'info': return t('booking.patientInfoDesc')
    case 'review': return t('booking.reviewDesc')
    default: return ''
  }
})

const fullName = computed(() => `${form.value.firstName} ${form.value.lastName}`.trim())

/* ══════════════════════════════════════════════════════════
   Validation
   ══════════════════════════════════════════════════════════ */

type FieldKey = 'firstName' | 'lastName' | 'nationalId' | 'phone'
const errors = ref<Record<FieldKey, string>>({
  firstName: '', lastName: '', nationalId: '', phone: '',
})
const touched = ref<Record<FieldKey, boolean>>({
  firstName: false, lastName: false, nationalId: false, phone: false,
})

/** Persian and Arabic keyboards emit non-ASCII digits; the API only accepts ASCII. */
function toAsciiDigits(value: string): string {
  return value
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

const nationalIdDigits = computed(() => toAsciiDigits(form.value.nationalId).replace(/\D/g, ''))
const phoneDigits = computed(() => toAsciiDigits(form.value.phone).replace(/\D/g, ''))

function validateField(field: FieldKey): string {
  switch (field) {
    case 'firstName':
      return form.value.firstName ? '' : t('booking.firstNameRequired')
    case 'lastName':
      return form.value.lastName ? '' : t('booking.lastNameRequired')
    case 'nationalId':
      if (!nationalIdDigits.value) return t('booking.nationalIdRequired')
      if (nationalIdDigits.value.length !== 10) return t('booking.nationalIdLength')
      return ''
    case 'phone': {
      if (!phoneDigits.value) return t('booking.phoneRequired')
      // Accepts 09xxxxxxxxx as well as +98 / 0098 prefixed numbers.
      const local = phoneDigits.value.replace(/^0098/, '').replace(/^98/, '')
      return /^09\d{9}$/.test(local) ? '' : t('booking.phoneInvalid')
    }
  }
}

function validateForm(): boolean {
  let ok = true
    ; (Object.keys(errors.value) as FieldKey[]).forEach((field) => {
      touched.value[field] = true
      const message = validateField(field)
      errors.value[field] = message
      if (message) ok = false
    })
  return ok
}

function clearError(field: FieldKey) {
  if (!touched.value[field]) return
  errors.value[field] = validateField(field)
}

const errorCount = computed(() => Object.values(errors.value).filter(Boolean).length)
const formValid = computed(() => (Object.keys(errors.value) as FieldKey[]).every((f) => !validateField(f)))

function onNationalIdInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  form.value.nationalId = toAsciiDigits(raw).replace(/\D/g, '').slice(0, 10)
  clearError('nationalId')
}

function onPhoneInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  form.value.phone = toAsciiDigits(raw).replace(/[^\d+]/g, '').slice(0, 20)
  clearError('phone')
}

/* ══════════════════════════════════════════════════════════
   Navigation
   ══════════════════════════════════════════════════════════ */

const canGoNext = computed(() => {
  switch (step.value) {
    case 'service': return !!selectedService.value
    case 'doctor': return !!selectedDoctor.value
    case 'date': return !!selectedVisitType.value && !!selectedJalaliDate.value
    case 'time': return !!selectedSlot.value
    case 'info': return formValid.value
    default: return false
  }
})

function goNext() {
  if (step.value === 'info' && !validateForm()) {
    nextTick(() => {
      document.querySelector<HTMLElement>('.asa-input--err')?.focus()
    })
    return
  }
  if (!canGoNext.value) return

  stepIndex.value = Math.min(stepIndex.value + 1, visibleSteps.value.length - 1)
  reachedIndex.value = Math.max(reachedIndex.value, stepIndex.value)
}

watch(step, async () => {
  await nextTick()
  panelEl.value?.focus()

  if (step.value === 'time' && !fetchingSlots.value) fetchSlots()
  if (step.value === 'date') {
    loadVisitTypes()
    loadMonthAvailability(todayJalali.jYear(), todayJalali.jMonth() + 1)
  }
})

/* ══════════════════════════════════════════════════════════
   Data loading
   ══════════════════════════════════════════════════════════ */

function extractError(err: unknown, fallbackKey: string): string {
  const data = (err as { data?: { error?: string; message?: string } })?.data
  return data?.error || data?.message || t(fallbackKey)
}

function normalizeColor(color: string | null | undefined): string | null {
  return color && /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color) ? color : null
}

/** Doctors carry their own brand colour, which ranges from near-black to neon.
    Pick the initials ink from its luminance so the avatar is always readable. */
function readableInkOn(hex: string | null): string {
  if (!hex) return '#ffffff'
  const raw = hex.replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6)
  if (full.length !== 6) return '#ffffff'

  const channel = (offset: number) => {
    const c = parseInt(full.slice(offset, offset + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return luminance > 0.42 ? '#1d1d1f' : '#ffffff'
}

async function fetchServices() {
  servicesLoading.value = true
  servicesError.value = ''
  try {
    const res = await apiFetch<Envelope<ApiServiceGroup[]>>('/api/booking/services')
    if (res?.success) {
      services.value = (res.data ?? []).map((group) => ({
        name: group.name,
        doctors: (group.doctors ?? []).map((d) => {
          const color = normalizeColor(d.color)
          return {
            doctorId: d.doctorId,
            doctorName: d.doctorName,
            visitTypeId: d.visitTypeId,
            name: d.name,
            description: d.description ?? null,
            durationMinutes: d.duration_minutes || d.durationMinutes || 30,
            price: d.price ?? null,
            color,
            onColor: readableInkOn(color),
          }
        }),
      }))
    }
  } catch (err) {
    servicesError.value = extractError(err, 'booking.fetchServicesError')
  } finally {
    servicesLoading.value = false
  }
}

async function fetchDoctorName() {
  const doctorId = activeDoctorId.value
  if (!doctorId) return
  try {
    const res = await apiFetch<Envelope<ApiDoctor[]>>('/api/booking/doctors')
    const doctor = res?.success ? (res.data ?? []).find((d) => d.id === doctorId) : undefined
    if (doctor?.fullName) {
      resolvedDoctorName.value = doctor.fullName
      return
    }
  } catch {
    /* fall through to the service-based lookup */
  }

  try {
    const res = await apiFetch<Envelope<ApiServiceGroup[]>>(
      `/api/booking/services?doctorId=${doctorId}`
    )
    for (const group of res?.data ?? []) {
      const match = (group.doctors ?? []).find((d) => d.doctorId === doctorId)
      if (match?.doctorName) {
        resolvedDoctorName.value = match.doctorName
        return
      }
    }
  } catch {
    /* the doctor name is cosmetic; the flow continues without it */
  }
}

async function loadVisitTypes() {
  const doctorId = activeDoctorId.value
  if (!doctorId) return

  visitTypesLoading.value = true
  try {
    const res = await apiFetch<Envelope<ApiVisitType[]>>(`/api/visit-types/${doctorId}`)
    visitTypes.value = (res?.data ?? [])
      .filter((vt) => (vt.is_active ?? vt.isActive ?? true) === true)
      .map((vt) => ({
        id: vt.id,
        name: vt.name,
        description: vt.description ?? null,
        durationMinutes: vt.duration_minutes || vt.durationMinutes || 30,
        price: vt.price ?? null,
      }))
  } catch (err) {
    visitTypes.value = []
    $toast.error(extractError(err, 'booking.fetchVisitTypesError'))
  } finally {
    visitTypesLoading.value = false
  }
}

watch(visitTypes, (types) => {
  if (!types.length) {
    selectedVisitType.value = null
    return
  }
  if (selectedVisitType.value) {
    const stillExists = types.find((vt) => vt.id === selectedVisitType.value?.id)
    if (stillExists) {
      selectedVisitType.value = stillExists
      return
    }
  }
  const preferred = pendingVisitTypeId.value
    ? types.find((vt) => vt.id === pendingVisitTypeId.value)
    : undefined
  selectedVisitType.value = preferred ?? types[0]!
  pendingVisitTypeId.value = null
}, { deep: true })

/* ─── Month availability ─── */

/** Cached per doctor *and* month, so switching doctors never reuses stale marks. */
const availabilityCache = new Map<string, string[]>()
let availabilityToken = 0

function onMonthChange(payload: { year: number; month: number }) {
  loadMonthAvailability(payload.year, payload.month)
}

async function runPooled<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0
  const size = Math.max(1, Math.min(limit, items.length))
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++]!
        await worker(item)
      }
    })
  )
}

async function loadMonthAvailability(year: number, month: number) {
  const doctorId = activeDoctorId.value
  if (!doctorId) return

  const cacheKey = `${doctorId}:${year}-${month}`
  const cached = availabilityCache.get(cacheKey)
  if (cached) {
    markedDates.value = cached
    availabilityLoaded.value = true
    return
  }

  const token = ++availabilityToken
  calendarLoading.value = true
  availabilityLoaded.value = false
  markedDates.value = []

  const pad = (n: number) => String(n).padStart(2, '0')
  const todayKey = `${todayJalali.jYear()}/${pad(todayJalali.jMonth() + 1)}/${pad(todayJalali.jDate())}`
  const daysInMonth = moment.jDaysInMonth(year, month - 1)

  const days: { jalali: string; gregorian: string }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const jalali = `${year}/${pad(month)}/${pad(d)}`
    if (jalali < todayKey) continue
    const g = moment(jalali, 'jYYYY/jMM/jDD')
    if (!g.isValid()) continue
    const gd = g.toDate()
    days.push({
      jalali,
      gregorian: `${gd.getFullYear()}-${pad(gd.getMonth() + 1)}-${pad(gd.getDate())}`,
    })
  }

  const found: string[] = []
  await runPooled(days, 6, async (day) => {
    try {
      const res = await apiFetch<{ success: boolean; data?: unknown[] }>(
        `/api/booking/slots/${doctorId}?date=${day.gregorian}`
      )
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        found.push(day.jalali)
      }
    } catch {
      /* a single failing day simply has no known availability */
    }
  })

  // A newer month load superseded this one.
  if (token !== availabilityToken) return

  found.sort()
  availabilityCache.set(cacheKey, found)
  markedDates.value = found
  availabilityLoaded.value = true
  calendarLoading.value = false
}

/* ─── Slots for the selected day ─── */

let slotsToken = 0

async function fetchSlots() {
  const doctorId = activeDoctorId.value
  if (!doctorId) return

  const token = ++slotsToken
  fetchingSlots.value = true
  slotsError.value = ''

  try {
    const res = await apiFetch<{ success: boolean; data?: Slot[] }>(
      `/api/booking/slots/${doctorId}?date=${gregorianDate.value}`
    )
    if (token !== slotsToken) return
    availableSlots.value = res?.success ? (res.data ?? []) : []
  } catch (err) {
    if (token !== slotsToken) return
    availableSlots.value = []
    slotsError.value = extractError(err, 'booking.fetchSlotsError')
  } finally {
    if (token === slotsToken) fetchingSlots.value = false
  }
}

watch(selectedJalaliDate, () => {
  selectedSlot.value = null
  fetchSlots()
})

/* ══════════════════════════════════════════════════════════
   Selections
   ══════════════════════════════════════════════════════════ */

function selectService(svc: ServiceGroup) {
  selectedService.value = svc
  goNext()
}

function selectDoctor(doc: ServiceDoctor) {
  const changed = selectedDoctor.value?.doctorId !== doc.doctorId
  selectedDoctor.value = doc
  resolvedDoctorName.value = doc.doctorName

  // Availability, slots and the chosen visit type all belong to one doctor.
  if (changed) {
    selectedVisitType.value = null
    pendingVisitTypeId.value = doc.visitTypeId || null
    availableSlots.value = []
    selectedSlot.value = null
    markedDates.value = []
    availabilityLoaded.value = false
  }

  goNext()
}

function selectVisitType(vt: VisitType) {
  selectedVisitType.value = vt
  clearError('firstName')
}

function selectSlot(slot: Slot) {
  selectedSlot.value = slot
  if (step.value === 'time') goNext()
}

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return (name || 'DR').slice(0, 2).toUpperCase()
}

/* ══════════════════════════════════════════════════════════
   Summary rail
   ══════════════════════════════════════════════════════════ */

const showRail = computed(() => !doctorLocked.value || !!activeDoctor.value)

const railItems = computed(() => {
  const items: { key: string; icon: string; tint: string; label: string; value: string }[] = []
  if (activeDoctor.value) {
    items.push({
      key: 'doctor', icon: 'mdi-account-heart-outline', tint: 'asa-tint--teal',
      label: t('booking.summary.doctor'), value: activeDoctor.value,
    })
  }
  if (selectedVisitType.value) {
    items.push({
      key: 'visitType', icon: 'mdi-tag-outline', tint: 'asa-tint--indigo',
      label: t('booking.summary.visitType'), value: selectedVisitType.value.name,
    })
  }
  if (selectedJalaliDate.value) {
    items.push({
      key: 'date', icon: 'mdi-calendar-month-outline', tint: 'asa-tint--amber',
      label: t('booking.summary.date'), value: longDate.value,
    })
  }
  if (selectedSlot.value) {
    items.push({
      key: 'time', icon: 'mdi-clock-outline', tint: 'asa-tint--green',
      label: t('booking.summary.time'),
      value: `${selectedSlot.value.startTime} ${t('booking.timeTo')} ${selectedSlot.value.endTime}`,
    })
  }
  return items
})

/* ══════════════════════════════════════════════════════════
   Submit
   ══════════════════════════════════════════════════════════ */

async function submit() {
  if (submitting.value) return
  if (step.value === 'info' && !validateForm()) return

  const doctorId = activeDoctorId.value
  const slot = selectedSlot.value
  const visitType = selectedVisitType.value
  if (!doctorId || !slot || !visitType) return

  submitting.value = true
  try {
    const res = await apiFetch<{ success?: boolean }>('/api/booking/appointments', {
      method: 'POST',
      body: {
        doctorId,
        appointmentDate: gregorianDate.value,
        startTime: slot.startTime,
        endTime: slot.endTime,
        visitTypeId: visitType.id,
        patientFirstName: form.value.firstName,
        patientLastName: form.value.lastName,
        patientNationalId: nationalIdDigits.value,
        patientPhone: phoneDigits.value,
      },
    })

    if (res && res.success === false) {
      throw new Error('booking-failed')
    }

    success.value = true
    availabilityCache.clear()
    $toast.success(t('booking.bookingSuccessDetail'))
    nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  } catch (err) {
    const conflict = /already booked|ConflictError/i.test(
      (err as { data?: { error?: string } })?.data?.error ?? ''
    )
    $toast.error(conflict ? t('booking.slotTaken') : extractError(err, 'booking.bookingError'))

    // A taken slot invalidates both the slot list and the month's marks.
    if (conflict) {
      availabilityCache.delete(`${doctorId}:${moment(gregorianDate.value).format('YYYY-MM')}`)
      selectedSlot.value = null
      fetchSlots()
    }
  } finally {
    submitting.value = false
  }
}

function resetBooking() {
  success.value = false
  selectedSlot.value = null
  selectedVisitType.value = null
  selectedDoctor.value = null
  selectedService.value = null
  resolvedDoctorName.value = ''
  availableSlots.value = []
  markedDates.value = []
  availabilityLoaded.value = false
  availabilityCache.clear()

  form.value = { firstName: '', lastName: '', nationalId: '', phone: '' }
  touched.value = { firstName: false, lastName: false, nationalId: false, phone: false }
  errors.value = { firstName: '', lastName: '', nationalId: '', phone: '' }

  const today = moment()
  selectedJalaliDate.value =
    `${today.jYear()}/${String(today.jMonth() + 1).padStart(2, '0')}/${String(today.jDate()).padStart(2, '0')}`

  stepIndex.value = 0
  reachedIndex.value = 0

  if (doctorLocked.value) {
    fetchDoctorName()
  } else {
    fetchServices()
  }
}

/* ══════════════════════════════════════════════════════════
   Handwriting input
   ══════════════════════════════════════════════════════════ */

const {
  handwritingOpen,
  handwritingLabel,
  handwritingNumeric,
  openHandwriting,
  applyHandwriting,
} = useHandwritingFields({
  fieldLabels: {
    firstName: t('booking.firstName'),
    lastName: t('booking.lastName'),
    nationalId: t('booking.nationalId'),
    phone: t('booking.phone'),
  },
  target: form,
})

watch(form, () => {
  if (touched.value.firstName) errors.value.firstName = validateField('firstName')
  if (touched.value.lastName) errors.value.lastName = validateField('lastName')
}, { deep: true })

/* ══════════════════════════════════════════════════════════
   Boot
   ══════════════════════════════════════════════════════════ */

onMounted(() => {
  if (doctorLocked.value) {
    fetchDoctorName()
    loadVisitTypes()
    loadMonthAvailability(todayJalali.jYear(), todayJalali.jMonth() + 1)
  } else {
    fetchServices()
  }
})
</script>

<style scoped>
.bk {
  min-height: 100dvh;
  background: var(--asa-bg-page, #f5f5f7);
  color: var(--asa-label);
  padding-bottom: 3rem;
}

/* ══════ Header ══════ */
.bk__bar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--asa-bg-card) 85%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--asa-sep);
}

.bk__bar-in {
  max-width: 68rem;
  margin-inline: auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.bk__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.bk__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.bk__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.bk__brand-text strong {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.bk__brand-text small {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.bk__bar-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* ══════ Shell ══════ */
.bk__main {
  max-width: 68rem;
  margin-inline: auto;
  padding: 1.5rem 1rem 0;
}

@media (min-width: 768px) {
  .bk__main {
    padding-top: 2.25rem;
  }
}

.bk__intro {
  margin-bottom: 1.5rem;
}

.bk__title {
  font-size: clamp(1.6rem, 4.2vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.bk__subtitle {
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  color: var(--asa-label-2);
  line-height: 1.6;
}

/* ══════ Stepper ══════ */
.bk__steps {
  margin-bottom: 1.25rem;
}

.bk__steps-list {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.bk__steps-list::-webkit-scrollbar {
  display: none;
}

.bk__step {
  flex: 1 1 0;
  min-width: 5.5rem;
}

.bk__step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem 0.25rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.bk__step-btn:disabled {
  cursor: default;
}

.bk__step-btn:not(:disabled):hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.bk__step-btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: -2px;
}

.bk__step-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 9999px;
  border: 1.5px solid var(--asa-track);
  background: var(--asa-bg-card);
  color: var(--asa-label-2);
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: all 180ms ease;
}

.bk__step--on .bk__step-dot {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  color: #ffffff;
  box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--asa-accent) 70%, transparent);
}

.bk__step--done .bk__step-dot {
  background: var(--asa-accent-soft);
  border-color: transparent;
  color: var(--asa-accent-deep);
}

.bk__step-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.bk__step--on .bk__step-label {
  color: var(--asa-label);
}

.bk__progress {
  margin-top: 0.75rem;
  height: 0.25rem;
  border-radius: 9999px;
  background: var(--asa-track);
  overflow: hidden;
}

.bk__progress span {
  display: block;
  height: 100%;
  border-radius: 9999px;
  background: var(--asa-accent);
  transition: width 320ms var(--ease-premium, cubic-bezier(0.16, 1, 0.3, 1));
}

.bk__counter {
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-3);
  text-align: center;
}

/* ══════ Summary rail ══════ */
.bk__rail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  box-shadow: var(--asa-card-shadow);
}

.bk__rail-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.bk__rail-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bk__rail-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
}

.bk__rail-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ══════ Panel ══════ */
.bk__panel {
  outline: none;
}

.bk__panel-head {
  margin-bottom: 1.25rem;
}

.bk__panel-title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--asa-label);
}

.bk__panel-desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  line-height: 1.6;
}

.bk__context {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
  font-size: 0.75rem;
  font-weight: 600;
}

.bk__alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
  font-size: 0.8125rem;
  font-weight: 600;
}

.bk__disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.875rem 1rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label-2);
  font-size: 0.75rem;
  line-height: 1.65;
}

.bk__disclaimer v-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

/* ══════ Tiles ══════ */
.bk__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.bk__tile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  text-align: start;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.bk__tile:hover {
  background: var(--asa-accent-soft);
  border-color: color-mix(in srgb, var(--asa-accent) 35%, transparent);
  transform: translateY(-2px);
}

.bk__tile:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.bk__tile--doc {
  flex-direction: row;
  align-items: flex-start;
  gap: 0.75rem;
}

.bk__tile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.bk__tile-body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
  flex: 1 1 auto;
}

.bk__tile-title {
  display: block;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
  line-height: 1.35;
}

.bk__tile-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  line-height: 1.5;
}

.bk__tile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.bk__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  background: var(--asa-accent);
  color: #ffffff;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.bk__skel-card {
  height: 6.5rem;
}

/* ══════ Visit type segmented control ══════ */
.bk__segs {
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bk__seg {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  height: auto;
  padding: 0.625rem 0.875rem;
  text-align: start;
}

.bk__seg-text {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
}

.bk__seg-price {
  font-size: 0.6875rem;
  font-weight: 500;
  opacity: 0.75;
}

/* ══════ Slots ══════ */
.bk__slots-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.bk__slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: 0.5rem;
}

.bk__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
}

.bk__slot:hover {
  background: var(--asa-accent-soft);
  border-color: color-mix(in srgb, var(--asa-accent) 35%, transparent);
  transform: translateY(-1px);
}

.bk__slot:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.bk__slot--on {
  background: var(--asa-accent);
  border-color: var(--asa-accent);
  box-shadow: 0 8px 18px -8px color-mix(in srgb, var(--asa-accent) 70%, transparent);
}

.bk__slot-time {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.bk__slot-end {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.bk__slot--on .bk__slot-time,
.bk__slot--on .bk__slot-end {
  color: #ffffff;
}

.bk__slot--on .bk__slot-end {
  opacity: 0.85;
}

/* ══════ Skeletons ══════ */
.bk__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bk__chip-skel {
  width: 6.5rem;
  height: 3.25rem;
  border-radius: 0.875rem;
  display: block;
}

/* ══════ Form ══════ */
.bk__form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.125rem 1rem;
}

.bk__field {
  min-width: 0;
}

.bk__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bk__input-wrap .asa-input {
  padding-inline-end: 2.75rem;
}

.bk__hand {
  position: absolute;
  inset-inline-end: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.bk__hand:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.bk__hand:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 1px;
}

.bk__err {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-rose);
}

:deep(.asa-input--err) {
  border-color: var(--asa-rose);
  background: color-mix(in srgb, var(--asa-rose) 6%, transparent);
}

:deep(.asa-input--err):focus {
  box-shadow: 0 0 0 3px var(--asa-rose-soft);
}

.bk__visit {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

/* ══════ Review ══════ */
.bk__review {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1.125rem 1rem;
  padding: 1.125rem 1.25rem;
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.bk__success {
  text-align: center;
  padding: 2.5rem 1.5rem;
}

.bk__success-mark {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.25rem;
  border-radius: 9999px;
}

.bk__success .bk__panel-desc {
  max-width: 32rem;
  margin-inline: auto;
}

.bk__success-grid {
  margin: 1.75rem 0;
  text-align: start;
}

/* ══════ Actions ══════ */
.bk__actions {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding: 0.875rem 0;
  background: linear-gradient(to top, var(--asa-bg-page, #f5f5f7) 62%, transparent);
}

.bk__actions>span {
  display: none;
}

.bk__confirm {
  padding-inline: 1.75rem;
}

@media (min-width: 640px) {
  .bk__actions>span {
    display: block;
  }
}

@media (max-width: 520px) {
  .bk__actions {
    flex-direction: column-reverse;
  }

  .bk__actions .asa-btn {
    width: 100%;
  }

  .bk__actions>span {
    display: none;
  }
}
</style>
