<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head lr-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('labResults.title') }}</h1>
        <p class="dash-head__date">{{ t('labResults.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="asa-btn asa-btn--primary" @click="openResultDialog">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('labResults.addLabResult') }}
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════
         WORKSTATION  (no patient selected yet)
    ═══════════════════════════════════════════ -->
    <section v-if="!selectedPatient" class="asa-sec">
      <p class="asa-sec__label">{{ t('labResults.workstationLabel') }}</p>
      <div class="asa-card lr-workstation">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <Microscope class="w-8! h-8! fill-current" />
        </span>
        <div class="lr-workstation__copy">
          <p class="lr-workstation__title">{{ t('labResults.workstationTitle') }}</p>
          <p class="lr-workstation__sub">{{ t('labResults.workstationDesc') }}</p>
        </div>

        <div class="lr-workstation__search">
          <div class="asa-field asa-field--search lr-search-field">
            <v-text-field v-model="patientSearchQuery" variant="solo" density="comfortable" hide-details clearable
              :placeholder="t('labResults.searchPlaceholder')" prepend-inner-icon="mdi-magnify"
              :loading="patientSearching" @update:model-value="onPatientSearchInput" />
          </div>
        </div>

        <!-- Matching patient grid -->
        <div v-if="patientSearchResults.length" class="lr-patients">
          <button v-for="p in patientSearchResults" :key="p.id" type="button"
            class="lr-patient" @click="selectPatient(p)">
            <span class="asa-tint sc-avatar sc-avatar--sm" :class="patientResultTint(p)">
              {{ patientResultInitials(p) }}
            </span>
            <span class="min-w-0">
              <span class="lr-patient__name block truncate!">{{ p.firstName }} {{ p.lastName }}</span>
              <span class="block crm-ltr font-mono text-[0.6875rem]! tracking-wider! lr-muted">
                {{ p.nationalId }}
                <template v-if="p.phone"> · {{ p.phone }}</template>
              </span>
            </span>
            <v-icon size="16" class="lr-patient__arrow">mdi-chevron-left</v-icon>
          </button>
        </div>

        <p v-else-if="searchedOnce && !patientSearching" class="lr-muted lr-no-match">
          <span class="asa-dot-inline me-1.5! inline-block align-middle!" aria-hidden="true" />
          {{ t('labResults.noPatientsFound') }}
        </p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         WORKSPACE  (patient selected)
    ═══════════════════════════════════════════ -->
    <template v-else>
      <!-- Patient record card -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('labResults.patientRecordLabel') }}</p>
        <div class="asa-card lr-patient-card">
          <span class="asa-tint sc-avatar sc-avatar--lg" :class="patientTint(selectedPatient)">
            {{ patientInitials(selectedPatient) }}
          </span>
          <div class="min-w-0 flex-1!">
            <p class="flex items-center flex-wrap gap-2! min-w-0">
              <span class="lr-patient-card__name">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
              <span class="asa-pill asa-pill--teal">{{ t('labResults.activeFile') }}</span>
            </p>
            <p class="lr-patient-card__meta">
              <span class="crm-ltr font-mono tracking-wider!">{{ selectedPatient.nationalId }}</span>
              <span v-if="selectedPatient.phone" class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
              <span v-if="selectedPatient.phone" class="crm-ltr font-mono">{{ selectedPatient.phone }}</span>
            </p>
          </div>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearPatient">
            <v-icon size="14">mdi-account-switch</v-icon>
            {{ t('labResults.changePatient') }}
          </button>
        </div>
      </section>

      <!-- Overview metrics -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('labResults.overview') }}</p>
        <div class="lr-metrics">
          <article v-for="m in metrics" :key="m.key" class="asa-card lr-metric">
            <span class="asa-tint" :class="m.tint" aria-hidden="true">
              <component :is="m.icon" class="w-5! h-5! fill-current" />
            </span>
            <div class="lr-metric__copy">
              <p class="lr-metric__value">{{ m.value }}</p>
              <p class="lr-metric__label">{{ m.label }}</p>
            </div>
            <p class="lr-metric__foot">
              <span class="lr-dot" :class="m.dot" aria-hidden="true" />
              {{ m.foot }}
            </p>
          </article>
        </div>
      </section>

      <!-- ─── Frosted sticky control deck: category chips + search / count / actions ─── -->
      <div class="asa-toolbar lr-toolbar">
        <nav class="lr-chips" :aria-label="t('labResults.title')">
          <button v-for="chip in categoryChips" :key="chip.key" type="button" class="lr-chip"
            :class="{ 'lr-chip--active': activeCategory === chip.key }" @click="activeCategory = chip.key">
            {{ chip.label }}
            <span class="lr-chip__count" :class="{ 'lr-chip__count--active': activeCategory === chip.key }">
              {{ chip.count }}
            </span>
          </button>
        </nav>
        <div class="lr-toolbar__row">
          <div class="asa-field asa-field--search">
            <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
              :placeholder="t('labResults.searchResultPlaceholder')" prepend-inner-icon="mdi-magnify" />
          </div>
          <div class="flex-1! min-w-0" />
          <span class="asa-pill asa-pill--teal whitespace-nowrap!">
            {{ countPill }}
          </span>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm whitespace-nowrap!" @click="openDocDialog">
            <v-icon size="14">mdi-upload</v-icon>
            {{ t('labResults.uploadNewDocument') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openResultDialog">
            <v-icon size="14">mdi-plus</v-icon>
            {{ t('labResults.addLabResult') }}
          </button>
          <v-tooltip :text="t('common.refresh')" location="top">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
                :aria-label="t('common.refresh')" @click="fetchAll">
                <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
              </button>
            </template>
          </v-tooltip>
        </div>
      </div>

      <!-- ─── Loading skeletons ─── -->
      <template v-if="loading">
        <div class="asa-skel lr-list-skel" />
        <div class="asa-skel lr-docs-skel" />
      </template>

      <!-- ─── Registered results ─── -->
      <template v-else>
        <!-- Empty: filter / search produced no match -->
        <div v-if="hasQuery && !filteredResults.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--teal" aria-hidden="true">
            <v-icon icon="mdi-filter-off-outline" size="32" />
          </span>
          <p class="asa-empty__title">{{ t('labResults.noSearchResults') }}</p>
          <p class="asa-empty__sub">{{ t('labResults.noSearchResultsDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="searchQuery = ''">
            <v-icon size="14">mdi-filter-remove-outline</v-icon>
            {{ t('common.clear') }}
          </button>
        </div>

        <!-- Empty: no results registered at all -->
        <div v-else-if="!results.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--teal" aria-hidden="true">
            <ClipboardX class="w-8! h-8! fill-current" />
          </span>
          <p class="asa-empty__title">{{ t('labResults.noResultsPatientTitle') }}</p>
          <p class="asa-empty__sub">{{ t('labResults.noResultsPatientDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openResultDialog">
            <v-icon size="14">mdi-plus</v-icon>
            {{ t('labResults.addLabResult') }}
          </button>
        </div>

        <!-- Empty: current category has no results -->
        <div v-else-if="!filteredResults.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--indigo" aria-hidden="true">
            <Microscope class="w-8! h-8! fill-current" />
          </span>
          <p class="asa-empty__title">{{ t('labResults.noRecords') }}</p>
          <p class="asa-empty__sub">{{ t('labResults.noResultsInCategory') }}</p>
        </div>

        <template v-else>
          <!-- Desktop table (lg and up) -->
          <section class="asa-sec hidden! lg:block! lr-results-sec">
            <div class="asa-card lr-table-card">
              <div class="lr-table-head">
                <h3 class="flex items-center gap-2 text-[0.8125rem]! font-semibold!">
                  <Microscope class="w-4! h-4! fill-current opacity-60" />
                  {{ t('labResults.resultsTitle') }}
                </h3>
              </div>
              <div class="lr-table-wrap">
                <table class="lr-table">
                  <thead>
                    <tr>
                      <th>{{ t('labResults.biomarkerTest') }}</th>
                      <th>{{ t('labResults.registrationDate') }}</th>
                      <th>{{ t('labResults.reportedValue') }}</th>
                      <th>{{ t('labResults.referenceRange') }}</th>
                      <th>{{ t('labResults.clinicalStatus') }}</th>
                      <th class="lr-th-end">{{ t('labResults.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in filteredResults" :key="r.id">
                      <td>
                        <span class="lr-td-test block">{{ r.testName }}</span>
                        <span class="lr-muted block text-[0.6875rem]!">{{ categoryLabel(r.category) }}</span>
                      </td>
                      <td>
                        <span class="whitespace-nowrap!">{{ formatJalaliDate(r.performedDate) }}</span>
                      </td>
                      <td>
                        <span class="flex items-baseline gap-1!">
                          <span class="lr-mono-strong">{{ r.value ?? '—' }}</span>
                          <span v-if="r.unit" class="lr-mono-unit">{{ r.unit }}</span>
                        </span>
                      </td>
                      <td>
                        <span class="lr-mono-muted whitespace-nowrap!">{{ formatReferenceRange(r) }}</span>
                      </td>
                      <td>
                        <span class="asa-pill" :class="r.isAbnormal ? 'asa-pill--rose' : 'asa-pill--green'">
                          {{ r.isAbnormal ? t('labResults.outsideRange') : t('labResults.normalStatus') }}
                        </span>
                      </td>
                      <td class="lr-th-end">
                        <div class="flex items-center justify-end gap-1.5">
                          <v-tooltip :text="t('labResults.trendAnalysis')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('labResults.trendAnalysis')" @click="showTrend(r)">
                                <v-icon size="17">mdi-chart-line</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip :text="t('labResults.editRecord')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('labResults.editRecord')" @click="openEditResult(r)">
                                <v-icon size="17">mdi-pencil</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip :text="t('labResults.deleteRecord')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--danger"
                                :aria-label="t('labResults.deleteRecord')" @click="askDeleteResult(r)">
                                <v-icon size="17">mdi-trash-can-outline</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Tablet / mobile cards -->
          <div class="lg:hidden! mt-4! space-y-3!">
            <article v-for="r in filteredResults" :key="`c-${r.id}`" class="asa-card asa-pcard lr-pcard">
              <span class="asa-tint sc-avatar sc-avatar--lg" :class="categoryTint(r.category)">
                <Microscope class="w-4! h-4! fill-current" />
              </span>
              <div class="asa-pcard__main">
                <p class="asa-pcard__name">
                  {{ r.testName }}
                  <span class="asa-pill" :class="r.isAbnormal ? 'asa-pill--rose' : 'asa-pill--green'">
                    {{ r.isAbnormal ? t('labResults.outsideRange') : t('labResults.normalStatus') }}
                  </span>
                </p>
                <p class="asa-pcard__meta">
                  <span>{{ categoryLabel(r.category) }}</span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span>{{ formatJalaliDate(r.performedDate) }}</span>
                </p>
                <p class="asa-pcard__meta">
                  <span class="lr-mono-strong">{{ r.value ?? '—' }}</span>
                  <span v-if="r.unit" class="lr-mono-unit">{{ r.unit }}</span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span class="lr-mono-muted">{{ formatReferenceRange(r) }}</span>
                </p>
              </div>
              <div class="lr-pcard__actions">
                <button type="button" class="asa-icon-btn" :aria-label="t('labResults.trendAnalysis')"
                  @click="showTrend(r)">
                  <v-icon size="17">mdi-chart-line</v-icon>
                </button>
                <button type="button" class="asa-icon-btn" :aria-label="t('labResults.editRecord')"
                  @click="openEditResult(r)">
                  <v-icon size="17">mdi-pencil</v-icon>
                </button>
                <button type="button" class="asa-icon-btn asa-icon-btn--danger" :aria-label="t('labResults.deleteRecord')"
                  @click="askDeleteResult(r)">
                  <v-icon size="17">mdi-trash-can-outline</v-icon>
                </button>
              </div>
            </article>
          </div>
        </template>
      </template>

      <!-- ─── Documents & records ─── -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('labResults.documentsTitle') }}</p>
        <div v-if="loadingDocs" class="asa-skel lr-docs-skel" />
        <div v-else-if="documents.length === 0" class="asa-card asa-empty lr-docs-empty">
          <span class="asa-tint asa-tint--amber" aria-hidden="true">
            <FileUp class="w-7! h-7! fill-current" />
          </span>
          <p class="asa-empty__title">{{ t('labResults.documentsEmpty') }}</p>
          <p class="asa-empty__sub">{{ t('labResults.noDocsDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="openDocDialog">
            <v-icon size="14">mdi-upload</v-icon>
            {{ t('labResults.uploadNewDocument') }}
          </button>
        </div>
        <div v-else class="lr-docs">
          <article v-for="doc in documents" :key="doc.id" class="asa-card lr-doc">
            <div class="flex items-start gap-3! min-w-0">
              <span class="asa-tint asa-tint--sm asa-tint--indigo" aria-hidden="true">
                <FileText class="w-4! h-4! fill-current" />
              </span>
              <div class="min-w-0 flex-1!">
                <p class="lr-doc__name truncate!" :title="doc.fileName">{{ doc.fileName }}</p>
                <div class="flex items-center gap-1.5! mt-1! flex-wrap!">
                  <span class="asa-pill asa-pill--teal">{{ documentTypeLabel(doc.fileType) }}</span>
                  <span v-if="doc.fileSize" class="lr-mono-muted">{{ formatSize(doc.fileSize) }}</span>
                </div>
                <p class="lr-muted mt-1! text-[0.6875rem]!">{{ formatJalaliDate(doc.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center justify-end gap-1! border-t! border-(--asa-sep)! pt-3!">
              <v-tooltip :text="t('labResults.viewDoc')" location="top">
                <template #activator="{ props }">
                  <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loadingView.has(doc.id)"
                    :aria-label="t('labResults.viewDoc')" @click="viewFile(doc)">
                    <v-icon size="17">mdi-eye-outline</v-icon>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip :text="t('labResults.downloadDoc')" location="top">
                <template #activator="{ props }">
                  <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loadingDownload.has(doc.id)"
                    :aria-label="t('labResults.downloadDoc')" @click="downloadFile(doc)">
                    <v-icon size="17">mdi-download</v-icon>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip :text="t('labResults.documentDeleteTitle')" location="top">
                <template #activator="{ props }">
                  <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--danger"
                    :aria-label="t('labResults.documentDeleteTitle')" @click="askDeleteDocument(doc)">
                    <v-icon size="17">mdi-trash-can-outline</v-icon>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </article>
        </div>
      </section>
    </template>

    <!-- ═══════════════════════════════════════════
         ADD / EDIT LAB RESULT DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="resultDialog" max-width="640" @click:outside="dialogPatientResults = []">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">
              {{ editingId ? t('labResults.editResultTitle') : t('labResults.addResultTitle') }}
            </h2>
            <span class="asa-dialog__sub">{{ t('labResults.subtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="resultDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <!-- Patient picker (create mode) -->
            <div v-if="!editingId" class="asa-field">
              <label class="asa-field-label">{{ t('labResults.patientLabel') }} <span class="lr-req">*</span></label>
              <div v-if="dialogPatient" class="asa-note">
                <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
                  <v-icon size="15">mdi-account-check</v-icon>
                </span>
                <span class="min-w-0">
                  <span class="asa-note__label">{{ dialogPatient.firstName }} {{ dialogPatient.lastName }}</span>
                  <span class="asa-note__value truncate!">
                    <span class="crm-ltr font-mono">{{ dialogPatient.nationalId }}</span>
                    <template v-if="dialogPatient.phone">
                      <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                      <span class="crm-ltr font-mono">{{ dialogPatient.phone }}</span>
                    </template>
                  </span>
                </span>
                <button type="button" class="asa-icon-btn lr-clear-btn" :aria-label="t('common.clear')"
                  @click="clearDialogPatient">
                  <v-icon size="16">mdi-close</v-icon>
                </button>
              </div>
              <div v-else class="lr-patient">
                <div class="lr-patient__shell">
                  <v-icon size="17">mdi-magnify</v-icon>
                  <input v-model="dialogPatientQuery" type="text" class="lr-patient__input"
                    :placeholder="t('labResults.searchPatientPlaceholder')" autocomplete="off"
                    @input="onDialogPatientInput" @focus="showDialogPatientResults = dialogPatientResults.length > 0"
                    @blur="hideDialogPatientResults">
                  <v-progress-circular v-if="dialogPatientSearching" size="16" width="2" indeterminate color="rgba(0, 173, 181, 1)" />
                </div>
                <div v-if="showDialogPatientResults" class="lr-pop">
                  <template v-if="dialogPatientResults.length">
                    <button v-for="p in dialogPatientResults" :key="p.id" type="button"
                      class="lr-pop__item" @mousedown.prevent="selectDialogPatient(p)">
                      <span class="asa-tint sc-avatar sc-avatar--xs" :class="patientResultTint(p)">
                        {{ patientResultInitials(p) }}
                      </span>
                      <span class="min-w-0">
                        <span class="block text-[0.8125rem]! font-semibold! truncate!">{{ p.firstName }} {{ p.lastName }}</span>
                        <span class="block crm-ltr font-mono text-[0.6875rem]! tracking-wider! lr-muted">
                          {{ p.nationalId }}
                          <template v-if="p.phone"> · {{ p.phone }}</template>
                        </span>
                      </span>
                    </button>
                  </template>
                  <p v-else-if="dialogPatientSearched" class="lr-pop__empty">{{ t('labResults.noPatientsFound') }}</p>
                </div>
              </div>
            </div>

            <!-- Read-only patient note (edit mode) -->
            <div v-else class="asa-note">
              <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
                <v-icon size="15">mdi-account-check</v-icon>
              </span>
              <span class="min-w-0">
                <span class="asa-note__label">{{ selectedPatient?.firstName }} {{ selectedPatient?.lastName }}</span>
                <span class="asa-note__value truncate!">
                  <span class="crm-ltr font-mono">{{ selectedPatient?.nationalId }}</span>
                </span>
              </span>
            </div>

            <div class="grid grid-cols-1! gap-5! sm:grid-cols-2!">
              <div class="asa-field sm:col-span-2!">
                <label class="asa-field-label">{{ t('labResults.testName') }} <span class="lr-req">*</span></label>
                <v-combobox v-model="manualForm.test_name" :items="commonTestNames" variant="solo"
                  density="comfortable" hide-details :placeholder="t('labResults.testNamePlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('labResults.testName'), false, (text: string) => manualForm.test_name = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('labResults.category') }} <span class="lr-req">*</span></label>
                <v-select v-model="manualForm.category" :items="categoryOptions" item-title="title"
                  item-value="value" variant="solo" density="comfortable" hide-details
                  :placeholder="t('labResults.selectOption')" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('labResults.samplingDate') }} <span class="lr-req">*</span></label>
                <div v-if="editingId">
                  <p class="lr-date-note">
                    <v-icon size="14">mdi-calendar-clock</v-icon>
                    {{ formatJalaliDate(editingResult?.performedDate) }}
                  </p>
                  <p class="lr-muted mt-1! text-[0.6875rem]!">{{ t('labResults.dateReadOnlyNote') }}</p>
                </div>
                <div v-else class="lr-date" :class="{ 'lr-date--error': !!formDateError }">
                  <PersianDatetimePicker v-model="manualForm.performed_date" type="date"
                    :placeholder="t('labResults.solarDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="lr-date__picker" />
                </div>
                <p v-if="formDateError" class="lr-error">{{ formDateError }}</p>
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('labResults.value') }} <span class="lr-req">*</span></label>
                <v-text-field v-model="manualForm.value" type="number" step="any" variant="solo" density="comfortable"
                  hide-details :placeholder="t('labResults.valuePlaceholder')" class="font-mono!" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('labResults.unit') }}</label>
                <v-text-field v-model="manualForm.unit" variant="solo" density="comfortable" hide-details
                  placeholder="e.g. mIU/L" class="font-mono!"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('labResults.unit'), false, (text: string) => manualForm.unit = text)" />
              </div>

              <div class="asa-field sm:col-span-2!">
                <label class="asa-field-label">{{ t('labResults.refRange') }}</label>
                <v-text-field v-model="manualForm.reference_range" variant="solo" density="comfortable" hide-details
                  placeholder="e.g. 0.5 - 4.5" class="font-mono!"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('labResults.refRange'), false, (text: string) => manualForm.reference_range = text)" />
              </div>

              <div class="sm:col-span-2!">
                <div class="lr-switch-row">
                  <div class="min-w-0">
                    <p class="text-[0.8125rem]! font-semibold!">{{ t('labResults.abnormalFlag') }}</p>
                    <p class="lr-muted text-[0.6875rem]! mt-0.5!">{{ t('labResults.abnormalDesc') }}</p>
                  </div>
                  <v-switch v-model="manualForm.abnormal_flag" color="#ff3b30" inset hide-details class="flex-none!" />
                </div>
              </div>

              <div class="asa-field sm:col-span-2!">
                <label class="asa-field-label">{{ t('labResults.clinicalNotes') }}</label>
                <v-textarea v-model="manualForm.notes" variant="solo" density="comfortable" rows="2"
                  auto-grow hide-details :placeholder="t('labResults.notesPlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('labResults.clinicalNotes'), false, (text: string) => manualForm.notes = text)" />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="savingResult" @click="resultDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="savingResult" @click="submitResult">
            <v-icon v-if="savingResult" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ editingId ? t('labResults.saveChanges') : t('labResults.saveAndFinalize') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════
         DOCUMENT UPLOAD DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="docDialog" max-width="560">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">{{ t('labResults.documentUpload') }}</h2>
            <span class="asa-dialog__sub">{{ t('labResults.sectionDesc') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="docDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <div class="asa-field">
              <label class="asa-field-label">{{ t('labResults.docType') }} <span class="lr-req">*</span></label>
              <v-select v-model="docForm.type" :items="documentTypeOptions" item-title="label"
                item-value="value" variant="solo" density="comfortable" hide-details
                :placeholder="t('labResults.selectOption')" />
              <p v-if="docTypeError" class="lr-error">{{ docTypeError }}</p>
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('labResults.docFiles') }} <span class="lr-req">*</span></label>
              <label class="lr-drop">
                <UploadCloud class="w-5! h-5! fill-current opacity-60" />
                <span class="lr-drop__title">{{ t('labResults.chooseFile') }}</span>
                <span class="lr-drop__sub">{{ t('labResults.chooseFileDesc') }}</span>
                <input type="file" class="hidden!" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple @change="onFileChange" />
              </label>
              <p v-if="docFilesError" class="lr-error">{{ docFilesError }}</p>
            </div>

            <div v-if="docForm.files.length" class="space-y-1.5!">
              <div v-for="(file, idx) in docForm.files" :key="idx" class="lr-file-chip">
                <File class="w-3.5! h-3.5! fill-current opacity-60 shrink-0!" />
                <span class="min-w-0 flex-1! truncate! text-[0.8125rem]! font-medium!">{{ file.name }}</span>
                <span class="lr-mono-muted shrink-0!">{{ formatSize(file.size) }}</span>
                <button type="button" class="asa-icon-btn lr-clear-btn" :aria-label="t('common.clear')"
                  @click="docForm.files.splice(idx, 1)">
                  <v-icon size="15">mdi-close</v-icon>
                </button>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="savingDoc" @click="docDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="savingDoc" @click="submitDocument">
            <v-icon v-if="savingDoc" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('labResults.uploadDocButton') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════
         TREND DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="trendDialog" max-width="720">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-lg! flex items-center gap-2!">
              <Activity class="w-5! h-5! fill-current opacity-70" />
              {{ t('labResults.trendTitle', { name: trendTestName }) }}
            </h2>
            <span v-if="trendUnit" class="asa-dialog__sub">{{ trendUnit }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="trendDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="trendLoading" class="flex justify-center! py-16!">
            <v-progress-circular indeterminate color="rgba(0, 173, 181, 1)" size="30" width="3" />
          </div>
          <template v-else-if="trendData.length">
            <div class="lr-chart">
              <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="w-full! max-h-72!"
                xmlns="http://www.w3.org/2000/svg">
                <line v-for="(g, gi) in yGridLines" :key="'yg' + gi" :x1="margin.left" :y1="g.y"
                  :x2="svgWidth - margin.right" :y2="g.y" class="lr-chart__grid" stroke-width="1" stroke-dasharray="4,4" />

                <text v-for="(g, gi) in yGridLines" :key="'yl' + gi" :x="margin.left - 12" :y="g.y + 3"
                  text-anchor="end" class="fill-slate-400! font-mono!" font-size="9">
                  {{ g.label }}
                </text>

                <rect v-if="refLow !== null && refHigh !== null" :x="margin.left" :y="scaleY(refHigh)"
                  :width="plotWidth" :height="scaleY(refLow) - scaleY(refHigh)" class="lr-chart__band" />
                <line v-if="refLow !== null" :x1="margin.left" :y1="scaleY(refLow)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refLow)" class="lr-chart__refline" stroke-width="1" />
                <line v-if="refHigh !== null" :x1="margin.left" :y1="scaleY(refHigh)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refHigh)" class="lr-chart__refline" stroke-width="1" />

                <polyline :points="linePoints" fill="none" class="lr-chart__line" stroke-width="1.6"
                  stroke-linejoin="round" />

                <circle v-for="(pt, pi) in trendDataSorted" :key="'pt' + pi" :cx="scaleX(pt.index)"
                  :cy="scaleY(Number(pt.value))" r="3.5"
                  :fill="pt.isAbnormal ? 'var(--asa-rose)' : 'var(--asa-accent)'"
                  stroke="var(--asa-bg-card)" stroke-width="1.5" />

                <text v-for="(pt, pi) in trendDataSorted" :key="'xl' + pi" :x="scaleX(pt.index)"
                  :y="svgHeight - margin.bottom + 22" text-anchor="end" class="fill-slate-400! font-medium!"
                  font-size="9" :transform="`rotate(-40, ${scaleX(pt.index)}, ${svgHeight - margin.bottom + 22})`">
                  {{ formatShortDate(pt.performedDate) }}
                </text>
              </svg>
            </div>

            <div class="lr-trend-table">
              <table class="w-full! text-start! text-[0.8125rem]!">
                <thead>
                  <tr>
                    <th class="lr-muted">{{ t('labResults.samplingDateLabel') }}</th>
                    <th class="lr-muted">{{ t('labResults.foundValue') }}</th>
                    <th class="lr-muted">{{ t('labResults.kitReference') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pt in trendDataSorted" :key="pt.id" class="lr-trend-row">
                    <td class="font-medium!">{{ formatJalaliDate(pt.performedDate) }}</td>
                    <td>
                      <span class="font-mono! font-semibold!" :class="pt.isAbnormal ? 'text-red-500!' : ''">
                        {{ pt.value }}
                      </span>
                    </td>
                    <td class="lr-mono-muted">{{ formatReferenceRange(pt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <div v-else class="flex justify-center! py-12!">
            <p class="lr-muted">{{ t('labResults.noTrendPoints') }}</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════
         DELETE CONFIRMATION DIALOGS
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="deleteResultDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-trash-can-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('labResults.deleteLabTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('labResults.deleteLabConfirm') }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="deleteResultDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="deleteResultTarget" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--rose" aria-hidden="true">
              <Microscope class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ deleteResultTarget.testName }}</p>
              <p class="asa-note__value truncate!">
                {{ categoryLabel(deleteResultTarget.category) }}
                <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                {{ formatJalaliDate(deleteResultTarget.performedDate) }}
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="deleting" @click="deleteResultDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn lr-btn--destructive" :disabled="deleting" @click="deleteResult">
            <v-icon v-if="deleting" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('labResults.deletePermanently') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDocDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-file-document-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('labResults.documentDeleteTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('labResults.documentDeleteConfirm') }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="deleteDocDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="deleteDocTarget" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--amber" aria-hidden="true">
              <FileText class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ deleteDocTarget.fileName }}</p>
              <p class="asa-note__value truncate!">
                {{ documentTypeLabel(deleteDocTarget.fileType) }}
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="deleting" @click="deleteDocDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn lr-btn--destructive" :disabled="deleting" @click="deleteDocument">
            <v-icon v-if="deleting" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('labResults.deletePermanently') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Microscope from '~/components/icons/Microscope.vue'
import ClipboardX from '~/components/icons/ClipboardX.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import Grid from '~/components/icons/Grid.vue'
import FileUp from '~/components/icons/FileUp.vue'
import FileText from '~/components/icons/FileText.vue'
import File from '~/components/icons/File.vue'
import UploadCloud from '~/components/icons/UploadCloud.vue'
import Activity from '~/components/icons/Activity.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  nationalId?: string | null
  phone?: string | null
}

interface LabResultItem {
  id: string
  category: string
  testName: string
  testCode?: string | null
  value?: string | number | null
  unit?: string | null
  referenceRangeLow?: string | null
  referenceRangeHigh?: string | null
  isAbnormal?: boolean | null
  performedDate: string | null
  notes?: string | null
}

interface AttachmentDoc {
  id: string
  fileName: string
  fileType: string
  fileSize?: number | null
  createdAt?: string | null
}

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

// ─── Patient pick state ───
const selectedPatient = ref<PatientOption | null>(null)

// ─── Workstation patient search ───
const patientSearchQuery = ref('')
const patientSearchResults = ref<PatientOption[]>([])
const patientSearching = ref(false)
const searchedOnce = ref(false)
let workstationTimer: ReturnType<typeof setTimeout> | null = null

function onPatientSearchInput() {
  if (workstationTimer) clearTimeout(workstationTimer)
  if (!patientSearchQuery.value.trim()) {
    patientSearchResults.value = []
    searchedOnce.value = false
    return
  }
  workstationTimer = setTimeout(() => searchWorkstationPatients(), 350)
}

async function searchWorkstationPatients() {
  const q = patientSearchQuery.value.trim()
  if (!q) return
  patientSearching.value = true
  searchedOnce.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PatientOption[] }>(
      `/api/patients/search?q=${encodeURIComponent(q)}`
    )
    patientSearchResults.value = res.success ? (res.data || []) : []
  } catch {
    patientSearchResults.value = []
    $toast.error(t('labResults.fetchSearchError'))
  } finally {
    patientSearching.value = false
  }
}

function selectPatient(p: PatientOption) {
  selectedPatient.value = p
  resetWorkstationSearch()
  fetchAll()
}

function clearPatient() {
  selectedPatient.value = null
  resetWorkstationSearch()
}

function resetWorkstationSearch() {
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  searchedOnce.value = false
}

// ─── Data ───
const results = ref<LabResultItem[]>([])
const documents = ref<AttachmentDoc[]>([])
const loading = ref(false)
const loadingDocs = ref(false)

async function fetchAll() {
  const pid = selectedPatient.value?.id
  if (!pid) return
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: LabResultItem[] }>(
      `/api/lab-results/patient/${pid}`
    )
    results.value = res.success ? (res.data || []) : []
    if (!res.success) $toast.error(t('labResults.fetchResultsError'))
  } catch {
    results.value = []
    $toast.error(t('labResults.serverError'))
  } finally {
    loading.value = false
  }
}

async function fetchDocuments() {
  const pid = selectedPatient.value?.id
  if (!pid) return
  loadingDocs.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: AttachmentDoc[] }>(
      `/api/patients/${pid}/attachments`
    )
    documents.value = res.success ? (res.data || []) : []
    if (!res.success) $toast.error(t('labResults.fetchDocsError'))
  } catch {
    documents.value = []
    $toast.error(t('labResults.serverError'))
  } finally {
    loadingDocs.value = false
  }
}

watch(selectedPatient, (val) => {
  activeCategory.value = 'all'
  searchQuery.value = ''
  if (val) {
    fetchAll()
    fetchDocuments()
  }
})

// ─── Overview metrics ───
const metricTotal = computed(() => results.value.length)
const metricAbnormal = computed(() => results.value.filter((r) => r.isAbnormal).length)
const metricCategories = computed(
  () => new Set(results.value.map((r) => r.category)).size
)

const metrics = computed(() => [
  {
    key: 'tests', icon: Microscope, tint: 'asa-tint--indigo', dot: 'lr-dot--indigo',
    value: metricTotal.value, label: t('labResults.metricRegistered'),
    foot: t('labResults.metricRegisteredFoot'),
  },
  {
    key: 'abnormal', icon: ClipboardX, tint: 'asa-tint--rose', dot: 'lr-dot--rose',
    value: metricAbnormal.value, label: t('labResults.metricAbnormal'),
    foot: t('labResults.metricAbnormalFoot'),
  },
  {
    key: 'categories', icon: Grid, tint: 'asa-tint--green', dot: 'lr-dot--green',
    value: metricCategories.value, label: t('labResults.metricCategories'),
    foot: t('labResults.metricCategoriesFoot'),
  },
  {
    key: 'docs', icon: FolderOpen, tint: 'asa-tint--amber', dot: 'lr-dot--amber',
    value: documents.value.length, label: t('labResults.metricDocuments'),
    foot: t('labResults.metricDocumentsFoot'),
  },
])

// ─── Category filters ───
const CATEGORY_ORDER = [
  'hormone', 'hematology', 'biochemistry', 'tumor_marker',
  'microbiology', 'urinalysis', 'genetics', 'cytology',
  'pathology', 'molecular', 'other',
]

const activeCategory = ref('all')
const searchQuery = ref('')

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of results.value) {
    counts[r.category] = (counts[r.category] || 0) + 1
  }
  return counts
})

const categoryChips = computed(() => {
  const present = CATEGORY_ORDER.filter((c) => (categoryCounts.value[c] || 0) > 0)
  const chips = [{ key: 'all', label: t('labResults.allCategories'), count: results.value.length }]
  for (const c of present) {
    chips.push({ key: c, label: t(`labResults.categories.${c}`), count: categoryCounts.value[c] })
  }
  return chips
})

const categoryLabel = (category: string | undefined | null) => {
  if (!category) return '—'
  return t(`labResults.categories.${category}`) || category
}

const categoryTint = (category: string) => {
  const map: Record<string, string> = {
    hormone: 'asa-tint--indigo',
    hematology: 'asa-tint--rose',
    biochemistry: 'asa-tint--teal',
    tumor_marker: 'asa-tint--amber',
    microbiology: 'asa-tint--orange',
    urinalysis: 'asa-tint--green',
    genetics: 'asa-tint--indigo',
    cytology: 'asa-tint--teal',
    pathology: 'asa-tint--rose',
    molecular: 'asa-tint--green',
    other: 'asa-tint--amber',
  }
  return map[category] || 'asa-tint--teal'
}

const categoryOptions = computed(() =>
  CATEGORY_ORDER.map((value) => ({ title: t(`labResults.categories.${value}`), value }))
)

const filteredResults = computed(() => {
  let list = results.value
  if (activeCategory.value !== 'all') {
    list = list.filter((r) => r.category === activeCategory.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((r) => {
      const name = (r.testName || '').toLowerCase()
      const code = (r.testCode || '').toLowerCase()
      const cat = categoryLabel(r.category).toLowerCase()
      return name.includes(q) || code.includes(q) || cat.includes(q)
    })
  }
  return list
})

const hasQuery = computed(() => searchQuery.value.trim() !== '')

const countPill = computed(() => t('labResults.resultsCount', { count: filteredResults.value.length }))

// ─── Document labels / helpers ───
const documentTypeOptions = computed(() => [
  { value: 'lab', label: t('labResults.docTypes.lab') },
  { value: 'hormone', label: t('labResults.docTypes.hormone') },
  { value: 'tumor_marker', label: t('labResults.docTypes.tumor_marker') },
  { value: 'cytology', label: t('labResults.docTypes.cytology') },
  { value: 'pathology', label: t('labResults.docTypes.pathology') },
  { value: 'microbiology', label: t('labResults.docTypes.microbiology') },
  { value: 'genetics', label: t('labResults.docTypes.genetics') },
  { value: 'ultrasound', label: t('labResults.docTypes.ultrasound') },
  { value: 'prescription', label: t('labResults.docTypes.prescription') },
  { value: 'other', label: t('labResults.docTypes.other') },
])

const docTypeLabels = computed(() => {
  const map: Record<string, string> = {}
  for (const opt of documentTypeOptions.value) map[opt.value] = opt.label
  return map
})

const documentTypeLabel = (type: string | null | undefined) =>
  (type && docTypeLabels.value[type]) || categoryLabel(type) || '—'

// ─── Patient display helpers ───
const patientInitials = (p: PatientOption | null | undefined) => {
  const initials = `${p?.firstName?.charAt(0) || ''}${p?.lastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

const FULL_TINTS = ['asa-tint--teal', 'asa-tint--green', 'asa-tint--orange', 'asa-tint--rose', 'asa-tint--indigo']

function hashOf(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return hash
}

const patientTint = (p: PatientOption | null | undefined) =>
  FULL_TINTS[hashOf(`${p?.firstName || ''}${p?.lastName || ''}${p?.nationalId || ''}`) % FULL_TINTS.length]

const patientResultTint = (p: PatientOption) =>
  FULL_TINTS[hashOf(`${p?.firstName || ''}${p?.lastName || ''}${p?.nationalId || ''}`) % FULL_TINTS.length]

const patientResultInitials = (p: PatientOption) => {
  const initials = `${p?.firstName?.charAt(0) || ''}${p?.lastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

// ─── Formatting helpers ───
function formatJalaliDate(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

function formatShortDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(d)
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i]
}

function formatReferenceRange(row: LabResultItem): string {
  const low = row.referenceRangeLow ?? row.reference_range_low
  const high = row.referenceRangeHigh ?? row.reference_range_high
  if (low && high) return `${low} - ${high}`
  if (low) return String(low)
  if (high) return String(high)
  return '—'
}

function splitRange(range: string, lowKey: 'reference_range_low' | 'reference_range_high'): string | null {
  const parts = String(range || '').split(/\s*[-–]\s*/)
  const idx = lowKey === 'reference_range_low' ? 0 : 1
  return parts[idx]?.trim() || null
}

// ─── Add / edit result form ───
interface ManualForm {
  category: string
  test_name: string
  value: string
  unit: string
  reference_range: string
  abnormal_flag: boolean
  notes: string
  performed_date: string
}

const resultDialog = ref(false)
const savingResult = ref(false)
const editingId = ref<string | null>(null)
const editingResult = ref<LabResultItem | null>(null)
const formDateError = ref('')

const manualForm = ref<ManualForm>({
  category: 'hormone',
  test_name: '',
  value: '',
  unit: '',
  reference_range: '',
  abnormal_flag: false,
  notes: '',
  performed_date: '',
})

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function resetManualForm() {
  manualForm.value = {
    category: 'hormone',
    test_name: '',
    value: '',
    unit: '',
    reference_range: '',
    abnormal_flag: false,
    notes: '',
    performed_date: toDateStr(new Date()),
  }
}

function openResultDialog() {
  editingId.value = null
  editingResult.value = null
  resetManualForm()
  formDateError.value = ''
  dialogPatient.value = selectedPatient.value
  resetDialogPatientSearch()
  resultDialog.value = true
}

function openEditResult(r: LabResultItem) {
  editingId.value = r.id
  editingResult.value = r
  manualForm.value = {
    category: r.category,
    test_name: r.testName,
    value: r.value == null ? '' : String(r.value),
    unit: r.unit || '',
    reference_range: formatReferenceRange(r) === '—' ? '' : formatReferenceRange(r),
    abnormal_flag: !!r.isAbnormal,
    notes: r.notes || '',
    performed_date: r.performedDate || '',
  }
  formDateError.value = ''
  resultDialog.value = true
}

function openDocDialog() {
  resetDocForm()
  docTypeError.value = ''
  docFilesError.value = ''
  docDialog.value = true
}

async function submitResult() {
  if (!editingId.value && !dialogPatient.value) {
    $toast.error(t('labResults.patientRequired'))
    return
  }
  if (!manualForm.value.test_name.trim()) {
    $toast.error(t('labResults.testNameRequired'))
    return
  }
  if (!manualForm.value.category) {
    $toast.error(t('labResults.categoryRequired'))
    return
  }
  if (manualForm.value.value === '') {
    $toast.error(t('labResults.valueRequired'))
    return
  }
  if (!editingId.value && !manualForm.value.performed_date) {
    formDateError.value = t('labResults.samplingDateRequired')
    return
  }
  formDateError.value = ''

  savingResult.value = true
  try {
    if (editingId.value) {
      const body = {
        category: manualForm.value.category,
        test_name: manualForm.value.test_name.trim(),
        value: manualForm.value.value,
        unit: manualForm.value.unit.trim() || undefined,
        reference_range_low: splitRange(manualForm.value.reference_range, 'reference_range_low'),
        reference_range_high: splitRange(manualForm.value.reference_range, 'reference_range_high'),
        is_abnormal: manualForm.value.abnormal_flag,
        notes: manualForm.value.notes.trim() || undefined,
      }
      const res = await apiFetch<{ success: boolean; error?: string }>(
        `/api/lab-results/${editingId.value}`,
        { method: 'PUT', body }
      )
      if (res.success) {
        $toast.success(t('labResults.resultUpdated'))
      } else {
        $toast.error(res.error || t('labResults.resultUpdateError'))
        return
      }
    } else {
      const body = {
        patient_id: dialogPatient.value!.id,
        category: manualForm.value.category,
        test_name: manualForm.value.test_name.trim(),
        value: manualForm.value.value,
        unit: manualForm.value.unit.trim() || null,
        reference_range_low: splitRange(manualForm.value.reference_range, 'reference_range_low'),
        reference_range_high: splitRange(manualForm.value.reference_range, 'reference_range_high'),
        is_abnormal: manualForm.value.abnormal_flag,
        notes: manualForm.value.notes.trim() || null,
        performed_date: manualForm.value.performed_date,
      }
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/lab-results', {
        method: 'POST',
        body,
      })
      if (res.success) {
        $toast.success(t('labResults.resultSaved'))
      } else {
        $toast.error(res.error || t('labResults.resultSaveError'))
        return
      }
    }
    resultDialog.value = false
    await fetchAll()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || (editingId.value ? t('labResults.resultUpdateError') : t('labResults.resultSaveError')))
  } finally {
    savingResult.value = false
  }
}

// ─── Dialog patient picker ───
const dialogPatient = ref<PatientOption | null>(null)
const dialogPatientQuery = ref('')
const dialogPatientResults = ref<PatientOption[]>([])
const dialogPatientSearching = ref(false)
const showDialogPatientResults = ref(false)
const dialogPatientSearched = ref(false)
let dialogPatientTimer: ReturnType<typeof setTimeout> | null = null

function onDialogPatientInput() {
  if (dialogPatientTimer) clearTimeout(dialogPatientTimer)
  if (!dialogPatientQuery.value.trim()) {
    dialogPatientResults.value = []
    dialogPatientSearched.value = false
    return
  }
  dialogPatientTimer = setTimeout(() => searchDialogPatients(), 350)
}

async function searchDialogPatients() {
  const q = dialogPatientQuery.value.trim()
  if (!q) return
  dialogPatientSearching.value = true
  dialogPatientSearched.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PatientOption[] }>(
      `/api/patients/search?q=${encodeURIComponent(q)}`
    )
    dialogPatientResults.value = res.success ? (res.data || []) : []
    showDialogPatientResults.value = true
  } catch {
    dialogPatientResults.value = []
  } finally {
    dialogPatientSearching.value = false
  }
}

