<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('dailyReports.title') }}</h1>
        <p class="dash-head__date">{{ t('dailyReports.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="refreshing" :aria-label="t('dailyReports.refresh')"
          @click="refreshAll">
          <v-icon size="16" :class="{ 'sc-spin': refreshing }">mdi-refresh</v-icon>
        </button>
        <button v-if="tab !== 'report'" class="asa-btn asa-btn--primary" @click="tab = 'report'">
          <v-icon size="15">mdi-plus</v-icon>
          <span>{{ t('dailyReports.tabs.report') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Segmented control ─── -->
    <div class="sc-nav">
      <div class="asa-seg" role="tablist" :aria-label="t('dailyReports.title')">
        <button v-for="tb in tabs" :key="tb.key" type="button" role="tab" :aria-selected="tab === tb.key"
          class="asa-seg__btn" :class="{ 'asa-seg__btn--on': tab === tb.key }" @click="tab = tb.key">
          {{ tb.label }}
        </button>
      </div>
    </div>

    <!-- ============================= Save report ============================= -->
    <section v-if="tab === 'report'">
      <div class="asa-card sc-card">
        <div class="sc-card__head">
          <div class="sc-card__head-copy">
            <h2 class="asa-card-title">{{ t('dailyReports.saveReport') }}</h2>
            <p class="asa-card-sub">{{ t('dailyReports.subtitle') }}</p>
          </div>
        </div>

        <div class="sc-form">
          <div class="sc-form__grid">
            <div class="sc-field">
              <span class="asa-field-label">{{ t('dailyReports.selectDate') }}</span>
              <div class="sc-date">
                <PersianDatetimePicker v-model="form.reportDate" type="date" :placeholder="t('dailyReports.selectDate')"
                  display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#5f8feb" auto-submit clearable custom-input />
              </div>
            </div>
            <div class="sc-field">
              <span class="asa-field-label">{{ t('dailyReports.patient') }}</span>
              <PatientSelector v-model="form.patientId" :patients="patients"
                :label="t('dailyReports.patient')" :placeholder="t('dailyReports.patientPlaceholder')"
                :handwriting-label="t('dailyReports.patient')" />
            </div>
          </div>

          <div v-if="selectedPatient" class="sc-callout">
            <div class="asa-tint asa-tint--indigo asa-tint--sm sc-callout__tint">
              <UserDeatils class="w-4! h-4! fill-current" />
            </div>
            <div class="sc-callout__body">
              <p class="sc-callout__title">{{ t('dailyReports.patientDetails') }}</p>
              <p class="sc-callout__meta">
                <span class="sc-callout__name">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
                <span class="sc-callout__sep" aria-hidden="true" />
                <span>{{ t('dailyReports.nationalId') }}: <span dir="ltr" class="font-mono!">{{
                  selectedPatient.nationalId }}</span></span>
                <template v-if="selectedPatient.phone">
                  <span class="sc-callout__sep" aria-hidden="true" />
                  <span>{{ t('dailyReports.phone') }}: <span dir="ltr">{{ selectedPatient.phone }}</span></span>
                </template>
                <template v-if="selectedPatient.insuranceType">
                  <span class="sc-callout__sep" aria-hidden="true" />
                  <span>{{ t('dailyReports.insurance') }}: {{ selectedPatient.insuranceType }}</span>
                </template>
              </p>
            </div>
          </div>

          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.visitTypes') }}</span>
            <v-select v-model="form.visitTypes" :items="visitTypeOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" :placeholder="t('dailyReports.visitTypesPlaceholder')" multiple chips
              clearable hide-details="auto" />
          </div>

          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.procedures') }}</span>
            <p class="sc-field__hint">{{ t('dailyReports.proceduresHint') }}</p>
            <div class="sc-procs">
              <UiClinicalCheckbox v-for="proc in PROCEDURE_ITEMS" :key="proc.key"
                v-model="form.procedures[proc.key]" :label="t(proc.labelKey)" />
            </div>
            <div v-if="form.procedures.other" class="sc-input-hw">
              <input v-model="form.otherProcedureText" type="text" class="sc-input"
                :placeholder="t('dailyReports.otherPlaceholder')" />
              <button type="button" class="sc-hw-btn" :title="t('handwriting.title')"
                :aria-label="t('handwriting.title')"
                @click="openMainHandwriting(t('dailyReports.other'), (text) => (form.otherProcedureText = text))">
                <v-icon size="17">mdi-draw-pen</v-icon>
              </button>
            </div>
          </div>

          <div class="sc-form__grid">
            <div class="sc-field">
              <span class="asa-field-label">{{ t('dailyReports.feeCollected') }}</span>
              <v-text-field v-model.number="form.feeCollected" type="number" min="0" variant="solo" density="comfortable"
                hide-details="auto" append-inner-icon="mdi-draw-pen"
                @click:append-inner="openMainHandwriting(t('dailyReports.feeCollected'), (text) => (form.feeCollected = Number(text)), true)" />
            </div>
            <div class="sc-field">
              <span class="asa-field-label">{{ t('dailyReports.paymentMethod') }}</span>
              <v-select v-model="form.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
                variant="solo" density="comfortable" hide-details="auto" />
            </div>
          </div>

          <div class="sc-field">
            <span class="asa-field-label">{{ t('common.notes') }}</span>
            <v-textarea v-model="form.notes" variant="solo" density="comfortable" rows="2" auto-grow hide-details="auto"
              append-inner-icon="mdi-draw-pen"
              @click:append-inner="openMainHandwriting(t('common.notes'), (text) => (form.notes = text))" />
          </div>

          <div class="sc-form__foot">
            <span class="sc-spacer" />
            <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="saving" @click="resetForm">
              <span>{{ t('common.cancel') }}</span>
            </button>
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving" @click="submitReport">
              <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
              <template v-else>
                <v-icon size="14">mdi-check</v-icon>
                <span>{{ t('dailyReports.saveReport') }}</span>
              </template>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================= Reports list ============================= -->
    <section v-if="tab === 'reports'">
      <div v-if="!loadedReports" class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
        <div v-for="i in 3" :key="`rm-${i}`" class="asa-skel rounded-[22px]! h-28!" />
      </div>
      <div v-else class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--teal">
            <FileText class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ pn(reports.length) }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.reportCount') }}</p>
          </div>
        </div>

        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--green">
            <Wallet class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ formatPrice(totalCollected) }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.totalCollected') }}</p>
          </div>
        </div>

        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--indigo">
            <Calculator class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ formatPrice(reportsAverage) }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.averageCollected') }}</p>
          </div>
        </div>
      </div>

      <div class="asa-card sc-card mt-5!">
        <div class="sc-card__head">
          <div class="sc-card__head-copy">
            <h2 class="asa-card-title">{{ t('dailyReports.filters') }}</h2>
            <p class="asa-card-sub">{{ reportsTitle }}</p>
          </div>
        </div>

        <div class="sc-filters">
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.fromDate') }}</span>
            <div class="sc-date">
              <PersianDatetimePicker v-model="listFilters.from" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" color="#5f8feb" auto-submit clearable custom-input />
            </div>
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.toDate') }}</span>
            <div class="sc-date">
              <PersianDatetimePicker v-model="listFilters.to" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" color="#5f8feb" auto-submit clearable custom-input />
            </div>
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.payment') }}</span>
            <v-select v-model="listFilters.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.proceduresList') }}</span>
            <v-select v-model="listFilters.procedure" :items="procedureOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.visitType') }}</span>
            <v-select v-model="listFilters.visitType" :items="visitTypeOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.patient') }}</span>
            <PatientSelector v-model="listFilters.patientId" :patients="patients"
              :label="t('dailyReports.patient')" :placeholder="t('dailyReports.patientPlaceholder')"
              :handwriting-label="t('dailyReports.patient')" />
          </div>
          <div class="sc-filters__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="loading" @click="loadReports">
              <v-icon size="14">mdi-magnify</v-icon>
              <span>{{ t('dailyReports.applyFilters') }}</span>
            </button>
            <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="loading" @click="resetFilters">
              <v-icon size="14">mdi-close</v-icon>
              <span>{{ t('dailyReports.resetFilters') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="asa-card sc-list mt-5!">
        <div class="sc-list__head">
          <h2 class="asa-card-title">{{ reportsTitle }}</h2>
          <span class="asa-pill asa-pill--teal">{{ pn(reports.length) }}</span>
        </div>

        <div v-if="loading" class="sc-skel">
          <div v-for="i in 4" :key="`lsk-${i}`" class="sc-skel__row">
            <div class="asa-skel h-10! w-10! rounded-2xl!" />
            <div class="sc-skel__lines">
              <div class="asa-skel h-3.5! w-36! rounded-md!" />
              <div class="asa-skel h-3! w-64! rounded-md! sc-skel__line-sub" />
            </div>
          </div>
        </div>

        <div v-else-if="!reports.length" class="sc-empty">
          <div class="asa-tint asa-tint--indigo sc-empty__tint">
            <ClipboardCheck class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="sc-empty__title">{{ t('dailyReports.noReports') }}</p>
            <p class="sc-empty__desc">{{ t('dailyReports.noReportsDesc') }}</p>
          </div>
        </div>

        <div v-else class="sc-list__body">
          <article v-for="report in reports" :key="report.id" class="sc-row">
            <div class="asa-tint asa-tint--teal asa-tint--sm sc-row__tint">
              <span class="sc-row__init">{{ reportInitials(report) }}</span>
            </div>
            <div class="sc-row__main">
              <p class="sc-row__name">{{ patientDisplay(report) }}</p>
              <p class="sc-row__meta">
                <span class="sc-row__date">{{ formatJalaliDateShort(report.reportDate) }}</span>
                <template v-if="report.patientNationalId">
                  <span class="sc-row__dot" aria-hidden="true" />
                  <span dir="ltr" class="font-mono!">{{ report.patientNationalId }}</span>
                </template>
                <template v-if="reportOtherText(report)">
                  <span class="sc-row__dot" aria-hidden="true" />
                  <span class="sc-row__other">{{ reportOtherText(report) }}</span>
                </template>
              </p>
              <div v-if="report.visitTypes?.length || report.procedures?.length" class="sc-row__pills">
                <span v-for="vt in report.visitTypes" :key="`vt-${vt}`" class="sc-pill sc-pill--indigo">{{ vt }}</span>
                <span v-for="p in report.procedures" :key="`pr-${p}`" class="sc-pill sc-pill--amber">{{
                  procedureLabel(p) }}</span>
              </div>
            </div>
            <div class="sc-row__end">
              <p class="sc-row__fee" dir="ltr">{{ formatPrice(report.feeCollected || '') }}</p>
              <span class="sc-pill" :class="paymentPill(report.paymentMethod)">{{ paymentLabel(report.paymentMethod)
              }}</span>
            </div>
            <button class="sc-icon-btn sc-icon-btn--danger" :title="t('common.delete')"
              :aria-label="t('common.delete')" @click="confirmDelete(report)">
              <TrashBin class="w-4! h-4! fill-current" />
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================= Visit types ============================= -->
    <section v-if="tab === 'visitTypes'">
      <div class="asa-card sc-card">
        <div class="sc-card__head">
          <div class="sc-card__head-copy">
            <h2 class="asa-card-title">{{ t('dailyReports.tabs.visitTypes') }}</h2>
            <p class="asa-card-sub">{{ t('dailyReports.visitTypesSubtitle') }}</p>
          </div>
          <div class="sc-card__head-actions">
            <v-switch v-model="includeInactive" color="#5f8feb" hide-details density="compact"
              :label="t('dailyReports.includeInactive')" />
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openVisitTypeDialog()">
              <v-icon size="14">mdi-plus</v-icon>
              <span>{{ t('dailyReports.addVisitType') }}</span>
            </button>
          </div>
        </div>

        <div v-if="visitTypesLoading" class="sc-skel">
          <div v-for="i in 4" :key="`vsk-${i}`" class="sc-skel__row">
            <div class="asa-skel h-10! w-10! rounded-2xl!" />
            <div class="sc-skel__lines">
              <div class="asa-skel h-3.5! w-32! rounded-md!" />
              <div class="asa-skel h-3! w-24! rounded-md! sc-skel__line-sub" />
            </div>
          </div>
        </div>

        <div v-else-if="!visitTypeList.length" class="sc-empty">
          <div class="asa-tint asa-tint--teal sc-empty__tint">
            <MedicalKit class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="sc-empty__title">{{ t('dailyReports.noVisitTypes') }}</p>
            <p class="sc-empty__desc">{{ t('dailyReports.noVisitTypesDesc') }}</p>
          </div>
        </div>

        <div v-else class="sc-list__body sc-vts">
          <div v-for="vt in visitTypeList" :key="vt.id" class="sc-vt">
            <span class="sc-vt__swatch" :style="{ backgroundColor: vt.color || '#cbd5e1' }" aria-hidden="true" />
            <div class="sc-vt__main">
              <p class="sc-vt__name">{{ vt.name }}</p>
              <p v-if="vt.description" class="sc-vt__desc">{{ vt.description }}</p>
            </div>
            <span class="sc-vt__price" dir="ltr">{{ formatPrice(vt.price || '') }}</span>
            <v-switch :model-value="vt.isActive" color="#16A34A" hide-details density="compact"
              :aria-label="vt.isActive ? t('dailyReports.active') : t('dailyReports.inactive')"
              @update:model-value="toggleVisitType(vt)" />
            <div class="sc-vt__actions">
              <button class="sc-icon-btn" :title="t('common.edit')" :aria-label="t('common.edit')"
                @click="openVisitTypeDialog(vt)">
                <v-icon size="16">mdi-pencil-outline</v-icon>
              </button>
              <button class="sc-icon-btn sc-icon-btn--danger" :title="t('common.delete')"
                :aria-label="t('common.delete')" @click="confirmVisitTypeDelete(vt)">
                <TrashBin class="w-4! h-4! fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Visit type add/edit dialog -->
      <v-dialog v-model="visitTypeDialog" max-width="480" persistent transition="dialog-bottom-transition">
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ visitTypeFormId ? t('dailyReports.editVisitType') : t('dailyReports.addVisitType') }}</h2>
              <span class="asa-dialog__sub">{{ t('dailyReports.visitTypes') }}</span>
            </div>
            <button class="sc-x" :aria-label="t('common.close')" @click="visitTypeDialog = false">
              <v-icon size="18">mdi-close</v-icon>
            </button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="sc-fields">
              <div class="sc-field">
                <span class="asa-field-label">{{ t('dailyReports.visitTypeName') }}</span>
                <v-text-field v-model="visitTypeForm.name" :placeholder="t('dailyReports.visitTypeNamePlaceholder')"
                  variant="solo" density="comfortable" hide-details="auto" append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openVtHandwriting(t('dailyReports.visitTypeName'), (text) => (visitTypeForm.name = text))" />
              </div>
              <div class="sc-field">
                <span class="asa-field-label">{{ t('dailyReports.description') }}</span>
                <v-textarea v-model="visitTypeForm.description" variant="solo" density="comfortable" rows="2" auto-grow
                  hide-details="auto" append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openVtHandwriting(t('dailyReports.description'), (text) => (visitTypeForm.description = text))" />
              </div>
              <div class="sc-field sc-field--row">
                <div class="sc-field">
                  <span class="asa-field-label">{{ t('dailyReports.price') }}</span>
                  <v-text-field v-model.number="visitTypeForm.price" type="number" min="0" variant="solo"
                    density="comfortable" hide-details="auto" append-inner-icon="mdi-draw-pen"
                    @click:append-inner="openVtHandwriting(t('dailyReports.price'), (text) => (visitTypeForm.price = Number(text)), true)" />
                </div>
                <div class="sc-field">
                  <span class="asa-field-label">{{ t('dailyReports.color') }}</span>
                  <div class="sc-color">
                    <input v-model="visitTypeForm.color" type="color"
                      class="sc-color__input" :aria-label="t('dailyReports.color')" />
                    <span dir="ltr" class="font-mono! sc-color__hex">{{ visitTypeForm.color }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="visitTypeDialog = false">
              <span>{{ t('common.cancel') }}</span>
            </button>
            <v-spacer />
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingVisitType" @click="saveVisitType">
              <v-progress-circular v-if="savingVisitType" indeterminate size="16" width="2" color="#ffffff" />
              <template v-else>
                <v-icon size="14">mdi-check</v-icon>
                <span>{{ t('common.save') }}</span>
              </template>
            </button>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </section>

    <!-- ============================= Stats ============================= -->
    <section v-if="tab === 'stats'">
      <div v-if="!loadedStats" class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
        <div v-for="i in 3" :key="`sm-${i}`" class="asa-skel rounded-[22px]! h-28!" />
      </div>
      <div v-else class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--teal">
            <FileText class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ pn(stats?.totalReports ?? 0) }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.reportCount') }}</p>
          </div>
        </div>

        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--green">
            <Wallet class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ formatPrice(stats?.totalCollected || '0') }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.totalCollected') }}</p>
          </div>
        </div>

        <div class="asa-card sc-metric">
          <div class="asa-tint asa-tint--indigo">
            <Calculator class="w-5! h-5! fill-current" />
          </div>
          <div class="sc-metric__copy">
            <p class="sc-metric__value">{{ formatPrice(stats?.average || '0') }}</p>
            <p class="sc-metric__label">{{ t('dailyReports.averageCollected') }}</p>
          </div>
        </div>
      </div>

      <div class="asa-card sc-card mt-5!">
        <div class="sc-card__head">
          <div class="sc-card__head-copy">
            <h2 class="asa-card-title">{{ t('dailyReports.filters') }}</h2>
            <p class="asa-card-sub">{{ t('dailyReports.tabs.stats') }}</p>
          </div>
        </div>

        <div class="sc-filters">
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.fromDate') }}</span>
            <div class="sc-date">
              <PersianDatetimePicker v-model="statsFilters.from" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" color="#5f8feb" auto-submit clearable custom-input />
            </div>
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.toDate') }}</span>
            <div class="sc-date">
              <PersianDatetimePicker v-model="statsFilters.to" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" color="#5f8feb" auto-submit clearable custom-input />
            </div>
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.payment') }}</span>
            <v-select v-model="statsFilters.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.proceduresList') }}</span>
            <v-select v-model="statsFilters.procedure" :items="procedureOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.visitType') }}</span>
            <v-select v-model="statsFilters.visitType" :items="visitTypeOptions" item-title="label" item-value="value"
              variant="solo" density="comfortable" hide-details="auto" clearable />
          </div>
          <div class="sc-field">
            <span class="asa-field-label">{{ t('dailyReports.patient') }}</span>
            <PatientSelector v-model="statsFilters.patientId" :patients="patients"
              :label="t('dailyReports.patient')" :placeholder="t('dailyReports.patientPlaceholder')"
              :handwriting-label="t('dailyReports.patient')" />
          </div>
          <div class="sc-filters__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="statsLoading" @click="loadStats">
              <v-icon size="14">mdi-magnify</v-icon>
              <span>{{ t('dailyReports.applyFilters') }}</span>
            </button>
            <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="statsLoading" @click="resetStatsFilters">
              <v-icon size="14">mdi-close</v-icon>
              <span>{{ t('dailyReports.resetFilters') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="statsLoading" class="sc-skel sc-skel--stats mt-5!">
        <div v-for="i in 4" :key="`ssk-${i}`" class="sc-skel__row">
          <div class="asa-skel h-3.5! w-40! rounded-md!" />
          <div class="asa-skel h-3.5! flex-1! rounded-md!" />
        </div>
      </div>
      <div v-else-if="!stats || stats.totalReports === 0" class="asa-card mt-5!">
        <div class="sc-empty">
          <div class="asa-tint asa-tint--indigo sc-empty__tint">
            <LineChart class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="sc-empty__title">{{ t('dailyReports.noStats') }}</p>
            <p class="sc-empty__desc">{{ t('dailyReports.noStatsDesc') }}</p>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="sc-break-grid mt-5!">
          <div v-if="stats.byDay?.length" class="asa-card sc-break">
            <h3 class="sc-break__title">{{ t('dailyReports.byDay') }}</h3>
            <table class="sc-table">
              <thead>
                <tr>
                  <th>{{ t('dailyReports.selectDate') }}</th>
                  <th class="!text-center!">{{ t('dailyReports.count') }}</th>
                  <th class="!text-end!">{{ t('dailyReports.totalCollected') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in stats.byDay" :key="row.date">
                  <td class="whitespace-nowrap!">{{ formatJalaliDateShort(row.date) }}</td>
                  <td class="!text-center! sc-table__num">{{ pn(row.count) }}</td>
                  <td class="!text-end! sc-table__num" dir="ltr">{{ formatPrice(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="stats.byPaymentMethod?.length" class="asa-card sc-break">
            <h3 class="sc-break__title">{{ t('dailyReports.byPaymentMethod') }}</h3>
            <table class="sc-table">
              <thead>
                <tr>
                  <th>{{ t('dailyReports.payment') }}</th>
                  <th class="!text-center!">{{ t('dailyReports.count') }}</th>
                  <th class="!text-end!">{{ t('dailyReports.totalCollected') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in stats.byPaymentMethod" :key="row.payment_method">
                  <td>
                    <span class="sc-pill" :class="paymentPill(row.payment_method)">{{
                      paymentLabel(row.payment_method) }}</span>
                  </td>
                  <td class="!text-center! sc-table__num">{{ pn(row.count) }}</td>
                  <td class="!text-end! sc-table__num" dir="ltr">{{ formatPrice(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="stats.byProcedure?.length" class="asa-card sc-break">
            <h3 class="sc-break__title">{{ t('dailyReports.byProcedure') }}</h3>
            <table class="sc-table">
              <thead>
                <tr>
                  <th>{{ t('dailyReports.proceduresList') }}</th>
                  <th class="!text-center!">{{ t('dailyReports.count') }}</th>
                  <th class="!text-end!">{{ t('dailyReports.totalCollected') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in stats.byProcedure" :key="row.procedure">
                  <td>
                    <span class="sc-pill sc-pill--amber">{{ procedureLabel(row.procedure) }}</span>
                  </td>
                  <td class="!text-center! sc-table__num">{{ pn(row.count) }}</td>
                  <td class="!text-end! sc-table__num" dir="ltr">{{ formatPrice(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="stats.byVisitType?.length" class="asa-card sc-break">
            <h3 class="sc-break__title">{{ t('dailyReports.byVisitType') }}</h3>
            <table class="sc-table">
              <thead>
                <tr>
                  <th>{{ t('dailyReports.visitType') }}</th>
                  <th class="!text-center!">{{ t('dailyReports.count') }}</th>
                  <th class="!text-end!">{{ t('dailyReports.totalCollected') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in stats.byVisitType" :key="row.name">
                  <td class="sc-table__name">{{ row.name }}</td>
                  <td class="!text-center! sc-table__num">{{ pn(row.count) }}</td>
                  <td class="!text-end! sc-table__num" dir="ltr">{{ formatPrice(row.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </section>

    <!-- ─── Delete report confirm ─── -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('dailyReports.deleteConfirm') }}</h2>
            <span class="asa-dialog__sub">{{ t('dailyReports.noReportsDesc') }}</span>
          </div>
          <button class="sc-x" :aria-label="t('common.close')" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="deleteDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="deleting" @click="executeDelete">
            <v-progress-circular v-if="deleting" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-trash-can-outline</v-icon>
              <span>{{ t('common.delete') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete visit type confirm ─── -->
    <v-dialog v-model="visitTypeDeleteDialog" max-width="400" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('dailyReports.visitTypeDeleteConfirm') }}</h2>
            <span class="asa-dialog__sub">{{ t('dailyReports.noVisitTypesDesc') }}</span>
          </div>
          <button class="sc-x" :aria-label="t('common.close')" @click="visitTypeDeleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="visitTypeDeleteDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="deletingVisitType" @click="executeVisitTypeDelete">
            <v-progress-circular v-if="deletingVisitType" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-trash-can-outline</v-icon>
              <span>{{ t('common.delete') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="mainHandwritingOpen" :label="mainHandwritingLabel" :numeric="mainHandwritingNumeric"
      @insert="applyMainHandwriting" />
    <HandwritingDialog v-model="vtHandwritingOpen" :label="vtHandwritingLabel" :numeric="vtHandwritingNumeric"
      @insert="applyVtHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type {
  DailyReport,
  DailyReportListFilters,
  DailyReportStats,
  DailyReportStatsFilters,
  DailyReportVisitType,
  PaymentMethod,
  PatientOption,
  ProcedureKey,
} from '~/types/report'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import FileText from '~/components/icons/FileText.vue'
import Wallet from '~/components/icons/Wallet.vue'
import Calculator from '~/components/icons/Calculator.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import LineChart from '~/components/icons/LineChart.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import UserDeatils from '~/components/icons/UserDeatils.vue'

const { t } = useI18n()
const { pn } = useLang()
const { $toast } = useNuxtApp()
const { formatPrice, formatJalaliDateShort, toDateStr } = useFormatting()
const {
  listPatients,
  listVisitTypes,
  listReports,
  listStats,
  createReport,
  deleteReport,
  createVisitType,
  updateVisitType,
  deleteVisitType,
} = useDailyReports()

const PROCEDURE_ITEMS: { key: ProcedureKey; labelKey: string }[] = [
  { key: 'mixed_laser', labelKey: 'dailyReports.mixedLaser' },
  { key: 'single_laser', labelKey: 'dailyReports.singleLaser' },
  { key: 'colonoscopy', labelKey: 'dailyReports.colonoscopy' },
  { key: 'co2_test', labelKey: 'dailyReports.co2Test' },
  { key: 'other', labelKey: 'dailyReports.other' },
]

const paymentOptions = computed(() => [
  { value: 'card_terminal' as PaymentMethod, label: t('dailyReports.cardTerminal') },
  { value: 'cash' as PaymentMethod, label: t('dailyReports.cash') },
])

const procedureOptions = computed(() =>
  PROCEDURE_ITEMS.map((p) => ({ value: p.key, label: t(p.labelKey) }))
)

const tabs = computed(() => [
  { key: 'report', label: t('dailyReports.tabs.report') },
  { key: 'reports', label: t('dailyReports.tabs.reports') },
  { key: 'visitTypes', label: t('dailyReports.tabs.visitTypes') },
  { key: 'stats', label: t('dailyReports.tabs.stats') },
])

const tab = ref('report')

const emptyForm = () => ({
  reportDate: toDateStr(new Date()),
  patientId: null as string | null,
  visitTypes: [] as string[],
  procedures: {
    mixed_laser: false,
    single_laser: false,
    colonoscopy: false,
    co2_test: false,
    other: false,
  } as Record<ProcedureKey, boolean>,
  otherProcedureText: '',
  feeCollected: null as number | null,
  paymentMethod: 'card_terminal' as PaymentMethod,
  notes: '',
})

const firstOfMonthStr = () => {
  const now = new Date()
  return toDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
}

const form = ref(emptyForm())
const patients = ref<PatientOption[]>([])
const visitTypes = ref<DailyReportVisitType[]>([])
const reports = ref<DailyReport[]>([])
const loading = ref(false)
const loadedReports = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteDialog = ref(false)
const deleteTarget = ref<DailyReport | null>(null)

const listFilters = reactive<DailyReportListFilters>({
  from: toDateStr(new Date()),
  to: toDateStr(new Date()),
  paymentMethod: undefined,
  procedure: undefined,
  visitType: undefined,
  patientId: undefined,
})

const stats = ref<DailyReportStats | null>(null)
const statsFilters = reactive<DailyReportStatsFilters>({
  from: firstOfMonthStr(),
  to: toDateStr(new Date()),
  paymentMethod: undefined,
  procedure: undefined,
  visitType: undefined,
  patientId: undefined,
})
const statsLoading = ref(false)
const loadedStats = ref(false)

const refreshing = computed(() =>
  (tab.value === 'reports' && loading.value) ||
  (tab.value === 'visitTypes' && visitTypesLoading.value) ||
  (tab.value === 'stats' && statsLoading.value)
)

const mainHandwritingOpen = ref(false)
const mainHandwritingLabel = ref('')
const mainHandwritingNumeric = ref(false)
const mainHandwritingCallback = ref<((text: string) => void) | null>(null)

function openMainHandwriting(label: string, callback: (text: string) => void, numeric = false) {
  mainHandwritingLabel.value = label
  mainHandwritingCallback.value = callback
  mainHandwritingNumeric.value = numeric
  mainHandwritingOpen.value = true
}

function applyMainHandwriting(text: string) {
  mainHandwritingCallback.value?.(text)
}

const selectedPatient = computed(() => patients.value.find((p) => p.id === form.value.patientId) || null)

const activeVisitTypes = computed(() => (visitTypes.value || []).filter((vt) => vt.isActive))

const visitTypeOptions = computed(() =>
  activeVisitTypes.value.map((vt) => ({ value: vt.name, label: vt.name }))
)

const reportsTitle = computed(() => {
  const { from, to } = listFilters
  if (from && to && from === to) {
    return t('dailyReports.reportsForDate', { date: formatJalaliDateShort(from) })
  }
  if (from && to) {
    return t('dailyReports.dateRange', { from: formatJalaliDateShort(from), to: formatJalaliDateShort(to) })
  }
  return t('dailyReports.tabs.reports')
})

const totalCollected = computed(() =>
  reports.value.reduce((sum, r) => sum + (parseFloat(r.feeCollected || '') || 0), 0)
)

const reportsAverage = computed(() => {
  const count = reports.value.length
  if (count === 0) return 0
  return Math.round((totalCollected.value / count) * 100) / 100
})

const reportInitials = (report: DailyReport) => {
  const name = [report.patientFirstName, report.patientLastName].filter(Boolean).join(' ').trim()
  return name ? name.charAt(0) : '?'
}

const reportOtherText = (report: DailyReport) => report.otherProcedureText || ''

const patientDisplay = (report: DailyReport) => {
  const name = [report.patientFirstName, report.patientLastName].filter(Boolean).join(' ').trim()
  return name || t('dailyReports.deletedPatient')
}

const procedureLabel = (key: string) => {
  const map: Record<string, string> = {
    mixed_laser: 'dailyReports.mixedLaser',
    single_laser: 'dailyReports.singleLaser',
    colonoscopy: 'dailyReports.colonoscopy',
    co2_test: 'dailyReports.co2Test',
    other: 'dailyReports.other',
  }
  return t(map[key] || 'dailyReports.other')
}

const paymentPill = (method: string) =>
  method === 'card_terminal' ? 'sc-pill--green' : 'sc-pill--amber'

const paymentLabel = (method: string) =>
  method === 'card_terminal' ? t('dailyReports.cardTerminal') : t('dailyReports.cash')

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { error?: string } } | undefined)?.data?.error || fallback

const resetForm = () => {
  form.value = emptyForm()
}

const resetFilters = () => {
  listFilters.from = toDateStr(new Date())
  listFilters.to = toDateStr(new Date())
  listFilters.paymentMethod = undefined
  listFilters.procedure = undefined
  listFilters.visitType = undefined
  listFilters.patientId = undefined
  loadReports()
}

const resetStatsFilters = () => {
  statsFilters.from = firstOfMonthStr()
  statsFilters.to = toDateStr(new Date())
  statsFilters.paymentMethod = undefined
  statsFilters.procedure = undefined
  statsFilters.visitType = undefined
  statsFilters.patientId = undefined
  loadStats()
}

const loadPatients = async () => {
  try {
    const res = await listPatients()
    patients.value = res.data || []
  } catch {
    $toast.error(t('dailyReports.fetchPatientsError'))
  }
}

const loadActiveVisitTypes = async () => {
  try {
    const res = await listVisitTypes()
    visitTypes.value = res.data || []
  } catch {
    $toast.error(t('dailyReports.fetchVisitTypesError'))
  }
}

const loadReports = async () => {
  loading.value = true
  try {
    const res = await listReports(listFilters)
    reports.value = res.data || []
  } catch {
    $toast.error(t('dailyReports.fetchReportsError'))
  } finally {
    loading.value = false
    loadedReports.value = true
  }
}

const submitReport = async () => {
  if (!form.value.patientId) {
    $toast.error(t('dailyReports.selectPatientRequired'))
    return
  }
  if (form.value.procedures.other && !form.value.otherProcedureText.trim()) {
    $toast.error(t('dailyReports.otherRequired'))
    return
  }
  saving.value = true
  try {
    const res = await createReport({
      reportDate: form.value.reportDate,
      patientId: form.value.patientId,
      visitTypes: form.value.visitTypes,
      procedures: (Object.keys(form.value.procedures).filter((k) => form.value.procedures[k as ProcedureKey]) as ProcedureKey[]),
      otherProcedureText: form.value.procedures.other ? form.value.otherProcedureText.trim() : null,
      feeCollected: form.value.feeCollected || null,
      paymentMethod: form.value.paymentMethod,
      notes: form.value.notes.trim() || null,
    })
    if (res.success) {
      $toast.success(t('dailyReports.saveSuccess'))
      resetForm()
      await loadReports()
      if (stats.value) await loadStats()
    }
  } catch (err: unknown) {
    $toast.error(getErrorMessage(err, t('dailyReports.saveError')))
  } finally {
    saving.value = false
  }
}

const confirmDelete = (report: DailyReport) => {
  deleteTarget.value = report
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await deleteReport(deleteTarget.value.id)
    if (res.success) {
      $toast.success(t('dailyReports.deleted'))
      deleteDialog.value = false
      deleteTarget.value = null
      await loadReports()
      if (stats.value) await loadStats()
    }
  } catch (err: unknown) {
    $toast.error(getErrorMessage(err, t('dailyReports.deleteError')))
  } finally {
    deleting.value = false
  }
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    const res = await listStats(statsFilters)
    stats.value = res.data || null
  } catch {
    $toast.error(t('dailyReports.fetchStatsError'))
  } finally {
    statsLoading.value = false
    loadedStats.value = true
  }
}

// ---- Visit type management ----
const visitTypeList = ref<DailyReportVisitType[]>([])
const includeInactive = ref(false)
const visitTypesLoading = ref(false)
const visitTypeDialog = ref(false)
const savingVisitType = ref(false)
const visitTypeFormId = ref<string | null>(null)
const visitTypeDeleteDialog = ref(false)
const deletingVisitType = ref(false)
const visitTypeDeleteTarget = ref<DailyReportVisitType | null>(null)

const vtHandwritingOpen = ref(false)
const vtHandwritingLabel = ref('')
const vtHandwritingNumeric = ref(false)
const vtHandwritingCallback = ref<((text: string) => void) | null>(null)

function openVtHandwriting(label: string, callback: (text: string) => void, numeric = false) {
  vtHandwritingLabel.value = label
  vtHandwritingCallback.value = callback
  vtHandwritingNumeric.value = numeric
  vtHandwritingOpen.value = true
}

function applyVtHandwriting(text: string) {
  vtHandwritingCallback.value?.(text)
}

const emptyVisitTypeForm = () => ({
  name: '',
  description: '',
  price: null as number | null,
  color: '#5f8feb',
})

const visitTypeForm = ref(emptyVisitTypeForm())

const loadVisitTypeList = async () => {
  visitTypesLoading.value = true
  try {
    const res = await listVisitTypes(includeInactive.value)
    visitTypeList.value = res.data || []
  } catch {
    $toast.error(t('dailyReports.fetchVisitTypesError'))
  } finally {
    visitTypesLoading.value = false
  }
}

watch(includeInactive, () => loadVisitTypeList())

const openVisitTypeDialog = (visitType?: DailyReportVisitType) => {
  visitTypeFormId.value = visitType?.id || null
  visitTypeForm.value = visitType
    ? {
        name: visitType.name,
        description: visitType.description || '',
        price: visitType.price != null ? Number(visitType.price) : null,
        color: visitType.color || '#5f8feb',
      }
    : emptyVisitTypeForm()
  visitTypeDialog.value = true
}

const saveVisitType = async () => {
  if (!visitTypeForm.value.name.trim()) {
    $toast.error(t('dailyReports.visitTypeNameRequired'))
    return
  }
  savingVisitType.value = true
  try {
    const payload = {
      name: visitTypeForm.value.name.trim(),
      description: visitTypeForm.value.description.trim() || null,
      price: visitTypeForm.value.price ?? null,
      color: visitTypeForm.value.color || null,
    }
    const res = visitTypeFormId.value
      ? await updateVisitType(visitTypeFormId.value, payload)
      : await createVisitType(payload)
    if (res.success) {
      $toast.success(t('dailyReports.visitTypeSaveSuccess'))
      visitTypeDialog.value = false
      await loadVisitTypeList()
      await loadActiveVisitTypes()
    }
  } catch (err: unknown) {
    $toast.error(getErrorMessage(err, t('dailyReports.visitTypeSaveError')))
  } finally {
    savingVisitType.value = false
  }
}

const toggleVisitType = async (visitType: DailyReportVisitType) => {
  try {
    const res = await updateVisitType(visitType.id, { isActive: !visitType.isActive })
    if (res.success) {
      await loadVisitTypeList()
      await loadActiveVisitTypes()
    }
  } catch (err: unknown) {
    $toast.error(getErrorMessage(err, t('dailyReports.visitTypeSaveError')))
  }
}

const confirmVisitTypeDelete = (visitType: DailyReportVisitType) => {
  visitTypeDeleteTarget.value = visitType
  visitTypeDeleteDialog.value = true
}

const executeVisitTypeDelete = async () => {
  if (!visitTypeDeleteTarget.value) return
  deletingVisitType.value = true
  try {
    const res = await deleteVisitType(visitTypeDeleteTarget.value.id)
    if (res.success) {
      $toast.success(t('dailyReports.visitTypeDeleted'))
      visitTypeDeleteDialog.value = false
      visitTypeDeleteTarget.value = null
      await loadVisitTypeList()
      await loadActiveVisitTypes()
    }
  } catch (err: unknown) {
    $toast.error(getErrorMessage(err, t('dailyReports.visitTypeDeleteError')))
  } finally {
    deletingVisitType.value = false
  }
}

const refreshAll = () => {
  if (tab.value === 'reports') loadReports()
  else if (tab.value === 'visitTypes') loadVisitTypeList()
  else if (tab.value === 'stats') loadStats()
  else loadPatients()
}

watch(tab, (value) => {
  if (value === 'reports') loadReports()
  else if (value === 'visitTypes') loadVisitTypeList()
  else if (value === 'stats') loadStats()
})

onMounted(() => {
  loadPatients()
  loadActiveVisitTypes()
})

useSeoMeta({
  title: t('dashboard.dailyReports'),
})
</script>

<style scoped>
/* ── Header refresh spinner ────────────────────── */
.sc-spin {
  animation: sc-spin 800ms linear infinite;
}

@keyframes sc-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Nav / segmented control ───────────────────── */
.sc-nav {
  display: flex;
  margin-bottom: 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.sc-nav::-webkit-scrollbar {
  display: none;
}

.asa-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.asa-seg__btn {
  height: 2rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.asa-seg__btn:hover {
  color: var(--asa-label);
}

.asa-seg__btn--on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.1);
}

.dark .asa-seg__btn--on {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* ── Metric cards ──────────────────────────────── */
.sc-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
}

.sc-metric__copy {
  min-width: 0;
}

.sc-metric__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.sc-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* ── Shared card chrome ────────────────────────── */
.sc-card {
  padding: 0;
  overflow: visible;
}

.sc-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.375rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
  border-start-start-radius: 1.375rem;
  border-start-end-radius: 1.375rem;
}

.sc-card__head-copy {
  min-width: 0;
}

.sc-card__head-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* ── Form ──────────────────────────────────────── */
.sc-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

.sc-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.sc-form__foot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--asa-sep);
}

.sc-spacer {
  flex: 1;
}

.sc-field__hint {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

.sc-procs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 0.75rem;
}

.sc-input {
  width: 100%;
  margin-top: 0.75rem;
  height: 2.75rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.sc-input-hw {
  position: relative;
  margin-top: 0.75rem;
}

.sc-input-hw .sc-input {
  margin-top: 0;
  padding-inline-end: 2.75rem;
}

.sc-hw-btn {
  position: absolute;
  inset-inline-end: 0.375rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.sc-hw-btn:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.sc-input:focus {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.sc-input::placeholder {
  color: var(--asa-label-3);
}

/* Vuetify fields inside our form/filters (solo variant, token-toned) */
.sc-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.sc-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.sc-field :deep(.v-field__overlay) {
  background: transparent;
}

.sc-field :deep(.v-field__input),
.sc-field :deep(.v-field__input::placeholder),
.sc-field :deep(.v-label),
.sc-field :deep(.v-select__selection) {
  color: var(--asa-label);
}

.sc-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.sc-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.sc-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

.sc-field :deep(.v-field--variant-solo .v-field__outline) {
  display: none;
}

/* Persian date picker input */
.sc-date :deep(.vpd-input-group) {
  display: block;
}

.sc-date :deep(.vpd-input-group input) {
  /* width: 100%; */
  height: 2.75rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.sc-date :deep(.vpd-input-group input:focus) {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.sc-date :deep(.vpd-icon-btn) {
  display: none;
}

/* ── Patient callout ───────────────────────────── */
.sc-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.sc-callout__tint {
  margin-top: 0.125rem;
}

.sc-callout__body {
  min-width: 0;
}

.sc-callout__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-callout__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.875rem;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

.sc-callout__name {
  font-weight: 600;
  color: var(--asa-label);
}

.sc-callout__sep {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

/* ── Filters row ───────────────────────────────── */
.sc-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  align-items: end;
  gap: 1rem 1.25rem;
  padding: 1.25rem 1.5rem;
}

.sc-filters__actions {
  display: flex;
  gap: 0.5rem;
}

/* ── List ──────────────────────────────────────── */
.sc-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
}

.sc-list__body {
  display: flex;
  flex-direction: column;
}

/* Skeleton rows */
.sc-skel {
  padding: 0.875rem 1.5rem;
}

.sc-skel--stats {
  border-top: 1px solid var(--asa-sep);
}

.sc-skel__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 0;
}

.sc-skel__row + .sc-skel__row {
  border-top: 1px solid var(--asa-sep);
}

.sc-skel__lines {
  flex: 1;
  min-width: 0;
}

.sc-skel__line-sub {
  margin-top: 0.5rem;
}

/* Empty state */
.sc-empty {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.25rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
}

.sc-empty__tint {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.125rem;
  flex-shrink: 0;
}

.sc-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-empty__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* Report rows */
.sc-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.5rem;
}

.sc-row + .sc-row {
  border-top: 1px solid var(--asa-sep);
}

.sc-row__tint {
  font-weight: 700;
}

.sc-row__init {
  font-size: 0.875rem;
  color: inherit;
}

.sc-row__main {
  min-width: 0;
}

.sc-row__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.sc-row__date {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.sc-row__dot {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.sc-row__other {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--asa-label-3);
}

.sc-row__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.sc-row__end {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
}

.sc-row__fee {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

/* Pills (scoped, token based) */
.sc-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.sc-pill--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .sc-pill--teal {
  color: var(--asa-accent);
}

.sc-pill--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.sc-pill--amber {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.sc-pill--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.sc-pill--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

/* Icon buttons */
.sc-icon-btn {
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
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.sc-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.sc-icon-btn--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.sc-icon-btn:active {
  transform: scale(0.92);
}

/* ── Visit types ───────────────────────────────── */
.sc-vts {
  padding: 0.5rem 1.5rem;
}

.sc-vt {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0;
}

.sc-vt + .sc-vt {
  border-top: 1px solid var(--asa-sep);
}

.sc-vt__swatch {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.625rem;
  border: 1px solid color-mix(in srgb, var(--asa-label) 10%, transparent);
  flex-shrink: 0;
}

.sc-vt__main {
  min-width: 0;
}

.sc-vt__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-vt__desc {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-vt__price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sc-vt__actions {
  display: flex;
  gap: 0.25rem;
}

/* ── Stats breakdown ───────────────────────────── */
.sc-break-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
  gap: 1.25rem;
}

.sc-break {
  padding: 0;
  overflow: hidden;
}

.sc-break__title {
  padding: 1.125rem 1.25rem 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-table {
  width: 100%;
  border-collapse: collapse;
}

.sc-table th {
  padding: 0.5rem 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: start;
  color: var(--asa-label-3);
  border-bottom: 1px solid var(--asa-sep);
}

.sc-table td {
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-bottom: 1px solid color-mix(in srgb, var(--asa-sep) 60%, transparent);
  vertical-align: middle;
}

.sc-table tr:last-child td {
  border-bottom: none;
}

.sc-table tbody tr:last-child td {
  padding-bottom: 1.125rem;
}

.sc-table__num {
  font-variant-numeric: tabular-nums;
}

.sc-table__name {
  font-weight: 600;
}

/* ── Dialog helpers ────────────────────────────── */
.sc-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.sc-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.sc-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sc-field--row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.sc-color {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  height: 2.875rem;
  padding: 0 0.75rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.sc-color__input {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
}

.sc-color__hex {
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Responsive tuning ─────────────────────────── */
@media (max-width: 719px) {
  .sc-form__grid,
  .sc-field--row {
    grid-template-columns: 1fr;
  }

  .sc-row {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .sc-row__end {
    grid-column: 2;
    grid-row: 2;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .sc-vt {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .sc-vt__price,
  .sc-vt .v-switch {
    grid-column: 2;
  }

  .sc-vt__actions {
    grid-column: 3;
    grid-row: 1 / span 2;
    align-self: center;
  }
}

@media (max-width: 479px) {
  .sc-card__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .sc-filters {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-spin {
    animation: none;
  }
}
</style>