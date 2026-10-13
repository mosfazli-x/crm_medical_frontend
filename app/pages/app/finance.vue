<template>
  <div class="fin">
    <div v-if="loading && !summary" class="app-list" aria-busy="true">
      <div class="fin-stats">
        <div v-for="n in 4" :key="`cb-skel-${n}`" class="app-skel fin-skel" />
      </div>
      <div class="app-skel fin-skel-lg" />
      <div class="app-skel fin-skel-lg" />
    </div>

    <div v-else-if="!canView" class="app-empty" role="status">
      <span class="app-empty__icon"><Icon name="lucide:shield-off" size="26" /></span>
      <p>{{ t('cashbook.accessDenied') }}</p>
      <p class="app-muted fin-empty-desc">{{ t('cashbook.accessDeniedDesc') }}</p>
      <NuxtLink to="/app" class="app-btn app-btn--ghost">{{ t('cashbook.backToDashboard') }}</NuxtLink>
    </div>

    <template v-else>
      <div v-if="isReadOnly" class="fin-note" role="status">
        <Icon name="lucide:eye" size="18" />
        <div class="fin-note__body">
          <p class="fin-note__title">{{ t('cashbook.readOnlyTitle') }}</p>
          <p class="fin-note__desc">{{ t('cashbook.sharedReadOnlyDesc') }}</p>
        </div>
      </div>

      <section class="app-card app-pad fin-bar" :aria-label="t('cashbook.controls')">
        <CashbookLedgerScope
          v-model="ownerId"
          :ledgers="ledgers"
          :selectable="hasSharedLedgers"
          :self-name="selfName"
          :self-id="selfId"
        />
        <CashbookPeriodPicker
          :model-value="period"
          :months="monthOptions"
          :label="monthLabel"
          :range-from="range.from"
          :range-to="range.to"
          :mode="rangeMode"
          :custom-from="customFrom"
          :custom-to="customTo"
          :presets="rangePresets"
          @update:model-value="setPeriod"
          @update:mode="setRangeMode"
          @update:custom="applyCustomRange"
          @shift="shiftMonth"
          @today="goToday"
        />
        <button
          type="button"
          class="app-iconbtn fin-refresh"
          :class="{ 'fin-spin': loading }"
          :aria-label="t('common.refresh')"
          :title="t('common.refresh')"
          :disabled="loading"
          @click="refresh"
        >
          <Icon name="lucide:refresh-cw" size="18" />
        </button>
      </section>

      <div class="fin-tools">
        <button v-if="canEdit" type="button" class="app-btn app-btn--ghost" :disabled="exporting" @click="exportOpen = true">
          <Icon name="lucide:download" size="16" /> {{ t('cashbook.export') }}
        </button>
        <button type="button" class="app-btn app-btn--ghost" @click="openAccess()">
          <Icon name="lucide:share-2" size="16" /> {{ t('cashbook.manageAccess') }}
        </button>
      </div>

      <button v-if="!isReadOnly" type="button" class="app-btn app-btn--primary app-mt-16" @click="openEntry()">
        <Icon name="lucide:plus" size="18" /> {{ t('cashbook.addEntry') }}
      </button>

      <div v-if="loadError" class="fin-note fin-note--rose" role="alert">
        <Icon name="lucide:triangle-alert" size="18" />
        <div class="fin-note__body">
          <p class="fin-note__title">{{ t('cashbook.loadError') }}</p>
        </div>
      </div>

      <section class="app-rise">
        <header class="fin-head">
          <div>
            <h2>{{ t('cashbook.overview') }}</h2>
            <p class="fin-sub">{{ monthLabel }}</p>
          </div>
        </header>

        <div class="fin-stats">
          <article class="app-card fin-stat">
            <div class="fin-stat__head">
              <span class="fin-tint fin-tint--teal"><Icon name="lucide:arrow-down-left" size="18" /></span>
              <span class="fin-delta" :class="deltaClass(deltas.income)">
                <Icon :name="deltaIcon(deltas.income)" size="12" />{{ pctText(deltas.income) }}
              </span>
            </div>
            <p class="fin-stat__value fin-stat__value--income" dir="ltr">{{ formatRial(summary?.totals.incomeRial) }}</p>
            <p class="fin-stat__label">{{ t('cashbook.income') }}</p>
            <div class="fin-stat__spark"><CashbookSparkline :values="incomeSpark" tone="income" :height="30" /></div>
          </article>

          <article class="app-card fin-stat">
            <div class="fin-stat__head">
              <span class="fin-tint fin-tint--rose"><Icon name="lucide:arrow-up-right" size="18" /></span>
              <span class="fin-delta" :class="deltaClass(deltas.expense, true)">
                <Icon :name="deltaIcon(deltas.expense)" size="12" />{{ pctText(deltas.expense) }}
              </span>
            </div>
            <p class="fin-stat__value fin-stat__value--expense" dir="ltr">{{ formatRial(summary?.totals.expenseRial) }}</p>
            <p class="fin-stat__label">{{ t('cashbook.expense') }}</p>
            <div class="fin-stat__spark"><CashbookSparkline :values="expenseSpark" tone="expense" :height="30" /></div>
          </article>

          <article class="app-card fin-stat">
            <div class="fin-stat__head">
              <span class="fin-tint" :class="isNetPositive ? 'fin-tint--green' : 'fin-tint--rose'">
                <Icon name="lucide:arrow-up-down" size="18" />
              </span>
              <span class="fin-delta" :class="deltaClass(deltas.net)">
                <Icon :name="deltaIcon(deltas.net)" size="12" />{{ pctText(deltas.net) }}
              </span>
            </div>
            <p class="fin-stat__value" :class="isNetPositive ? 'fin-stat__value--income' : 'fin-stat__value--expense'" dir="ltr">
              {{ formatRial(summary?.totals.netRial) }}
            </p>
            <p class="fin-stat__label">{{ t('cashbook.net') }}</p>
            <div class="fin-stat__spark"><CashbookSparkline :values="netSpark" tone="net" :height="30" /></div>
          </article>

          <article class="app-card fin-stat">
            <div class="fin-stat__head">
              <span class="fin-tint fin-tint--amber"><Icon name="lucide:calendar-check" size="18" /></span>
              <span class="fin-delta" :class="deltaClass(deltas.entryCount)">
                <Icon :name="deltaIcon(deltas.entryCount)" size="12" />{{ pctText(deltas.entryCount) }}
              </span>
            </div>
            <p class="fin-stat__value" dir="ltr">{{ formatNumber(summary?.totals.entryCount || 0) }}</p>
            <p class="fin-stat__label">{{ t('cashbook.entriesCount') }}</p>
            <div class="fin-stat__spark"><CashbookSparkline :values="netSpark" tone="neutral" :height="30" /></div>
          </article>
        </div>
      </section>

      <section class="app-rise">
        <header class="fin-head">
          <div>
            <h2>{{ t('cashbook.comparison') }}</h2>
            <p class="fin-sub">{{ t('cashbook.comparisonDesc') }}</p>
          </div>
          <div class="app-seg" role="tablist" :aria-label="t('cashbook.comparison')">
            <button
