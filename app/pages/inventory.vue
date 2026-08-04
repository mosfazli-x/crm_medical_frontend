<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('inventory.title')" :subtitle="$t('inventory.subtitle')" />

    <!-- Summary Cards -->
    <div class="!grid !grid-cols-1 sm:!grid-cols-4 !gap-4 !pb-6">
      <UiStatCard :label="$t('inventory.totalProducts')" :value="String(summary?.totalProducts || 0)"
        value-class="!text-indigo-600 dark:!text-indigo-400">
        <template #icon><Icon name="lucide:package" class="!w-5 !h-5 !text-indigo-400" /></template>
      </UiStatCard>
      <UiStatCard :label="$t('inventory.totalStockValue')" :value="formatPrice(summary?.totalStockValue || 0)"
        value-class="!text-emerald-600 dark:!text-emerald-400">
        <template #icon><Icon name="lucide:wallet" class="!w-5 !h-5 !text-emerald-400" /></template>
      </UiStatCard>
      <UiStatCard :label="$t('inventory.lowStockCount')" :value="String(summary?.lowStockCount || 0)"
        :value-class="(summary?.lowStockCount || 0) > 0 ? '!text-amber-500' : '!text-emerald-600'">
        <template #icon><Icon name="lucide:alert-triangle" class="!w-5 !h-5 !text-amber-400" /></template>
      </UiStatCard>
      <UiStatCard :label="$t('inventory.outOfStockCount')" :value="String(summary?.outOfStockCount || 0)"
        :value-class="(summary?.outOfStockCount || 0) > 0 ? '!text-red-500' : '!text-emerald-600'">
        <template #icon><Icon name="lucide:package-x" class="!w-5 !h-5 !text-red-400" /></template>
      </UiStatCard>
    </div>

    <div class="crm-tabs mb-8">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="['crm-tab', activeTab === tab.key ? 'crm-tab-active' : '']">
        {{ tab.label }}
      </button>
    </div>

    <!-- Products Tab -->
    <template v-if="activeTab === 'products'">
      <div class="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4 !pb-4">
        <div class="!flex !gap-3 !w-full sm:!w-auto">
          <v-select v-model="productCategoryFilter" :items="categoryOptions" item-title="label" item-value="value"
            variant="outlined" density="comfortable" :label="$t('inventory.allCategories')" hide-details clearable
            class="!bg-white dark:!bg-[#0f1115] !rounded-xl !min-w-[180px]" />
          <button @click="openProductDialog"
            class="crm-btn crm-btn-primary">
            <Icon name="lucide:plus" class="!w-4 !h-4" />
            {{ $t('inventory.addProduct') }}
          </button>
        </div>
      </div>

      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('inventory.productName') }}</th>
                <th>{{ $t('inventory.sku') }}</th>
                <th>{{ $t('inventory.category') }}</th>
                <th>{{ $t('inventory.unit') }}</th>
                <th>{{ $t('inventory.purchasePrice') }}</th>
                <th>{{ $t('inventory.sellingPrice') }}</th>
                <th>{{ $t('inventory.currentStock') }}</th>
                <th>{{ $t('inventory.stockValue') }}</th>
                <th class="!text-center">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="productsLoading">
                <td colspan="9"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
              </tr>
              <tr v-else-if="products.length === 0">
                <td colspan="9" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:package" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('inventory.noProducts') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="product in filteredProducts" :key="product.id"
                :class="[productRowClass(product), 'hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30']">
                <td class="!font-bold">{{ product.name }}</td>
                <td class="!font-mono !text-xs">{{ product.sku || '---' }}</td>
                <td class="!text-sm">{{ product.categoryName || '---' }}</td>
                <td class="!text-sm">{{ product.unit }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(product.purchasePrice) }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(product.sellingPrice) }}</td>
                <td>
                  <span :class="[
                    '!font-bold',
                    Number(product.currentStock) <= 0 ? '!text-red-500' :
                    Number(product.currentStock) <= Number(product.minStockLevel) ? '!text-amber-500' :
                    '!text-emerald-600 dark:!text-emerald-400'
                  ]">
                    {{ product.currentStock }}
                  </span>
                  <span v-if="Number(product.currentStock) <= Number(product.minStockLevel) && Number(product.minStockLevel) > 0"
                    class="!text-[10px] !text-red-400 !mr-1">
                    ({{ $t('inventory.lowStock') }})
                  </span>
                </td>
                <td class="!font-mono !text-sm" dir="ltr">{{ formatPrice(product.stockValue) }}</td>
                <td class="!text-center">
                  <div class="!flex !items-center !justify-center !gap-1">
                    <button @click="openStockMovementDialog(product)"
                      class="!p-1.5 !text-slate-400 hover:!text-emerald-500 hover:!bg-emerald-50 dark:hover:!bg-emerald-900/20 !rounded-lg"
                      :title="$t('inventory.addStock')">
                      <Icon name="lucide:plus-circle" class="!w-4 !h-4" />
                    </button>
                    <button @click="editProduct(product)"
                      class="!p-1.5 !text-slate-400 hover:!text-indigo-500 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20 !rounded-lg">
                      <Icon name="lucide:pencil" class="!w-4 !h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Categories Tab -->
    <template v-if="activeTab === 'categories'">
      <div class="!flex !justify-end !pb-4">
        <button @click="openCategoryDialog" class="crm-btn crm-btn-primary">
          <Icon name="lucide:plus" class="!w-4 !h-4" />
          {{ $t('inventory.addCategory') }}
        </button>
      </div>
      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('inventory.categoryName') }}</th>
                <th>{{ $t('inventory.description') }}</th>
                <th>{{ $t('inventory.productCount') }}</th>
                <th class="!text-center">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="categories.length === 0">
                <td colspan="4" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:folder" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('inventory.noCategories') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="cat in categories" :key="cat.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30">
                <td class="!font-bold">{{ cat.name }}</td>
                <td class="!text-sm !text-slate-500">{{ cat.description || '---' }}</td>
                <td class="!font-bold">{{ cat.productCount }}</td>
                <td class="!text-center">
                  <button @click="editCategory(cat)"
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

    <!-- Stock Movements Tab -->
    <template v-if="activeTab === 'movements'">
      <div class="!flex !gap-3 !pb-4">
        <v-select v-model="movementFilter.movement_type" :items="movementTypeOptions" item-title="label" item-value="value"
          variant="outlined" density="comfortable" :label="$t('inventory.movementType')" hide-details clearable
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl !min-w-[150px]" />
        <button @click="fetchStockMovements" class="crm-btn crm-btn-primary">
          <Icon name="lucide:search" class="!w-4 !h-4" />
        </button>
      </div>
      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('inventory.date') }}</th>
                <th>{{ $t('inventory.productName') }}</th>
                <th>{{ $t('inventory.movementType') }}</th>
                <th>{{ $t('inventory.quantity') }}</th>
                <th>{{ $t('inventory.unitPrice') }}</th>
                <th>{{ $t('inventory.totalPrice') }}</th>
                <th>{{ $t('inventory.performedBy') }}</th>
                <th>{{ $t('inventory.reference') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="movementsLoading">
                <td colspan="8"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
              </tr>
              <tr v-else-if="stockMovements.length === 0">
                <td colspan="8" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:history" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('inventory.noMovements') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="m in stockMovements" :key="m.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30">
                <td class="!text-sm">{{ formatJalaliDate(m.performedAt) }}</td>
                <td class="!font-medium">{{ m.productName }}</td>
                <td>
                  <span :class="[
                    '!px-2.5 !py-0.5 !rounded-full !text-xs !font-bold !border',
                    m.movementType === 'in' ? '!bg-emerald-50 dark:!bg-emerald-900/10 !text-emerald-700 !border-emerald-200' :
                    m.movementType === 'out' ? '!bg-red-50 dark:!bg-red-900/10 !text-red-700 !border-red-200' :
                    '!bg-amber-50 dark:!bg-amber-900/10 !text-amber-700 !border-amber-200'
                  ]">
                    {{ movementTypeLabel(m.movementType) }}
                  </span>
                </td>
                <td class="!font-mono !font-bold">{{ m.quantity }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(m.unitPrice) }}</td>
                <td class="!font-mono !font-bold" dir="ltr">{{ formatPrice(m.totalPrice) }}</td>
                <td class="!text-sm">{{ m.performedByName || '---' }}</td>
                <td class="!text-xs !text-slate-500">
                  <template v-if="m.referenceType === 'patient_usage'">
                    <span class="!px-2 !py-0.5 !rounded-full !text-xs !font-semibold !bg-indigo-50 dark:!bg-indigo-900/10 !text-indigo-600 !border !border-indigo-200">
                      {{ $t('inventory.tabs.patientUsage') }}
                    </span>
                  </template>
                  <template v-else>{{ m.reference || '---' }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Patient Usage Tab -->
    <template v-if="activeTab === 'patientUsage'">
      <div class="!flex !justify-end !pb-4">
        <button v-if="canManageUsage" @click="openUsageDialog" class="crm-btn crm-btn-primary">
          <Icon name="lucide:plus" class="!w-4 !h-4" />
          {{ $t('inventory.recordUsage') }}
        </button>
      </div>
      <UiContentCard>
        <div class="!overflow-x-auto">
          <table class="crm-table">
            <thead>
              <tr>
                <th>{{ $t('inventory.date') }}</th>
                <th>{{ $t('inventory.usagePatient') }}</th>
                <th>{{ $t('inventory.productName') }}</th>
                <th>{{ $t('inventory.quantity') }}</th>
                <th>{{ $t('inventory.unitPrice') }}</th>
                <th>{{ $t('inventory.totalPrice') }}</th>
                <th>{{ $t('inventory.performedBy') }}</th>
                <th v-if="role === 'admin_doctor'" class="!text-center">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usagesLoading">
                <td colspan="8"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
              </tr>
              <tr v-else-if="usages.length === 0">
                <td colspan="8" class="!py-16 !text-center">
                  <div class="!flex !flex-col !items-center !gap-3">
                    <Icon name="lucide:syringe" class="!w-10 !h-10 !text-slate-300" />
                    <p class="!text-slate-500 !font-semibold">{{ $t('inventory.noUsages') }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="u in usages" :key="u.id"
                class="hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30">
                <td class="!text-sm !whitespace-nowrap">{{ formatJalaliDate(u.usedAt) }}</td>
                <td class="!font-semibold !whitespace-nowrap">{{ u.patientName }} {{ u.patientLastName }}</td>
                <td class="!text-sm">
                  {{ u.productName }}
                  <span v-if="u.visitId" class="!text-xs !text-slate-400">• {{ u.visitType || '' }}</span>
                </td>
                <td class="!font-mono !font-bold">{{ u.quantity }}</td>
                <td class="!font-mono" dir="ltr">{{ formatPrice(u.unitPrice) }}</td>
                <td class="!font-mono !font-bold" dir="ltr">{{ formatPrice(u.totalPrice) }}</td>
                <td class="!text-sm">{{ u.performedByName || '---' }}</td>
                <td v-if="role === 'admin_doctor'" class="!text-center">
                  <button @click="deleteUsage(u)"
                    class="!p-1.5 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20 !rounded-lg"
                    :title="$t('common.delete')">
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Product Dialog -->
    <v-dialog v-model="productDialog" max-width="600">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-hidden">
        <div class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ editingProduct ? $t('inventory.editProduct') : $t('inventory.addProduct') }}</h2>
          <button @click="productDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <v-text-field v-model="productForm.name" variant="outlined" density="comfortable"
            :label="$t('inventory.productName')" hide-details="auto" />
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="productForm.sku" variant="outlined" density="comfortable"
              :label="$t('inventory.sku')" hide-details="auto" />
            <v-text-field v-model="productForm.barcode" variant="outlined" density="comfortable"
              :label="$t('inventory.barcode')" hide-details="auto" />
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <v-select v-model="productForm.category_id" :items="categoryOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" :label="$t('inventory.category')" hide-details clearable />
            <v-text-field v-model="productForm.unit" variant="outlined" density="comfortable"
              :label="$t('inventory.unit')" hide-details="auto" />
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="productForm.purchase_price" variant="outlined" density="comfortable"
              :label="$t('inventory.purchasePrice')" type="number" hide-details="auto" />
            <v-text-field v-model="productForm.selling_price" variant="outlined" density="comfortable"
              :label="$t('inventory.sellingPrice')" type="number" hide-details="auto" />
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="productForm.min_stock_level" variant="outlined" density="comfortable"
              :label="$t('inventory.minStockLevel')" type="number" hide-details="auto" />
          </div>
          <v-textarea v-model="productForm.description" variant="outlined" density="comfortable"
            :label="$t('common.notes')" rows="2" hide-details="auto" />
        </div>
        <div class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="productDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingProduct" @click="saveProduct" class="crm-btn crm-btn-primary">
            <Icon v-if="savingProduct" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Category Dialog -->
    <v-dialog v-model="categoryDialog" max-width="450">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-hidden">
        <div class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ editingCategory ? $t('inventory.editCategory') : $t('inventory.addCategory') }}</h2>
          <button @click="categoryDialog = false" class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <v-text-field v-model="categoryForm.name" variant="outlined" density="comfortable"
            :label="$t('inventory.categoryName')" hide-details="auto" />
          <v-textarea v-model="categoryForm.description" variant="outlined" density="comfortable"
            :label="$t('inventory.description')" rows="2" hide-details="auto" />
        </div>
        <div class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="categoryDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingCategory" @click="saveCategory" class="crm-btn crm-btn-primary">
            <Icon v-if="savingCategory" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Stock Movement Dialog -->
    <v-dialog v-model="stockDialog" max-width="500">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-hidden">
        <div class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ $t('inventory.addStock') }}</h2>
          <button @click="stockDialog = false" class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <div class="!p-3 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl">
            <p class="!text-sm !font-bold">{{ stockProduct?.name }}</p>
            <p class="!text-xs !text-slate-500">{{ $t('inventory.currentStock') }}: {{ stockProduct?.currentStock }} {{ stockProduct?.unit }}</p>
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <v-select v-model="stockForm.movement_type" :items="movementTypeOptions" item-title="label" item-value="value"
              variant="outlined" density="comfortable" :label="$t('inventory.movementType')" hide-details="auto" />
            <v-text-field v-model="stockForm.quantity" variant="outlined" density="comfortable"
              :label="$t('inventory.quantity')" type="number" hide-details="auto" />
          </div>
          <v-text-field v-model="stockForm.unit_price" variant="outlined" density="comfortable"
            :label="$t('inventory.unitPrice')" type="number" hide-details="auto" />
          <v-text-field v-model="stockForm.reference" variant="outlined" density="comfortable"
            :label="$t('inventory.reference')" hide-details="auto" />
          <v-textarea v-model="stockForm.description" variant="outlined" density="comfortable"
            :label="$t('inventory.description')" rows="2" hide-details="auto" />
        </div>
        <div class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="stockDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingStock" @click="saveStockMovement" class="crm-btn crm-btn-primary">
            <Icon v-if="savingStock" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- Record Usage Dialog -->
    <v-dialog v-model="usageDialog" max-width="600">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-hidden">
        <div class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">{{ $t('inventory.recordUsage') }}</h2>
          <button @click="usageDialog = false" class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <!-- Patient typeahead -->
          <div class="!relative">
            <div v-if="selectedUsagePatient"
              class="!flex !items-center !justify-between !gap-3 !p-3 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl">
              <div class="!flex !flex-col !items-start !gap-0.5 !min-w-0">
                <div class="!text-sm !font-bold">{{ selectedUsagePatient.firstName }} {{ selectedUsagePatient.lastName }}</div>
                <div class="!text-xs !text-slate-500 dark:!text-slate-400">{{ selectedUsagePatient.nationalId || selectedUsagePatient.phone || '' }}</div>
              </div>
              <button @click="clearUsagePatient()"
                class="!p-1 !text-slate-400 hover:!text-red-500 !rounded-lg hover:!bg-red-50 dark:hover:!bg-red-900/20 !transition-colors">
                <Icon name="lucide:x" class="!w-4 !h-4" />
              </button>
            </div>
            <v-text-field v-else v-model="usagePatientSearchQuery" @input="onUsagePatientSearchInput"
              @blur="hideUsagePatientResults"
              @focus="usagePatientSearchQuery?.trim()?.length >= 2 && usagePatientSearchResults.length && (showUsagePatientResults = true)"
              variant="outlined" density="comfortable" :label="$t('inventory.usagePatient')"
              :placeholder="$t('inventory.searchPatientPlaceholder')" hide-details="auto" :loading="usagePatientSearching">
              <template #prepend-inner>
                <Icon name="lucide:search" class="!w-5 !h-5 !text-slate-400 !mr-2" />
              </template>
            </v-text-field>
            <div v-if="showUsagePatientResults && usagePatientSearchResults.length"
              class="!absolute !z-50 !mt-1 !w-full !bg-white dark:!bg-slate-800 !rounded-xl !shadow-xl !border !border-slate-200 dark:!border-slate-700 !overflow-hidden">
              <button v-for="p in usagePatientSearchResults" :key="p.id" @mousedown.prevent="selectUsagePatient(p)"
                class="!w-full !px-4 !py-3 !flex !flex-col !items-start !gap-0.5 hover:!bg-slate-50 dark:hover:!bg-slate-700/50 !transition-colors !text-right !border-b !border-slate-100 dark:!border-slate-700/50 last:!border-b-0">
                <span class="!text-sm !font-bold !text-slate-900 dark:!text-white">{{ p.firstName }} {{ p.lastName }}</span>
                <span class="!text-xs !text-slate-500 dark:!text-slate-400">{{ p.nationalId || p.phone || '' }}</span>
              </button>
            </div>
          </div>

          <v-select v-model="usageForm.product_id" :items="productUsageOptions" item-title="title" item-value="value"
            variant="outlined" density="comfortable" :label="$t('inventory.selectProduct')" hide-details="auto" />

          <div class="!grid !grid-cols-2 !gap-4">
            <v-text-field v-model="usageForm.quantity" variant="outlined" density="comfortable"
              :label="$t('inventory.quantity')" type="number" min="0" hide-details="auto" />
            <v-text-field v-model="usageForm.unit_price" variant="outlined" density="comfortable"
              :label="$t('inventory.unitPrice')" type="number" min="0" hide-details="auto" />
          </div>

          <v-select v-model="usageForm.visit_id" :items="usageVisitOptions" item-title="title" item-value="value"
            variant="outlined" density="comfortable" :label="$t('inventory.visitOptional')" hide-details="auto" clearable />

          <v-textarea v-model="usageForm.notes" variant="outlined" density="comfortable"
            :label="$t('common.notes')" rows="2" hide-details="auto" />
        </div>
        <div class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="usageDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingUsage" @click="saveUsage" class="crm-btn crm-btn-primary">
            <Icon v-if="savingUsage" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useApi } from '~/composables/useApi'
