<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('billing.title')" :subtitle="$t('billing.subtitle')" />

    <div class="crm-tabs mb-8">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="['crm-tab', activeTab === tab.key ? 'crm-tab-active' : '']">
        {{ tab.label }}
      </button>
    </div>

    <template v-if="activeTab === 'records'">

      <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-5 !pb-4">
        <div
          class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !border !border-slate-200/60 dark:!border-slate-800/60 !p-6 !shadow-sm !transition-all hover:!shadow-md">
          <div class="!flex !items-center !gap-3 !mb-3">
            <div
              class="!p-2 !bg-slate-100 dark:!bg-slate-800/50 !rounded-lg text-slate-600 dark:text-slate-400 flex justify-center align-middle items-center">
              <Icon name="lucide:receipt" class="!w-5 !h-5" />
            </div>
            <div class="!text-sm !font-semibold !text-slate-500 dark:!text-slate-400">{{ $t('billing.totalBilled') }}</div>
          </div>
          <div class="!text-3xl !font-black !text-slate-900 dark:!text-white !tracking-tight">{{
            formatPrice(summary.totalBilled) }}</div>
        </div>

        <div
          class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !border !border-slate-200/60 dark:!border-slate-800/60 !p-6 !shadow-sm !transition-all hover:!shadow-md">
          <div class="!flex !items-center !gap-3 !mb-3">
            <div
              class="!p-2 !bg-emerald-50 dark:!bg-emerald-900/20 !rounded-lg text-emerald-600 dark:text-emerald-400 flex justify-center align-middle items-center">
              <Icon name="lucide:trending-up" class="!w-5 !h-5" />
            </div>
            <div class="!text-sm !font-semibold !text-slate-500 dark:!text-slate-400">{{ $t('billing.totalCollected') }}</div>
          </div>
          <div class="!text-3xl !font-black !text-emerald-600 dark:!text-emerald-400 !tracking-tight">{{
            formatPrice(summary.totalCollected) }}</div>
        </div>

        <div
          class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !border !border-slate-200/60 dark:!border-slate-800/60 !p-6 !shadow-sm !transition-all hover:!shadow-md">
          <div class="!flex !items-center !gap-3 !mb-3">
            <div
              class="!p-2 !bg-amber-50 dark:!bg-amber-900/20 !rounded-lg text-amber-600 dark:text-amber-400 flex justify-center align-middle items-center">
              <Icon name="lucide:clock" class="!w-5 !h-5" />
            </div>
            <div class="!text-sm !font-semibold !text-slate-500 dark:!text-slate-400">{{ $t('billing.totalPending') }}</div>
          </div>
          <div class="!text-3xl !font-black !text-amber-600 dark:!text-amber-400 !tracking-tight">{{
            formatPrice(summary.totalPending) }}</div>
        </div>
      </div>

      <div class="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4 !pb-2">
        <div class="!w-full sm:!max-w-md !relative">
          <v-text-field v-model="searchQuery" variant="outlined" density="comfortable"
            :placeholder="$t('billing.searchPlaceholder')" hide-details clearable class="!bg-white dark:!bg-[#0f1115] !rounded-xl">
            <template #prepend-inner>
              <Icon name="lucide:search" class="!w-5 !h-5 !text-slate-400 !mr-2" />
            </template>
          </v-text-field>
        </div>
        <div class="!flex !gap-3 !w-full sm:!w-auto">
          <button @click="openBalanceDialog"
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-white dark:!bg-slate-800 !text-slate-700 dark:!text-slate-200 !font-semibold !text-sm !rounded-xl !border !border-slate-200 dark:!border-slate-700 hover:!bg-slate-50 dark:hover:!bg-slate-700 !transition-colors !shadow-sm">
            <Icon name="lucide:wallet" class="!w-4 !h-4" />
            <span>{{ $t('billing.patientAccount') }}</span>
          </button>
          <button @click="openAddRecordDialog"
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !font-semibold !text-sm !rounded-xl hover:!bg-slate-800 dark:hover:!bg-slate-100 !transition-colors !shadow-sm">
            <Icon name="lucide:plus" class="!w-4 !h-4 fill-amber-300!" />
            <span>{{ $t('billing.addRecord') }}</span>
          </button>
        </div>
      </div>

      <div
        class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-sm !border !border-slate-200/60 dark:!border-slate-800/60 !overflow-hidden">
        <div class="!overflow-x-auto">
          <table class="!min-w-full !text-right !border-collapse">
            <thead
              class="!bg-slate-50/50 dark:!bg-slate-800/20 !border-b !border-slate-200/60 dark:!border-slate-800/60">
              <tr>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.patient') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.service') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.date') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.amount') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.insurance') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.patientPortion') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.status') }}</th>
                <th
                  class="!px-6 !py-4 !text-center !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.actions') }}</th>
              </tr>
            </thead>
            <tbody class="!divide-y !divide-slate-100 dark:!divide-slate-800/60">
              <tr v-if="recordsLoading" v-for="i in 4" :key="`sk-${i}`">
                <td colspan="8" class="!p-4">
                  <v-skeleton-loader type="list-item" class="!bg-transparent" />
                </td>
              </tr>
              <tr v-else-if="filteredRecords.length === 0">
                <td colspan="8" class="!py-20 !text-center">
                  <div class="!flex !flex-col !items-center !justify-center !space-y-4">
                    <div
                      class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
                      <Icon name="lucide:file-x" class="!w-10 !h-10 text-slate-300" />
                    </div>
                    <p class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ $t('billing.noRecords') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="record in filteredRecords" :key="record.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30 !transition-colors !group">
                <td class="!px-6 !py-4 !text-sm !font-bold !text-slate-900 dark:!text-slate-100 !whitespace-nowrap">
                  {{ record.patient_name || [record.patientFirstName, record.patientLastName].filter(Boolean).join(' ')
                    ||
                    '---' }}
                </td>
                <td class="!px-6 !py-4 !text-sm !font-medium !text-slate-600 dark:!text-slate-300 !whitespace-nowrap">
                  {{ record.procedure_name || record.procedureCode?.name || '---' }}
                </td>
                <td class="!px-6 !py-4 !text-sm !font-medium !text-slate-500 dark:!text-slate-400 !whitespace-nowrap">
                  {{ formatJalaliDate(record.billing_date) }}
                </td>
                <td class="!px-6 !py-4 !text-sm !font-black !text-slate-900 dark:!text-slate-100 !whitespace-nowrap"
                  dir="ltr">
                  {{ formatPrice(record.amount).replace(` ${$t('common.toman')}`, '') }}
                </td>
                <td class="!px-6 !py-4 !text-sm !font-bold !text-emerald-600 dark:!text-emerald-400 !whitespace-nowrap"
                  dir="ltr">
                  {{ formatPrice(record.insurance_portion).replace(` ${$t('common.toman')}`, '') }}
                </td>
                <td class="!px-6 !py-4 !text-sm !font-bold !text-amber-600 dark:!text-amber-400 !whitespace-nowrap"
                  dir="ltr">
                  {{ formatPrice(record.patient_portion).replace(` ${$t('common.toman')}`, '') }}
                </td>
                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <span :class="[
                    '!px-3 !py-1 !rounded-full !text-xs !font-bold !border',
                    record.status === 'paid' ? '!bg-emerald-50 dark:!bg-emerald-900/10 !text-emerald-700 dark:!text-emerald-400 !border-emerald-200/60 dark:!border-emerald-800/50' :
                      record.status === 'pending' ? '!bg-amber-50 dark:!bg-amber-900/10 !text-amber-700 dark:!text-amber-400 !border-amber-200/60 dark:!border-amber-800/50' :
                        record.status === 'partial' ? '!bg-blue-50 dark:!bg-blue-900/10 !text-blue-700 dark:!text-blue-400 !border-blue-200/60 dark:!border-blue-800/50' :
                          '!bg-red-50 dark:!bg-red-900/10 !text-red-700 dark:!text-red-400 !border-red-200/60 dark:!border-red-800/50'
                  ]">
                    {{ statusLabels[record.status] || record.status }}
                  </span>
                </td>
                <td class="!px-6 !py-4 !text-center !whitespace-nowrap">
                  <div
                    class="!flex !items-center !justify-center !gap-2 !opacity-0 group-hover:!opacity-100 !transition-opacity">
                    <template v-if="record.status === 'pending'">
                      <button @click="updateRecordStatus(record.id, 'paid')"
                        class="!p-1.5 !text-emerald-500 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !rounded-lg !transition-colors"
                        :title="$t('billing.confirmPayment')">
                        <Icon name="lucide:check-circle" class="!w-5 !h-5" />
                      </button>
                      <button @click="updateRecordStatus(record.id, 'cancelled')"
                        class="!p-1.5 !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20 !rounded-lg !transition-colors"
                        :title="$t('billing.cancelBtn')">
                        <Icon name="lucide:x-circle" class="!w-5 !h-5" />
                      </button>
                    </template>
                    <template v-else-if="record.status === 'partial'">
                      <button @click="updateRecordStatus(record.id, 'paid')"
                        class="!p-1.5 !text-emerald-500 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !rounded-lg !transition-colors"
                        :title="$t('billing.settleFull')">
                        <Icon name="lucide:check-square" class="!w-5 !h-5" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <template v-if="activeTab === 'codes'">
      <div class="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4 !pb-2">
        <div class="!w-full sm:!max-w-xs">
          <v-select v-model="categoryFilter" :items="categoryOptions" item-title="label" item-value="value"
            variant="outlined" density="comfortable" :placeholder="$t('billing.categories.allCategories')" hide-details clearable
            class="!bg-white dark:!bg-[#0f1115] !rounded-xl">
            <template #prepend-inner>
              <Icon name="lucide:filter" class="!w-5 !h-5 !text-slate-400 !mr-2" />
            </template>
          </v-select>
        </div>
        <button @click="openAddCodeDialog"
          class="!w-full sm:!w-auto !flex !items-center !justify-center !gap-2 !px-4 !py-2.5 !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !font-semibold !text-sm !rounded-xl hover:!bg-slate-800 dark:hover:!bg-slate-100 !transition-colors !shadow-sm">
          <Icon name="lucide:plus" class="!w-4 !h-4" />
            <span>{{ $t('billing.addServiceCode') }}</span>
        </button>
      </div>

      <div
        class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-sm !border !border-slate-200/60 dark:!border-slate-800/60 !overflow-hidden">
        <div class="!overflow-x-auto">
          <table class="!min-w-full !text-right !border-collapse">
            <thead
              class="!bg-slate-50/50 dark:!bg-slate-800/20 !border-b !border-slate-200/60 dark:!border-slate-800/60">
              <tr>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.code') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.serviceName') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.description') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.price') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.insuranceCoverage') }}</th>
                <th
                  class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                   {{ $t('billing.category') }}</th>
              </tr>
            </thead>
            <tbody class="!divide-y !divide-slate-100 dark:!divide-slate-800/60">
              <tr v-if="codesLoading" v-for="i in 4" :key="`sk-code-${i}`">
                <td colspan="6" class="!p-4">
                  <v-skeleton-loader type="list-item" class="!bg-transparent" />
                </td>
              </tr>
              <tr v-else-if="filteredCodes.length === 0">
                <td colspan="6" class="!py-20 !text-center">
                  <div class="!flex !flex-col !items-center !justify-center !space-y-4">
                    <div
                      class="!bg-slate-50 dark:!bg-slate-800/50 !p-5 !rounded-full !text-slate-300 dark:!text-slate-600">
                      <Icon name="lucide:clipboard-list" class="!w-10 !h-10" />
                    </div>
                    <p class="!text-slate-500 dark:!text-slate-400 !font-semibold !text-sm">{{ $t('billing.noCodes') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="code in filteredCodes" :key="code.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30 !transition-colors">
                <td class="!px-6 !py-4 !text-sm !font-black !text-slate-700 dark:!text-slate-300 !whitespace-nowrap">{{
                  code.code }}</td>
                <td class="!px-6 !py-4 !text-sm !font-bold !text-slate-900 dark:!text-slate-100 !whitespace-nowrap">{{
                  code.name }}</td>
                <td class="!px-6 !py-4 !text-sm !font-medium !text-slate-500 dark:!text-slate-400 !max-w-xs !truncate">
                  {{
                    code.description || '---' }}</td>
                <td class="!px-6 !py-4 !text-sm !font-black !text-slate-900 dark:!text-slate-100 !whitespace-nowrap"
                  dir="ltr">
                  {{ formatPrice(code.price) }}
                </td>
                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <span class="!text-sm !font-black !text-indigo-600 dark:!text-indigo-400">{{
                    code.insurance_coverage_percent
                  }}%</span>
                </td>
                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <span
                    class="!px-3 !py-1 !rounded-full !text-xs !font-bold !bg-slate-100 dark:!bg-slate-800 !text-slate-600 dark:!text-slate-300 !border !border-slate-200/60 dark:!border-slate-700">
                    {{ categoryLabels[code.category] || code.category }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <v-dialog v-model="recordDialog" max-width="600" content-class="">
      <div
        class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto !border !border-slate-200/50 dark:!border-slate-800">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black !text-slate-900 dark:!text-white">{{ $t('billing.addRecordTitle') }}</h2>
          <button @click="recordDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors flex justify-center align-middle items-center aspect-square justify-center align-middle flex hover:bg-slate-100 dark:hover:bg-slate-700!">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <div class="!relative">
            <div v-if="selectedRecordPatient"
              class="!flex !items-center !gap-2 !p-3 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl !border !border-slate-200 dark:!border-slate-700">
              <div class="!flex-1 !min-w-0">
                <div class="!text-sm !font-bold !text-slate-900 dark:!text-white !truncate">{{
                  selectedRecordPatient.firstName }} {{ selectedRecordPatient.lastName }}</div>
                <div class="!text-xs !text-slate-500 dark:!text-slate-400">{{ selectedRecordPatient.nationalId ||
                  selectedRecordPatient.phone || '' }}</div>
              </div>
              <button @click="clearRecordPatient()"
                class="!p-1 !text-slate-400 hover:!text-red-500 !rounded-lg hover:!bg-red-50 dark:hover:!bg-red-900/20 !transition-colors">
                <Icon name="lucide:x" class="!w-4 !h-4" />
              </button>
            </div>
            <v-text-field v-else v-model="recordPatientSearchQuery" @input="onRecordPatientSearchInput"
              @blur="hideRecordPatientResults"
              @focus="recordPatientSearchQuery?.trim()?.length >= 2 && recordPatientSearchResults.length && (showRecordPatientResults = true)"
                variant="outlined" density="comfortable" :label="$t('billing.patient')" :placeholder="$t('billing.searchPatientPlaceholder')"
              hide-details="auto" :loading="recordPatientSearching">
              <template #prepend-inner>
                <Icon name="lucide:search" class="!w-5 !h-5 !text-slate-400 !mr-2" />
              </template>
            </v-text-field>
            <div v-if="showRecordPatientResults && recordPatientSearchResults.length"
              class="!absolute !z-50 !mt-1 !w-full !bg-white dark:!bg-slate-800 !rounded-xl !shadow-xl !border !border-slate-200 dark:!border-slate-700 !overflow-hidden">
              <button v-for="p in recordPatientSearchResults" :key="p.id" @mousedown.prevent="selectRecordPatient(p)"
                class="!w-full !px-4 !py-3 !flex !flex-col !items-start !gap-0.5 hover:!bg-slate-50 dark:hover:!bg-slate-700/50 !transition-colors !text-right !border-b !border-slate-100 dark:!border-slate-700/50 last:!border-b-0">
                <span class="!text-sm !font-bold !text-slate-900 dark:!text-white">{{ p.firstName }} {{ p.lastName
                }}</span>
                <span class="!text-xs !text-slate-500 dark:!text-slate-400">{{ p.nationalId || p.phone || '' }}</span>
              </button>
            </div>
          </div>
          <v-select v-model="recordForm.procedure_code_id" :items="procedureCodes" item-title="name" item-value="id"
            variant="outlined" density="comfortable" :label="$t('billing.serviceCode')" :placeholder="$t('billing.selectService')" hide-details="auto" />
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="recordForm.amount" variant="outlined" density="comfortable" :label="$t('billing.totalAmount')"
              :placeholder="$t('billing.amountPlaceholder')" type="number" hide-details="auto" />
            <v-select v-model="recordForm.status" :items="statusOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" :label="$t('billing.status')" :placeholder="$t('billing.selectStatus')" hide-details="auto" />
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="recordForm.insurance_portion" variant="outlined" density="comfortable"
              class="!col-span-1 sm:!col-span-1" :label="$t('billing.insurancePortion')" :placeholder="$t('billing.insurancePortion')" type="number"
              hide-details="auto" />
            <v-text-field v-model="recordForm.patient_portion" variant="outlined" density="comfortable"
              class="!col-span-1 sm:!col-span-1" :label="$t('billing.patientPortion')" :placeholder="$t('billing.patientPortion')" type="number"
              hide-details="auto" />
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <PersianDatetimePicker v-model="recordForm.billing_date" type="date" :placeholder="$t('billing.billingDate')"
              display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable custom-input
              class="relative h-max border rounded overflow-hidden" />
            <v-textarea v-model="recordForm.notes" variant="outlined" density="comfortable" :label="$t('common.notes')"
              :placeholder="$t('billing.optionalNotes')" rows="1" hide-details="auto"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openRecordHw('notes')" />
          </div>
        </div>
        <div
          class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="recordDialog = false"
            class="!px-5 !py-2.5 !text-sm !font-bold !text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-800 !rounded-xl !transition-colors">{{ $t('billing.cancelBtn') }}</button>
          <button :disabled="savingRecord" @click="saveBillingRecord"
            class="!px-6 !py-2.5 !text-sm !font-bold !text-white !bg-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-800 dark:hover:!bg-slate-100 !rounded-xl !shadow-sm !transition-colors !flex !items-center !gap-2 disabled:!opacity-50">
            <Icon v-if="savingRecord" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('billing.saveRecord') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="codeDialog" max-width="550" content-class="">
      <div
        class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto !border !border-slate-200/50 dark:!border-slate-800">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black !text-slate-900 dark:!text-white">{{ $t('billing.addCodeTitle') }}</h2>
          <button @click="codeDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors flex justify-center align-middle items-center aspect-square justify-center align-middle flex hover:bg-slate-100 dark:hover:bg-slate-700!">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="codeForm.code" variant="outlined" density="comfortable" :label="$t('billing.code')"
              :placeholder="$t('billing.codePlaceholder')" hide-details="auto"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openCodeHw('code')" />
            <v-select v-model="codeForm.category" :items="categoryOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" :label="$t('billing.category')" :placeholder="$t('billing.selectCategory')" hide-details="auto" />
          </div>
          <v-text-field v-model="codeForm.name" variant="outlined" density="comfortable" :label="$t('billing.serviceTitle')"
            :placeholder="$t('billing.serviceNamePlaceholder')" hide-details="auto"
            append-inner-icon="mdi-draw-pen" @click:append-inner="openCodeHw('name')" />
          <v-textarea v-model="codeForm.description" variant="outlined" density="comfortable" :label="$t('billing.description')"
            :placeholder="$t('billing.optionalNotes')" rows="2" hide-details="auto"
            append-inner-icon="mdi-draw-pen" @click:append-inner="openCodeHw('description')" />
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="codeForm.price" variant="outlined" density="comfortable" :label="$t('billing.basePrice')"
              :placeholder="$t('common.toman')" type="number" hide-details="auto" />
            <v-text-field v-model="codeForm.insurance_coverage_percent" variant="outlined" density="comfortable"
              :label="$t('billing.insuranceCoveragePercent')" :placeholder="$t('billing.insuranceCoveragePlaceholder')" type="number" hide-details="auto" />
          </div>
        </div>
        <div
          class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="codeDialog = false"
            class="!px-5 !py-2.5 !text-sm !font-bold !text-slate-600 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-800 !rounded-xl !transition-colors">{{ $t('billing.cancelBtn') }}</button>
          <button :disabled="savingCode" @click="saveProcedureCode"
            class="!px-6 !py-2.5 !text-sm !font-bold !text-white !bg-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-800 dark:hover:!bg-slate-100 !rounded-xl !shadow-sm !transition-colors !flex !items-center !gap-2 disabled:!opacity-50">
            <Icon v-if="savingCode" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('billing.saveService') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="balanceDialog" max-width="450" content-class="">
      <div
        class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto !border !border-slate-200/50 dark:!border-slate-800">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black !text-slate-900 dark:!text-white">{{ $t('billing.checkPatientAccount') }}</h2>
          <button @click="balanceDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors flex justify-center align-middle items-center aspect-square justify-center align-middle flex hover:bg-slate-100 dark:hover:bg-slate-700!">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-6">
          <div class="!flex !gap-3">
            <div class="!flex-1 !relative">
              <div v-if="selectedBalancePatient"
                class="!flex !items-center !gap-2 !p-3 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl !border !border-slate-200 dark:!border-slate-700">
                <div class="!flex-1 !min-w-0">
                  <div class="!text-sm !font-bold !text-slate-900 dark:!text-white !truncate">{{
                    selectedBalancePatient.firstName }} {{ selectedBalancePatient.lastName }}</div>
                  <div class="!text-xs !text-slate-500 dark:!text-slate-400">{{ selectedBalancePatient.nationalId ||
                    selectedBalancePatient.phone || '' }}</div>
                </div>
                <button @click="clearBalancePatient()"
                  class="!p-1 !text-slate-400 hover:!text-red-500 !rounded-lg hover:!bg-red-50 dark:hover:!bg-red-900/20 !transition-colors">
                  <Icon name="lucide:x" class="!w-4 !h-4" />
                </button>
              </div>
              <v-text-field v-else v-model="balancePatientSearchQuery" @input="onBalancePatientSearchInput"
                @blur="hideBalancePatientResults"
                @focus="balancePatientSearchQuery?.trim()?.length >= 2 && balancePatientSearchResults.length && (showBalancePatientResults = true)"
              variant="outlined" density="comfortable" :label="$t('billing.patient')" :placeholder="$t('billing.searchPatientPlaceholder')"
                hide-details="auto" :loading="balancePatientSearching">
                <template #prepend-inner>
                  <Icon name="lucide:search" class="!w-5 !h-5 !text-slate-400 !mr-2" />
                </template>
              </v-text-field>
              <div v-if="showBalancePatientResults && balancePatientSearchResults.length"
                class="!absolute !z-50 !mt-1 !w-full !bg-white dark:!bg-slate-800 !rounded-xl !shadow-xl !border !border-slate-200 dark:!border-slate-700 !overflow-hidden">
                <button v-for="p in balancePatientSearchResults" :key="p.id"
                  @mousedown.prevent="selectBalancePatient(p)"
                  class="!w-full !px-4 !py-3 !flex !flex-col !items-start !gap-0.5 hover:!bg-slate-50 dark:hover:!bg-slate-700/50 !transition-colors !text-right !border-b !border-slate-100 dark:!border-slate-700/50 last:!border-b-0">
                  <span class="!text-sm !font-bold !text-slate-900 dark:!text-white">{{ p.firstName }} {{ p.lastName
                  }}</span>
                  <span class="!text-xs !text-slate-500 dark:!text-slate-400">{{ p.nationalId || p.phone || '' }}</span>
                </button>
              </div>
            </div>
            <button @click="fetchPatientBalance" :disabled="loadingBalance"
              class="!px-5 !py-2 !bg-slate-100 dark:!bg-slate-800 !text-slate-800 dark:!text-white !font-bold !rounded-xl hover:!bg-slate-200 dark:hover:!bg-slate-700 !transition-colors !flex !items-center !justify-center disabled:!opacity-50">
              <Icon v-if="loadingBalance" name="lucide:loader-2" class="!w-5 !h-5 !animate-spin" />
              <Icon v-else name="lucide:search" class="!w-5 !h-5" />
            </button>
          </div>

          <div v-if="patientBalance !== null"
            class="!bg-slate-50/80 dark:!bg-slate-800/40 !rounded-2xl !p-6 !space-y-4 !border !border-slate-200/60 dark:!border-slate-700/60">
            <div class="!flex !justify-between !items-center">
              <span class="!text-sm !font-semibold !text-slate-500 dark:!text-slate-400">{{ $t('billing.totalInvoices') }}</span>
              <span class="!text-lg !font-black !text-slate-900 dark:!text-white" dir="ltr">{{
                formatPrice(patientBalance.total_billed || 0) }}</span>
            </div>
            <div class="!flex !justify-between !items-center">
              <span class="!text-sm !font-semibold !text-slate-500 dark:!text-slate-400">{{ $t('billing.paidAmount') }}</span>
              <span class="!text-lg !font-black !text-emerald-600 dark:!text-emerald-400" dir="ltr">{{
                formatPrice(patientBalance.total_paid || 0) }}</span>
            </div>
            <div
              class="!border-t !border-slate-200/80 dark:!border-slate-700 !pt-4 !flex !justify-between !items-center">
              <span class="!text-base !font-black !text-slate-700 dark:!text-slate-300">{{ $t('billing.balance') }}</span>
              <span
                :class="['!text-2xl !font-black', (patientBalance.balance || 0) > 0 ? '!text-red-500 dark:!text-red-400' : '!text-emerald-500 dark:!text-emerald-400']"
                dir="ltr">
                {{ formatPrice(patientBalance.balance || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <HandwritingDialog v-model="recordOpen" :label="recordLabel" :numeric="recordNumeric" @insert="applyRecordHw" />
    <HandwritingDialog v-model="codeOpen" :label="codeLabel" :numeric="codeNumeric" @insert="applyCodeHw" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useApi } from '~/composables/useApi'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
const { t } = useI18n()
// از آنجایی که Nuxt 3 اتوماتیک Icon را import میکند نیاز به ایمپورت دستی نیست، اما مطمئن شوید @nuxt/icon نصب است.

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const activeTab = ref<'records' | 'codes'>('records')

const tabs = [
  { key: 'records', label: t('billing.tabs.records') },
  { key: 'codes', label: t('billing.tabs.codes') },
]

const statusLabels: Record<string, string> = {
  pending: t('billing.statusLabels.pending'),
  paid: t('billing.statusLabels.paid'),
  partial: t('billing.statusLabels.partial'),
  cancelled: t('billing.statusLabels.cancelled'),
}

// category ها از نوع UUID یا string هستند طبق درخواست شما دیتا تایپ این بخش ثابت ماند
const categoryLabels: Record<string, string> = {
  consultation: t('billing.categories.consultation'),
  surgery: t('billing.categories.surgery'),
  imaging: t('billing.categories.imaging'),
  lab: t('billing.categories.lab'),
  ultrasound: t('billing.categories.ultrasound'),
  other: t('billing.categories.other'),
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }))

// ==================== Billing Records ====================
const records = ref<any[]>([])
const recordsLoading = ref(false)
const searchQuery = ref('')

const summary = computed(() => {
  const totalBilled = records.value.reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const totalCollected = records.value
    .filter(r => r.status === 'paid')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0)
  const totalPending = records.value
    .filter(r => r.status === 'pending' || r.status === 'partial')
    .reduce((s, r) => s + (Number(r.patient_portion) || 0), 0)
  return { totalBilled, totalCollected, totalPending }
})

const filteredRecords = computed(() => {
  if (!searchQuery.value?.trim()) return records.value
  const q = searchQuery.value.trim().toLowerCase()
  return records.value.filter(r => {
    const name = (r.patient_name || [r.patientFirstName, r.patientLastName].filter(Boolean).join(' ') || '').toLowerCase()
    return name.includes(q)
  })
})

async function fetchBillingRecords() {
  recordsLoading.value = true
  try {
    const res = await apiFetch<any>('/api/billing/records')
    if (res.success) {
      records.value = res.data
    }
  } catch {
    $toast.error(t('billing.fetchRecordsError'))
  } finally {
    recordsLoading.value = false
  }
}

// ==================== Add Billing Record ====================
const recordDialog = ref(false)
const savingRecord = ref(false)
const procedureCodes = ref<any[]>([])

// Patient search for record dialog
const recordPatientSearchQuery = ref('')
const recordPatientSearchResults = ref<any[]>([])
const showRecordPatientResults = ref(false)
const recordPatientSearching = ref(false)
let recordPatientSearchTimer: ReturnType<typeof setTimeout> | null = null
const selectedRecordPatient = ref<any>(null)

function onRecordPatientSearchInput() {
  if (recordPatientSearchTimer) clearTimeout(recordPatientSearchTimer)
  showRecordPatientResults.value = false
  if (!recordPatientSearchQuery.value?.trim()) {
    recordPatientSearchResults.value = []
    return
  }
  recordPatientSearchTimer = setTimeout(() => searchRecordPatients(), 400)
}

async function searchRecordPatients() {
  const q = recordPatientSearchQuery.value.trim()
  if (q.length < 2) return
  recordPatientSearching.value = true
  try {
    const res = await apiFetch<any>(`/api/billing/patients/search?q=${encodeURIComponent(q)}`)
    if (res.success) {
      recordPatientSearchResults.value = res.data
      showRecordPatientResults.value = true
    }
  } catch { /* ignore */ } finally {
    recordPatientSearching.value = false
  }
}

function selectRecordPatient(patient: any) {
  selectedRecordPatient.value = patient
  recordPatientSearchQuery.value = `${patient.firstName} ${patient.lastName}`
  showRecordPatientResults.value = false
  recordPatientSearchResults.value = []
}

function clearRecordPatient() {
  selectedRecordPatient.value = null
  recordPatientSearchQuery.value = ''
  recordPatientSearchResults.value = []
  showRecordPatientResults.value = false
}

function hideRecordPatientResults() {
  nextTick(() => { showRecordPatientResults.value = false })
}

const recordForm = ref({
  procedure_code_id: null,
  amount: '',
  insurance_portion: '',
  patient_portion: '',
  status: 'pending',
  notes: '',
  billing_date: '',
})

function openAddRecordDialog() {
  clearRecordPatient()
  recordForm.value = {
    procedure_code_id: null,
    amount: '',
    insurance_portion: '',
    patient_portion: '',
    status: 'pending',
    notes: '',
    billing_date: '',
  }
  recordDialog.value = true
}

async function saveBillingRecord() {
  if (!selectedRecordPatient.value || !recordForm.value.amount) {
    $toast.error(t('billing.selectPatientAndAmount'))
    return
  }
  savingRecord.value = true
  try {
    const res = await apiFetch<any>('/api/billing/records', {
      method: 'POST',
      body: {
        patient_id: selectedRecordPatient.value.id,
        procedure_code_id: recordForm.value.procedure_code_id ? Number(recordForm.value.procedure_code_id) : null,
        amount: Number(recordForm.value.amount),
        insurance_portion: Number(recordForm.value.insurance_portion) || 0,
        patient_portion: Number(recordForm.value.patient_portion) || 0,
        status: recordForm.value.status,
        notes: recordForm.value.notes,
        billing_date: recordForm.value.billing_date || undefined,
      },
    })
    if (res.success) {
      $toast.success(t('billing.recordSaved'))
      recordDialog.value = false
      await fetchBillingRecords()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('billing.saveRecordError'))
  } finally {
    savingRecord.value = false
  }
}

async function updateRecordStatus(id: number, status: string) {
  try {
    const res = await apiFetch<any>(`/api/billing/records/${id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    if (res.success) {
      $toast.success(t('billing.statusUpdated'))
      await fetchBillingRecords()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('billing.statusUpdateError'))
  }
}

// ==================== Procedure Codes ====================
const codes = ref<any[]>([])
const codesLoading = ref(false)
const categoryFilter = ref<string | null>(null)

const filteredCodes = computed(() => {
  if (!categoryFilter.value) return codes.value
  return codes.value.filter(c => c.category === categoryFilter.value)
})

async function fetchProcedureCodes() {
  codesLoading.value = true
  try {
    const res = await apiFetch<any>('/api/billing/procedure-codes')
    if (res.success) {
      codes.value = res.data
    }
  } catch {
    $toast.error(t('billing.fetchCodesError'))
  } finally {
    codesLoading.value = false
  }
}

// ==================== Add Procedure Code ====================
const codeDialog = ref(false)
const savingCode = ref(false)

const codeForm = ref({
  code: '',
  name: '',
  description: '',
  price: '',
  insurance_coverage_percent: '',
  category: '',
})

const { handwritingOpen: recordOpen, handwritingLabel: recordLabel, handwritingNumeric: recordNumeric, openHandwriting: openRecordHw, applyHandwriting: applyRecordHw } =
  useHandwritingFields({
    fieldLabels: {
      notes: t('common.notes'),
    },
    target: recordForm,
  })

const { handwritingOpen: codeOpen, handwritingLabel: codeLabel, handwritingNumeric: codeNumeric, openHandwriting: openCodeHw, applyHandwriting: applyCodeHw } =
  useHandwritingFields({
    fieldLabels: {
      code: t('billing.code'),
      name: t('billing.serviceTitle'),
      description: t('billing.description'),
    },
    target: codeForm,
  })

function openAddCodeDialog() {
  codeForm.value = {
    code: '',
    name: '',
    description: '',
    price: '',
    insurance_coverage_percent: '',
    category: '',
  }
  codeDialog.value = true
}

async function saveProcedureCode() {
  if (!codeForm.value.code || !codeForm.value.name || !codeForm.value.price) {
    $toast.error(t('billing.fillRequiredFields'))
    return
  }
  savingCode.value = true
  try {
    const res = await apiFetch<any>('/api/billing/procedure-codes', {
      method: 'POST',
      body: {
        code: codeForm.value.code,
        name: codeForm.value.name,
        description: codeForm.value.description,
        price: Number(codeForm.value.price),
        insurance_coverage_percent: Number(codeForm.value.insurance_coverage_percent) || 0,
        category: codeForm.value.category,
      },
    })
    if (res.success) {
      $toast.success(t('billing.codeSaved'))
      codeDialog.value = false
      await fetchProcedureCodes()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('billing.saveCodeError'))
  } finally {
    savingCode.value = false
  }
}

// ==================== Patient Balance ====================
const balanceDialog = ref(false)
const loadingBalance = ref(false)
const patientBalance = ref<any>(null)

// Patient search for balance dialog
const balancePatientSearchQuery = ref('')
const balancePatientSearchResults = ref<any[]>([])
const showBalancePatientResults = ref(false)
const balancePatientSearching = ref(false)
let balancePatientSearchTimer: ReturnType<typeof setTimeout> | null = null
const selectedBalancePatient = ref<any>(null)

function onBalancePatientSearchInput() {
  if (balancePatientSearchTimer) clearTimeout(balancePatientSearchTimer)
  showBalancePatientResults.value = false
  if (!balancePatientSearchQuery.value?.trim()) {
    balancePatientSearchResults.value = []
    return
  }
  balancePatientSearchTimer = setTimeout(() => searchBalancePatients(), 400)
}

async function searchBalancePatients() {
  const q = balancePatientSearchQuery.value.trim()
  if (q.length < 2) return
  balancePatientSearching.value = true
  try {
    const res = await apiFetch<any>(`/api/billing/patients/search?q=${encodeURIComponent(q)}`)
    if (res.success) {
      balancePatientSearchResults.value = res.data
      showBalancePatientResults.value = true
    }
  } catch { /* ignore */ } finally {
    balancePatientSearching.value = false
  }
}

function selectBalancePatient(patient: any) {
  selectedBalancePatient.value = patient
  balancePatientSearchQuery.value = `${patient.firstName} ${patient.lastName}`
  showBalancePatientResults.value = false
  balancePatientSearchResults.value = []
}

function clearBalancePatient() {
  selectedBalancePatient.value = null
  balancePatientSearchQuery.value = ''
  balancePatientSearchResults.value = []
  showBalancePatientResults.value = false
}

function hideBalancePatientResults() {
  nextTick(() => { showBalancePatientResults.value = false })
}

function openBalanceDialog() {
  clearBalancePatient()
  patientBalance.value = null
  balanceDialog.value = true
}

async function fetchPatientBalance() {
  if (!selectedBalancePatient.value) {
    $toast.error(t('billing.selectPatientError'))
    return
  }
  loadingBalance.value = true
  patientBalance.value = null
  try {
    const res = await apiFetch<any>(`/api/billing/patient/${selectedBalancePatient.value.id}/balance`)
    if (res.success) {
      patientBalance.value = res.data
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('billing.fetchBalanceError'))
  } finally {
    loadingBalance.value = false
  }
}

// ==================== Helpers ====================
function formatPrice(value: number | string | undefined | null): string {
  const num = Number(value) || 0
  const separated = new Intl.NumberFormat('en-US').format(num)
  return `${separated} ${t('common.toman')}`
}

function formatJalaliDate(date: string | null | undefined): string {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

// ==================== Lifecycle ====================
onMounted(() => {
  fetchBillingRecords()
  fetchProcedureCodes()
})

useSeoMeta({ title: t('billing.titleSeo'), ogTitle: t('billing.ogTitle') })
</script>