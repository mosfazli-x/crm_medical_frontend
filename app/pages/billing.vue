<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-3 border-slate-100 dark:border-slate-700">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">مدیریت صورتحساب‌ها</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">مدیریت هزینه‌ها، کدهای خدمات و وضعیت پرداخت بیماران</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-slate-200 dark:border-slate-700">
      <nav class="flex gap-6 pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'pb-3 text-sm font-bold transition-colors relative',
            activeTab === tab.key
              ? 'text-electric-sapphire after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-electric-sapphire after:rounded-full'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- ==================== Billing Records Tab ==================== -->
    <template v-if="activeTab === 'records'">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
        <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-sm px-3 py-2">
          <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">مجموع صورتحساب‌ها</div>
          <div class="text-2xl font-black text-slate-800 dark:text-slate-100">{{ formatPrice(summary.totalBilled) }}</div>
        </div>
        <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-sm px-3 py-2">
          <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">وصول شده</div>
          <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ formatPrice(summary.totalCollected) }}</div>
        </div>
        <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 shadow-sm px-3 py-2">
          <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">در انتظار پرداخت</div>
          <div class="text-2xl font-black text-amber-600 dark:text-amber-400">{{ formatPrice(summary.totalPending) }}</div>
        </div>
      </div>

      <!-- Search & Add Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
        <div class="w-full sm:max-w-xs">
          <v-text-field
            v-model="searchQuery"
            variant="outlined"
            density="compact"
            placeholder="جستجو با نام بیمار..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            class="billing-search"
          />
        </div>
        <div class="flex gap-2">
          <v-btn variant="tonal" color="#5465ff" prepend-icon="mdi-account-cash" @click="openBalanceDialog">
            مشاهده حساب بیمار
          </v-btn>
          <v-btn variant="tonal" color="green" prepend-icon="mdi-plus" @click="openAddRecordDialog">
            ثبت صورتحساب جدید
          </v-btn>
        </div>
      </div>

      <!-- Billing Records Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-right border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">بیمار</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">خدمت</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">تاریخ</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">مبلغ</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">سهم بیمه</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">سهم بیمار</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">وضعیت</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">عملیات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-if="recordsLoading" v-for="i in 4" :key="`sk-${i}`">
                <td colspan="8" class="p-4">
                  <v-skeleton-loader type="list-item" class="bg-transparent" />
                </td>
              </tr>
              <tr v-else-if="filteredRecords.length === 0">
                <td colspan="8" class="py-16 text-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-full">
                      <v-icon icon="mdi-cash-remove" size="48" color="slate-400" />
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">هیچ صورتحسابی یافت نشد.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-else
                v-for="record in filteredRecords"
                :key="record.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-700/60 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                  {{ record.patient_name || record.patient?.firstName + ' ' + record.patient?.lastName || '---' }}
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {{ record.procedure_name || record.procedureCode?.name || '---' }}
                </td>
                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {{ formatJalaliDate(record.billing_date) }}
                </td>
                <td class="px-6 py-4 text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap" dir="ltr">
                  {{ formatPrice(record.amount) }}
                </td>
                <td class="px-6 py-4 text-sm font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap" dir="ltr">
                  {{ formatPrice(record.insurance_portion) }}
                </td>
                <td class="px-6 py-4 text-sm font-mono text-amber-700 dark:text-amber-300 whitespace-nowrap" dir="ltr">
                  {{ formatPrice(record.patient_portion) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', statusConfig[record.status]?.bg, statusConfig[record.status]?.text, statusConfig[record.status]?.ring]"
                  >
                    {{ statusLabels[record.status] || record.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <template v-if="record.status === 'pending'">
                      <v-tooltip text="تأیید پرداخت" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            size="small"
                            class="text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                            @click="updateRecordStatus(record.id, 'paid')"
                          >
                            <v-icon size="20">mdi-check-circle-outline</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                      <v-tooltip text="لغو" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            size="small"
                            class="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                            @click="updateRecordStatus(record.id, 'cancelled')"
                          >
                            <v-icon size="20">mdi-cancel</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                    <template v-else-if="record.status === 'partial'">
                      <v-tooltip text="تسویه کامل" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            variant="text"
                            size="small"
                            class="text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                            @click="updateRecordStatus(record.id, 'paid')"
                          >
                            <v-icon size="20">mdi-check-all</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ==================== Procedure Codes Tab ==================== -->
    <template v-if="activeTab === 'codes'">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div class="w-full sm:max-w-xs">
          <v-select
            v-model="categoryFilter"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            placeholder="همه دسته‌بندی‌ها"
            prepend-inner-icon="mdi-filter-variant"
            hide-details
            clearable
            class="billing-filter"
          />
        </div>
        <v-btn variant="tonal" color="green" prepend-icon="mdi-plus" @click="openAddCodeDialog">
          افزودن کد خدمت
        </v-btn>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-right border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">کد</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">نام خدمت</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">توضیحات</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">قیمت</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">پوشش بیمه</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">دسته‌بندی</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-if="codesLoading" v-for="i in 4" :key="`sk-code-${i}`">
                <td colspan="6" class="p-4">
                  <v-skeleton-loader type="list-item" class="bg-transparent" />
                </td>
              </tr>
              <tr v-else-if="filteredCodes.length === 0">
                <td colspan="6" class="py-16 text-center">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="bg-slate-50 dark:bg-slate-700 p-4 rounded-full">
                      <v-icon icon="mdi-clipboard-text-outline" size="48" color="slate-400" />
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">هیچ کد خدمتی یافت نشد.</p>
                  </div>
                </td>
              </tr>
              <tr
                v-else
                v-for="code in filteredCodes"
                :key="code.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-700/60 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-mono font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ code.code }}</td>
                <td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{{ code.name }}</td>
                <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{{ code.description || '---' }}</td>
                <td class="px-6 py-4 text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap" dir="ltr">
                  {{ formatPrice(code.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-mono font-bold text-electric-sapphire dark:text-cornflower-blue">{{ code.insurance_coverage_percent }}%</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20 dark:ring-slate-400/20">
                    {{ categoryLabels[code.category] || code.category }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ==================== Add Billing Record Dialog ==================== -->
    <v-dialog v-model="recordDialog" max-width="600" class="backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div class="bg-slate-50 dark:bg-slate-700 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">ثبت صورتحساب جدید</h2>
          <v-btn icon variant="text" size="small" @click="recordDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="p-6 space-y-4">
          <v-text-field
            v-model="recordForm.patient_id"
            variant="outlined"
            density="compact"
            label="شناسه بیمار"
            placeholder="شناسه بیمار را وارد کنید"
            hide-details="auto"
          />
          <v-select
            v-model="recordForm.procedure_code_id"
            :items="procedureCodes"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            label="کد خدمت"
            placeholder="انتخاب خدمت"
            hide-details="auto"
          />
          <v-text-field
            v-model="recordForm.amount"
            variant="outlined"
            density="compact"
            label="مبلغ"
            placeholder="مبلغ را وارد کنید"
            type="number"
            hide-details="auto"
          />
          <v-text-field
            v-model="recordForm.insurance_portion"
            variant="outlined"
            density="compact"
            label="سهم بیمه"
            placeholder="سهم بیمه"
            type="number"
            hide-details="auto"
          />
          <v-text-field
            v-model="recordForm.patient_portion"
            variant="outlined"
            density="compact"
            label="سهم بیمار"
            placeholder="سهم بیمار"
            type="number"
            hide-details="auto"
          />
          <v-select
            v-model="recordForm.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            label="وضعیت"
            placeholder="انتخاب وضعیت"
            hide-details="auto"
          />
          <PersianDatetimePicker
            v-model="recordForm.billing_date"
            type="date"
            placeholder="تاریخ صورتحساب"
            display-format="jYYYY/jMM/jDD"
            format="YYYY-MM-DD"
            color="#000000"
            auto-submit
            clearable
            custom-input
            class="billing-datepicker"
          />
          <v-textarea
            v-model="recordForm.notes"
            variant="outlined"
            density="compact"
            label="یادداشت"
            placeholder="یادداشت (اختیاری)"
            rows="2"
            hide-details="auto"
          />
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <v-btn variant="tonal" color="red" @click="recordDialog = false">انصراف</v-btn>
          <v-btn variant="tonal" color="green" :loading="savingRecord" @click="saveBillingRecord">
            ذخیره صورتحساب
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- ==================== Add Procedure Code Dialog ==================== -->
    <v-dialog v-model="codeDialog" max-width="550" class="backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div class="bg-slate-50 dark:bg-slate-700 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">افزودن کد خدمت</h2>
          <v-btn icon variant="text" size="small" @click="codeDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="p-6 space-y-4">
          <v-text-field
            v-model="codeForm.code"
            variant="outlined"
            density="compact"
            label="کد"
            placeholder="مثال: CON-001"
            hide-details="auto"
          />
          <v-text-field
            v-model="codeForm.name"
            variant="outlined"
            density="compact"
            label="نام خدمت"
            placeholder="نام فارسی خدمت"
            hide-details="auto"
          />
          <v-textarea
            v-model="codeForm.description"
            variant="outlined"
            density="compact"
            label="توضیحات"
            placeholder="توضیحات خدمت (اختیاری)"
            rows="2"
            hide-details="auto"
          />
          <v-text-field
            v-model="codeForm.price"
            variant="outlined"
            density="compact"
            label="قیمت"
            placeholder="قیمت به ریال/تومان"
            type="number"
            hide-details="auto"
          />
          <v-text-field
            v-model="codeForm.insurance_coverage_percent"
            variant="outlined"
            density="compact"
            label="درصد پوشش بیمه"
            placeholder="مثال: 70"
            type="number"
            suffix="%"
            hide-details="auto"
          />
          <v-select
            v-model="codeForm.category"
            :items="categoryOptions"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            label="دسته‌بندی"
            placeholder="انتخاب دسته‌بندی"
            hide-details="auto"
          />
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <v-btn variant="tonal" color="red" @click="codeDialog = false">انصراف</v-btn>
          <v-btn variant="tonal" color="green" :loading="savingCode" @click="saveProcedureCode">
            ذخیره کد خدمت
          </v-btn>
        </div>
      </div>
    </v-dialog>

    <!-- ==================== Patient Balance Dialog ==================== -->
    <v-dialog v-model="balanceDialog" max-width="500" class="backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div class="bg-slate-50 dark:bg-slate-700 px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-slate-800 dark:text-slate-100">مشاهده حساب بیمار</h2>
          <v-btn icon variant="text" size="small" @click="balanceDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="p-6 space-y-4">
          <v-text-field
            v-model="balancePatientId"
            variant="outlined"
            density="compact"
            label="شناسه بیمار"
            placeholder="شناسه عددی بیمار را وارد کنید"
            type="number"
            hide-details="auto"
          />
          <v-btn
            variant="tonal"
            color="#5465ff"
            block
            :loading="loadingBalance"
            @click="fetchPatientBalance"
          >
            نمایش حساب
          </v-btn>
          <div v-if="patientBalance !== null" class="bg-slate-50 dark:bg-slate-700 rounded-2xl p-5 space-y-3 border border-slate-200 dark:border-slate-600">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-slate-500 dark:text-slate-400">مجموع صورتحساب‌ها</span>
              <span class="text-lg font-bold text-slate-800 dark:text-slate-100" dir="ltr">{{ formatPrice(patientBalance.total_billed || 0) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-slate-500 dark:text-slate-400">پرداخت شده</span>
              <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">{{ formatPrice(patientBalance.total_paid || 0) }}</span>
            </div>
            <div class="border-t border-slate-200 dark:border-slate-600 pt-3 flex justify-between items-center">
              <span class="text-sm font-bold text-slate-600 dark:text-slate-300">مانده حساب</span>
              <span
                :class="['text-xl font-black', (patientBalance.balance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400']"
                dir="ltr"
              >
                {{ formatPrice(patientBalance.balance || 0) }}
              </span>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <v-btn variant="tonal" color="red" @click="balanceDialog = false">بستن</v-btn>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const activeTab = ref<'records' | 'codes'>('records')

const tabs = [
  { key: 'records', label: 'صورتحساب‌ها' },
  { key: 'codes', label: 'کدهای خدمات' },
]

const statusLabels: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  partial: 'پرداخت جزئی',
  cancelled: 'لغو شده',
}

const statusConfig: Record<string, { bg: string; text: string; ring: string }> = {
  paid: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-600/20 dark:ring-emerald-400/20' },
  pending: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-600/20 dark:ring-amber-400/20' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-600/20 dark:ring-red-400/20' },
  partial: { bg: 'bg-light-cyan dark:bg-electric-sapphire/20', text: 'text-electric-sapphire dark:text-cornflower-blue', ring: 'ring-electric-sapphire/20 dark:ring-cornflower-blue/20' },
}

const categoryLabels: Record<string, string> = {
  consultation: 'مشاوره',
  surgery: 'جراحی',
  imaging: 'تصویربرداری',
  lab: 'آزمایشگاه',
  ultrasound: 'سونوگرافی',
  other: 'سایر',
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
    const name = (r.patient_name || `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`).toLowerCase()
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
    $toast.error('خطا در دریافت صورتحساب‌ها')
  } finally {
    recordsLoading.value = false
  }
}

// ==================== Add Billing Record ====================
const recordDialog = ref(false)
const savingRecord = ref(false)
const procedureCodes = ref<any[]>([])

const recordForm = ref({
  patient_id: '',
  procedure_code_id: null,
  amount: '',
  insurance_portion: '',
  patient_portion: '',
  status: 'pending',
  notes: '',
  billing_date: '',
})

function openAddRecordDialog() {
  recordForm.value = {
    patient_id: '',
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
  if (!recordForm.value.patient_id || !recordForm.value.amount) {
    $toast.error('لطفاً شناسه بیمار و مبلغ را وارد کنید.')
    return
  }
  savingRecord.value = true
  try {
    const res = await apiFetch<any>('/api/billing/records', {
      method: 'POST',
      body: {
        patient_id: Number(recordForm.value.patient_id),
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
      $toast.success('صورتحساب با موفقیت ثبت شد.')
      recordDialog.value = false
      await fetchBillingRecords()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ثبت صورتحساب')
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
      $toast.success('وضعیت صورتحساب به‌روزرسانی شد.')
      await fetchBillingRecords()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در به‌روزرسانی وضعیت')
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
    $toast.error('خطا در دریافت کدهای خدمات')
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
    $toast.error('لطفاً کد، نام خدمت و قیمت را وارد کنید.')
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
      $toast.success('کد خدمت با موفقیت افزوده شد.')
      codeDialog.value = false
      await fetchProcedureCodes()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در افزودن کد خدمت')
  } finally {
    savingCode.value = false
  }
}

// ==================== Patient Balance ====================
const balanceDialog = ref(false)
const balancePatientId = ref('')
const loadingBalance = ref(false)
const patientBalance = ref<any>(null)

function openBalanceDialog() {
  balancePatientId.value = ''
  patientBalance.value = null
  balanceDialog.value = true
}

async function fetchPatientBalance() {
  if (!balancePatientId.value) {
    $toast.error('لطفاً شناسه بیمار را وارد کنید.')
    return
  }
  loadingBalance.value = true
  patientBalance.value = null
  try {
    const res = await apiFetch<any>(`/api/billing/patient/${Number(balancePatientId.value)}/balance`)
    if (res.success) {
      patientBalance.value = res.data
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در دریافت حساب بیمار')
  } finally {
    loadingBalance.value = false
  }
}

// ==================== Helpers ====================
function formatPrice(value: number | string | undefined | null): string {
  const num = Number(value) || 0
  return new Intl.NumberFormat('fa-IR').format(num) + ' تومان'
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

useSeoMeta({ title: 'مدیریت صورتحساب‌ها | سیستم کلینیک', ogTitle: 'مدیریت صورتحساب‌ها' })
</script>

<style scoped>
.billing-search :deep(.v-field__input) {
  font-size: 0.875rem;
}
.billing-filter :deep(.v-field__input) {
  font-size: 0.875rem;
}
.billing-datepicker :deep(.v-field__input) {
  font-size: 0.875rem;
}
</style>
