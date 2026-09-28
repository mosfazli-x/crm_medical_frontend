<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('prescriptions.title') }}</h1>
        <p class="dash-head__date">{{ t('prescriptions.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="asa-btn asa-btn--primary" @click="openPrescriptionDialog">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('prescriptions.addPrescription') }}
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════
         WORKSTATION  (no patient selected yet)
    ═══════════════════════════════════════════ -->
    <section v-if="!selectedPatient" class="asa-sec">
      <p class="asa-sec__label">{{ t('prescriptions.workstationLabel') }}</p>
      <div class="asa-card pr-workstation">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <MedicalKit class="w-8! h-8! fill-current" />
        </span>
        <div class="pr-workstation__copy">
          <p class="pr-workstation__title">{{ t('prescriptions.workstationTitle') }}</p>
          <p class="pr-workstation__sub">{{ t('prescriptions.workstationDesc') }}</p>
        </div>

        <div class="pr-workstation__search">
          <div class="asa-field asa-field--search pr-search-field">
            <v-text-field v-model="patientSearchQuery" variant="solo" density="comfortable" hide-details clearable
              :placeholder="t('prescriptions.searchPlaceholder')" prepend-inner-icon="mdi-magnify"
              :loading="patientSearching" @update:model-value="onPatientSearchInput" />
          </div>
        </div>

        <!-- Matching patient grid -->
        <div v-if="patientSearchResults.length" class="pr-patients">
          <button v-for="p in patientSearchResults" :key="p.id" type="button"
            class="pr-patient" @click="selectPatient(p)">
            <span class="asa-tint sc-avatar sc-avatar--sm" :class="patientResultTint(p)">
              {{ patientInitials(p) }}
            </span>
            <span class="min-w-0">
              <span class="pr-patient__name block truncate!">{{ p.firstName }} {{ p.lastName }}</span>
              <span class="block pr-muted font-mono text-[0.6875rem]! tracking-wider!">
                {{ p.nationalId }}
                <template v-if="p.phone"> · {{ p.phone }}</template>
              </span>
            </span>
            <v-icon size="16" class="pr-patient__arrow">mdi-chevron-left</v-icon>
          </button>
        </div>

        <p v-else-if="patientSearchQuery.trim() && !patientSearching" class="pr-muted pr-no-match">
          <span class="asa-dot-inline me-1.5! inline-block align-middle!" aria-hidden="true" />
          {{ t('prescriptions.noResults') }}
        </p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         WORKSPACE  (patient selected)
    ═══════════════════════════════════════════ -->
    <template v-else>
      <!-- Patient record card -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('prescriptions.patientRecordLabel') }}</p>
        <div class="asa-card pr-patient-card">
          <span class="asa-tint sc-avatar sc-avatar--lg" :class="patientTint(selectedPatient)">
            {{ patientInitials(selectedPatient) }}
          </span>
          <div class="min-w-0 flex-1!">
            <p class="flex items-center flex-wrap gap-2! min-w-0">
              <span class="pr-patient-card__name">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
              <span class="asa-pill asa-pill--teal">{{ t('prescriptions.activeFile') }}</span>
            </p>
            <p class="pr-patient-card__meta">
              <span class="crm-ltr font-mono tracking-wider!">{{ selectedPatient.nationalId }}</span>
              <span v-if="selectedPatient.phone" class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
              <span v-if="selectedPatient.phone" class="crm-ltr font-mono">{{ selectedPatient.phone }}</span>
            </p>
          </div>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearPatient">
            <v-icon size="14">mdi-account-switch</v-icon>
            {{ t('prescriptions.changePatient') }}
          </button>
        </div>
      </section>

      <!-- Overview metrics -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('prescriptions.overview') }}</p>
        <div class="pr-metrics">
          <article v-for="m in metrics" :key="m.key" class="asa-card pr-metric">
            <span class="asa-tint" :class="m.tint" aria-hidden="true">
              <component :is="m.icon" class="w-5! h-5! fill-current" />
            </span>
            <div class="pr-metric__copy">
              <p class="pr-metric__value">{{ m.value }}</p>
              <p class="pr-metric__label">{{ m.label }}</p>
            </div>
            <p class="pr-metric__foot">
              <span class="asa-dot pr-dot" :class="m.dot" aria-hidden="true" />
              {{ m.foot }}
            </p>
          </article>
        </div>
      </section>

      <!-- ─── Frosted sticky control deck: status chips + search / count / actions ─── -->
      <div class="asa-toolbar pr-toolbar">
        <nav class="pr-chips" :aria-label="t('prescriptions.title')">
          <button v-for="chip in statusChips" :key="chip.key" type="button" class="pr-chip"
            :class="{ 'pr-chip--active': activeStatus === chip.key }" @click="activeStatus = chip.key">
            {{ chip.label }}
            <span class="pr-chip__count" :class="{ 'pr-chip__count--active': activeStatus === chip.key }">
              {{ chip.count }}
            </span>
          </button>
        </nav>
        <div class="pr-toolbar__row">
          <div class="asa-field asa-field--search">
            <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
              :placeholder="t('prescriptions.searchResultPlaceholder')" prepend-inner-icon="mdi-magnify" />
          </div>
          <div class="flex-1! min-w-0" />
          <span class="asa-pill asa-pill--teal whitespace-nowrap!">
            {{ countPill }}
          </span>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openPrescriptionDialog">
            <v-icon size="14">mdi-plus</v-icon>
            {{ t('prescriptions.addPrescription') }}
          </button>
          <v-tooltip :text="t('common.refresh')" location="top">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
                :aria-label="t('common.refresh')" @click="fetchPrescriptions">
                <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
              </button>
            </template>
          </v-tooltip>
        </div>
      </div>

      <!-- ─── Loading skeleton ─── -->
      <template v-if="loading">
        <div class="asa-skel pr-list-skel" />
      </template>

      <!-- ─── Registered prescriptions ─── -->
      <template v-else>
        <!-- Empty: search produced no match -->
        <div v-if="hasQuery && !filteredPrescriptions.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--teal" aria-hidden="true">
            <v-icon icon="mdi-filter-off-outline" size="32" />
          </span>
          <p class="asa-empty__title">{{ t('prescriptions.noSearchResults') }}</p>
          <p class="asa-empty__sub">{{ t('prescriptions.noSearchResultsDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="searchQuery = ''">
            <v-icon size="14">mdi-filter-remove-outline</v-icon>
            {{ t('common.clear') }}
          </button>
        </div>

        <!-- Empty: no prescriptions at all -->
        <div v-else-if="!prescriptions.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--teal" aria-hidden="true">
            <AddClipboard class="w-8! h-8! fill-current" />
          </span>
          <p class="asa-empty__title">{{ t('prescriptions.noPrescriptions') }}</p>
          <p class="asa-empty__sub">{{ t('prescriptions.noPrescriptionsDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openPrescriptionDialog">
            <v-icon size="14">mdi-plus</v-icon>
            {{ t('prescriptions.addPrescription') }}
          </button>
        </div>

        <!-- Empty: current status filter has none -->
        <div v-else-if="!filteredPrescriptions.length" class="asa-card asa-empty">
          <span class="asa-tint asa-tint--indigo" aria-hidden="true">
            <MedicalKit class="w-8! h-8! fill-current" />
          </span>
          <p class="asa-empty__title">{{ t('prescriptions.noSearchResults') }}</p>
          <p class="asa-empty__sub">{{ t('prescriptions.noSearchResultsDesc') }}</p>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="activeStatus = 'all'">
            <v-icon size="14">mdi-filter-remove-outline</v-icon>
            {{ t('common.clear') }}
          </button>
        </div>

        <template v-else>
          <!-- Desktop table (lg and up) -->
          <section class="asa-sec hidden! lg:block!">
            <div class="asa-card pr-table-card">
              <div class="pr-table-wrap">
                <table class="pr-table">
                  <thead>
                    <tr>
                      <th>{{ t('prescriptions.medication') }}</th>
                      <th>{{ t('prescriptions.dosage') }}</th>
                      <th>{{ t('prescriptions.frequency') }}</th>
                      <th>{{ t('prescriptions.startDate') }}</th>
                      <th>{{ t('prescriptions.refills') }}</th>
                      <th>{{ t('prescriptions.status') }}</th>
                      <th class="pr-th-end">{{ t('prescriptions.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in filteredPrescriptions" :key="r.id">
                      <td>
                        <span class="pr-td-test block">{{ r.medicationName }}</span>
                        <span class="pr-muted block text-[0.6875rem]!">
                          <span v-if="r.route">{{ r.route }}</span>
                          <template v-if="r.duration">
                            <template v-if="r.route"> · </template>{{ r.duration }}
                          </template>
                        </span>
                      </td>
                      <td>
                        <span class="pr-mono-strong">{{ r.dosage }}</span>
                      </td>
                      <td>
                        <span class="whitespace-nowrap!">{{ r.frequency || '—' }}</span>
                      </td>
                      <td>
                        <span class="whitespace-nowrap!">{{ periodText(r) }}</span>
                      </td>
                      <td>
                        <span class="pr-mono-strong">{{ r.refills ?? 0 }}</span>
                      </td>
                      <td>
                        <span class="asa-pill" :class="r.isActive ? 'asa-pill--green' : 'asa-pill--rose'">
                          {{ r.isActive ? t('prescriptions.active') : t('prescriptions.discontinued') }}
                        </span>
                      </td>
                      <td class="pr-th-end">
                        <div class="flex items-center justify-end gap-1.5">
                          <v-tooltip v-if="r.isActive" :text="t('prescriptions.discontinue')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('prescriptions.discontinue')" @click="openDiscontinueDialog(r)">
                                <v-icon size="17">mdi-pause-circle-outline</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip :text="t('prescriptions.editRecord')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('prescriptions.editRecord')" @click="openEditPrescription(r)">
                                <v-icon size="17">mdi-pencil</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip :text="t('prescriptions.deleteRecord')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--danger"
                                :aria-label="t('prescriptions.deleteRecord')" @click="askDeletePrescription(r)">
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
            <article v-for="r in filteredPrescriptions" :key="`c-${r.id}`" class="asa-card asa-pcard pr-pcard">
              <span class="asa-tint sc-avatar sc-avatar--lg" :class="r.isActive ? 'asa-tint--green' : 'asa-tint--rose'">
                <MedicalKit class="w-4! h-4! fill-current" />
              </span>
              <div class="asa-pcard__main">
                <p class="asa-pcard__name">
                  {{ r.medicationName }}
                  <span class="asa-pill" :class="r.isActive ? 'asa-pill--green' : 'asa-pill--rose'">
                    {{ r.isActive ? t('prescriptions.active') : t('prescriptions.discontinued') }}
                  </span>
                </p>
                <p class="asa-pcard__meta">
                  <span class="pr-mono-strong">{{ r.dosage }}</span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span>{{ r.frequency || '—' }}</span>
                </p>
                <p class="asa-pcard__meta">
                  <span>{{ r.route || '—' }}{{ r.duration ? ` · ${r.duration}` : '' }}</span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span>{{ periodText(r) }}</span>
                </p>
                <p v-if="r.instructions" class="pr-pcard__notes">
                  {{ r.instructions }}
                </p>
                <p v-if="!r.isActive && r.discontinuedReason" class="pr-pcard__notes pr-pcard__notes--amber">
                  {{ t('prescriptions.reason') }}: {{ r.discontinuedReason }}
                </p>
              </div>
              <div class="pr-pcard__actions">
                <button v-if="r.isActive" type="button" class="asa-icon-btn"
                  :aria-label="t('prescriptions.discontinue')" @click="openDiscontinueDialog(r)">
                  <v-icon size="17">mdi-pause-circle-outline</v-icon>
                </button>
                <button type="button" class="asa-icon-btn" :aria-label="t('prescriptions.editRecord')"
                  @click="openEditPrescription(r)">
                  <v-icon size="17">mdi-pencil</v-icon>
                </button>
                <button type="button" class="asa-icon-btn asa-icon-btn--danger"
                  :aria-label="t('prescriptions.deleteRecord')" @click="askDeletePrescription(r)">
                  <v-icon size="17">mdi-trash-can-outline</v-icon>
                </button>
              </div>
            </article>
          </div>
        </template>
      </template>
    </template>

    <!-- ═══════════════════════════════════════════
         ADD / EDIT PRESCRIPTION DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="prescriptionDialog" max-width="640" @click:outside="dialogPatientResults = []">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">
              {{ editingId ? t('prescriptions.editPrescription') : t('prescriptions.newPrescription') }}
            </h2>
            <span class="asa-dialog__sub">{{ t('prescriptions.subtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="prescriptionDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <!-- Patient picker (create mode) -->
            <div v-if="!editingId" class="asa-field">
              <label class="asa-field-label">{{ t('prescriptions.patientLabel') }} <span class="pr-req">*</span></label>
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
                <button type="button" class="asa-icon-btn pr-clear-btn" :aria-label="t('common.clear')"
                  @click="clearDialogPatient">
                  <v-icon size="16">mdi-close</v-icon>
                </button>
              </div>
              <div v-else class="pr-patient">
                <div class="pr-patient__shell">
                  <v-icon size="17">mdi-magnify</v-icon>
                  <input v-model="dialogPatientQuery" type="text" class="pr-patient__input"
                    :placeholder="t('prescriptions.searchPlaceholder')" autocomplete="off"
                    @input="onDialogPatientInput" @focus="showDialogPatientResults = dialogPatientResults.length > 0"
                    @blur="hideDialogPatientResults">
                  <v-progress-circular v-if="dialogPatientSearching" size="16" width="2" indeterminate color="rgba(0, 173, 181, 1)" />
                </div>
                <div v-if="showDialogPatientResults" class="pr-pop">
                  <template v-if="dialogPatientResults.length">
                    <button v-for="p in dialogPatientResults" :key="p.id" type="button"
                      class="pr-pop__item" @mousedown.prevent="selectDialogPatient(p)">
                      <span class="asa-tint sc-avatar sc-avatar--xs" :class="patientResultTint(p)">
                        {{ patientInitials(p) }}
                      </span>
                      <span class="min-w-0">
                        <span class="block text-[0.8125rem]! font-semibold! truncate!">{{ p.firstName }} {{ p.lastName }}</span>
                        <span class="block crm-ltr font-mono text-[0.6875rem]! tracking-wider! pr-muted">
                          {{ p.nationalId }}
                          <template v-if="p.phone"> · {{ p.phone }}</template>
                        </span>
                      </span>
                    </button>
                  </template>
                  <p v-else-if="dialogPatientSearched" class="pr-pop__empty">{{ t('prescriptions.noResults') }}</p>
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
                <label class="asa-field-label">{{ t('prescriptions.medication') }} <span class="pr-req">*</span></label>
                <v-combobox v-model="manualForm.medication_name" :items="commonMedications" variant="solo"
                  density="comfortable" hide-details :placeholder="t('prescriptions.form.medicationNamePlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.medication'), false, (text: string) => manualForm.medication_name = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.dosage') }} <span class="pr-req">*</span></label>
                <v-text-field v-model="manualForm.dosage" variant="solo" density="comfortable" hide-details
                  :placeholder="t('prescriptions.form.dosagePlaceholder')" class="font-mono!"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.dosage'), false, (text: string) => manualForm.dosage = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.frequency') }}</label>
                <v-text-field v-model="manualForm.frequency" variant="solo" density="comfortable" hide-details
                  :placeholder="t('prescriptions.form.frequencyPlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.frequency'), false, (text: string) => manualForm.frequency = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.route') }}</label>
                <v-combobox v-model="manualForm.route" :items="commonRoutes" variant="solo"
                  density="comfortable" hide-details :placeholder="t('prescriptions.form.routePlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.route'), false, (text: string) => manualForm.route = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.duration') }}</label>
                <v-text-field v-model="manualForm.duration" variant="solo" density="comfortable" hide-details
                  :placeholder="t('prescriptions.form.durationPlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.duration'), false, (text: string) => manualForm.duration = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.quantity') }}</label>
                <v-text-field v-model="manualForm.quantity" type="number" min="0" step="any" variant="solo"
                  density="comfortable" hide-details :placeholder="t('prescriptions.form.quantityPlaceholder')"
                  class="font-mono!"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.quantity'), true, (text: string) => manualForm.quantity = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.refills') }}</label>
                <v-text-field v-model="manualForm.refills" type="number" min="0" step="1" variant="solo"
                  density="comfortable" hide-details :placeholder="t('prescriptions.form.refillsPlaceholder')"
                  class="font-mono!"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.refills'), true, (text: string) => manualForm.refills = text)" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.startDate') }}</label>
                <div class="pr-date">
                  <PersianDatetimePicker v-model="manualForm.start_date" type="date"
                    :placeholder="t('prescriptions.startDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="pr-date__picker" />
                </div>
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('prescriptions.endDate') }}</label>
                <div class="pr-date">
                  <PersianDatetimePicker v-model="manualForm.end_date" type="date"
                    :placeholder="t('prescriptions.endDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="pr-date__picker" />
                </div>
              </div>

              <div class="asa-field sm:col-span-2!">
                <label class="asa-field-label">{{ t('prescriptions.instructions') }}</label>
                <v-textarea v-model="manualForm.instructions" variant="solo" density="comfortable" rows="2"
                  auto-grow hide-details :placeholder="t('prescriptions.form.instructionsPlaceholder')"
                  append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting(t('prescriptions.instructions'), false, (text: string) => manualForm.instructions = text)" />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="savingPrescription"
            @click="prescriptionDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="savingPrescription"
            @click="submitPrescription">
            <v-icon v-if="savingPrescription" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ editingId ? t('prescriptions.saveChanges') : t('prescriptions.saveAndFinalize') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════
         DISCONTINUE DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="discontinueDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--amber" aria-hidden="true">
              <v-icon size="20">mdi-pause-circle-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('prescriptions.discontinueTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('prescriptions.disconfirmMessage') }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="discontinueDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="discontinueTarget" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--amber" aria-hidden="true">
              <MedicalKit class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ discontinueTarget.medicationName }}</p>
              <p class="asa-note__value truncate!">
                {{ discontinueTarget.dosage }}
                <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                {{ discontinueTarget.frequency || '—' }}
              </p>
            </div>
          </div>

          <div class="asa-field mt-4!">
            <label class="asa-field-label">{{ t('prescriptions.discontinueReason') }}</label>
            <v-textarea v-model="discontinueReason" variant="solo" density="comfortable" rows="2"
              auto-grow hide-details :placeholder="t('prescriptions.discontinueReasonPlaceholder')"
              append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting(t('prescriptions.discontinueReason'), false, (text: string) => discontinueReason = text)" />
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="discontinuing"
            @click="discontinueDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn pr-btn--amber" :disabled="discontinuing"
            @click="submitDiscontinue">
            <v-icon v-if="discontinuing" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('prescriptions.discontinue') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ═══════════════════════════════════════════
         DELETE CONFIRMATION DIALOG
    ═══════════════════════════════════════════ -->
    <v-dialog v-model="deletePrescriptionDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-trash-can-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('prescriptions.deleteTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('prescriptions.deleteConfirm') }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="deletePrescriptionDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="deleteTarget" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--rose" aria-hidden="true">
              <MedicalKit class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ deleteTarget.medicationName }}</p>
              <p class="asa-note__value truncate!">
                {{ deleteTarget.dosage }}
                <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                {{ periodText(deleteTarget) }}
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="deleting"
            @click="deletePrescriptionDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn pr-btn--destructive" :disabled="deleting"
            @click="deletePrescription">
            <v-icon v-if="deleting" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('prescriptions.deletePermanently') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
      @insert="applyHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import AddClipboard from '~/components/icons/AddClipboard.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import ClipboardX from '~/components/icons/ClipboardX.vue'
