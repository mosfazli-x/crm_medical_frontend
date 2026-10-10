<template>
  <div class="dash-app relative">
    <UiPageContainer class="relative! max-w-7xl! mx-auto!">
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('cashbook.title') }}</h1>
          <p class="dash-head__date">{{ t('cashbook.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <v-menu v-if="canEdit">
            <template #activator="{ props: menuProps }">
              <button class="asa-btn asa-btn--ghost" :disabled="exporting" v-bind="menuProps">
                <v-icon size="17">{{ exporting ? 'mdi-loading' : 'mdi-download-outline' }}</v-icon>
                <span class="hidden sm:!inline">{{ t('cashbook.export') }}</span>
              </button>
            </template>
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-file-excel-outline" :title="t('cashbook.exportExcel')"
                @click="runExport('xlsx')" />
              <v-list-item prepend-icon="mdi-file-delimited-outline" :title="t('cashbook.exportCsv')"
                @click="runExport('csv')" />
            </v-list>
          </v-menu>
          <button class="asa-btn asa-btn--ghost" @click="openAccess()">
            <v-icon size="17">mdi-account-key-outline</v-icon>
            <span>{{ t('cashbook.manageAccess') }}</span>
          </button>
          <button v-if="!isReadOnly" class="asa-btn asa-btn--primary" @click="openEntry()">
            <v-icon size="17">mdi-plus</v-icon>
            <span>{{ t('cashbook.addEntry') }}</span>
          </button>
        </div>
      </header>

      <div v-if="isReadOnly" class="asa-alert asa-alert--amber mt-4!" role="status">
        <div class="asa-alert__body">
          <p class="asa-alert__title">{{ t('cashbook.readOnlyTitle') }}</p>
          <p class="asa-alert__desc">{{ t('cashbook.sharedReadOnlyDesc') }}</p>
        </div>
      </div>

      <div v-if="loading && !summary" class="mt-5 space-y-4" aria-busy="true">
        <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div v-for="n in 4" :key="`cb-metric-${n}`" class="asa-skel h-28 rounded-[22px]" />
        </div>
        <div class="asa-skel h-72 rounded-[22px]" />
      </div>

      <div v-else-if="!canView" class="asa-alert asa-alert--amber mt-5!" role="status">
        <div class="asa-alert__body">
          <p class="asa-alert__title">{{ t('cashbook.accessDenied') }}</p>
          <p class="asa-alert__desc">{{ t('cashbook.accessDeniedDesc') }}</p>
        </div>
        <NuxtLink to="/dashboard" class="asa-btn asa-btn--amber solid shrink-0!">{{ t('cashbook.backToDashboard') }}
        </NuxtLink>
      </div>

      <template v-else>
        <div v-if="loadError" class="asa-alert asa-alert--rose mt-4!" role="alert">
          <div class="asa-alert__body">
            <p class="asa-alert__title">{{ t('cashbook.loadError') }}</p>
          </div>
        </div>

        <section class="asa-card cb-bar" :aria-label="t('cashbook.controls')">
          <CashbookLedgerScope v-model="ownerId" :ledgers="ledgers" :selectable="hasSharedLedgers" :self-name="selfName"
            :self-id="selfId" />
          <CashbookPeriodPicker :model-value="period" :months="monthOptions" :label="monthLabel"
            :range-from="range.from" :range-to="range.to" :mode="rangeMode" :custom-from="customFrom"
            :custom-to="customTo" :presets="rangePresets" @update:model-value="setPeriod"
            @update:mode="setRangeMode" @update:custom="applyCustomRange" @shift="shiftMonth" @today="goToday" />
          <button class="cb-bar__refresh" :class="{ 'is-spinning': loading }" :aria-label="t('common.refresh')"
            :title="t('common.refresh')" :disabled="loading" @click="refresh">
            <v-icon size="18">mdi-refresh</v-icon>
          </button>
        </section>

        <section class="asa-sec mt-6">
          <p class="asa-sec__label">{{ t('cashbook.overview') }} · {{ monthLabel }}</p>
          <div class="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
            <article class="asa-card cb-metric">
              <div class="cb-metric__head">
                <span class="asa-tint asa-tint--teal"><v-icon size="19">mdi-arrow-down-left</v-icon></span>
                <span class="cb-delta" :class="deltaClass(deltas.income)">
                  <v-icon size="13">{{ deltaIcon(deltas.income) }}</v-icon>{{ pctText(deltas.income) }}
                </span>
              </div>
              <div class="cb-metric__copy">
                <p class="cb-metric__value asa-green" dir="ltr">{{ formatRial(summary?.totals.incomeRial) }}</p>
                <p class="cb-metric__label">{{ t('cashbook.income') }}</p>
              </div>
              <div class="cb-metric__spark"><CashbookSparkline :values="incomeSpark" tone="income" /></div>
            </article>
            <article class="asa-card cb-metric">
              <div class="cb-metric__head">
                <span class="asa-tint asa-tint--rose"><v-icon size="19">mdi-arrow-up-right</v-icon></span>
                <span class="cb-delta" :class="deltaClass(deltas.expense, true)">
                  <v-icon size="13">{{ deltaIcon(deltas.expense) }}</v-icon>{{ pctText(deltas.expense) }}
                </span>
              </div>
              <div class="cb-metric__copy">
                <p class="cb-metric__value text-rose-500! dark:!text-rose-400!" dir="ltr">{{
                  formatRial(summary?.totals.expenseRial) }}</p>
                <p class="cb-metric__label">{{ t('cashbook.expense') }}</p>
              </div>
              <div class="cb-metric__spark"><CashbookSparkline :values="expenseSpark" tone="expense" /></div>
            </article>
            <article class="asa-card cb-metric">
              <div class="cb-metric__head">
                <span class="asa-tint" :class="isNetPositive ? 'asa-tint--green' : 'asa-tint--rose'"><v-icon
                    size="19">mdi-swap-vertical</v-icon></span>
                <span class="cb-delta" :class="deltaClass(deltas.net)">
                  <v-icon size="13">{{ deltaIcon(deltas.net) }}</v-icon>{{ pctText(deltas.net) }}
                </span>
              </div>
              <div class="cb-metric__copy">
                <p class="cb-metric__value" :class="isNetPositive ? 'asa-green' : 'text-rose-500!'" dir="ltr">{{
                  formatRial(summary?.totals.netRial) }}</p>
                <p class="cb-metric__label">{{ t('cashbook.net') }}</p>
              </div>
              <div class="cb-metric__spark"><CashbookSparkline :values="netSpark" tone="net" /></div>
            </article>
            <article class="asa-card cb-metric">
              <div class="cb-metric__head">
                <span class="asa-tint asa-tint--orange"><v-icon size="19">mdi-calendar-check-outline</v-icon></span>
                <span class="cb-delta" :class="deltaClass(deltas.entryCount)">
                  <v-icon size="13">{{ deltaIcon(deltas.entryCount) }}</v-icon>{{ pctText(deltas.entryCount) }}
                </span>
              </div>
              <div class="cb-metric__copy">
                <p class="cb-metric__value" dir="ltr">{{ formatNumber(summary?.totals.entryCount || 0) }}</p>
                <p class="cb-metric__label">{{ t('cashbook.entriesCount') }}</p>
              </div>
              <div class="cb-metric__spark"><CashbookSparkline :values="netSpark" tone="neutral" /></div>
            </article>
          </div>
        </section>

        <section class="asa-sec mt-6">
          <div class="cb-sec-head">
            <div>
              <h2 class="asa-card-title">{{ t('cashbook.comparison') }}</h2>
              <p class="asa-card-sub">{{ t('cashbook.comparisonDesc') }}</p>
            </div>
            <div class="cb-seg" role="tablist" :aria-label="t('cashbook.comparison')">
              <button type="button" role="tab" :aria-selected="comparisonCount === 6"
                :class="{ 'is-on': comparisonCount === 6 }" @click="comparisonCount = 6">{{ t('cashbook.last6')
                }}</button>
              <button type="button" role="tab" :aria-selected="comparisonCount === 12"
                :class="{ 'is-on': comparisonCount === 12 }" @click="comparisonCount = 12">{{ t('cashbook.last12')
                }}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-3">
            <article class="asa-card lg:col-span-2" :aria-busy="analyticsLoading">
              <div class="cb-section-head">
                <div>
                  <p class="cb-card-title">{{ t('cashbook.monthlyTrend') }}</p>
                  <p class="cb-card-sub">{{ t('cashbook.vsPrevious') }}: <span dir="ltr">{{
                    formatRial(previousTotals?.netRial) }}</span></p>
                </div>
              </div>
              <CashbookMonthlyBars v-if="comparisonSeries.length" :series="comparisonSeries" :format="formatRial"
                :chart-label="t('cashbook.monthlyTrend')" />
              <UiEmptyState v-else :title="t('cashbook.noFlow')" :description="t('cashbook.noFlowDesc')" class="py-8!">
                <template #icon><v-icon size="34">mdi-chart-bar</v-icon></template>
              </UiEmptyState>
            </article>

            <article class="asa-card">
              <div class="cb-section-head">
                <div>
                  <p class="cb-card-title">{{ t('cashbook.categorySplit') }}</p>
                  <p class="cb-card-sub">{{ t('cashbook.categorySplitDesc') }}</p>
                </div>
              </div>
              <div class="cb-tabs">
                <button :class="{ 'cb-tabs__btn--on': categoryTab === 'expense' }" @click="categoryTab = 'expense'">{{
                  t('cashbook.expense') }}</button>
                <button :class="{ 'cb-tabs__btn--on': categoryTab === 'income' }" @click="categoryTab = 'income'">{{
                  t('cashbook.income') }}</button>
              </div>
              <CashbookDonutChart v-if="donutSlices.length" :slices="donutSlices" :format="formatRial"
                :chart-label="t('cashbook.categorySplit')" />
              <UiEmptyState v-else :title="t('cashbook.noCategories')" :description="t('cashbook.noCategoriesDesc')"
                class="py-7!">
                <template #icon><v-icon size="34">mdi-chart-donut</v-icon></template>
              </UiEmptyState>
            </article>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-5">
          <article class="asa-card lg:col-span-2">
            <div class="cb-section-head">
              <div>
                <h2 class="asa-card-title">{{ t('cashbook.cashFlow') }}</h2>
                <p class="asa-card-sub">{{ t('cashbook.cashFlowDesc') }}</p>
              </div>
            </div>
            <CashbookTrendChart v-if="dayRows.length" :points="dayRows" :format="formatRial" :label-for="dayLabel"
              :chart-label="t('cashbook.cashFlow')" />
            <UiEmptyState v-else :title="t('cashbook.noFlow')" :description="t('cashbook.noFlowDesc')" class="py-8!">
              <template #icon><v-icon size="34">mdi-chart-bar</v-icon></template>
            </UiEmptyState>
          </article>

          <article class="asa-card">
            <div class="cb-section-head">
              <div>
                <h2 class="asa-card-title">{{ t('cashbook.weekdayTitle') }}</h2>
                <p class="asa-card-sub">{{ t('cashbook.weekdayDesc') }}</p>
              </div>
            </div>
            <CashbookWeekdayBars v-if="weekdaySeries.length" :series="weekdaySeries" :labels="weekdayLabels"
              :format="formatRial" :chart-label="t('cashbook.weekdayTitle')" />
            <UiEmptyState v-else :title="t('cashbook.noFlow')" :description="t('cashbook.noFlowDesc')" class="py-8!">
              <template #icon><v-icon size="34">mdi-calendar-week</v-icon></template>
            </UiEmptyState>
          </article>
        </section>

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-5">

          <article class="asa-card">
            <div class="cb-section-head">
              <div>
                <h2 class="asa-card-title">{{ t('cashbook.accounts') }}</h2>
                <p class="asa-card-sub">{{ t('cashbook.accountsDesc') }}</p>
              </div>
              <button v-if="!isReadOnly" class="sc-icon-btn" :aria-label="t('cashbook.addAccount')"
                @click="openAccount()"><v-icon size="17">mdi-plus</v-icon></button>
            </div>
            <div v-if="accountRows.length" class="cb-account-list">
              <div v-for="account in accountRows" :key="account.id" class="cb-account-row"
                :class="{ 'cb-row--voided': account.isArchived }">
                <div class="cb-account-row__main">
                  <p class="cb-account-row__name">{{ account.name }} <span v-if="account.isArchived"
                      class="asa-pill asa-pill--rose ml-1!">{{ t('cashbook.archived') }}</span></p>
                  <p class="cb-account-row__type">{{ t(`cashbook.accountType.${account.type}`) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <p class="cb-account-row__balance" :class="BigInt(account.balanceRial) < 0n ? 'text-rose-500!' : ''"
                    dir="ltr">
                    {{ formatRial(account.balanceRial) }}</p>
                  <button v-if="!isReadOnly" class="sc-icon-btn" :aria-label="t('cashbook.editAccount')"
                    @click="openAccount(account)"><v-icon size="15">mdi-pencil-outline</v-icon></button>
                </div>
              </div>
            </div>
            <UiEmptyState v-else :title="t('cashbook.noAccounts')" :description="t('cashbook.noAccountsDesc')"
              class="py-7!">
              <template #icon><v-icon size="34">mdi-wallet-outline</v-icon></template>
            </UiEmptyState>
          </article>

          <article class="asa-card">
            <div class="cb-section-head">
              <div>
                <h2 class="asa-card-title">{{ t('cashbook.categories') }}</h2>
                <p class="asa-card-sub">{{ t('cashbook.categoriesDesc') }}</p>
              </div>
              <button v-if="!isReadOnly" class="sc-icon-btn" :aria-label="t('cashbook.addCategory')"
                @click="openCategory()"><v-icon size="17">mdi-plus</v-icon></button>
            </div>
            <div class="cb-tabs">
              <button :class="{ 'cb-tabs__btn--on': categoryTab === 'income' }" @click="categoryTab = 'income'">{{
                t('cashbook.income') }}</button>
              <button :class="{ 'cb-tabs__btn--on': categoryTab === 'expense' }" @click="categoryTab = 'expense'">{{
                t('cashbook.expense') }}</button>
            </div>
            <div v-if="categoryRows.length" class="mt-3">
              <div v-for="row in categoryRows" :key="row.categoryId" class="cb-category-row"
                :class="{ 'cb-row--voided': row.isArchived }">
                <span class="cb-category-row__dot" :style="dotStyle(row.color)" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-3">
                    <p class="cb-category-row__name">{{ row.categoryName }} <span v-if="row.isArchived"
                        class="asa-pill asa-pill--rose ml-1!">{{ t('cashbook.archived') }}</span></p>
                    <div class="flex items-center gap-2">
                      <p class="cb-category-row__amount" dir="ltr">{{ formatRial(row.amountRial) }}</p>
                      <button v-if="!isReadOnly" class="sc-icon-btn" :aria-label="t('cashbook.editCategory')"
                        @click="openCategory(categories.find((category) => category.id === row.categoryId))"><v-icon
                          size="15">mdi-pencil-outline</v-icon></button>
                    </div>
                  </div>
                  <div class="cb-progress mt-1"><span :style="{ width: categoryPercent(row.amountRial) + '%' }" /></div>
                </div>
              </div>
            </div>
            <UiEmptyState v-else :title="t('cashbook.noCategories')" :description="t('cashbook.noCategoriesDesc')"
              class="py-7!">
              <template #icon><v-icon size="34">mdi-shape-outline</v-icon></template>
            </UiEmptyState>
          </article>

          <article class="asa-card">
            <div class="cb-section-head">
              <div>
                <h2 class="asa-card-title">{{ t('cashbook.budgets') }}</h2>
                <p class="asa-card-sub">{{ t('cashbook.budgetsDesc') }}</p>
              </div>
              <button v-if="!isReadOnly" class="sc-icon-btn" :aria-label="t('cashbook.addBudget')"
                @click="openBudget()"><v-icon size="17">mdi-plus</v-icon></button>
            </div>
            <div v-if="budgetRows.length" class="mt-3">
              <div v-for="budget in budgetRows" :key="budget.id" class="cb-budget-row">
                <div class="flex items-center justify-between gap-3">
                  <p class="cb-budget-row__name">{{ budget.categoryName }}</p>
                  <button v-if="!isReadOnly" class="sc-icon-btn sc-icon-btn--danger"
                    :aria-label="t('cashbook.deleteBudget')" @click="removeBudget(budget.id)"><v-icon
                      size="15">mdi-trash-can-outline</v-icon></button>
                </div>
                <div class="cb-progress mt-2"><span :class="{ 'cb-progress__bar--over': budgetPercent(budget) >= 100 }"
                    :style="{ width: budgetPercent(budget) + '%' }" /></div>
                <div class="flex items-center justify-between gap-2 mt-1">
                  <span class="cb-budget-row__spent" dir="ltr">{{ formatRial(budget.spentRial) }} / {{
                    formatRial(budget.amountRial) }}</span>
                  <span class="cb-budget-row__remaining"
                    :class="BigInt(budget.remainingRial) < 0n ? 'text-rose-500!' : ''" dir="ltr">{{
                      formatRial(budget.remainingRial) }}</span>
                </div>
              </div>
            </div>
            <UiEmptyState v-else :title="t('cashbook.noBudgets')" :description="t('cashbook.noBudgetsDesc')"
              class="py-7!">
              <template #icon><v-icon size="34">mdi-chart-donut</v-icon></template>
            </UiEmptyState>
          </article>
        </section>

        <section class="asa-card mt-5 overflow-hidden!">
          <div class="cb-section-head px-4 pt-4 sm:px-5 sm:pt-5">
            <div>
              <h2 class="asa-card-title">{{ t('cashbook.entries') }}</h2>
              <p class="asa-card-sub">{{ t('cashbook.entriesDesc') }}</p>
            </div>
            <span class="asa-pill asa-pill--teal">{{ formatNumber(pagination.total) }}</span>
          </div>
          <div class="cb-filters px-4 sm:px-5">
            <v-text-field v-model="filters.search" :placeholder="t('cashbook.search')" prepend-inner-icon="mdi-magnify"
              variant="solo" density="compact" hide-details="auto" @keyup.enter="applyFilters" />
            <v-select v-model="filters.kind" :items="kindFilterOptions" item-title="title" item-value="value"
              variant="solo" density="compact" hide-details="auto" :aria-label="t('cashbook.type')" />
            <v-select v-model="filters.status" :items="statusFilterOptions" item-title="title" item-value="value"
              variant="solo" density="compact" hide-details="auto" :aria-label="t('cashbook.status')" />
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="applyFilters"><v-icon
                size="15">mdi-filter-outline</v-icon>{{ t('cashbook.apply') }}</button>
          </div>

          <div v-if="entries.length" class="cb-table-wrap">
            <table class="cb-table">
              <thead>
                <tr>
                  <th>{{ t('cashbook.date') }}</th>
                  <th>{{ t('cashbook.description') }}</th>
                  <th>{{ t('cashbook.category') }}</th>
                  <th>{{ t('cashbook.account') }}</th>
                  <th class="text-left">{{ t('cashbook.amount') }}</th>
                  <th>{{ t('cashbook.status') }}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in entries" :key="entry.id" :class="{ 'cb-row--voided': entry.status === 'voided' }">
                  <td class="cb-date" dir="ltr">{{ formatDate(entry.entryDate) }}</td>
                  <td>
                    <p class="cb-entry-title">{{ entry.description }}</p>
                    <p v-if="entry.notes || entry.reference" class="cb-entry-meta">{{ entry.reference || entry.notes }}
                    </p>
                  </td>
                  <td><span class="cb-tag" :style="tagStyle(entry.categoryColor, entry.kind)">{{ entry.categoryName
                      }}</span>
                  </td>
                  <td class="cb-muted">{{ entry.accountName }}</td>
                  <td class="cb-amount" :class="entry.kind === 'income' ? 'asa-green' : 'text-rose-500!'" dir="ltr">{{
                    entry.kind === 'income' ? '+' : '-' }}{{ formatRial(entry.amountRial) }}</td>
                  <td><span class="asa-pill"
                      :class="entry.status === 'active' ? 'asa-pill--green' : 'asa-pill--rose'">{{
                        t(`cashbook.entryStatus.${entry.status}`) }}</span></td>
                  <td>
                    <div class="flex justify-end gap-1">
                      <button v-if="entry.receipt" class="sc-icon-btn" :aria-label="t('cashbook.downloadReceipt')"
                        @click="openReceipt(entry)"><v-icon size="16">mdi-paperclip</v-icon></button>
                      <button v-else-if="!isReadOnly && entry.status === 'active'" class="sc-icon-btn"
                        :aria-label="t('cashbook.addReceipt')" @click="openReceipt(entry)"><v-icon
                          size="16">mdi-paperclip</v-icon></button>
                      <button v-if="!isReadOnly && entry.status === 'active'" class="sc-icon-btn"
                        :aria-label="t('cashbook.editEntry')" @click="openEntry(entry)"><v-icon
                          size="16">mdi-pencil-outline</v-icon></button>
                      <button v-if="!isReadOnly && entry.status === 'active'" class="sc-icon-btn sc-icon-btn--danger"
                        :aria-label="t('cashbook.voidEntry')" @click="openVoid(entry)"><v-icon
                          size="16">mdi-close-circle-outline</v-icon></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <UiEmptyState v-else :title="t('cashbook.noEntries')" :description="t('cashbook.noEntriesDesc')"
            class="py-10!">
            <template #icon><v-icon size="36">mdi-notebook-outline</v-icon></template>
            <template #action>
              <button v-if="!isReadOnly" class="asa-btn asa-btn--primary asa-btn--sm" @click="openEntry()">{{
                t('cashbook.addEntry') }}</button>
            </template>
          </UiEmptyState>
          <div v-if="pagination.totalPages > 1" class="cb-pagination">
            <button class="sc-icon-btn" :disabled="page <= 1" :aria-label="t('cashbook.previousPage')"
              @click="changePage(page - 1)"><v-icon size="17">mdi-chevron-right</v-icon></button>
            <span>{{ t('cashbook.page') }} {{ formatNumber(page) }} / {{ formatNumber(pagination.totalPages) }}</span>
            <button class="sc-icon-btn" :disabled="page >= pagination.totalPages" :aria-label="t('cashbook.nextPage')"
              @click="changePage(page + 1)"><v-icon size="17">mdi-chevron-left</v-icon></button>
          </div>
        </section>
      </template>

      <v-dialog v-model="entryDialog" max-width="680" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ editingEntry ? t('cashbook.editEntry') : t('cashbook.addEntry') }}</h2>
              <span class="asa-dialog__sub">{{ t('cashbook.entrySubtitle') }}</span>
            </div>
            <button class="sc-x" :aria-label="t('common.close')" @click="entryDialog = false"><v-icon
                size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="cb-form-grid">
              <div><span class="asa-field-label">{{ t('cashbook.type') }}</span><v-select v-model="entryForm.kind"
                  :items="kindOptions" item-title="title" item-value="value" variant="solo" density="comfortable"
                  hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.date') }}</span>
                <PersianDatetimePicker v-model="entryForm.entryDate" type="date" format="YYYY-MM-DD"
                  display-format="jYYYY/jMM/jDD" color="#5f8feb" auto-submit clearable custom-input
                  :placeholder="t('cashbook.datePlaceholder')" class="cb-date-picker" input-class="cb-date-input" />
              </div>
              <div><span class="asa-field-label">{{ t('cashbook.amountToman') }}</span><v-text-field
                  v-model="entryForm.amountToman" type="number" min="0.1" step="0.1" variant="solo"
                  density="comfortable" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.account') }}</span><v-select
                  v-model="entryForm.accountId" :items="activeAccounts" item-title="name" item-value="id" variant="solo"
                  density="comfortable" hide-details="auto" /></div>
              <div class="cb-form-grid__wide"><span class="asa-field-label">{{ t('cashbook.category') }}</span><v-select
                  v-model="entryForm.categoryId" :items="entryCategories" item-title="name" item-value="id"
                  variant="solo" density="comfortable" hide-details="auto" /></div>
              <div class="cb-form-grid__wide"><span class="asa-field-label">{{ t('cashbook.description')
                  }}</span><v-text-field v-model="entryForm.description"
                  :placeholder="t('cashbook.descriptionPlaceholder')" variant="solo" density="comfortable"
                  hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.reference') }}</span><v-text-field
                  v-model="entryForm.reference" variant="solo" density="comfortable" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.notes') }}</span><v-text-field v-model="entryForm.notes"
                  variant="solo" density="comfortable" hide-details="auto" /></div>
            </div>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="entryDialog = false">{{ t('common.cancel')
              }}</button>
            <v-spacer />
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !entryValid"
              @click="submitEntry"><v-progress-circular v-if="saving" indeterminate size="16" width="2"
                color="#fff" /><template v-else><v-icon size="15">mdi-check</v-icon>{{ t('common.save')
                }}</template></button>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="categoryDialog" max-width="480" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ editingCategory ? t('cashbook.editCategory') : t('cashbook.addCategory')
                }}
              </h2><span class="asa-dialog__sub">{{ t('cashbook.categorySubtitle') }}</span>
            </div><button class="sc-x" @click="categoryDialog = false"><v-icon size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="cb-form-grid">
              <div class="cb-form-grid__wide"><span class="asa-field-label">{{ t('cashbook.name') }}</span><v-text-field
                  v-model="categoryForm.name" variant="solo" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.type') }}</span><v-select v-model="categoryForm.kind"
                  :items="kindOptions" item-title="title" item-value="value" variant="solo" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.color') }}</span><v-text-field
                  v-model="categoryForm.color" type="color" variant="solo" hide-details="auto" /></div>
              <div v-if="editingCategory" class="cb-form-grid__wide"><v-switch v-model="categoryForm.isArchived"
                  :label="t('cashbook.archived')" color="primary" hide-details inset /></div>
            </div>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot"><button class="asa-btn asa-btn--ghost asa-btn--sm"
              @click="categoryDialog = false">{{ t('common.cancel') }}</button><v-spacer /><button
              class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !categoryForm.name"
              @click="submitCategory"><v-icon size="15">mdi-check</v-icon>{{ t('common.save')
              }}</button></v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="accountDialog" max-width="480" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ editingAccount ? t('cashbook.editAccount') : t('cashbook.addAccount') }}
              </h2>
              <span class="asa-dialog__sub">{{ t('cashbook.accountSubtitle') }}</span>
            </div><button class="sc-x" @click="accountDialog = false"><v-icon size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="cb-form-grid">
              <div class="cb-form-grid__wide"><span class="asa-field-label">{{ t('cashbook.name') }}</span><v-text-field
                  v-model="accountForm.name" variant="solo" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.accountTypeLabel') }}</span><v-select
                  v-model="accountForm.type" :items="accountTypeOptions" item-title="title" item-value="value"
                  variant="solo" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.openingBalance') }}</span><v-text-field
                  v-model="accountForm.openingToman" type="number" min="0" step="0.1" variant="solo"
                  hide-details="auto" />
              </div>
              <div v-if="editingAccount" class="cb-form-grid__wide"><v-switch v-model="accountForm.isArchived"
                  :label="t('cashbook.archived')" color="primary" hide-details inset /></div>
            </div>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot"><button class="asa-btn asa-btn--ghost asa-btn--sm"
              @click="accountDialog = false">{{ t('common.cancel') }}</button><v-spacer /><button
              class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || !accountForm.name"
              @click="submitAccount"><v-icon size="15">mdi-check</v-icon>{{ t('common.save')
              }}</button></v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="budgetDialog" max-width="480" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ t('cashbook.addBudget') }}</h2><span class="asa-dialog__sub">{{
                t('cashbook.budgetSubtitle') }}</span>
            </div><button class="sc-x" @click="budgetDialog = false"><v-icon size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="cb-form-grid">
              <div class="cb-form-grid__wide"><span class="asa-field-label">{{ t('cashbook.category') }}</span><v-select
                  v-model="budgetForm.categoryId" :items="expenseCategories" item-title="name" item-value="id"
                  variant="solo" hide-details="auto" /></div>
              <div><span class="asa-field-label">{{ t('cashbook.budgetAmount') }}</span><v-text-field
                  v-model="budgetForm.amountToman" type="number" min="0.1" step="0.1" variant="solo"
                  hide-details="auto" />
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot"><button class="asa-btn asa-btn--ghost asa-btn--sm"
              @click="budgetDialog = false">{{ t('common.cancel') }}</button><v-spacer /><button
              class="asa-btn asa-btn--primary asa-btn--sm"
              :disabled="saving || !budgetForm.categoryId || !budgetForm.amountToman" @click="submitBudget"><v-icon
                size="15">mdi-check</v-icon>{{ t('common.save') }}</button></v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="voidDialog" max-width="440" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ t('cashbook.voidEntry') }}</h2><span class="asa-dialog__sub">{{
                voidEntryData?.description }}</span>
            </div><button class="sc-x" @click="voidDialog = false"><v-icon size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body"><span class="asa-field-label">{{ t('cashbook.voidReason')
              }}</span><v-textarea v-model="voidForm.reason" rows="3" variant="solo"
              hide-details="auto" /></v-card-text>
          <v-card-actions class="asa-dialog__foot"><button class="asa-btn asa-btn--ghost asa-btn--sm"
              @click="voidDialog = false">{{ t('common.cancel') }}</button><v-spacer /><button
              class="asa-btn asa-btn--rose asa-btn--sm" :disabled="saving || !voidForm.reason"
              @click="submitVoid"><v-icon size="15">mdi-close-circle-outline</v-icon>{{ t('cashbook.confirmVoid')
              }}</button></v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="receiptDialog" max-width="480" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ receiptEntry?.receipt ? t('cashbook.receiptInfo') :
                t('cashbook.addReceipt') }}
              </h2><span class="asa-dialog__sub">{{ receiptEntry?.description }}</span>
            </div><button class="sc-x" @click="receiptDialog = false"><v-icon size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div v-if="receiptEntry?.receipt" class="cb-receipt-info"><v-icon
                size="38">mdi-file-check-outline</v-icon><strong>{{ receiptEntry.receipt.originalName
                }}</strong><span>{{
                  receiptEntry.receipt.mimeType }} · {{ formatNumber(receiptEntry.receipt.fileSize) }} {{
                  t('cashbook.bytes')
                }}</span><button class="asa-btn asa-btn--primary asa-btn--sm mt-3"
                @click="downloadCurrentReceipt"><v-icon size="15">mdi-download</v-icon>{{ t('cashbook.downloadReceipt')
                }}</button></div><v-file-input v-else v-model="receiptFile" :label="t('cashbook.receiptFile')"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" variant="solo"
              prepend-icon="mdi-paperclip" show-size />
          </v-card-text>
          <v-card-actions v-if="!receiptEntry?.receipt" class="asa-dialog__foot"><button
              class="asa-btn asa-btn--ghost asa-btn--sm" @click="receiptDialog = false">{{ t('common.cancel')
              }}</button><v-spacer /><button class="asa-btn asa-btn--primary asa-btn--sm"
              :disabled="saving || !receiptFile" @click="submitReceipt"><v-icon size="15">mdi-upload</v-icon>{{
                t('cashbook.upload') }}</button></v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="accessDialog" max-width="560" persistent>
        <v-card class="asa-dialog overflow-hidden!" elevation="0">
          <div class="asa-dialog__head">
            <div>
              <h2 class="asa-dialog__title">{{ t('cashbook.manageAccess') }}</h2>
              <span class="asa-dialog__sub">{{ t('cashbook.manageAccessSubtitle') }}</span>
            </div><button class="sc-x" :aria-label="t('common.close')" @click="accessDialog = false"><v-icon
                size="18">mdi-close</v-icon></button>
          </div>
          <v-card-text class="asa-dialog__body">
            <div class="asa-alert asa-alert--amber mb-4!" role="note">
              <div class="asa-alert__body">
                <p class="asa-alert__desc">{{ t('cashbook.accessPrivacyNote') }}</p>
              </div>
            </div>

            <p class="asa-sec__label">{{ t('cashbook.sharedWith') }}</p>
            <ul v-if="grants.length" class="cb-access-list">
              <li v-for="grant in grants" :key="grant.id" class="cb-access-list__item">
                <span class="cb-access-list__avatar" aria-hidden="true">{{ initials(grant.granteeName) }}</span>
                <span class="cb-access-list__copy">
                  <span class="cb-access-list__name">{{ grant.granteeName || grant.granteeId }}</span>
                  <span class="cb-access-list__meta">{{ t(grant.granteeRole === 'admin_doctor' ? 'cashbook.roleManager' : 'cashbook.roleDoctor') }}</span>
                </span>
                <button class="sc-icon-btn sc-icon-btn--danger" :aria-label="t('cashbook.revokeAccess')"
                  :disabled="accessSaving" @click="confirmRevoke(grant)"><v-icon size="17">mdi-account-off-outline</v-icon></button>
              </li>
            </ul>
            <p v-else class="cb-access-empty">{{ t('cashbook.noSharedLedgers') }}</p>

            <template v-if="candidates.length">
              <p class="asa-sec__label mt-5!">{{ t('cashbook.shareWithSomeone') }}</p>
              <div class="cb-access-add">
                <v-select v-model="accessTarget" :items="candidateOptions" item-title="title" item-value="value"
                  variant="solo" hide-details="auto" :label="t('cashbook.pickUserToShare')" />
                <button class="asa-btn asa-btn--primary" :disabled="accessSaving || !accessTarget" @click="submitGrant">
                  <v-icon size="16">mdi-share-variant-outline</v-icon>{{ t('cashbook.grantAccess') }}</button>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="asa-dialog__foot"><v-spacer /><button class="asa-btn asa-btn--ghost asa-btn--sm"
              @click="accessDialog = false">{{ t('common.close') }}</button></v-card-actions>
        </v-card>
      </v-dialog>
    </UiPageContainer>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type { CashbookAccount, CashbookAccountType, CashbookCategory, CashbookEntry, CashbookKind, CashbookStatus } from '~/types/finance'
