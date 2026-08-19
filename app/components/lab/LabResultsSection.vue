<template>
  <div class="space-y-6">
    <!-- Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="crm-section-title !text-base !font-bold !text-zinc-900">{{ t('labResults.sectionTitle') }}</h2>
        <p class="crm-section-subtitle !text-[11px] !text-zinc-400 !mt-0.5">{{ t('labResults.sectionDesc') }}</p>
      </div>
      <button
        class="!inline-flex !items-center !justify-center !gap-1.5 !px-4 !py-2.5 !bg-zinc-900 hover:!bg-zinc-800 !text-white !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm !w-full sm:!w-auto"
        @click="openAddDialog">
        <Plus class="!w-3.5 !h-3.5" />
        {{ t('labResults.addLabResult') }}
      </button>
    </div>

    <!-- Registered Results -->
    <div
      class="!bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.02)] !overflow-hidden">

      <div class="!flex !items-center !justify-between !px-5 !py-3.5 !border-b !border-zinc-100">
        <h3 class="!text-xs !font-bold !text-zinc-900 !flex !items-center !gap-2">
          <Microscope class="!w-4 !h-4 !text-zinc-400" />
          {{ t('labResults.resultsTitle') }}
        </h3>
        <span class="!px-2 !py-0.5 !bg-zinc-100 !text-zinc-500 !rounded-md !text-[10px] !font-mono !font-bold">
          {{ results.length }}
        </span>
      </div>

      <div class="!flex !items-center !gap-1.5 !px-5 !py-3.5 !overflow-x-auto !scrollbar-none !border-b !border-zinc-100">
        <button v-for="(label, key) in categoryLabels" :key="key" @click="categoryFilter = key" :class="[
          '!whitespace-nowrap !px-3 !py-1.5 !rounded-lg !text-[11px] !font-semibold !transition-all !duration-200 !border',
          categoryFilter === key
            ? '!bg-zinc-900 !text-white !border-zinc-900 !shadow-sm'
            : '!bg-white !text-zinc-500 !border-zinc-200/60 hover:!text-zinc-900 hover:!border-zinc-300 hover:!bg-zinc-50/50'
        ]">
          {{ label }}
          <span :class="[
            '!mr-1 !px-1.5 !py-0.5 !rounded-md !text-[9px] !font-mono !font-bold',
            categoryFilter === key ? '!bg-zinc-800 !text-zinc-300' : '!bg-zinc-100 !text-zinc-500'
          ]">
            {{ categoryCounts[key] || 0 }}
          </span>
        </button>
      </div>

      <div v-if="loadingResults" class="!p-12 !text-center !flex !flex-col !items-center !justify-center">
        <v-progress-circular indeterminate color="#18181b" size="28" width="2" />
        <p class="!text-xs !text-zinc-400 !mt-4 !font-medium">{{ t('labResults.fetchingTransactions') }}</p>
      </div>

      <div v-else-if="filteredResults.length === 0" class="!py-16 !text-center">
        <div class="!flex !flex-col !items-center !max-w-sm !mx-auto">
          <div
            class="!w-10 !h-10 !rounded-xl !bg-zinc-50 !border !border-zinc-100 !flex !items-center !justify-center !mb-3.5">
            <ClipboardX class="!w-4 !h-4 !text-zinc-400" />
          </div>
          <p class="!text-zinc-900 !font-semibold !text-xs">{{ t('labResults.noRecords') }}</p>
          <p class="!text-[11px] !text-zinc-400 !mt-1">{{ t('labResults.noResultsInCategory') }}</p>
        </div>
      </div>

      <div v-else class="!overflow-x-auto">
        <table class="!w-full !text-right !border-collapse">
          <thead>
            <tr class="!bg-zinc-50/60 !border-b !border-zinc-200/60">
              <th class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">{{
                t('labResults.biomarkerTest') }}</th>
              <th class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">{{
                t('labResults.registrationDate') }}</th>
              <th class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">{{
                t('labResults.reportedValue') }}</th>
              <th class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">{{
                t('labResults.referenceRange') }}</th>
              <th class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">{{
                t('labResults.clinicalStatus') }}</th>
              <th
                class="!px-5 !py-3 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap !text-left">
                {{ t('labResults.actions') }}</th>
            </tr>
          </thead>
          <tbody class="!divide-y !divide-zinc-100">
            <tr v-for="result in filteredResults" :key="result.id"
              class="hover:!bg-zinc-50/50 !transition-colors !duration-150 group">
              <td class="!px-5 !py-3.5 !whitespace-nowrap">
                <div class="!flex !flex-col">
                  <span class="!text-xs !font-semibold !text-zinc-900 hover:!text-blue-600 !cursor-pointer !transition-colors"
                    @click="showTrend(result)">
                    {{ result.testName }}
                  </span>
                  <span class="!text-[10px] !text-zinc-400 !font-medium !mt-0.5">{{ categoryLabels[result.category] ||
                    result.category }}</span>
                </div>
              </td>

              <td class="!px-5 !py-3.5 !text-xs !text-zinc-500 !font-medium !whitespace-nowrap">
                {{ formatJalaliDate(result.performedDate) }}
              </td>

              <td class="!px-5 !py-3.5 !whitespace-nowrap">
                <div class="!flex !items-baseline !gap-1">
                  <span class="!text-xs !text-zinc-900 !font-mono !font-bold">{{ result.value || '---' }}</span>
                  <span class="!text-[10px] !text-zinc-400 !font-mono">{{ result.unit || '' }}</span>
                </div>
              </td>

              <td class="!px-5 !py-3.5 !text-xs !text-zinc-400 !font-mono !whitespace-nowrap">
                {{ formatReferenceRange(result) }}
              </td>

              <td class="!px-5 !py-3.5 !whitespace-nowrap">
                <div class="!flex !items-center !gap-1.5">
                  <span
                    :class="['!w-1.5 !h-1.5 !rounded-full', result.isAbnormal ? '!bg-red-500' : '!bg-emerald-500']"></span>
                  <span
                    :class="['!text-[11px] !font-semibold', result.isAbnormal ? '!text-red-600' : '!text-zinc-600']">
                    {{ result.isAbnormal ? t('labResults.outsideRange') : t('labResults.normalStatus') }}
                  </span>
                </div>
              </td>

              <td class="!px-5 !py-3.5 !whitespace-nowrap !text-left">
                <div
                  class="!flex !items-center !justify-end !gap-0.5 md:!opacity-0 group-hover:!opacity-100 !transition-opacity">
                  <button
                    class="!p-1.5 !text-zinc-400 hover:!text-zinc-900 hover:!bg-zinc-100 !rounded-lg !transition-colors"
                    :title="t('labResults.trendAnalysis')" @click="showTrend(result)">
                    <LineChart class="!w-4 !h-4" />
                  </button>
                  <button
                    class="!p-1.5 !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !rounded-lg !transition-colors"
                    :title="t('labResults.deleteRecord')" @click="confirmDeleteResult(result)">
                    <Trash2 class="!w-4 !h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Documents -->
    <div
      class="!bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.02)] !overflow-hidden">

      <div class="!flex !items-center !justify-between !px-5 !py-3.5 !border-b !border-zinc-100">
        <h3 class="!text-xs !font-bold !text-zinc-900 !flex !items-center !gap-2">
          <FolderOpen class="!w-4 !h-4 !text-zinc-400" />
          {{ t('labResults.documentsTitle') }}
        </h3>
        <span class="!px-2 !py-0.5 !bg-zinc-100 !text-zinc-500 !rounded-md !text-[10px] !font-mono !font-bold">
          {{ documents.length }}
        </span>
      </div>

      <div v-if="loadingDocs" class="!p-12 !text-center !flex !flex-col !items-center !justify-center">
        <v-progress-circular indeterminate color="#18181b" size="28" width="2" />
      </div>

      <div v-else-if="documents.length === 0" class="!py-16 !text-center">
        <div class="!flex !flex-col !items-center !max-w-sm !mx-auto">
          <div
            class="!w-10 !h-10 !rounded-xl !bg-zinc-50 !border !border-zinc-100 !flex !items-center !justify-center !mb-3.5">
            <FileUp class="!w-4 !h-4 !text-zinc-400" />
          </div>
          <p class="!text-zinc-900 !font-semibold !text-xs">{{ t('labResults.documentsEmpty') }}</p>
          <p class="!text-[11px] !text-zinc-400 !mt-1">{{ t('labResults.documentsEmptyDesc') }}</p>
        </div>
      </div>

      <div v-else class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-3 !p-4">
        <div v-for="doc in documents" :key="doc.id"
          class="!flex !flex-col !justify-between !gap-3 !p-3.5 !bg-zinc-50/40 !border !border-zinc-200/70 !rounded-xl hover:!border-zinc-300 !transition-all group">
          <div class="!flex !items-start !gap-2.5 !min-w-0">
            <div
              class="!w-9 !h-9 !rounded-lg !bg-white !border !border-zinc-200/60 !flex !items-center !justify-center !shrink-0">
              <FileText class="!w-4 !h-4 !text-zinc-400" />
            </div>
            <div class="!flex-1 !min-w-0">
              <p class="!text-xs !font-semibold !text-zinc-900 !truncate" :title="doc.fileName">{{ doc.fileName }}</p>
              <div class="!flex !items-center !gap-1.5 !mt-1 !flex-wrap">
                <span class="!px-1.5 !py-0.5 !bg-zinc-100 !text-zinc-500 !rounded-md !text-[9px] !font-bold">
                  {{ documentTypeLabel(doc.fileType) }}
                </span>
                <span class="!text-[9px] !text-zinc-400 !font-mono">{{ formatSize(doc.fileSize) }}</span>
              </div>
              <p class="!text-[10px] !text-zinc-400 !mt-1">{{ formatJalaliDate(doc.createdAt) }}</p>
            </div>
          </div>
          <div class="!flex !items-center !justify-end !gap-1 !border-t !border-zinc-100 !pt-2">
            <button
              class="!inline-flex !items-center !gap-1 !px-2 !py-1 !text-[10px] !font-semibold !text-zinc-500 hover:!text-zinc-900 hover:!bg-zinc-100 !rounded-lg !transition-colors"
              :loading="loadingView.has(doc.id)" @click="viewFile(doc)">
              <Eye class="!w-3 !h-3" />
              {{ t('labResults.viewDoc') }}
            </button>
            <button
              class="!inline-flex !items-center !gap-1 !px-2 !py-1 !text-[10px] !font-semibold !text-zinc-500 hover:!text-zinc-900 hover:!bg-zinc-100 !rounded-lg !transition-colors"
              :loading="loadingDownload.has(doc.id)" @click="downloadFile(doc)">
              <Download class="!w-3 !h-3" />
              {{ t('labResults.downloadDoc') }}
            </button>
            <button
              class="!inline-flex !items-center !gap-1 !px-2 !py-1 !text-[10px] !font-semibold !text-red-500 hover:!text-red-600 hover:!bg-red-50 !rounded-lg !transition-colors"
              @click="confirmDeleteDocument(doc)">
              <Trash2 class="!w-3 !h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="addDialog" max-width="580" persistent class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden">
        <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100">
          <h3 class="!text-xs !font-bold !text-zinc-900">{{ t('labResults.addResultTitle') }}</h3>
          <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="addDialog = false">
            <X class="!w-4 !h-4" />
          </button>
        </div>

        <!-- Mode Toggle -->
        <div class="!px-6 !pt-5">
          <div class="!grid !grid-cols-2 !gap-1 !bg-zinc-100/80 !p-1 !rounded-xl">
            <button
              :class="[
                '!flex !items-center !justify-center !gap-1.5 !px-3 !py-2 !rounded-lg !text-[11px] !font-semibold !transition-all',
                entryMode === 'manual' ? '!bg-white !text-zinc-900 !shadow-sm' : '!text-zinc-500 hover:!text-zinc-700'
              ]"
              @click="entryMode = 'manual'">
              <Keyboard class="!w-3.5 !h-3.5" />
              {{ t('labResults.manualEntry') }}
            </button>
            <button
              :class="[
                '!flex !items-center !justify-center !gap-1.5 !px-3 !py-2 !rounded-lg !text-[11px] !font-semibold !transition-all',
                entryMode === 'document' ? '!bg-white !text-zinc-900 !shadow-sm' : '!text-zinc-500 hover:!text-zinc-700'
              ]"
              @click="entryMode = 'document'">
              <Upload class="!w-3.5 !h-3.5" />
              {{ t('labResults.documentUpload') }}
            </button>
          </div>
        </div>

        <div class="!p-6 !bg-zinc-50/20">
          <!-- Manual entry form -->
          <v-form v-if="entryMode === 'manual'" ref="manualFormRef" @submit.prevent="submitManualResult">
            <div class="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">

              <div class="md:!col-span-2">
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.testName') }}</label>
                <v-combobox v-model="form.test_name" variant="outlined" density="compact" :items="commonTestNames"
                  :rules="[v => !!v || t('labResults.testNameRequired')]" hide-details="auto" class="custom-v-input"
                  color="#18181b" base-color="#e4e4e7"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('labResults.testName'), false, (text) => form.test_name = text)" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.category') }}</label>
                <v-select v-model="form.category" :items="categoryOptions" item-title="label" item-value="value"
                  variant="outlined" density="compact" :rules="[v => !!v || t('labResults.categoryRequired')]"
                  hide-details="auto" class="custom-v-input" color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.value') }}</label>
                <v-text-field v-model="form.value" variant="outlined" density="compact" type="number" step="any"
                  :rules="[v => !!v || t('labResults.valueRequired')]" hide-details="auto"
                  class="custom-v-input !font-mono" color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.unit') }}</label>
                <v-text-field v-model="form.unit" variant="outlined" density="compact" hide-details="auto"
                  placeholder="e.g. mIU/L" class="custom-v-input !font-mono" color="#18181b" base-color="#e4e4e7"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('labResults.unit'), false, (text) => form.unit = text)" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.refRange') }}</label>
                <v-text-field v-model="form.reference_range" variant="outlined" density="compact" hide-details="auto"
                  placeholder="e.g. 0.5 - 4.5" class="custom-v-input !font-mono" color="#18181b" base-color="#e4e4e7"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('labResults.refRange'), false, (text) => form.reference_range = text)" />
              </div>

              <div
                class="md:!col-span-2 !bg-white !border !border-zinc-200/80 !rounded-xl !p-3.5 !flex !items-center !justify-between !mt-1">
                <div>
                  <label class="!text-xs !font-semibold !text-zinc-900 !block">{{ t('labResults.abnormalFlag')
                    }}</label>
                  <span class="!text-[10px] !text-zinc-400 !block !mt-0.5">{{ t('labResults.abnormalDesc') }}</span>
                </div>
                <v-switch v-model="form.abnormal_flag" color="error" inset hide-details
                  class="!pt-0 !mt-0 !flex-none" />
              </div>

              <div class="md:!col-span-2 !mt-1">
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.samplingDate') }}</label>
                <div class="relative h-[40px] border rounded overflow-hidden lg:w-[200px] w-full">
                  <PersianDatetimePicker v-model="form.performed_date" format="YYYY-MM-DD"
                    :placeholder="t('labResults.solarDatePlaceholder')" class="custom-picker-input" />
                </div>
                <p v-if="formDateError" class="!text-red-500 !text-[10px] !font-semibold !mt-1">{{ formDateError }}</p>
              </div>

              <div class="md:!col-span-2">
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.clinicalNotes') }}</label>
                <v-textarea v-model="form.notes" variant="outlined" density="compact" rows="2" hide-details
                  class="custom-v-input" color="#18181b" base-color="#e4e4e7"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('labResults.clinicalNotes'), false, (text) => form.notes = text)" />
              </div>
            </div>
          </v-form>

          <!-- Document upload form -->
          <div v-else>
            <div class="!grid !grid-cols-1 !gap-4">
              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.docType') }}</label>
                <v-select v-model="docForm.type" :items="documentTypeOptions" item-title="label" item-value="value"
                  variant="outlined" density="compact" hide-details="auto" class="custom-v-input" color="#18181b"
                  base-color="#e4e4e7" />
                <p v-if="docTypeError" class="!text-red-500 !text-[10px] !font-semibold !mt-1">{{ docTypeError }}</p>
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">{{
                  t('labResults.docFiles') }}</label>
                <label
                  class="!cursor-pointer !flex !flex-col !items-center !justify-center !gap-1.5 !py-7 !bg-white !border-2 !border-dashed !border-zinc-300 hover:!border-zinc-900/40 !rounded-xl !transition-all">
                  <UploadCloud class="!w-5 !h-5 !text-zinc-400" />
                  <span class="!text-xs !font-semibold !text-zinc-600">{{ t('labResults.chooseFile') }}</span>
                  <span class="!text-[10px] !text-zinc-400">{{ t('labResults.chooseFileDesc') }}</span>
                  <input type="file" class="!hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple
                    @change="onFileChange" />
                </label>
                <p v-if="docFilesError" class="!text-red-500 !text-[10px] !font-semibold !mt-1">{{ docFilesError }}</p>
              </div>

              <div v-if="docForm.files.length" class="!space-y-1.5">
                <div v-for="(file, idx) in docForm.files" :key="idx"
                  class="!flex !items-center !justify-between !gap-2 !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg">
                  <div class="!flex !items-center !gap-2 !min-w-0">
                    <File class="!w-3.5 !h-3.5 !text-zinc-400 !shrink-0" />
                    <span class="!text-[11px] !text-zinc-700 !font-medium !truncate">{{ file.name }}</span>
                    <span class="!text-[10px] !text-zinc-400 !font-mono !shrink-0">{{ formatSize(file.size) }}</span>
                  </div>
                  <button class="!text-zinc-400 hover:!text-red-600 !transition-colors !shrink-0"
                    @click="docForm.files.splice(idx, 1)">
                    <X class="!w-3.5 !h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="!px-6 !py-4 !bg-white !border-t !border-zinc-100 !flex !justify-end !gap-2.5">
          <button
            class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
            @click="addDialog = false">{{ $t('common.cancel') }}</button>
          <button
            class="!px-5 !py-2 !text-xs !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center !min-w-[110px]"
            :disabled="submitting" @click="entryMode === 'manual' ? submitManualResult() : submitDocument()">
            <v-progress-circular v-if="submitting" indeterminate size="12" width="2" color="white" class="!ml-2" />
            {{ entryMode === 'manual' ? t('labResults.saveAndFinalize') : t('labResults.uploadDocButton') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Trend Dialog -->
    <v-dialog v-model="trendDialog" max-width="680" class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden"
        v-if="trendData.length > 0 || trendLoading">
        <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100">
          <div>
            <h3 class="!text-xs !font-bold !text-zinc-900 !flex !items-center !gap-2">
              <Activity class="!text-zinc-900 !w-4 !h-4" />
              {{ t('labResults.trendTitle', { name: trendTestName }) }}
            </h3>
          </div>
          <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="trendDialog = false">
            <X class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6">
          <div v-if="trendLoading" class="!flex !justify-center !py-12">
            <v-progress-circular indeterminate color="#18181b" size="24" width="2" />
          </div>
          <template v-else>
            <div
              class="!bg-white !border !border-zinc-200/60 !rounded-xl !p-4 !mb-5 !shadow-sm !overflow-hidden !relative">
              <span v-if="trendUnit"
                class="!absolute !top-4 !left-4 !text-[9px] !font-mono !text-zinc-400 !border !border-zinc-100 !px-2 !py-0.5 !rounded !bg-zinc-50/50">{{
                  trendUnit }}</span>

              <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="!w-full !max-h-64"
                xmlns="http://www.w3.org/2000/svg">
                <line v-for="(g, gi) in yGridLines" :key="'yg' + gi" :x1="margin.left" :y1="g.y"
                  :x2="svgWidth - margin.right" :y2="g.y" stroke="#f4f4f5" stroke-width="1" stroke-dasharray="4,4" />

                <text v-for="(g, gi) in yGridLines" :key="'yl' + gi" :x="margin.left - 12" :y="g.y + 3"
                  text-anchor="end" class="!fill-zinc-400 !font-mono" font-size="9">
                  {{ g.label }}
                </text>

                <rect v-if="refLow !== null && refHigh !== null" :x="margin.left" :y="scaleY(refHigh)"
                  :width="plotWidth" :height="scaleY(refLow) - scaleY(refHigh)" fill="#f0fdf4" />
                <line v-if="refLow !== null" :x1="margin.left" :y1="scaleY(refLow)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refLow)" stroke="#dcfce7" stroke-width="1" />
                <line v-if="refHigh !== null" :x1="margin.left" :y1="scaleY(refHigh)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refHigh)" stroke="#dcfce7" stroke-width="1" />

                <polyline :points="linePoints" fill="none" stroke="#18181b" stroke-width="1.5"
                  stroke-linejoin="round" />

                <circle v-for="(pt, pi) in trendDataSorted" :key="'pt' + pi" :cx="scaleX(pt.index)"
                  :cy="scaleY(Number(pt.value))" r="3.5" :fill="pt.isAbnormal ? '#ef4444' : '#18181b'"
                  stroke="#ffffff" stroke-width="1.5" />

                <text v-for="(pt, pi) in trendDataSorted" :key="'xl' + pi" :x="scaleX(pt.index)"
                  :y="svgHeight - margin.bottom + 22" text-anchor="end"
                  transform="rotate(-40, ${scaleX(pt.index)}, ${svgHeight - margin.bottom + 22})"
                  class="!fill-zinc-400 !font-medium" font-size="9">
                  {{ formatShortDate(pt.performedDate) }}
                </text>
              </svg>
            </div>

            <div class="!overflow-x-auto !border !border-zinc-200/60 !rounded-xl">
              <table class="!w-full !text-right !text-xs">
                <thead>
                  <tr class="!bg-zinc-50/50 !border-b !border-zinc-200/60 !text-zinc-400">
                    <th class="!px-4 !py-3 !font-semibold">{{ t('labResults.samplingDateLabel') }}</th>
                    <th class="!px-4 !py-3 !font-semibold">{{ t('labResults.foundValue') }}</th>
                    <th class="!px-4 !py-3 !font-semibold">{{ t('labResults.kitReference') }}</th>
                  </tr>
                </thead>
                <tbody class="!divide-y !divide-zinc-100 !text-zinc-600">
                  <tr v-for="pt in trendDataSorted" :key="pt.id" class="hover:!bg-zinc-50/30">
                    <td class="!px-4 !py-3 !font-medium">{{ formatJalaliDate(pt.performedDate) }}</td>
                    <td class="!px-4 !py-3 !font-mono !font-bold">
                      <span :class="pt.isAbnormal ? '!text-red-500' : '!text-zinc-900'">{{ pt.value }}</span>
                    </td>
                    <td class="!px-4 !py-3 !font-mono !text-zinc-400">{{ formatReferenceRange(pt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </v-dialog>

    <!-- Delete Result Dialog -->
    <v-dialog v-model="deleteResultDialog" max-width="360" class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Trash2 class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 !mb-1.5">{{ t('labResults.deleteLabTitle') }}</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('labResults.deleteLabConfirm') }}</p>

        <div class="!flex !justify-center !gap-2 !mt-5">
          <button
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors"
            @click="deleteResultDialog = false">{{ $t('common.cancel') }}</button>
          <button
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center"
            :disabled="deleting" @click="deleteResult">
            <v-progress-circular v-if="deleting" indeterminate size="12" width="2" color="white" class="!mr-2" />
            <span v-else>{{ t('labResults.deletePermanently') }}</span>
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Delete Document Dialog -->
    <v-dialog v-model="deleteDocumentDialog" max-width="360" class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Trash2 class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 !mb-1.5">{{ t('labResults.documentDeleteTitle') }}</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('labResults.documentDeleteConfirm') }}</p>

        <div class="!flex !justify-center !gap-2 !mt-5">
          <button
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors"
            @click="deleteDocumentDialog = false">{{ $t('common.cancel') }}</button>
          <button
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center"
            :disabled="deleting" @click="deleteDocument">
            <v-progress-circular v-if="deleting" indeterminate size="12" width="2" color="white" class="!mr-2" />
            <span v-else>{{ t('labResults.deletePermanently') }}</span>
          </button>
        </div>
      </div>
    </v-dialog>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import Plus from '~/components/icons/Plus.vue'
import Microscope from '~/components/icons/Microscope.vue'
import ClipboardX from '~/components/icons/ClipboardX.vue'
import LineChart from '~/components/icons/LineChart.vue'
import Trash2 from '~/components/icons/Trash2.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import FileUp from '~/components/icons/FileUp.vue'
import FileText from '~/components/icons/FileText.vue'
import Eye from '~/components/icons/Eye.vue'
import Download from '~/components/icons/Download.vue'
import X from '~/components/icons/X.vue'
import Keyboard from '~/components/icons/Keyboard.vue'
import Upload from '~/components/icons/Upload.vue'
import UploadCloud from '~/components/icons/UploadCloud.vue'
import File from '~/components/icons/File.vue'
import Activity from '~/components/icons/Activity.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const props = defineProps<{ patientId: string }>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const patientId = computed(() => props.patientId)

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const results = ref<any[]>([])
const documents = ref<any[]>([])
const loadingResults = ref(false)
const loadingDocs = ref(false)
const categoryFilter = ref('all')

const addDialog = ref(false)
const entryMode = ref<'manual' | 'document'>('manual')
const submitting = ref(false)
const manualFormRef = ref<any>(null)
const formDateError = ref('')

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

const trendDialog = ref(false)
const trendData = ref<any[]>([])
const trendLoading = ref(false)
const trendTestName = ref('')
const trendUnit = ref('')

const deleteResultDialog = ref(false)
const deleteDocumentDialog = ref(false)
const deleting = ref(false)
const deleteTarget = ref<any>(null)

const loadingView = reactive(new Set<string>())
const loadingDownload = reactive(new Set<string>())

// ─────────────────────────────────────────────
// Labels & Options
// ─────────────────────────────────────────────
const categoryLabels = computed<Record<string, string>>(() => ({
  all: t('labResults.categories.all'),
  hormone: t('labResults.categories.hormone'),
  hematology: t('labResults.categories.hematology'),
  biochemistry: t('labResults.categories.biochemistry'),
  tumor_marker: t('labResults.categories.tumor_marker'),
  microbiology: t('labResults.categories.microbiology'),
  urinalysis: t('labResults.categories.urinalysis'),
  genetics: t('labResults.categories.genetics'),
  genetic: t('labResults.categories.genetics'),
  cytology: t('labResults.categories.cytology'),
  pathology: t('labResults.categories.pathology'),
  molecular: t('labResults.categories.molecular'),
  other: t('labResults.categories.other'),
}))

const categoryOptions = computed(() =>
  Object.entries(categoryLabels.value)
    .filter(([key]) => key !== 'all' && key !== 'genetic')
    .map(([value, label]) => ({ value, label }))
)

const documentTypeOptions = computed(() => [
  { value: 'lab', label: t('labResults.docTypes.lab') },
  { value: 'hormone', label: t('labResults.docTypes.hormone') },
  { value: 'tumor_marker', label: t('labResults.docTypes.tumor_marker') },
  { value: 'cytology', label: t('labResults.docTypes.cytology') },
  { value: 'pathology', label: t('labResults.docTypes.pathology') },
  { value: 'microbiology', label: t('labResults.docTypes.microbiology') },
  { value: 'genetics', label: t('labResults.docTypes.genetics') },
  { value: 'ultrasound', label: t('labResults.docTypes.ultrasound') },
  { value: 'prescription', label: t('labResults.docTypes.prescription') },
  { value: 'other', label: t('labResults.docTypes.other') },
])

const docTypeLabels: Record<string, string> = computed(() => {
  const map: Record<string, string> = {}
  for (const opt of documentTypeOptions.value) map[opt.value] = opt.label
  return map
})

const commonTestNames = [
  'FSH', 'LH', 'Estradiol (E2)', 'Progesterone', 'Prolactin', 'AMH', 'TSH',
  'Testosterone', 'DHEA-S', 'SHBG', 'CA-125', 'HE4', 'ROMA', 'AFP', 'CEA',
  'CA 15-3', 'CA 19-9',
]

// ─────────────────────────────────────────────
// Forms
// ─────────────────────────────────────────────
const form = ref({
  category: 'hormone',
  test_name: '',
  value: '',
  unit: '',
  reference_range: '',
  abnormal_flag: false,
  notes: '',
  performed_date: '',
})

const docForm = ref<{ type: string; files: File[] }>({ type: 'lab', files: [] })
const docTypeError = ref('')
const docFilesError = ref('')

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: results.value.length }
  for (const r of results.value) {
    counts[r.category] = (counts[r.category] || 0) + 1
  }
  return counts
})

const filteredResults = computed(() => {
  if (categoryFilter.value === 'all') return results.value
  return results.value.filter(r => r.category === categoryFilter.value)
})

// ─────────────────────────────────────────────
// Formatting Helpers
// ─────────────────────────────────────────────
function formatJalaliDate(date: string | null | undefined) {
  if (!date) return '---'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return '---'
  }
}

function formatShortDate(date: string | null | undefined) {
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return ''
  }
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i]
}

