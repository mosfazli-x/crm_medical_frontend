<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('accounting.title')" :subtitle="$t('accounting.subtitle')">
      <template #actions>
        <button v-if="accounts.length === 0" @click="seedAccounts" class="crm-btn crm-btn-secondary">
          <Icon name="lucide:database" class="!w-4 !h-4" />
          {{ $t('accounting.seedAccounts') }}
        </button>
      </template>
    </UiPageHeader>

    <div class="crm-tabs mb-8">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="['crm-tab', activeTab === tab.key ? 'crm-tab-active' : '']">
        {{ tab.label }}
      </button>
    </div>

    <!-- Chart of Accounts -->
    <template v-if="activeTab === 'accounts'">
      <div class="!flex !justify-end !pb-4">
        <button @click="openAccountDialog" class="crm-btn crm-btn-primary">
          <Plus class="!w-4 !h-4" />
          {{ $t('accounting.addAccount') }}
        </button>
      </div>

      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('accounting.code') }}</th>
                <th>{{ $t('accounting.accountName') }}</th>
                <th>{{ $t('accounting.type') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th class="!text-center">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="accountsLoading">
                <td colspan="5"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
              </tr>
              <tr v-else-if="accounts.length === 0">
                <td colspan="5" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:book-open" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('accounting.noAccounts') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="account in accounts" :key="account.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30">
                <td class=" !font-bold">{{ account.code }}</td>
                <td class="!font-bold">{{ account.name }}</td>
                <td>
                  <span class="crm-badge" :class="typeBadgeClass(account.type)">
                    {{ typeLabel(account.type) }}
                  </span>
                </td>
                <td>
                  <UiStatusBadge :status="account.isActive ? 'active' : 'inactive'" />
                </td>
                <td class="!text-center">
                  <button @click="editAccount(account)"
                    class="!p-1.5 !text-slate-400 hover:!text-indigo-500 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20 !rounded-lg">
                    <Icon name="lucide:pencil" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Journal Entries -->
    <template v-if="activeTab === 'journal'">
      <div class="!grid !grid-cols-1 sm:!grid-cols-4 !gap-4 !pb-4">
        <v-select v-model="journalFilter.period" :items="periodOptions" item-title="label" item-value="value"
          variant="outlined" density="comfortable" :label="$t('accounting.period')" hide-details="auto"
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
        <v-text-field v-model="journalFilter.start_date" variant="outlined" density="comfortable"
          :label="$t('accounting.startDate')" type="date" hide-details="auto"
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
        <v-text-field v-model="journalFilter.end_date" variant="outlined" density="comfortable"
          :label="$t('accounting.endDate')" type="date" hide-details="auto"
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl" />
        <div class="!flex !gap-2 !items-end">
          <button @click="fetchJournalEntries" class="crm-btn crm-btn-primary !flex-1">
            <Search class="!w-4 !h-4" />
            {{ $t('common.search') }}
          </button>
          <button @click="openJournalDialog" class="crm-btn crm-btn-primary">
            <Plus class="!w-4 !h-4" />
          </button>
        </div>
      </div>

      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('accounting.entryNumber') }}</th>
                <th>{{ $t('accounting.date') }}</th>
                <th>{{ $t('accounting.description') }}</th>
                <th>{{ $t('accounting.debit') }}</th>
                <th>{{ $t('accounting.credit') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th class="!text-center">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="journalLoading">
                <td colspan="7"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
              </tr>
              <tr v-else-if="journalEntries.length === 0">
                <td colspan="7" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:notebook-text" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('accounting.noEntries') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="entry in journalEntries" :key="entry.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30 !cursor-pointer"
                @click="viewJournalEntry(entry)">
                <td class=" !font-bold !text-xs">{{ entry.entryNumber }}</td>
                <td class="!text-sm !font-medium">{{ formatJalaliDate(entry.entryDate) }}</td>
                <td class="!max-w-xs !truncate !text-sm">{{ entry.description }}</td>
                <td class=" !font-bold !text-emerald-600" dir="ltr">{{ formatPrice(entry.totalDebit) }}</td>
                <td class=" !font-bold !text-red-500" dir="ltr">{{ formatPrice(entry.totalCredit) }}</td>
                <td>
                  <UiStatusBadge :status="entry.status === 'posted' ? 'active' : 'inactive'" />
                </td>
                <td class="!text-center">
                  <button @click.stop="viewJournalEntry(entry)"
                    class="!p-1.5 !text-slate-400 hover:!text-indigo-500 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20 !rounded-lg">
                    <Icon name="lucide:eye" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Reports -->
    <template v-if="activeTab === 'reports'">
      <div class="!flex !flex-wrap !gap-3 !pb-6">
        <button v-for="r in reportPeriods" :key="r.key" @click="fetchReport(r.key)"
          :class="['crm-btn', activeReport === r.key ? 'crm-btn-primary' : 'crm-btn-secondary']">
          <Icon :name="r.icon" class="!w-4 !h-4" />
          {{ r.label }}
        </button>
      </div>

      <div v-if="reportData" class="!space-y-6">
        <!-- Summary Cards -->
        <div class="!grid !grid-cols-1 sm:!grid-cols-4 !gap-4">
          <UiStatCard :label="$t('accounting.totalRevenue')" :value="formatPrice(reportData.summary.totalRevenue)"
            value-class="!text-emerald-600 dark:!text-emerald-400">
            <template #icon>
              <Icon name="lucide:trending-up" class="!w-5 !h-5 !text-emerald-500" />
            </template>
          </UiStatCard>
          <UiStatCard :label="$t('accounting.totalExpense')" :value="formatPrice(reportData.summary.totalExpense)"
            value-class="!text-red-500">
            <template #icon>
              <Icon name="lucide:trending-down" class="!w-5 !h-5 !text-red-400" />
            </template>
          </UiStatCard>
          <UiStatCard :label="$t('accounting.netIncome')" :value="formatPrice(reportData.summary.netIncome)"
            :value-class="reportData.summary.netIncome >= 0 ? '!text-emerald-600' : '!text-red-500'">
            <template #icon>
              <Icon name="lucide:wallet" class="!w-5 !h-5"
                :class="reportData.summary.netIncome >= 0 ? '!text-emerald-500' : '!text-red-400'" />
            </template>
          </UiStatCard>
          <UiStatCard :label="$t('accounting.transactionCount')" :value="String(reportData.summary.transactionCount)"
            value-class="!text-indigo-600 dark:!text-indigo-400">
            <template #icon>
              <Icon name="lucide:files" class="!w-5 !h-5 !text-indigo-400" />
            </template>
          </UiStatCard>
        </div>

        <!-- Income Statement Table -->
        <UiContentCard :title="$t('accounting.incomeStatement')">
          <div class="!space-y-4">
            <div>
              <h4 class="!text-sm !font-bold !text-emerald-600 !mb-2">{{ $t('accounting.revenues') }}</h4>
              <div v-for="acc in reportData.incomeStatement.revenue.accounts" :key="acc.id"
                class="!flex !justify-between !py-1.5 !px-2 hover:!bg-slate-50 dark:hover:!bg-slate-800/30 !rounded-lg">
                <span class="!text-sm">{{ acc.code }} - {{ acc.name }}</span>
                <span class="!text-sm !font-bold " dir="ltr">{{ formatPrice(acc.balance) }}</span>
              </div>
              <div class="!flex !justify-between !py-2 !px-2 !border-t !border-slate-200 dark:!border-slate-700 !mt-1">
                <span class="!text-sm !font-black">{{ $t('accounting.totalRevenue') }}</span>
                <span class="!text-sm !font-black !text-emerald-600 " dir="ltr">{{
                  formatPrice(reportData.incomeStatement.revenue.total) }}</span>
              </div>
            </div>
            <div>
              <h4 class="!text-sm !font-bold !text-red-500 !mb-2">{{ $t('accounting.expenses') }}</h4>
              <div v-for="acc in reportData.incomeStatement.expense.accounts" :key="acc.id"
                class="!flex !justify-between !py-1.5 !px-2 hover:!bg-slate-50 dark:hover:!bg-slate-800/30 !rounded-lg">
                <span class="!text-sm">{{ acc.code }} - {{ acc.name }}</span>
                <span class="!text-sm !font-bold " dir="ltr">{{ formatPrice(acc.balance) }}</span>
              </div>
              <div class="!flex !justify-between !py-2 !px-2 !border-t !border-slate-200 dark:!border-slate-700 !mt-1">
                <span class="!text-sm !font-black">{{ $t('accounting.totalExpense') }}</span>
                <span class="!text-sm !font-black !text-red-500 " dir="ltr">{{
                  formatPrice(reportData.incomeStatement.expense.total) }}</span>
              </div>
            </div>
            <div class="!flex !justify-between !py-3 !px-2 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl">
              <span class="!text-base !font-black">{{ $t('accounting.netIncome') }}</span>
              <span class="!text-base !font-black "
                :class="reportData.incomeStatement.netIncome >= 0 ? '!text-emerald-600' : '!text-red-500'" dir="ltr">
                {{ formatPrice(reportData.incomeStatement.netIncome) }}
              </span>
            </div>
          </div>
        </UiContentCard>

        <!-- Recent Transactions -->
        <UiContentCard :title="$t('accounting.recentTransactions')" v-if="reportData.entries.length">
          <div class="!overflow-x-auto">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>{{ $t('accounting.entryNumber') }}</th>
                  <th>{{ $t('accounting.date') }}</th>
                  <th>{{ $t('accounting.description') }}</th>
                  <th>{{ $t('common.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in reportData.entries.slice(0, 10)" :key="entry.id">
                  <td class=" !font-bold !text-xs">{{ entry.entryNumber }}</td>
                  <td class="!text-sm">{{ formatJalaliDate(entry.entryDate) }}</td>
                  <td class="!text-sm">{{ entry.description }}</td>
                  <td>
                    <UiStatusBadge :status="entry.status === 'posted' ? 'active' : 'inactive'" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UiContentCard>
      </div>

      <div v-else class="!py-20 !text-center">
        <div class="!flex !flex-col !items-center !gap-3">
          <Icon name="lucide:bar-chart-3" class="!w-12 !h-12 !text-slate-300" />
          <p class="!text-slate-500 !font-semibold">{{ $t('accounting.selectPeriod') }}</p>
        </div>
      </div>
    </template>

    <!-- Account Dialog -->
    <v-dialog v-model="accountDialog" max-width="500">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ editingAccount ? $t('accounting.editAccount') :
            $t('accounting.addAccount') }}
          </h2>
          <button @click="accountDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <IconsCloseCircle class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="accountForm.code" variant="outlined" density="comfortable"
              :label="$t('accounting.code')" :placeholder="$t('accounting.codePlaceholder')" hide-details="auto" />
            <v-select v-model="accountForm.type" :items="accountTypes" item-title="label" item-value="value"
              variant="outlined" density="comfortable" :label="$t('accounting.type')" hide-details="auto" />
          </div>
          <v-text-field v-model="accountForm.name" variant="outlined" density="comfortable"
            :label="$t('accounting.accountName')" :placeholder="$t('accounting.namePlaceholder')" hide-details="auto" />
          <v-textarea v-model="accountForm.description" variant="outlined" density="comfortable"
            :label="$t('common.notes')" rows="2" hide-details="auto" />
        </div>
        <div
          class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="accountDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingAccount" @click="saveAccount" class="crm-btn crm-btn-primary">
            <Icon v-if="savingAccount" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Journal Entry Dialog -->
    <v-dialog v-model="journalDialog" max-width="700">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ $t('accounting.newJournalEntry') }}</h2>
          <button @click="journalDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <IconsCloseCircle class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="journalForm.entry_date" variant="outlined" density="comfortable"
              :label="$t('accounting.date')" type="date" hide-details="auto" />
            <v-text-field v-model="journalForm.reference" variant="outlined" density="comfortable"
              :label="$t('accounting.reference')" :placeholder="$t('accounting.referencePlaceholder')"
              hide-details="auto" />
          </div>
          <v-textarea v-model="journalForm.description" variant="outlined" density="comfortable"
            :label="$t('accounting.description')" rows="2" hide-details="auto" />

          <div class="!border-t !border-slate-100 dark:!border-slate-800 !pt-4">
            <div class="!flex !items-center !justify-between !mb-3">
              <h3 class="!text-sm !font-bold">{{ $t('accounting.journalLines') }}</h3>
              <button @click="addJournalLine" class="crm-btn crm-btn-sm crm-btn-secondary">
                <Plus class="!w-3.5 !h-3.5" />
                {{ $t('accounting.addLine') }}
              </button>
            </div>
            <div class="!space-y-3">
              <div v-for="(line, idx) in journalForm.lines" :key="idx"
                class="!flex !flex-wrap !gap-2 !items-center justify-center align-middle !p-3 !bg-slate-50 dark:!bg-slate-800/30 !rounded-xl">
                <div class="!flex-1 !min-w-[200px]">
                  <v-select v-model="line.account_id" :items="accounts" item-title="label" item-value="id"
                    variant="outlined" density="compact" :label="$t('accounting.account')" hide-details="auto" />
                </div>
                <div class="!w-[120px]">
                  <v-text-field v-model="line.debit" variant="outlined" density="compact"
                    :label="$t('accounting.debit')" type="number" hide-details="auto" />
                </div>
                <div class="!w-[120px]">
                  <v-text-field v-model="line.credit" variant="outlined" density="compact"
                    :label="$t('accounting.credit')" type="number" hide-details="auto" />
                </div>
                <button @click="removeJournalLine(idx)" class="!p-2 !text-red-400 hover:!text-red-600 !rounded-lg">
                  <TrashBin class="!w-4 !h-4" />
                </button>
              </div>
            </div>
            <div class="!flex !justify-between !mt-4 !px-2 !py-2 !bg-slate-100 dark:!bg-slate-800/50 !rounded-lg">
              <span class="!text-sm !font-bold">{{ $t('accounting.balance') }}:</span>
              <span class="!text-sm  !font-bold" :class="journalBalance !== 0 ? '!text-red-500' : '!text-emerald-500'"
                dir="ltr">
                {{ formatPrice(journalBalance) }}
              </span>
            </div>
          </div>
        </div>
        <div
          class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="journalDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingJournal" @click="saveJournalEntry" class="crm-btn crm-btn-primary">
            <Icon v-if="savingJournal" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- View Journal Entry Dialog -->
    <v-dialog v-model="viewJournalDialog" max-width="650">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ $t('accounting.journalEntryDetails') }}</h2>
          <button @click="viewJournalDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <IconsCloseCircle class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5" v-if="viewingEntry">
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <span class="!text-xs !text-slate-500">{{ $t('accounting.entryNumber') }}</span>
              <p class="!font-bold ">{{ viewingEntry.entryNumber }}</p>
            </div>
            <div>
              <span class="!text-xs !text-slate-500">{{ $t('accounting.date') }}</span>
              <p class="!font-bold">{{ formatJalaliDate(viewingEntry.entryDate) }}</p>
            </div>
          </div>
          <div>
            <span class="!text-xs !text-slate-500">{{ $t('accounting.description') }}</span>
            <p class="!font-medium">{{ viewingEntry.description }}</p>
          </div>
          <div v-if="viewingEntry.reference">
            <span class="!text-xs !text-slate-500">{{ $t('accounting.reference') }}</span>
            <p class="!font-medium">{{ viewingEntry.reference }} <span v-if="viewingEntry.referenceType"
                class="!text-slate-400">({{ viewingEntry.referenceType }})</span></p>
          </div>
          <div class="!border-t !border-slate-100 dark:!border-slate-800 !pt-4">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>{{ $t('accounting.accountCode') }}</th>
                  <th>{{ $t('accounting.accountName') }}</th>
                  <th>{{ $t('accounting.debit') }}</th>
                  <th>{{ $t('accounting.credit') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="line in viewingEntry.lines" :key="line.id">
                  <td class="">{{ line.accountCode }}</td>
                  <td class="!font-medium">{{ line.accountName }}</td>
                  <td class=" !font-bold !text-emerald-600" dir="ltr">{{ formatPrice(line.debit) }}</td>
                  <td class=" !font-bold !text-red-500" dir="ltr">{{ formatPrice(line.credit) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Plus from '~/components/icons/Plus.vue'
import Search from '~/components/icons/Search.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { useApi } from '~/composables/useApi'
import { useFormatting } from '~/composables/useFormatting'

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate, formatPrice } = useFormatting()

const activeTab = ref<'accounts' | 'journal' | 'reports'>('accounts')
const activeReport = ref<string | null>(null)

const tabs = [
  { key: 'accounts', label: t('accounting.tabs.accounts') },
  { key: 'journal', label: t('accounting.tabs.journal') },
  { key: 'reports', label: t('accounting.tabs.reports') },
]

const reportPeriods = [
  { key: 'daily', label: t('accounting.periods.daily'), icon: 'lucide:calendar' },
  { key: 'weekly', label: t('accounting.periods.weekly'), icon: 'lucide:calendar-range' },
  { key: 'monthly', label: t('accounting.periods.monthly'), icon: 'lucide:calendar-check' },
  { key: 'annual', label: t('accounting.periods.annual'), icon: 'lucide:calendar-clock' },
]

const periodOptions = [
  { value: 'daily', label: t('accounting.periods.daily') },
  { value: 'weekly', label: t('accounting.periods.weekly') },
  { value: 'monthly', label: t('accounting.periods.monthly') },
  { value: 'annual', label: t('accounting.periods.annual') },
]

const accountTypes = [
  { value: 'asset', label: t('accounting.types.asset') },
  { value: 'liability', label: t('accounting.types.liability') },
  { value: 'equity', label: t('accounting.types.equity') },
  { value: 'revenue', label: t('accounting.types.revenue') },
  { value: 'expense', label: t('accounting.types.expense') },
]

const typeBadgeClass = (type: string) => {
  const map: Record<string, string> = {
    asset: '!bg-blue-50 dark:!bg-blue-900/10 !text-blue-700 dark:!text-blue-400 !border-blue-200',
    liability: '!bg-orange-50 dark:!bg-orange-900/10 !text-orange-700 dark:!text-orange-400 !border-orange-200',
    equity: '!bg-purple-50 dark:!bg-purple-900/10 !text-purple-700 dark:!text-purple-400 !border-purple-200',
    revenue: '!bg-emerald-50 dark:!bg-emerald-900/10 !text-emerald-700 dark:!text-emerald-400 !border-emerald-200',
    expense: '!bg-red-50 dark:!bg-red-900/10 !text-red-700 dark:!text-red-400 !border-red-200',
  }
  return map[type] || ''
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    asset: t('accounting.types.asset'),
    liability: t('accounting.types.liability'),
    equity: t('accounting.types.equity'),
    revenue: t('accounting.types.revenue'),
    expense: t('accounting.types.expense'),
  }
  return map[type] || type
}

// ─── Chart of Accounts ───
const accounts = ref<any[]>([])
const accountsLoading = ref(false)

async function fetchAccounts() {
  accountsLoading.value = true
  try {
    const res = await apiFetch<any>('/api/accounting/accounts')
    if (res.success) accounts.value = res.data
  } catch { /* */ } finally {
    accountsLoading.value = false
  }
}

// ─── Account Dialog ───
const accountDialog = ref(false)
const savingAccount = ref(false)
const editingAccount = ref<any>(null)
const accountForm = ref({ code: '', name: '', type: '', description: '' })

function openAccountDialog() {
  editingAccount.value = null
  accountForm.value = { code: '', name: '', type: '', description: '' }
  accountDialog.value = true
}

function editAccount(account: any) {
  editingAccount.value = account
  accountForm.value = {
    code: account.code,
    name: account.name,
    type: account.type,
    description: account.description || '',
  }
  accountDialog.value = true
}

async function saveAccount() {
  if (!accountForm.value.code || !accountForm.value.name || !accountForm.value.type) {
    $toast.error(t('accounting.fillRequired'))
    return
  }
  savingAccount.value = true
  try {
    const url = editingAccount.value
      ? `/api/accounting/accounts/${editingAccount.value.id}`
      : '/api/accounting/accounts'
    const method = editingAccount.value ? 'PUT' : 'POST'
    const res = await apiFetch<any>(url, {
      method,
      body: { ...accountForm.value },
    })
    if (res.success) {
      $toast.success(editingAccount.value ? t('accounting.accountUpdated') : t('accounting.accountCreated'))
      accountDialog.value = false
      await fetchAccounts()
    }
  } catch { $toast.error(t('accounting.saveError')) } finally {
    savingAccount.value = false
  }
}

async function seedAccounts() {
  try {
    const res = await apiFetch<any>('/api/accounting/seed', { method: 'POST' })
    if (res.success) {
      $toast.success(t('accounting.seeded'))
      await fetchAccounts()
    }
  } catch { $toast.error(t('accounting.seedError')) }
}

// ─── Journal Entries ───
const journalEntries = ref<any[]>([])
const journalLoading = ref(false)
const journalFilter = ref({ period: 'monthly', start_date: '', end_date: '' })

async function fetchJournalEntries() {
  journalLoading.value = true
  try {
    const params = new URLSearchParams()
    if (journalFilter.value.start_date) params.set('start_date', journalFilter.value.start_date)
    if (journalFilter.value.end_date) params.set('end_date', journalFilter.value.end_date)
    const res = await apiFetch<any>(`/api/accounting/journal-entries?${params}`)
    if (res.success) journalEntries.value = res.data
  } catch { /* */ } finally {
    journalLoading.value = false
  }
}

// ─── Journal Dialog ───
const journalDialog = ref(false)
const savingJournal = ref(false)
const journalForm = ref({
  entry_date: new Date().toISOString().split('T')[0],
  description: '',
  reference: '',
  reference_type: '',
  lines: [] as { account_id: string; debit: number; credit: number; description: string }[],
})

const accountOptions = computed(() =>
  accounts.value.map((a: any) => ({ label: `${a.code} - ${a.name}`, id: a.id }))
)

const journalBalance = computed(() => {
  return journalForm.value.lines.reduce((sum, l) => sum + (Number(l.debit) - Number(l.credit)), 0)
})

function openJournalDialog() {
  journalForm.value = {
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    reference_type: '',
    lines: [
      { account_id: '', debit: 0, credit: 0, description: '' },
      { account_id: '', debit: 0, credit: 0, description: '' },
    ],
  }
  journalDialog.value = true
}

function addJournalLine() {
  journalForm.value.lines.push({ account_id: '', debit: 0, credit: 0, description: '' })
}

function removeJournalLine(idx: number) {
  if (journalForm.value.lines.length > 2) {
    journalForm.value.lines.splice(idx, 1)
  }
}

async function saveJournalEntry() {
  if (!journalForm.value.description || journalForm.value.lines.length < 2) {
    $toast.error(t('accounting.fillJournalRequired'))
    return
  }
  if (Math.abs(journalBalance.value) > 0.001) {
    $toast.error(t('accounting.balanceError'))
    return
  }
  savingJournal.value = true
  try {
    const res = await apiFetch<any>('/api/accounting/journal-entries', {
      method: 'POST',
      body: {
        entry_date: journalForm.value.entry_date,
        description: journalForm.value.description,
        reference: journalForm.value.reference || null,
        reference_type: journalForm.value.reference_type || null,
        lines: journalForm.value.lines.map((l) => ({
          account_id: l.account_id,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description || null,
        })),
      },
    })
    if (res.success) {
      $toast.success(t('accounting.journalCreated'))
      journalDialog.value = false
      await fetchJournalEntries()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('accounting.saveJournalError'))
  } finally {
    savingJournal.value = false
  }
}

// ─── View Journal Entry ───
const viewJournalDialog = ref(false)
const viewingEntry = ref<any>(null)

async function viewJournalEntry(entry: any) {
  try {
    const res = await apiFetch<any>(`/api/accounting/journal-entries/${entry.id}`)
    if (res.success) {
      viewingEntry.value = res.data
      viewJournalDialog.value = true
    }
  } catch { $toast.error(t('accounting.fetchError')) }
}

// ─── Reports ───
const reportData = ref<any>(null)

async function fetchReport(period: string) {
  activeReport.value = period
  try {
    const res = await apiFetch<any>(`/api/accounting/reports/period?period=${period}`)
    if (res.success) reportData.value = res.data
  } catch { $toast.error(t('accounting.reportError')) }
}

onMounted(() => {
  fetchAccounts()
  fetchJournalEntries()
})
</script>