function hideDialogPatientResults() {
  setTimeout(() => { showDialogPatientResults.value = false }, 200)
}

function selectDialogPatient(p: PatientOption) {
  dialogPatient.value = p
  resetDialogPatientSearch()
}

function clearDialogPatient() {
  dialogPatient.value = null
  resetDialogPatientSearch()
}

function resetDialogPatientSearch() {
  dialogPatientQuery.value = ''
  dialogPatientResults.value = []
  showDialogPatientResults.value = false
  dialogPatientSearched.value = false
}

// ─── Document upload ───
const docDialog = ref(false)
const savingDoc = ref(false)
const docTypeError = ref('')
const docFilesError = ref('')
const docForm = ref<{ type: string; files: File[] }>({ type: 'lab', files: [] })

function resetDocForm() {
  docForm.value = { type: 'lab', files: [] }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    docForm.value.files = [...docForm.value.files, ...Array.from(input.files)]
  }
  input.value = ''
}

async function submitDocument() {
  const pid = selectedPatient.value?.id
  docTypeError.value = docForm.value.type ? '' : t('labResults.docTypeRequired')
  docFilesError.value = docForm.value.files.length ? '' : t('labResults.docFilesRequired')
  if (!pid || docTypeError.value || docFilesError.value) return

  savingDoc.value = true
  try {
    const fd = new FormData()
    fd.append('type', docForm.value.type)
    for (const file of docForm.value.files) {
      fd.append('file', file)
    }
    const res = await apiFetch<{ success: boolean; error?: string }>(
      `/api/patients/${pid}/attachments`,
      { method: 'POST', body: fd }
    )
    if (res.success) {
      $toast.success(t('labResults.documentUploaded'))
      docDialog.value = false
      await fetchDocuments()
    } else {
      $toast.error(res.error || t('labResults.documentUploadError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('labResults.documentUploadError'))
  } finally {
    savingDoc.value = false
  }
}

// ─── Document actions ───
const loadingView = ref(new Set<string>())
const loadingDownload = ref(new Set<string>())

async function getDownloadUrl(doc: AttachmentDoc, forceDownload = false, loadingSet: Ref<Set<string>>): Promise<string | null> {
  const pid = selectedPatient.value?.id
  if (!doc.id || !pid) return null
  const next = new Set(loadingSet.value)
  next.add(doc.id)
  loadingSet.value = next
  try {
    const query = forceDownload ? '?download=true' : ''
    const res = await apiFetch<{ success: boolean; data?: { downloadUrl: string } }>(
      `/api/patients/${pid}/attachments/${doc.id}/download${query}`
    )
    return res.data?.downloadUrl || null
  } catch {
    $toast.error(t('labResults.downloadLinkError'))
    return null
  } finally {
    const cleared = new Set(loadingSet.value)
    cleared.delete(doc.id)
    loadingSet.value = cleared
  }
}

async function viewFile(doc: AttachmentDoc) {
  const url = await getDownloadUrl(doc, false, loadingView)
  if (url) window.open(url, '_blank')
}

async function downloadFile(doc: AttachmentDoc) {
  const url = await getDownloadUrl(doc, true, loadingDownload)
  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName || 'download'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

// ─── Trend ───
const trendDialog = ref(false)
const trendData = ref<LabResultItem[]>([])
const trendLoading = ref(false)
const trendTestName = ref('')
const trendUnit = ref('')

async function showTrend(r: LabResultItem) {
  const pid = selectedPatient.value?.id
  if (!pid) return
  trendTestName.value = r.testName
  trendUnit.value = r.unit || ''
  trendDialog.value = true
  trendLoading.value = true
  trendData.value = []
  try {
    const res = await apiFetch<{ success: boolean; data: LabResultItem[] }>(
      `/api/lab-results/patient/${pid}/trend?testName=${encodeURIComponent(r.testName)}`
    )
    trendData.value = (res.success ? (res.data || []) : []).sort(
      (a: LabResultItem, b: LabResultItem) => new Date(a.performedDate).getTime() - new Date(b.performedDate).getTime()
    )
    if (!res.success) $toast.error(t('labResults.fetchTrendError'))
  } catch {
    trendData.value = []
    $toast.error(t('labResults.trendFetchError'))
  } finally {
    trendLoading.value = false
  }
}

const trendDataSorted = computed(() =>
  trendData.value.map((d: LabResultItem, i: number) => ({ ...d, index: i }))
)

const margin = { top: 30, right: 20, bottom: 60, left: 50 }
const svgWidth = 640
const svgHeight = 270
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom

function scaleX(index: number) {
  const count = trendDataSorted.value.length
  if (count <= 1) return margin.left + plotWidth / 2
  return margin.left + (index / (count - 1)) * plotWidth
}

function scaleY(value: number) {
  const vals = trendDataSorted.value.map((d) => Number(d.value))
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  return margin.top + ((yMax - value) / (yMax - yMin)) * plotHeight
}

const refLow = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const low = trendDataSorted.value[0].referenceRangeLow
  if (low) return parseFloat(low)
  return null
})

const refHigh = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const high = trendDataSorted.value[0].referenceRangeHigh
  if (high) return parseFloat(high)
  return null
})