import Clock from '~/components/icons/Clock.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  nationalId?: string | null
  phone?: string | null
}

interface PrescriptionItem {
  id: string
  patientId?: string | null
  doctorId?: string | null
  medicationName: string
  dosage: string
  frequency?: string | null
  route?: string | null
  duration?: string | null
  quantity?: number | null
  refills?: number | null
  instructions?: string | null
  startDate?: string | null
  endDate?: string | null
  isActive?: boolean | null
  discontinuedReason?: string | null
  createdAt?: string | null
}

interface PrescriptionForm {
  medication_name: string
  dosage: string
  frequency: string
  route: string
  duration: string
  quantity: string
  refills: string
  instructions: string
  start_date: string
  end_date: string
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
let workstationTimer: ReturnType<typeof setTimeout> | null = null

function onPatientSearchInput() {
  if (workstationTimer) clearTimeout(workstationTimer)
  if (!patientSearchQuery.value.trim()) {
    patientSearchResults.value = []
    return
  }
  workstationTimer = setTimeout(() => searchWorkstationPatients(), 350)
}

async function searchWorkstationPatients() {
  const q = patientSearchQuery.value.trim()
  if (!q) return
  patientSearching.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PatientOption[] }>(
      `/api/patients/search?q=${encodeURIComponent(q)}`
    )
    patientSearchResults.value = res.success ? (res.data || []) : []
  } catch {
    patientSearchResults.value = []
  } finally {
    patientSearching.value = false
  }
}

