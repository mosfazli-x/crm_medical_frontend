<template>
  <UiPageContainer>
    <UiPageHeader :title="t('dailyReports.title')" :subtitle="t('dailyReports.subtitle')" />

    <div class="crm-tabs mb-8">
      <button v-for="tb in tabs" :key="tb.key" :class="['crm-tab', tab === tb.key ? 'crm-tab-active' : '']"
        @click="tab = tb.key">
        {{ tb.label }}
      </button>
    </div>

    <!-- ============================= Save report ============================= -->
    <UiContentCard v-if="tab === 'report'">
      <template #header>
        <h2 class="crm-card-title text-lg">{{ t('dailyReports.saveReport') }}</h2>
      </template>

      <div class="!grid !grid-cols-1 md:!grid-cols-2 !gap-4 !mb-4 px-2">
        <div>
          <label class="crm-label !mb-1.5">{{ t('dailyReports.selectDate') }}</label>
          <div class="relative h-[56px] border rounded-xl overflow-hidden bg-white dark:bg-[#0f1115]">
            <PersianDatetimePicker v-model="form.reportDate" type="date" :placeholder="t('dailyReports.selectDate')"
              display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#4F46E5" auto-submit clearable custom-input />
          </div>
        </div>
        <div>
          <label class="crm-label !mb-1.5">{{ t('dailyReports.patient') }}</label>
          <PatientSelector v-model="form.patientId" :patients="patients" :label="t('dailyReports.patient')"
            :placeholder="t('dailyReports.patientPlaceholder')" />
        </div>
      </div>

      <div v-if="selectedPatient" class="crm-info-box !mb-4">
        <p class="!text-xs !font-bold !text-slate-500 dark:!text-slate-400 !mb-2">{{ t('dailyReports.patientDetails') }}
        </p>
        <div class="!flex !flex-wrap !items-center !gap-x-4 !gap-y-1 !text-sm">
          <span class="!font-bold">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</span>
          <span class="crm-divider-dot" aria-hidden="true" />
          <span>{{ t('dailyReports.nationalId') }}: <span class="crm-ltr !font-mono">{{ selectedPatient.nationalId
          }}</span></span>
          <template v-if="selectedPatient.phone">
            <span class="crm-divider-dot" aria-hidden="true" />
            <span>{{ t('dailyReports.phone') }}: <span class="crm-ltr">{{ selectedPatient.phone }}</span></span>
          </template>
          <template v-if="selectedPatient.insuranceType">
            <span class="crm-divider-dot" aria-hidden="true" />
            <span>{{ t('dailyReports.insurance') }}: {{ selectedPatient.insuranceType }}</span>
          </template>
        </div>
      </div>

      <div class="!mb-4 px-2">
        <label class="crm-label">{{ t('dailyReports.visitTypes') }}</label>
        <v-select v-model="form.visitTypes" :items="visitTypeOptions" item-title="label" item-value="value"
          variant="outlined" density="comfortable" :label="t('dailyReports.visitTypesPlaceholder')" multiple chips
          clearable hide-details="auto" class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
      </div>

      <div class="!mb-4 px-2">
        <label class="crm-label">{{ t('dailyReports.procedures') }}</label>
        <p class="!text-xs !text-slate-400 !mb-2">{{ t('dailyReports.proceduresHint') }}</p>
        <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-3">
          <UiClinicalCheckbox v-for="proc in PROCEDURE_ITEMS" :key="proc.key" v-model="form.procedures[proc.key]"
            :label="t(proc.labelKey)" />
        </div>
        <input v-if="form.procedures.other" v-model="form.otherProcedureText" type="text" class="crm-input !mt-3"
          :placeholder="t('dailyReports.otherPlaceholder')">
      </div>

      <div class="!grid !grid-cols-1 md:!grid-cols-2 !gap-4 !mb-4 px-2">
        <v-text-field v-model.number="form.feeCollected" type="number" min="0" variant="outlined" density="comfortable"
          :label="t('dailyReports.feeCollected')" hide-details="auto"
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
        <v-select v-model="form.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
          variant="outlined" density="comfortable" :label="t('dailyReports.paymentMethod')" hide-details="auto"
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
      </div>

      <v-textarea v-model="form.notes" variant="outlined" density="comfortable" rows="2" auto-grow
        :label="t('common.notes')" hide-details="auto" append-inner-icon="mdi-draw-pen" @click:append-inner="openMainHandwriting(t('common.notes'), (text) => form.notes = text)"
        class="!mb-4 !bg-white dark:!bg-[#0f1115] !rounded-xl px-2" />

      <div class="!flex !justify-end !gap-3 pb-2">
        <button class="crm-btn crm-btn-ghost" :disabled="saving" @click="resetForm">{{ t('common.cancel') }}</button>
        <button class="crm-btn crm-btn-primary" :disabled="saving" @click="submitReport">
          <Icon v-if="saving" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
          <Icon v-else name="lucide:save" class="!w-4 !h-4" />
          {{ saving ? t('dailyReports.saving') : t('dailyReports.saveReport') }}
        </button>
      </div>
    </UiContentCard>

    <!-- ============================= Reports list ============================= -->
    <template v-if="tab === 'reports'">
      <UiContentCard class="!mb-6">
        <template #header>
          <h2 class="crm-card-title">{{ reportsTitle }}</h2>
        </template>

        <div class="!flex !flex-wrap !items-end !gap-3">
          <div class="!min-w-[170px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.fromDate') }}</label>
            <div class="relative h-[40px] border rounded-lg overflow-hidden bg-white dark:bg-[#0f1115]">
              <PersianDatetimePicker v-model="listFilters.from" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" variant="outlined" density="compact" :label="t('dailyReports.fromDate')"
                hide-details />
            </div>
          </div>
          <div class="!min-w-[170px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.toDate') }}</label>
            <div class="relative h-[40px] border rounded-lg overflow-hidden bg-white dark:bg-[#0f1115]">
              <PersianDatetimePicker v-model="listFilters.to" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" variant="outlined" density="compact" :label="t('dailyReports.toDate')"
                hide-details />
            </div>
          </div>
          <v-select v-model="listFilters.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allPaymentMethods')" hide-details clearable
            class="!min-w-[150px]" />
          <v-select v-model="listFilters.procedure" :items="procedureOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allProcedures')" hide-details clearable
            class="!min-w-[150px]" />
          <v-select v-model="listFilters.visitType" :items="visitTypeOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allVisitTypes')" hide-details clearable
            class="!min-w-[160px]" />
          <div class="!min-w-[220px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.patient') }}</label>
            <PatientSelector v-model="listFilters.patientId" :patients="patients" :label="t('dailyReports.patient')"
              :placeholder="t('dailyReports.patientPlaceholder')" />
          </div>
          <div class="!flex !gap-2">
            <button class="crm-btn crm-btn-primary" @click="loadReports">{{ t('dailyReports.applyFilters') }}</button>
            <button class="crm-btn crm-btn-ghost" @click="resetFilters">{{ t('dailyReports.resetFilters') }}</button>
          </div>
        </div>
      </UiContentCard>

      <div v-if="reports.length" class="!grid !grid-cols-1 sm:!grid-cols-2 !gap-4 !mb-4">
        <UiStatCard :label="t('dailyReports.reportCount')" :value="String(reports.length)">
          <template #icon>
            <Icon name="lucide:files" class="!w-5 !h-5 !text-indigo-400" />
          </template>
        </UiStatCard>
        <UiStatCard :label="t('dailyReports.totalCollected')" :value="formatPrice(totalCollected)"
          value-class="!text-emerald-600 dark:!text-emerald-400">
          <template #icon>
            <Icon name="lucide:wallet" class="!w-5 !h-5 !text-emerald-500" />
          </template>
        </UiStatCard>
      </div>

      <UiContentCard>
        <UiLoadingSpinner v-if="loading" :text="t('dailyReports.loading')" />
        <UiEmptyState v-else-if="!reports.length" :title="t('dailyReports.noReports')"
          :description="t('dailyReports.noReportsDesc')">
          <template #icon>
            <Icon name="lucide:clipboard-list" class="!w-8 !h-8 !text-slate-300 dark:!text-slate-500" />
          </template>
        </UiEmptyState>
        <div v-else class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.selectDate') }}</th>
                <th>{{ t('dailyReports.patient') }}</th>
                <th>{{ t('dailyReports.visitTypes') }}</th>
                <th>{{ t('dailyReports.proceduresList') }}</th>
                <th>{{ t('dailyReports.fee') }}</th>
                <th>{{ t('dailyReports.payment') }}</th>
                <th class="!text-center">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td class="!whitespace-nowrap">{{ formatJalaliDateShort(report.reportDate) }}</td>
                <td>
                  <p class="!font-bold">{{ patientDisplay(report) }}</p>
                  <p v-if="report.patientNationalId" class="!text-xs !text-slate-400 crm-ltr !font-mono">{{
                    report.patientNationalId }}</p>
                </td>
                <td>
                  <div v-if="report.visitTypes?.length" class="!flex !flex-wrap !gap-1">
                    <span v-for="vt in report.visitTypes" :key="vt" class="crm-badge crm-badge-blue">{{ vt }}</span>
                  </div>
                  <span v-else class="!text-slate-400">—</span>
                </td>
                <td>
                  <div v-if="report.procedures?.length" class="!flex !flex-wrap !gap-1">
                    <span v-for="p in report.procedures" :key="p" class="crm-badge" :class="procedureBadgeClass(p)">{{
                      procedureLabel(p) }}</span>
                    <span v-if="report.otherProcedureText" class="!text-xs !text-slate-500 !block !mt-1">{{
                      report.otherProcedureText }}</span>
                  </div>
                  <span v-else class="!text-slate-400">—</span>
                </td>
                <td class="!font-bold !font-mono" dir="ltr">{{ formatPrice(report.feeCollected || '') }}</td>
                <td>
                  <span class="crm-badge" :class="paymentBadgeClass(report.paymentMethod)">{{
                    paymentLabel(report.paymentMethod) }}</span>
                </td>
                <td class="!text-center">
                  <button class="crm-icon-btn crm-icon-btn-danger" :title="t('common.delete')"
                    @click="confirmDelete(report)">
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- ============================= Visit types ============================= -->
    <template v-if="tab === 'visitTypes'">
      <UiContentCard>
        <template #header>
          <div class="!flex !flex-wrap !items-center !justify-between !gap-3 !w-full">
            <h2 class="crm-card-title">{{ t('dailyReports.visitTypes') }}</h2>
            <div class="!flex !items-center !gap-3">
              <v-switch v-model="includeInactive" color="#4F46E5" hide-details density="compact"
                :label="t('dailyReports.includeInactive')" />
              <button class="crm-btn crm-btn-primary" @click="openVisitTypeDialog()">
                <Icon name="lucide:plus" class="!w-4 !h-4" />
                {{ t('dailyReports.addVisitType') }}
              </button>
            </div>
          </div>
        </template>

        <UiLoadingSpinner v-if="visitTypesLoading" :text="t('dailyReports.loading')" />
        <UiEmptyState v-else-if="!visitTypeList.length" :title="t('dailyReports.noVisitTypes')"
          :description="t('dailyReports.noVisitTypesDesc')">
          <template #icon>
            <Icon name="lucide:stethoscope" class="!w-8 !h-8 !text-slate-300 dark:!text-slate-500" />
          </template>
        </UiEmptyState>
        <div v-else class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.visitTypeName') }}</th>
                <th>{{ t('dailyReports.description') }}</th>
                <th>{{ t('dailyReports.price') }}</th>
                <th>{{ t('dailyReports.color') }}</th>
                <th>{{ t('common.status') }}</th>
                <th class="!text-center">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vt in visitTypeList" :key="vt.id">
                <td class="!font-bold">{{ vt.name }}</td>
                <td class="!text-sm !text-slate-500">{{ vt.description || '—' }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(vt.price || '') }}</td>
                <td>
                  <span class="!inline-block !w-5 !h-5 !rounded-full !border !border-slate-200"
                    :style="{ backgroundColor: vt.color || '#cbd5e1' }" />
                </td>
                <td>
                  <v-switch :model-value="vt.isActive" color="#16A34A" hide-details density="compact"
                    :label="vt.isActive ? t('dailyReports.active') : t('dailyReports.inactive')"
                    @update:model-value="toggleVisitType(vt)" />
                </td>
                <td class="!text-center !whitespace-nowrap">
                  <button class="crm-icon-btn" :title="t('common.edit')" @click="openVisitTypeDialog(vt)">
                    <Icon name="lucide:pencil" class="!w-4 !h-4" />
                  </button>
                  <button class="crm-icon-btn crm-icon-btn-danger" :title="t('common.delete')"
                    @click="confirmVisitTypeDelete(vt)">
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>

      <!-- Visit type add/edit dialog -->
      <v-dialog v-model="visitTypeDialog" max-width="520" persistent>
        <div
          class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-2xl !border !border-slate-200/50 dark:!border-slate-800 !overflow-hidden">
          <div
            class="!px-6 !py-4 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
            <h3 class="!text-sm !font-bold !text-zinc-900 dark:!text-white">{{ visitTypeFormId ?
              t('dailyReports.editVisitType') : t('dailyReports.addVisitType') }}</h3>
            <button class="crm-icon-btn" @click="visitTypeDialog = false">
              <Icon name="lucide:x" class="!w-4 !h-4" />
            </button>
          </div>
          <div class="!p-6 !space-y-4">
            <v-text-field v-model="visitTypeForm.name" variant="outlined" density="comfortable"
              :label="t('dailyReports.visitTypeName')" :placeholder="t('dailyReports.visitTypeNamePlaceholder')"
              hide-details="auto" append-inner-icon="mdi-draw-pen" @click:append-inner="openVtHandwriting(t('dailyReports.visitTypeName'), (text) => visitTypeForm.name = text)" />
            <v-textarea v-model="visitTypeForm.description" variant="outlined" density="comfortable" rows="2" auto-grow
              :label="t('dailyReports.description')" hide-details="auto" append-inner-icon="mdi-draw-pen" @click:append-inner="openVtHandwriting(t('dailyReports.description'), (text) => visitTypeForm.description = text)" />
            <div class="!grid !grid-cols-2 !gap-4">
              <v-text-field v-model.number="visitTypeForm.price" type="number" min="0" variant="outlined"
                density="comfortable" :label="t('dailyReports.price')" hide-details="auto" />
              <div>
                <label class="crm-label !mb-1.5">{{ t('dailyReports.color') }}</label>
                <div class="!flex !items-center !gap-3 !h-[44px] !px-2 !border !rounded-xl bg-white dark:bg-[#0f1115]">
                  <input v-model="visitTypeForm.color" type="color"
                    class="!w-8 !h-8 !cursor-pointer !rounded-md !border-0 !p-0 !bg-transparent">
                  <span class="crm-ltr !font-mono !text-xs !text-slate-500">{{ visitTypeForm.color }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="!px-6 !py-4 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
            <button class="crm-btn crm-btn-ghost" @click="visitTypeDialog = false">{{ t('common.cancel') }}</button>
            <button class="crm-btn crm-btn-primary" :disabled="savingVisitType" @click="saveVisitType">
              <Icon v-if="savingVisitType" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
              <Icon v-else name="lucide:save" class="!w-4 !h-4" />
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </v-dialog>
    </template>

    <!-- ============================= Stats ============================= -->
    <template v-if="tab === 'stats'">
      <UiContentCard class="!mb-6">
        <template #header>
          <h2 class="crm-card-title">{{ t('dailyReports.tabs.stats') }}</h2>
        </template>

        <div class="!flex !flex-wrap !items-end !gap-3">
          <div class="!min-w-[170px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.fromDate') }}</label>
            <div class="relative h-[40px] border rounded-lg overflow-hidden bg-white dark:bg-[#0f1115]">
              <PersianDatetimePicker v-model="statsFilters.from" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" variant="outlined" density="compact" :label="t('dailyReports.fromDate')"
                hide-details />
            </div>
          </div>
          <div class="!min-w-[170px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.toDate') }}</label>
            <div class="relative h-[40px] border rounded-lg overflow-hidden bg-white dark:bg-[#0f1115]">
              <PersianDatetimePicker v-model="statsFilters.to" type="date" display-format="jYYYY/jMM/jDD"
                format="YYYY-MM-DD" variant="outlined" density="compact" :label="t('dailyReports.toDate')"
                hide-details />
            </div>
          </div>
          <v-select v-model="statsFilters.paymentMethod" :items="paymentOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allPaymentMethods')" hide-details clearable
            class="!min-w-[150px]" />
          <v-select v-model="statsFilters.procedure" :items="procedureOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allProcedures')" hide-details clearable
            class="!min-w-[150px]" />
          <v-select v-model="statsFilters.visitType" :items="visitTypeOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="t('dailyReports.allVisitTypes')" hide-details clearable
            class="!min-w-[160px]" />
          <div class="!min-w-[220px]">
            <label class="crm-label !mb-1.5">{{ t('dailyReports.patient') }}</label>
            <PatientSelector v-model="statsFilters.patientId" :patients="patients" :label="t('dailyReports.patient')"
              :placeholder="t('dailyReports.patientPlaceholder')" />
          </div>
          <div class="!flex !gap-2">
            <button class="crm-btn crm-btn-primary" @click="loadStats">{{ t('dailyReports.applyFilters') }}</button>
            <button class="crm-btn crm-btn-ghost" @click="resetStatsFilters">{{ t('dailyReports.resetFilters')
            }}</button>
          </div>
        </div>
      </UiContentCard>

      <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4 !mb-6">
        <UiStatCard :label="t('dailyReports.reportCount')" :value="String(stats?.totalReports ?? 0)">
          <template #icon>
            <Icon name="lucide:files" class="!w-5 !h-5 !text-indigo-400" />
          </template>
        </UiStatCard>
        <UiStatCard :label="t('dailyReports.totalCollected')" :value="formatPrice(stats?.totalCollected || '0')"
          value-class="!text-emerald-600 dark:!text-emerald-400">
          <template #icon>
            <Icon name="lucide:wallet" class="!w-5 !h-5 !text-emerald-500" />
          </template>
        </UiStatCard>
        <UiStatCard :label="t('dailyReports.averageCollected')" :value="formatPrice(stats?.average || '0')"
          value-class="!text-sky-600 dark:!text-sky-400">
          <template #icon>
            <Icon name="lucide:calculator" class="!w-5 !h-5 !text-sky-500" />
          </template>
        </UiStatCard>
      </div>

      <UiLoadingSpinner v-if="statsLoading" :text="t('dailyReports.loading')" />
      <UiEmptyState v-else-if="!stats || stats.totalReports === 0" :title="t('dailyReports.noStats')"
        :description="t('dailyReports.noStatsDesc')">
        <template #icon>
          <Icon name="lucide:bar-chart-3" class="!w-8 !h-8 !text-slate-300 dark:!text-slate-500" />
        </template>
      </UiEmptyState>

      <div v-else class="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
        <UiContentCard v-if="stats.byPaymentMethod?.length">
          <template #header>
            <h3 class="crm-card-title !text-sm">{{ t('dailyReports.byPaymentMethod') }}</h3>
          </template>
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.payment') }}</th>
                <th class="!text-center">{{ t('dailyReports.count') }}</th>
                <th class="!text-left">{{ t('dailyReports.totalCollected') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stats.byPaymentMethod" :key="row.payment_method">
                <td>
                  <span class="crm-badge" :class="paymentBadgeClass(row.payment_method)">{{
                    paymentLabel(row.payment_method)
                  }}</span>
                </td>
                <td class="!text-center !font-bold">{{ formatNumber(row.count) }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </UiContentCard>

        <UiContentCard v-if="stats.byProcedure?.length">
          <template #header>
            <h3 class="crm-card-title !text-sm">{{ t('dailyReports.byProcedure') }}</h3>
          </template>
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.proceduresList') }}</th>
                <th class="!text-center">{{ t('dailyReports.count') }}</th>
                <th class="!text-left">{{ t('dailyReports.totalCollected') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stats.byProcedure" :key="row.procedure">
                <td>
                  <span class="crm-badge" :class="procedureBadgeClass(row.procedure)">{{ procedureLabel(row.procedure)
                  }}</span>
                </td>
                <td class="!text-center !font-bold">{{ formatNumber(row.count) }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </UiContentCard>

        <UiContentCard v-if="stats.byVisitType?.length">
          <template #header>
            <h3 class="crm-card-title !text-sm">{{ t('dailyReports.byVisitType') }}</h3>
          </template>
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.visitType') }}</th>
                <th class="!text-center">{{ t('dailyReports.count') }}</th>
                <th class="!text-left">{{ t('dailyReports.totalCollected') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stats.byVisitType" :key="row.name">
                <td class="!font-bold">{{ row.name }}</td>
                <td class="!text-center !font-bold">{{ formatNumber(row.count) }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </UiContentCard>

        <UiContentCard v-if="stats.byDay?.length">
          <template #header>
            <h3 class="crm-card-title !text-sm">{{ t('dailyReports.byDay') }}</h3>
          </template>
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ t('dailyReports.selectDate') }}</th>
                <th class="!text-center">{{ t('dailyReports.count') }}</th>
                <th class="!text-left">{{ t('dailyReports.totalCollected') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in stats.byDay" :key="row.date">
                <td class="!whitespace-nowrap">{{ formatJalaliDateShort(row.date) }}</td>
                <td class="!text-center !font-bold">{{ formatNumber(row.count) }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </UiContentCard>
      </div>
    </template>

    <!-- Delete report confirm -->
    <v-dialog v-model="deleteDialog" max-width="440">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Icon name="lucide:trash-2" class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 dark:!text-white !mb-1.5">{{ t('dailyReports.deleteConfirm') }}
        </h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('dailyReports.deleteConfirm') }}</p>
        <div class="!flex !justify-center !gap-2 !mt-5">
          <button
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors"
            @click="deleteDialog = false">{{ t('common.cancel') }}</button>
          <button :disabled="deleting"
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center"
            @click="executeDelete">
            <v-progress-circular v-if="deleting" indeterminate size="12" width="2" color="white" class="!mr-2" />
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Delete visit type confirm -->
    <v-dialog v-model="visitTypeDeleteDialog" max-width="440">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Icon name="lucide:trash-2" class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 dark:!text-white !mb-1.5">{{
          t('dailyReports.visitTypeDeleteConfirm')
        }}</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('dailyReports.visitTypeDeleteConfirm') }}</p>
        <div class="!flex !justify-center !gap-2 !mt-5">
          <button
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors"
            @click="visitTypeDeleteDialog = false">{{ t('common.cancel') }}</button>
          <button :disabled="deletingVisitType"
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center"
            @click="executeVisitTypeDelete">
            <v-progress-circular v-if="deletingVisitType" indeterminate size="12" width="2" color="white"
              class="!mr-2" />
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </v-dialog>
    <HandwritingDialog v-model="mainHandwritingOpen" :label="mainHandwritingLabel" :numeric="mainHandwritingNumeric" @insert="applyMainHandwriting" />
    <HandwritingDialog v-model="vtHandwritingOpen" :label="vtHandwritingLabel" @insert="applyVtHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
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

const { t } = useI18n()
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



const mainHandwritingOpen = ref(false)
const mainHandwritingLabel = ref('')
const mainHandwritingNumeric = ref(false)
const mainHandwritingCallback = ref<((text: string) => void) | null>(null)

function openMainHandwriting(label: string, callback: (text: string) => void) {
  mainHandwritingLabel.value = label
  mainHandwritingCallback.value = callback
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

const formatNumber = (n: number | string) => {
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (isNaN(num)) return '0'
  return new Intl.NumberFormat('fa-IR').format(num)
}

const patientDisplay = (report: DailyReport) => {
  const name = [report.patientFirstName, report.patientLastName].filter(Boolean).join(' ').trim()
  return name || t('dailyReports.deletedPatient')
}

const procedureBadgeClass = (key: string) => {
  const map: Record<string, string> = {
    mixed_laser: 'crm-badge-blue',
    single_laser: 'crm-badge-confirmed',
    colonoscopy: 'crm-badge-pending',
    co2_test: 'crm-badge-emerald',
    other: 'crm-badge-neutral',
  }
  return map[key] || 'crm-badge-neutral'
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

const paymentBadgeClass = (method: string) =>
  method === 'card_terminal' ? 'crm-badge-emerald' : 'crm-badge-amber'

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
const vtHandwritingCallback = ref<((text: string) => void) | null>(null)

function openVtHandwriting(label: string, callback: (text: string) => void) {
  vtHandwritingLabel.value = label
  vtHandwritingCallback.value = callback
  vtHandwritingOpen.value = true
}

function applyVtHandwriting(text: string) {
  vtHandwritingCallback.value?.(text)
}

const emptyVisitTypeForm = () => ({
  name: '',
  description: '',
  price: null as number | null,
  color: '#4F46E5',
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
      color: visitType.color || '#4F46E5',
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
