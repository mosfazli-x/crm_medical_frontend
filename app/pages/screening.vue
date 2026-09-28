<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head sc-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('screening.title') }}</h1>
        <p class="dash-head__date">{{ t('screening.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="asa-btn asa-btn--primary" @click="openAddSchedule">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('screening.addNew') }}
        </button>
      </div>
    </header>

    <!-- ─── Loading skeletons ─── -->
    <div v-if="loading && !schedules.length">
      <div class="sc-metrics">
        <div v-for="n in 4" :key="`m-${n}`" class="asa-skel sc-metric-skel" />
      </div>
      <div class="asa-skel sc-list-skel" />
    </div>

    <template v-else>
      <!-- ─── Overview metrics ─── -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('screening.overview') }}</p>
        <div class="sc-metrics">
          <article v-for="m in metrics" :key="m.key" class="asa-card sc-metric">
            <span class="asa-tint" :class="m.tint" aria-hidden="true">
              <component :is="m.icon" class="w-5! h-5! fill-current" />
            </span>
            <div class="sc-metric__copy">
              <p class="sc-metric__value">{{ m.value }}</p>
              <p class="sc-metric__label">{{ m.label }}</p>
            </div>
            <p class="sc-metric__foot">
              <span class="sc-dot" :class="m.dot" aria-hidden="true" />
              {{ m.foot }}
            </p>
          </article>
        </div>
      </section>

      <!-- ─── Frosted sticky control deck: tabs + search / count / actions ─── -->
      <div class="asa-toolbar sc-toolbar">
        <nav class="sc-tabs" :aria-label="t('screening.title')">
          <button v-for="tab in tabs" :key="tab.key" type="button" class="sc-tab"
            :class="{ 'sc-tab--active': activeTab === tab.key }" @click="activeTab = tab.key">
            {{ tab.label }}
          </button>
        </nav>
        <div class="sc-toolbar__row">
          <div class="asa-field asa-field--search">
            <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
              :placeholder="t('screening.searchPlaceholder')" prepend-inner-icon="mdi-magnify" />
          </div>
          <div class="flex-1! min-w-0" />
          <span class="asa-pill asa-pill--teal whitespace-nowrap!">
            {{ countPill }}
          </span>
          <button v-if="activeTab === 'results'" type="button" class="asa-btn asa-btn--primary asa-btn--sm"
            @click="openAddResult">
            <v-icon size="14">mdi-plus</v-icon>
            {{ t('screening.recordResult') }}
          </button>
          <v-tooltip :text="t('screening.refresh')" location="top">
            <template #activator="{ props }">
              <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
                :aria-label="t('screening.refresh')" @click="fetchAll">
                <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
              </button>
            </template>
          </v-tooltip>
        </div>
      </div>

      <!-- ─── Empty: no match with active search ─── -->
      <div v-if="hasQuery && !filteredList.length" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--indigo" aria-hidden="true">
          <v-icon icon="mdi-filter-off-outline" size="32" />
        </span>
        <p class="asa-empty__title">{{ t('screening.noResults') }}</p>
        <p class="asa-empty__sub">{{ t('screening.noResultsDesc') }}</p>
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="searchQuery = ''">
          <v-icon size="14">mdi-filter-remove-outline</v-icon>
          {{ t('common.clear') }}
        </button>
      </div>

      <!-- ─── Empty: no schedules at all ─── -->
      <div v-else-if="!filteredList.length && activeTab !== 'results'" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <DocumentText class="w-8! h-8! fill-current" />
        </span>
        <p class="asa-empty__title">{{ t('screening.noData') }}</p>
        <p class="asa-empty__sub">{{ t('screening.subtitle') }}</p>
        <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openAddSchedule">
          <v-icon size="14">mdi-plus</v-icon>
          {{ t('screening.addNew') }}
        </button>
      </div>

      <!-- ─── Empty: no results yet ─── -->
      <div v-else-if="!filteredList.length && activeTab === 'results'" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <Microscope class="w-8! h-8! fill-current" />
        </span>
        <p class="asa-empty__title">{{ t('screening.noResultsYet') }}</p>
        <p class="asa-empty__sub">{{ t('screening.subtitle') }}</p>
        <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openAddResult">
          <v-icon size="14">mdi-plus</v-icon>
          {{ t('screening.recordResult') }}
        </button>
      </div>

      <!-- ─── Lists ─── -->
      <template v-else>
        <!-- Schedules -->
        <template v-if="activeTab !== 'results'">
          <!-- Desktop table (lg and up) -->
          <section class="asa-sec hidden! lg:block!">
            <div class="asa-card sc-table-card">
              <div class="sc-table-wrap">
                <table class="sc-table">
                  <thead>
                    <tr>
                      <th>{{ t('screening.patientHeader') }}</th>
                      <th>{{ t('screening.typeHeader') }}</th>
                      <th>{{ t('screening.dueDateHeader') }}</th>
                      <th>{{ t('screening.riskLevelHeader') }}</th>
                      <th>{{ t('screening.statusHeader') }}</th>
                      <th class="sc-th-end">{{ t('common.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="s in filteredList" :key="s.id">
                      <td>
                        <div class="flex items-center gap-3 min-w-0">
                          <span class="asa-tint sc-avatar sc-avatar--sm" :class="patientTint(s)">
                            {{ patientInitials(s) }}
                          </span>
                          <span class="min-w-0">
                            <span class="sc-td-name block">{{ patientName(s) }}</span>
                            <span class="crm-ltr font-mono block text-[0.6875rem]! tracking-wider!" style="color: var(--asa-label-2)">
                              {{ s.patientNationalId }}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="flex items-center gap-2">
                          <Microscope class="w-4! h-4! fill-current opacity-60" />
                          {{ screeningTypeLabel(s.screeningType) }}
                        </span>
                      </td>
                      <td>
                        <span class="whitespace-nowrap!">{{ formatJalaliDate(s.dueDate) }}</span>
                      </td>
                      <td>
                        <span v-if="s.riskLevel" class="asa-pill" :class="riskPillClass(s.riskLevel)">
                          {{ riskLabel(s.riskLevel) }}
                        </span>
                        <span v-else class="sc-muted">—</span>
                      </td>
                      <td>
                        <span class="asa-pill" :class="statusPillClass(s.status)">
                          {{ statusLabel(s.status) }}
                        </span>
                      </td>
                      <td class="sc-th-end">
                        <div class="flex items-center justify-end gap-1.5">
                          <template v-if="s.status === 'pending' || s.status === 'overdue'">
                            <button type="button" class="asa-btn sc-btn--green asa-btn--sm" :disabled="scBusy(s.id)"
                              @click="markCompleted(s)">
                              <v-icon size="14">mdi-check</v-icon>
                              {{ t('screening.markCompleted') }}
                            </button>
                          </template>
                          <v-tooltip :text="t('screening.edit')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('screening.edit')" @click="openEditSchedule(s)">
                                <v-icon size="17">mdi-pencil</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                          <v-tooltip :text="t('screening.deleteProgram')" location="top">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--danger"
                                :aria-label="t('screening.deleteProgram')" @click="askDelete(s)">
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
            <article v-for="s in filteredList" :key="`c-${s.id}`" class="asa-card asa-pcard sc-pcard">
              <span class="asa-tint sc-avatar sc-avatar--lg" :class="patientTint(s)">
                {{ patientInitials(s) }}
              </span>
              <div class="asa-pcard__main">
                <p class="asa-pcard__name">
                  {{ patientName(s) }}
                  <span class="asa-pill sc-status-pill" :class="statusPillClass(s.status)">
                    {{ statusLabel(s.status) }}
                  </span>
                </p>
                <p class="asa-pcard__meta">
                  <span class="flex items-center gap-1.5">
                    <Microscope class="w-4! h-4! fill-current opacity-60" />
                    {{ screeningTypeLabel(s.screeningType) }}
                  </span>
                </p>
                <p class="asa-pcard__meta">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-4! h-4! fill-current opacity-60" />
                    {{ formatJalaliDate(s.dueDate) }}
                  </span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span v-if="s.riskLevel" class="asa-pill" :class="riskPillClass(s.riskLevel)">
                    {{ riskLabel(s.riskLevel) }}
                  </span>
                  <span v-else class="sc-muted">—</span>
                </p>
              </div>
              <div class="sc-pcard__actions">
                <template v-if="s.status === 'pending' || s.status === 'overdue'">
                  <button type="button" class="asa-icon-btn sc-icon-btn--green" :disabled="scBusy(s.id)"
                    :aria-label="t('screening.markCompleted')" @click="markCompleted(s)">
                    <v-icon size="17">mdi-check</v-icon>
                  </button>
                </template>
                <button type="button" class="asa-icon-btn" :aria-label="t('screening.edit')"
                  @click="openEditSchedule(s)">
                  <v-icon size="17">mdi-pencil</v-icon>
                </button>
                <button type="button" class="asa-icon-btn asa-icon-btn--danger" :aria-label="t('screening.deleteProgram')"
                  @click="askDelete(s)">
                  <v-icon size="17">mdi-trash-can-outline</v-icon>
                </button>
              </div>
            </article>
          </div>
        </template>

        <!-- Results -->
        <template v-else>
          <!-- Desktop table (lg and up) -->
          <section class="asa-sec hidden! lg:block!">
            <div class="asa-card sc-table-card">
              <div class="sc-table-wrap">
                <table class="sc-table">
                  <thead>
                    <tr>
                      <th>{{ t('screening.patientHeader') }}</th>
                      <th>{{ t('screening.typeHeader') }}</th>
                      <th>{{ t('screening.resultHeader') }}</th>
                      <th>{{ t('screening.dateHeader') }}</th>
                      <th>{{ t('screening.notesHeader') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in filteredList" :key="r.id">
                      <td>
                        <div class="flex items-center gap-3 min-w-0">
                          <span class="asa-tint sc-avatar sc-avatar--sm" :class="patientTint(r)">
                            {{ patientInitials(r) }}
                          </span>
                          <span class="min-w-0">
                            <span class="sc-td-name block">{{ patientName(r) }}</span>
                            <span class="crm-ltr font-mono block text-[0.6875rem]! tracking-wider!" style="color: var(--asa-label-2)">
                              {{ r.patientNationalId }}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span class="flex items-center gap-2">
                          <Microscope class="w-4! h-4! fill-current opacity-60" />
                          {{ screeningTypeLabel(r.screeningType) }}
                        </span>
                      </td>
                      <td>
                        <span class="sc-result">{{ r.result || '—' }}</span>
                      </td>
                      <td>
                        <span class="whitespace-nowrap!">{{ formatJalaliDate(r.performedDate) }}</span>
                      </td>
                      <td>
                        <div v-if="r.notes" class="flex items-center">
                          <v-tooltip :text="r.notes" location="top" max-width="300">
                            <template #activator="{ props }">
                              <button v-bind="props" type="button" class="asa-icon-btn"
                                :aria-label="t('screening.notes')">
                                <v-icon size="17">mdi-note-text-outline</v-icon>
                              </button>
                            </template>
                          </v-tooltip>
                        </div>
                        <span v-else class="sc-muted">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Tablet / mobile cards -->
          <div class="lg:hidden! mt-4! space-y-3!">
            <article v-for="r in filteredList" :key="`c-${r.id}`" class="asa-card asa-pcard sc-pcard">
              <span class="asa-tint sc-avatar sc-avatar--lg" :class="patientTint(r)">
                {{ patientInitials(r) }}
              </span>
              <div class="asa-pcard__main">
                <p class="asa-pcard__name">{{ patientName(r) }}</p>
                <p class="asa-pcard__meta">
                  <span class="flex items-center gap-1.5">
                    <Microscope class="w-4! h-4! fill-current opacity-60" />
                    {{ screeningTypeLabel(r.screeningType) }}
                  </span>
                  <span class="asa-dot-inline" aria-hidden="true" />
                  <span class="sc-result">{{ r.result || '—' }}</span>
                </p>
                <p class="asa-pcard__meta">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-4! h-4! fill-current opacity-60" />
                    {{ formatJalaliDate(r.performedDate) }}
                  </span>
                  <span v-if="r.nextDueDate" class="asa-dot-inline" aria-hidden="true" />
                  <span v-if="r.nextDueDate">
                    {{ t('screening.nextDueDate') }}: {{ formatJalaliDate(r.nextDueDate) }}
                  </span>
                </p>
              </div>
            </article>
          </div>
        </template>
      </template>
    </template>

    <!-- ─── Add / Edit schedule dialog ─── -->
    <v-dialog v-model="scheduleDialog" max-width="560" @click:outside="patientSearchResults = []">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">{{ editingId ? t('screening.editScheduleTitle') : t('screening.newScheduleTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('screening.subtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="scheduleDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.patient') }} <span class="sc-req">*</span></label>
              <div class="sc-patient">
                <div class="sc-patient__shell">
                  <v-icon size="17">mdi-magnify</v-icon>
                  <input v-model="patientSearchQuery" type="text" class="sc-patient__input"
                    :placeholder="t('screening.searchPatientPlaceholder')" autocomplete="off"
                    @input="onPatientSearchInput" @focus="showPatientResults = patientSearchResults.length > 0"
                    @blur="hidePatientResults">
                  <v-progress-circular v-if="patientSearching" size="16" width="2" indeterminate color="rgba(0, 173, 181, 1)" />
                </div>
                <div v-if="showPatientResults" class="sc-pop">
                  <template v-if="patientSearchResults.length">
                    <button v-for="p in patientSearchResults" :key="p.id" type="button"
                      class="sc-pop__item" @mousedown.prevent="selectPatient(p)">
                      <span class="asa-tint sc-avatar sc-avatar--xs" :class="patientResultTint(p)">
                        {{ patientResultInitials(p) }}
                      </span>
                      <span class="min-w-0">
                        <span class="block text-[0.8125rem]! font-semibold! truncate!">{{ p.firstName }} {{ p.lastName }}</span>
                        <span class="block crm-ltr font-mono text-[0.6875rem]! tracking-wider! sc-muted">
                          {{ p.nationalId }}
                          <template v-if="p.phone"> · {{ p.phone }}</template>
                        </span>
                      </span>
                    </button>
                  </template>
                  <p v-else-if="searchedOnce" class="sc-pop__empty">{{ t('screening.noPatientFound') }}</p>
                </div>
              </div>
              <p v-if="selectedPatient" class="asa-note sc-selected">
                <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
                  <v-icon size="15">mdi-account-check</v-icon>
                </span>
                <span class="min-w-0">
                  <span class="asa-note__label">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
                  <span class="asa-note__value truncate!">
                    <span class="crm-ltr font-mono">{{ selectedPatient.nationalId }}</span>
                    <template v-if="selectedPatient.phone">
                      <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                      <span class="crm-ltr font-mono">{{ selectedPatient.phone }}</span>
                    </template>
                  </span>
                </span>
                <button type="button" class="asa-icon-btn sc-selected__clear" :aria-label="t('common.clear')"
                  @click="clearSelectedPatient">
                  <v-icon size="16">mdi-close</v-icon>
                </button>
              </p>
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.screeningType') }} <span class="sc-req">*</span></label>
              <v-select v-model="scheduleForm.screening_type" :items="screeningTypeOptions"
                item-title="title" item-value="value" variant="solo" density="comfortable" hide-details
                :placeholder="t('screening.selectOption')" />
            </div>

            <div class="grid grid-cols-1! gap-5! sm:grid-cols-2!">
              <div class="asa-field">
                <label class="asa-field-label">{{ t('screening.dueDate') }} <span class="sc-req">*</span></label>
                <div class="sc-date">
                  <PersianDatetimePicker v-model="scheduleForm.due_date" type="date"
                    :placeholder="t('screening.selectDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="sc-date__picker" />
                </div>
              </div>
              <div class="asa-field">
                <label class="asa-field-label">{{ t('screening.riskLevel') }}</label>
                <v-select v-model="scheduleForm.risk_level" :items="riskOptions"
                  item-title="title" item-value="value" variant="solo" density="comfortable" hide-details
                  :placeholder="t('screening.selectOption')" clearable />
              </div>
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.notes') }}</label>
              <v-textarea v-model="scheduleForm.notes" variant="solo" density="comfortable" rows="2"
                auto-grow hide-details :placeholder="t('screening.notesPlaceholder')" />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="savingSchedule" @click="scheduleDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="savingSchedule" @click="submitSchedule">
            <v-icon v-if="savingSchedule" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('screening.saveSchedule') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Record result dialog ─── -->
    <v-dialog v-model="resultDialog" max-width="560" @click:outside="patientSearchResults = []">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">{{ t('screening.resultTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('screening.subtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="resultDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.patient') }} <span class="sc-req">*</span></label>
              <div class="sc-patient">
                <div class="sc-patient__shell">
                  <v-icon size="17">mdi-magnify</v-icon>
                  <input v-model="patientSearchQuery" type="text" class="sc-patient__input"
                    :placeholder="t('screening.searchPatientPlaceholder')" autocomplete="off"
                    @input="onPatientSearchInput" @focus="showPatientResults = patientSearchResults.length > 0"
                    @blur="hidePatientResults">
                  <v-progress-circular v-if="patientSearching" size="16" width="2" indeterminate color="rgba(0, 173, 181, 1)" />
                </div>
                <div v-if="showPatientResults" class="sc-pop">
                  <template v-if="patientSearchResults.length">
                    <button v-for="p in patientSearchResults" :key="p.id" type="button"
                      class="sc-pop__item" @mousedown.prevent="selectPatient(p)">
                      <span class="asa-tint sc-avatar sc-avatar--xs" :class="patientResultTint(p)">
                        {{ patientResultInitials(p) }}
                      </span>
                      <span class="min-w-0">
                        <span class="block text-[0.8125rem]! font-semibold! truncate!">{{ p.firstName }} {{ p.lastName }}</span>
                        <span class="block crm-ltr font-mono text-[0.6875rem]! tracking-wider! sc-muted">
                          {{ p.nationalId }}
                          <template v-if="p.phone"> · {{ p.phone }}</template>
                        </span>
                      </span>
                    </button>
                  </template>
                  <p v-else-if="searchedOnce" class="sc-pop__empty">{{ t('screening.noPatientFound') }}</p>
                </div>
              </div>
              <p v-if="selectedPatient" class="asa-note sc-selected">
                <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
                  <v-icon size="15">mdi-account-check</v-icon>
                </span>
                <span class="min-w-0">
                  <span class="asa-note__label">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
                  <span class="asa-note__value truncate!">
                    <span class="crm-ltr font-mono">{{ selectedPatient.nationalId }}</span>
                    <template v-if="selectedPatient.phone">
                      <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                      <span class="crm-ltr font-mono">{{ selectedPatient.phone }}</span>
                    </template>
                  </span>
                </span>
                <button type="button" class="asa-icon-btn sc-selected__clear" :aria-label="t('common.clear')"
                  @click="clearSelectedPatient">
                  <v-icon size="16">mdi-close</v-icon>
                </button>
              </p>
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.screeningType') }} <span class="sc-req">*</span></label>
              <v-select v-model="resultForm.screening_type" :items="screeningTypeOptions"
                item-title="title" item-value="value" variant="solo" density="comfortable" hide-details
                :placeholder="t('screening.selectOption')" />
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.testResult') }} <span class="sc-req">*</span></label>
              <v-text-field v-model="resultForm.result" variant="solo" density="comfortable" hide-details
                :placeholder="t('screening.resultExamplePlaceholder')" />
            </div>

            <div class="grid grid-cols-1! gap-5! sm:grid-cols-2!">
              <div class="asa-field">
                <label class="asa-field-label">{{ t('screening.testDate') }} <span class="sc-req">*</span></label>
                <div class="sc-date">
                  <PersianDatetimePicker v-model="resultForm.performed_date" type="date"
                    :placeholder="t('screening.selectDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="sc-date__picker" />
                </div>
              </div>
              <div class="asa-field">
                <label class="asa-field-label">{{ t('screening.nextDueDate') }}</label>
                <div class="sc-date">
                  <PersianDatetimePicker v-model="resultForm.next_due_date" type="date"
                    :placeholder="t('screening.selectDatePlaceholder')" display-format="jYYYY/jMM/jDD"
                    format="YYYY-MM-DD" color="rgba(0, 173, 181, 1)" auto-submit clearable custom-input
                    class="sc-date__picker" />
                </div>
              </div>
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.facility') }}</label>
              <v-text-field v-model="resultForm.facility_name" variant="solo" density="comfortable" hide-details
                :placeholder="t('screening.facilityPlaceholder')" />
            </div>

            <div class="asa-field">
              <label class="asa-field-label">{{ t('screening.notes') }}</label>
              <v-textarea v-model="resultForm.notes" variant="solo" density="comfortable" rows="2"
                auto-grow hide-details :placeholder="t('screening.notesPlaceholder')" />
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
            {{ t('screening.saveResult') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete confirmation dialog ─── -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-trash-can-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('screening.deleteTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('screening.deleteConfirm') }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="deleteDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="deletingItem" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--rose" aria-hidden="true">
              <Microscope class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ patientName(deletingItem) }}</p>
              <p class="asa-note__value truncate!">
                {{ screeningTypeLabel(deletingItem.screeningType) }}
                <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                {{ formatJalaliDate(deletingItem.dueDate) }}
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="savingDelete" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn sc-btn--destructive" :disabled="savingDelete" @click="deleteSchedule">
            <v-icon v-if="savingDelete" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('common.delete') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import AddClipboard from '~/components/icons/AddClipboard.vue'
import Clock from '~/components/icons/Clock.vue'
import ClipboardX from '~/components/icons/ClipboardX.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import Microscope from '~/components/icons/Microscope.vue'
import Calendar from '~/components/icons/Calendar.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'

interface ScheduleItem {
  id: string
  patientId?: string
  screeningType: string
  dueDate: string | null
  status: string
  riskLevel?: string | null
  notes?: string | null
  createdAt?: string
  patientFirstName?: string
  patientLastName?: string
  patientNationalId?: string
  patientPhone?: string
}

interface ResultItem {
  id: string
  patientId?: string
  screeningType: string
  performedDate: string | null
  result?: string | null
  facilityName?: string | null
  notes?: string | null
  nextDueDate?: string | null
  createdAt?: string
  patientFirstName?: string
  patientLastName?: string
  patientNationalId?: string
  patientPhone?: string
}

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  nationalId?: string
  phone?: string
}

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

// ─── Data ───
const schedules = ref<ScheduleItem[]>([])
const results = ref<ResultItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const activeTab = ref<'all' | 'upcoming' | 'overdue' | 'results'>('all')

// ─── Stats helpers ───
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const todayStr = computed(() => toDateStr(new Date()))

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return toDateStr(dt)
}

const upcomingSchedules = computed(() =>
  schedules.value.filter((s) => {
    if (s.status !== 'pending' || !s.dueDate) return false
    const end = addDays(todayStr.value, 30)
    return s.dueDate >= todayStr.value && s.dueDate <= end
  })
)

const overdueSchedules = computed(() =>
  schedules.value.filter((s) => s.status === 'pending' && !!s.dueDate && s.dueDate < todayStr.value)
)

const completedThisMonth = computed(() => {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  return results.value.filter((r) => {
    const d = r.performedDate || r.createdAt || ''
    return d >= monthStart
  }).length
})

// ─── Overview metrics ───
const metrics = computed(() => [
  {
    key: 'total', icon: AddClipboard, tint: 'asa-tint--indigo', dot: 'sc-dot--indigo',
    value: schedules.value.length, label: t('screening.metricTotal'),
    foot: t('screening.metricTotalFoot'),
  },
  {
    key: 'due', icon: Clock, tint: 'asa-tint--amber', dot: 'sc-dot--amber',
    value: upcomingSchedules.value.length, label: t('screening.metricDueSoon'),
    foot: t('screening.metricDueSoonFoot'),
  },
  {
    key: 'late', icon: ClipboardX, tint: 'asa-tint--rose', dot: 'sc-dot--rose',
    value: overdueSchedules.value.length, label: t('screening.metricOverdue'),
    foot: t('screening.metricOverdueFoot'),
  },
  {
    key: 'done', icon: ClipboardCheck, tint: 'asa-tint--green', dot: 'sc-dot--green',
    value: completedThisMonth.value, label: t('screening.metricCompleted'),
    foot: t('screening.metricCompletedFoot'),
  },
])

// ─── Tabs ───
const tabs = computed(() => [
  { key: 'all', label: t('screening.allPrograms') },
  { key: 'upcoming', label: t('screening.dueSoon') },
  { key: 'overdue', label: t('screening.overdue') },
  { key: 'results', label: t('screening.testResults') },
])

// ─── Derived list ───
const hasQuery = computed(() => searchQuery.value.trim() !== '')

const baseList = computed<ScheduleItem[] | ResultItem[]>(() => {
  if (activeTab.value === 'all') return schedules.value
  if (activeTab.value === 'upcoming') return upcomingSchedules.value
  if (activeTab.value === 'overdue') return overdueSchedules.value
  return results.value
})

const filteredList = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return baseList.value
  return baseList.value.filter((item) => {
    const any = item as ScheduleItem & ResultItem
    const name = [any.patientFirstName, any.patientLastName].filter(Boolean).join(' ').toLowerCase()
    const nationalId = (any.patientNationalId || '').toLowerCase()
    const type = screeningTypeLabel(any.screeningType).toLowerCase()
    const result = (any.result || '').toLowerCase()
    return name.includes(q) || nationalId.includes(q) || type.includes(q) || result.includes(q)
  })
})

const countPill = computed(() => {
  const count = filteredList.value.length
  return activeTab.value === 'results'
    ? t('screening.resultsCount', { count })
    : t('screening.programsCount', { count })
})

// ─── Labels / pills ───
const LEGACY_TYPES: Record<string, string> = { hpv: 'hpv_test', dexa: 'bone_density', sti: 'sti_screening' }

const screeningTypeLabel = (type: string | undefined) => {
  if (!type) return '—'
  return t(`screening.screeningTypes.${LEGACY_TYPES[type] || type}`)
}

const riskLabel = (level: string | null | undefined) => {
  if (!level) return '—'
  return t(`screening.riskLevels.${level}`)
}

const statusLabel = (status: string) => {
  return t(`screening.statuses.${status}`)
}

const riskPillClass = (level: string | null | undefined) => {
  const map: Record<string, string> = {
    normal: 'asa-pill--green',
    elevated: 'asa-pill--amber',
    high: 'asa-pill--rose',
  }
  return map[level || ''] || 'sc-pill--neutral'
}

const statusPillClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'asa-pill--amber',
    overdue: 'asa-pill--rose',
    completed: 'asa-pill--green',
    cancelled: 'sc-pill--neutral',
    rescheduled: 'asa-pill--teal',
  }
  return map[status] || 'sc-pill--neutral'
}

const screeningTypeOptions = computed(() => [
  { title: t('screening.screeningTypes.pap_smear'), value: 'pap_smear' },
  { title: t('screening.screeningTypes.hpv_test'), value: 'hpv_test' },
  { title: t('screening.screeningTypes.mammography'), value: 'mammography' },
  { title: t('screening.screeningTypes.bone_density'), value: 'bone_density' },
  { title: t('screening.screeningTypes.pelvic_ultrasound'), value: 'pelvic_ultrasound' },
  { title: t('screening.screeningTypes.sti_screening'), value: 'sti_screening' },
  { title: t('screening.screeningTypes.colposcopy'), value: 'colposcopy' },
  { title: t('screening.screeningTypes.other'), value: 'other' },
])

const riskOptions = computed(() => [
  { title: t('screening.riskLevels.normal'), value: 'normal' },
  { title: t('screening.riskLevels.elevated'), value: 'elevated' },
  { title: t('screening.riskLevels.high'), value: 'high' },
])

// ─── Patient display ───
const patName = (item: ScheduleItem | ResultItem | null | undefined) =>
  [item?.patientFirstName, item?.patientLastName].filter(Boolean).join(' ')

const patientName = (item: ScheduleItem | ResultItem | null | undefined) => patName(item) || '—'

const patientInitials = (item: ScheduleItem | ResultItem | null | undefined) => {
  const initials = `${item?.patientFirstName?.charAt(0) || ''}${item?.patientLastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

const FULL_TINTS = ['asa-tint--teal', 'asa-tint--green', 'asa-tint--orange', 'asa-tint--rose', 'asa-tint--indigo']

function hashOf(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return hash
}

const patientTint = (item: ScheduleItem | ResultItem | null | undefined) =>
  FULL_TINTS[hashOf(`${item?.patientFirstName || ''}${item?.patientLastName || ''}${item?.patientNationalId || ''}`) % FULL_TINTS.length]

const patientResultTint = (p: PatientOption) =>
  FULL_TINTS[hashOf(`${p.firstName || ''}${p.lastName || ''}${p.nationalId || ''}`) % FULL_TINTS.length]

const patientResultInitials = (p: PatientOption) => {
  const initials = `${p?.firstName?.charAt(0) || ''}${p?.lastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

// ─── Date formatting ───
function formatJalaliDate(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

// ─── Patient search ───
const patientSearchQuery = ref('')
const patientSearchResults = ref<PatientOption[]>([])
const patientSearching = ref(false)
const showPatientResults = ref(false)
const searchedOnce = ref(false)
const selectedPatient = ref<PatientOption | null>(null)
let patientSearchTimer: ReturnType<typeof setTimeout> | null = null

function onPatientSearchInput() {
  if (patientSearchTimer) clearTimeout(patientSearchTimer)
  if (!patientSearchQuery.value.trim()) {
    patientSearchResults.value = []
    searchedOnce.value = false
    return
  }
  patientSearchTimer = setTimeout(() => searchPatients(), 400)
}

async function searchPatients() {
  const q = patientSearchQuery.value.trim()
  if (!q) return
  patientSearching.value = true
  searchedOnce.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PatientOption[] }>(
      `/api/screening/patients/search?q=${encodeURIComponent(q)}`
    )
    patientSearchResults.value = res.success ? (res.data || []) : []
    showPatientResults.value = true
  } catch {
    patientSearchResults.value = []
  } finally {
    patientSearching.value = false
  }
}

function hidePatientResults() {
  setTimeout(() => { showPatientResults.value = false }, 200)
}

function setPatientId(id: string) {
  scheduleForm.value.patient_id = id
  resultForm.value.patient_id = id
}

function selectPatient(patient: PatientOption) {
  selectedPatient.value = patient
  setPatientId(patient.id)
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
}

function clearSelectedPatient() {
  selectedPatient.value = null
  setPatientId('')
}

function resetPatientSearch() {
  clearSelectedPatient()
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
  searchedOnce.value = false
}

// ─── Fetch data ───
async function fetchAll() {
  loading.value = true
  try {
    const [schedulesRes, resultsRes] = await Promise.all([
      apiFetch<{ success: boolean; data: ScheduleItem[] }>('/api/screening/schedules'),
      apiFetch<{ success: boolean; data: ResultItem[] }>('/api/screening/results'),
    ])

    if (schedulesRes.success) schedules.value = schedulesRes.data || []
    if (resultsRes.success) results.value = resultsRes.data || []
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('screening.fetchError'))
  } finally {
    loading.value = false
  }
}

// ─── Schedule dialogs ───
const scheduleDialog = ref(false)
const resultDialog = ref(false)
const savingSchedule = ref(false)
const savingResult = ref(false)
const editingId = ref<string | null>(null)
const busyIds = ref<Record<string, boolean>>({})

const scheduleForm = ref({
  patient_id: '',
  screening_type: '',
  due_date: null as string | null,
  risk_level: null as string | null,
  notes: '',
})

const resultForm = ref({
  patient_id: '',
  screening_type: '',
  result: '',
  performed_date: toDateStr(new Date()),
  next_due_date: null as string | null,
  facility_name: '',
  notes: '',
})

function openAddSchedule() {
  editingId.value = null
  scheduleForm.value = { patient_id: '', screening_type: '', due_date: null, risk_level: null, notes: '' }
  resetPatientSearch()
  scheduleDialog.value = true
}

function openEditSchedule(s: ScheduleItem) {
  editingId.value = s.id
  scheduleForm.value = {
    patient_id: s.patientId || '',
    screening_type: LEGACY_TYPES[s.screeningType] || s.screeningType || '',
    due_date: s.dueDate || null,
    risk_level: s.riskLevel || null,
    notes: s.notes || '',
  }
  selectedPatient.value = (s.patientFirstName || s.patientLastName)
    ? {
        id: s.patientId || '',
        firstName: s.patientFirstName || '',
        lastName: s.patientLastName || '',
        nationalId: s.patientNationalId,
        phone: s.patientPhone,
      }
    : null
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
  searchedOnce.value = false
  scheduleDialog.value = true
}

async function submitSchedule() {
  if (!scheduleForm.value.patient_id || !scheduleForm.value.screening_type || !scheduleForm.value.due_date) {
    $toast.error(t('screening.fillRequired'))
    return
  }
  savingSchedule.value = true
  try {
    const body = {
      patient_id: scheduleForm.value.patient_id,
      screening_type: scheduleForm.value.screening_type,
      due_date: scheduleForm.value.due_date,
      risk_level: scheduleForm.value.risk_level || undefined,
      notes: scheduleForm.value.notes.trim() || undefined,
    }

    if (editingId.value) {
      await apiFetch<{ success: boolean }>(`/api/screening/schedules/${editingId.value}`, {
        method: 'PUT',
        body,
      })
      $toast.success(t('screening.programUpdated'))
    } else {
      await apiFetch<{ success: boolean }>('/api/screening/schedules', {
        method: 'POST',
        body,
      })
      $toast.success(t('screening.programSaved'))
    }

    scheduleDialog.value = false
    await fetchAll()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('screening.saveError'))
  } finally {
    savingSchedule.value = false
  }
}