function selectPatient(p: PatientOption) {
  selectedPatient.value = p
  resetWorkstationSearch()
}

function clearPatient() {
  selectedPatient.value = null
  resetWorkstationSearch()
}

function resetWorkstationSearch() {
  patientSearchQuery.value = ''
  patientSearchResults.value = []
}

// ─── Data ───
const prescriptions = ref<PrescriptionItem[]>([])
const loading = ref(false)

async function fetchPrescriptions() {
  const pid = selectedPatient.value?.id
  if (!pid) return
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PrescriptionItem[] }>(
      `/api/prescriptions/patient/${pid}`
    )
    prescriptions.value = res.success ? (res.data || []) : []
    if (!res.success) $toast.error(t('prescriptions.fetchError'))
  } catch {
    prescriptions.value = []
    $toast.error(t('prescriptions.fetchError'))
  } finally {
    loading.value = false
  }
}

watch(selectedPatient, (val) => {
  activeStatus.value = 'all'
  searchQuery.value = ''
  if (val) fetchPrescriptions()
})

// ─── Overview metrics ───
const countTotal = computed(() => prescriptions.value.length)
const countActive = computed(() => prescriptions.value.filter((r) => r.isActive).length)
const countDiscontinued = computed(() => prescriptions.value.filter((r) => !r.isActive).length)
const refillsTotal = computed(() =>
  prescriptions.value.reduce((sum, r) => sum + (Number(r.refills) || 0), 0)
)