import type { CashbookMonthlyPoint } from '~/composables/useFinance'

const { t, locale } = useI18n()
const { user } = useAuth()
const { formatGregorianDate } = useFormatting()
const {
  canEdit, isReadOnly, hasSharedLedgers, period, monthOptions, monthLabel, ledgers, ownerId, grants, candidates,
  accessSaving, range, rangeMode, customFrom, customTo, setRangeMode, setCustomRange, rangePresets,
  summary, entries, categories, accounts, loading, loadError, page, pagination, filters,
  comparisonCount, comparisonSeries, weekdaySeries, previousTotals, deltas, analyticsLoading,
  refresh, applyFilters, changePage, shiftMonth, setPeriod, goToday, saveEntry, updateEntry, voidEntry, saveCategory, updateCategory,
  saveAccount, updateAccount, saveBudget, deleteBudget, uploadReceipt, downloadReceipt, exportData,
  loadAccess, grantAccess, revokeAccess,
} = useFinance()
const { $toast } = useNuxtApp()

const canView = computed(() => !!user.value && ['admin_doctor', 'doctor'].includes(user.value.role))
const selfName = computed(() => user.value?.fullName || '')
const selfId = computed(() => user.value?.id || '')
const exporting = ref(false)
const saving = ref(false)
const categoryTab = ref<CashbookKind>('expense')
const entryDialog = ref(false)
const categoryDialog = ref(false)
const accountDialog = ref(false)
const budgetDialog = ref(false)
const voidDialog = ref(false)
const receiptDialog = ref(false)
const accessDialog = ref(false)
const accessTarget = ref<string | null>(null)
const editingEntry = ref<CashbookEntry | null>(null)
const editingCategory = ref<CashbookCategory | null>(null)
const editingAccount = ref<CashbookAccount | null>(null)
const voidEntryData = ref<CashbookEntry | null>(null)
const receiptEntry = ref<CashbookEntry | null>(null)
const receiptFile = ref<File | File[] | null>(null)