function openAddResult() {
  resultForm.value = {
    patient_id: '',
    screening_type: '',
    result: '',
    performed_date: toDateStr(new Date()),
    next_due_date: null,
    facility_name: '',
    notes: '',
  }
  resetPatientSearch()
  resultDialog.value = true
}

async function submitResult() {
  if (!resultForm.value.patient_id || !resultForm.value.screening_type || !resultForm.value.result) {
    $toast.error(t('screening.fillRequired'))
    return
  }
  savingResult.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>('/api/screening/results', {
      method: 'POST',
      body: {
        patient_id: resultForm.value.patient_id,
        screening_type: resultForm.value.screening_type,
        result: resultForm.value.result,
        performed_date: resultForm.value.performed_date || undefined,
        next_due_date: resultForm.value.next_due_date || undefined,
        facility_name: resultForm.value.facility_name.trim() || undefined,
        notes: resultForm.value.notes.trim() || undefined,
      },
    })

    if (res.success) {
      $toast.success(t('screening.resultSaved'))
      resultDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || t('screening.resultSaveError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('screening.serverError'))
  } finally {
    savingResult.value = false
  }
}

// ─── Mark completed ───
function scBusy(id: string) {
  return !!busyIds.value[id]
}

async function markCompleted(s: ScheduleItem) {
  busyIds.value = { ...busyIds.value, [s.id]: true }
  try {
    await apiFetch<{ success: boolean }>(`/api/screening/schedules/${s.id}`, {
      method: 'PUT',
      body: { status: 'completed' },
    })
    $toast.success(t('screening.statusUpdated'))
    await fetchAll()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('screening.markError'))
  } finally {
    busyIds.value = { ...busyIds.value, [s.id]: false }
  }
}