const metrics = computed(() => [
  {
    key: 'total', icon: ClipboardCheck, tint: 'asa-tint--indigo', dot: 'pr-dot--indigo',
    value: countTotal.value, label: t('prescriptions.metricTotal'),
    foot: t('prescriptions.metricTotalFoot'),
  },
  {
    key: 'active', icon: HeartPulse, tint: 'asa-tint--green', dot: 'pr-dot--green',
    value: countActive.value, label: t('prescriptions.metricActive'),
    foot: t('prescriptions.metricActiveFoot'),
  },
  {
    key: 'discontinued', icon: ClipboardX, tint: 'asa-tint--rose', dot: 'pr-dot--rose',
    value: countDiscontinued.value, label: t('prescriptions.metricDiscontinued'),
    foot: t('prescriptions.metricDiscontinuedFoot'),
  },
  {
    key: 'refills', icon: Clock, tint: 'asa-tint--amber', dot: 'pr-dot--amber',
    value: refillsTotal.value, label: t('prescriptions.metricRefills'),
    foot: t('prescriptions.metricRefillsFoot'),
  },
])

// ─── Status filters ───
const activeStatus = ref<'all' | 'active' | 'inactive'>('all')
const searchQuery = ref('')

const statusChips = computed(() => [
  { key: 'all', label: t('prescriptions.filterAll'), count: countTotal.value },
  { key: 'active', label: t('prescriptions.active'), count: countActive.value },
  { key: 'inactive', label: t('prescriptions.discontinued'), count: countDiscontinued.value },
])

