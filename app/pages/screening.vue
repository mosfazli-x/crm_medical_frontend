<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('screening.title')" :subtitle="$t('screening.subtitle')">
      <template #actions>
        <button class="crm-btn crm-btn-accent" @click="openAddSchedule">
          <Plus class="!w-4 !h-4" />
          {{ t('screening.addNew') }}
        </button>
      </template>
    </UiPageHeader>

    <div class="crm-stat-grid grid-cols-1! sm:grid-cols-3! lg:grid-cols-3!">
      <div
        class="!bg-white !rounded-xl !border !border-zinc-200/80 dark:border-zinc-600! !p-5 !flex !items-center !gap-4 dark:bg-blue-grey! !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div
          class="!w-10 !h-10 !rounded-lg !text-blue-700 dark:text-blue-400! !flex !items-center !justify-center !shrink-0 !border !border-zinc-200/50 bg-slate-50 dark:bg-slate-700 dark:border-slate-600!">
          <Icon name="lucide:clipboard-list" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5 dark:text-slate-300!">{{ t('screening.totalPrograms')
          }}
          </p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight dark:text-slate-100!">{{ stats.total }}</p>
        </div>
      </div>
      <div
        class="!bg-white !rounded-xl !border !border-zinc-200/80 dark:border-zinc-600! !p-5 !flex !items-center !gap-4 dark:bg-blue-grey! !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div
          class="!w-10 !h-10 !rounded-lg !text-red-600 dark:text-red-400! !flex !items-center !justify-center !shrink-0 !border !border-red-100 bg-slate-50 dark:bg-slate-700 dark:border-slate-600!">
          <Icon name="lucide:alert-circle" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5 dark:text-slate-300!">{{ t('screening.overdue') }}</p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight dark:text-slate-100!">{{ stats.overdue }}
          </p>
        </div>
      </div>
      <div
        class="!bg-white !rounded-xl !border !border-zinc-200/80 dark:border-zinc-600! !p-5 !flex !items-center !gap-4 dark:bg-blue-grey! !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div
          class="!w-10 !h-10 !rounded-lg !text-emerald-600 dark:text-emerald-400 !flex !items-center !justify-center !shrink-0 !border !border-emerald-100 bg-slate-50 dark:bg-slate-700 dark:border-slate-600!">
          <Icon name="lucide:check-circle-2" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5 dark:text-slate-300!">{{
            t('screening.completedThisMonth')
          }}</p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight dark:text-slate-100!">{{
            stats.completedThisMonth }}</p>
        </div>
      </div>
    </div>

    <div
      class="!bg-white dark:bg-slate-800! !rounded-xl !border !border-zinc-200/80 dark:border-zinc-600! !shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] !overflow-hidden !min-h-[400px] !flex !flex-col">

      <div class="!border-b !border-zinc-200/80 !bg-white/50 dark:!bg-slate-700/50 !backdrop-blur-xl">
        <div class="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !px-6 !pt-2">

          <nav class="!flex !gap-6 !overflow-x-auto !scrollbar-hide pb-1">
            <button @click="activeTab = 'all'"
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'all' ? '!border-zinc-900 !text-zinc-900 dark:!text-zinc-200' : '!border-transparent !text-zinc-500 dark:text-slate-400! hover:!text-zinc-800 hover:!border-zinc-300']">
              {{ t('screening.allPrograms') }}
            </button>
            <button @click="activeTab = 'overdue'"
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'overdue' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']">
              {{ t('screening.overdue') }}
            </button>
            <button @click="activeTab = 'upcoming'"
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'upcoming' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']">
              {{ t('screening.upcoming') }}
            </button>
            <button @click="activeTab = 'results'"
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'results' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']">
              {{ t('screening.testResults') }}
            </button>
          </nav>

          <div v-if="activeTab !== 'results'" class="!pb-3 sm:!pb-0">
            <div class="!relative !flex !items-center">
              <Icon name="lucide:search" class="!absolute !right-3 !w-4 !h-4 !text-zinc-400" />
              <input v-model="searchQuery" type="text" :placeholder="t('screening.searchPlaceholder')"
                class="!w-full sm:!w-[240px] !bg-zinc-50 !border !border-zinc-200 !text-zinc-800 !text-sm !rounded-lg !py-1.5 !pr-9 !pl-3 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all placeholder:!text-zinc-400" />
              <button v-if="searchQuery" @click="searchQuery = ''"
                class="!absolute !left-3 !text-zinc-400 hover:!text-zinc-600">
                <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="!flex-1 !flex !flex-col">
        <div v-if="loading" class="!flex-1 !flex !flex-col !items-center !justify-center !py-24">
          <Icon name="lucide:loader-2" class="!animate-spin !w-8 !h-8 !text-zinc-300 !mb-4" />
          <span class="!text-sm !text-zinc-500 !font-medium">{{ $t('common.loading') }}</span>
        </div>

        <div v-else-if="['all', 'overdue', 'upcoming'].includes(activeTab)" class="!overflow-x-auto !flex-1">
          <table class="!min-w-full !text-right !border-collapse">
            <thead class="!bg-zinc-50/50">
              <tr>
                <th
                  class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.patientHeader') }}</th>
                <th
                  class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.typeHeader') }}</th>
                <th
                  class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.dueDateHeader') }}</th>
                <th
                  class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.riskLevelHeader') }}</th>
                <th
                  class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.statusHeader') }}</th>
                <th
                  class="!px-6 !py-3.5 !text-center !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                  {{ t('screening.actionsHeader') }}</th>
              </tr>
            </thead>
            <tbody class="!divide-y !divide-zinc-100">

              <tr v-if="currentSchedules.length === 0">
                <td colspan="6" class="!py-24 !text-center">
                  <div class="!flex !flex-col !items-center !justify-center !space-y-3">
                    <div
                      class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
                      <Icon name="lucide:inbox" class="!w-6 !h-6 !text-zinc-400" />
                    </div>
                    <p class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ t('screening.noData') }}</p>
                  </div>
                </td>
              </tr>

              <tr v-else v-for="schedule in currentSchedules" :key="schedule.id"
                class="hover:!bg-zinc-50/80 !transition-colors !group">
                <td class="!px-6 !py-3.5 !text-sm !font-medium !text-zinc-900 !whitespace-nowrap">{{
                  schedule.patient_name
                  || [schedule.patientFirstName, schedule.patientLastName].filter(Boolean).join(' ') || '---' }}</td>
                <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{
                  screeningTypeLabel(schedule.screening_type || schedule.screeningType) }}</td>
                <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{
                  formatJalaliDate(schedule.due_date
                    || schedule.dueDate) }}</td>

                <td class="!px-6 !py-3.5 !whitespace-nowrap">
                  <span :class="[
                    '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                    (schedule.risk_level || schedule.riskLevel) === 'normal' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60' : '',
                    (schedule.risk_level || schedule.riskLevel) === 'elevated' ? '!bg-amber-50 !text-amber-700 !border-amber-200/60' : '',
                    (schedule.risk_level || schedule.riskLevel) === 'high' ? '!bg-red-50 !text-red-700 !border-red-200/60' : ''
                  ]">
                    {{ riskLabel(schedule.risk_level || schedule.riskLevel) }}
                  </span>
                </td>

                <td class="!px-6 !py-3.5 !whitespace-nowrap">
                  <span :class="[
                    '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                    schedule.status === 'pending' ? '!bg-amber-50 !text-amber-700 !border-amber-200/60' : '',
                    schedule.status === 'completed' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60' : '',
                    schedule.status === 'overdue' ? '!bg-red-50 !text-red-700 !border-red-200/60' : '',
                    schedule.status === 'cancelled' ? '!bg-zinc-100 !text-zinc-600 !border-zinc-200/60' : ''
                  ]">
                    {{ statusLabel(schedule.status) }}
                  </span>
                </td>

                <td class="!px-6 !py-3.5 !text-center !whitespace-nowrap">
                  <button @click="confirmDelete(schedule)"
                    class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !transition-colors group-hover:!opacity-100"
                    :title="t('screening.deleteProgram')">
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'results'" class="!flex-1 !flex !flex-col">
          <div class="!px-6 !py-4 !flex !items-center !justify-between !border-b !border-zinc-200/80 !bg-zinc-50/30">
            <span class="!text-sm !text-zinc-500 !font-medium">{{ t('screening.resultsCount', { count: results.length })
            }}</span>
            <button @click="openAddResult"
              class="!flex !items-center !gap-1.5 !bg-white !border !border-zinc-200 hover:!border-zinc-300 hover:!bg-zinc-50 !text-zinc-700 !px-3 !py-1.5 !rounded-lg !text-xs !font-medium !transition-colors !shadow-sm">
              <Plus class="!w-3.5 !h-3.5" />
              {{ t('screening.recordResult') }}
            </button>
          </div>
          <div class="!overflow-x-auto !flex-1">
            <table class="!min-w-full !text-right !border-collapse">
              <thead class="!bg-zinc-50/50">
                <tr>
                  <th
                    class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.patientHeader') }}</th>
                  <th
                    class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.typeHeader') }}</th>
                  <th
                    class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.resultHeader') }}</th>
                  <th
                    class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.dateHeader') }}</th>
                  <th
                    class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.statusHeader') }}</th>
                  <th
                    class="!px-6 !py-3.5 !text-center !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">
                    {{ t('screening.notesHeader') }}</th>
                </tr>
              </thead>
              <tbody class="!divide-y !divide-zinc-100">
                <tr v-if="results.length === 0">
                  <td colspan="6" class="!py-24 !text-center">
                    <div class="!flex !flex-col !items-center !justify-center !space-y-3">
                      <div
                        class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
                        <Icon name="lucide:file-x-2" class="!w-6 !h-6 !text-zinc-400" />
                      </div>
                      <p class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ t('screening.noResultsYet') }}
                      </p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="result in results" :key="result.id" class="hover:!bg-zinc-50/80 !transition-colors">
                  <td class="!px-6 !py-3.5 !text-sm !font-medium !text-zinc-900 !whitespace-nowrap">{{
                    result.patient_name
                    || [result.patientFirstName, result.patientLastName].filter(Boolean).join(' ') || '---' }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{
                    screeningTypeLabel(result.screening_type || result.screeningType) }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-800 !font-medium !whitespace-nowrap">{{ result.result ||
                    '---' }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-500 !whitespace-nowrap">{{
                    formatJalaliDate(result.test_date
                      || result.testDate || result.created_at || result.createdAt) }}</td>

                  <td class="!px-6 !py-3.5 !whitespace-nowrap">
                    <span :class="[
                      '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                      (result.is_abnormal || result.abnormal) ? '!bg-red-50 !text-red-700 !border-red-200/60' : '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60'
                    ]">
                      {{ (result.is_abnormal || result.abnormal) ? t('screening.abnormal') : t('screening.normal') }}
                    </span>
                  </td>

                  <td class="!px-6 !py-3.5 !text-center !whitespace-nowrap">
                    <button v-if="result.notes" :title="result.notes"
                      class="!text-zinc-400 hover:!text-zinc-700 !transition-colors">
                      <Icon name="lucide:message-square-text" class="!w-4 !h-4" />
                    </button>
                    <span v-else class="!text-zinc-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="addScheduleDialog" max-width="500" persistent class="!backdrop-blur-[2px]">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-auto">

        <div class="!px-6 !py-4 !border-b !border-zinc-100 !flex !items-center !justify-between !bg-zinc-50/30">
          <h3 class="!text-base !font-semibold !text-zinc-900">{{ t('screening.newScheduleTitle') }}</h3>
          <button @click="addScheduleDialog = false"
            class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors justtify-center align-middle flex">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6 !space-y-4">
          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.patient') }}</label>
            <div class="!relative">
              <input v-model="patientSearchQuery" type="text" :placeholder="t('screening.searchPatientPlaceholder')"
                class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all"
                @input="onPatientSearchInput" @focus="showPatientResults = true" @blur="hidePatientResults" />
              <Icon v-if="patientSearching" name="lucide:loader-2"
                class="!absolute !left-3 !top-1/2 -!translate-y-1/2 !w-4 !h-4 !text-zinc-400 !animate-spin" />
              <div v-if="showPatientResults && patientSearchResults.length > 0"
                class="!absolute !z-50 !mt-1 !w-full !bg-white !border !border-zinc-200 !rounded-lg !shadow-lg !max-h-56 !overflow-y-auto">
                <div v-for="p in patientSearchResults" :key="p.id"
                  class="!px-3 !py-2.5 !text-sm !cursor-pointer hover:!bg-zinc-50 !border-b !border-zinc-100 last:!border-b-0 !transition-colors"
                  @mousedown.prevent="selectPatient(p)">
                  <span class="!font-medium !text-zinc-800">{{ p.firstName }} {{ p.lastName }}</span>
                  <span class="!text-zinc-300 !mx-2">|</span>
                  <span class="!text-zinc-500" dir="ltr">{{ p.nationalId }}</span>
                  <span v-if="p.phone" class="!text-zinc-400 !mr-3" dir="ltr">{{ p.phone }}</span>
                </div>
              </div>
              <div
                v-if="showPatientResults && patientSearchQuery.trim() && !patientSearching && patientSearchResults.length === 0 && searchedOnce"
                class="!absolute !z-50 !mt-1 !w-full !bg-white !border !border-zinc-200 !rounded-lg !shadow-lg !p-3 !text-sm !text-zinc-500 !text-center">
                {{ t('screening.noPatientFound') }}
              </div>
            </div>
            <div v-if="selectedPatient"
              class="!mt-2 !flex !items-center !gap-2 !text-sm !bg-emerald-50 !border !border-emerald-200 !rounded-lg !px-3 !py-2">
              <Icon name="lucide:check-circle-2" class="!w-4 !h-4 !text-emerald-500 !shrink-0" />
              <span class="!font-medium !text-emerald-800">{{ selectedPatient.firstName }} {{ selectedPatient.lastName
              }}</span>
              <span class="!text-emerald-500">-</span>
              <span class="!text-emerald-600" dir="ltr">{{ selectedPatient.nationalId }}</span>
              <button @click="clearSelectedPatient"
                class="!mr-auto !p-1 !rounded-md !text-emerald-400 hover:!text-red-500 hover:!bg-red-50 !transition-colors">
                <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
              </button>
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.screeningType') }}</label>
            <select v-model="scheduleForm.screening_type"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none">
              <option value="" disabled>{{ t('screening.selectOption') }}</option>
              <option v-for="opt in screeningTypeOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.dueDate') }}</label>
            <div class="h-[40px] border rounded overflow-hidden flex">
              <PersianDatetimePicker v-model="scheduleForm.due_date" type="date"
                :placeholder="t('screening.selectDatePlaceholder')" display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                color="#000000" auto-submit clearable custom-input
                class="!w-full !h-full !text-zinc-800 !outline-none !rounded-lg !bg-white !transition-all" />
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.riskLevel') }}</label>
            <select v-model="scheduleForm.risk_level"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none">
              <option value="" disabled>{{ t('screening.selectOption') }}</option>
              <option v-for="opt in riskOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.notes') }}</label>
            <textarea v-model="scheduleForm.notes" rows="3" :placeholder="t('screening.notesPlaceholder')"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !resize-none"></textarea>
          </div>
        </div>

        <div class="!px-6 !py-4 !border-t !border-zinc-100 !bg-zinc-50/50 !flex !items-center !justify-end !gap-3">
          <button @click="addScheduleDialog = false"
            class="!px-4 !py-2 !text-sm !font-medium !text-zinc-600 hover:!text-zinc-900 !transition-colors">
            {{ $t('common.cancel') }}
          </button>
          <button @click="submitSchedule" :disabled="savingSchedule"
            class="!flex !items-center !gap-2 !bg-zinc-900 hover:!bg-zinc-800 disabled:!bg-zinc-300 disabled:!cursor-not-allowed !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !shadow-sm !transition-all">
            <Icon v-if="savingSchedule" name="lucide:loader-2" class="!animate-spin !w-4 !h-4" />
            <span>{{ t('screening.saveSchedule') }}</span>
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="addResultDialog" max-width="500" persistent class="!backdrop-blur-[2px]">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-auto">

        <div class="!px-6 !py-4 !border-b !border-zinc-100 !flex !items-center !justify-between !bg-zinc-50/30">
          <h3 class="!text-base !font-semibold !text-zinc-900">{{ t('screening.resultTitle') }}</h3>
          <button @click="addResultDialog = false"
            class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors justtify-center align-middle flex">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6 !space-y-4">
          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.patient') }}</label>
            <div class="!relative">
              <input v-model="patientSearchQuery" type="text" :placeholder="t('screening.searchPatientPlaceholder')"
                class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all"
                @input="onPatientSearchInput" @focus="showPatientResults = true" @blur="hidePatientResults" />
              <Icon v-if="patientSearching" name="lucide:loader-2"
                class="!absolute !left-3 !top-1/2 -!translate-y-1/2 !w-4 !h-4 !text-zinc-400 !animate-spin" />
              <div v-if="showPatientResults && patientSearchResults.length > 0"
                class="!absolute !z-50 !mt-1 !w-full !bg-white !border !border-zinc-200 !rounded-lg !shadow-lg !max-h-56 !overflow-y-auto">
                <div v-for="p in patientSearchResults" :key="p.id"
                  class="!px-3 !py-2.5 !text-sm !cursor-pointer hover:!bg-zinc-50 !border-b !border-zinc-100 last:!border-b-0 !transition-colors"
                  @mousedown.prevent="selectPatient(p)">
                  <span class="!font-medium !text-zinc-800">{{ p.firstName }} {{ p.lastName }}</span>
                  <span class="!text-zinc-300 !mx-2">|</span>
                  <span class="!text-zinc-500" dir="ltr">{{ p.nationalId }}</span>
                  <span v-if="p.phone" class="!text-zinc-400 !mr-3" dir="ltr">{{ p.phone }}</span>
                </div>
              </div>
              <div
                v-if="showPatientResults && patientSearchQuery.trim() && !patientSearching && patientSearchResults.length === 0 && searchedOnce"
                class="!absolute !z-50 !mt-1 !w-full !bg-white !border !border-zinc-200 !rounded-lg !shadow-lg !p-3 !text-sm !text-zinc-500 !text-center">
                {{ t('screening.noPatientFound') }}
              </div>
            </div>
            <div v-if="selectedPatient"
              class="!mt-2 !flex !items-center !gap-2 !text-sm !bg-emerald-50 !border !border-emerald-200 !rounded-lg !px-3 !py-2">
              <Icon name="lucide:check-circle-2" class="!w-4 !h-4 !text-emerald-500 !shrink-0" />
              <span class="!font-medium !text-emerald-800">{{ selectedPatient.firstName }} {{ selectedPatient.lastName
              }}</span>
              <span class="!text-emerald-500">-</span>
              <span class="!text-emerald-600" dir="ltr">{{ selectedPatient.nationalId }}</span>
              <button @click="clearSelectedPatient"
                class="!mr-auto !p-1 !rounded-md !text-emerald-400 hover:!text-red-500 hover:!bg-red-50 !transition-colors">
                <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
              </button>
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.screeningType') }}</label>
            <select v-model="resultForm.screening_type"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none">
              <option value="" disabled>{{ t('screening.selectOption') }}</option>
              <option v-for="opt in screeningTypeOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.testResult') }}</label>
            <input v-model="resultForm.result" type="text" :placeholder="t('screening.resultExamplePlaceholder')"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all" />
          </div>

          <div class="!grid !grid-cols-2 !gap-4">
            <div class="!space-y-1.5">
              <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.testDate') }}</label>
              <div class="!relative">
                <PersianDatetimePicker v-model="resultForm.test_date" type="date"
                  :placeholder="t('screening.selectDatePlaceholder')" display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD"
                  color="#000000" auto-submit clearable custom-input
                  class="!w-full !h-[38px] !border !border-zinc-200 hover:!border-zinc-300 !text-sm !text-zinc-800 !outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !rounded-lg !px-3 !bg-white !transition-all" />
              </div>
            </div>

            <div class="!space-y-1.5">
              <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.clinicalStatus') }}</label>
              <select v-model="resultForm.is_abnormal"
                class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none">
                <option :value="false">{{ t('screening.normal') }}</option>
                <option :value="true">{{ t('screening.abnormal') }}</option>
              </select>
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">{{ t('screening.notes') }}</label>
            <textarea v-model="resultForm.notes" rows="2" :placeholder="t('screening.notesPlaceholder')"
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !resize-none"></textarea>
          </div>
        </div>

        <div class="!px-6 !py-4 !border-t !border-zinc-100 !bg-zinc-50/50 !flex !items-center !justify-end !gap-3">
          <button @click="addResultDialog = false"
            class="!px-4 !py-2 !text-sm !font-medium !text-zinc-600 hover:!text-zinc-900 !transition-colors">
            {{ $t('common.cancel') }}
          </button>
          <button @click="submitResult" :disabled="savingResult"
            class="!flex !items-center !gap-2 !bg-zinc-900 hover:!bg-zinc-800 disabled:!bg-zinc-300 disabled:!cursor-not-allowed !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !shadow-sm !transition-all">
            <Icon v-if="savingResult" name="lucide:loader-2" class="!animate-spin !w-4 !h-4" />
            <span>{{ t('screening.saveResult') }}</span>
          </button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const activeTab = ref('all')