import { useFormatting } from '~/composables/useFormatting'

const { t } = useI18n()
const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()
const { formatJalaliDate, formatPrice } = useFormatting()

const role = computed(() => user?.value?.role || (user as any)?.role)
const canManageUsage = computed(() => ['admin_doctor', 'pharmacy'].includes(role.value))

const activeTab = ref<'products' | 'categories' | 'movements' | 'patientUsage'>('products')

const tabs = computed(() => {
  const all = [
    { key: 'products', label: t('inventory.tabs.products') },
    { key: 'categories', label: t('inventory.tabs.categories') },
    { key: 'movements', label: t('inventory.tabs.movements') },
  ]
  if (canManageUsage.value) all.push({ key: 'patientUsage', label: t('inventory.tabs.patientUsage') })
  return all
})

const movementTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    in: t('inventory.movementTypes.in'),
    out: t('inventory.movementTypes.out'),
    adjustment: t('inventory.movementTypes.adjustment'),
  }
  return map[type] || type
}

const movementTypeOptions = [
  { value: 'in', label: t('inventory.movementTypes.in') },
  { value: 'out', label: t('inventory.movementTypes.out') },
  { value: 'adjustment', label: t('inventory.movementTypes.adjustment') },
]

// ─── Summary ───
const summary = ref<any>(null)