// ─── Delete ───
const deleteDialog = ref(false)
const deletingItem = ref<ScheduleItem | null>(null)
const savingDelete = ref(false)

function askDelete(s: ScheduleItem) {
  deletingItem.value = s
  deleteDialog.value = true
}

async function deleteSchedule() {
  if (!deletingItem.value) return
  const target = deletingItem.value
  savingDelete.value = true
  try {
    await apiFetch<{ success: boolean }>(`/api/screening/schedules/${target.id}`, { method: 'DELETE' })
    $toast.success(t('screening.programDeleted'))
    deleteDialog.value = false
    deletingItem.value = null
    await fetchAll()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('screening.saveError'))
  } finally {
    savingDelete.value = false
  }
}

watch(activeTab, () => {
  searchQuery.value = ''
})

onMounted(() => {
  fetchAll()
})

onUnmounted(() => {
  if (patientSearchTimer) clearTimeout(patientSearchTimer)
})

useSeoMeta({ title: t('screening.titleSeo') })
</script>

<style scoped>
/* ── Top spacing ─────────────────────────────── */
.sc-head {
  margin-top: 0.25rem;
}

/* ── Frosted, sticky control deck (tabs + toolbar) ── */
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

.sc-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}

/* ── Segmented tabs ──────────────────────────── */
.sc-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  border-radius: 0.9375rem;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
}