const filteredPrescriptions = computed(() => {
  let list = prescriptions.value
  if (activeStatus.value === 'active')
    list = list.filter((r) => r.isActive)
  else if (activeStatus.value === 'inactive')
    list = list.filter((r) => !r.isActive)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((r) => {
      const name = (r.medicationName || '').toLowerCase()
      const dosage = (r.dosage || '').toLowerCase()
      const freq = (r.frequency || '').toLowerCase()
      return name.includes(q) || dosage.includes(q) || freq.includes(q)
    })
  }
  return list
})

const hasQuery = computed(() => searchQuery.value.trim() !== '')

const countPill = computed(() => t('prescriptions.resultsCount', { count: filteredPrescriptions.value.length }))

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

// ─── Formatting helpers ───
function formatJalaliDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

function periodText(r: PrescriptionItem): string {
  const start = r.startDate ? formatJalaliDate(r.startDate) : ''
  const end = r.endDate ? formatJalaliDate(r.endDate) : ''
  if (start && end) return `${start} → ${end}`
  return start || end || '—'
}

// ─── Add / edit prescription form ───
const prescriptionDialog = ref(false)
const savingPrescription = ref(false)
const editingId = ref<string | null>(null)
const editingPrescription = ref<PrescriptionItem | null>(null)

const manualForm = ref<PrescriptionForm>({
  medication_name: '',
  dosage: '',
  frequency: '',
  route: '',
  duration: '',
  quantity: '',
  refills: '0',
  instructions: '',
  start_date: '',
  end_date: '',
})

