<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Access gate ─── -->
    <div v-if="!isAdmin" class="asa-card pf-empty">
      <div class="asa-tint asa-tint--rose pf-tint-lg">
        <Security class="w-6! h-6! fill-current" />
      </div>
      <div>
        <p class="pf-empty__title">{{ t('blog.admin.deniedTitle') }}</p>
        <p class="pf-empty__desc">{{ t('blog.admin.deniedDesc') }}</p>
      </div>
      <div class="pf-empty__actions">
        <NuxtLink to="/dashboard" class="asa-btn asa-btn--ghost asa-btn--sm">
          <span>{{ t('dashboard.title') }}</span>
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <!-- ─── Header ─── -->
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('blog.admin.title') }}</h1>
          <p class="dash-head__date">{{ t('blog.admin.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <button
            class="asa-btn asa-btn--ghost"
            :disabled="loading"
            :aria-label="t('blog.admin.refresh')"
            @click="refreshAll"
          >
            <v-icon size="16" :class="{ 'pf-spin': loading }">mdi-refresh</v-icon>
          </button>
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="openCategoryDialog">
            <v-icon size="16">mdi-tag-multiple-outline</v-icon>
            <span class="hidden sm:inline">{{ t('blog.admin.manageCategories') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreateEditor">
            <v-icon size="16">mdi-plus</v-icon>
            <span>{{ t('blog.admin.newPost') }}</span>
          </button>
        </div>
      </header>

      <!-- ─── Summary metrics ─── -->
      <div v-if="!stats" class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4!">
        <div v-for="i in 4" :key="`bp-sk-${i}`" class="asa-skel rounded-[22px]! h-28!" />
      </div>
      <div v-else class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4!">
        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--teal">
            <FileText class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(stats.posts.total) }}</p>
            <p class="pf-metric__label">{{ t('blog.admin.totalArticles') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--green">
            <CheckCircle class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value asa-green">{{ pn(stats.posts.published) }}</p>
            <p class="pf-metric__label">{{ t('blog.admin.publishedArticles') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--amber">
            <Pencil class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(stats.posts.drafts) }}</p>
            <p class="pf-metric__label">{{ t('blog.admin.draftArticles') }}</p>
          </div>
        </div>
        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--indigo">
            <Eye class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ pn(stats.posts.totalViews) }}</p>
            <p class="pf-metric__label">{{ t('blog.admin.totalViews') }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Pending comments call to action ─── -->
      <NuxtLink
        v-if="stats && stats.comments.pending > 0"
        to="/admin/blog/comments"
        class="asa-card bl-banner mt-4!"
      >
        <div class="asa-tint asa-tint--amber">
          <ChatDots class="w-5! h-5! fill-current" />
        </div>
        <div class="bl-banner__copy">
          <p class="bl-banner__title">
            {{ t('blog.admin.pendingComments', { count: pn(stats.comments.pending) }) }}
          </p>
          <p class="bl-banner__desc">{{ t('blog.admin.pendingCommentsDesc') }}</p>
        </div>
        <span class="asa-pill asa-pill--amber">{{ t('blog.admin.reviewComments') }}</span>
      </NuxtLink>

      <!-- ─── Article list ─── -->
      <div class="asa-card pf-table-card mt-5!">
        <!-- Toolbar: search + status segments + category + sort -->
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="query"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('blog.admin.searchPlaceholder')"
              :aria-label="t('blog.admin.searchPlaceholder')"
            >
            <button
              v-if="query"
              class="pf-toolbar__clear"
              type="button"
              :aria-label="t('common.clear')"
              @click="query = ''"
            >
              <v-icon size="15">mdi-close</v-icon>
            </button>
          </div>

          <div class="pf-seg" role="group" :aria-label="t('blog.admin.status')">
            <button
              v-for="seg in statusSegments"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': status === seg.value }"
              :aria-pressed="status === seg.value"
              @click="status = seg.value"
            >
              <span>{{ seg.label }}</span>
              <span class="pf-seg__count">{{ pn(seg.count) }}</span>
            </button>
          </div>

          <div class="pf-toolbar__tail">
            <v-select
              v-model="categoryId"
              :items="categoryOptions"
              class="asa-select bl-filter"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              :aria-label="t('blog.admin.category')"
            />
            <v-select
              v-model="sort"
              :items="sortOptions"
              class="asa-select bl-filter"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              :aria-label="t('blog.admin.sort')"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="pf-skel">
          <div v-for="i in 5" :key="`bp-row-${i}`" class="pf-skel__row">
            <div class="asa-skel h-11! w-16! rounded-xl!" />
            <div class="flex-1 space-y-2">
              <div class="asa-skel h-4! w-1/2! rounded-md!" />
              <div class="asa-skel h-3! w-full! rounded-md!" />
            </div>
          </div>
        </div>

        <!-- Load failure -->
        <div v-else-if="loadFailed" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <X class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('blog.admin.fetchError') }}</p>
            <p class="pf-empty__desc">{{ t('blog.admin.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchPosts">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <!-- Empty: nothing at all vs nothing matching the filters -->
        <div v-else-if="posts.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <FileText class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasFilters ? t('blog.admin.noResults') : t('blog.admin.noPostsYet') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasFilters ? t('blog.admin.noResultsDesc') : t('blog.admin.noPostsYetDesc') }}
            </p>
          </div>
          <div v-if="hasFilters" class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
              {{ t('blog.admin.clearFilters') }}
            </button>
          </div>
          <div v-else class="pf-empty__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreateEditor">
              <v-icon size="16">mdi-plus</v-icon>
              <span>{{ t('blog.admin.newPost') }}</span>
            </button>
          </div>
        </div>

        <!-- Roster -->
        <div v-else class="pf-roster">
          <article v-for="post in posts" :key="post.id" class="pf-roster__item">
            <div class="bl-thumb">
              <img
                v-if="post.coverImage && !brokenCovers[post.id]"
                :src="post.coverImage"
                :alt="post.titleFa"
                class="bl-thumb__img"
                loading="lazy"
                @error="markCoverBroken(post.id)"
              >
              <FileText v-else class="w-5! h-5! stroke-current" />
            </div>

            <div class="pf-roster__body">
              <div class="pf-roster__top">
                <h3 class="pf-roster__name">{{ post.titleFa }}</h3>
                <span class="asa-pill" :class="post.isPublished ? 'asa-pill--green' : 'asa-pill--amber'">
                  <span v-if="post.isPublished" class="pf-pulse" />
                  {{ post.isPublished ? t('blog.admin.published') : t('blog.admin.draft') }}
                </span>
              </div>
              <p class="pf-sub bl-excerpt">
                {{ post.excerptFa }}
              </p>
              <div class="pf-roster__meta">
                <span v-if="categoryLabel(post.categoryId)" class="asa-pill pf-pill--neutral">
                  {{ categoryLabel(post.categoryId) }}
                </span>
                <span class="pf-tiny">
                  <v-icon size="13">mdi-eye-outline</v-icon>
                  {{ pn(post.viewCount) }}
                </span>
                <span class="pf-tiny">
                  <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                  {{ post.publishedAt ? formatDate(post.publishedAt) : t('blog.admin.draft') }}
                </span>
                <span v-if="post.authorName" class="pf-tiny">
                  <v-icon size="13">mdi-account-outline</v-icon>
                  {{ post.authorName }}
                </span>
              </div>
            </div>

            <div class="pf-roster__actions">
              <v-switch
                :model-value="post.isPublished"
                color="#00adb5"
                density="compact"
                hide-details
                inset
                :disabled="togglingId === post.id"
                :aria-label="t(post.isPublished ? 'blog.admin.unpublish' : 'blog.admin.publish')"
                @update:model-value="onTogglePublish(post, $event)"
              />
              <a
                v-if="post.isPublished"
                :href="`/blog/${post.slug}`"
                target="_blank"
                rel="noopener"
                class="pf-icon-btn"
                :aria-label="t('blog.admin.viewPublic')"
              >
                <v-icon size="17">mdi-open-in-new</v-icon>
              </a>
              <button
                class="pf-icon-btn"
                :aria-label="t('blog.admin.editPost')"
                @click="openEditEditor(post)"
              >
                <Pencil class="w-4! h-4! stroke-current" />
              </button>
              <button
                class="pf-icon-btn pf-icon-btn--danger"
                :aria-label="t('blog.admin.delete')"
                @click="askDelete(post)"
              >
                <Trash2 class="w-4! h-4! stroke-current" />
              </button>
            </div>
          </article>
        </div>

        <!-- Footer / pagination -->
        <div v-if="!loading && !loadFailed && totalCount > 0" class="pf-card-foot">
          <p class="pf-card-foot__info">
            {{ t('blog.admin.pageInfo', { page, totalPages, total: pn(totalCount) }) }}
          </p>
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            density="comfortable"
            color="#00adb5"
            rounded="circle"
            :disabled="loading"
          />
        </div>
      </div>
    </template>

    <!-- ─── Create / edit dialog ─── -->
    <v-dialog v-model="editorOpen" max-width="1000" persistent scrollable>
      <v-card class="asa-dialog" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">
              {{ editingId ? t('blog.admin.editPost') : t('blog.admin.newPost') }}
            </h2>
            <span class="asa-dialog__sub">
              {{ editingId ? t('blog.admin.editorSubtitleEdit') : t('blog.admin.editorSubtitleNew') }}
            </span>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" @click="closeEditor">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="bl-editor__grid">
            <!-- Main column: the Persian content that is actually required -->
            <div class="bl-editor__main">
              <label class="asa-field-label" for="bl-title-fa">
                {{ t('blog.admin.titleFa') }} <span class="bl-req">*</span>
              </label>
              <input
                id="bl-title-fa"
                v-model="form.title_fa"
                class="asa-input"
                :class="{ 'bl-invalid': errors.title_fa }"
                :aria-invalid="Boolean(errors.title_fa)"
                :aria-describedby="errors.title_fa ? 'bl-err-title-fa' : undefined"
              >
              <p v-if="errors.title_fa" id="bl-err-title-fa" class="bl-err">
                {{ errors.title_fa }}
              </p>

              <label class="asa-field-label" for="bl-slug">
                {{ t('blog.admin.slug') }}
              </label>
              <input
                id="bl-slug"
                v-model="form.slug"
                class="asa-input bl-mono"
                :class="{ 'bl-invalid': errors.slug }"
                :placeholder="t('blog.admin.slugPlaceholder')"
                :aria-invalid="Boolean(errors.slug)"
                @input="slugTouched = true"
              >
              <p class="asa-field-hint">{{ slugHint }}</p>
              <p v-if="errors.slug" class="bl-err">
                {{ errors.slug }}
              </p>

              <label class="asa-field-label" for="bl-excerpt-fa">
                {{ t('blog.admin.excerptFa') }} <span class="bl-req">*</span>
              </label>
              <textarea
                id="bl-excerpt-fa"
                v-model="form.excerpt_fa"
                class="asa-input bl-textarea"
                rows="3"
                :aria-invalid="Boolean(errors.excerpt_fa)"
              />
              <p v-if="errors.excerpt_fa" class="bl-err">
                {{ errors.excerpt_fa }}
              </p>

              <label class="asa-field-label">{{ t('blog.admin.contentFa') }} <span class="bl-req">*</span></label>
              <div v-if="contentLoading" class="bl-editor-loading">
                <v-progress-linear indeterminate color="#00adb5" height="2" />
                <div class="asa-skel mt-3 h-40! rounded-xl!" />
              </div>
              <template v-else>
                <BlogEditor
                  :key="editorKey"
                  v-model="form.content_fa"
                  :placeholder="t('blog.admin.contentPlaceholder')"
                />
                <p v-if="errors.content_fa" class="bl-err">
                  {{ errors.content_fa }}
                </p>
              </template>
            </div>

            <!-- Side column: everything optional -->
            <aside class="bl-editor__side">
              <div class="bl-switch-row">
                <span class="bl-switch-row__label">{{ t('blog.admin.publish') }}</span>
                <v-switch
                  v-model="form.is_published"
                  color="#00adb5"
                  density="compact"
                  hide-details
                  inset
                  :aria-label="t('blog.admin.publish')"
                />
              </div>

              <label class="asa-field-label" for="bl-category">{{ t('blog.admin.category') }}</label>
              <v-select
                id="bl-category"
                v-model="form.category_id"
                :items="editorCategoryOptions"
                class="asa-select"
                item-title="label"
                item-value="value"
                density="compact"
                hide-details
                clearable
                variant="outlined"
                :aria-label="t('blog.admin.category')"
              />

              <label class="asa-field-label" for="bl-cover">{{ t('blog.admin.coverImage') }}</label>
              <input
                id="bl-cover"
                v-model="form.cover_image"
                class="asa-input"
                dir="ltr"
                :placeholder="t('blog.admin.coverImageHint')"
              >
              <div v-if="form.cover_image && !coverPreviewBroken" class="bl-cover-preview">
                <img
                  :src="form.cover_image"
                  :alt="t('blog.admin.coverImage')"
                  @error="coverPreviewBroken = true"
                >
              </div>

              <hr class="bl-divider">

              <p class="bl-side-label">{{ t('blog.admin.englishSection') }}</p>

              <label class="asa-field-label" for="bl-title-en">{{ t('blog.admin.titleEn') }}</label>
              <input id="bl-title-en" v-model="form.title_en" class="asa-input" dir="ltr">

              <label class="asa-field-label" for="bl-excerpt-en">{{ t('blog.admin.excerptEn') }}</label>
              <textarea id="bl-excerpt-en" v-model="form.excerpt_en" class="asa-input bl-textarea" rows="2" dir="ltr" />

              <label class="asa-field-label" for="bl-content-en">{{ t('blog.admin.contentEn') }}</label>
              <textarea id="bl-content-en" v-model="form.content_en" class="asa-input bl-textarea" rows="4" dir="ltr" />
            </aside>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <p class="bl-foot-hint">{{ t('blog.admin.editorFootHint') }}</p>
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="saving" @click="closeEditor">
            {{ t('blog.admin.cancel') }}
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving || contentLoading" @click="savePost">
            <v-icon v-if="saving" size="15" class="pf-spin">mdi-loading</v-icon>
            <span v-else>{{ t('blog.admin.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Category manager ─── -->
    <v-dialog v-model="categoryOpen" max-width="560" scrollable>
      <v-card class="asa-dialog" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('blog.admin.manageCategories') }}</h2>
            <span class="asa-dialog__sub">{{ t('blog.admin.categoriesSubtitle') }}</span>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" @click="categoryOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="bl-cat-add">
            <div class="bl-cat-add__row">
              <div class="bl-cat-add__field">
                <label class="asa-field-label" for="bl-cat-fa">{{ t('blog.admin.categoryNameFa') }}</label>
                <input id="bl-cat-fa" v-model="newCategory.name_fa" class="asa-input" @keyup.enter="addCategory">
              </div>
              <div class="bl-cat-add__field">
                <label class="asa-field-label" for="bl-cat-en">{{ t('blog.admin.categoryNameEn') }}</label>
                <input id="bl-cat-en" v-model="newCategory.name_en" class="asa-input" dir="ltr" @keyup.enter="addCategory">
              </div>
            </div>
            <label class="asa-field-label" for="bl-cat-slug">{{ t('blog.admin.categorySlug') }}</label>
            <input
              id="bl-cat-slug"
              v-model="newCategory.slug"
              class="asa-input bl-mono"
              dir="ltr"
              :placeholder="t('blog.admin.categorySlugHint')"
              :aria-invalid="Boolean(categorySlugError)"
              @keyup.enter="addCategory"
            >
            <p class="asa-field-hint">{{ t('blog.admin.categorySlugHint') }}</p>
            <p v-if="categorySlugError" class="bl-err">
              {{ categorySlugError }}
            </p>
            <button
              class="asa-btn asa-btn--primary asa-btn--sm mt-3!"
              :disabled="savingCategory || !canCreateCategory"
              @click="addCategory"
            >
              <v-icon v-if="savingCategory" size="15" class="pf-spin">mdi-loading</v-icon>
              <v-icon v-else size="16">mdi-plus</v-icon>
              <span>{{ t('blog.admin.addCategory') }}</span>
            </button>
          </div>

          <hr class="bl-divider">

          <div v-if="categories.length === 0" class="bl-cat-empty">
            {{ t('blog.admin.noCategories') }}
          </div>
          <ul v-else class="bl-cat-list">
            <li v-for="cat in categories" :key="cat.id" class="bl-cat-item">
              <div class="bl-cat-item__copy">
                <span class="bl-cat-item__name">{{ cat.nameFa }}</span>
                <span v-if="cat.nameEn" class="bl-cat-item__en" dir="ltr">{{ cat.nameEn }}</span>
                <span class="bl-cat-item__slug" dir="ltr">/{{ cat.slug }}</span>
              </div>
              <button
                class="pf-icon-btn pf-icon-btn--danger"
                :aria-label="t('blog.admin.deleteCategory', { name: cat.nameFa })"
                :disabled="deletingCategoryId === cat.id"
                @click="askDeleteCategory(cat)"
              >
                <Trash2 v-if="deletingCategoryId !== cat.id" class="w-4! h-4! stroke-current" />
                <v-icon v-else size="16" class="pf-spin">mdi-loading</v-icon>
              </button>
            </li>
          </ul>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="categoryOpen = false">
            {{ t('blog.admin.close') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Destructive confirmations ─── -->
    <UiConfirmDialog
      :model-value="Boolean(deleteTarget)"
      :title="t('blog.admin.confirmDelete')"
      :message="deleteMessage"
      :confirm-label="t('blog.admin.delete')"
      :cancel-label="t('blog.admin.cancel')"
      variant="danger"
      :loading="deleting"
      @update:model-value="deleteTarget = null"
      @confirm="confirmDeletePost"
    />

    <UiConfirmDialog
      :model-value="Boolean(unpublishTarget)"
      :title="t('blog.admin.confirmUnpublish')"
      :message="unpublishMessage"
      :confirm-label="t('blog.admin.unpublish')"
      :cancel-label="t('blog.admin.cancel')"
      variant="warning"
      :loading="togglingId !== null"
      @update:model-value="unpublishTarget = null"
      @confirm="confirmUnpublish"
    />

    <UiConfirmDialog
      :model-value="Boolean(categoryDeleteTarget)"
      :title="t('blog.admin.confirmDeleteCategory')"
      :message="categoryDeleteMessage"
      :confirm-label="t('blog.admin.delete')"
      :cancel-label="t('blog.admin.cancel')"
      variant="danger"
      :loading="deletingCategoryId !== null"
      @update:model-value="categoryDeleteTarget = null"
      @confirm="confirmDeleteCategory"
    />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import FileText from '~/components/icons/FileText.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import Pencil from '~/components/icons/Pencil.vue'
import Trash2 from '~/components/icons/Trash2.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Eye from '~/components/icons/Eye.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import Security from '~/components/icons/Security.vue'
import X from '~/components/icons/X.vue'
import type { BlogAdminStats, BlogPostSort } from '~/composables/useBlog'

definePageMeta({ roles: ['admin_doctor'] })

type StatusFilter = 'all' | 'published' | 'draft'

interface BlogPostListItem {
  id: string
  titleFa: string
  titleEn: string | null
  slug: string
  excerptFa: string
  coverImage: string | null
  categoryId: string | null
  isPublished: boolean
  publishedAt: string | null
  viewCount: number | null
  createdAt: string
  authorName: string | null
}

interface BlogCategory {
  id: string
  nameFa: string
  nameEn: string | null
  slug: string
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

const { t, locale } = useI18n()
const { pn, toPersianNum } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { createPost, updatePost, deletePost, getPostById, getAdminStats, listCategories, createCategory, deleteCategory } = useBlog()
const { user } = useAuth()

const isAdmin = computed(() => user.value?.role === 'admin_doctor')

/* ── Data ──────────────────────────────────────────────── */
const posts = ref<BlogPostListItem[]>([])
const categories = ref<BlogCategory[]>([])
const stats = ref<BlogAdminStats | null>(null)

const loading = ref(false)
const loadFailed = ref(false)
const togglingId = ref<string | null>(null)
const brokenCovers = ref<Record<string, boolean>>({})

const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const limit = 20

const query = ref('')
const status = ref<StatusFilter>('all')
const categoryId = ref<string>('all')
const sort = ref<BlogPostSort>('newest')

/* ── Editor ────────────────────────────────────────────── */
const editorOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const contentLoading = ref(false)
const editorKey = ref(0)
const slugTouched = ref(false)
const coverPreviewBroken = ref(false)

const errors = ref<Record<string, string>>({})

const emptyForm = () => ({
  title_fa: '',
  title_en: '',
  slug: '',
  excerpt_fa: '',
  excerpt_en: '',
  content_fa: '',
  content_en: '',
  cover_image: '',
  category_id: null as string | null,
  is_published: false,
})
const form = ref(emptyForm())

/* ── Deletes ───────────────────────────────────────────── */
const deleteTarget = ref<BlogPostListItem | null>(null)
const deleting = ref(false)
const unpublishTarget = ref<BlogPostListItem | null>(null)

/* ── Categories ────────────────────────────────────────── */
const categoryOpen = ref(false)
const newCategory = ref({ name_fa: '', name_en: '', slug: '' })
const categoryError = ref('')
const savingCategory = ref(false)
const deletingCategoryId = ref<string | null>(null)
const categoryDeleteTarget = ref<BlogCategory | null>(null)

/* ── Derived ───────────────────────────────────────────── */
const hasFilters = computed(
  () => Boolean(query.value.trim()) || status.value !== 'all' || categoryId.value !== 'all' || sort.value !== 'newest'
)

const statusSegments = computed(() => [
  { value: 'all' as StatusFilter, label: t('blog.admin.all'), count: stats.value?.posts.total ?? 0 },
  { value: 'published' as StatusFilter, label: t('blog.admin.published'), count: stats.value?.posts.published ?? 0 },
  { value: 'draft' as StatusFilter, label: t('blog.admin.draft'), count: stats.value?.posts.drafts ?? 0 },
])

const categoryOptions = computed(() => [
  { value: 'all', label: t('blog.admin.allCategories') },
  ...categories.value.map((c) => ({ value: c.id, label: c.nameFa })),
  { value: 'none', label: t('blog.admin.uncategorized') },
])

/** The editor's category picker has no "all" row — null means "no category". */
const editorCategoryOptions = computed(() => [
  ...categories.value.map((c) => ({ value: c.id, label: c.nameFa })),
  { value: null, label: t('blog.admin.uncategorized') },
])

const sortOptions = computed(() => [
  { value: 'newest' as BlogPostSort, label: t('blog.admin.sortNewest') },
  { value: 'oldest' as BlogPostSort, label: t('blog.admin.sortOldest') },
  { value: 'title' as BlogPostSort, label: t('blog.admin.sortTitle') },
  { value: 'views' as BlogPostSort, label: t('blog.admin.sortViews') },
])

const categorySlugTaken = computed(() =>
  categories.value.some((c) => c.slug === newCategory.value.slug.trim().toLowerCase())
)

const canCreateCategory = computed(
  () =>
    newCategory.value.name_fa.trim().length >= 2 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newCategory.value.slug.trim()) &&
    !categorySlugTaken.value
)

/** The only inline field error in the category form is the slug. */
const categorySlugError = computed(() =>
  categorySlugTaken.value ? t('blog.admin.categorySlugTaken') : categoryError.value
)

const slugHint = computed(() => (slugTouched.value ? t('blog.admin.slugCustomHint') : t('blog.admin.slugHint')))

const deleteMessage = computed(() => {
  const post = deleteTarget.value
  if (!post) return ''
  return t('blog.admin.confirmDeleteText', { title: post.titleFa })
})

const unpublishMessage = computed(() => {
  const post = unpublishTarget.value
  if (!post) return ''
  return t('blog.admin.confirmUnpublishText', { title: post.titleFa })
})

const categoryDeleteMessage = computed(() => {
  const cat = categoryDeleteTarget.value
  if (!cat) return ''
  return t('blog.admin.categoryDeleteText', { name: cat.nameFa })
})

/* ── Helpers ───────────────────────────────────────────── */
/** Backend failures carry `{ success: false, error }`; everything else does not. */
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

function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const m = moment(date)
  return locale.value === 'fa' ? toPersianNum(m.format('jYYYY/jMM/jDD')) : m.format('YYYY/MM/DD')
}

function categoryLabel(id: string | null | undefined): string {
  if (!id) return t('blog.admin.uncategorized')
  return categories.value.find((c) => c.id === id)?.nameFa ?? t('blog.admin.uncategorized')
}

function markCoverBroken(id: string): void {
  brokenCovers.value = { ...brokenCovers.value, [id]: true }
}

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/* ── Data fetching ─────────────────────────────────────── */
async function fetchPosts() {
  loading.value = true
  loadFailed.value = false
  try {
    const res = await apiFetch<ApiEnvelope<BlogPostListItem[]>>(
      `/api/blog/admin/posts?${new URLSearchParams({
        page: String(page.value),
        limit: String(limit),
        ...(query.value.trim() ? { q: query.value.trim() } : {}),
        ...(status.value !== 'all' ? { status: status.value } : {}),
        ...(categoryId.value !== 'all' ? { category_id: categoryId.value } : {}),
        sort: sort.value,
      }).toString()}`
    )
    if (res.success) {
      posts.value = Array.isArray(res.data) ? res.data : []
      totalPages.value = res.pagination?.totalPages || 1
      totalCount.value = res.pagination?.total || 0
    } else {
      posts.value = []
      totalPages.value = 1
      totalCount.value = 0
    }
  } catch (err) {
    posts.value = []
    totalPages.value = 1
    totalCount.value = 0
    loadFailed.value = true
    $toast.error(errorMessage(err, t('blog.admin.fetchError')))
  } finally {
    loading.value = false
  }
}

async function fetchMeta() {
  // Stats are decoration: if they fail, keep the last known numbers rather than
  // throwing the page into an unhandled rejection.
  const [cats, adminStats] = await Promise.all([listCategories(), getAdminStats().catch(() => null)])
  categories.value = cats as BlogCategory[]
  if (adminStats) stats.value = adminStats
}

async function refreshAll() {
  await Promise.all([fetchPosts(), fetchMeta()])
}

/* ── Editor ────────────────────────────────────────────── */
function openCreateEditor() {
  editingId.value = null
  form.value = emptyForm()
  errors.value = {}
  slugTouched.value = false
  coverPreviewBroken.value = false
  contentLoading.value = false
  editorKey.value++
  editorOpen.value = true
}

async function openEditEditor(post: BlogPostListItem) {
  editingId.value = post.id
  errors.value = {}
  slugTouched.value = false
  coverPreviewBroken.value = false
  editorKey.value++
  // The list endpoint omits the body, so seed what we have and fetch the rest.
  form.value = {
    title_fa: post.titleFa,
    title_en: post.titleEn || '',
    slug: post.slug,
    excerpt_fa: post.excerptFa || '',
    excerpt_en: '',
    content_fa: '',
    content_en: '',
    cover_image: post.coverImage || '',
    category_id: post.categoryId || null,
    is_published: post.isPublished,
  }
  contentLoading.value = true
  editorOpen.value = true

  try {
    const full = await getPostById(post.id)
    if (!full) throw new Error('post not found')
    form.value = {
      ...form.value,
      title_en: full.titleEn || '',
      excerpt_en: full.excerptEn || '',
      content_fa: full.contentFa || '',
      content_en: full.contentEn || '',
      cover_image: full.coverImage || '',
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.loadPostError')))
    editorOpen.value = false
  } finally {
    contentLoading.value = false
  }
}

function closeEditor() {
  if (saving.value) return
  editorOpen.value = false
}

function validate(): boolean {
  const next: Record<string, string> = {}
  if (form.value.title_fa.trim().length < 2) next.title_fa = t('blog.admin.errTitle')
  if (form.value.excerpt_fa.trim().length < 2) next.excerpt_fa = t('blog.admin.errExcerpt')
  if (plainText(form.value.content_fa).length < 2) next.content_fa = t('blog.admin.errContent')
  if (slugTouched.value && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.value.slug.trim())) {
    next.slug = t('blog.admin.errSlug')
  }
  errors.value = next
  return Object.keys(next).length === 0
}

async function savePost() {
  if (saving.value || contentLoading.value) return
  if (!validate()) return

  saving.value = true
  try {
    // Empty optional strings must be null, not "", or the old value is wiped
    // with a blank the editor cannot distinguish from "cleared".
    const optional = (v: string) => (v.trim() ? v.trim() : null)

    const payload: Record<string, unknown> = {
      title_fa: form.value.title_fa.trim(),
      title_en: optional(form.value.title_en),
      excerpt_fa: form.value.excerpt_fa.trim(),
      excerpt_en: optional(form.value.excerpt_en),
      content_fa: form.value.content_fa,
      content_en: optional(form.value.content_en),
      cover_image: optional(form.value.cover_image),
      category_id: form.value.category_id || null,
      is_published: form.value.is_published,
    }
    // Leave the slug out when untouched so the backend keeps auto-generating
    // it from the Persian title.
    if (slugTouched.value) payload.slug = form.value.slug.trim()

    if (editingId.value) await updatePost(editingId.value, payload)
    else await createPost(payload)

    $toast.success(t('blog.admin.savedSuccess'))
    editorOpen.value = false
    await refreshAll()
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    saving.value = false
  }
}

/* ── Publish toggle ────────────────────────────────────── */
async function setPublished(post: BlogPostListItem, next: boolean) {
  const res = await apiFetch<{ success: boolean }>(`/api/blog/posts/${post.id}`, {
    method: 'PATCH',
    body: { is_published: next },
  })
  return res.success
}

async function onTogglePublish(post: BlogPostListItem, next: boolean) {
  if (togglingId.value) return
  // Taking a post offline is the one publish action worth interrupting for.
  if (!next) {
    unpublishTarget.value = post
    return
  }
  togglingId.value = post.id
  const previous = post.isPublished
  post.isPublished = true
  try {
    if (await setPublished(post, true)) {
      post.publishedAt = new Date().toISOString()
      $toast.success(t('blog.admin.publishedToast'))
      await fetchMeta()
    } else {
      post.isPublished = previous
    }
  } catch (err) {
    post.isPublished = previous
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    togglingId.value = null
  }
}

async function confirmUnpublish() {
  const post = unpublishTarget.value
  if (!post || togglingId.value) return
  togglingId.value = post.id
  try {
    if (await setPublished(post, false)) {
      post.isPublished = false
      $toast.success(t('blog.admin.draftToast'))
      unpublishTarget.value = null
      await fetchMeta()
    } else {
      $toast.error(t('blog.admin.error'))
    }
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    togglingId.value = null
  }
}

/* ── Delete ────────────────────────────────────────────── */
function askDelete(post: BlogPostListItem) {
  deleteTarget.value = post
}

async function confirmDeletePost() {
  const post = deleteTarget.value
  if (!post || deleting.value) return
  deleting.value = true
  try {
    await deletePost(post.id)
    $toast.success(t('blog.admin.deletedSuccess'))
    deleteTarget.value = null
    // Stepping back a page avoids landing on an empty last page.
    if (posts.value.length === 1 && page.value > 1) page.value--
    else await fetchPosts()
    await fetchMeta()
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    deleting.value = false
  }
}

/* ── Categories ────────────────────────────────────────── */
function openCategoryDialog() {
  categoryError.value = ''
  categoryOpen.value = true
}

async function addCategory() {
  if (savingCategory.value || !canCreateCategory.value) return
  categoryError.value = ''
  savingCategory.value = true
  try {
    await createCategory({
      name_fa: newCategory.value.name_fa.trim(),
      name_en: newCategory.value.name_en.trim() || null,
      slug: newCategory.value.slug.trim(),
      sort_order: categories.value.length,
    })
    $toast.success(t('blog.admin.categoryCreated'))
    newCategory.value = { name_fa: '', name_en: '', slug: '' }
    await fetchMeta()
  } catch (err) {
    // A server-side reason belongs next to the field; anything else is a
    // transport failure and has no useful place in the form.
    const detail = serverMessage(err)
    if (detail) categoryError.value = detail
    else {
      categoryError.value = ''
      $toast.error(t('blog.admin.error'))
    }
  } finally {
    savingCategory.value = false
  }
}

function askDeleteCategory(cat: BlogCategory) {
  categoryDeleteTarget.value = cat
}

async function confirmDeleteCategory() {
  const cat = categoryDeleteTarget.value
  if (!cat || deletingCategoryId.value) return
  deletingCategoryId.value = cat.id
  try {
    await deleteCategory(cat.id)
    $toast.success(t('blog.admin.categoryDeleted'))
    categoryDeleteTarget.value = null
    await fetchMeta()
    // A deleted category may have been the active filter.
    if (categoryId.value === cat.id) categoryId.value = 'all'
    await fetchPosts()
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    deletingCategoryId.value = null
  }
}

function clearFilters() {
  query.value = ''
  status.value = 'all'
  categoryId.value = 'all'
  sort.value = 'newest'
}

/* ── Reactivity ────────────────────────────────────────── */
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchPosts()
  }, 350)
})

watch([status, categoryId, sort], () => {
  page.value = 1
  fetchPosts()
})

watch(page, () => fetchPosts())

// Single fetch, triggered as soon as the role is known. `immediate` covers a user
// already restored at setup; the reactive half covers async hydration.
watch(
  () => user.value?.role,
  (role) => {
    if (role === 'admin_doctor') refreshAll()
  },
  { immediate: true }
)

useSeoMeta({
  title: () => t('blog.admin.title'),
  description: () => t('blog.admin.subtitle'),
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
/* ── Pending comments banner ───────────────────────────── */
.bl-banner {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  text-decoration: none;
  color: inherit;
  transition: border-color 150ms var(--ease-default), background-color 150ms var(--ease-default);
}

.bl-banner:hover {
  border-color: color-mix(in srgb, var(--asa-amber) 45%, var(--asa-card-ring));
}

.bl-banner__copy {
  flex: 1;
  min-width: 0;
}

.bl-banner__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.bl-banner__desc {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Filters ───────────────────────────────────────────── */
.bl-filter {
  max-width: 11rem;
  min-width: 8.5rem;
  flex: 0 1 auto;
}

/* ── Roster thumbnail ──────────────────────────────────── */
.bl-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  overflow: hidden;
  color: var(--asa-label-3);
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  border: 1px solid var(--asa-card-ring);
}

.bl-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bl-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 0.25rem;
}

/* ── Editor ────────────────────────────────────────────── */
.bl-editor__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .bl-editor__grid {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  }
}

.bl-editor__main,
.bl-editor__side {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.bl-editor__main > .asa-field-label,
.bl-editor__side > .asa-field-label {
  margin-top: 0.75rem;
}

.bl-editor__main > :first-child {
  margin-top: 0;
}

.asa-field-hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: var(--asa-label-3);
  margin-top: 0.25rem;
}

.bl-req {
  color: var(--asa-rose);
  font-weight: 700;
}

.bl-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}

.bl-textarea {
  height: auto;
  min-height: 3rem;
  padding: 0.625rem 0.875rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  font-size: 0.8125rem;
}

.bl-invalid {
  border-color: var(--asa-rose) !important;
}

.bl-err {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-rose);
}

.bl-editor-loading {
  padding: 0.5rem 0;
}

.bl-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  border: 1px solid var(--asa-card-ring);
}