const yGridLines = computed(() => {
  const vals = trendDataSorted.value.map((d) => Number(d.value))
  if (vals.length === 0) return []
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  const steps = 4
  const lines = []
  for (let i = 0; i <= steps; i++) {
    const val = yMin + ((yMax - yMin) * i) / steps
    lines.push({
      y: margin.top + ((yMax - val) / (yMax - yMin)) * plotHeight,
      label: val.toFixed(1),
    })
  }
  return lines
})

const linePoints = computed(() =>
  trendDataSorted.value
    .map((d: { index: number; value: string | number | null }) => `${scaleX(d.index)},${scaleY(Number(d.value))}`)
    .join(' ')
)

// ─── Delete ───
const deleteResultDialog = ref(false)
const deleteDocDialog = ref(false)
const deleting = ref(false)
const deleteResultTarget = ref<LabResultItem | null>(null)
const deleteDocTarget = ref<AttachmentDoc | null>(null)

function askDeleteResult(r: LabResultItem) {
  deleteResultTarget.value = r
  deleteResultDialog.value = true
}

function askDeleteDocument(doc: AttachmentDoc) {
  deleteDocTarget.value = doc
  deleteDocDialog.value = true
}

async function deleteResult() {
  const target = deleteResultTarget.value
  if (!target) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(`/api/lab-results/${target.id}`, {
      method: 'DELETE',
    })
    if (res.success) {
      $toast.success(t('labResults.resultDeleted'))
      deleteResultDialog.value = false
      deleteResultTarget.value = null
      await fetchAll()
    } else {
      $toast.error(res.error || t('labResults.deleteError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('labResults.labDeleteError'))
  } finally {
    deleting.value = false
  }
}

async function deleteDocument() {
  const pid = selectedPatient.value?.id
  const target = deleteDocTarget.value
  if (!pid || !target) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(
      `/api/patients/${pid}/attachments/${target.id}`,
      { method: 'DELETE' }
    )
    if (res.success) {
      $toast.success(t('labResults.documentDeleted'))
      deleteDocDialog.value = false
      deleteDocTarget.value = null
      await fetchDocuments()
    } else {
      $toast.error(res.error || t('labResults.documentDeleteError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('labResults.documentDeleteError'))
  } finally {
    deleting.value = false
  }
}

// ─── Handwriting ───
const handwritingOpen = ref(false)
const handwritingLabel = ref('')
const handwritingNumeric = ref(false)
const handwritingCallback = ref<((text: string) => void) | null>(null)

function openHandwriting(label: string, numeric: boolean, callback: (text: string) => void) {
  handwritingLabel.value = label
  handwritingNumeric.value = numeric
  handwritingCallback.value = callback
  handwritingOpen.value = true
}

function applyHandwriting(text: string) {
  handwritingCallback.value?.(text)
}

// ─── Common test names ───
const commonTestNames = [
  'FSH', 'LH', 'Estradiol (E2)', 'Progesterone', 'Prolactin', 'AMH', 'TSH',
  'Testosterone', 'DHEA-S', 'SHBG', 'CA-125', 'HE4', 'ROMA', 'AFP', 'CEA',
  'CA 15-3', 'CA 19-9',
]

watch(resultDialog, (val) => {
  if (!val) {
    resetManualForm()
    formDateError.value = ''
    if (dialogPatientTimer) clearTimeout(dialogPatientTimer)
  }
})

watch(docDialog, (val) => {
  if (!val) {
    resetDocForm()
    docTypeError.value = ''
    docFilesError.value = ''
  }
})

useSeoMeta({ title: t('labResults.titleSeo') })
</script>

<style scoped>
/* ── Top spacing ─────────────────────────────── */
.lr-head {
  margin-top: 0.25rem;
}

/* ── Workstation (empty) state ──────────────── */
.lr-workstation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.lr-workstation__copy {
  max-width: 34rem;
}

.lr-workstation__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--asa-label);
}

.lr-workstation__sub {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--asa-label-2);
}

.lr-workstation__search {
  width: min(100%, 30rem);
  margin-top: 0.25rem;
}

.lr-workstation .lr-search-field {
  flex: none;
}

.lr-no-match {
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lr-patients {
  width: 100%;
  max-width: 30rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem;
  text-align: start;
}

.lr-patient {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.875rem;
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), border-color 150ms var(--ease-default);
}

.lr-patient:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-color: var(--asa-sep);
}