const commonMedications = [
  'Acetaminophen', 'Ibuprofen', 'Amoxicillin', 'Ciprofloxacin', 'Metformin',
  'Atorvastatin', 'Amlodipine', 'Losartan', 'Omeprazole', 'Levothyroxine',
  'Salbutamol', 'Cetirizine', 'Vitamin D3', 'Folic Acid', 'Ferrous Sulfate',
]

const commonRoutes = [
  'Oral', 'Sublingual', 'Topical', 'IV', 'IM', 'SC', 'Inhalation', 'Ophthalmic', 'Otic', 'Rectal', 'Vaginal', 'Other',
]

function resetManualForm() {
  manualForm.value = {
    medication_name: '',
    dosage: '',
    frequency: '',
    route: '',
    duration: '',
    quantity: '',
    refills: '0',
    instructions: '',
    start_date: '',
    end_date: '',
  }
}

function openPrescriptionDialog() {
  editingId.value = null
  editingPrescription.value = null
  resetManualForm()
  dialogPatient.value = selectedPatient.value
  resetDialogPatientSearch()
  prescriptionDialog.value = true
}

function openEditPrescription(r: PrescriptionItem) {
  editingId.value = r.id
  editingPrescription.value = r
  manualForm.value = {
    medication_name: r.medicationName || '',
    dosage: r.dosage || '',
    frequency: r.frequency || '',
    route: r.route || '',
    duration: r.duration || '',
    quantity: r.quantity == null ? '' : String(r.quantity),
    refills: r.refills == null ? '0' : String(r.refills),
    instructions: r.instructions || '',
    start_date: r.startDate || '',
    end_date: r.endDate || '',
  }
  prescriptionDialog.value = true
}