type="button" role="tab" class="app-seg__btn" :class="{ active: comparisonCount === 6 }"
              :aria-selected="comparisonCount === 6" @click="comparisonCount = 6">{{ t('cashbook.last6') }}</button>
            <button
type="button" role="tab" class="app-seg__btn" :class="{ active: comparisonCount === 12 }"
              :aria-selected="comparisonCount === 12" @click="comparisonCount = 12">{{ t('cashbook.last12') }}</button>
          </div>
        </header>

        <div class="fin-grid fin-grid--wide">
          <article class="app-card app-pad fin-span2" :aria-busy="analyticsLoading">
            <div class="fin-card-head">
              <p class="fin-card-title">{{ t('cashbook.monthlyTrend') }}</p>
              <p class="fin-card-sub">{{ t('cashbook.vsPrevious') }}: <span dir="ltr">{{ formatRial(previousTotals?.netRial) }}</span></p>
            </div>
            <CashbookMonthlyBars
v-if="comparisonSeries.length" :series="comparisonSeries" :format="formatRial"
              :chart-label="t('cashbook.monthlyTrend')" />
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:bar-chart-3" size="26" /></span>
              <p>{{ t('cashbook.noFlow') }}</p>
            </div>
          </article>

          <article class="app-card app-pad">
            <div class="fin-card-head">
              <p class="fin-card-title">{{ t('cashbook.categorySplit') }}</p>
              <p class="fin-card-sub">{{ t('cashbook.categorySplitDesc') }}</p>
            </div>
            <div class="app-seg fin-seg-inline">
              <button
type="button" class="app-seg__btn" :class="{ active: categoryTab === 'expense' }"
                @click="categoryTab = 'expense'">{{ t('cashbook.expense') }}</button>
              <button
type="button" class="app-seg__btn" :class="{ active: categoryTab === 'income' }"
                @click="categoryTab = 'income'">{{ t('cashbook.income') }}</button>
            </div>
            <CashbookDonutChart