.lr-patient__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.lr-patient__arrow {
  color: var(--asa-label-3);
  margin-inline-start: auto;
  flex-shrink: 0;
}

.lr-muted {
  color: var(--asa-label-2);
}

/* ── Patient record card ────────────────────── */
.lr-patient-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.lr-patient-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.lr-patient-card__meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* ── Metrics grid ───────────────────────────── */
.lr-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 560px) {
  .lr-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .lr-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.lr-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1.125rem 1.25rem;
}

.lr-metric__copy {
  min-width: 0;
  text-align: end;
}

.lr-metric__value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lr-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.lr-metric__foot {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.lr-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-label-3) 18%, transparent);
}

.lr-dot--indigo {
  background: var(--asa-indigo);
  box-shadow: 0 0 0 3px var(--asa-indigo-soft);
}

.lr-dot--amber {
  background: var(--asa-amber);
  box-shadow: 0 0 0 3px var(--asa-amber-soft);
}

.lr-dot--green {
  background: var(--asa-green);
  box-shadow: 0 0 0 3px var(--asa-green-soft);
}

.lr-dot--rose {
  background: var(--asa-rose);
  box-shadow: 0 0 0 3px var(--asa-rose-soft);
}

/* ── Frosted, sticky control deck ───────────── */
.asa-toolbar {
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.625rem;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-bg-card) 82%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.8);
  backdrop-filter: blur(18px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.lr-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

/* Category chips */
.lr-chips {
  display: flex;
  gap: 0.375rem;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.0625rem;
}

.lr-chips::-webkit-scrollbar {
  display: none;
}

.lr-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.8125rem;
  border: 1px solid transparent;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  color: var(--asa-label-2);
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    border-color 150ms var(--ease-default);
}