async function fetchSummary() {
  try {
    const res = await apiFetch<any>('/api/inventory/summary')
    if (res.success) summary.value = res.data
  } catch { /* */ }
}

// ─── Products ───
const products = ref<any[]>([])
const productsLoading = ref(false)
const productCategoryFilter = ref<string | null>(null)

const filteredProducts = computed(() => {
  if (!productCategoryFilter.value) return products.value
  return products.value.filter((p) => p.categoryId === productCategoryFilter.value)
})

function productRowClass(product: any) {
  const stock = Number(product.currentStock)
  const min = Number(product.minStockLevel)
  if (stock <= 0) return '!bg-red-50/50 dark:!bg-red-950/20'
  if (stock <= min && min > 0) return '!bg-amber-50/60 dark:!bg-amber-950/15'
  return ''
}

async function fetchProducts() {
  productsLoading.value = true
  try {
    const params = productCategoryFilter.value ? `?category_id=${productCategoryFilter.value}` : ''
    const res = await apiFetch<any>(`/api/inventory/products${params}`)
    if (res.success) products.value = res.data
  } catch { /* */ } finally {
    productsLoading.value = false
  }
}

// ─── Product Dialog ───
const productDialog = ref(false)
const savingProduct = ref(false)
const editingProduct = ref<any>(null)
const productForm = ref({
  name: '', sku: '', barcode: '', category_id: null, unit: 'عدد',
  purchase_price: '', selling_price: '', min_stock_level: '', description: '',
})