const searchQuery = ref('')
const loading = ref(true)

// Stats
const stats = ref({ total: 0, overdue: 0, completedThisMonth: 0 })

// Schedules
const schedules = ref<any[]>([])
const overdueSchedules = ref<any[]>([])
const upcomingSchedules = ref<any[]>([])

// Results
const results = ref<any[]>([])

// Dialog states
const addScheduleDialog = ref(false)
const addResultDialog = ref(false)
const savingSchedule = ref(false)
const savingResult = ref(false)

// Form data
const scheduleForm = ref({
  patient_id: '',
  screening_type: '',
  due_date: null as string | null,
  risk_level: '',
  notes: '',
})

const resultForm = ref({
  patient_id: '',
  screening_type: '',
  result: '',
  test_date: null as string | null,
  is_abnormal: false,
  notes: '',
})

// Patient search
const patientSearchQuery = ref('')
const patientSearching = ref(false)
const patientSearchResults = ref<any[]>([])
const selectedPatient = ref<any>(null)
const showPatientResults = ref(false)
const searchedOnce = ref(false)
let patientSearchTimer: ReturnType<typeof setTimeout> | null = null

// Configuration Options
const screeningTypeOptions = [
  { title: t('screening.screeningTypes.pap_smear'), value: 'pap_smear' },
  { title: t('screening.screeningTypes.hpv'), value: 'hpv' },
  { title: t('screening.screeningTypes.mammography'), value: 'mammography' },
  { title: t('screening.screeningTypes.dexa'), value: 'dexa' },
  { title: t('screening.screeningTypes.sti'), value: 'sti' },
  { title: t('screening.screeningTypes.colposcopy'), value: 'colposcopy' },
]

