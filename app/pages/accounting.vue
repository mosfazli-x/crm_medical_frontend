<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Access gate ─── -->
    <div v-if="!isAllowed" class="asa-card pf-empty">
      <div class="asa-tint asa-tint--rose pf-tint-lg">
        <Security class="w-6! h-6! fill-current" />
      </div>
      <div>
        <p class="pf-empty__title">{{ t('accounting.deniedTitle') }}</p>
        <p class="pf-empty__desc">{{ t('accounting.deniedDesc') }}</p>
      </div>
      <div class="pf-empty__actions">
        <NuxtLink to="/dashboard" class="asa-btn asa-btn--ghost asa-btn--sm">
          <span>{{ t('dashboard.title') }}</span>
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- ─── Large-title header ─── -->
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('accounting.title') }}</h1>
          <p class="dash-head__date">{{ t('accounting.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <button
            class="asa-btn asa-btn--ghost"
            :disabled="refreshing"
            :aria-label="t('common.refresh')"
            :title="t('common.refresh')"
            @click="refreshActive"
          >
            <v-icon size="16" :class="{ 'pf-spin': refreshing }">mdi-refresh</v-icon>
          </button>
          <button v-if="isAdmin && primaryAction" class="asa-btn asa-btn--primary" @click="primaryAction.run">
            <component :is="primaryAction.icon" class="w-4! h-4! stroke-current" />
            <span>{{ primaryAction.label }}</span>
          </button>
        </div>
      </header>

      <!-- ─── Read-only notice for physicians ─── -->
      <div v-if="!isAdmin" class="asa-alert acc-alert mt-4!" role="status">
        <div class="asa-alert__body">
          <p class="asa-alert__title">{{ t('accounting.readOnlyTitle') }}</p>
          <p class="asa-alert__desc">{{ t('accounting.readOnlyDesc') }}</p>
        </div>
      </div>

      <!-- ─── Summary metrics: report summary when a report is open ─── -->
      <div v-if="showReportMetrics" class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4! mt-5!">
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--green">
            <Wallet class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm">
              <UiPrice :value="report?.summary.totalRevenue" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('accounting.totalRevenue') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--rose">
            <Activity class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm acc-rose">
              <UiPrice :value="report?.summary.totalExpense" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('accounting.totalExpense') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint" :class="netPositive ? 'asa-tint--green' : 'asa-tint--rose'">
            <Calculator class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm" :class="netPositive ? 'asa-green' : 'acc-rose'">
              <UiPrice :value="report?.summary.netIncome" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('accounting.netIncome') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--amber">
            <FileText class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(report?.summary.transactionCount || 0) }}</p>
            <p class="pf-metric__label">{{ t('accounting.transactionCount') }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Summary metrics: ledger overview ─── -->
      <div v-else class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4! mt-5!">
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--teal">
            <BookOpen class="w-5! h-5! fill-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(accounts.length) }}</p>
            <p class="pf-metric__label">{{ t('accounting.accountsCount', { count: pn(accounts.length) }) }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--indigo">
            <FileText class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(journalEntries.length) }}</p>
            <p class="pf-metric__label">{{ t('accounting.entriesCount', { count: pn(journalEntries.length) }) }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--green">
            <ArrowRightLeft class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm">
              <UiPrice :value="ledgerDebits" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('accounting.debitVolume') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--amber">
            <Wallet class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm">
              <UiPrice :value="ledgerCredits" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('accounting.creditVolume') }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Section switcher ─── -->
      <div class="acc-tabs">
        <div class="pf-seg acc-seg" role="tablist" :aria-label="t('accounting.title')">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="pf-seg__btn"
            :class="{ 'pf-seg__btn--on': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.label }}</span>
            <span v-if="tab.count !== null" class="pf-seg__count">{{ pn(tab.count) }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Chart of accounts ─── -->
      <div v-if="activeTab === 'accounts'" class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="accountQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('accounting.searchAccounts')"
              :aria-label="t('accounting.searchAccounts')"
            >
            <button
              v-if="accountQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="accountQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>

          <div class="pf-seg acc-seg" role="group" :aria-label="t('accounting.type')">
            <button
              v-for="seg in accountTypeSegments"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': accountTypeFilter === seg.value }"
              :aria-pressed="accountTypeFilter === seg.value"
              @click="accountTypeFilter = seg.value"
            >
              <span>{{ seg.label }}</span>
              <span class="pf-seg__count">{{ pn(seg.count) }}</span>
            </button>
          </div>

          <div class="pf-toolbar__tail">
            <span class="pf-toolbar__count">
              {{ t('accounting.accountsCount', { count: pn(visibleAccounts.length) }) }}
            </span>
          </div>
        </div>

        <div v-if="accountsLoading" class="pf-skel">
          <div v-for="i in 6" :key="`acc-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-16! rounded-md!" />
            <div class="asa-skel h-4! w-48! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
          </div>
        </div>

        <div v-else-if="accountsFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('accounting.accountsLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('accounting.retryDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchAccounts">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleAccounts.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <BookOpen class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasAccountFilters ? t('accounting.noMatchingAccounts') : t('accounting.noAccounts') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasAccountFilters ? t('accounting.clearFiltersDesc') : t('accounting.noAccountsDesc') }}
            </p>
          </div>
          <div class="pf-empty__actions">
            <button v-if="hasAccountFilters" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearAccountFilters">
              {{ t('accounting.clearFilters') }}
            </button>
            <template v-else-if="isAdmin">
              <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="seedAccounts">
                {{ t('accounting.seedAccounts') }}
              </button>
              <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openAccountDialog()">
                {{ t('accounting.addAccount') }}
              </button>
            </template>
          </div>
        </div>

        <template v-else>
          <div class="acc-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('accounting.code') }}</th>
                  <th>{{ t('accounting.accountName') }}</th>
                  <th>{{ t('accounting.type') }}</th>
                  <th v-if="isAdmin" class="pf-ta-end">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in pagedAccounts" :key="account.id">
                  <td>
                    <span class="acc-code" dir="ltr">{{ account.code }}</span>
                  </td>
                  <td>
                    <div class="acc-cell">
                      <span class="acc-cell__name">{{ account.name }}</span>
                      <span v-if="account.description" class="acc-cell__sub">{{ account.description }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="asa-pill" :class="typePill(account.type)">
                      {{ t(`accounting.types.${account.type}`) }}
                    </span>
                  </td>
                  <td v-if="isAdmin" class="pf-ta-end">
                    <div class="acc-actions">
                      <button
                        class="pf-icon-btn"
                        type="button"
                        :title="t('common.edit')"
                        :aria-label="t('common.edit')"
                        @click="openAccountDialog(account)"
                      >
                        <Pencil class="w-4! h-4! stroke-current" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="accounts.length" class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('accounting.showing', { shown: pn(visibleAccounts.length), total: pn(accounts.length) }) }}
            </p>
            <v-pagination
              v-if="accountPages > 1"
              v-model="accountPage"
              :length="accountPages"
              :total-visible="5"
              density="comfortable"
              color="#5f8feb"
              rounded="circle"
            />
          </div>
        </template>
      </div>

      <!-- ─── Journal entries ─── -->
      <div v-else-if="activeTab === 'journal'" class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="entryQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('accounting.searchEntries')"
              :aria-label="t('accounting.searchEntries')"
            >
            <button
              v-if="entryQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="entryQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>

          <div class="pf-toolbar__tail acc-dates">
            <div class="acc-date">
              <label class="asa-field-label" for="acc-from">{{ t('accounting.startDate') }}</label>
              <v-text-field
                id="acc-from"
                v-model="entryFrom"
                type="date"
                variant="solo"
                density="compact"
                hide-details
                clearable
              />
            </div>
            <div class="acc-date">
              <label class="asa-field-label" for="acc-to">{{ t('accounting.endDate') }}</label>
              <v-text-field
                id="acc-to"
                v-model="entryTo"
                type="date"
                variant="solo"
                density="compact"
                hide-details
                clearable
              />
            </div>
          </div>
        </div>

        <div v-if="journalLoading" class="pf-skel">
          <div v-for="i in 6" :key="`je-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-28! rounded-md!" />
            <div class="asa-skel h-4! w-40! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
          </div>
        </div>

        <div v-else-if="journalFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('accounting.entriesLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('accounting.retryDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchJournalEntries">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleEntries.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <FileText class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasEntryFilters ? t('accounting.noMatchingEntries') : t('accounting.noEntries') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasEntryFilters ? t('accounting.clearFiltersDesc') : t('accounting.noEntriesDesc') }}
            </p>
          </div>
          <div class="pf-empty__actions">
            <button v-if="hasEntryFilters" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearEntryFilters">
              {{ t('accounting.clearFilters') }}
            </button>
            <button v-else-if="isAdmin" class="asa-btn asa-btn--primary asa-btn--sm" @click="openJournalDialog">
              {{ t('accounting.newJournalEntry') }}
            </button>
          </div>
        </div>

        <template v-else>
          <div class="acc-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('accounting.entryNumber') }}</th>
                  <th>{{ t('accounting.date') }}</th>
                  <th>{{ t('accounting.description') }}</th>
                  <th class="pf-ta-end acc-hide-sm">{{ t('accounting.journalLines') }}</th>
                  <th class="pf-ta-end">{{ t('accounting.debit') }}</th>
                  <th class="pf-ta-end">{{ t('accounting.credit') }}</th>
                  <th class="pf-ta-end">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in pagedEntries"
                  :key="entry.id"
                  class="acc-row--click"
                  @click="openEntryDetail(entry)"
                >
                  <td>
                    <span class="acc-code" dir="ltr">{{ entry.entryNumber }}</span>
                  </td>
                  <td>
                    <span class="pf-tiny">{{ formatJalaliDate(entry.entryDate) }}</span>
                  </td>
                  <td>
                    <div class="acc-cell">
                      <span class="acc-cell__name">{{ entry.description }}</span>
                      <span v-if="entry.reference" class="acc-cell__sub">
                        {{ entry.reference }}<template v-if="entry.referenceType"> · {{ entry.referenceType }}</template>
                      </span>
                    </div>
                  </td>
                  <td class="pf-ta-end acc-hide-sm">
                    <span class="pf-tiny">{{ pn(Number(entry.lineCount) || 0) }}</span>
                  </td>
                  <td class="pf-ta-end">
                    <UiPrice :value="entry.totalDebit" :show-words="false" />
                  </td>
                  <td class="pf-ta-end">
                    <UiPrice :value="entry.totalCredit" :show-words="false" />
                  </td>
                  <td class="pf-ta-end">
                    <div class="acc-actions">
                      <button
                        class="pf-icon-btn"
                        type="button"
                        :title="t('accounting.journalEntryDetails')"
                        :aria-label="t('accounting.journalEntryDetails')"
                        @click.stop="openEntryDetail(entry)"
                      >
                        <Eye class="w-4! h-4! stroke-current" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="journalEntries.length" class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('accounting.showing', { shown: pn(visibleEntries.length), total: pn(journalEntries.length) }) }}
            </p>
            <v-pagination
              v-if="entryPages > 1"
              v-model="entryPage"
              :length="entryPages"
              :total-visible="5"
              density="comfortable"
              color="#5f8feb"
              rounded="circle"
            />
          </div>
        </template>
      </div>

      <!-- ─── Reports (clinic managers only) ─── -->
      <div v-else-if="isAdmin" class="space-y-4!">
        <div class="asa-card acc-report-bar">
          <div class="pf-seg acc-seg" role="group" :aria-label="t('accounting.period')">
            <button
              v-for="seg in reportPeriods"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': reportPeriod === seg.value }"
              :aria-pressed="reportPeriod === seg.value"
              @click="reportPeriod = seg.value"
            >
              <span>{{ seg.label }}</span>
            </button>
          </div>

          <div v-if="reportPeriod === 'custom'" class="acc-dates">
            <div class="acc-date">
              <label class="asa-field-label" for="acc-cfrom">{{ t('accounting.startDate') }}</label>
              <v-text-field id="acc-cfrom" v-model="customFrom" type="date" variant="solo" density="compact" hide-details />
            </div>
            <div class="acc-date">
              <label class="asa-field-label" for="acc-cto">{{ t('accounting.endDate') }}</label>
              <v-text-field id="acc-cto" v-model="customTo" type="date" variant="solo" density="compact" hide-details />
            </div>
          </div>
        </div>

        <div v-if="reportLoading" class="space-y-4!" aria-busy="true">
          <div class="asa-card h-40 rounded-[22px] asa-skel" />
          <div class="asa-card h-64 rounded-[22px] asa-skel" />
        </div>

        <div v-else-if="reportFailed" class="asa-card pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('accounting.reportLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('accounting.retryDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="loadReport">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <template v-else-if="report">
          <p class="acc-range">
            {{ t('accounting.reportRange', { start: formatJalaliDate(report.startDate), end: formatJalaliDate(report.endDate) }) }}
          </p>

          <div class="grid! grid-cols-1! gap-4! lg:grid-cols-3!">
            <article class="asa-card lg:col-span-2">
              <div class="acc-sec-head">
                <div>
                  <h2 class="asa-card-title">{{ t('accounting.incomeStatement') }}</h2>
                  <p class="asa-card-sub">{{ t('accounting.reportRange', { start: formatJalaliDate(report.incomeStatement.startDate), end: formatJalaliDate(report.incomeStatement.endDate) }) }}</p>
                </div>
              </div>

              <div class="acc-group">
                <p class="acc-group__label asa-green">
                  <ArrowRightLeft class="w-4! h-4! stroke-current" />
                  <span>{{ t('accounting.revenues') }}</span>
                </p>
                <div v-if="report.incomeStatement.revenue.accounts.length" class="acc-list">
                  <div v-for="row in report.incomeStatement.revenue.accounts" :key="row.id" class="acc-list__row">
                    <span class="acc-list__name"><span class="acc-code" dir="ltr">{{ row.code }}</span>{{ row.name }}</span>
                    <UiPrice :value="row.balance" :show-words="false" />
                  </div>
                </div>
                <p v-else class="pf-tiny acc-none">{{ t('accounting.noReportData') }}</p>
                <div class="acc-total">
                  <span>{{ t('accounting.totalRevenue') }}</span>
                  <UiPrice :value="report.incomeStatement.revenue.total" :show-words="false" />
                </div>
              </div>

              <div class="acc-group">
                <p class="acc-group__label acc-rose">
                  <Activity class="w-4! h-4! stroke-current" />
                  <span>{{ t('accounting.expenses') }}</span>
                </p>
                <div v-if="report.incomeStatement.expense.accounts.length" class="acc-list">
                  <div v-for="row in report.incomeStatement.expense.accounts" :key="row.id" class="acc-list__row">
                    <span class="acc-list__name"><span class="acc-code" dir="ltr">{{ row.code }}</span>{{ row.name }}</span>
                    <UiPrice :value="row.balance" :show-words="false" />
                  </div>
                </div>
                <p v-else class="pf-tiny acc-none">{{ t('accounting.noReportData') }}</p>
                <div class="acc-total">
                  <span>{{ t('accounting.totalExpense') }}</span>
                  <UiPrice :value="report.incomeStatement.expense.total" :show-words="false" />
                </div>
              </div>

              <div class="acc-net" :class="netPositive ? 'acc-net--up' : 'acc-net--down'">
                <span>{{ t('accounting.netIncome') }}</span>
                <UiPrice :value="report.incomeStatement.netIncome" :show-words="false" />
              </div>
            </article>

            <article class="asa-card">
              <div class="acc-sec-head">
                <div>
                  <h2 class="asa-card-title">{{ t('accounting.balanceSheet') }}</h2>
                  <p class="asa-card-sub">
                    {{ t('accounting.asOfDate', { date: formatJalaliDate(balanceSheet?.asOfDate || report.endDate) }) }}
                  </p>
                </div>
              </div>

              <template v-if="balanceSheet">
                <div v-for="group in balanceGroups" :key="group.key" class="acc-group">
                  <p class="acc-group__label" :class="group.tone">
                    <span>{{ t(`accounting.${group.key}`) }}</span>
                  </p>
                  <div v-if="group.rows.length" class="acc-list">
                    <div v-for="row in group.rows" :key="row.id" class="acc-list__row">
                      <span class="acc-list__name"><span class="acc-code" dir="ltr">{{ row.code }}</span>{{ row.name }}</span>
                      <UiPrice :value="row.balance" :show-words="false" />
                    </div>
                  </div>
                  <p v-else class="pf-tiny acc-none">{{ t('accounting.noReportData') }}</p>
                  <div class="acc-total">
                    <span>{{ t(`accounting.${group.key}`) }}</span>
                    <UiPrice :value="group.total" :show-words="false" />
                  </div>
                </div>
              </template>
              <p v-else class="pf-tiny acc-none">{{ t('accounting.noReportData') }}</p>
            </article>
          </div>

          <div class="asa-card pf-table-card">
            <div class="acc-sec-head !px-4 !pt-4">
              <div>
                <h2 class="asa-card-title">{{ t('accounting.trialBalance') }}</h2>
                <p class="asa-card-sub">{{ t('accounting.lineCount', { count: pn(report.trialBalance.length) }) }}</p>
              </div>
            </div>

            <div v-if="report.trialBalance.length" class="acc-table-wrap asa-table-wrap">
              <table class="pf-table">
                <thead>
                  <tr>
                    <th>{{ t('accounting.code') }}</th>
                    <th>{{ t('accounting.accountName') }}</th>
                    <th class="acc-hide-sm">{{ t('accounting.accountType') }}</th>
                    <th class="pf-ta-end">{{ t('accounting.debit') }}</th>
                    <th class="pf-ta-end">{{ t('accounting.credit') }}</th>
                    <th class="pf-ta-end">{{ t('accounting.balance') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in report.trialBalance" :key="row.id">
                    <td><span class="acc-code" dir="ltr">{{ row.code }}</span></td>
                    <td>{{ row.name }}</td>
                    <td class="acc-hide-sm">
                      <span class="asa-pill" :class="typePill(row.type)">{{ t(`accounting.types.${row.type}`) }}</span>
                    </td>
                    <td class="pf-ta-end"><UiPrice :value="row.totalDebit" :show-words="false" /></td>
                    <td class="pf-ta-end"><UiPrice :value="row.totalCredit" :show-words="false" /></td>
                    <td class="pf-ta-end" :class="Number(row.balance) < 0 ? 'acc-rose' : ''">
                      <UiPrice :value="row.balance" :show-words="false" />
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th :colspan="3" class="pf-ta-end">{{ t('accounting.difference') }}</th>
                    <th class="pf-ta-end"><UiPrice :value="trialDebits" :show-words="false" /></th>
                    <th class="pf-ta-end"><UiPrice :value="trialCredits" :show-words="false" /></th>
                    <th class="pf-ta-end" :class="Math.abs(trialDifference) > 0.001 ? 'acc-rose' : 'asa-green'">
                      <UiPrice :value="trialDifference" :show-words="false" />
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div v-else class="pf-empty">
              <div class="asa-tint asa-tint--indigo pf-tint-lg">
                <Calculator class="w-6! h-6! stroke-current" />
              </div>
              <div>
                <p class="pf-empty__title">{{ t('accounting.trialBalance') }}</p>
                <p class="pf-empty__desc">{{ t('accounting.noReportData') }}</p>
              </div>
            </div>
          </div>

          <div v-if="report.entries.length" class="asa-card pf-table-card">
            <div class="acc-sec-head !px-4 !pt-4">
              <div>
                <h2 class="asa-card-title">{{ t('accounting.recentTransactions') }}</h2>
                <p class="asa-card-sub">{{ t('accounting.entriesCount', { count: pn(report.entries.length) }) }}</p>
              </div>
            </div>

            <div class="acc-table-wrap asa-table-wrap">
              <table class="pf-table">
                <thead>
                  <tr>
                    <th>{{ t('accounting.entryNumber') }}</th>
                    <th>{{ t('accounting.date') }}</th>
                    <th>{{ t('accounting.description') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in report.entries.slice(0, 10)" :key="entry.id">
                    <td><span class="acc-code" dir="ltr">{{ entry.entryNumber }}</span></td>
                    <td><span class="pf-tiny">{{ formatJalaliDate(entry.entryDate) }}</span></td>
                    <td>{{ entry.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- ─── Account dialog ─── -->
    <v-dialog v-model="accountDialog" max-width="560" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">
              {{ editingAccount ? t('accounting.editAccount') : t('accounting.addAccount') }}
            </h2>
            <span class="asa-dialog__sub">{{ t('accounting.accountFormSub') }}</span>
          </div>
          <button class="pf-icon-btn" type="button" :aria-label="t('common.close')" @click="accountDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="acc-form">
            <div class="acc-field">
              <label class="asa-field-label" for="acc-code">{{ t('accounting.code') }} *</label>
              <v-text-field
                id="acc-code"
                v-model="accountForm.code"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                dir="ltr"
                :placeholder="t('accounting.codePlaceholder')"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openAccountHw('code')"
              />
            </div>

            <div class="acc-field">
              <label class="asa-field-label">{{ t('accounting.type') }} *</label>
              <v-select
                v-model="accountForm.type"
                :items="accountTypeOptions"
                item-title="label"
                item-value="value"
                variant="solo"
                density="comfortable"
                hide-details
              />
            </div>

            <div class="acc-field acc-field--full">
              <label class="asa-field-label" for="acc-name">{{ t('accounting.accountName') }} *</label>
              <v-text-field
                id="acc-name"
                v-model="accountForm.name"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                :placeholder="t('accounting.namePlaceholder')"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openAccountHw('name')"
              />
            </div>

            <div class="acc-field acc-field--full">
              <label class="asa-field-label" for="acc-desc">{{ t('common.notes') }}</label>
              <v-textarea
                id="acc-desc"
                v-model="accountForm.description"
                variant="solo"
                density="comfortable"
                rows="2"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openAccountHw('description')"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingAccount" @click="accountDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingAccount" @click="saveAccount">
            <v-icon v-if="savingAccount" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ t('common.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Journal entry dialog ─── -->
    <v-dialog v-model="journalDialog" max-width="880" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('accounting.newJournalEntry') }}</h2>
            <span class="asa-dialog__sub">{{ t('accounting.entryFormSub') }}</span>
          </div>
          <button class="pf-icon-btn" type="button" :aria-label="t('common.close')" @click="journalDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="acc-form">
            <div class="acc-field">
              <label class="asa-field-label" for="je-date">{{ t('accounting.date') }} *</label>
              <v-text-field id="je-date" v-model="journalForm.entry_date" type="date" variant="solo" density="comfortable" hide-details />
            </div>
            <div class="acc-field">
              <label class="asa-field-label" for="je-ref">{{ t('accounting.reference') }}</label>
              <v-text-field
                id="je-ref"
                v-model="journalForm.reference"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                :placeholder="t('accounting.referencePlaceholder')"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openJournalHw('reference')"
              />
            </div>
            <div class="acc-field acc-field--full">
              <label class="asa-field-label" for="je-desc">{{ t('accounting.description') }} *</label>
              <v-textarea
                id="je-desc"
                v-model="journalForm.description"
                variant="solo"
                density="comfortable"
                rows="2"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openJournalHw('description')"
              />
            </div>
          </div>

          <div class="acc-lines">
            <div class="acc-lines__head">
              <h3 class="asa-card-title !text-sm!">{{ t('accounting.journalLines') }}</h3>
              <button class="asa-btn asa-btn--ghost asa-btn--sm" type="button" @click="addJournalLine">
                <Plus class="w-4! h-4! stroke-current" />
                <span>{{ t('accounting.addLine') }}</span>
              </button>
            </div>

            <div v-if="!accountFormOptions.length" class="pf-tiny acc-none">
              {{ t('accounting.noAccountsDesc') }}
            </div>

            <div v-for="(line, idx) in journalForm.lines" :key="idx" class="acc-line">
              <div class="acc-line__account">
                <label class="asa-field-label">{{ t('accounting.account') }} *</label>
                <v-select
                  v-model="line.account_id"
                  :items="accountFormOptions"
                  item-title="title"
                  item-value="value"
                  variant="solo"
                  density="compact"
                  hide-details
                />
              </div>
              <div class="acc-line__amount">
                <label class="asa-field-label">{{ t('accounting.debit') }}</label>
                <v-text-field v-model="line.debit" type="number" min="0" variant="solo" density="compact" hide-details dir="ltr" />
              </div>
              <div class="acc-line__amount">
                <label class="asa-field-label">{{ t('accounting.credit') }}</label>
                <v-text-field v-model="line.credit" type="number" min="0" variant="solo" density="compact" hide-details dir="ltr" />
              </div>
              <div class="acc-line__note">
                <label class="asa-field-label">{{ t('accounting.lineDescription') }}</label>
                <v-text-field v-model="line.description" variant="solo" density="compact" hide-details clearable />
              </div>
              <button
                class="pf-icon-btn pf-icon-btn--danger acc-line__remove"
                type="button"
                :disabled="journalForm.lines.length <= 2"
                :title="t('accounting.removeLine')"
                :aria-label="t('accounting.removeLine')"
                @click="removeJournalLine(idx)"
              >
                <TrashBin class="w-4! h-4! stroke-current" />
              </button>
            </div>

            <div class="acc-balance" :class="isBalanced ? 'acc-balance--ok' : 'acc-balance--bad'">
              <span class="acc-balance__label">
                <CheckCircle v-if="isBalanced" class="w-4! h-4! fill-current" />
                <CloseCircle v-else class="w-4! h-4! fill-current" />
                {{ isBalanced ? t('accounting.balanced') : t('accounting.unbalanced') }}
              </span>
              <span class="acc-balance__value" dir="ltr">
                {{ formatPrice(Math.abs(journalBalance)) }}
              </span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingJournal" @click="journalDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingJournal" @click="saveJournalEntry">
            <v-icon v-if="savingJournal" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ t('common.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Journal entry detail ─── -->
    <v-dialog v-model="entryDialog" max-width="720" scrollable>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('accounting.journalEntryDetails') }}</h2>
            <span v-if="entryDetail" class="asa-dialog__sub">
              <span dir="ltr">{{ entryDetail.entryNumber }}</span> · {{ formatJalaliDate(entryDetail.entryDate) }}
            </span>
          </div>
          <button class="pf-icon-btn" type="button" :aria-label="t('common.close')" @click="entryDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="entryLoading" class="pf-skel">
            <div v-for="i in 4" :key="`ed-sk-${i}`" class="pf-skel__row">
              <div class="asa-skel h-4! w-full! rounded-md!" />
            </div>
          </div>

          <div v-else-if="entryFailed" class="pf-empty">
            <div class="asa-tint asa-tint--rose pf-tint-lg">
              <X class="w-6! h-6! stroke-current" />
            </div>
            <div>
              <p class="pf-empty__title">{{ t('accounting.entriesLoadError') }}</p>
              <p class="pf-empty__desc">{{ t('accounting.retryDesc') }}</p>
            </div>
          </div>

          <template v-else-if="entryDetail">
            <div class="pf-info-grid">
              <div class="pf-info-cell">
                <span class="pf-info-label">{{ t('accounting.entryNumber') }}</span>
                <span class="pf-info-value" dir="ltr">{{ entryDetail.entryNumber }}</span>
              </div>
              <div class="pf-info-cell">
                <span class="pf-info-label">{{ t('accounting.date') }}</span>
                <span class="pf-info-value">{{ formatJalaliDate(entryDetail.entryDate) }}</span>
              </div>
              <div class="pf-info-cell">
                <span class="pf-info-label">{{ t('common.status') }}</span>
                <span class="pf-info-value">
                  <span class="asa-pill asa-pill--green">{{ statusLabel(entryDetail.status) }}</span>
                </span>
              </div>
              <div v-if="entryDetail.reference" class="pf-info-cell">
                <span class="pf-info-label">{{ t('accounting.reference') }}</span>
                <span class="pf-info-value">
                  {{ entryDetail.reference }}
                  <span v-if="entryDetail.referenceType" class="pf-tiny"> · {{ entryDetail.referenceType }}</span>
                </span>
              </div>
              <div class="pf-info-cell pf-info-cell--full">
                <span class="pf-info-label">{{ t('accounting.description') }}</span>
                <span class="pf-info-value">{{ entryDetail.description }}</span>
              </div>
            </div>

            <div class="acc-table-wrap asa-table-wrap mt-4!">
              <table class="pf-table">
                <thead>
                  <tr>
                    <th>{{ t('accounting.accountCode') }}</th>
                    <th>{{ t('accounting.accountName') }}</th>
                    <th class="pf-ta-end">{{ t('accounting.debit') }}</th>
                    <th class="pf-ta-end">{{ t('accounting.credit') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in entryDetail.lines" :key="line.id">
                    <td><span class="acc-code" dir="ltr">{{ line.accountCode || '—' }}</span></td>
                    <td>
                      <div class="acc-cell">
                        <span class="acc-cell__name">{{ line.accountName || '—' }}</span>
                        <span v-if="line.description" class="acc-cell__sub">{{ line.description }}</span>
                      </div>
                    </td>
                    <td class="pf-ta-end"><UiPrice :value="line.debit" :show-words="false" /></td>
                    <td class="pf-ta-end"><UiPrice :value="line.credit" :show-words="false" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="accountOpen" :label="accountLabel" :numeric="accountNumeric" @insert="applyAccountHw" />
    <HandwritingDialog v-model="journalOpen" :label="journalLabel" :numeric="journalNumeric" @insert="applyJournalHw" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Activity from '~/components/icons/Activity.vue'
import ArrowRightLeft from '~/components/icons/ArrowRightLeft.vue'
import BookOpen from '~/components/icons/BookOpen.vue'
import Calculator from '~/components/icons/Calculator.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import Eye from '~/components/icons/Eye.vue'
import FileText from '~/components/icons/FileText.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Pencil from '~/components/icons/Pencil.vue'
import Plus from '~/components/icons/Plus.vue'
import Security from '~/components/icons/Security.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import Wallet from '~/components/icons/Wallet.vue'
import X from '~/components/icons/X.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import { useFormatting } from '~/composables/useFormatting'

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom'
type TabKey = 'accounts' | 'journal' | 'reports'
type TypeFilter = AccountType | 'all'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface AccountRow {
  id: string
  code: string
  name: string
  type: AccountType
  parentId: string | null
  description: string | null
  isActive: boolean | null
  createdAt: string
  updatedAt: string
}

interface JournalListRow {
  id: string
  entryNumber: string
  entryDate: string
  description: string
  reference: string | null
  referenceType: string | null
  status: string
  createdAt: string
  createdBy: string | null
  lineCount: number | string
  totalDebit: string
  totalCredit: string
}

interface JournalLineRow {
  id: string
  accountId: string
  accountCode: string | null
  accountName: string | null
  accountType: AccountType | null
  debit: string
  credit: string
  description: string | null
}

interface JournalDetailRow {
  id: string
  entryNumber: string
  entryDate: string
  description: string
  reference: string | null
  referenceType: string | null
  status: string
  createdById: string | null
  createdAt: string
  updatedAt: string
  lines: JournalLineRow[]
}

interface ReportAccountRow {
  id: string
  code: string
  name: string
  balance: string
}

interface ReportSection {
  accounts: ReportAccountRow[]
  total: number
}

interface IncomeStatement {
  startDate: string
  endDate: string
  revenue: ReportSection
  expense: ReportSection
  netIncome: number
}

interface TrialRow {
  id: string
  code: string
  name: string
  type: AccountType
  totalDebit: string
  totalCredit: string
  balance: string
}

interface PeriodReport {
  period: ReportPeriod
  startDate: string
  endDate: string
  generatedAt: string
  summary: {
    totalRevenue: number
    totalExpense: number
    netIncome: number
    transactionCount: number
  }
  entries: { id: string; entryNumber: string; entryDate: string; description: string; status: string }[]
  incomeStatement: IncomeStatement
  trialBalance: TrialRow[]
}

interface BalanceSheet {
  asOfDate: string
  assets: ReportSection
  liabilities: ReportSection
  equity: ReportSection
}

interface JournalFormLine {
  account_id: string
  debit: string
  credit: string
  description: string
}

definePageMeta({ roles: ['admin_doctor', 'doctor'] })

const { t, te } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()
const { formatJalaliDate, formatPrice, toDateStr } = useFormatting()

const PAGE_SIZE = 15
const ACCOUNT_TYPES: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense']

/* ── Access ─────────────────────────────────────────── */
const role = computed(() => user.value?.role || '')
const isAdmin = computed(() => role.value === 'admin_doctor')
const isAllowed = computed(() => isAdmin.value || role.value === 'doctor')
/** Reports are admin-only on the backend: a doctor hitting them would be bounced to the dashboard. */
const canViewReports = computed(() => isAdmin.value)

/* ── Data ───────────────────────────────────────────── */
const accounts = ref<AccountRow[]>([])
const journalEntries = ref<JournalListRow[]>([])

const accountsLoading = ref(false)
const accountsFailed = ref(false)
const journalLoading = ref(false)
const journalFailed = ref(false)
const refreshing = ref(false)

/* ── Tabs & filters ──────────────────────────────────── */
const activeTab = ref<TabKey>('accounts')
const accountQuery = ref('')
const accountTypeFilter = ref<TypeFilter>('all')
const accountPage = ref(1)

const entryQuery = ref('')
const entryFrom = ref<string | null>(null)
const entryTo = ref<string | null>(null)
const entryPage = ref(1)

const reportPeriod = ref<ReportPeriod>('monthly')
const customFrom = ref('')
const customTo = ref('')
const report = ref<PeriodReport | null>(null)
const balanceSheet = ref<BalanceSheet | null>(null)
const reportLoading = ref(false)
const reportFailed = ref(false)

/* ── Dialogs ────────────────────────────────────────── */
const accountDialog = ref(false)
const savingAccount = ref(false)
const editingAccount = ref<AccountRow | null>(null)
const accountForm = ref({ code: '', name: '', type: '' as AccountType | '', description: '' })

const journalDialog = ref(false)
const savingJournal = ref(false)
const journalForm = ref({
  entry_date: '',
  description: '',
  reference: '',
  lines: [] as JournalFormLine[],
})

const entryDialog = ref(false)
const entryLoading = ref(false)
const entryFailed = ref(false)
const entryDetail = ref<JournalDetailRow | null>(null)

/* ── Derived: tabs ──────────────────────────────────── */
const tabs = computed(() => {
  const list: { key: TabKey; label: string; count: number | null }[] = [
    { key: 'accounts', label: t('accounting.tabs.accounts'), count: accounts.value.length },
    { key: 'journal', label: t('accounting.tabs.journal'), count: journalEntries.value.length },
  ]
  if (canViewReports.value) {
    list.push({ key: 'reports', label: t('accounting.tabs.reports'), count: null })
  }
  return list
})

const primaryAction = computed(() => {
  if (!isAdmin.value) return null
  if (activeTab.value === 'journal') {
    return { label: t('accounting.newJournalEntry'), icon: Plus, run: openJournalDialog }
  }
  if (activeTab.value === 'reports') return null
  return { label: t('accounting.addAccount'), icon: Plus, run: () => openAccountDialog() }
})

/* ── Derived: accounts ──────────────────────────────── */
const accountTypeOptions = computed(() =>
  ACCOUNT_TYPES.map((value) => ({ value, label: t(`accounting.types.${value}`) })),
)

const accountTypeSegments = computed(() => [
  { value: 'all' as TypeFilter, label: t('accounting.allTypes'), count: accounts.value.length },
  ...ACCOUNT_TYPES.map((value) => ({
    value: value as TypeFilter,
    label: t(`accounting.types.${value}`),
    count: accounts.value.filter((a) => a.type === value).length,
  })),
])

const accountFormOptions = computed(() =>
  [...accounts.value]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((a) => ({ value: a.id, title: `${a.code} - ${a.name}` })),
)

const hasAccountFilters = computed(() => accountQuery.value.trim() !== '' || accountTypeFilter.value !== 'all')

const visibleAccounts = computed(() => {
  const q = accountQuery.value.trim().toLowerCase()
  return accounts.value.filter((account) => {
    if (accountTypeFilter.value !== 'all' && account.type !== accountTypeFilter.value) return false
    if (!q) return true
    return (
      account.code.toLowerCase().includes(q) ||
      account.name.toLowerCase().includes(q) ||
      (account.description || '').toLowerCase().includes(q)
    )
  })
})

const accountPages = computed(() => Math.max(1, Math.ceil(visibleAccounts.value.length / PAGE_SIZE)))
const pagedAccounts = computed(() => {
  const start = (accountPage.value - 1) * PAGE_SIZE
  return visibleAccounts.value.slice(start, start + PAGE_SIZE)
})

const ledgerDebits = computed(() => journalEntries.value.reduce((sum, e) => sum + toNum(e.totalDebit), 0))
const ledgerCredits = computed(() => journalEntries.value.reduce((sum, e) => sum + toNum(e.totalCredit), 0))

/* ── Derived: journal entries ───────────────────────── */
const hasEntryFilters = computed(
  () => entryQuery.value.trim() !== '' || !!entryFrom.value || !!entryTo.value,
)

const visibleEntries = computed(() => {
  const q = entryQuery.value.trim().toLowerCase()
  return journalEntries.value.filter((entry) => {
    if (entryFrom.value && entry.entryDate < entryFrom.value) return false
    if (entryTo.value && entry.entryDate > entryTo.value) return false
    if (!q) return true
    return (
      entry.entryNumber.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      (entry.reference || '').toLowerCase().includes(q)
    )
  })
})

const entryPages = computed(() => Math.max(1, Math.ceil(visibleEntries.value.length / PAGE_SIZE)))
const pagedEntries = computed(() => {
  const start = (entryPage.value - 1) * PAGE_SIZE
  return visibleEntries.value.slice(start, start + PAGE_SIZE)
})

const journalTotals = computed(() => {
  let debit = 0
  let credit = 0
  for (const line of journalForm.value.lines) {
    debit += toNum(line.debit)
    credit += toNum(line.credit)
  }
  return { debit, credit }
})
const journalBalance = computed(() => journalTotals.value.debit - journalTotals.value.credit)
const isBalanced = computed(() => Math.abs(journalBalance.value) < 0.001)

/* ── Derived: reports ───────────────────────────────── */
const showReportMetrics = computed(() => activeTab.value === 'reports' && !!report.value)

const netPositive = computed(() => (report.value?.summary.netIncome ?? 0) >= 0)

const reportPeriods = computed(() =>
  (['daily', 'weekly', 'monthly', 'annual', 'custom'] as ReportPeriod[]).map((value) => ({
    value,
    label: t(`accounting.periods.${value}`),
  })),
)

const balanceGroups = computed(() => {
  const sheet = balanceSheet.value
  if (!sheet) return []
  return [
    { key: 'assets' as const, tone: 'asa-green', rows: sheet.assets.accounts, total: sheet.assets.total },
    { key: 'liabilities' as const, tone: 'asa-amber', rows: sheet.liabilities.accounts, total: sheet.liabilities.total },
    { key: 'equity' as const, tone: 'asa-indigo', rows: sheet.equity.accounts, total: sheet.equity.total },
  ]
})

const trialDebits = computed(() =>
  (report.value?.trialBalance ?? []).reduce((sum, row) => sum + toNum(row.totalDebit), 0),
)
const trialCredits = computed(() =>
  (report.value?.trialBalance ?? []).reduce((sum, row) => sum + toNum(row.totalCredit), 0),
)
const trialDifference = computed(() => trialDebits.value - trialCredits.value)

/* ── Helpers ────────────────────────────────────────── */
function toNum(value: number | string | null | undefined): number {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num === null || num === undefined || Number.isNaN(num) ? 0 : num
}

function typePill(type: AccountType): string {
  const map: Record<AccountType, string> = {
    asset: 'asa-pill--teal',
    liability: 'asa-pill--amber',
    equity: 'asa-pill--indigo',
    revenue: 'asa-pill--green',
    expense: 'asa-pill--rose',
  }
  return map[type] || ''
}

/** `status` is a free-form column, so fall back to the raw value when it is unrecognised. */
function statusLabel(status: string): string {
  const key = `accounting.statuses.${status}`
  return te(key) === key ? status : te(key)
}

function clearAccountFilters() {
  accountQuery.value = ''
  accountTypeFilter.value = 'all'
  accountPage.value = 1
}

function clearEntryFilters() {
  entryQuery.value = ''
  entryFrom.value = null
  entryTo.value = null
  entryPage.value = 1
}

/* ── Chart of accounts ──────────────────────────────── */
async function fetchAccounts() {
  accountsLoading.value = true
  accountsFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<AccountRow[]>>('/api/accounting/accounts')
    if (res?.success) accounts.value = res.data || []
    else accountsFailed.value = true
  } catch {
    accountsFailed.value = true
  } finally {
    accountsLoading.value = false
  }
}

function openAccountDialog(account?: AccountRow) {
  editingAccount.value = account || null
  accountForm.value = {
    code: account?.code || '',
    name: account?.name || '',
    type: account?.type || '',
    description: account?.description || '',
  }
  accountDialog.value = true
}

async function saveAccount() {
  const code = accountForm.value.code.trim()
  const name = accountForm.value.name.trim()
  const type = accountForm.value.type
  if (!code || !name || !type) {
    $toast.error(t('accounting.fillRequired'))
    return
  }
  savingAccount.value = true
  try {
    const editing = !!editingAccount.value
    const url = editing ? `/api/accounting/accounts/${editingAccount.value?.id}` : '/api/accounting/accounts'
    const res = await apiFetch<ApiEnvelope<AccountRow>>(url, {
      method: editing ? 'PUT' : 'POST',
      body: {
        code,
        name,
        type,
        description: accountForm.value.description.trim() || null,
      },
    })
    if (res?.success) {
      $toast.success(editing ? t('accounting.accountUpdated') : t('accounting.accountCreated'))
      accountDialog.value = false
      await fetchAccounts()
    } else {
      $toast.error(t('accounting.saveError'))
    }
  } catch {
    $toast.error(t('accounting.saveError'))
  } finally {
    savingAccount.value = false
  }
}

async function seedAccounts() {
  try {
    const res = await apiFetch<{ success: boolean }>('/api/accounting/seed', { method: 'POST' })
    if (res?.success) {
      $toast.success(t('accounting.seeded'))
      await fetchAccounts()
    } else {
      $toast.error(t('accounting.seedError'))
    }
  } catch {
    $toast.error(t('accounting.seedError'))
  }
}

/* ── Journal entries ────────────────────────────────── */
async function fetchJournalEntries() {
  journalLoading.value = true
  journalFailed.value = false
  try {
    const params = new URLSearchParams()
    if (entryFrom.value) params.set('start_date', entryFrom.value)
    if (entryTo.value) params.set('end_date', entryTo.value)
    const query = params.toString()
    const res = await apiFetch<ApiEnvelope<JournalListRow[]>>(
      `/api/accounting/journal-entries${query ? `?${query}` : ''}`,
    )
    if (res?.success) journalEntries.value = res.data || []
    else journalFailed.value = true
  } catch {
    journalFailed.value = true
  } finally {
    journalLoading.value = false
  }
}

function openJournalDialog() {
  journalForm.value = {
    entry_date: toDateStr(new Date()),
    description: '',
    reference: '',
    lines: [
      { account_id: '', debit: '', credit: '', description: '' },
      { account_id: '', debit: '', credit: '', description: '' },
    ],
  }
  journalDialog.value = true
}

function addJournalLine() {
  journalForm.value.lines.push({ account_id: '', debit: '', credit: '', description: '' })
}

function removeJournalLine(idx: number) {
  if (journalForm.value.lines.length > 2) journalForm.value.lines.splice(idx, 1)
}

async function saveJournalEntry() {
  const description = journalForm.value.description.trim()
  if (!description || journalForm.value.lines.length < 2) {
    $toast.error(t('accounting.fillJournalRequired'))
    return
  }
  if (journalForm.value.lines.some((line) => !line.account_id)) {
    $toast.error(t('accounting.accountRequired'))
    return
  }
  if (!isBalanced.value) {
    $toast.error(t('accounting.balanceError'))
    return
  }
  savingJournal.value = true
  try {
    const res = await apiFetch<ApiEnvelope<JournalDetailRow>>('/api/accounting/journal-entries', {
      method: 'POST',
      body: {
        entry_date: journalForm.value.entry_date,
        description,
        reference: journalForm.value.reference.trim() || null,
        reference_type: null,
        lines: journalForm.value.lines.map((line) => ({
          account_id: line.account_id,
          debit: toNum(line.debit),
          credit: toNum(line.credit),
          description: line.description.trim() || null,
        })),
      },
    })
    if (res?.success) {
      $toast.success(t('accounting.journalCreated'))
      journalDialog.value = false
      await fetchJournalEntries()
    } else {
      $toast.error(t('accounting.saveJournalError'))
    }
  } catch {
    $toast.error(t('accounting.saveJournalError'))
  } finally {
    savingJournal.value = false
  }
}

async function openEntryDetail(entry: JournalListRow) {
  entryDialog.value = true
  entryLoading.value = true
  entryFailed.value = false
  entryDetail.value = null
  try {
    const res = await apiFetch<ApiEnvelope<JournalDetailRow>>(`/api/accounting/journal-entries/${entry.id}`)
    if (res?.success) entryDetail.value = res.data
    else entryFailed.value = true
  } catch {
    entryFailed.value = true
  } finally {
    entryLoading.value = false
  }
}

/* ── Reports ────────────────────────────────────────── */
async function loadReport() {
  if (!canViewReports.value) return
  if (reportPeriod.value === 'custom' && (!customFrom.value || !customTo.value)) {
    $toast.error(t('accounting.customRangeRequired'))
    return
  }
  reportLoading.value = true
  reportFailed.value = false
  try {
    const params = new URLSearchParams({ period: reportPeriod.value })
    if (reportPeriod.value === 'custom') {
      params.set('start_date', customFrom.value)
      params.set('end_date', customTo.value)
    }
    const res = await apiFetch<ApiEnvelope<PeriodReport>>(`/api/accounting/reports/period?${params}`)
    if (!res?.success) {
      reportFailed.value = true
      return
    }
    report.value = res.data
    const asOf = res.data?.endDate || toDateStr(new Date())
    const sheet = await apiFetch<ApiEnvelope<BalanceSheet>>(
      `/api/accounting/reports/balance-sheet?as_of_date=${asOf}`,
    )
    balanceSheet.value = sheet?.success ? sheet.data : null
  } catch {
    reportFailed.value = true
    $toast.error(t('accounting.reportError'))
  } finally {
    reportLoading.value = false
  }
}

/* ── Refresh ────────────────────────────────────────── */
async function refreshActive() {
  refreshing.value = true
  try {
    if (activeTab.value === 'reports' && canViewReports.value) await loadReport()
    else if (activeTab.value === 'journal') await fetchJournalEntries()
    else await fetchAccounts()
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  if (!isAllowed.value) return
  await Promise.all([fetchAccounts(), fetchJournalEntries()])
})

/* ── Handwriting ────────────────────────────────────── */
const {
  handwritingOpen: accountOpen,
  handwritingLabel: accountLabel,
  handwritingNumeric: accountNumeric,
  openHandwriting: openAccountHw,
  applyHandwriting: applyAccountHw,
} = useHandwritingFields({
  fieldLabels: {
    code: t('accounting.code'),
    name: t('accounting.accountName'),
    description: t('common.notes'),
  },
  target: accountForm,
})

const {
  handwritingOpen: journalOpen,
  handwritingLabel: journalLabel,
  handwritingNumeric: journalNumeric,
  openHandwriting: openJournalHw,
  applyHandwriting: applyJournalHw,
} = useHandwritingFields({
  fieldLabels: {
    reference: t('accounting.reference'),
    description: t('accounting.description'),
  },
  target: journalForm,
})

/* ── Reactivity ─────────────────────────────────────── */
watch(accountQuery, () => { accountPage.value = 1 })
watch(accountTypeFilter, () => { accountPage.value = 1 })
watch(entryQuery, () => { entryPage.value = 1 })
watch([entryFrom, entryTo], async () => {
  entryPage.value = 1
  await fetchJournalEntries()
})
watch(reportPeriod, async (value) => {
  if (value === 'custom' && (!customFrom.value || !customTo.value)) return
  await loadReport()
})
watch([customFrom, customTo], async () => {
  if (reportPeriod.value !== 'custom') return
  if (!customFrom.value || !customTo.value) return
  await loadReport()
})
watch(isAdmin, (admin) => {
  if (!admin && activeTab.value === 'reports') {
    activeTab.value = 'accounts'
    report.value = null
    balanceSheet.value = null
  }
})
watch(activeTab, (tab) => {
  if (tab === 'reports' && canViewReports.value && !report.value) loadReport()
})
</script>

<style scoped>
.acc-alert {
  margin-top: 1rem;
}

.acc-tabs {
  margin-top: 1.5rem;
}

/* The design system ships rose pills/tints but no rose text helper. */
.acc-rose {
  color: var(--asa-rose);
}

/* Many segments on a narrow phone: let them scroll instead of wrapping badly. */
.acc-seg {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.acc-seg::-webkit-scrollbar {
  display: none;
}

.acc-table-wrap {
  display: block;
}

.acc-code {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.acc-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.acc-cell__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.acc-cell__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  overflow-wrap: anywhere;
}

.acc-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
}

.acc-row--click {
  cursor: pointer;
}

.acc-dates {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.acc-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 9.5rem;
}

.acc-date :deep(.v-field) {
  border-radius: 0.75rem;
}

/* ─── Report period bar ───────────────────────────── */
.acc-report-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.acc-range {
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

.acc-sec-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.acc-group {
  margin-bottom: 1.25rem;
}

.acc-group__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.acc-list__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}

.acc-list__row:hover {
  background: color-mix(in srgb, var(--asa-accent) 6%, transparent);
}

.acc-list__name {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.acc-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.8125rem;
  font-weight: 700;
}

.acc-net {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  font-size: 0.875rem;
  font-weight: 800;
}

.acc-net--up {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.acc-net--down {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.acc-none {
  padding: 0.5rem 0.25rem;
}

/* ─── Dialogs ──────────────────────────────────────── */
.acc-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem;
}

.acc-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 0;
}

.acc-field--full {
  grid-column: 1 / -1;
}

.acc-lines {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--asa-sep);
}

.acc-lines__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.acc-line {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.5fr) auto;
  align-items: end;
  gap: 0.5rem;
  padding: 0.625rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-accent) 4%, transparent);
  margin-bottom: 0.5rem;
}

.acc-line__account,
.acc-line__amount,
.acc-line__note {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.acc-line__remove {
  margin-bottom: 0.25rem;
}

.acc-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 700;
}

.acc-balance--ok {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.acc-balance--bad {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.acc-balance__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

@media (max-width: 860px) {
  .acc-form {
    grid-template-columns: minmax(0, 1fr);
  }

  .acc-line {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .acc-line__account,
  .acc-line__note {
    grid-column: 1 / -1;
  }

  .acc-line__remove {
    justify-self: end;
  }

  .acc-date {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .acc-hide-sm {
    display: none;
  }
}
</style>