.lr-chip:hover {
  color: var(--asa-label);
}

.lr-chip__count {
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--asa-label-2);
  background: color-mix(in srgb, var(--asa-label) 10%, transparent);
}

.lr-chip--active {
  background: var(--asa-label);
  color: var(--asa-bg-card);
}

.lr-chip--active .lr-chip__count {
  background: color-mix(in srgb, var(--asa-bg-card) 24%, transparent);
  color: var(--asa-bg-card);
}

.dark .lr-chip--active {
  background: #f5f5f7;
  color: #1d1d1f;
}

/* Fields */
.asa-field--search {
  flex: 1 1 16rem;
  min-width: 13rem;
}

.asa-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.asa-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-field :deep(.v-field__overlay) {
  background: transparent;
}

.asa-field :deep(.v-field__input),
.asa-field :deep(.v-field__input::placeholder),
.asa-field :deep(.v-label) {
  color: var(--asa-label);
}

.asa-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.asa-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.asa-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

.asa-field :deep(.v-messages) {
  display: none;
}

.asa-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.asa-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .asa-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asa-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.asa-icon-btn--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

/* ── Results table ──────────────────────────── */
.lr-results-sec {
  margin-top: 0.5rem;
}

.lr-table-card {
  padding: 0;
  overflow: hidden;
}