const riskOptions = [
  { title: t('screening.riskLevels.normal'), value: 'normal' },
  { title: t('screening.riskLevels.elevated'), value: 'elevated' },
  { title: t('screening.riskLevels.high'), value: 'high' },
]

const screeningTypeMap: Record<string, string> = {
  pap_smear: t('screening.screeningTypes.pap_smear'),
  hpv: t('screening.screeningTypes.hpv'),
  mammography: t('screening.screeningTypes.mammography'),
  dexa: t('screening.screeningTypes.dexa'),
  sti: t('screening.screeningTypes.sti'),
  colposcopy: t('screening.screeningTypes.colposcopy'),
}

const riskMap: Record<string, string> = {
  normal: t('screening.riskLevels.normal'),
  elevated: t('screening.riskLevels.elevated'),
  high: t('screening.riskLevels.high'),
}

const statusMap: Record<string, string> = {
  pending: t('screening.statuses.pending'),
  completed: t('screening.statuses.completed'),
  overdue: t('screening.statuses.overdue'),
  cancelled: t('screening.statuses.cancelled'),
}

function screeningTypeLabel(type: string): string {
  return screeningTypeMap[type] || type
}

function riskLabel(level: string): string {
  return riskMap[level] || level
}

function statusLabel(status: string): string {
  return statusMap[status] || status
}