function openProductDialog() {
  editingProduct.value = null
  productForm.value = { name: '', sku: '', barcode: '', category_id: null, unit: 'عدد', purchase_price: '', selling_price: '', min_stock_level: '', description: '' }
  productDialog.value = true
}

function editProduct(product: any) {
  editingProduct.value = product
  productForm.value = {
    name: product.name, sku: product.sku || '', barcode: product.barcode || '',
    category_id: product.categoryId || null, unit: product.unit,
    purchase_price: product.purchasePrice || '', selling_price: product.sellingPrice || '',
    min_stock_level: product.minStockLevel || '', description: product.description || '',
  }
  productDialog.value = true
}

async function saveProduct() {
  if (!productForm.value.name) { $toast.error(t('inventory.fillRequired')); return }
  savingProduct.value = true
  try {
    const url = editingProduct.value ? `/api/inventory/products/${editingProduct.value.id}` : '/api/inventory/products'
    const method = editingProduct.value ? 'PUT' : 'POST'
    const body = {
      name: productForm.value.name,
      sku: productForm.value.sku || null,
      barcode: productForm.value.barcode || null,
      category_id: productForm.value.category_id || null,
      unit: productForm.value.unit || 'عدد',
      purchase_price: productForm.value.purchase_price !== '' ? Number(productForm.value.purchase_price) : null,
      selling_price: productForm.value.selling_price !== '' ? Number(productForm.value.selling_price) : null,
      min_stock_level: productForm.value.min_stock_level !== '' ? Number(productForm.value.min_stock_level) : null,
      description: productForm.value.description || null,
    }
    const res = await apiFetch<any>(url, { method, body })
    if (res.success) {
      $toast.success(editingProduct.value ? t('inventory.productUpdated') : t('inventory.productCreated'))
      productDialog.value = false
      await fetchProducts()
      await fetchSummary()
    }
  } catch { $toast.error(t('inventory.saveError')) } finally { savingProduct.value = false }
}