function formatReferenceRange(row: any): string {
  const low = row.referenceRangeLow ?? row.reference_range_low
  const high = row.referenceRangeHigh ?? row.reference_range_high
  if (low && high) return `${low} - ${high}`
  if (low) return String(low)
  if (high) return String(high)
  return '---'
}

function splitRange(range: string): { low: string | null; high: string | null } {
  const parts = String(range || '').split(/\s*[-–]\s*/)
  return { low: parts[0]?.trim() || null, high: parts[1]?.trim() || null }
}

function documentTypeLabel(type: string): string {
  return docTypeLabels.value[type] || categoryLabels.value[type] || type || '---'
}

// ─────────────────────────────────────────────
// Data Fetching
// ─────────────────────────────────────────────
async function fetchResults() {
  if (!patientId.value) return
  loadingResults.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}`)
    results.value = res.success ? (res.data || []) : []
    if (!res.success) $toast.error(t('labResults.fetchResultsError'))
  } catch {
    results.value = []
    $toast.error(t('labResults.serverError'))
  } finally {
    loadingResults.value = false
  }
}

async function fetchDocuments() {
  if (!patientId.value) return
  loadingDocs.value = true
  try {
    const res = await apiFetch<any>(`/api/patients/${patientId.value}/attachments`)
    documents.value = res.success ? (res.data || []) : []
    if (!res.success) $toast.error(t('labResults.fetchDocsError'))
  } catch {
    documents.value = []
    $toast.error(t('labResults.serverError'))
  } finally {
    loadingDocs.value = false
  }
}

// ─────────────────────────────────────────────
// Add Dialog
// ─────────────────────────────────────────────
function openAddDialog() {
  entryMode.value = 'manual'
  resetManualForm()
  resetDocForm()
  formDateError.value = ''
  docTypeError.value = ''
  docFilesError.value = ''
  addDialog.value = true
}

function resetManualForm() {
  form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', performed_date: '' }
}

function resetDocForm() {
  docForm.value = { type: 'lab', files: [] }
}

watch(addDialog, (val) => {
  if (!val) {
    resetManualForm()
    resetDocForm()
    formDateError.value = ''
    docTypeError.value = ''
    docFilesError.value = ''
  }
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) {
    docForm.value.files = [...docForm.value.files, ...Array.from(input.files)]
  }
  input.value = ''
}

async function submitManualResult() {
  if (!form.value.performed_date) {
    formDateError.value = t('labResults.samplingDateRequired')
    return
  }
  formDateError.value = ''
  const valid = await manualFormRef.value?.validate()
  if (!valid?.valid) return

  submitting.value = true
  try {
    const { low, high } = splitRange(form.value.reference_range)
    const body = {
      patient_id: patientId.value,
      category: form.value.category,
      test_name: form.value.test_name,
      value: form.value.value,
      unit: form.value.unit || null,
      reference_range_low: low,
      reference_range_high: high,
      is_abnormal: form.value.abnormal_flag,
      notes: form.value.notes || null,
      performed_date: form.value.performed_date,
    }
    const res = await apiFetch<any>('/api/lab-results', { method: 'POST', body })
    if (res.success) {
      $toast.success(t('labResults.resultSaved'))
      addDialog.value = false
      await fetchResults()
    } else {
      $toast.error(res.error || t('labResults.resultSaveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('labResults.resultSaveError'))
  } finally {
    submitting.value = false
  }
}

async function submitDocument() {
  docTypeError.value = docForm.value.type ? '' : t('labResults.docTypeRequired')
  docFilesError.value = docForm.value.files.length ? '' : t('labResults.docFilesRequired')
  if (docTypeError.value || docFilesError.value) return

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('type', docForm.value.type)
    for (const file of docForm.value.files) {
      fd.append('file', file)
    }
    const res = await apiFetch<any>(`/api/patients/${patientId.value}/attachments`, { method: 'POST', body: fd })
    if (res.success) {
      $toast.success(t('labResults.documentUploaded'))
      addDialog.value = false
      await fetchDocuments()
    } else {
      $toast.error(res.error || t('labResults.documentUploadError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('labResults.documentUploadError'))
  } finally {
    submitting.value = false
  }
}

// ─────────────────────────────────────────────
// Document Actions
// ─────────────────────────────────────────────
async function getDownloadUrl(doc: any, forceDownload = false, loadingSet: Set<string>): Promise<string | null> {
  if (!doc.id || !patientId.value) return null
  loadingSet.add(doc.id)
  try {
    const query = forceDownload ? '?download=true' : ''
    const res = await apiFetch<{ success: boolean; data?: { downloadUrl: string } }>(
      `/api/patients/${patientId.value}/attachments/${doc.id}/download${query}`
    )
    return res.data?.downloadUrl || null
  } catch {
    $toast.error(t('labResults.downloadLinkError'))
    return null
  } finally {
    loadingSet.delete(doc.id)
  }
}

async function viewFile(doc: any) {
  const url = await getDownloadUrl(doc, false, loadingView)
  if (url) window.open(url, '_blank')
}

async function downloadFile(doc: any) {
  const url = await getDownloadUrl(doc, true, loadingDownload)
  if (url) {
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName || 'download'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

// ─────────────────────────────────────────────
// Trend
// ─────────────────────────────────────────────
async function showTrend(result: any) {
  trendTestName.value = result.testName
  trendUnit.value = result.unit || ''
  trendDialog.value = true
  trendLoading.value = true
  trendData.value = []
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}/trend?testName=${encodeURIComponent(result.testName)}`)
    trendData.value = (res.success ? (res.data || []) : []).sort(
      (a: any, b: any) => new Date(a.performedDate).getTime() - new Date(b.performedDate).getTime()
    )
    if (!res.success) $toast.error(t('labResults.fetchTrendError'))
  } catch {
    trendData.value = []
    $toast.error(t('labResults.trendFetchError'))
  } finally {
    trendLoading.value = false
  }
}