// Logic to switch active array based on tab
const currentSchedules = computed(() => {
  let list = []
  if (activeTab.value === 'all') list = schedules.value
  else if (activeTab.value === 'overdue') list = overdueSchedules.value
  else if (activeTab.value === 'upcoming') list = upcomingSchedules.value

  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.trim().toLowerCase()
  return list.filter((s: any) => {
    const name = (s.patient_name || [s.patientFirstName, s.patientLastName].filter(Boolean).join(' ') || '').toLowerCase()
    const type = screeningTypeLabel(s.screening_type || s.screeningType).toLowerCase()
    return name.includes(q) || type.includes(q)
  })
})

// Format date to Jalali
function formatJalaliDate(date: string | null): string {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

// Fetch Data from Server
async function fetchAll() {
  loading.value = true
  try {
    const [schedulesRes, overdueRes, upcomingRes, resultsRes] = await Promise.all([
      apiFetch<any>('/api/screening/schedules'),
      apiFetch<any>('/api/screening/schedules/overdue'),
      apiFetch<any>('/api/screening/schedules/upcoming?days=30'),
      apiFetch<any>('/api/screening/results'),
    ])

    if (schedulesRes.success) schedules.value = schedulesRes.data
    if (overdueRes.success) overdueSchedules.value = overdueRes.data
    if (upcomingRes.success) upcomingSchedules.value = upcomingRes.data
    if (resultsRes.success) results.value = resultsRes.data

    computeStats()
  } catch (err: any) {
    $toast.error(t('screening.fetchError'))
  } finally {
    loading.value = false
  }
}

function computeStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  stats.value = {
    total: schedules.value.length,
    overdue: overdueSchedules.value.length || schedules.value.filter((s: any) => s.status === 'overdue').length,
    completedThisMonth: results.value.filter((r: any) => {
      const d = new Date(r.test_date || r.testDate || r.created_at || r.createdAt)
      return d >= startOfMonth
    }).length,
  }
}