// ─── Categories ───
const categories = ref<any[]>([])
const categoryOptions = computed(() =>
  [{ value: null, label: t('inventory.allCategories') }, ...categories.value.map((c: any) => ({ value: c.id, label: c.name }))]
)

async function fetchCategories() {
  try {
    const res = await apiFetch<any>('/api/inventory/categories')
    if (res.success) categories.value = res.data
  } catch { /* */ }
}

// ─── Category Dialog ───
const categoryDialog = ref(false)
const savingCategory = ref(false)
const editingCategory = ref<any>(null)
const categoryForm = ref({ name: '', description: '' })

function openCategoryDialog() {
  editingCategory.value = null
  categoryForm.value = { name: '', description: '' }
  categoryDialog.value = true
}

function editCategory(cat: any) {
  editingCategory.value = cat
  categoryForm.value = { name: cat.name, description: cat.description || '' }
  categoryDialog.value = true
}

async function saveCategory() {
  if (!categoryForm.value.name) { $toast.error(t('inventory.fillRequired')); return }
  savingCategory.value = true
  try {
    const url = editingCategory.value ? `/api/inventory/categories/${editingCategory.value.id}` : '/api/inventory/categories'
    const method = editingCategory.value ? 'PUT' : 'POST'
    const res = await apiFetch<any>(url, { method, body: categoryForm.value })
    if (res.success) {
      $toast.success(editingCategory.value ? t('inventory.categoryUpdated') : t('inventory.categoryCreated'))
      categoryDialog.value = false
      await fetchCategories()
    }
  } catch { $toast.error(t('inventory.saveError')) } finally { savingCategory.value = false }
}