const trendDataSorted = computed(() => {
  return trendData.value.map((d: any, i: number) => ({ ...d, index: i }))
})

const margin = { top: 30, right: 20, bottom: 60, left: 50 }
const svgWidth = 620
const svgHeight = 260
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom

function scaleX(index: number) {
  const count = trendDataSorted.value.length
  if (count <= 1) return margin.left + plotWidth / 2
  return margin.left + (index / (count - 1)) * plotWidth
}

function scaleY(value: number) {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  return margin.top + ((yMax - value) / (yMax - yMin)) * plotHeight
}

const refLow = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const low = trendDataSorted.value[0].referenceRangeLow
  if (low) return parseFloat(low)
  return null
})

const refHigh = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const high = trendDataSorted.value[0].referenceRangeHigh
  if (high) return parseFloat(high)
  return null
})

const yGridLines = computed(() => {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  if (vals.length === 0) return []
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  const steps = 4
  const lines = []
  for (let i = 0; i <= steps; i++) {
    const val = yMin + ((yMax - yMin) * i) / steps
    lines.push({
      y: margin.top + ((yMax - val) / (yMax - yMin)) * plotHeight,
      label: val.toFixed(1),
    })
  }
  return lines
})

const linePoints = computed(() => {
  return trendDataSorted.value
    .map((d: any) => `${scaleX(d.index)},${scaleY(Number(d.value))}`)
    .join(' ')
})