const entryForm = reactive({ entryDate: moment().format('YYYY-MM-DD'), kind: 'expense' as CashbookKind, amountToman: '', categoryId: '', accountId: '', description: '', reference: '', notes: '' })
const categoryForm = reactive({ name: '', kind: 'expense' as CashbookKind, color: '#3ddc84', isArchived: false })
const accountForm = reactive({ name: '', type: 'cash' as CashbookAccountType, openingToman: '0', isArchived: false })
const budgetForm = reactive({ categoryId: '', amountToman: '' })
const voidForm = reactive({ reason: '' })

const isFa = computed(() => locale.value === 'fa')
const isNetPositive = computed(() => {
  try { return BigInt(summary.value?.totals.netRial || '0') >= 0n } catch { return true }
})
const dayRows = computed(() => summary.value?.byDay || [])
const categoryRows = computed(() => {
  const amounts = new Map(
    (summary.value?.byCategory || [])
      .filter((row) => row.kind === categoryTab.value)
      .map((row) => [row.categoryId, row.amountRial]),
  )
  return categories.value
    .filter((category) => category.kind === categoryTab.value)
    .map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      kind: category.kind,
      color: category.color,
      amountRial: amounts.get(category.id) || '0',
      isArchived: category.isArchived,
    }))
})
const accountRows = computed(() => {
  const balances = new Map((summary.value?.accounts || []).map((account) => [account.id, account.balanceRial]))
  return accounts.value.map((account) => ({
    ...account,
    balanceRial: balances.get(account.id) || account.openingBalanceRial,
  }))
})
const budgetRows = computed(() => summary.value?.budgets || [])
const maxCategory = computed(() => Math.max(0, ...categoryRows.value.map((row) => Number(row.amountRial))))
const activeAccounts = computed(() => accounts.value.filter((item) => !item.isArchived))
const entryCategories = computed(() => categories.value.filter((item) => !item.isArchived && item.kind === entryForm.kind))
const expenseCategories = computed(() => categories.value.filter((item) => !item.isArchived && item.kind === 'expense'))
const entryValid = computed(() => !!entryForm.entryDate && !!entryForm.kind && toRial(entryForm.amountToman) !== '0' && !!entryForm.categoryId && !!entryForm.accountId && !!entryForm.description.trim())
const kindOptions = computed(() => [{ title: t('cashbook.income'), value: 'income' as CashbookKind }, { title: t('cashbook.expense'), value: 'expense' as CashbookKind }])
const accountTypeOptions = computed(() => ['cash', 'bank', 'card', 'other'].map((value) => ({ title: t(`cashbook.accountType.${value}`), value: value as CashbookAccountType })))
const kindFilterOptions = computed(() => [{ title: t('cashbook.allTypes'), value: '' }, ...kindOptions.value])
const statusFilterOptions = computed(() => [{ title: t('cashbook.allStatuses'), value: '' }, { title: t('cashbook.entryStatus.active'), value: 'active' as CashbookStatus }, { title: t('cashbook.entryStatus.voided'), value: 'voided' as CashbookStatus }])
watch(() => entryForm.kind, () => {
  if (entryForm.categoryId && !entryCategories.value.some((category) => category.id === entryForm.categoryId)) entryForm.categoryId = ''
})