.sc-tabs::-webkit-scrollbar {
  display: none;
}

.sc-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4375rem 0.9375rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--asa-label-2);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.sc-tab:hover {
  color: var(--asa-label);
}

.sc-tab--active {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.dark .sc-tab--active {
  background: #2c2c2e;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* ── Fields / selects / icon buttons ─────────── */
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

/* ── Metrics grid ─────────────────────────────── */
.sc-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 560px) {
  .sc-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .sc-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.sc-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1.125rem 1.25rem;
}

.sc-metric__copy {
  min-width: 0;
  text-align: end;
}

.sc-metric__value {
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

.sc-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.sc-metric__foot {
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

.sc-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-label-3) 18%, transparent);
}

.sc-dot--indigo {
  background: var(--asa-indigo);
  box-shadow: 0 0 0 3px var(--asa-indigo-soft);
}

.sc-dot--amber {
  background: var(--asa-amber);
  box-shadow: 0 0 0 3px var(--asa-amber-soft);
}

.sc-dot--green {
  background: var(--asa-green);
  box-shadow: 0 0 0 3px var(--asa-green-soft);
}

.sc-dot--rose {
  background: var(--asa-rose);
  box-shadow: 0 0 0 3px var(--asa-rose-soft);
}

/* ── Skeleton blocks ──────────────────────────── */
.sc-metric-skel {
  height: 7.5rem;
  border-radius: 1.375rem;
}