v-if="donutSlices.length" :slices="donutSlices" :format="formatRial"
              :chart-label="t('cashbook.categorySplit')" />
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:chart-pie" size="26" /></span>
              <p>{{ t('cashbook.noCategories') }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="app-rise">
        <div class="fin-grid fin-grid--wide">
          <article class="app-card app-pad fin-span2">
            <div class="fin-card-head">
              <p class="fin-card-title">{{ t('cashbook.cashFlow') }}</p>
              <p class="fin-card-sub">{{ t('cashbook.cashFlowDesc') }}</p>
            </div>
            <CashbookTrendChart
v-if="dayRows.length" :points="dayRows" :format="formatRial" :label-for="dayLabel"
              :chart-label="t('cashbook.cashFlow')" />
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:activity" size="26" /></span>
              <p>{{ t('cashbook.noFlow') }}</p>
            </div>
          </article>

          <article class="app-card app-pad">
            <div class="fin-card-head">
              <p class="fin-card-title">{{ t('cashbook.weekdayTitle') }}</p>
              <p class="fin-card-sub">{{ t('cashbook.weekdayDesc') }}</p>
            </div>
            <CashbookWeekdayBars
v-if="weekdaySeries.length" :series="weekdaySeries" :labels="weekdayLabels"
              :format="formatRial" :chart-label="t('cashbook.weekdayTitle')" />
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:calendar-days" size="26" /></span>
              <p>{{ t('cashbook.noFlow') }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="app-rise">
        <div class="fin-grid fin-grid--wide">
          <article class="app-card app-pad">
            <div class="fin-card-head">
              <div>
                <p class="fin-card-title">{{ t('cashbook.accounts') }}</p>
                <p class="fin-card-sub">{{ t('cashbook.accountsDesc') }}</p>
              </div>
              <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn"
                :aria-label="t('cashbook.addAccount')" @click="openAccount()">
                <Icon name="lucide:plus" size="17" />
              </button>
            </div>
            <div v-if="accountRows.length" class="fin-rows">
              <div v-for="account in accountRows" :key="account.id" class="fin-row" :class="{ 'fin-dim': account.isArchived }">
                <div class="fin-row__body">
                  <p class="fin-row__title">
                    {{ account.name }}
                    <span v-if="account.isArchived" class="app-pill app-pill--rose">{{ t('cashbook.archived') }}</span>
                  </p>
                  <p class="fin-row__sub">{{ t(`cashbook.accountType.${account.type}`) }}</p>
                </div>
                <div class="fin-row__tail">
                  <p class="fin-row__value" :class="{ 'is-negative': isNegative(account.balanceRial) }" dir="ltr">
                    {{ formatRial(account.balanceRial) }}
                  </p>
                  <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn"
                    :aria-label="t('cashbook.editAccount')" @click="openAccount(account)">
                    <Icon name="lucide:pencil" size="15" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:wallet" size="26" /></span>
              <p>{{ t('cashbook.noAccounts') }}</p>
            </div>
          </article>

          <article class="app-card app-pad">
            <div class="fin-card-head">
              <div>
                <p class="fin-card-title">{{ t('cashbook.categories') }}</p>
                <p class="fin-card-sub">{{ t('cashbook.categoriesDesc') }}</p>
              </div>
              <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn"
                :aria-label="t('cashbook.addCategory')" @click="openCategory()">
                <Icon name="lucide:plus" size="17" />
              </button>
            </div>
            <div class="app-seg fin-seg-inline">
              <button
type="button" class="app-seg__btn" :class="{ active: categoryTab === 'income' }"
                @click="categoryTab = 'income'">{{ t('cashbook.income') }}</button>
              <button
type="button" class="app-seg__btn" :class="{ active: categoryTab === 'expense' }"
                @click="categoryTab = 'expense'">{{ t('cashbook.expense') }}</button>
            </div>
            <div v-if="categoryRows.length" class="fin-rows fin-mt-sm">
              <div v-for="row in categoryRows" :key="row.categoryId" class="fin-row fin-row--stack" :class="{ 'fin-dim': row.isArchived }">
                <span class="fin-dot" :style="dotStyle(row.color)" />
                <div class="fin-row__body">
                  <div class="fin-row__line">
                    <p class="fin-row__title">
                      {{ row.categoryName }}
                      <span v-if="row.isArchived" class="app-pill app-pill--rose">{{ t('cashbook.archived') }}</span>
                    </p>
                    <div class="fin-row__tail">
                      <p class="fin-row__value" dir="ltr">{{ formatRial(row.amountRial) }}</p>
                      <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn"
                        :aria-label="t('cashbook.editCategory')"
                        @click="openCategory(categories.find((category) => category.id === row.categoryId))">
                        <Icon name="lucide:pencil" size="15" />
                      </button>
                    </div>
                  </div>
                  <div class="fin-progress"><span :style="{ width: categoryPercent(row.amountRial) + '%' }" /></div>
                </div>
              </div>
            </div>
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:shapes" size="26" /></span>
              <p>{{ t('cashbook.noCategories') }}</p>
            </div>
          </article>

          <article class="app-card app-pad">
            <div class="fin-card-head">
              <div>
                <p class="fin-card-title">{{ t('cashbook.budgets') }}</p>
                <p class="fin-card-sub">{{ t('cashbook.budgetsDesc') }}</p>
              </div>
              <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn"
                :aria-label="t('cashbook.addBudget')" @click="openBudget()">
                <Icon name="lucide:plus" size="17" />
              </button>
            </div>
            <div v-if="budgetRows.length" class="fin-rows fin-mt-sm">
              <div v-for="budget in budgetRows" :key="budget.id" class="fin-row fin-row--stack">
                <div class="fin-row__line">
                  <p class="fin-row__title">{{ budget.categoryName }}</p>
                  <button
v-if="!isReadOnly" type="button" class="app-iconbtn fin-iconbtn fin-iconbtn--danger"
                    :aria-label="t('cashbook.deleteBudget')" @click="removeBudget(budget.id)">
                    <Icon name="lucide:trash-2" size="15" />
                  </button>
                </div>
                <div class="fin-progress fin-mt-xs">
                  <span
:class="{ 'fin-progress__bar--over': budgetPercent(budget) >= 100 }"
                    :style="{ width: budgetPercent(budget) + '%' }" />
                </div>
                <div class="fin-row__line fin-mt-xs">
                  <span class="fin-muted" dir="ltr">{{ formatRial(budget.spentRial) }} / {{ formatRial(budget.amountRial) }}</span>
                  <span class="fin-muted" :class="{ 'is-negative': isNegative(budget.remainingRial) }" dir="ltr">
                    {{ formatRial(budget.remainingRial) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="app-empty fin-empty">
              <span class="app-empty__icon"><Icon name="lucide:target" size="26" /></span>
              <p>{{ t('cashbook.noBudgets') }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="app-rise app-mt-16">
        <article class="app-card app-pad">
          <div class="fin-card-head">
            <div>
              <p class="fin-card-title">{{ t('cashbook.entries') }}</p>
              <p class="fin-card-sub">{{ t('cashbook.entriesDesc') }}</p>
            </div>
            <span class="app-pill app-pill--teal">{{ formatNumber(pagination.total) }}</span>
          </div>

          <div class="fin-filters">
            <div class="app-search">
              <Icon class="app-search__icon" name="lucide:search" size="18" />
              <input
v-model="filters.search" class="app-input" type="search" :placeholder="t('cashbook.search')"
                @keyup.enter="applyFilters">
            </div>
            <select v-model="filters.kind" class="app-input fin-select" :aria-label="t('cashbook.type')">
              <option v-for="opt in kindFilterOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
            <select v-model="filters.status" class="app-input fin-select" :aria-label="t('cashbook.status')">
              <option v-for="opt in statusFilterOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
            <button type="button" class="app-btn app-btn--ghost" @click="applyFilters">
              <Icon name="lucide:filter" size="15" /> {{ t('cashbook.apply') }}
            </button>
          </div>

          <div v-if="entries.length" class="fin-entries">
            <article v-for="entry in entries" :key="entry.id" class="fin-entry" :class="{ 'fin-dim': entry.status === 'voided' }">
              <div class="fin-entry__head">
                <span class="fin-tag" :style="tagStyle(entry.categoryColor, entry.kind)">{{ entry.categoryName }}</span>
                <span class="app-pill" :class="entry.status === 'active' ? 'app-pill--green' : 'app-pill--rose'">
                  {{ t(`cashbook.entryStatus.${entry.status}`) }}
                </span>
              </div>

              <p class="fin-entry__title">{{ entry.description }}</p>
              <p v-if="entry.reference || entry.notes" class="fin-entry__meta">{{ entry.reference || entry.notes }}</p>

              <div class="fin-entry__foot">
                <div class="fin-entry__info">
                  <span><Icon name="lucide:wallet" size="13" /> {{ entry.accountName }}</span>
                  <span><Icon name="lucide:calendar" size="13" /> <span dir="ltr">{{ formatDate(entry.entryDate) }}</span></span>
                </div>
                <span class="fin-amt" :class="entry.kind === 'income' ? 'is-income' : 'is-expense'" dir="ltr">
                  {{ entry.kind === 'income' ? '+' : '-' }}{{ formatRial(entry.amountRial) }}
                </span>
              </div>

              <div class="fin-entry__acts">
                <button
v-if="entry.receipt" type="button" class="app-iconbtn fin-iconbtn"
                  :aria-label="t('cashbook.downloadReceipt')" @click="openReceipt(entry)">
                  <Icon name="lucide:paperclip" size="16" />
                </button>
                <button
v-else-if="!isReadOnly && entry.status === 'active'" type="button" class="app-iconbtn fin-iconbtn"
                  :aria-label="t('cashbook.addReceipt')" @click="openReceipt(entry)">
                  <Icon name="lucide:paperclip" size="16" />
                </button>
                <button
v-if="!isReadOnly && entry.status === 'active'" type="button" class="app-iconbtn fin-iconbtn"
                  :aria-label="t('cashbook.editEntry')" @click="openEntry(entry)">
                  <Icon name="lucide:pencil" size="16" />
                </button>
                <button
v-if="!isReadOnly && entry.status === 'active'" type="button"
                  class="app-iconbtn fin-iconbtn fin-iconbtn--danger" :aria-label="t('cashbook.voidEntry')" @click="openVoid(entry)">
                  <Icon name="lucide:circle-x" size="16" />
                </button>
              </div>
            </article>
          </div>

          <div v-else class="app-empty fin-empty">
            <span class="app-empty__icon"><Icon name="lucide:notebook" size="26" /></span>
            <p>{{ t('cashbook.noEntries') }}</p>
            <button v-if="!isReadOnly" type="button" class="app-btn app-btn--ghost" @click="openEntry()">
              {{ t('cashbook.addEntry') }}
            </button>
          </div>

          <div v-if="pagination.totalPages > 1" class="fin-pager">
            <button
type="button" class="app-iconbtn" :disabled="page <= 1" :aria-label="t('cashbook.previousPage')"
              @click="changePage(page - 1)">
              <Icon name="lucide:chevron-right" size="17" />
            </button>
            <span>{{ t('cashbook.page') }} {{ formatNumber(page) }} / {{ formatNumber(pagination.totalPages) }}</span>
            <button
type="button" class="app-iconbtn" :disabled="page >= pagination.totalPages" :aria-label="t('cashbook.nextPage')"
              @click="changePage(page + 1)">
              <Icon name="lucide:chevron-left" size="17" />
            </button>
          </div>
        </article>
      </section>
    </template>

    <UiDialog v-model="exportOpen" :title="t('cashbook.export')" size="sm">
      <div class="fin-opts">
        <button type="button" class="fin-opt" :disabled="exporting" @click="runExport('xlsx')">
          <Icon name="lucide:table-2" size="26" />
          <span>{{ t('cashbook.exportExcel') }}</span>
        </button>
        <button type="button" class="fin-opt" :disabled="exporting" @click="runExport('csv')">
          <Icon name="lucide:file-text" size="26" />
          <span>{{ t('cashbook.exportCsv') }}</span>
        </button>
      </div>
    </UiDialog>

    <UiDialog v-model="entryDialog" :title="editingEntry ? t('cashbook.editEntry') : t('cashbook.addEntry')" size="lg">
      <div class="fin-form">
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.type') }}</span>
          <select v-model="entryForm.kind" class="app-input fin-select">
            <option v-for="opt in kindOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
          </select>
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.date') }}</span>
          <div class="fin-picker">
            <PersianDatetimePicker
              v-model="entryForm.entryDate"
              type="date"
              format="YYYY-MM-DD"
              display-format="jYYYY/jMM/jDD"
              color="#5f8feb"
              auto-submit
              clearable
              custom-input
              :placeholder="t('cashbook.datePlaceholder')"
              input-class="fin-picker-input"
            />
          </div>
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.amountToman') }}</span>
          <input v-model="entryForm.amountToman" class="app-input" type="number" min="0.1" step="0.1" dir="ltr">
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.account') }}</span>
          <select v-model="entryForm.accountId" class="app-input fin-select">
            <option v-for="account in activeAccounts" :key="account.id" :value="account.id">{{ account.name }}</option>
          </select>
        </div>
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.category') }}</span>
          <select v-model="entryForm.categoryId" class="app-input fin-select">
            <option v-for="category in entryCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.description') }}</span>
          <input v-model="entryForm.description" class="app-input" type="text" :placeholder="t('cashbook.descriptionPlaceholder')">
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.reference') }}</span>
          <input v-model="entryForm.reference" class="app-input" type="text">
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.notes') }}</span>
          <input v-model="entryForm.notes" class="app-input" type="text">
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="entryDialog = false">{{ t('common.cancel') }}</button>
        <button type="button" class="app-btn app-btn--primary fin-btn-inline" :disabled="saving || !entryValid" @click="submitEntry">
          <Icon v-if="saving" name="lucide:loader-2" size="16" class="fin-spin" />
          <Icon v-else name="lucide:check" size="16" />
          {{ t('common.save') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="categoryDialog" :title="editingCategory ? t('cashbook.editCategory') : t('cashbook.addCategory')" size="sm">
      <div class="fin-form">
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.name') }}</span>
          <input v-model="categoryForm.name" class="app-input" type="text">
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.type') }}</span>
          <select v-model="categoryForm.kind" class="app-input fin-select">
            <option v-for="opt in kindOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
          </select>
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.color') }}</span>
          <input v-model="categoryForm.color" class="fin-color" type="color">
        </div>
        <div v-if="editingCategory" class="fin-field fin-field--wide">
          <label class="fin-toggle">
            <input v-model="categoryForm.isArchived" type="checkbox">
            <span>{{ t('cashbook.archived') }}</span>
          </label>
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="categoryDialog = false">{{ t('common.cancel') }}</button>
        <button type="button" class="app-btn app-btn--primary fin-btn-inline" :disabled="saving || !categoryForm.name" @click="submitCategory">
          <Icon name="lucide:check" size="16" /> {{ t('common.save') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="accountDialog" :title="editingAccount ? t('cashbook.editAccount') : t('cashbook.addAccount')" size="sm">
      <div class="fin-form">
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.name') }}</span>
          <input v-model="accountForm.name" class="app-input" type="text">
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.accountTypeLabel') }}</span>
          <select v-model="accountForm.type" class="app-input fin-select">
            <option v-for="opt in accountTypeOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
          </select>
        </div>
        <div class="fin-field">
          <span class="fin-label">{{ t('cashbook.openingBalance') }}</span>
          <input v-model="accountForm.openingToman" class="app-input" type="number" min="0" step="0.1" dir="ltr">
        </div>
        <div v-if="editingAccount" class="fin-field fin-field--wide">
          <label class="fin-toggle">
            <input v-model="accountForm.isArchived" type="checkbox">
            <span>{{ t('cashbook.archived') }}</span>
          </label>
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="accountDialog = false">{{ t('common.cancel') }}</button>
        <button type="button" class="app-btn app-btn--primary fin-btn-inline" :disabled="saving || !accountForm.name" @click="submitAccount">
          <Icon name="lucide:check" size="16" /> {{ t('common.save') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="budgetDialog" :title="t('cashbook.addBudget')" size="sm">
      <div class="fin-form">
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.category') }}</span>
          <select v-model="budgetForm.categoryId" class="app-input fin-select">
            <option v-for="category in expenseCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.budgetAmount') }}</span>
          <input v-model="budgetForm.amountToman" class="app-input" type="number" min="0.1" step="0.1" dir="ltr">
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="budgetDialog = false">{{ t('common.cancel') }}</button>
        <button
type="button" class="app-btn app-btn--primary fin-btn-inline"
          :disabled="saving || !budgetForm.categoryId || !budgetForm.amountToman" @click="submitBudget">
          <Icon name="lucide:check" size="16" /> {{ t('common.save') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="voidDialog" :title="t('cashbook.voidEntry')" size="sm">
      <p class="fin-dialog-sub">{{ voidEntryData?.description }}</p>
      <div class="fin-form">
        <div class="fin-field fin-field--wide">
          <span class="fin-label">{{ t('cashbook.voidReason') }}</span>
          <textarea v-model="voidForm.reason" class="app-input fin-textarea" rows="3" />
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="voidDialog = false">{{ t('common.cancel') }}</button>
        <button type="button" class="app-btn app-btn--danger fin-btn-inline" :disabled="saving || !voidForm.reason" @click="submitVoid">
          <Icon name="lucide:circle-x" size="16" /> {{ t('cashbook.confirmVoid') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="receiptDialog" :title="receiptEntry?.receipt ? t('cashbook.receiptInfo') : t('cashbook.addReceipt')" size="sm">
      <p class="fin-dialog-sub">{{ receiptEntry?.description }}</p>
      <div v-if="receiptEntry?.receipt" class="fin-receipt">
        <Icon name="lucide:file-check-2" size="38" />
        <strong>{{ receiptEntry.receipt.originalName }}</strong>
        <span class="app-muted">{{ receiptEntry.receipt.mimeType }} · {{ formatNumber(receiptEntry.receipt.fileSize) }} {{ t('cashbook.bytes') }}</span>
        <button type="button" class="app-btn app-btn--primary fin-btn-inline fin-mt-sm" @click="downloadCurrentReceipt">
          <Icon name="lucide:download" size="15" /> {{ t('cashbook.downloadReceipt') }}
        </button>
      </div>
      <div v-else class="fin-field">
        <span class="fin-label">{{ t('cashbook.receiptFile') }}</span>
        <input class="fin-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" @change="onReceiptPick">
      </div>
      <template v-if="!receiptEntry?.receipt" #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="receiptDialog = false">{{ t('common.cancel') }}</button>
        <button type="button" class="app-btn app-btn--primary fin-btn-inline" :disabled="saving || !receiptFile" @click="submitReceipt">
          <Icon name="lucide:upload" size="15" /> {{ t('cashbook.upload') }}
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="accessDialog" :title="t('cashbook.manageAccess')" size="md">
      <div class="fin-note fin-note--amber">
        <Icon name="lucide:shield-check" size="18" />
        <p class="fin-note__desc">{{ t('cashbook.accessPrivacyNote') }}</p>
      </div>

      <p class="fin-section-label">{{ t('cashbook.sharedWith') }}</p>
      <ul v-if="grants.length" class="fin-access">
        <li v-for="grant in grants" :key="grant.id" class="fin-access__item">
          <span class="app-avatar fin-avatar" aria-hidden="true">{{ initials(grant.granteeName) }}</span>
          <span class="fin-access__copy">
            <span class="fin-access__name">{{ grant.granteeName || grant.granteeId }}</span>
            <span class="fin-access__meta">{{ t(grant.granteeRole === 'admin_doctor' ? 'cashbook.roleManager' : 'cashbook.roleDoctor') }}</span>
          </span>
          <button
type="button" class="app-iconbtn fin-iconbtn fin-iconbtn--danger" :aria-label="t('cashbook.revokeAccess')"
            :disabled="accessSaving" @click="confirmRevoke(grant)">
            <Icon name="lucide:user-x" size="16" />
          </button>
        </li>
      </ul>
      <p v-else class="fin-muted fin-access-empty">{{ t('cashbook.noSharedLedgers') }}</p>

      <template v-if="candidates.length">
        <p class="fin-section-label fin-mt-16">{{ t('cashbook.shareWithSomeone') }}</p>
        <div class="fin-access-add">
          <select v-model="accessTarget" class="app-input fin-select">
            <option :value="null" disabled>{{ t('cashbook.pickUserToShare') }}</option>
            <option v-for="opt in candidateOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
          </select>
          <button type="button" class="app-btn app-btn--primary fin-btn-inline" :disabled="accessSaving || !accessTarget" @click="submitGrant">
            <Icon name="lucide:share-2" size="16" /> {{ t('cashbook.grantAccess') }}
          </button>
        </div>
      </template>
    </UiDialog>

    <UiConfirmDialog
      v-model="revokeDialog"
      :title="t('cashbook.revokeAccess')"
      :message="revokeTarget ? (revokeTarget.granteeName || revokeTarget.granteeId) : ''"
      :confirm-label="t('cashbook.revokeAccess')"
      :cancel-label="t('common.cancel')"
      variant="danger"
      :loading="accessSaving"
      @confirm="submitRevoke"
    />
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type { CashbookAccount, CashbookAccountType, CashbookCategory, CashbookEntry, CashbookKind, CashbookStatus } from '~/types/finance'
import type { CashbookMonthlyPoint } from '~/composables/useFinance'

definePageMeta({
  layout: 'app',
  appTitle: 'مالی',
  appSubtitle: 'صندوق کلینیک',
})

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
const exportOpen = ref(false)
const categoryTab = ref<CashbookKind>('expense')
const entryDialog = ref(false)
const categoryDialog = ref(false)
const accountDialog = ref(false)
const budgetDialog = ref(false)
const voidDialog = ref(false)
const receiptDialog = ref(false)
const accessDialog = ref(false)
const revokeDialog = ref(false)
const accessTarget = ref<string | null>(null)
const editingEntry = ref<CashbookEntry | null>(null)
const editingCategory = ref<CashbookCategory | null>(null)
const editingAccount = ref<CashbookAccount | null>(null)
const voidEntryData = ref<CashbookEntry | null>(null)
const receiptEntry = ref<CashbookEntry | null>(null)
const receiptFile = ref<File | null>(null)
const revokeTarget = ref<{ id: string; granteeId: string; granteeName: string | null } | null>(null)

const entryForm = reactive({
  entryDate: moment().format('YYYY-MM-DD'),
  kind: 'expense' as CashbookKind,
  amountToman: '',
  categoryId: '',
  accountId: '',
  description: '',
  reference: '',
  notes: '',
})
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
const entryValid = computed(() =>
  !!entryForm.entryDate && !!entryForm.kind && toRial(entryForm.amountToman) !== '0'
  && !!entryForm.categoryId && !!entryForm.accountId && !!entryForm.description.trim(),
)
const kindOptions = computed(() => [
  { title: t('cashbook.income'), value: 'income' as CashbookKind },
  { title: t('cashbook.expense'), value: 'expense' as CashbookKind },
])
const accountTypeOptions = computed(() =>
  (['cash', 'bank', 'card', 'other'] as CashbookAccountType[]).map((value) => ({ title: t(`cashbook.accountType.${value}`), value })),
)
const kindFilterOptions = computed(() => [{ title: t('cashbook.allTypes'), value: '' }, ...kindOptions.value])
const statusFilterOptions = computed(() => [
  { title: t('cashbook.allStatuses'), value: '' },
  { title: t('cashbook.entryStatus.active'), value: 'active' as CashbookStatus },
  { title: t('cashbook.entryStatus.voided'), value: 'voided' as CashbookStatus },
])
const candidateOptions = computed(() => candidates.value.map((candidate) => ({
  value: candidate.id,
  title: candidate.fullName || candidate.id,
})))

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
function isNegative(value: string | null | undefined): boolean {
  try { return BigInt(value || '0') < 0n } catch { return false }
}
function categoryPercent(value: string): number {
  return maxCategory.value ? Math.max(3, Math.round((Number(value) / maxCategory.value) * 100)) : 0
}
function budgetPercent(budget: { amountRial: string; spentRial: string }): number {
  return Number(budget.amountRial) ? Math.min(100, Math.round((Number(budget.spentRial) / Number(budget.amountRial)) * 100)) : 0
}
function dotStyle(color: string | null): Record<string, string> { return { backgroundColor: color || '#94a3b8' } }
function tagStyle(color: string | null, kind: CashbookKind): Record<string, string> {
  return { backgroundColor: `${color || (kind === 'income' ? '#3ddc84' : '#ff6961')}22`, color: color || (kind === 'income' ? '#16803e' : '#b42332') }
}

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
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) return 'lucide:minus'
  return value > 0 ? 'lucide:trending-up' : 'lucide:trending-down'
}
function dayLabel(date: string): string {
  const value = moment(date, 'YYYY-MM-DD')
  const name = monthOptions.value[Number(value.format('jM')) - 1]?.title || value.format('jMMMM')
  return `${Number(value.format('jDD'))} ${name} ${value.format('jYYYY')}`
}
function applyCustomRange(value: { from: string; to: string }) {
  setCustomRange(value.from, value.to)
}
function initials(name: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 1)
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`
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
    const payload = {
      entryDate: entryForm.entryDate,
      kind: entryForm.kind,
      amountRial: toRial(entryForm.amountToman),
      categoryId: entryForm.categoryId,
      accountId: entryForm.accountId,
      description: entryForm.description.trim(),
      reference: entryForm.reference.trim() || null,
      notes: entryForm.notes.trim() || null,
    }
    if (editingEntry.value) await updateEntry(editingEntry.value.id, payload)
    else await saveEntry(payload)
    entryDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}

function openVoid(entry: CashbookEntry) {
  voidEntryData.value = entry
  voidForm.reason = ''
  voidDialog.value = true
}
async function submitVoid() {
  if (!voidEntryData.value || !voidForm.reason.trim() || isReadOnly.value) return
  saving.value = true
  try {
    await voidEntry(voidEntryData.value.id, voidForm.reason.trim())
    voidDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}

function openCategory(category?: CashbookCategory) {
  editingCategory.value = category || null
  categoryForm.name = category?.name || ''
  categoryForm.kind = category?.kind || 'expense'
  categoryForm.color = category?.color || '#3ddc84'
  categoryForm.isArchived = category?.isArchived || false
  categoryDialog.value = true
}
async function submitCategory() {
  if (!categoryForm.name.trim() || isReadOnly.value) return
  saving.value = true
  try {
    const payload = { name: categoryForm.name.trim(), kind: categoryForm.kind, color: categoryForm.color }
    if (editingCategory.value) await updateCategory(editingCategory.value.id, { ...payload, isArchived: categoryForm.isArchived })
    else await saveCategory(payload)
    categoryDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}

function openAccount(account?: CashbookAccount) {
  editingAccount.value = account || null
  accountForm.name = account?.name || ''
  accountForm.type = account?.type || 'cash'
  accountForm.openingToman = account ? toToman(account.openingBalanceRial) : '0'
  accountForm.isArchived = account?.isArchived || false
  accountDialog.value = true
}
async function submitAccount() {
  if (!accountForm.name.trim() || isReadOnly.value) return
  saving.value = true
  try {
    const payload = { name: accountForm.name.trim(), type: accountForm.type, openingBalanceRial: toRial(accountForm.openingToman || '0') }
    if (editingAccount.value) await updateAccount(editingAccount.value.id, { ...payload, isArchived: accountForm.isArchived })
    else await saveAccount(payload)
    accountDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}

function openBudget() {
  budgetForm.categoryId = expenseCategories.value[0]?.id || ''
  budgetForm.amountToman = ''
  budgetDialog.value = true
}
async function submitBudget() {
  if (!budgetForm.categoryId || !budgetForm.amountToman || isReadOnly.value) return
  saving.value = true
  try {
    await saveBudget({ categoryId: budgetForm.categoryId, month: range.value.from.slice(0, 7), amountRial: toRial(budgetForm.amountToman) })
    budgetDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}
async function removeBudget(id: string) {
  if (isReadOnly.value) return
  try {
    await deleteBudget(id)
  } catch {
    $toast.error(t('cashbook.saveError'))
  }
}

function openReceipt(entry: CashbookEntry) {
  receiptEntry.value = entry
  receiptFile.value = null
  receiptDialog.value = true
}
function onReceiptPick(event: Event) {
  const files = (event.target as HTMLInputElement).files
  receiptFile.value = files && files.length ? files[0]! : null
}
async function submitReceipt() {
  if (!receiptEntry.value || !receiptFile.value || isReadOnly.value) return
  saving.value = true
  try {
    await uploadReceipt(receiptEntry.value.id, receiptFile.value)
    receiptDialog.value = false
  } catch {
    $toast.error(t('cashbook.saveError'))
  } finally {
    saving.value = false
  }
}
async function downloadCurrentReceipt() {
  if (!receiptEntry.value?.receipt) return
  try {
    await downloadReceipt(receiptEntry.value.receipt.id, receiptEntry.value.receipt.originalName)
  } catch {
    $toast.error(t('cashbook.loadError'))
  }
}

async function runExport(format: 'xlsx' | 'csv') {
  exporting.value = true
  try {
    await exportData(format)
    exportOpen.value = false
  } catch {
    $toast.error(t('cashbook.exportError'))
  } finally {
    exporting.value = false
  }
}

async function openAccess() {
  accessTarget.value = null
  accessDialog.value = true
  try {
    await loadAccess()
  } catch {
    $toast.error(t('cashbook.loadError'))
  }
}
async function submitGrant() {
  if (!accessTarget.value || accessSaving.value) return
  try {
    await grantAccess(accessTarget.value)
    accessTarget.value = null
  } catch {
    $toast.error(t('cashbook.accessError'))
  }
}
function confirmRevoke(grant: { id: string; granteeId: string; granteeName: string | null }) {
  if (accessSaving.value) return
  revokeTarget.value = grant
  revokeDialog.value = true
}
async function submitRevoke() {
  if (!revokeTarget.value) return
  try {
    await revokeAccess(revokeTarget.value.id)
    revokeDialog.value = false
  } catch {
    $toast.error(t('cashbook.accessError'))
  }
}
</script>

<style scoped>
.fin {
  display: block;
}

.fin-skel { height: 108px; }
.fin-skel-lg { height: 280px; }

.fin-empty-desc { max-width: 22rem; }

/* ── Notes / banners ───────────────────────────── */

.fin-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 13px 15px;
  border-radius: var(--app-radius);
  border: 1px solid var(--app-amber-soft);
  background: var(--app-amber-soft);
  color: var(--app-amber);
}

.fin-note--rose {
  border-color: var(--app-rose-soft);
  background: var(--app-rose-soft);
  color: var(--app-expense);
}

.fin-note--amber {
  border-color: var(--app-amber-soft);
  background: var(--app-amber-soft);
  color: var(--app-amber);
  margin-top: 0;
  margin-bottom: 16px;
}

.fin-note__body { min-width: 0; }
.fin-note__title { font-size: 13.5px; font-weight: 700; color: var(--app-text); }
.fin-note__desc { font-size: 12.5px; line-height: 1.5; }
.fin-note--amber .fin-note__desc { color: var(--app-amber); }

/* ── Controls bar ──────────────────────────────── */

.fin-bar {
  position: relative;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
  margin-top: 14px;
}

.fin-refresh {
  align-self: center;
  margin-inline-start: auto;
  width: 44px;
  height: 44px;
}

.fin-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.fin-tools .app-btn { flex: 1 1 0; }

/* ── Headers ───────────────────────────────────── */

.fin-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 22px 2px 12px;
}

.fin-head h2 { font-size: 15px; font-weight: 700; color: var(--app-text); }
.fin-sub { margin-top: 3px; font-size: 12.5px; color: var(--app-muted); }

.fin-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.fin-card-title { font-size: 14.5px; font-weight: 700; color: var(--app-text); }
.fin-card-sub { margin-top: 3px; font-size: 12px; color: var(--app-muted); }

/* ── Stats ─────────────────────────────────────── */

.fin-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.fin-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
}

.fin-stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.fin-stat__value {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--app-text);
  word-break: break-word;
}

.fin-stat__value--income { color: var(--app-income); }
.fin-stat__value--expense { color: var(--app-expense); }
.fin-stat__label { font-size: 11.5px; font-weight: 600; color: var(--app-muted); }
.fin-stat__spark { margin-top: 2px; }

.fin-tint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--app-surface-2);
  color: var(--app-muted);
}

.fin-tint--teal { background: var(--app-brand-soft); color: var(--app-brand-deep); }
.fin-tint--green { background: var(--app-green-soft); color: var(--app-income); }
.fin-tint--rose { background: var(--app-rose-soft); color: var(--app-expense); }
.fin-tint--amber { background: var(--app-amber-soft); color: var(--app-amber); }

.fin-delta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.fin-delta.is-up { color: var(--app-income); }
.fin-delta.is-down { color: var(--app-expense); }
.fin-delta.is-flat { color: var(--app-muted); }

/* ── Grids ─────────────────────────────────────── */

.fin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.fin-seg-inline { margin-bottom: 12px; }
.fin-empty { padding: 32px 20px; }
.fin-mt-sm { margin-top: 10px; }
.fin-mt-xs { margin-top: 6px; }

/* ── Rows (accounts / categories / budgets) ────── */

.fin-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fin-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 13px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface-2);
}

.fin-row--stack { align-items: flex-start; }

.fin-row__body { flex: 1 1 auto; min-width: 0; }

.fin-row__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.fin-row__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text);
  min-width: 0;
}

.fin-row__sub { margin-top: 3px; font-size: 12px; color: var(--app-muted); }
.fin-row__tail { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.fin-row__value { font-size: 13.5px; font-weight: 700; color: var(--app-text); white-space: nowrap; }
.fin-row__value.is-negative { color: var(--app-expense); }
.fin-muted { font-size: 12px; color: var(--app-muted); font-variant-numeric: tabular-nums; }

.fin-dot {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 50%;
}

.fin-progress {
  height: 6px;
  margin-top: 6px;
  border-radius: 999px;
  background: var(--app-surface);
  overflow: hidden;
}

.fin-progress > span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--app-brand);
}

.fin-progress__bar--over { background: var(--app-expense) !important; }

.fin-dim { opacity: 0.55; }

.fin-iconbtn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.fin-iconbtn--danger {
  border-color: var(--app-rose-soft);
  background: var(--app-rose-soft);
  color: var(--app-expense);
}

/* ── Filters ───────────────────────────────────── */

.fin-filters {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.fin-select {
  padding-inline: 14px;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--app-muted) 50%), linear-gradient(135deg, var(--app-muted) 50%, transparent 50%);
  background-position: calc(100% - 18px) center, calc(100% - 13px) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.fin-filters .app-btn { width: 100%; }

/* ── Entries ───────────────────────────────────── */

.fin-entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fin-entry {
  padding: 13px 14px;
  border-radius: var(--app-radius);
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-sm);
}

.fin-entry__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.fin-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}

.fin-entry__title { font-size: 14.5px; font-weight: 700; color: var(--app-text); }
.fin-entry__meta { margin-top: 3px; font-size: 12px; color: var(--app-muted); }

.fin-entry__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.fin-entry__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--app-muted);
}

.fin-entry__info span { display: inline-flex; align-items: center; gap: 5px; }
.fin-amt { font-size: 14px; font-weight: 800; white-space: nowrap; }
.fin-amt.is-income { color: var(--app-income); }
.fin-amt.is-expense { color: var(--app-expense); }

.fin-entry__acts {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--app-border);
}

.fin-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 16px;
  font-size: 13px;
  color: var(--app-muted);
}

/* ── Dialogs ───────────────────────────────────── */

.fin-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.fin-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.fin-label { font-size: 12.5px; font-weight: 600; color: var(--app-text-2); }

.fin-form .app-input { padding: 12px 14px; }

.fin-textarea {
  resize: vertical;
  min-height: 84px;
  font-family: inherit;
}

.fin-picker { display: block; width: 100%; }

.fin-picker :deep(input) {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text);
  font-family: inherit;
  font-size: 15px;
  outline: none;
}

.fin-picker :deep(input):focus {
  border-color: var(--app-brand);
  box-shadow: 0 0 0 3px var(--app-brand-soft);
}

.fin-color {
  width: 100%;
  height: 46px;
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  cursor: pointer;
}

.fin-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--app-text);
  cursor: pointer;
}

.fin-toggle input { width: 18px; height: 18px; accent-color: var(--app-brand); }

.fin-file {
  width: 100%;
  padding: 11px 12px;
  border-radius: 14px;
  border: 1px dashed var(--app-border-strong);
  background: var(--app-surface-2);
  color: var(--app-text-2);
  font-size: 13px;
}

.fin-dialog-sub { font-size: 13px; color: var(--app-muted); }

.fin-btn-inline { flex: 0 0 auto; }

.fin-receipt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  border-radius: 14px;
  background: var(--app-surface-2);
  text-align: center;
  color: var(--app-brand-deep);
}

.fin-receipt strong { font-size: 14px; color: var(--app-text); word-break: break-all; }

.fin-opts { display: flex; flex-direction: column; gap: 10px; }

.fin-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.fin-opt:hover:not(:disabled) { border-color: var(--app-brand); background: var(--app-surface-2); }
.fin-opt:disabled { opacity: 0.5; pointer-events: none; }

/* ── Access ────────────────────────────────────── */

.fin-section-label {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--app-muted);
}

.fin-access { display: flex; flex-direction: column; gap: 10px; list-style: none; margin: 0; padding: 0; }

.fin-access__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 14px;
  border: 1px solid var(--app-border);
  background: var(--app-surface-2);
}

.fin-avatar { width: 38px; height: 38px; font-size: 13px; }
.fin-access__copy { flex: 1 1 auto; min-width: 0; }
.fin-access__name { display: block; font-size: 14px; font-weight: 700; color: var(--app-text); }
.fin-access__meta { display: block; margin-top: 2px; font-size: 12px; color: var(--app-muted); }
.fin-access-empty { padding: 14px 0; }
.fin-access-add { display: flex; flex-direction: column; gap: 10px; }
.fin-access-add .app-btn { width: 100%; }

/* ── Motion ────────────────────────────────────── */

.fin-spin { animation: fin-rotate 0.85s linear infinite; }

@keyframes fin-rotate {
  to { transform: rotate(360deg); }
}

@media (min-width: 640px) {
  .fin-filters { grid-template-columns: 1fr 1fr; }
  .fin-filters .app-search { grid-column: 1 / -1; }
  .fin-filters .app-btn { width: auto; }
  .fin-form { grid-template-columns: 1fr 1fr; }
  .fin-field--wide { grid-column: 1 / -1; }
  .fin-access-add { flex-direction: row; }
  .fin-access-add .app-select,
  .fin-access-add .app-input { flex: 1 1 auto; }
  .fin-access-add .app-btn { width: auto; flex: 0 0 auto; }
}

@media (min-width: 900px) {
  .fin-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
  .fin-grid--wide { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fin-grid--wide .fin-span2 { grid-column: span 2; }
}
</style>