// ─────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────
function confirmDeleteResult(result: any) {
  deleteTarget.value = result
  deleteResultDialog.value = true
}

function confirmDeleteDocument(doc: any) {
  deleteTarget.value = doc
  deleteDocumentDialog.value = true
}

async function deleteResult() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success(t('labResults.resultDeleted'))
      deleteResultDialog.value = false
      deleteTarget.value = null
      await fetchResults()
    } else {
      $toast.error(res.error || t('labResults.deleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('labResults.labDeleteError'))
  } finally {
    deleting.value = false
  }
}

async function deleteDocument() {
  if (!deleteTarget.value || !patientId.value) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/patients/${patientId.value}/attachments/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success(t('labResults.documentDeleted'))
      deleteDocumentDialog.value = false
      deleteTarget.value = null
      await fetchDocuments()
    } else {
      $toast.error(res.error || t('labResults.documentDeleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('labResults.documentDeleteError'))
  } finally {
    deleting.value = false
  }
}

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
watch(patientId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    categoryFilter.value = 'all'
    fetchResults()
    fetchDocuments()
  }
})

if (patientId.value) {
  fetchResults()
  fetchDocuments()
}
</script>

<style scoped>
:deep(.custom-picker-input) {
  width: 100% !important;
  height: 40px !important;
  border: 1px solid rgba(228, 228, 231, 0.8) !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
  font-size: 12px !important;
  outline: none !important;
  transition: all 0.2s ease-in-out !important;
  color: #18181b !important;
}

:deep(.custom-picker-input::placeholder) {
  color: #a1a1aa !important;
}

:deep(.custom-picker-input:focus) {
  border-color: #18181b !important;
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.05) !important;
}

:deep(.custom-v-input .v-field) {
  border-radius: 12px !important;
  font-size: 12px !important;
}

:deep(.scrollbar-none::-webkit-scrollbar) {
  display: none !important;
}

:deep(.scrollbar-none) {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