function formatRial(value: string | number | null | undefined): string {
  try {
    const rial = BigInt(value ?? 0)
    const negative = rial < 0n
    const absolute = negative ? -rial : rial
    const whole = absolute / 10n
    const remainder = absolute % 10n
    const formatter = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US')
    const sign = negative ? '-' : ''
    const wholeText = formatter.format(whole)
    if (!remainder) return `${sign}${wholeText} ${t('common.toman')}`
    const decimal = formatter.formatToParts(1.1).find((part) => part.type === 'decimal')?.value || '.'
    return `${sign}${wholeText}${decimal}${formatter.format(remainder)} ${t('common.toman')}`
  } catch {
    return `0 ${t('common.toman')}`
  }
}
function formatNumber(value: number | string | null | undefined): string {
  try { return new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(BigInt(value ?? 0)) } catch { return '0' }
}
function formatDate(value: string | null | undefined): string { return formatGregorianDate(value) }
function toRial(value: string | number): string {
  const text = String(value).replace(/,/g, '').trim()
  if (!/^\d+(?:\.\d{0,1})?$/.test(text)) return '0'
  const [whole, fraction = ''] = text.split('.')
  try {
    return (BigInt(whole || '0') * 10n + BigInt(`${fraction}0`.slice(0, 1) || '0')).toString()
  } catch {
    return '0'
  }
}
function toToman(value: string): string {
  try {
    const rial = BigInt(value)
    const negative = rial < 0n
    const absolute = negative ? -rial : rial
    const whole = absolute / 10n
    const remainder = absolute % 10n
    return `${negative ? '-' : ''}${whole}${remainder ? `.${remainder}` : ''}`
  } catch {
    return '0'
  }
}
function categoryPercent(value: string): number { return maxCategory.value ? Math.max(3, Math.round((Number(value) / maxCategory.value) * 100)) : 0 }
function budgetPercent(budget: { amountRial: string; spentRial: string }): number { return Number(budget.amountRial) ? Math.min(100, Math.round((Number(budget.spentRial) / Number(budget.amountRial)) * 100)) : 0 }
function dotStyle(color: string | null): Record<string, string> { return { backgroundColor: color || '#94a3b8' } }
function tagStyle(color: string | null, kind: CashbookKind): Record<string, string> { return { backgroundColor: `${color || (kind === 'income' ? '#3ddc84' : '#ff6961')}22`, color: color || (kind === 'income' ? '#16803e' : '#b42332') } }