// Delete schedule
async function confirmDelete(schedule: any) {
  if (!confirm(t('screening.deleteConfirm'))) return
  try {
    const res = await apiFetch(`/api/screening/schedules/${schedule.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success(t('screening.programDeleted'))
      await fetchAll()
    } else {
      $toast.error(res.error || t('screening.saveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('screening.serverError'))
  }
}

// Open Form Dialogs
function openAddSchedule() {
  scheduleForm.value = { patient_id: '', screening_type: '', due_date: null, risk_level: '', notes: '' }
  selectedPatient.value = null
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
  searchedOnce.value = false
  addScheduleDialog.value = true
}

// Submit forms keeping UUID intact
async function submitSchedule() {
  if (!scheduleForm.value.patient_id || !scheduleForm.value.screening_type || !scheduleForm.value.due_date) {
    $toast.error(t('screening.fillRequired'))
    return
  }
  savingSchedule.value = true
  try {
    const res = await apiFetch('/api/screening/schedules', {
      method: 'POST',
      body: {
        patient_id: scheduleForm.value.patient_id,
        screening_type: scheduleForm.value.screening_type,
        due_date: scheduleForm.value.due_date,
        risk_level: scheduleForm.value.risk_level || undefined,
        notes: scheduleForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success(t('screening.programSaved'))
      addScheduleDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || t('screening.saveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('screening.serverError'))
  } finally {
    savingSchedule.value = false
  }
}

function openAddResult() {
  resultForm.value = { patient_id: '', screening_type: '', result: '', test_date: null, is_abnormal: false, notes: '' }
  selectedPatient.value = null
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
  searchedOnce.value = false
  addResultDialog.value = true
}

async function submitResult() {
  if (!resultForm.value.patient_id || !resultForm.value.screening_type || !resultForm.value.result) {
    $toast.error(t('screening.fillRequired'))
    return
  }
  savingResult.value = true
  try {
    const res = await apiFetch('/api/screening/results', {
      method: 'POST',
      body: {
        patient_id: resultForm.value.patient_id,
        screening_type: resultForm.value.screening_type,
        result: resultForm.value.result,
        test_date: resultForm.value.test_date || undefined,
        is_abnormal: resultForm.value.is_abnormal,
        notes: resultForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success(t('screening.resultSaved'))
      addResultDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || t('screening.resultSaveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('screening.serverError'))
  } finally {
    savingResult.value = false
  }
}

// Patient search
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
    const res = await apiFetch<any>(`/api/screening/patients/search?q=${encodeURIComponent(q)}`)
    patientSearchResults.value = res.success ? res.data : []
    showPatientResults.value = true
  } catch {
    patientSearchResults.value = []
  } finally {
    patientSearching.value = false
  }
}

function selectPatient(patient: any) {
  selectedPatient.value = patient
  scheduleForm.value.patient_id = patient.id
  resultForm.value.patient_id = patient.id
  patientSearchQuery.value = ''
  patientSearchResults.value = []
  showPatientResults.value = false
}

function clearSelectedPatient() {
  selectedPatient.value = null
  scheduleForm.value.patient_id = ''
  resultForm.value.patient_id = ''
}

function hidePatientResults() {
  setTimeout(() => { showPatientResults.value = false }, 200)
}

watch(activeTab, () => {
  if (activeTab.value === 'results' && results.value.length === 0) {
    fetchAll()
  }
})

onMounted(() => {
  fetchAll()
})

onUnmounted(() => {
  if (patientSearchTimer) clearTimeout(patientSearchTimer)
})

useSeoMeta({ title: t('screening.titleSeo') })
</script>