function toNumberOrUndefined(v: string): number | undefined {
  const trimmed = (v || '').trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

async function submitPrescription() {
  if (!editingId.value && !dialogPatient.value) {
    $toast.error(t('prescriptions.patientRequired'))
    return
  }
  if (!manualForm.value.medication_name.trim()) {
    $toast.error(t('prescriptions.medicationNameRequired'))
    return
  }
  if (!manualForm.value.dosage.trim()) {
    $toast.error(t('prescriptions.dosageRequired'))
    return
  }

  savingPrescription.value = true
  try {
    if (editingId.value) {
      const body = {
        medication_name: manualForm.value.medication_name.trim(),
        dosage: manualForm.value.dosage.trim(),
        frequency: manualForm.value.frequency.trim() || undefined,
        route: manualForm.value.route.trim() || undefined,
        duration: manualForm.value.duration.trim() || undefined,
        quantity: toNumberOrUndefined(manualForm.value.quantity),
        refills: toNumberOrUndefined(manualForm.value.refills) ?? 0,
        instructions: manualForm.value.instructions.trim() || undefined,
        start_date: manualForm.value.start_date || undefined,
        end_date: manualForm.value.end_date || undefined,
      }
      const res = await apiFetch<{ success: boolean; error?: string }>(
        `/api/prescriptions/${editingId.value}`,
        { method: 'PUT', body }
      )
      if (res.success) {
        $toast.success(t('prescriptions.prescriptionUpdated'))
      } else {
        $toast.error(res.error || t('prescriptions.prescriptionUpdateError'))
        return
      }
    } else {
      const body = {
        patient_id: dialogPatient.value!.id,
        medication_name: manualForm.value.medication_name.trim(),
        dosage: manualForm.value.dosage.trim(),
        frequency: manualForm.value.frequency.trim() || undefined,
        route: manualForm.value.route.trim() || undefined,
        duration: manualForm.value.duration.trim() || undefined,
        quantity: toNumberOrUndefined(manualForm.value.quantity),
        refills: toNumberOrUndefined(manualForm.value.refills) ?? 0,
        instructions: manualForm.value.instructions.trim() || undefined,
        start_date: manualForm.value.start_date || undefined,
        end_date: manualForm.value.end_date || undefined,
      }
      const res = await apiFetch<{ success: boolean; error?: string }>('/api/prescriptions', {
        method: 'POST',
        body,
      })
      if (res.success) {
        $toast.success(t('prescriptions.saveSuccess'))
      } else {
        $toast.error(res.error || t('prescriptions.saveError'))
        return
      }
    }
    prescriptionDialog.value = false
    if (!selectedPatient.value && dialogPatient.value) {
      selectedPatient.value = dialogPatient.value
    }
    await fetchPrescriptions()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || (editingId.value ? t('prescriptions.prescriptionUpdateError') : t('prescriptions.saveError')))
  } finally {
    savingPrescription.value = false
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

watch(prescriptionDialog, (val) => {
  if (!val) {
    resetManualForm()
    if (dialogPatientTimer) clearTimeout(dialogPatientTimer)
  }
})

// ─── Discontinue ───
const discontinueDialog = ref(false)
const discontinuing = ref(false)
const discontinueTarget = ref<PrescriptionItem | null>(null)
const discontinueReason = ref('')

function openDiscontinueDialog(r: PrescriptionItem) {
  discontinueTarget.value = r
  discontinueReason.value = ''
  discontinueDialog.value = true
}

async function submitDiscontinue() {
  const target = discontinueTarget.value
  if (!target) return
  discontinuing.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(
      `/api/prescriptions/${target.id}/discontinue`,
      { method: 'POST', body: { reason: discontinueReason.value.trim() || undefined } }
    )
    if (res.success) {
      $toast.success(t('prescriptions.discontinueSuccess'))
      discontinueDialog.value = false
      discontinueTarget.value = null
      await fetchPrescriptions()
    } else {
      $toast.error(res.error || t('prescriptions.discontinueError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('prescriptions.discontinueError'))
  } finally {
    discontinuing.value = false
  }
}

// ─── Delete ───
const deletePrescriptionDialog = ref(false)
const deleting = ref(false)
const deleteTarget = ref<PrescriptionItem | null>(null)

function askDeletePrescription(r: PrescriptionItem) {
  deleteTarget.value = r
  deletePrescriptionDialog.value = true
}

async function deletePrescription() {
  const target = deleteTarget.value
  if (!target) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(`/api/prescriptions/${target.id}`, {
      method: 'DELETE',
    })
    if (res.success) {
      $toast.success(t('prescriptions.deleteSuccess'))
      deletePrescriptionDialog.value = false
      deleteTarget.value = null
      await fetchPrescriptions()
    } else {
      $toast.error(res.error || t('prescriptions.deleteError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('prescriptions.deleteError'))
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

useSeoMeta({ title: t('prescriptions.titleSeo') })
</script>

<style scoped>
/* ── Workstation (empty) state ──────────────── */
.pr-workstation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.pr-workstation__copy {
  max-width: 34rem;
}

.pr-workstation__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--asa-label);
}

.pr-workstation__sub {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--asa-label-2);
}

.pr-workstation__search {
  width: min(100%, 30rem);
  margin-top: 0.25rem;
}

.pr-workstation .pr-search-field {
  flex: none;
}

.pr-no-match {
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pr-patients {
  width: 100%;
  max-width: 30rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem;
  text-align: start;
}

.pr-patient {
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

.pr-patient:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-color: var(--asa-sep);
}

.pr-patient__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.pr-patient__arrow {
  color: var(--asa-label-3);
  margin-inline-start: auto;
  flex-shrink: 0;
}

.pr-muted {
  color: var(--asa-label-2);
}

/* ── Patient record card ────────────────────── */
.pr-patient-card {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.pr-patient-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.pr-patient-card__meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* ── Metrics grid ───────────────────────────── */
.pr-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 560px) {
  .pr-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .pr-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.pr-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1.125rem 1.25rem;
}

.pr-metric__copy {
  min-width: 0;
  text-align: end;
}

.pr-metric__value {
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

.pr-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.pr-metric__foot {
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

.pr-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-label-3) 18%, transparent);
}

.pr-dot--indigo {
  background: var(--asa-indigo);
  box-shadow: 0 0 0 3px var(--asa-indigo-soft);
}

.pr-dot--amber {
  background: var(--asa-amber);
  box-shadow: 0 0 0 3px var(--asa-amber-soft);
}

.pr-dot--green {
  background: var(--asa-green);
  box-shadow: 0 0 0 3px var(--asa-green-soft);
}

.pr-dot--rose {
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

.pr-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

/* Status chips */
.pr-chips {
  display: flex;
  gap: 0.375rem;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.0625rem;
}

.pr-chips::-webkit-scrollbar {
  display: none;
}

.pr-chip {
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

.pr-chip:hover {
  color: var(--asa-label);
}

.pr-chip__count {
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--asa-label-2);
  background: color-mix(in srgb, var(--asa-label) 10%, transparent);
}

.pr-chip--active {
  background: var(--asa-label);
  color: var(--asa-bg-card);
}

.pr-chip--active .pr-chip__count {
  background: color-mix(in srgb, var(--asa-bg-card) 24%, transparent);
  color: var(--asa-bg-card);
}

.dark .pr-chip--active {
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
.pr-table-card {
  padding: 0;
  overflow: hidden;
}

.pr-table-wrap {
  overflow-x: auto;
}

.pr-table {
  width: 100%;
  min-width: 54rem;
  border-collapse: collapse;
  text-align: start;
}

.pr-table thead th {
  padding: 0.6875rem 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.pr-table tbody td {
  padding: 0.75rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.pr-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.pr-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .pr-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.pr-th-end {
  text-align: end !important;
}

.pr-td-test {
  display: block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: var(--asa-label);
}

.pr-mono-strong {
  font-weight: 700;
  font-family: var(--asa-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 0.8125rem;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

/* ── Mobile prescription cards ──────────────── */
.pr-pcard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.pr-pcard__actions .asa-icon-btn {
  width: 2rem;
  height: 2rem;
}

@media (min-width: 480px) {
  .pr-pcard__actions {
    flex-direction: row;
    align-items: center;
  }
}

.pr-pcard__notes {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--asa-label-3);
}

.pr-pcard__notes--amber {
  color: var(--asa-amber);
}

/* ── Skeleton block ─────────────────────────── */
.pr-list-skel {
  height: 26rem;
  border-radius: 1.375rem;
  margin-top: 1.25rem;
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
.pr-req {
  color: var(--asa-rose);
}

.pr-date {
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  overflow: hidden;
  transition: box-shadow 150ms var(--ease-default), border-color 150ms var(--ease-default);
}

.pr-date:focus-within {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
  border-color: transparent;
}

.pr-date :deep(input) {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.pr-date :deep(input)::placeholder {
  color: var(--asa-label-3);
}

.pr-btn--amber {
  background: var(--asa-amber);
  color: #ffffff;
}

.pr-btn--amber:hover {
  background: color-mix(in srgb, var(--asa-amber) 88%, #000);
}

.pr-btn--destructive {
  background: var(--asa-rose);
  color: #ffffff;
}

.pr-btn--destructive:hover {
  background: color-mix(in srgb, var(--asa-rose) 88%, #000);
}

/* Patient picker inside dialog */
.pr-patient {
  position: relative;
}

.pr-patient__shell {
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

.pr-patient__shell:focus-within {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.pr-patient__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.pr-patient__input::placeholder {
  color: var(--asa-label-3);
}

.pr-pop {
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

.pr-pop__item {
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

.pr-pop__item:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.pr-pop__empty {
  padding: 1rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  text-align: center;
}

.pr-clear-btn {
  width: 1.875rem;
  height: 1.875rem;
  color: var(--asa-label-3);
}

.pr-clear-btn:hover {
  color: var(--asa-rose);
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

  .pr-pcard__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .pr-patient-card {
    align-items: flex-start;
  }
}
</style>