const weekdayLabels = computed(() => Array.from({ length: 7 }, (_, index) => t(`cashbook.weekdays.m${index}`)))
const donutSlices = computed(() =>
  (summary.value?.byCategory || [])
    .filter((row) => row.kind === categoryTab.value)
    .map((row) => ({ id: row.categoryId, name: row.categoryName, value: row.amountRial, color: row.color })),
)
function seriesValues(pick: (point: CashbookMonthlyPoint) => string): number[] {
  return comparisonSeries.value.map((point) => Number(pick(point)) / 10)
}
const incomeSpark = computed(() => seriesValues((point) => point.incomeRial))
const expenseSpark = computed(() => seriesValues((point) => point.expenseRial))
const netSpark = computed(() => seriesValues((point) => point.netRial))
const decimalFormat = computed(() => new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 }))
function pctText(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 10) / 10
  return `${rounded > 0 ? '+' : ''}${decimalFormat.value.format(rounded)}%`
}
function deltaClass(value: number | null | undefined, invert = false): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) return 'is-flat'
  const up = value > 0
  return (invert ? !up : up) ? 'is-up' : 'is-down'
}
function deltaIcon(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) return 'mdi-minus'
  return value > 0 ? 'mdi-trending-up' : 'mdi-trending-down'
}
function dayLabel(date: string): string {
  const value = moment(date, 'YYYY-MM-DD')
  const name = monthOptions.value[Number(value.format('jM')) - 1]?.title || value.format('jMMMM')
  return `${Number(value.format('jDD'))} ${name} ${value.format('jYYYY')}`
}
function applyCustomRange(value: { from: string; to: string }) {
  setCustomRange(value.from, value.to)
}