.lr-table-head {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--asa-sep);
  color: var(--asa-label);
}

.lr-table-wrap {
  overflow-x: auto;
}

.lr-table {
  width: 100%;
  min-width: 54rem;
  border-collapse: collapse;
  text-align: start;
}

.lr-table thead th {
  padding: 0.6875rem 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.lr-table tbody td {
  padding: 0.75rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.lr-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.lr-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .lr-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.lr-th-end {
  text-align: end !important;
}

.lr-td-test {
  display: block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: var(--asa-label);
}

.lr-mono-strong {
  font-weight: 700;
  font-family: var(--asa-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 0.8125rem;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.lr-mono-unit {
  font-size: 0.6875rem;
  font-family: var(--asa-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  color: var(--asa-label-3);
}

.lr-mono-muted {
  font-size: 0.75rem;
  font-family: var(--asa-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  color: var(--asa-label-2);
}

/* ── Mobile result cards ────────────────────── */
.lr-pcard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.lr-pcard__actions .asa-icon-btn {
  width: 2rem;
  height: 2rem;
}

@media (min-width: 480px) {
  .lr-pcard__actions {
    flex-direction: row;
    align-items: center;
  }
}

/* ── Documents ──────────────────────────────── */
.lr-docs {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 640px) {
  .lr-docs {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .lr-docs {
    grid-template-columns: repeat(3, 1fr);
  }
}

.lr-doc {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1rem;
}

.lr-doc__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.lr-docs-empty {
  min-height: 12rem;
}

.lr-docs-empty .asa-empty__sub {
  max-width: 24rem;
}

/* ── Skeleton blocks ────────────────────────── */
.lr-list-skel {
  height: 26rem;
  border-radius: 1.375rem;
}

.lr-docs-skel {
  height: 12rem;
  border-radius: 1.375rem;
}

/* ── Empty state ────────────────────────────── */
.asa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.asa-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-empty__sub {
  margin-top: -0.5rem;
  max-width: 26rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* ── Table / card pills ─────────────────────── */
.asa-pill--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.asa-pill--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.asa-pill--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

/* ── Dialogs — shared pieces ────────────────── */
.lr-req {
  color: var(--asa-rose);
}

.lr-error {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-rose);
}

.lr-date {
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  overflow: hidden;
  transition: box-shadow 150ms var(--ease-default), border-color 150ms var(--ease-default);
}

.lr-date:focus-within {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
  border-color: transparent;
}

.lr-date--error {
  border-color: var(--asa-rose);
}

.lr-date :deep(input) {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.lr-date :deep(input)::placeholder {
  color: var(--asa-label-3);
}

.lr-date-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--asa-label);
}

.lr-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8125rem 1rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.lr-btn--destructive {
  background: var(--asa-rose);
  color: #ffffff;
}

.lr-btn--destructive:hover {
  background: color-mix(in srgb, var(--asa-rose) 88%, #000);
}

/* Patient picker inside dialog */
.lr-patient {
  position: relative;
}

.lr-patient__shell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.625rem;
  padding: 0 0.75rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.lr-patient__shell:focus-within {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.lr-patient__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.lr-patient__input::placeholder {
  color: var(--asa-label-3);
}

.lr-pop {
  position: absolute;
  z-index: 40;
  margin-top: 0.375rem;
  width: 100%;
  max-height: 15rem;
  overflow-y: auto;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: var(--asa-bg-card);
  box-shadow: var(--asa-card-shadow);
}

.lr-pop__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.lr-pop__item:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.lr-pop__empty {
  padding: 1rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  text-align: center;
}

.lr-clear-btn {
  width: 1.875rem;
  height: 1.875rem;
  color: var(--asa-label-3);
}

.lr-clear-btn:hover {
  color: var(--asa-rose);
}

/* Upload drop zone */
.lr-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 1.75rem 1rem;
  border: 1px dashed color-mix(in srgb, var(--asa-label) 28%, transparent);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 2%, transparent);
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), background-color 150ms var(--ease-default);
}

.lr-drop:hover {
  border-color: var(--asa-accent);
  background: var(--asa-accent-soft);
}

.lr-drop__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.lr-drop__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.lr-file-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

/* ── Trend chart ────────────────────────────── */
.lr-chart {
  padding: 1rem;
  margin-bottom: 1.25rem;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 2%, transparent);
}

.lr-chart__grid {
  stroke: color-mix(in srgb, var(--asa-label) 12%, transparent);
}

.lr-chart__band {
  fill: color-mix(in srgb, var(--asa-green) 12%, transparent);
}

.lr-chart__refline {
  stroke: color-mix(in srgb, var(--asa-green) 30%, transparent);
  stroke-dasharray: 2 3;
}

.lr-chart__line {
  stroke: var(--asa-accent);
}

.lr-trend-table {
  overflow-x: auto;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
}

.lr-trend-table thead th {
  padding: 0.625rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: start;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.lr-trend-table tbody td {
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--asa-sep);
}

.lr-trend-row {
  transition: background-color 150ms var(--ease-default);
}

.lr-trend-row:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

/* Avatars */
.sc-avatar {
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
  color: var(--asa-accent-deep);
}

.sc-avatar--sm {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
}

.sc-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

.sc-avatar--xs {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  font-size: 0.6875rem;
}

/* Tints */
.asa-tint--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.asa-tint--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.asa-tint--orange {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.asa-tint--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.asa-tint--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

/* Responsive tuning */
@media (max-width: 480px) {
  .asa-field--search {
    flex-basis: 100% !important;
  }

  .lr-pcard__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .lr-patient-card {
    align-items: flex-start;
  }
}
</style>