// ─── Stock Movements ───
const stockMovements = ref<any[]>([])
const movementsLoading = ref(false)
const movementFilter = ref({ movement_type: '' })

async function fetchStockMovements() {
  movementsLoading.value = true
  try {
    const params = new URLSearchParams()
    if (movementFilter.value.movement_type) params.set('movement_type', movementFilter.value.movement_type)
    const res = await apiFetch<any>(`/api/inventory/stock-movements?${params}`)
    if (res.success) stockMovements.value = res.data
  } catch { /* */ } finally { movementsLoading.value = false }
}

// ─── Stock Movement Dialog ───
const stockDialog = ref(false)
const savingStock = ref(false)
const stockProduct = ref<any>(null)
const stockForm = ref({ movement_type: 'in', quantity: '', unit_price: '', reference: '', description: '' })

function openStockMovementDialog(product: any) {
  stockProduct.value = product
  stockForm.value = { movement_type: 'in', quantity: '', unit_price: '', reference: '', description: '' }
  stockDialog.value = true
}

async function saveStockMovement() {
  if (!stockForm.value.quantity) { $toast.error(t('inventory.fillRequired')); return }
  savingStock.value = true
  try {
    const res = await apiFetch<any>('/api/inventory/stock-movements', {
      method: 'POST',
      body: {
        product_id: stockProduct.value.id,
        movement_type: stockForm.value.movement_type,
        quantity: Number(stockForm.value.quantity),
        unit_price: Number(stockForm.value.unit_price) || 0,
        reference: stockForm.value.reference || null,
        description: stockForm.value.description || null,
      },
    })
    if (res.success) {
      $toast.success(t('inventory.stockUpdated'))
      stockDialog.value = false
      await fetchProducts()
      await fetchStockMovements()
      await fetchSummary()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('inventory.saveError'))
  } finally { savingStock.value = false }
}