.bl-switch-row__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.bl-cover-preview {
  margin-top: 0.5rem;
  border-radius: 0.875rem;
  overflow: hidden;
  border: 1px solid var(--asa-card-ring);
  aspect-ratio: 16 / 9;
}

.bl-cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bl-divider {
  height: 1px;
  margin: 1.25rem 0 0.25rem;
  background: var(--asa-sep);
}

.bl-side-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--asa-label-3);
  margin-bottom: 0.5rem;
}

.bl-foot-hint {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  max-width: 22rem;
  display: none;
}

@media (min-width: 720px) {
  .bl-foot-hint {
    display: block;
  }
}

/* ── Category manager ──────────────────────────────────── */
.bl-cat-add {
  display: flex;
  flex-direction: column;
}

.bl-cat-add__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 520px) {
  .bl-cat-add__row {
    grid-template-columns: 1fr 1fr;
  }
}

.bl-cat-add__field {
  display: flex;
  flex-direction: column;
}

.bl-cat-empty {
  padding: 2rem 0;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--asa-label-3);
}

.bl-cat-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bl-cat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.25rem;
  border-top: 1px solid var(--asa-sep);
}

.bl-cat-item:first-child {
  border-top: none;
}

.bl-cat-item__copy {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.625rem;
  flex: 1;
  min-width: 0;
}

.bl-cat-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.bl-cat-item__en {
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.bl-cat-item__slug {
  font-size: 0.6875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--asa-label-3);
}
</style>