.sc-list-skel {
  height: 22rem;
  margin-top: 1.25rem;
  border-radius: 1.375rem;
}

/* ── Avatar ───────────────────────────────────── */
.sc-avatar {
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
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

/* ── Desktop table ────────────────────────────── */
.sc-table-card {
  padding: 0;
  overflow: hidden;
}

.sc-table-wrap {
  overflow-x: auto;
}

.sc-table {
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
  text-align: start;
}

.sc-table thead th {
  padding: 0.875rem 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.sc-table tbody td {
  padding: 0.875rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.sc-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.sc-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .sc-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.sc-th-end {
  text-align: end !important;
}

.sc-td-name {
  display: block;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-result {
  font-weight: 600;
  color: var(--asa-label);
}

.sc-muted {
  color: var(--asa-label-3);
}

/* ── Pill variants ────────────────────────────── */
.sc-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

/* ── Tablet / mobile cards ────────────────────── */
.asa-pcard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9375rem 1rem;
}

.asa-pcard__main {
  min-width: 0;
  flex: 1 1 auto;
}

.asa-pcard__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.sc-status-pill {
  margin-inline-start: 0.25rem;
}

.sc-pcard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.sc-pcard__actions .asa-icon-btn {
  width: 2rem;
  height: 2rem;
}

@media (min-width: 480px) {
  .sc-pcard__actions {
    flex-direction: row;
    align-items: center;
  }
}

.sc-icon-btn--green {
  color: var(--asa-green);
}

.sc-icon-btn--green:hover {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

/* ── Empty state ──────────────────────────────── */
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

/* ── Dialogs ──────────────────────────────────── */
.sc-req {
  color: var(--asa-rose);
}

/* Patient search combobox */
.sc-patient {
  position: relative;
}

.sc-patient__shell {
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

.sc-patient__shell:focus-within {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.sc-patient__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.sc-patient__input::placeholder {
  color: var(--asa-label-3);
}

.sc-pop {
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

.sc-pop__item {
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

.sc-pop__item:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.sc-pop__empty {
  padding: 1rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  text-align: center;
}

.sc-selected {
  margin-top: 0.625rem;
}

.sc-selected__clear {
  width: 1.875rem;
  height: 1.875rem;
  color: var(--asa-label-3);
}

.sc-selected__clear:hover {
  color: var(--asa-rose);
}

/* Native date picker field */
.sc-date {
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  overflow: hidden;
  transition: box-shadow 150ms var(--ease-default), border-color 150ms var(--ease-default);
}

.sc-date:focus-within {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
  border-color: transparent;
}

.sc-date :deep(input) {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
}

.sc-date :deep(input)::placeholder {
  color: var(--asa-label-3);
}

/* ── Buttons ──────────────────────────────────── */
.sc-btn--green {
  background: var(--asa-green);
  color: #ffffff;
}

.sc-btn--green:hover {
  background: color-mix(in srgb, var(--asa-green) 88%, #000);
}

.sc-btn--destructive {
  background: var(--asa-rose);
  color: #ffffff;
}

.sc-btn--destructive:hover {
  background: color-mix(in srgb, var(--asa-rose) 88%, #000);
}

/* ── Responsive tuning ────────────────────────── */
@media (max-width: 480px) {
  .asa-field--search {
    flex-basis: 100% !important;
  }

  .sc-pcard__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>