// ─── Patient Usage ───
const usages = ref<any[]>([])
const usagesLoading = ref(false)

async function fetchUsages() {
  if (!canManageUsage.value) return
  usagesLoading.value = true
  try {
    const res = await apiFetch<any>('/api/patient-usage')
    if (res.success) usages.value = res.data
  } catch { /* */ } finally { usagesLoading.value = false }
}

function deleteUsage(usage: any) {
  if (!confirm(t('inventory.deleteUsageConfirm'))) return
  apiFetch<any>(`/api/patient-usage/${usage.id}`, { method: 'DELETE' })
    .then(async (res: any) => {
      if (res.success) {
        $toast.success(t('inventory.usageDeleted'))
        await Promise.all([fetchUsages(), fetchProducts(), fetchSummary()])
      }
    })
    .catch((err: any) => $toast.error(err.data?.error || t('inventory.saveError')))
}

// ─── Record Usage Dialog ───
const usageDialog = ref(false)
const savingUsage = ref(false)
const usageForm = ref({ product_id: null, quantity: '', unit_price: '', visit_id: null, notes: '' })

const productUsageOptions = computed(() =>
  products.value.map((p: any) => ({
    title: `${p.name} — ${p.currentStock} ${p.unit}`,
    value: p.id,
  }))
)