function openEntry(entry?: CashbookEntry) {
  editingEntry.value = entry || null
  entryForm.entryDate = entry?.entryDate || moment().format('YYYY-MM-DD')
  entryForm.kind = entry?.kind || 'expense'
  entryForm.amountToman = entry ? toToman(entry.amountRial) : ''
  entryForm.categoryId = entry?.categoryId || ''
  entryForm.accountId = entry?.accountId || activeAccounts.value[0]?.id || ''
  entryForm.description = entry?.description || ''
  entryForm.reference = entry?.reference || ''
  entryForm.notes = entry?.notes || ''
  entryDialog.value = true
}
async function submitEntry() {
  if (!entryValid.value || isReadOnly.value) return
  saving.value = true
  try {
    const payload = { entryDate: entryForm.entryDate, kind: entryForm.kind, amountRial: toRial(entryForm.amountToman), categoryId: entryForm.categoryId, accountId: entryForm.accountId, description: entryForm.description.trim(), reference: entryForm.reference.trim() || null, notes: entryForm.notes.trim() || null }
    if (editingEntry.value) await updateEntry(editingEntry.value.id, payload)
    else await saveEntry(payload)
    entryDialog.value = false
  } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
function openVoid(entry: CashbookEntry) { voidEntryData.value = entry; voidForm.reason = ''; voidDialog.value = true }
async function submitVoid() {
  if (!voidEntryData.value || !voidForm.reason.trim() || isReadOnly.value) return
  saving.value = true
  try { await voidEntry(voidEntryData.value.id, voidForm.reason.trim()); voidDialog.value = false } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
function openCategory(category?: CashbookCategory) { editingCategory.value = category || null; categoryForm.name = category?.name || ''; categoryForm.kind = category?.kind || 'expense'; categoryForm.color = category?.color || '#3ddc84'; categoryForm.isArchived = category?.isArchived || false; categoryDialog.value = true }
async function submitCategory() {
  if (!categoryForm.name.trim() || isReadOnly.value) return
  saving.value = true
  try {
    const payload = { name: categoryForm.name.trim(), kind: categoryForm.kind, color: categoryForm.color }
    if (editingCategory.value) await updateCategory(editingCategory.value.id, { ...payload, isArchived: categoryForm.isArchived })
    else await saveCategory(payload)
    categoryDialog.value = false
  } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
function openAccount(account?: CashbookAccount) { editingAccount.value = account || null; accountForm.name = account?.name || ''; accountForm.type = account?.type || 'cash'; accountForm.openingToman = account ? toToman(account.openingBalanceRial) : '0'; accountForm.isArchived = account?.isArchived || false; accountDialog.value = true }
async function submitAccount() {
  if (!accountForm.name.trim() || isReadOnly.value) return
  saving.value = true
  try {
    const payload = { name: accountForm.name.trim(), type: accountForm.type, openingBalanceRial: toRial(accountForm.openingToman || '0') }
    if (editingAccount.value) await updateAccount(editingAccount.value.id, { ...payload, isArchived: accountForm.isArchived })
    else await saveAccount(payload)
    accountDialog.value = false
  } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
function openBudget() { budgetForm.categoryId = expenseCategories.value[0]?.id || ''; budgetForm.amountToman = ''; budgetDialog.value = true }
async function submitBudget() {
  if (!budgetForm.categoryId || !budgetForm.amountToman || isReadOnly.value) return
  saving.value = true
  try { await saveBudget({ categoryId: budgetForm.categoryId, month: range.value.from.slice(0, 7), amountRial: toRial(budgetForm.amountToman) }); budgetDialog.value = false } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
async function removeBudget(id: string) { if (isReadOnly.value) return; try { await deleteBudget(id) } catch { $toast.error(t('cashbook.saveError')) } }
function openReceipt(entry: CashbookEntry) { receiptEntry.value = entry; receiptFile.value = null; receiptDialog.value = true }
async function submitReceipt() {
  if (!receiptEntry.value || !receiptFile.value || isReadOnly.value) return
  const file = Array.isArray(receiptFile.value) ? receiptFile.value[0] : receiptFile.value
  if (!file) return
  saving.value = true
  try { await uploadReceipt(receiptEntry.value.id, file); receiptDialog.value = false } catch { $toast.error(t('cashbook.saveError')) } finally { saving.value = false }
}
async function downloadCurrentReceipt() { if (receiptEntry.value?.receipt) { try { await downloadReceipt(receiptEntry.value.receipt.id, receiptEntry.value.receipt.originalName) } catch { $toast.error(t('cashbook.loadError')) } } }
async function runExport(format: 'xlsx' | 'csv') { exporting.value = true; try { await exportData(format) } catch { $toast.error(t('cashbook.exportError')) } finally { exporting.value = false } }

/* Ledger sharing. The owner manages access to their own ledger only; grants issued by
   other users are not editable here. */
const candidateOptions = computed(() => candidates.value.map((candidate) => ({
  value: candidate.id,
  title: candidate.fullName || candidate.id,
})))
function initials(name: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 1)
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`
}
async function openAccess() {
  accessTarget.value = null
  accessDialog.value = true
  try { await loadAccess() } catch { $toast.error(t('cashbook.loadError')) }
}
async function submitGrant() {
  if (!accessTarget.value || accessSaving.value) return
  try {
    await grantAccess(accessTarget.value)
    accessTarget.value = null
  } catch { $toast.error(t('cashbook.accessError')) }
}
function confirmRevoke(grant: { id: string; granteeName: string | null }) {
  if (accessSaving.value) return
  revokeAccess(grant.id).catch(() => $toast.error(t('cashbook.accessError')))
}
</script>

<style scoped>
/* `z-index` lifts the bar's own stacking context above the later `.asa-card`
   siblings; those cards are animation-filled with a transform and would
   otherwise paint over the ledger menu and the period panel. */
.cb-bar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: stretch;
  gap: 0.625rem;
  margin-top: 1.25rem;
  padding: 0.75rem;
}

.cb-bar__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  flex-shrink: 0;
  margin-inline-start: auto;
  border: 1px solid var(--asa-sep);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 180ms var(--ease-default), color 180ms var(--ease-default), border-color 180ms var(--ease-default);
}

.cb-bar__refresh:hover:not(:disabled) {
  background: var(--asa-accent-soft);
  border-color: color-mix(in srgb, var(--asa-accent) 30%, transparent);
  color: var(--asa-accent-deep);
}

.dark .cb-bar__refresh:hover:not(:disabled) {
  color: var(--asa-accent);
}

.cb-bar__refresh:focus-visible {
  outline: none;
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 20%, transparent);
}

.cb-bar__refresh:disabled {
  opacity: 0.55;
  cursor: default;
}

.cb-bar__refresh.is-spinning :deep(.v-icon) {
  animation: cb-spin 900ms linear infinite;
}

.cb-metric {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.cb-metric__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.cb-metric__copy {
  min-width: 0;
}

.cb-metric__spark {
  height: 2.1rem;
  margin-top: 0.05rem;
  opacity: 0.92;
}

.cb-delta {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cb-delta :deep(.v-icon) {
  opacity: 0.9;
}

.cb-delta.is-up {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.cb-delta.is-down {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.cb-delta.is-flat {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-3);
}

.cb-sec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.cb-seg {
  display: inline-flex;
  gap: 0.125rem;
  padding: 0.18rem;
  border-radius: 0.7rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
}

.cb-seg button {
  border: 0;
  border-radius: 0.55rem;
  padding: 0.32rem 0.75rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.cb-seg button.is-on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.cb-seg button:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.cb-card-title {
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 700;
}

.cb-card-sub {
  margin-top: 0.2rem;
  color: var(--asa-label-2);
  font-size: 0.75rem;
}

.cb-metric__value {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.cb-metric__label {
  margin-top: 0.25rem;
  color: var(--asa-label-2);
  font-size: 0.75rem;
}

.cb-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.cb-legend {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
}

.cb-legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cb-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  display: inline-block;
}

.cb-dot--in {
  background: #3ddc84;
}

.cb-dot--out {
  background: #ff6961;
}

.cb-chart {
  display: flex;
  align-items: end;
  gap: 0.25rem;
  height: 11rem;
  margin-top: 1.25rem;
  padding: 0.5rem 0.25rem 0;
  border-bottom: 1px solid var(--asa-sep);
  overflow-x: auto;
}

.cb-chart__day {
  min-width: 1.4rem;
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  gap: 0.35rem;
}

.cb-chart__bars {
  display: flex;
  align-items: end;
  gap: 0.12rem;
  height: 9.5rem;
  width: 100%;
  justify-content: center;
}

.cb-chart__bar {
  display: block;
  width: min(0.35rem, 42%);
  min-height: 0.2rem;
  border-radius: 0.3rem 0.3rem 0 0;
  transition: height 500ms ease;
}

.cb-chart__bar--in {
  background: #3ddc84;
}

.cb-chart__bar--out {
  background: #ff6961;
}

.cb-chart__label {
  color: var(--asa-label-3);
  font-size: 0.5625rem;
  white-space: nowrap;
}

.cb-account-list {
  margin-top: 0.75rem;
}

.cb-account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0;
}

.cb-account-row+.cb-account-row {
  border-top: 1px solid var(--asa-sep);
}

.cb-account-row__main {
  min-width: 0;
}

.cb-account-row__name {
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 700;
}

.cb-account-row__type {
  margin-top: 0.2rem;
  color: var(--asa-label-3);
  font-size: 0.6875rem;
}

.cb-account-row__balance {
  flex-shrink: 0;
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cb-tabs {
  display: inline-flex;
  gap: 0.125rem;
  margin-top: 0.875rem;
  padding: 0.2rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
}

.cb-tabs button {
  border: 0;
  border-radius: 0.55rem;
  padding: 0.4rem 0.7rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 700;
}

.cb-tabs__btn--on {
  background: var(--asa-bg-card) !important;
  color: var(--asa-label) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.cb-category-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.7rem 0;
}

.cb-category-row+.cb-category-row {
  border-top: 1px solid var(--asa-sep);
}

.cb-category-row__dot {
  width: 0.6rem;
  height: 0.6rem;
  margin-top: 0.25rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.cb-category-row__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 600;
}

.cb-category-row__amount {
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cb-progress {
  height: 0.35rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--asa-track);
}

.cb-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #17c9cf, var(--asa-accent));
}

.cb-progress span.cb-progress__bar--over {
  background: linear-gradient(90deg, #ff9f0a, #ff3b30);
}

.cb-budget-row {
  padding: 0.8rem 0;
}

.cb-budget-row+.cb-budget-row {
  border-top: 1px solid var(--asa-sep);
}

.cb-budget-row__name {
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 700;
}

.cb-budget-row__spent,
.cb-budget-row__remaining {
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-variant-numeric: tabular-nums;
}

.cb-filters {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) 9rem 9rem auto;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cb-table-wrap {
  overflow-x: auto;
  margin-top: 0.75rem;
}

.cb-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  text-align: start;
}

.cb-table th {
  padding: 0.7rem 0.75rem;
  color: var(--asa-label-3);
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: start;
  white-space: nowrap;
}

.cb-table td {
  padding: 0.8rem 0.75rem;
  border-top: 1px solid var(--asa-sep);
  color: var(--asa-label-2);
  font-size: 0.75rem;
  vertical-align: middle;
}

.cb-table th.text-left {
  text-align: end;
}

.cb-table td.cb-amount {
  color: var(--asa-label);
  font-weight: 800;
  text-align: end;
  font-variant-numeric: tabular-nums;
}

.cb-table td:last-child {
  width: 8rem;
}

.cb-row--voided {
  opacity: 0.55;
}

.asa-alert {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid transparent;
  border-radius: 1.25rem;
}

.asa-alert--amber {
  border-color: rgba(255, 149, 0, 0.32);
  background: #fff6e5;
}

.asa-alert--rose {
  border-color: rgba(255, 59, 48, 0.26);
  background: #fff1f2;
}

.dark .asa-alert--amber {
  border-color: rgba(255, 149, 0, 0.28);
  background: rgba(255, 149, 0, 0.12);
}

.dark .asa-alert--rose {
  border-color: rgba(255, 59, 48, 0.26);
  background: rgba(255, 59, 48, 0.12);
}

.asa-alert__body {
  flex: 1 1 14rem;
  min-width: 0;
}

.asa-alert__title {
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.4;
}

.asa-alert__desc {
  margin-top: 0.125rem;
  color: var(--asa-label-2);
  font-size: 0.75rem;
  line-height: 1.5;
}

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

@keyframes cb-spin {
  to {
    transform: rotate(360deg);
  }
}

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
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default), transform 120ms var(--ease-default);
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

.cb-entry-title {
  color: var(--asa-label);
  font-weight: 700;
}

.cb-entry-meta {
  max-width: 16rem;
  margin-top: 0.2rem;
  overflow: hidden;
  color: var(--asa-label-3);
  font-size: 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cb-date,
.cb-muted {
  white-space: nowrap;
}

.cb-tag {
  display: inline-block;
  max-width: 10rem;
  overflow: hidden;
  border-radius: 0.5rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cb-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-top: 1px solid var(--asa-sep);
  padding: 0.875rem;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
}

.cb-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem;
}

.cb-form-grid__wide {
  grid-column: 1 / -1;
}

.cb-access-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cb-access-list__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.875rem;
}

.cb-access-list__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--asa-accent) 14%, transparent);
  color: var(--asa-accent);
  font-size: 0.75rem;
  font-weight: 700;
}

.cb-access-list__copy {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.cb-access-list__name {
  overflow: hidden;
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cb-access-list__meta {
  color: var(--asa-label-2);
  font-size: 0.6875rem;
}

.cb-access-empty {
  color: var(--asa-label-2);
  font-size: 0.75rem;
}

.cb-access-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cb-access-add> :first-child {
  flex: 1 1 auto;
  min-width: 0;
}

.cb-date-picker {
  display: block;
  width: 100%;
}

.cb-receipt-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 0;
  text-align: center;
  color: var(--asa-label-2);
  font-size: 0.75rem;
}

.cb-receipt-info strong {
  color: var(--asa-label);
}

@media (max-width: 700px) {
  .cb-filters {
    grid-template-columns: 1fr 1fr;
  }

  .cb-filters> :first-child {
    grid-column: 1 / -1;
  }

  .cb-form-grid {
    grid-template-columns: 1fr;
  }

  .cb-form-grid__wide {
    grid-column: auto;
  }

  .cb-bar__refresh {
    margin-inline-start: 0;
    order: 2;
  }
}

@media (max-width: 900px) {
  .cb-bar {
    flex-wrap: wrap;
  }
}

@media (max-width: 700px) {
  .cb-bar {
    gap: 0.5rem;
  }
}
</style>
