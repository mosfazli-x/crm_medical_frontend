<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Access gate ─── -->
    <div v-if="!isAllowed" class="asa-card pf-empty">
      <div class="asa-tint asa-tint--rose pf-tint-lg">
        <Security class="w-6! h-6! fill-current" />
      </div>
      <div>
        <p class="pf-empty__title">{{ t('inventory.deniedTitle') }}</p>
        <p class="pf-empty__desc">{{ t('inventory.deniedDesc') }}</p>
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
          <h1 class="dash-head__title">{{ t('inventory.title') }}</h1>
          <p class="dash-head__date">{{ t('inventory.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <button
            class="asa-btn asa-btn--ghost"
            :disabled="refreshing"
            :aria-label="t('inventory.refresh')"
            :title="t('inventory.refresh')"
            @click="refreshActive"
          >
            <v-icon size="16" :class="{ 'pf-spin': refreshing }">mdi-refresh</v-icon>
          </button>
          <button v-if="primaryAction" class="asa-btn asa-btn--primary" @click="primaryAction.run">
            <component :is="primaryAction.icon" class="w-4! h-4!" :class="primaryAction.filled ? 'fill-current' : 'stroke-current'" />
            <span>{{ primaryAction.label }}</span>
          </button>
        </div>
      </header>

      <!-- ─── Summary metrics ─── -->
      <div class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4!">
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--teal">
            <Box class="w-5! h-5! fill-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(metrics.total) }}</p>
            <p class="pf-metric__label">{{ t('inventory.totalProducts') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--green">
            <Wallet class="w-5! h-5! fill-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value pf-metric__value--sm">
              <UiPrice :value="metrics.stockValue" :show-words="false" />
            </p>
            <p class="pf-metric__label">{{ t('inventory.totalStockValue') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--amber">
            <Activity class="w-5! h-5! stroke-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value" :class="{ 'asa-amber': metrics.low > 0 }">{{ pn(metrics.low) }}</p>
            <p class="pf-metric__label">{{ t('inventory.lowStockCount') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <span class="asa-tint asa-tint--rose">
            <CloseCircle class="w-5! h-5! fill-current" />
          </span>
          <div class="pf-metric__copy">
            <p class="pf-metric__value" :class="{ 'inv-rose': metrics.out > 0 }">{{ pn(metrics.out) }}</p>
            <p class="pf-metric__label">{{ t('inventory.outOfStockCount') }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Section switcher ─── -->
      <div class="inv-tabs">
        <div class="pf-seg inv-seg" role="tablist" :aria-label="t('inventory.title')">
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
            <span class="pf-seg__count">{{ pn(tab.count) }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Products ─── -->
      <div v-if="activeTab === 'products'" class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="productQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('inventory.searchProducts')"
              :aria-label="t('inventory.searchProducts')"
            >
            <button
              v-if="productQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="productQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>

          <div class="pf-seg inv-seg" role="group" :aria-label="t('inventory.stockStatus')">
            <button
              v-for="seg in stockSegments"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': stockFilter === seg.value }"
              :aria-pressed="stockFilter === seg.value"
              @click="stockFilter = seg.value"
            >
              <span>{{ seg.label }}</span>
              <span class="pf-seg__count">{{ pn(seg.count) }}</span>
            </button>
          </div>

          <div v-if="canViewCategories" class="pf-toolbar__tail">
            <v-select
              v-model="categoryFilter"
              :items="categoryFilterOptions"
              item-title="label"
              item-value="value"
              variant="solo"
              density="compact"
              hide-details
              clearable
              class="asa-select inv-select"
              :placeholder="t('inventory.allCategories')"
              :aria-label="t('inventory.category')"
            />
          </div>
        </div>

        <div v-if="productsLoading" class="pf-skel">
          <div v-for="i in 6" :key="`p-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-32! rounded-md!" />
            <div class="asa-skel h-4! w-44! rounded-md!" />
            <div class="asa-skel h-4! w-24! rounded-md!" />
          </div>
        </div>

        <div v-else-if="productsFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('inventory.productsLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('inventory.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchProducts">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleProducts.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <Box class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasProductFilters ? t('inventory.noMatchingProducts') : t('inventory.noProducts') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasProductFilters ? t('inventory.clearFiltersDesc') : t('inventory.noProductsDesc') }}
            </p>
          </div>
          <div class="pf-empty__actions">
            <button v-if="hasProductFilters" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearProductFilters">
              {{ t('inventory.clearFilters') }}
            </button>
            <button v-else-if="canCreateProduct" class="asa-btn asa-btn--primary asa-btn--sm" @click="openProductDialog()">
              {{ t('inventory.addProduct') }}
            </button>
          </div>
        </div>

        <template v-else>
          <div class="inv-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('inventory.productName') }}</th>
                  <th>{{ t('inventory.category') }}</th>
                  <th>{{ t('inventory.currentStock') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.purchasePrice') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.sellingPrice') }}</th>
                  <th class="pf-ta-end">{{ t('inventory.stockValue') }}</th>
                  <th class="pf-ta-end">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in pagedProducts" :key="product.id">
                  <td>
                    <button type="button" class="inv-cell inv-cell--btn" @click="openProductDetails(product)">
                      <span class="inv-cell__name">{{ product.name }}</span>
                      <span class="inv-cell__sub">{{ product.sku || product.barcode || t('inventory.noSku') }}</span>
                    </button>
                  </td>
                  <td>
                    <span v-if="product.categoryName">{{ product.categoryName }}</span>
                    <span v-else class="pf-tiny">{{ t('inventory.uncategorized') }}</span>
                  </td>
                  <td>
                    <div class="inv-stock">
                      <span class="asa-pill" :class="stockPill(product)">
                        {{ t(`inventory.stockStates.${stockState(product)}`) }}
                      </span>
                      <span class="inv-stock__qty">
                        <span class="pf-ip">{{ qtyText(product.currentStock) }}</span>
                        <span class="pf-tiny">{{ product.unit }}</span>
                      </span>
                    </div>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <UiPrice v-if="hasValue(product.purchasePrice)" :value="product.purchasePrice" :show-words="false" />
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <UiPrice v-if="hasValue(product.sellingPrice)" :value="product.sellingPrice" :show-words="false" />
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </td>
                  <td class="pf-ta-end">
                    <UiPrice :value="product.stockValue" :show-words="false" />
                  </td>
                  <td class="pf-ta-end">
                    <div class="inv-actions">
                      <button
                        v-if="canRecordStock"
                        class="pf-icon-btn"
                        type="button"
                        :title="t('inventory.addStock')"
                        :aria-label="t('inventory.addStock')"
                        @click="openStockDialog(product)"
                      >
                        <ArrowRightLeft class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        v-if="canCreateProduct"
                        class="pf-icon-btn"
                        type="button"
                        :title="t('common.edit')"
                        :aria-label="t('common.edit')"
                        @click="openProductDialog(product)"
                      >
                        <Pencil class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        v-if="canDeleteProduct"
                        class="pf-icon-btn pf-icon-btn--danger"
                        type="button"
                        :title="t('common.delete')"
                        :aria-label="t('common.delete')"
                        @click="askDeleteProduct(product)"
                      >
                        <TrashBin class="w-4! h-4! fill-current" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!productsLoading" class="pf-roster inv-roster">
            <article v-for="product in pagedProducts" :key="product.id" class="pf-roster__item">
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ product.name }}</span>
                  <span class="asa-pill" :class="stockPill(product)">
                    {{ t(`inventory.stockStates.${stockState(product)}`) }}
                  </span>
                </div>
                <div class="pf-roster__meta">
                  <span v-if="product.sku" class="pf-ip">{{ product.sku }}</span>
                  <span v-if="product.categoryName">
                    <v-icon size="13">mdi-shape-outline</v-icon>
                    {{ product.categoryName }}
                  </span>
                  <span>
                    <v-icon size="13">mdi-package-variant-closed</v-icon>
                    {{ qtyText(product.currentStock) }} {{ product.unit }}
                  </span>
                </div>
                <div class="inv-roster__money">
                  <span class="inv-roster__money-item">
                    <span class="pf-tiny">{{ t('inventory.sellingPrice') }}</span>
                    <UiPrice v-if="hasValue(product.sellingPrice)" :value="product.sellingPrice" :show-words="false" />
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </span>
                  <span class="inv-roster__money-item">
                    <span class="pf-tiny">{{ t('inventory.stockValue') }}</span>
                    <UiPrice :value="product.stockValue" :show-words="false" />
                  </span>
                </div>
              </div>
              <div class="pf-roster__actions">
                <button
                  v-if="canRecordStock"
                  class="pf-icon-btn"
                  type="button"
                  :title="t('inventory.addStock')"
                  :aria-label="t('inventory.addStock')"
                  @click="openStockDialog(product)"
                >
                  <ArrowRightLeft class="w-4! h-4! stroke-current" />
                </button>
                <button
                  v-if="canCreateProduct"
                  class="pf-icon-btn"
                  type="button"
                  :title="t('common.edit')"
                  :aria-label="t('common.edit')"
                  @click="openProductDialog(product)"
                >
                  <Pencil class="w-4! h-4! stroke-current" />
                </button>
                <button
                  v-if="canDeleteProduct"
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :title="t('common.delete')"
                  :aria-label="t('common.delete')"
                  @click="askDeleteProduct(product)"
                >
                  <TrashBin class="w-4! h-4! fill-current" />
                </button>
              </div>
            </article>
          </div>

          <div v-if="products.length" class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('inventory.showing', { shown: pn(visibleProducts.length), total: pn(products.length) }) }}
            </p>
            <v-pagination
              v-if="productPages > 1"
              v-model="productPage"
              :length="productPages"
              :total-visible="5"
              density="comfortable"
              color="#00adb5"
              rounded="circle"
            />
          </div>
        </template>
      </div>

      <!-- ─── Categories ─── -->
      <div v-else-if="activeTab === 'categories'" class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="categoryQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('inventory.searchCategories')"
              :aria-label="t('inventory.searchCategories')"
            >
            <button
              v-if="categoryQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="categoryQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>
          <div class="pf-toolbar__tail">
            <span class="pf-toolbar__count">{{ t('inventory.categoryCount', { count: pn(visibleCategories.length) }) }}</span>
          </div>
        </div>

        <div v-if="categoriesLoading" class="pf-skel">
          <div v-for="i in 4" :key="`c-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-40! rounded-md!" />
            <div class="asa-skel h-4! w-56! rounded-md!" />
          </div>
        </div>

        <div v-else-if="categoriesFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('inventory.categoriesLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('inventory.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchCategories">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleCategories.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <FolderOpen class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ categoryQuery ? t('inventory.noMatchingCategories') : t('inventory.noCategories') }}
            </p>
            <p class="pf-empty__desc">
              {{ categoryQuery ? t('inventory.clearFiltersDesc') : t('inventory.noCategoriesDesc') }}
            </p>
          </div>
        </div>

        <template v-else>
          <div class="inv-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('inventory.categoryName') }}</th>
                  <th>{{ t('inventory.description') }}</th>
                  <th class="pf-ta-end">{{ t('inventory.productCount') }}</th>
                  <th class="pf-ta-end">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in visibleCategories" :key="category.id">
                  <td>
                    <span class="inv-cell__name">{{ category.name }}</span>
                  </td>
                  <td>
                    <span v-if="category.description">{{ category.description }}</span>
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </td>
                  <td class="pf-ta-end">
                    <span class="pf-ip">{{ qtyText(category.productCount) }}</span>
                  </td>
                  <td class="pf-ta-end">
                    <div v-if="canManageCategories" class="inv-actions">
                      <button
                        class="pf-icon-btn"
                        type="button"
                        :title="t('common.edit')"
                        :aria-label="t('common.edit')"
                        @click="openCategoryDialog(category)"
                      >
                        <Pencil class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        class="pf-icon-btn pf-icon-btn--danger"
                        type="button"
                        :title="t('common.delete')"
                        :aria-label="t('common.delete')"
                        @click="askDeleteCategory(category)"
                      >
                        <TrashBin class="w-4! h-4! fill-current" />
                      </button>
                    </div>
                    <span v-else class="pf-tiny">{{ t('inventory.readOnly') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!categoriesLoading" class="pf-roster inv-roster">
            <article v-for="category in visibleCategories" :key="category.id" class="pf-roster__item">
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ category.name }}</span>
                  <span class="pf-pill--neutral asa-pill">
                    {{ t('inventory.productCount') }}: {{ qtyText(category.productCount) }}
                  </span>
                </div>
                <p v-if="category.description" class="pf-sub inv-roster__desc">
                  {{ category.description }}
                </p>
              </div>
              <div v-if="canManageCategories" class="pf-roster__actions">
                <button
                  class="pf-icon-btn"
                  type="button"
                  :title="t('common.edit')"
                  :aria-label="t('common.edit')"
                  @click="openCategoryDialog(category)"
                >
                  <Pencil class="w-4! h-4! stroke-current" />
                </button>
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :title="t('common.delete')"
                  :aria-label="t('common.delete')"
                  @click="askDeleteCategory(category)"
                >
                  <TrashBin class="w-4! h-4! fill-current" />
                </button>
              </div>
            </article>
          </div>
        </template>
      </div>

      <!-- ─── Stock movements ─── -->
      <div v-else-if="activeTab === 'movements'" class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="movementQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('inventory.searchMovements')"
              :aria-label="t('inventory.searchMovements')"
            >
            <button
              v-if="movementQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="movementQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>

          <div class="pf-seg inv-seg" role="group" :aria-label="t('inventory.movementType')">
            <button
              v-for="seg in movementSegments"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': movementFilter === seg.value }"
              :aria-pressed="movementFilter === seg.value"
              @click="movementFilter = seg.value"
            >
              <span>{{ seg.label }}</span>
              <span class="pf-seg__count">{{ pn(seg.count) }}</span>
            </button>
          </div>
        </div>

        <div v-if="movementsLoading" class="pf-skel">
          <div v-for="i in 6" :key="`m-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-28! rounded-md!" />
            <div class="asa-skel h-4! w-44! rounded-md!" />
            <div class="asa-skel h-4! w-20! rounded-md!" />
          </div>
        </div>

        <div v-else-if="movementsFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('inventory.movementsLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('inventory.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchMovements">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleMovements.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <ArrowRightLeft class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasMovementFilters ? t('inventory.noMatchingMovements') : t('inventory.noMovements') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasMovementFilters ? t('inventory.clearFiltersDesc') : t('inventory.noMovementsDesc') }}
            </p>
          </div>
          <div v-if="hasMovementFilters" class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearMovementFilters">
              {{ t('inventory.clearFilters') }}
            </button>
          </div>
        </div>

        <template v-else>
          <div class="inv-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('inventory.date') }}</th>
                  <th>{{ t('inventory.productName') }}</th>
                  <th>{{ t('inventory.movementType') }}</th>
                  <th class="pf-ta-end">{{ t('inventory.quantity') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.totalPrice') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.performedBy') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="movement in pagedMovements" :key="movement.id">
                  <td>
                    <div class="pf-dt">
                      <p class="pf-dt__date">{{ formatDate(movement.performedAt) }}</p>
                      <p class="pf-dt__time">{{ formatTime(movement.performedAt) }}</p>
                    </div>
                  </td>
                  <td>
                    <div class="inv-cell">
                      <span class="inv-cell__name">{{ movement.productName || t('inventory.deletedProduct') }}</span>
                      <span class="inv-cell__sub">{{ movement.productSku || t('inventory.noSku') }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="asa-pill" :class="movementPill(movement.movementType)">
                      {{ movementTypeLabel(movement.movementType) }}
                    </span>
                  </td>
                  <td class="pf-ta-end">
                    <span class="pf-ip" :class="movement.quantity >= 0 ? '' : 'inv-negative'">
                      {{ signedQty(movement.movementType, movement.quantity) }}
                    </span>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <UiPrice v-if="hasValue(movement.totalPrice)" :value="movement.totalPrice" :show-words="false" />
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <span class="pf-sub">{{ movement.performedByName || t('inventory.unknownUser') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="movements.length" class="pf-roster inv-roster">
            <article v-for="movement in pagedMovements" :key="movement.id" class="pf-roster__item">
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ movement.productName || t('inventory.deletedProduct') }}</span>
                  <span class="asa-pill" :class="movementPill(movement.movementType)">
                    {{ movementTypeLabel(movement.movementType) }}
                  </span>
                </div>
                <div class="pf-roster__meta">
                  <span class="pf-tiny">
                    <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                    {{ formatDate(movement.performedAt) }} · {{ formatTime(movement.performedAt) }}
                  </span>
                  <span class="pf-ip">
                    {{ signedQty(movement.movementType, movement.quantity) }}
                    {{ t('inventory.unitsShort') }}
                  </span>
                  <span v-if="movement.performedByName" class="pf-tiny">
                    <v-icon size="13">mdi-account-outline</v-icon>
                    {{ movement.performedByName }}
                  </span>
                </div>
                <p v-if="movement.description" class="pf-sub inv-roster__desc">
                  {{ movement.description }}
                </p>
              </div>
            </article>
          </div>

          <div v-if="movements.length" class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('inventory.showing', { shown: pn(visibleMovements.length), total: pn(movements.length) }) }}
            </p>
            <v-pagination
              v-if="movementPages > 1"
              v-model="movementPage"
              :length="movementPages"
              :total-visible="5"
              density="comfortable"
              color="#00adb5"
              rounded="circle"
            />
          </div>
        </template>
      </div>

      <!-- ─── Patient usage ─── -->
      <div v-else class="asa-card pf-table-card">
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="usageQuery"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('inventory.searchUsage')"
              :aria-label="t('inventory.searchUsage')"
            >
            <button
              v-if="usageQuery"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="usageQuery = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>
          <div class="pf-toolbar__tail">
            <span class="pf-toolbar__count">{{ t('inventory.itemCount', { count: pn(visibleUsages.length) }) }}</span>
          </div>
        </div>

        <div v-if="usagesLoading" class="pf-skel">
          <div v-for="i in 6" :key="`u-sk-${i}`" class="pf-skel__row">
            <div class="asa-skel h-4! w-32! rounded-md!" />
            <div class="asa-skel h-4! w-44! rounded-md!" />
            <div class="asa-skel h-4! w-20! rounded-md!" />
          </div>
        </div>

        <div v-else-if="usagesFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('inventory.usagesLoadError') }}</p>
            <p class="pf-empty__desc">{{ t('inventory.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchUsages">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <div v-else-if="visibleUsages.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <Users class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ usageQuery ? t('inventory.noMatchingUsages') : t('inventory.noUsages') }}
            </p>
            <p class="pf-empty__desc">
              {{ usageQuery ? t('inventory.clearFiltersDesc') : t('inventory.noUsagesDesc') }}
            </p>
          </div>
        </div>

        <template v-else>
          <div class="inv-table-wrap asa-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th>{{ t('inventory.date') }}</th>
                  <th>{{ t('inventory.usagePatient') }}</th>
                  <th>{{ t('inventory.productName') }}</th>
                  <th class="pf-ta-end">{{ t('inventory.quantity') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.totalPrice') }}</th>
                  <th class="pf-ta-end inv-hide-sm">{{ t('inventory.performedBy') }}</th>
                  <th v-if="canDeleteUsage" class="pf-ta-end">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usage in pagedUsages" :key="usage.id">
                  <td>
                    <div class="pf-dt">
                      <p class="pf-dt__date">{{ formatDate(usage.usedAt) }}</p>
                      <p class="pf-dt__time">{{ formatTime(usage.usedAt) }}</p>
                    </div>
                  </td>
                  <td>
                    <span class="inv-cell__name">{{ usage.patientName }} {{ usage.patientLastName }}</span>
                  </td>
                  <td>
                    <div class="inv-cell">
                      <span class="inv-cell__name">{{ usage.productName || t('inventory.deletedProduct') }}</span>
                      <span class="inv-cell__sub">{{ usage.visitType || usage.productSku || t('inventory.noVisitType') }}</span>
                    </div>
                  </td>
                  <td class="pf-ta-end">
                    <span class="pf-ip">{{ qtyText(usage.quantity) }}</span>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <UiPrice v-if="hasValue(usage.totalPrice)" :value="usage.totalPrice" :show-words="false" />
                    <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
                  </td>
                  <td class="pf-ta-end inv-hide-sm">
                    <span class="pf-sub">{{ usage.performedByName || t('inventory.unknownUser') }}</span>
                  </td>
                  <td v-if="canDeleteUsage" class="pf-ta-end">
                    <div class="inv-actions">
                      <button
                        class="pf-icon-btn pf-icon-btn--danger"
                        type="button"
                        :title="t('common.delete')"
                        :aria-label="t('common.delete')"
                        @click="askDeleteUsage(usage)"
                      >
                        <TrashBin class="w-4! h-4! fill-current" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!usagesLoading" class="pf-roster inv-roster">
            <article v-for="usage in pagedUsages" :key="usage.id" class="pf-roster__item">
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ usage.patientName }} {{ usage.patientLastName }}</span>
                  <span class="asa-pill asa-pill--teal">
                    {{ qtyText(usage.quantity) }} {{ usage.productUnit || t('inventory.unitsShort') }}
                  </span>
                </div>
                <div class="pf-roster__meta">
                  <span class="pf-tiny">
                    <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                    {{ formatDate(usage.usedAt) }} · {{ formatTime(usage.usedAt) }}
                  </span>
                  <span class="pf-tiny">
                    <v-icon size="13">mdi-package-variant-closed</v-icon>
                    {{ usage.productName || t('inventory.deletedProduct') }}
                  </span>
                </div>
                <div v-if="usage.notes" class="pf-sub inv-roster__desc">
                  {{ usage.notes }}
                </div>
              </div>
              <div v-if="canDeleteUsage" class="pf-roster__actions">
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :title="t('common.delete')"
                  :aria-label="t('common.delete')"
                  @click="askDeleteUsage(usage)"
                >
                  <TrashBin class="w-4! h-4! fill-current" />
                </button>
              </div>
            </article>
          </div>

          <div v-if="usages.length" class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('inventory.showing', { shown: pn(visibleUsages.length), total: pn(usages.length) }) }}
            </p>
            <v-pagination
              v-if="usagePages > 1"
              v-model="usagePage"
              :length="usagePages"
              :total-visible="5"
              density="comfortable"
              color="#00adb5"
              rounded="circle"
            />
          </div>
        </template>
      </div>
    </template>

    <!-- ─── Product details ─── -->
    <v-dialog v-model="detailsOpen" max-width="620" scrollable>
      <v-card v-if="detailsTarget" class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ detailsTarget.name }}</h2>
            <span class="asa-dialog__sub">{{ detailsTarget.sku || t('inventory.noSku') }}</span>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" @click="detailsOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="inv-stock-banner" :class="`inv-stock-banner--${stockState(detailsTarget)}`">
            <span class="asa-pill" :class="stockPill(detailsTarget)">
              {{ t(`inventory.stockStates.${stockState(detailsTarget)}`) }}
            </span>
            <span class="inv-stock-banner__qty">
              {{ qtyText(detailsTarget.currentStock) }} {{ detailsTarget.unit }}
            </span>
            <span class="pf-tiny">
              {{ t('inventory.minStockLevel') }}: {{ qtyText(detailsTarget.minStockLevel) }}
            </span>
          </div>

          <div class="pf-info-grid mt-4!">
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.category') }}</p>
              <p class="pf-info-value">{{ detailsTarget.categoryName || t('inventory.uncategorized') }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.barcode') }}</p>
              <p class="pf-info-value" dir="ltr">{{ detailsTarget.barcode || t('inventory.notSet') }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.purchasePrice') }}</p>
              <p class="pf-info-value">
                <UiPrice v-if="hasValue(detailsTarget.purchasePrice)" :value="detailsTarget.purchasePrice" />
                <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
              </p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.sellingPrice') }}</p>
              <p class="pf-info-value">
                <UiPrice v-if="hasValue(detailsTarget.sellingPrice)" :value="detailsTarget.sellingPrice" />
                <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
              </p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.stockValue') }}</p>
              <p class="pf-info-value">
                <UiPrice :value="detailsTarget.stockValue" :show-words="false" />
              </p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('inventory.margin') }}</p>
              <p class="pf-info-value">
                <UiPrice v-if="hasValue(detailsTarget.margin)" :value="detailsTarget.margin" :show-words="false" />
                <span v-else class="pf-tiny">{{ t('inventory.notSet') }}</span>
              </p>
            </div>
            <div v-if="detailsTarget.description" class="pf-info-cell pf-info-cell--full">
              <p class="pf-info-label">{{ t('inventory.description') }}</p>
              <p class="pf-ua mt-1!">{{ detailsTarget.description }}</p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="detailsOpen = false">
            <span>{{ t('common.close') }}</span>
          </button>
          <button v-if="canCreateProduct" class="asa-btn asa-btn--primary asa-btn--sm" @click="editFromDetails">
            <Pencil class="w-4! h-4! stroke-current" />
            <span>{{ t('common.edit') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Product form ─── -->
    <v-dialog v-model="productDialog" max-width="660" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="inv-dlg-head">
            <span class="asa-tint" :class="editingProduct ? 'asa-tint--teal' : 'asa-tint--green'">
              <Pencil v-if="editingProduct" class="w-4! h-4! stroke-current" />
              <Box v-else class="w-4! h-4! fill-current" />
            </span>
            <div>
              <h2 class="asa-dialog__title">
                {{ editingProduct ? t('inventory.editProduct') : t('inventory.addProduct') }}
              </h2>
              <span class="asa-dialog__sub">
                {{ editingProduct ? editingProduct.name : t('inventory.addProductSubtitle') }}
              </span>
            </div>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" :disabled="savingProduct" @click="productDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="inv-form-grid">
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-p-name">{{ t('inventory.productName') }} *</label>
              <v-text-field
                id="inv-p-name"
                v-model="productForm.name"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openProductHw('name')"
              />
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-sku">{{ t('inventory.sku') }}</label>
              <v-text-field
                id="inv-p-sku"
                v-model="productForm.sku"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                dir="ltr"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openProductHw('sku')"
              />
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-barcode">{{ t('inventory.barcode') }}</label>
              <v-text-field
                id="inv-p-barcode"
                v-model="productForm.barcode"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                dir="ltr"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openProductHw('barcode')"
              />
            </div>

            <div v-if="canViewCategories" class="inv-field">
              <label class="asa-field-label">{{ t('inventory.category') }}</label>
              <v-select
                v-model="productForm.category_id"
                :items="categoryFormOptions"
                item-title="label"
                item-value="value"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
              />
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-unit">{{ t('inventory.unit') }}</label>
              <v-text-field
                id="inv-p-unit"
                v-model="productForm.unit"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openProductHw('unit')"
              />
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-purchase">{{ t('inventory.purchasePrice') }}</label>
              <v-text-field
                id="inv-p-purchase"
                v-model="productForm.purchase_price"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="0.01"
                inputmode="decimal"
                @input="sanitizeProductField('purchase_price')"
              />
              <p v-if="purchasePriceHint" class="inv-hint">{{ purchasePriceHint }}</p>
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-selling">{{ t('inventory.sellingPrice') }}</label>
              <v-text-field
                id="inv-p-selling"
                v-model="productForm.selling_price"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="0.01"
                inputmode="decimal"
                @input="sanitizeProductField('selling_price')"
              />
              <p v-if="sellingPriceHint" class="inv-hint">{{ sellingPriceHint }}</p>
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-p-min">{{ t('inventory.minStockLevel') }}</label>
              <v-text-field
                id="inv-p-min"
                v-model="productForm.min_stock_level"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                @input="sanitizeProductField('min_stock_level', true)"
              />
            </div>

            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-p-desc">{{ t('inventory.description') }}</label>
              <v-textarea
                id="inv-p-desc"
                v-model="productForm.description"
                variant="solo"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openProductHw('description')"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingProduct" @click="productDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingProduct" @click="saveProduct">
            <v-icon v-if="savingProduct" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ editingProduct ? t('common.save') : t('inventory.addProduct') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Category form ─── -->
    <v-dialog v-model="categoryDialog" max-width="520" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="inv-dlg-head">
            <span class="asa-tint" :class="editingCategory ? 'asa-tint--teal' : 'asa-tint--green'">
              <FolderOpen class="w-4! h-4! stroke-current" />
            </span>
            <div>
              <h2 class="asa-dialog__title">
                {{ editingCategory ? t('inventory.editCategory') : t('inventory.addCategory') }}
              </h2>
              <span class="asa-dialog__sub">
                {{ editingCategory ? editingCategory.name : t('inventory.addCategorySubtitle') }}
              </span>
            </div>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" :disabled="savingCategory" @click="categoryDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="inv-form-grid">
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-c-name">{{ t('inventory.categoryName') }} *</label>
              <v-text-field
                id="inv-c-name"
                v-model="categoryForm.name"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openCategoryHw('name')"
              />
            </div>
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-c-desc">{{ t('inventory.description') }}</label>
              <v-textarea
                id="inv-c-desc"
                v-model="categoryForm.description"
                variant="solo"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openCategoryHw('description')"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingCategory" @click="categoryDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingCategory" @click="saveCategory">
            <v-icon v-if="savingCategory" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ t('common.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Stock movement ─── -->
    <v-dialog v-model="stockDialog" max-width="560" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="inv-dlg-head">
            <span class="asa-tint asa-tint--green">
              <ArrowRightLeft class="w-4! h-4! stroke-current" />
            </span>
            <div>
              <h2 class="asa-dialog__title">{{ t('inventory.addStock') }}</h2>
              <span class="asa-dialog__sub">{{ stockProduct?.name }}</span>
            </div>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" :disabled="savingStock" @click="stockDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="stockProduct" class="inv-preview">
            <div>
              <p class="pf-info-label">{{ t('inventory.currentStock') }}</p>
              <p class="pf-info-value">{{ qtyText(stockProduct.currentStock) }} {{ stockProduct.unit }}</p>
            </div>
            <div>
              <p class="pf-info-label">{{ t('inventory.newStock') }}</p>
              <p class="pf-info-value" :class="{ 'asa-amber': projectedStock < 0 }">
                {{ qtyText(Math.max(0, projectedStock)) }} {{ stockProduct.unit }}
              </p>
            </div>
          </div>

          <div class="inv-form-grid mt-4!">
            <div class="inv-field">
              <label class="asa-field-label">{{ t('inventory.movementType') }} *</label>
              <v-select
                v-model="stockForm.movement_type"
                :items="movementFormOptions"
                item-title="label"
                item-value="value"
                variant="solo"
                density="comfortable"
                hide-details
              />
            </div>
            <div class="inv-field">
              <label class="asa-field-label" for="inv-s-qty">{{ t('inventory.quantity') }} *</label>
              <v-text-field
                id="inv-s-qty"
                v-model="stockForm.quantity"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                @input="sanitizeStockField('quantity', true)"
              />
            </div>
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-s-price">{{ t('inventory.unitPrice') }}</label>
              <v-text-field
                id="inv-s-price"
                v-model="stockForm.unit_price"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="0.01"
                inputmode="decimal"
                @input="sanitizeStockField('unit_price')"
              />
              <p v-if="stockUnitPriceHint" class="inv-hint">{{ stockUnitPriceHint }}</p>
            </div>
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-s-ref">{{ t('inventory.reference') }}</label>
              <v-text-field
                id="inv-s-ref"
                v-model="stockForm.reference"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openStockHw('reference')"
              />
            </div>
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-s-desc">{{ t('inventory.description') }}</label>
              <v-textarea
                id="inv-s-desc"
                v-model="stockForm.description"
                variant="solo"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openStockHw('description')"
              />
            </div>
          </div>

          <p class="inv-note">{{ movementHint }}</p>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingStock" @click="stockDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingStock" @click="saveStockMovement">
            <v-icon v-if="savingStock" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ t('common.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Record patient usage ─── -->
    <v-dialog v-model="usageDialog" max-width="620" persistent>
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="inv-dlg-head">
            <span class="asa-tint asa-tint--teal">
              <Users class="w-4! h-4! fill-current" />
            </span>
            <div>
              <h2 class="asa-dialog__title">{{ t('inventory.recordUsage') }}</h2>
              <span class="asa-dialog__sub">{{ t('inventory.recordUsageSubtitle') }}</span>
            </div>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" :disabled="savingUsage" @click="usageDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="inv-form-grid">
            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-u-patient">{{ t('inventory.usagePatient') }} *</label>
              <div v-if="selectedPatient" class="inv-patient">
                <div class="inv-patient__copy">
                  <p class="inv-patient__name">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</p>
                  <p class="inv-patient__meta" dir="ltr">
                    {{ selectedPatient.nationalId || selectedPatient.phone || '---' }}
                  </p>
                </div>
                <button
                  class="pf-icon-btn"
                  type="button"
                  :aria-label="t('common.clear')"
                  @click="clearPatient"
                >
                  <X class="w-4! h-4! stroke-current" />
                </button>
              </div>
              <div v-else class="inv-search">
                <v-text-field
                  id="inv-u-patient"
                  v-model="patientQuery"
                  variant="solo"
                  density="comfortable"
                  hide-details
                  clearable
                  :loading="patientSearching"
                  :placeholder="t('inventory.searchPatientPlaceholder')"
                  prepend-inner-icon="mdi-magnify"
                  @update:model-value="onPatientSearch"
                  @blur="hidePatientResults"
                />
                <div v-if="showPatientResults && patientResults.length" class="inv-search__menu">
                  <button
                    v-for="patient in patientResults"
                    :key="patient.id"
                    type="button"
                    class="inv-search__item"
                    @mousedown.prevent="selectPatient(patient)"
                  >
                    <span class="inv-search__item-name">{{ patient.firstName }} {{ patient.lastName }}</span>
                    <span class="inv-search__item-meta" dir="ltr">
                      {{ patient.nationalId || patient.phone || '---' }}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div class="inv-field inv-field--full">
              <label class="asa-field-label">{{ t('inventory.selectProduct') }} *</label>
              <v-select
                v-model="usageForm.product_id"
                :items="productUsageOptions"
                item-title="title"
                item-value="value"
                variant="solo"
                density="comfortable"
                hide-details
              />
              <p v-if="selectedUsageProduct" class="inv-hint">
                {{ t('inventory.availableStock', { count: qtyText(selectedUsageProduct.currentStock) }) }}
              </p>
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-u-qty">{{ t('inventory.quantity') }} *</label>
              <v-text-field
                id="inv-u-qty"
                v-model="usageForm.quantity"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="1"
                step="1"
                inputmode="numeric"
                @input="sanitizeUsageField('quantity', true)"
              />
            </div>

            <div class="inv-field">
              <label class="asa-field-label" for="inv-u-price">{{ t('inventory.unitPrice') }}</label>
              <v-text-field
                id="inv-u-price"
                v-model="usageForm.unit_price"
                variant="solo"
                density="comfortable"
                hide-details
                type="number"
                min="0"
                step="0.01"
                inputmode="decimal"
                @input="sanitizeUsageField('unit_price')"
              />
              <p v-if="usageUnitPriceHint" class="inv-hint">{{ usageUnitPriceHint }}</p>
            </div>

            <div v-if="selectedPatient" class="inv-field inv-field--full">
              <label class="asa-field-label">{{ t('inventory.visitOptional') }}</label>
              <v-select
                v-model="usageForm.visit_id"
                :items="usageVisitOptions"
                item-title="title"
                item-value="value"
                variant="solo"
                density="comfortable"
                hide-details
                clearable
              />
            </div>

            <div class="inv-field inv-field--full">
              <label class="asa-field-label" for="inv-u-notes">{{ t('common.notes') }}</label>
              <v-textarea
                id="inv-u-notes"
                v-model="usageForm.notes"
                variant="solo"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openUsageHw('notes')"
              />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingUsage" @click="usageDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingUsage" @click="saveUsage">
            <v-icon v-if="savingUsage" size="15" class="pf-spin">mdi-loading</v-icon>
            <span>{{ t('inventory.recordUsage') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Confirmations ─── -->
    <UiConfirmDialog
      :model-value="Boolean(deleteProductTarget)"
      :title="t('inventory.confirmDeleteProduct')"
      :message="deleteProductMessage"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      variant="danger"
      :loading="deletingProduct"
      @update:model-value="deleteProductTarget = null"
      @confirm="confirmDeleteProduct"
    />

    <UiConfirmDialog
      :model-value="Boolean(deleteCategoryTarget)"
      :title="t('inventory.confirmDeleteCategory')"
      :message="deleteCategoryMessage"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      variant="danger"
      :loading="deletingCategory"
      @update:model-value="deleteCategoryTarget = null"
      @confirm="confirmDeleteCategory"
    />

    <UiConfirmDialog
      :model-value="Boolean(deleteUsageTarget)"
      :title="t('inventory.confirmDeleteUsage')"
      :message="deleteUsageMessage"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      variant="warning"
      :loading="deletingUsage"
      @update:model-value="deleteUsageTarget = null"
      @confirm="confirmDeleteUsage"
    />

    <HandwritingDialog
      v-model="productHwOpen"
      :label="productHwLabel"
      :numeric="productHwNumeric"
      @insert="applyProductHw"
    />
    <HandwritingDialog
      v-model="categoryHwOpen"
      :label="categoryHwLabel"
      :numeric="categoryHwNumeric"
      @insert="applyCategoryHw"
    />
    <HandwritingDialog
      v-model="stockHwOpen"
      :label="stockHwLabel"
      :numeric="stockHwNumeric"
      @insert="applyStockHw"
    />
    <HandwritingDialog
      v-model="usageHwOpen"
      :label="usageHwLabel"
      :numeric="usageHwNumeric"
      @insert="applyUsageHw"
    />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import Box from '~/components/icons/Box.vue'
import Wallet from '~/components/icons/Wallet.vue'
import Activity from '~/components/icons/Activity.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import ArrowRightLeft from '~/components/icons/ArrowRightLeft.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Pencil from '~/components/icons/Pencil.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import Security from '~/components/icons/Security.vue'
import Users from '~/components/icons/Users.vue'
import X from '~/components/icons/X.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import { useFormatting } from '~/composables/useFormatting'

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

interface ProductRow {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  categoryId: string | null
  categoryName: string | null
  unit: string | null
  purchasePrice: string | null
  sellingPrice: string | null
  currentStock: string | null
  minStockLevel: string | null
  description: string | null
  stockValue: string | null
  /** Computed locally for the details dialog: selling price - purchase price. */
  margin?: string | null
}

interface CategoryRow {
  id: string
  name: string
  description: string | null
  productCount: number | null
}

interface MovementRow {
  id: string
  productId: string
  productName: string | null
  productSku: string | null
  movementType: 'in' | 'out' | 'adjustment'
  quantity: string | number | null
  unitPrice: string | null
  totalPrice: string | null
  reference: string | null
  referenceType: string | null
  description: string | null
  performedByName: string | null
  performedAt: string
}

interface UsageRow {
  id: string
  patientId: string
  patientName: string | null
  patientLastName: string | null
  productId: string
  productName: string | null
  productSku: string | null
  productUnit: string | null
  visitId: string | null
  visitType: string | null
  quantity: string | number | null
  unitPrice: string | null
  totalPrice: string | null
  performedByName: string | null
  notes: string | null
  usedAt: string
}

interface PatientOption {
  id: string
  firstName: string
  lastName: string
  nationalId: string | null
  phone: string | null
}

interface VisitOption {
  id: string
  visitDate: string
  visitType: string | null
}

type TabKey = 'products' | 'categories' | 'movements' | 'usage'
type StockState = 'healthy' | 'low' | 'out'
type StockFilter = 'all' | StockState
type MovementFilter = 'all' | MovementRow['movementType']

definePageMeta({ roles: ['admin_doctor', 'pharmacy'] })

const { t } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()
const { formatJalaliDateShort, formatPriceWords } = useFormatting()

const PAGE_SIZE = 20

/* ── Access ─────────────────────────────────────────── */
const role = computed(() => user.value?.role || '')
const isAdmin = computed(() => role.value === 'admin_doctor')
const isAllowed = computed(() => isAdmin.value || role.value === 'pharmacy')
/** `/api/inventory/categories` and `/api/inventory/summary` are not granted to `pharmacy`. */
const canViewCategories = computed(() => isAdmin.value)
const canCreateProduct = computed(() => isAllowed.value)
const canDeleteProduct = computed(() => isAdmin.value)
const canManageCategories = computed(() => isAdmin.value)
const canRecordStock = computed(() => isAllowed.value)
const canViewUsage = computed(() => isAllowed.value)
const canDeleteUsage = computed(() => isAdmin.value)

/* ── Data ───────────────────────────────────────────── */
const products = ref<ProductRow[]>([])
const categories = ref<CategoryRow[]>([])
const movements = ref<MovementRow[]>([])
const usages = ref<UsageRow[]>([])

const productsLoading = ref(false)
const productsFailed = ref(false)
const categoriesLoading = ref(false)
const categoriesFailed = ref(false)
const movementsLoading = ref(false)
const movementsFailed = ref(false)
const usagesLoading = ref(false)
const usagesFailed = ref(false)
const refreshing = ref(false)

/* ── Filters & pagination ───────────────────────────── */
const activeTab = ref<TabKey>('products')
const productQuery = ref('')
const stockFilter = ref<StockFilter>('all')
const categoryFilter = ref<string | null>(null)
const categoryQuery = ref('')
const movementQuery = ref('')
const movementFilter = ref<MovementFilter>('all')
const usageQuery = ref('')

const productPage = ref(1)
const movementPage = ref(1)
const usagePage = ref(1)

/* ── Dialogs ────────────────────────────────────────── */
const detailsOpen = ref(false)
const detailsTarget = ref<ProductRow | null>(null)

const productDialog = ref(false)
const savingProduct = ref(false)
const editingProduct = ref<ProductRow | null>(null)
const productForm = ref({
  name: '',
  sku: '',
  barcode: '',
  category_id: null as string | null,
  unit: '',
  purchase_price: '',
  selling_price: '',
  min_stock_level: '',
  description: '',
})

const categoryDialog = ref(false)
const savingCategory = ref(false)
const editingCategory = ref<CategoryRow | null>(null)
const categoryForm = ref({ name: '', description: '' })

const stockDialog = ref(false)
const savingStock = ref(false)
const stockProduct = ref<ProductRow | null>(null)
const stockForm = ref({ movement_type: 'in' as MovementRow['movementType'], quantity: '', unit_price: '', reference: '', description: '' })

const usageDialog = ref(false)
const savingUsage = ref(false)
const usageForm = ref({ product_id: null as string | null, quantity: '', unit_price: '', visit_id: null as string | null, notes: '' })

const deleteProductTarget = ref<ProductRow | null>(null)
const deletingProduct = ref(false)
const deleteCategoryTarget = ref<CategoryRow | null>(null)
const deletingCategory = ref(false)
const deleteUsageTarget = ref<UsageRow | null>(null)
const deletingUsage = ref(false)

/* ── Derived ────────────────────────────────────────── */
const tabs = computed(() => {
  const list: { key: TabKey; label: string; count: number }[] = [
    { key: 'products', label: t('inventory.tabs.products'), count: products.value.length },
  ]
  if (canViewCategories.value) {
    list.push({ key: 'categories', label: t('inventory.tabs.categories'), count: categories.value.length })
  }
  list.push({ key: 'movements', label: t('inventory.tabs.movements'), count: movements.value.length })
  if (canViewUsage.value) {
    list.push({ key: 'usage', label: t('inventory.tabs.patientUsage'), count: usages.value.length })
  }
  return list
})

const primaryAction = computed(() => {
  if (activeTab.value === 'products' && canCreateProduct.value) {
    return { label: t('inventory.addProduct'), icon: Box, filled: true, run: () => openProductDialog() }
  }
  if (activeTab.value === 'categories' && canManageCategories.value) {
    return { label: t('inventory.addCategory'), icon: FolderOpen, filled: false, run: () => openCategoryDialog() }
  }
  if (activeTab.value === 'usage' && canViewUsage.value) {
    return { label: t('inventory.recordUsage'), icon: Users, filled: true, run: () => openUsageDialog() }
  }
  return null
})

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '' && toNumber(value) !== 0
}

function qtyText(value: unknown): string {
  const num = toNumber(value)
  return pn(Number.isInteger(num) ? num : Number(num.toFixed(2)))
}

/** Mirrors the backend summary: `out` is `stock <= 0`, `low` is `0 < stock <= min`. */
function stockState(product: ProductRow): StockState {
  const stock = toNumber(product.currentStock)
  if (stock <= 0) return 'out'
  const min = toNumber(product.minStockLevel)
  if (min > 0 && stock <= min) return 'low'
  return 'healthy'
}

function stockPill(product: ProductRow): string {
  const state = stockState(product)
  if (state === 'out') return 'asa-pill--rose'
  if (state === 'low') return 'asa-pill--amber'
  return 'asa-pill--green'
}

function movementPill(type: MovementRow['movementType']): string {
  if (type === 'in') return 'asa-pill--green'
  if (type === 'out') return 'asa-pill--rose'
  return 'asa-pill--amber'
}

const metrics = computed(() => {
  let low = 0
  let out = 0
  let stockValue = 0
  for (const product of products.value) {
    const state = stockState(product)
    if (state === 'out') out++
    else if (state === 'low') low++
    stockValue += toNumber(product.stockValue)
  }
  return { total: products.value.length, low, out, stockValue }
})

const stockSegments = computed(() => [
  { value: 'all' as StockFilter, label: t('inventory.stockFilters.all'), count: products.value.length },
  { value: 'healthy' as StockFilter, label: t('inventory.stockFilters.healthy'), count: products.value.length - metrics.value.low - metrics.value.out },
  { value: 'low' as StockFilter, label: t('inventory.stockFilters.low'), count: metrics.value.low },
  { value: 'out' as StockFilter, label: t('inventory.stockFilters.out'), count: metrics.value.out },
])

const hasProductFilters = computed(
  () => Boolean(productQuery.value.trim()) || stockFilter.value !== 'all' || Boolean(categoryFilter.value)
)

const visibleProducts = computed(() => {
  const query = productQuery.value.trim().toLowerCase()
  return products.value.filter((product) => {
    if (categoryFilter.value && product.categoryId !== categoryFilter.value) return false
    if (stockFilter.value !== 'all' && stockState(product) !== stockFilter.value) return false
    if (!query) return true
    return [product.name, product.sku, product.barcode, product.categoryName]
      .some((field) => (field || '').toLowerCase().includes(query))
  })
})

const productPages = computed(() => Math.max(1, Math.ceil(visibleProducts.value.length / PAGE_SIZE)))
const pagedProducts = computed(() => visibleProducts.value.slice((productPage.value - 1) * PAGE_SIZE, productPage.value * PAGE_SIZE))

const categoryFilterOptions = computed(() => [
  { value: null, label: t('inventory.allCategories') },
  ...categories.value.map((category) => ({ value: category.id, label: category.name })),
])

const categoryFormOptions = computed(() => categories.value.map((category) => ({ value: category.id, label: category.name })))

const visibleCategories = computed(() => {
  const query = categoryQuery.value.trim().toLowerCase()
  if (!query) return categories.value
  return categories.value.filter((category) =>
    [category.name, category.description].some((field) => (field || '').toLowerCase().includes(query))
  )
})

const movementSegments = computed(() => {
  const count = (type: MovementRow['movementType']) => movements.value.filter((row) => row.movementType === type).length
  return [
    { value: 'all' as MovementFilter, label: t('inventory.stockFilters.all'), count: movements.value.length },
    { value: 'in' as MovementFilter, label: t('inventory.movementTypes.in'), count: count('in') },
    { value: 'out' as MovementFilter, label: t('inventory.movementTypes.out'), count: count('out') },
    { value: 'adjustment' as MovementFilter, label: t('inventory.movementTypes.adjustment'), count: count('adjustment') },
  ]
})

const hasMovementFilters = computed(() => Boolean(movementQuery.value.trim()) || movementFilter.value !== 'all')

const visibleMovements = computed(() => {
  const query = movementQuery.value.trim().toLowerCase()
  return movements.value.filter((movement) => {
    if (movementFilter.value !== 'all' && movement.movementType !== movementFilter.value) return false
    if (!query) return true
    return [movement.productName, movement.productSku, movement.performedByName, movement.reference, movement.description]
      .some((field) => (field || '').toLowerCase().includes(query))
  })
})

const movementPages = computed(() => Math.max(1, Math.ceil(visibleMovements.value.length / PAGE_SIZE)))
const pagedMovements = computed(() => visibleMovements.value.slice((movementPage.value - 1) * PAGE_SIZE, movementPage.value * PAGE_SIZE))

const visibleUsages = computed(() => {
  const query = usageQuery.value.trim().toLowerCase()
  if (!query) return usages.value
  return usages.value.filter((usage) =>
    [usage.patientName, usage.patientLastName, usage.productName, usage.productSku, usage.performedByName, usage.notes]
      .some((field) => (field || '').toLowerCase().includes(query))
  )
})

const usagePages = computed(() => Math.max(1, Math.ceil(visibleUsages.value.length / PAGE_SIZE)))
const pagedUsages = computed(() => visibleUsages.value.slice((usagePage.value - 1) * PAGE_SIZE, usagePage.value * PAGE_SIZE))

const movementFormOptions = computed(() => [
  { value: 'in' as const, label: t('inventory.movementTypes.in') },
  { value: 'out' as const, label: t('inventory.movementTypes.out') },
  { value: 'adjustment' as const, label: t('inventory.movementTypes.adjustment') },
])

function movementTypeLabel(type: string): string {
  if (type === 'in') return t('inventory.movementTypes.in')
  if (type === 'out') return t('inventory.movementTypes.out')
  if (type === 'adjustment') return t('inventory.movementTypes.adjustment')
  return type
}

function signedQty(type: MovementRow['movementType'], quantity: unknown): string {
  const num = toNumber(quantity)
  if (type === 'out') return `− ${qtyText(num)}`
  if (type === 'in') return `+ ${qtyText(num)}`
  return qtyText(num)
}

/**
 * The backend applies `stockChange` for every movement: `in` and `adjustment` add the
 * quantity, `out` subtracts it, and the result is clamped to zero server-side.
 * @see backend/src/modules/inventory/inventory.service.ts
 */
const projectedStock = computed(() => {
  const current = toNumber(stockProduct.value?.currentStock)
  const qty = toNumber(stockForm.value.quantity)
  if (stockForm.value.movement_type === 'out') return current - qty
  return current + qty
})

const movementHint = computed(() => {
  const type = stockForm.value.movement_type
  if (type === 'in') return t('inventory.movementHints.in')
  if (type === 'out') return t('inventory.movementHints.out')
  return t('inventory.movementHints.adjustment')
})

const productUsageOptions = computed(() =>
  products.value.map((product) => ({
    value: product.id,
    title: `${product.name} — ${qtyText(product.currentStock)} ${product.unit || ''}`.trim(),
  }))
)

const selectedUsageProduct = computed(() => products.value.find((product) => product.id === usageForm.value.product_id) || null)

const purchasePriceHint = computed(() => formatPriceWords(productForm.value.purchase_price))
const sellingPriceHint = computed(() => formatPriceWords(productForm.value.selling_price))
const stockUnitPriceHint = computed(() => formatPriceWords(stockForm.value.unit_price))
const usageUnitPriceHint = computed(() => formatPriceWords(usageForm.value.unit_price))

const deleteProductMessage = computed(() => {
  const target = deleteProductTarget.value
  if (!target) return ''
  return t('inventory.confirmDeleteProductText', { name: target.name })
})

const deleteCategoryMessage = computed(() => {
  const target = deleteCategoryTarget.value
  if (!target) return ''
  return t('inventory.confirmDeleteCategoryText', { name: target.name })
})

const deleteUsageMessage = computed(() => {
  const target = deleteUsageTarget.value
  if (!target) return ''
  return t('inventory.confirmDeleteUsageText', { name: `${target.patientName || ''} ${target.patientLastName || ''}`.trim() })
})

/* ── Helpers ────────────────────────────────────────── */
function serverMessage(err: unknown): string | null {
  if (err && typeof err === 'object') {
    const data = (err as { data?: { error?: string; message?: string } }).data
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  return null
}

function errorMessage(err: unknown, fallback: string): string {
  return serverMessage(err) ?? fallback
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '---'
  return formatJalaliDateShort(value)
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '---'
  return pn(moment(value).format('HH:mm'))
}

function cleanDecimal(raw: string): string {
  return raw
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1')
    .replace(/\.(\d{2})\d+/, '.$1')
}

function cleanInteger(raw: string): string {
  const parsed = Math.trunc(toNumber(raw))
  return Number.isNaN(parsed) ? '' : String(parsed)
}

function sanitizeProductField(key: 'purchase_price' | 'selling_price' | 'min_stock_level', integer = false) {
  const current = productForm.value[key]
  if (current === '' || current === null || current === undefined) return
  productForm.value[key] = integer ? cleanInteger(current) : cleanDecimal(current)
}

function sanitizeStockField(key: 'quantity' | 'unit_price', integer = false) {
  const current = stockForm.value[key]
  if (current === '' || current === null || current === undefined) return
  stockForm.value[key] = integer ? cleanInteger(current) : cleanDecimal(current)
}

function sanitizeUsageField(key: 'quantity' | 'unit_price', integer = false) {
  const current = usageForm.value[key]
  if (current === '' || current === null || current === undefined) return
  usageForm.value[key] = integer ? cleanInteger(current) : cleanDecimal(current)
}

/* ── Data fetching ──────────────────────────────────── */
async function fetchProducts() {
  if (!isAllowed.value) return
  productsLoading.value = true
  productsFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<ProductRow[]>>('/api/inventory/products')
    if (res?.success && Array.isArray(res.data)) products.value = res.data
    else productsFailed.value = true
  } catch (err) {
    products.value = []
    productsFailed.value = true
    $toast.error(errorMessage(err, t('inventory.productsLoadError')))
  } finally {
    productsLoading.value = false
  }
}

async function fetchCategories() {
  if (!canViewCategories.value) return
  categoriesLoading.value = true
  categoriesFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<CategoryRow[]>>('/api/inventory/categories')
    if (res?.success && Array.isArray(res.data)) categories.value = res.data
    else categoriesFailed.value = true
  } catch (err) {
    categories.value = []
    categoriesFailed.value = true
    $toast.error(errorMessage(err, t('inventory.categoriesLoadError')))
  } finally {
    categoriesLoading.value = false
  }
}

async function fetchMovements() {
  if (!canRecordStock.value) return
  movementsLoading.value = true
  movementsFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<MovementRow[]>>('/api/inventory/stock-movements')
    if (res?.success && Array.isArray(res.data)) movements.value = res.data
    else movementsFailed.value = true
  } catch (err) {
    movements.value = []
    movementsFailed.value = true
    $toast.error(errorMessage(err, t('inventory.movementsLoadError')))
  } finally {
    movementsLoading.value = false
  }
}

async function fetchUsages() {
  if (!canViewUsage.value) return
  usagesLoading.value = true
  usagesFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<UsageRow[]>>('/api/patient-usage')
    if (res?.success && Array.isArray(res.data)) usages.value = res.data
    else usagesFailed.value = true
  } catch (err) {
    usages.value = []
    usagesFailed.value = true
    $toast.error(errorMessage(err, t('inventory.usagesLoadError')))
  } finally {
    usagesLoading.value = false
  }
}

async function refreshActive() {
  refreshing.value = true
  try {
    if (activeTab.value === 'products') await fetchProducts()
    else if (activeTab.value === 'categories') await fetchCategories()
    else if (activeTab.value === 'movements') await fetchMovements()
    else await fetchUsages()
  } finally {
    refreshing.value = false
  }
}

async function refreshAll() {
  await Promise.all([fetchProducts(), fetchCategories(), fetchMovements(), fetchUsages()])
}

/* ── Product ────────────────────────────────────────── */
function openProductDetails(product: ProductRow) {
  detailsTarget.value = {
    ...product,
    margin:
      hasValue(product.sellingPrice) || hasValue(product.purchasePrice)
        ? String(toNumber(product.sellingPrice) - toNumber(product.purchasePrice))
        : null,
  }
  detailsOpen.value = true
}

function editFromDetails() {
  if (!detailsTarget.value) return
  const target = detailsTarget.value
  detailsOpen.value = false
  openProductDialog(target)
}

function openProductDialog(product?: ProductRow) {
  editingProduct.value = product || null
  productForm.value = product
    ? {
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        category_id: product.categoryId || null,
        unit: product.unit || '',
        purchase_price: product.purchasePrice && toNumber(product.purchasePrice) > 0 ? product.purchasePrice : '',
        selling_price: product.sellingPrice && toNumber(product.sellingPrice) > 0 ? product.sellingPrice : '',
        min_stock_level: product.minStockLevel && toNumber(product.minStockLevel) > 0 ? product.minStockLevel : '',
        description: product.description || '',
      }
    : { name: '', sku: '', barcode: '', category_id: null, unit: '', purchase_price: '', selling_price: '', min_stock_level: '', description: '' }
  productDialog.value = true
}

async function saveProduct() {
  if (!productForm.value.name.trim()) {
    $toast.error(t('inventory.fillRequired'))
    return
  }
  savingProduct.value = true
  try {
    const editing = editingProduct.value
    const url = editing ? `/api/inventory/products/${editing.id}` : '/api/inventory/products'
    const res = await apiFetch<{ success: boolean }>(url, {
      method: editing ? 'PUT' : 'POST',
      body: {
        name: productForm.value.name.trim(),
        sku: productForm.value.sku.trim() || null,
        barcode: productForm.value.barcode.trim() || null,
        category_id: canViewCategories.value ? productForm.value.category_id || null : undefined,
        // `unit` has no `.nullable()` in the Zod schema, so an empty field must be
        // omitted: create falls back to the server default, update keeps the current value.
        unit: productForm.value.unit.trim() || undefined,
        purchase_price: productForm.value.purchase_price === '' ? null : toNumber(productForm.value.purchase_price),
        selling_price: productForm.value.selling_price === '' ? null : toNumber(productForm.value.selling_price),
        min_stock_level: productForm.value.min_stock_level === '' ? null : toNumber(productForm.value.min_stock_level),
        description: productForm.value.description.trim() || null,
      },
    })
    if (res?.success) {
      $toast.success(t(editing ? 'inventory.productUpdated' : 'inventory.productCreated'))
      productDialog.value = false
      await fetchProducts()
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    savingProduct.value = false
  }
}

function askDeleteProduct(product: ProductRow) {
  deleteProductTarget.value = product
}

async function confirmDeleteProduct() {
  const target = deleteProductTarget.value
  if (!target || deletingProduct.value) return
  deletingProduct.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/inventory/products/${target.id}`, { method: 'DELETE' })
    if (res?.success) {
      $toast.success(t('inventory.productDeleted'))
      deleteProductTarget.value = null
      if (detailsTarget.value?.id === target.id) detailsOpen.value = false
      await fetchProducts()
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    deletingProduct.value = false
  }
}

/* ── Category ───────────────────────────────────────── */
function openCategoryDialog(category?: CategoryRow) {
  editingCategory.value = category || null
  categoryForm.value = { name: category?.name || '', description: category?.description || '' }
  categoryDialog.value = true
}

async function saveCategory() {
  if (!categoryForm.value.name.trim()) {
    $toast.error(t('inventory.fillRequired'))
    return
  }
  savingCategory.value = true
  try {
    const editing = editingCategory.value
    const url = editing ? `/api/inventory/categories/${editing.id}` : '/api/inventory/categories'
    const res = await apiFetch<{ success: boolean }>(url, {
      method: editing ? 'PUT' : 'POST',
      body: { name: categoryForm.value.name.trim(), description: categoryForm.value.description.trim() || null },
    })
    if (res?.success) {
      $toast.success(t(editing ? 'inventory.categoryUpdated' : 'inventory.categoryCreated'))
      categoryDialog.value = false
      await fetchCategories()
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    savingCategory.value = false
  }
}

function askDeleteCategory(category: CategoryRow) {
  deleteCategoryTarget.value = category
}

async function confirmDeleteCategory() {
  const target = deleteCategoryTarget.value
  if (!target || deletingCategory.value) return
  deletingCategory.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/inventory/categories/${target.id}`, { method: 'DELETE' })
    if (res?.success) {
      $toast.success(t('inventory.categoryDeleted'))
      deleteCategoryTarget.value = null
      if (categoryFilter.value === target.id) categoryFilter.value = null
      await fetchCategories()
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    deletingCategory.value = false
  }
}

/* ── Stock movement ─────────────────────────────────── */
function openStockDialog(product: ProductRow) {
  stockProduct.value = product
  stockForm.value = { movement_type: 'in', quantity: '', unit_price: '', reference: '', description: '' }
  stockDialog.value = true
}

async function saveStockMovement() {
  const product = stockProduct.value
  if (!product) return
  if (stockForm.value.quantity === '' || toNumber(stockForm.value.quantity) <= 0) {
    $toast.error(t('inventory.fillRequired'))
    return
  }
  const qty = toNumber(stockForm.value.quantity)
  if (stockForm.value.movement_type === 'out' && qty > toNumber(product.currentStock)) {
    $toast.error(t('inventory.insufficientStock', { count: qtyText(product.currentStock) }))
    return
  }
  savingStock.value = true
  try {
    const res = await apiFetch<{ success: boolean }>('/api/inventory/stock-movements', {
      method: 'POST',
      body: {
        product_id: product.id,
        movement_type: stockForm.value.movement_type,
        quantity: qty,
        unit_price: stockForm.value.unit_price === '' ? null : toNumber(stockForm.value.unit_price),
        reference: stockForm.value.reference.trim() || null,
        description: stockForm.value.description.trim() || null,
      },
    })
    if (res?.success) {
      $toast.success(t('inventory.stockUpdated'))
      stockDialog.value = false
      await Promise.all([fetchProducts(), fetchMovements()])
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    savingStock.value = false
  }
}

/* ── Patient usage ──────────────────────────────────── */
const patientQuery = ref('')
const patientResults = ref<PatientOption[]>([])
const patientSearching = ref(false)
const showPatientResults = ref(false)
const selectedPatient = ref<PatientOption | null>(null)
const patientVisits = ref<VisitOption[]>([])
let patientSearchTimer: ReturnType<typeof setTimeout> | null = null

const usageVisitOptions = computed(() => [
  { value: null, title: t('inventory.withoutVisit') },
  ...patientVisits.value.map((visit) => ({
    value: visit.id,
    title: `${visit.visitType || '—'} • ${formatJalaliDateShort(visit.visitDate)}`,
  })),
])

function onPatientSearch(value: string | null) {
  if (patientSearchTimer) clearTimeout(patientSearchTimer)
  showPatientResults.value = false
  const query = (value || '').trim()
  patientQuery.value = value || ''
  if (query.length < 2) {
    patientResults.value = []
    return
  }
  patientSearchTimer = setTimeout(() => searchPatients(query), 350)
}

async function searchPatients(query: string) {
  patientSearching.value = true
  try {
    const res = await apiFetch<ApiEnvelope<PatientOption[]>>(
      `/api/patient-usage/patients/search?q=${encodeURIComponent(query)}`
    )
    if (res?.success && Array.isArray(res.data)) {
      patientResults.value = res.data
      showPatientResults.value = res.data.length > 0
    }
  } catch {
    patientResults.value = []
  } finally {
    patientSearching.value = false
  }
}

function selectPatient(patient: PatientOption) {
  selectedPatient.value = patient
  patientQuery.value = `${patient.firstName} ${patient.lastName}`
  patientResults.value = []
  showPatientResults.value = false
  fetchVisits(patient.id)
}

function clearPatient() {
  selectedPatient.value = null
  patientQuery.value = ''
  patientResults.value = []
  patientVisits.value = []
  showPatientResults.value = false
  usageForm.value.visit_id = null
}

function hidePatientResults() {
  nextTick(() => { showPatientResults.value = false })
}

async function fetchVisits(patientId: string) {
  try {
    const res = await apiFetch<ApiEnvelope<VisitOption[]>>(
      `/api/patient-usage/visits/search?patient_id=${encodeURIComponent(patientId)}`
    )
    patientVisits.value = res?.success && Array.isArray(res.data) ? res.data : []
  } catch {
    patientVisits.value = []
  }
}

function openUsageDialog() {
  clearPatient()
  usageForm.value = { product_id: null, quantity: '', unit_price: '', visit_id: null, notes: '' }
  usageDialog.value = true
}

async function saveUsage() {
  if (!selectedPatient.value || !usageForm.value.product_id || usageForm.value.quantity === '') {
    $toast.error(t('inventory.fillUsageRequired'))
    return
  }
  const qty = toNumber(usageForm.value.quantity)
  if (qty <= 0) {
    $toast.error(t('inventory.fillUsageRequired'))
    return
  }
  const product = selectedUsageProduct.value
  if (product && qty > toNumber(product.currentStock)) {
    $toast.error(t('inventory.insufficientStock', { count: qtyText(product.currentStock) }))
    return
  }
  savingUsage.value = true
  try {
    const res = await apiFetch<{ success: boolean }>('/api/patient-usage', {
      method: 'POST',
      body: {
        patient_id: selectedPatient.value.id,
        product_id: usageForm.value.product_id,
        quantity: qty,
        unit_price: usageForm.value.unit_price === '' ? null : toNumber(usageForm.value.unit_price),
        visit_id: usageForm.value.visit_id || null,
        notes: usageForm.value.notes.trim() || null,
      },
    })
    if (res?.success) {
      $toast.success(t('inventory.usageCreated'))
      usageDialog.value = false
      await Promise.all([fetchUsages(), fetchProducts(), fetchMovements()])
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    savingUsage.value = false
  }
}

function askDeleteUsage(usage: UsageRow) {
  deleteUsageTarget.value = usage
}

async function confirmDeleteUsage() {
  const target = deleteUsageTarget.value
  if (!target || deletingUsage.value) return
  deletingUsage.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/patient-usage/${target.id}`, { method: 'DELETE' })
    if (res?.success) {
      $toast.success(t('inventory.usageDeleted'))
      deleteUsageTarget.value = null
      await Promise.all([fetchUsages(), fetchProducts(), fetchMovements()])
    } else {
      $toast.error(t('inventory.saveError'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('inventory.saveError')))
  } finally {
    deletingUsage.value = false
  }
}

/* ── Handwriting ────────────────────────────────────── */
const {
  handwritingOpen: productHwOpen,
  handwritingLabel: productHwLabel,
  handwritingNumeric: productHwNumeric,
  openHandwriting: openProductHw,
  applyHandwriting: applyProductHw,
} = useHandwritingFields({
  fieldLabels: {
    name: t('inventory.productName'),
    sku: t('inventory.sku'),
    barcode: t('inventory.barcode'),
    unit: t('inventory.unit'),
    description: t('inventory.description'),
  },
  target: productForm,
})

const {
  handwritingOpen: categoryHwOpen,
  handwritingLabel: categoryHwLabel,
  handwritingNumeric: categoryHwNumeric,
  openHandwriting: openCategoryHw,
  applyHandwriting: applyCategoryHw,
} = useHandwritingFields({
  fieldLabels: {
    name: t('inventory.categoryName'),
    description: t('inventory.description'),
  },
  target: categoryForm,
})

const {
  handwritingOpen: stockHwOpen,
  handwritingLabel: stockHwLabel,
  handwritingNumeric: stockHwNumeric,
  openHandwriting: openStockHw,
  applyHandwriting: applyStockHw,
} = useHandwritingFields({
  fieldLabels: {
    reference: t('inventory.reference'),
    description: t('inventory.description'),
  },
  target: stockForm,
})

const {
  handwritingOpen: usageHwOpen,
  handwritingLabel: usageHwLabel,
  handwritingNumeric: usageHwNumeric,
  openHandwriting: openUsageHw,
  applyHandwriting: applyUsageHw,
} = useHandwritingFields({
  fieldLabels: { notes: t('common.notes') },
  target: usageForm,
})

/* ── Helpers for the UI ─────────────────────────────── */
function clearProductFilters() {
  productQuery.value = ''
  stockFilter.value = 'all'
  categoryFilter.value = null
  productPage.value = 1
}

function clearMovementFilters() {
  movementQuery.value = ''
  movementFilter.value = 'all'
  movementPage.value = 1
}

/* ── Reactivity ─────────────────────────────────────── */
watch([productQuery, stockFilter, categoryFilter], () => { productPage.value = 1 })
watch([movementQuery, movementFilter], () => { movementPage.value = 1 })
watch(usageQuery, () => { usagePage.value = 1 })
// Deleting the last row of a page shrinks the page count without changing the
// current page, so watch the counts themselves and pull the cursor back.
watch(productPages, (max) => { if (productPage.value > max) productPage.value = max })
watch(movementPages, (max) => { if (movementPage.value > max) movementPage.value = max })
watch(usagePages, (max) => { if (usagePage.value > max) usagePage.value = max })
watch(tabs, (list) => {
  if (!list.some((tab) => tab.key === activeTab.value)) activeTab.value = 'products'
})

// `immediate` covers a user already restored at setup; the reactive half covers
// async hydration after a client-side login.
watch(
  () => user.value?.role,
  (value) => {
    if (value === 'admin_doctor' || value === 'pharmacy') refreshAll()
  },
  { immediate: true }
)

useSeoMeta({
  title: () => t('inventory.title'),
  description: () => t('inventory.subtitle'),
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
/* ── Section switcher ─────────────────────────────── */
.inv-tabs {
  margin-top: 1.5rem;
}

/* The design system ships rose pills/tints but no rose text helper. */
.inv-rose {
  color: var(--asa-rose);
}

/* Many segments on a narrow phone: let them scroll instead of wrapping badly. */
.inv-seg {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.inv-seg::-webkit-scrollbar {
  display: none;
}

.inv-select {
  flex: 0 1 14rem;
  min-width: 9rem;
  max-width: 14rem;
}

/* ── Table ─────────────────────────────────────────── */
.inv-table-wrap {
  display: block;
}

.inv-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.inv-cell--btn {
  padding: 0;
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}

.inv-cell__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.inv-cell--btn:hover .inv-cell__name {
  color: var(--asa-accent);
}

.dark .inv-cell--btn:hover .inv-cell__name {
  color: var(--asa-accent);
}

.inv-cell__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  overflow-wrap: anywhere;
}

.inv-stock {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1875rem;
}

.inv-stock__qty {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
}

.inv-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
}

.inv-negative {
  color: var(--asa-rose);
}

/* ── Details dialog ────────────────────────────────── */
.inv-stock-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.inv-stock-banner--low {
  background: color-mix(in srgb, var(--asa-amber) 10%, transparent);
  border-color: color-mix(in srgb, var(--asa-amber) 30%, transparent);
}

.inv-stock-banner--out {
  background: color-mix(in srgb, var(--asa-rose) 10%, transparent);
  border-color: color-mix(in srgb, var(--asa-rose) 30%, transparent);
}

.inv-stock-banner__qty {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

/* ── Dialog form ───────────────────────────────────── */
.inv-dlg-head {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.inv-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.inv-field {
  min-width: 0;
}

.inv-field--full {
  grid-column: 1 / -1;
}

.inv-hint {
  margin-top: 0.375rem;
  padding-inline: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  line-height: 1.6;
}

.inv-note {
  margin-top: 1rem;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  border: 1px solid var(--asa-card-ring);
  font-size: 0.75rem;
  line-height: 1.7;
  color: var(--asa-label-2);
}

.inv-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

/* ── Patient search ────────────────────────────────── */
.inv-search {
  position: relative;
}

.inv-search__menu {
  position: absolute;
  z-index: 50;
  inset-inline: 0;
  top: calc(100% + 0.25rem);
  max-height: 15rem;
  overflow-y: auto;
  border-radius: 0.875rem;
  border: 1px solid var(--asa-card-ring);
  background: var(--asa-bg-card);
  box-shadow: 0 18px 40px -20px rgba(17, 24, 39, 0.45);
}

.inv-search__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: none;
  border-top: 1px solid var(--asa-sep);
  background: none;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.inv-search__item:first-child {
  border-top: none;
}

.inv-search__item:hover {
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.inv-search__item-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.inv-search__item-meta {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.inv-patient {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  height: 3.125rem;
  padding: 0.375rem 0.5rem 0.375rem 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.inv-patient__copy {
  min-width: 0;
}

.inv-patient__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.inv-patient__meta {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

/* ── Mobile roster ─────────────────────────────────── */
.inv-roster {
  display: none;
}

.inv-roster__desc {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.inv-roster__money {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 0.5rem;
}

.inv-roster__money-item {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 1099px) {
  .inv-hide-sm {
    display: none !important;
  }
}

@media (max-width: 899px) {
  .inv-table-wrap {
    display: none;
  }

  .inv-roster {
    display: flex;
  }
}

@media (max-width: 640px) {
  .inv-select {
    flex: 1 1 100%;
    max-width: none;
  }

  .inv-form-grid,
  .inv-preview {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