const usagePatientSearchQuery = ref('')
const usagePatientSearchResults = ref<any[]>([])
const showUsagePatientResults = ref(false)
const usagePatientSearching = ref(false)
let usagePatientSearchTimer: ReturnType<typeof setTimeout> | null = null
const selectedUsagePatient = ref<any>(null)

const usageVisits = ref<any[]>([])
const usageVisitOptions = computed(() => [
  { title: t('inventory.withoutVisit'), value: null },
  ...usageVisits.value.map((v: any) => ({
    title: `${v.visitType || '—'} • ${formatJalaliDate(v.visitDate)}`,
    value: v.id,
  })),
])

function onUsagePatientSearchInput() {
  if (usagePatientSearchTimer) clearTimeout(usagePatientSearchTimer)
  showUsagePatientResults.value = false
  if (!usagePatientSearchQuery.value?.trim()) {
    usagePatientSearchResults.value = []
    return
  }
  usagePatientSearchTimer = setTimeout(() => searchUsagePatients(), 400)
}

async function searchUsagePatients() {
  const q = usagePatientSearchQuery.value.trim()
  if (q.length < 2) return
  usagePatientSearching.value = true
  try {
    const res = await apiFetch<any>(`/api/patient-usage/patients/search?q=${encodeURIComponent(q)}`)
    if (res.success) {
      usagePatientSearchResults.value = res.data
      showUsagePatientResults.value = true
    }
  } catch { /* */ } finally { usagePatientSearching.value = false }
}

function selectUsagePatient(patient: any) {
  selectedUsagePatient.value = patient
  usagePatientSearchQuery.value = `${patient.firstName} ${patient.lastName}`
  showUsagePatientResults.value = false
  usagePatientSearchResults.value = []
  fetchUsageVisits(patient.id)
}

function clearUsagePatient() {
  selectedUsagePatient.value = null
  usagePatientSearchQuery.value = ''
  usagePatientSearchResults.value = []
  showUsagePatientResults.value = false
  usageVisits.value = []
  usageForm.value.visit_id = null
}

function hideUsagePatientResults() {
  nextTick(() => { showUsagePatientResults.value = false })
}

async function fetchUsageVisits(patientId: string) {
  if (!patientId) { usageVisits.value = []; return }
  try {
    const res = await apiFetch<any>(`/api/patient-usage/visits/search?patient_id=${patientId}`)
    if (res.success) usageVisits.value = res.data
  } catch { /* */ }
}

function openUsageDialog() {
  clearUsagePatient()
  usageForm.value = { product_id: null, quantity: '', unit_price: '', visit_id: null, notes: '' }
  usageDialog.value = true
}

async function saveUsage() {
  if (!selectedUsagePatient.value || !usageForm.value.product_id || !usageForm.value.quantity) {
    $toast.error(t('inventory.fillUsageRequired'))
    return
  }
  savingUsage.value = true
  try {
    const res = await apiFetch<any>('/api/patient-usage', {
      method: 'POST',
      body: {
        patient_id: selectedUsagePatient.value.id,
        product_id: usageForm.value.product_id,
        quantity: Number(usageForm.value.quantity),
        unit_price: Number(usageForm.value.unit_price) || 0,
        visit_id: usageForm.value.visit_id || null,
        notes: usageForm.value.notes || null,
      },
    })
    if (res.success) {
      $toast.success(t('inventory.usageCreated'))
      usageDialog.value = false
      await Promise.all([fetchUsages(), fetchProducts(), fetchSummary()])
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('inventory.saveError'))
  } finally { savingUsage.value = false }
}

onMounted(() => {
  fetchSummary()
  fetchProducts()
  fetchCategories()
  fetchStockMovements()
  fetchUsages()
})
</script>
