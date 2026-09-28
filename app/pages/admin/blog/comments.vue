<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Access gate ─── -->
    <div v-if="!isAdmin" class="asa-card pf-empty">
      <div class="asa-tint asa-tint--rose pf-tint-lg">
        <Security class="w-6! h-6! fill-current" />
      </div>
      <div>
        <p class="pf-empty__title">{{ t('blog.admin.deniedTitle') }}</p>
        <p class="pf-empty__desc">{{ t('blog.admin.commentsDeniedDesc') }}</p>
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
          <h1 class="dash-head__title">{{ t('blog.admin.commentsTitle') }}</h1>
          <p class="dash-head__date">{{ t('blog.admin.commentsSubtitle') }}</p>
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
          <NuxtLink to="/admin/blog" class="asa-btn asa-btn--ghost asa-btn--sm">
            <span>{{ t('blog.admin.backToArticles') }}</span>
          </NuxtLink>
          <button
            v-if="pendingCount > 0"
            class="asa-btn asa-btn--primary asa-btn--sm"
            :disabled="bulkBusy"
            @click="approveAllOpen = true"
          >
            <v-icon size="16">mdi-check-all</v-icon>
            <span>{{ t('blog.admin.approveAllPending', { count: pn(pendingCount) }) }}</span>
          </button>
        </div>
      </header>

      <!-- ─── Summary metrics (also the status filter) ─── -->
      <div v-if="!stats" class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4!">
        <div v-for="i in 4" :key="`cm-sk-${i}`" class="asa-skel rounded-[22px]! h-28!" />
      </div>
      <div v-else class="grid! grid-cols-2! min-[880px]:grid-cols-4! gap-3! sm:gap-4!">
        <button
          v-for="metric in metrics"
          :key="metric.value"
          type="button"
          class="asa-card pf-metric cm-metric"
          :class="{ 'cm-metric--on': status === metric.value }"
          :aria-pressed="status === metric.value"
          @click="status = metric.value"
        >
          <div class="asa-tint" :class="metric.tint">
            <component :is="metric.icon" class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value" :class="metric.valueClass">{{ pn(metric.count) }}</p>
            <p class="pf-metric__label">{{ metric.label }}</p>
          </div>
        </button>
      </div>

      <!-- ─── Comment list ─── -->
      <div class="asa-card pf-table-card mt-5!">
        <!-- Toolbar: search + status segments + sort -->
        <div class="pf-toolbar">
          <div class="pf-toolbar__search">
            <span class="pf-toolbar__search-ic">
              <Magnify class="w-4! h-4! stroke-current" />
            </span>
            <input
              v-model="query"
              type="search"
              class="pf-toolbar__input"
              :placeholder="t('blog.admin.commentSearchPlaceholder')"
              :aria-label="t('blog.admin.commentSearchPlaceholder')"
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

          <div class="pf-seg cm-seg" role="group" :aria-label="t('blog.admin.status')">
            <button
              v-for="seg in segments"
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
              v-model="sort"
              :items="sortOptions"
              class="asa-select cm-filter"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              variant="outlined"
              :aria-label="t('blog.admin.sort')"
            />
          </div>
        </div>

        <!-- Bulk actions: only for the rows currently on screen -->
        <div v-if="selectedIds.length && !loading && !loadFailed" class="cm-bulk">
          <div class="cm-bulk__info">
            <span class="asa-pill asa-pill--teal">{{ pn(selectedIds.length) }}</span>
            <span class="cm-bulk__label">{{ t('blog.admin.selectedCount', { count: pn(selectedIds.length) }) }}</span>
          </div>
          <div class="cm-bulk__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="bulkBusy" @click="bulkApprove">
              <v-icon v-if="bulkBusy" size="15" class="pf-spin">mdi-loading</v-icon>
              <v-icon v-else size="15">mdi-check</v-icon>
              <span>{{ t('blog.admin.approveSelected') }}</span>
            </button>
            <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="bulkBusy" @click="bulkRejectOpen = true">
              <v-icon size="15">mdi-close-circle-outline</v-icon>
              <span>{{ t('blog.admin.rejectSelected') }}</span>
            </button>
            <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="bulkBusy" @click="bulkDeleteOpen = true">
              <v-icon size="15">mdi-trash-can-outline</v-icon>
              <span>{{ t('blog.admin.deleteSelected') }}</span>
            </button>
            <button
              class="pf-icon-btn"
              type="button"
              :aria-label="t('blog.admin.clearSelection')"
              :disabled="bulkBusy"
              @click="selectedIds = []"
            >
              <v-icon size="16">mdi-close</v-icon>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="pf-skel">
          <div v-for="i in 6" :key="`cm-row-${i}`" class="pf-skel__row">
            <div class="asa-skel h-11! w-11! rounded-xl!" />
            <div class="flex-1 space-y-2">
              <div class="asa-skel h-4! w-2/3! rounded-md!" />
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
            <p class="pf-empty__title">{{ t('blog.admin.commentsFetchError') }}</p>
            <p class="pf-empty__desc">{{ t('blog.admin.fetchErrorDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchComments">
              {{ t('common.retry') }}
            </button>
          </div>
        </div>

        <!-- Empty: nothing at all vs nothing matching the filters -->
        <div v-else-if="comments.length === 0" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <ChatDots class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">
              {{ hasFilters ? t('blog.admin.noCommentResults') : t('blog.admin.noCommentsYet') }}
            </p>
            <p class="pf-empty__desc">
              {{ hasFilters ? t('blog.admin.noResultsDesc') : t('blog.admin.noCommentsYetDesc') }}
            </p>
          </div>
          <div v-if="hasFilters" class="pf-empty__actions">
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
              {{ t('blog.admin.clearFilters') }}
            </button>
          </div>
        </div>

        <!-- Desktop: moderation table -->
        <div v-else class="cm-table-wrap asa-table-wrap">
          <table class="pf-table">
            <thead>
              <tr>
                <th class="cm-th-check">
                  <input
                    type="checkbox"
                    class="cm-check"
                    :checked="allSelected"
                    :indeterminate.prop="someSelected"
                    :disabled="bulkBusy"
                    :aria-label="t('blog.admin.selectAllOnPage')"
                    @change="toggleSelectAll"
                  >
                </th>
                <th>{{ t('blog.admin.comment') }}</th>
                <th>{{ t('blog.admin.author') }}</th>
                <th>{{ t('blog.admin.post') }}</th>
                <th>{{ t('blog.admin.status') }}</th>
                <th>{{ t('blog.admin.date') }}</th>
                <th class="pf-ta-end">{{ t('blog.admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comment in comments" :key="comment.id" :class="{ 'cm-row--busy': togglingId === comment.id }">
                <td class="pf-pl0">
                  <input
                    type="checkbox"
                    class="cm-check"
                    :checked="isSelected(comment.id)"
                    :disabled="bulkBusy || togglingId === comment.id"
                    :aria-label="t('blog.admin.selectComment', { name: comment.authorName })"
                    @change="toggleSelect(comment.id)"
                  >
                </td>
                <td>
                  <button type="button" class="cm-body" @click="openView(comment)">
                    <span class="cm-body__text">{{ comment.content }}</span>
                    <span class="cm-body__more">{{ t('blog.admin.readMore') }}</span>
                  </button>
                </td>
                <td>
                  <div class="cm-cell">
                    <span class="cm-cell__name">{{ comment.authorName }}</span>
                    <span class="cm-cell__sub" dir="ltr">{{ comment.authorEmail }}</span>
                  </div>
                </td>
                <td>
                  <NuxtLink
                    v-if="comment.postSlug"
                    :to="`/blog/${comment.postSlug}`"
                    target="_blank"
                    rel="noopener"
                    class="cm-link cm-post"
                  >
                    {{ comment.postTitle || t('blog.admin.untitled') }}
                  </NuxtLink>
                  <span v-else class="pf-pill--neutral asa-pill">
                    {{ t('blog.admin.deletedArticle') }}
                  </span>
                </td>
                <td>
                  <span class="asa-pill" :class="statusPill(comment.status)">
                    <span v-if="comment.status === 'pending'" class="pf-pulse" />
                    {{ t(`blog.admin.${comment.status}`) }}
                  </span>
                </td>
                <td>
                  <div class="pf-dt">
                    <p class="pf-dt__date">{{ formatDate(comment.createdAt) }}</p>
                    <p class="pf-dt__time">{{ formatTime(comment.createdAt) }}</p>
                  </div>
                </td>
                <td class="pf-ta-end">
                  <div class="cm-actions">
                    <span v-if="togglingId === comment.id" class="cm-row-busy">
                      <v-icon size="16" class="pf-spin">mdi-loading</v-icon>
                    </span>
                    <template v-else>
                      <button
                        class="pf-icon-btn"
                        type="button"
                        :title="t('blog.admin.readMore')"
                        :aria-label="t('blog.admin.readMore')"
                        @click="openView(comment)"
                      >
                        <Eye class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        v-if="comment.status !== 'approved'"
                        class="pf-icon-btn"
                        type="button"
                        :title="t('blog.admin.approve')"
                        :aria-label="t('blog.admin.approve')"
                        @click="approveOne(comment)"
                      >
                        <CheckCircle class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        v-if="comment.status !== 'rejected'"
                        class="pf-icon-btn"
                        type="button"
                        :title="t('blog.admin.reject')"
                        :aria-label="t('blog.admin.reject')"
                        @click="rejectTarget = comment"
                      >
                        <X class="w-4! h-4! stroke-current" />
                      </button>
                      <button
                        class="pf-icon-btn pf-icon-btn--danger"
                        type="button"
                        :title="t('blog.admin.delete')"
                        :aria-label="t('blog.admin.delete')"
                        @click="deleteTarget = comment"
                      >
                        <Trash2 class="w-4! h-4! stroke-current" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile: roster cards -->
        <div v-if="!loading && !loadFailed && comments.length" class="pf-roster cm-roster">
          <article v-for="comment in comments" :key="comment.id" class="pf-roster__item">
            <span class="cm-avatar">{{ initials(comment.authorName) }}</span>
            <div class="pf-roster__body">
              <div class="pf-roster__top">
                <span class="pf-roster__name">{{ comment.authorName }}</span>
                <span class="asa-pill" :class="statusPill(comment.status)">
                  <span v-if="comment.status === 'pending'" class="pf-pulse" />
                  {{ t(`blog.admin.${comment.status}`) }}
                </span>
              </div>
              <button type="button" class="pf-sub cm-excerpt" @click="openView(comment)">
                {{ comment.content }}
              </button>
              <div class="pf-roster__meta">
                <span class="pf-tiny" dir="ltr">
                  <v-icon size="13">mdi-email-outline</v-icon>
                  {{ comment.authorEmail }}
                </span>
                <span v-if="comment.postTitle" class="pf-tiny">
                  <v-icon size="13">mdi-file-document-outline</v-icon>
                  {{ comment.postTitle }}
                </span>
                <span class="pf-tiny">
                  <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>
            </div>
            <div class="pf-roster__actions">
              <span v-if="togglingId === comment.id" class="cm-row-busy">
                <v-icon size="16" class="pf-spin">mdi-loading</v-icon>
              </span>
              <template v-else>
                <button
                  v-if="comment.status !== 'approved'"
                  class="pf-icon-btn"
                  type="button"
                  :title="t('blog.admin.approve')"
                  :aria-label="t('blog.admin.approve')"
                  @click="approveOne(comment)"
                >
                  <CheckCircle class="w-4! h-4! stroke-current" />
                </button>
                <button
                  v-if="comment.status !== 'rejected'"
                  class="pf-icon-btn"
                  type="button"
                  :title="t('blog.admin.reject')"
                  :aria-label="t('blog.admin.reject')"
                  @click="rejectTarget = comment"
                >
                  <X class="w-4! h-4! stroke-current" />
                </button>
                <button
                  class="pf-icon-btn pf-icon-btn--danger"
                  type="button"
                  :title="t('blog.admin.delete')"
                  :aria-label="t('blog.admin.delete')"
                  @click="deleteTarget = comment"
                >
                  <Trash2 class="w-4! h-4! stroke-current" />
                </button>
              </template>
            </div>
          </article>
        </div>

        <!-- Footer / pagination -->
        <div v-if="!loading && !loadFailed && totalCount > 0" class="pf-card-foot">
          <p class="pf-card-foot__info">
            {{ t('blog.admin.commentsPageInfo', { page, totalPages, total: pn(totalCount) }) }}
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

    <!-- ─── Full comment ─── -->
    <v-dialog v-model="viewOpen" max-width="640" scrollable>
      <v-card v-if="viewTarget" class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('blog.admin.commentDetails') }}</h2>
            <span class="asa-dialog__sub">
              {{ viewTarget.authorName }} · {{ formatDate(viewTarget.createdAt) }}
            </span>
          </div>
          <button class="pf-x" :aria-label="t('common.close')" @click="viewOpen = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="cm-meta">
            <div class="cm-meta__item">
              <span class="asa-tint asa-tint--sm">
                <v-icon size="15">mdi-account-outline</v-icon>
              </span>
              <div>
                <p class="cm-meta__label">{{ t('blog.admin.author') }}</p>
                <p class="cm-meta__value">
                  {{ viewTarget.authorName }}
                  <span class="cm-meta__sub" dir="ltr">{{ viewTarget.authorEmail }}</span>
                </p>
              </div>
            </div>
            <div class="cm-meta__item">
              <span class="asa-tint asa-tint--sm">
                <v-icon size="15">mdi-file-document-outline</v-icon>
              </span>
              <div>
                <p class="cm-meta__label">{{ t('blog.admin.post') }}</p>
                <NuxtLink
                  v-if="viewTarget.postSlug"
                  :to="`/blog/${viewTarget.postSlug}`"
                  target="_blank"
                  rel="noopener"
                  class="cm-link"
                >
                  {{ viewTarget.postTitle || t('blog.admin.untitled') }}
                </NuxtLink>
                <p v-else class="cm-meta__value">{{ t('blog.admin.deletedArticle') }}</p>
              </div>
            </div>
            <div class="cm-meta__item">
              <span class="asa-tint asa-tint--sm">
                <v-icon size="15">mdi-flag-outline</v-icon>
              </span>
              <div>
                <p class="cm-meta__label">{{ t('blog.admin.status') }}</p>
                <span class="asa-pill" :class="statusPill(viewTarget.status)">
                  {{ t(`blog.admin.${viewTarget.status}`) }}
                </span>
              </div>
            </div>
          </div>

          <p class="pf-ua mt-4!">{{ viewTarget.content }}</p>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="viewOpen = false">
            {{ t('blog.admin.close') }}
          </button>
          <button
            v-if="viewTarget.status !== 'rejected'"
            class="asa-btn asa-btn--ghost asa-btn--sm"
            :disabled="togglingId !== null"
            @click="rejectFromView"
          >
            <v-icon size="15">mdi-close-circle-outline</v-icon>
            <span>{{ t('blog.admin.reject') }}</span>
          </button>
          <button
            v-if="viewTarget.status !== 'approved'"
            class="asa-btn asa-btn--primary asa-btn--sm"
            :disabled="togglingId !== null"
            @click="approveFromView"
          >
            <v-icon v-if="togglingId === viewTarget.id" size="15" class="pf-spin">mdi-loading</v-icon>
            <v-icon v-else size="15">mdi-check</v-icon>
            <span>{{ t('blog.admin.approve') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Confirmations ─── -->
    <UiConfirmDialog
      :model-value="Boolean(rejectTarget)"
      :title="t('blog.admin.confirmReject')"
      :message="rejectMessage"
      :confirm-label="t('blog.admin.reject')"
      :cancel-label="t('blog.admin.cancel')"
      variant="warning"
      :loading="togglingId !== null"
      @update:model-value="rejectTarget = null"
      @confirm="confirmReject"
    />

    <UiConfirmDialog
      :model-value="Boolean(deleteTarget)"
      :title="t('blog.admin.confirmDeleteComment')"
      :message="deleteMessage"
      :confirm-label="t('blog.admin.delete')"
      :cancel-label="t('blog.admin.cancel')"
      variant="danger"
      :loading="deletingId !== null"
      @update:model-value="deleteTarget = null"
      @confirm="confirmDelete"
    />

    <UiConfirmDialog
      :model-value="bulkRejectOpen"
      :title="t('blog.admin.confirmReject')"
      :message="t('blog.admin.confirmBulkRejectText', { count: pn(selectedIds.length) })"
      :confirm-label="t('blog.admin.reject')"
      :cancel-label="t('blog.admin.cancel')"
      variant="warning"
      :loading="bulkBusy"
      @update:model-value="bulkRejectOpen = false"
      @confirm="bulkReject"
    />

    <UiConfirmDialog
      :model-value="bulkDeleteOpen"
      :title="t('blog.admin.confirmDeleteSelected')"
      :message="t('blog.admin.confirmBulkDeleteText', { count: pn(selectedIds.length) })"
      :confirm-label="t('blog.admin.delete')"
      :cancel-label="t('blog.admin.cancel')"
      variant="danger"
      :loading="bulkBusy"
      @update:model-value="bulkDeleteOpen = false"
      @confirm="bulkDelete"
    />

    <UiConfirmDialog
      :model-value="approveAllOpen"
      :title="t('blog.admin.confirmApproveAll')"
      :message="t('blog.admin.confirmApproveAllText', { count: pn(pendingCount) })"
      :confirm-label="t('blog.admin.approve')"
      :cancel-label="t('blog.admin.cancel')"
      :loading="bulkBusy"
      @update:model-value="approveAllOpen = false"
      @confirm="confirmApproveAll"
    />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import ChatDots from '~/components/icons/ChatDots.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import Clock from '~/components/icons/Clock.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import Magnify from '~/components/icons/Magnify.vue'
import Eye from '~/components/icons/Eye.vue'
import Trash2 from '~/components/icons/Trash2.vue'
import Security from '~/components/icons/Security.vue'
import X from '~/components/icons/X.vue'
import type { BlogAdminStats, BlogComment, BlogCommentStatus } from '~/composables/useBlog'

definePageMeta({ roles: ['admin_doctor'] })

type StatusFilter = 'all' | BlogCommentStatus

const { t, locale } = useI18n()
const { pn } = useLang()
const { $toast } = useNuxtApp()
const { listAllComments, updateCommentStatus, deleteComment, getAdminStats } = useBlog()
const { user } = useAuth()

const isAdmin = computed(() => user.value?.role === 'admin_doctor')

/* ── Data ────────────────────────────────────────────── */
const comments = ref<BlogComment[]>([])
const stats = ref<BlogAdminStats | null>(null)

const loading = ref(false)
const loadFailed = ref(false)
const togglingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const bulkBusy = ref(false)

const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const limit = 20

const query = ref('')
const status = ref<StatusFilter>('all')
const sort = ref<'newest' | 'oldest'>('newest')
const selectedIds = ref<string[]>([])

/* ── Dialogs ─────────────────────────────────────────── */
const viewOpen = ref(false)
const viewTarget = ref<BlogComment | null>(null)
const rejectTarget = ref<BlogComment | null>(null)
const deleteTarget = ref<BlogComment | null>(null)
const bulkRejectOpen = ref(false)
const bulkDeleteOpen = ref(false)
const approveAllOpen = ref(false)

/* ── Derived ─────────────────────────────────────────── */
const hasFilters = computed(
  () => Boolean(query.value.trim()) || status.value !== 'all' || sort.value !== 'newest'
)

const pendingCount = computed(() => stats.value?.comments.pending ?? 0)

const commentTotal = computed(() => {
  if (!stats.value) return 0
  const { pending, approved, rejected } = stats.value.comments
  return pending + approved + rejected
})

const segments = computed(() => [
  { value: 'all' as StatusFilter, label: t('blog.admin.all'), count: commentTotal.value },
  { value: 'pending' as StatusFilter, label: t('blog.admin.pending'), count: stats.value?.comments.pending ?? 0 },
  { value: 'approved' as StatusFilter, label: t('blog.admin.approved'), count: stats.value?.comments.approved ?? 0 },
  { value: 'rejected' as StatusFilter, label: t('blog.admin.rejected'), count: stats.value?.comments.rejected ?? 0 },
])

const metrics = computed(() => [
  {
    value: 'all' as StatusFilter,
    label: t('blog.admin.totalComments'),
    count: commentTotal.value,
    tint: 'asa-tint--indigo',
    valueClass: '',
    icon: ChatDots,
  },
  {
    value: 'pending' as StatusFilter,
    label: t('blog.admin.pending'),
    count: stats.value?.comments.pending ?? 0,
    tint: 'asa-tint--amber',
    valueClass: '',
    icon: Clock,
  },
  {
    value: 'approved' as StatusFilter,
    label: t('blog.admin.approved'),
    count: stats.value?.comments.approved ?? 0,
    tint: 'asa-tint--green',
    valueClass: 'asa-green',
    icon: CheckCircle,
  },
  {
    value: 'rejected' as StatusFilter,
    label: t('blog.admin.rejected'),
    count: stats.value?.comments.rejected ?? 0,
    tint: 'asa-tint--rose',
    valueClass: '',
    icon: CloseCircle,
  },
])

const sortOptions = computed(() => [
  { value: 'newest' as const, label: t('blog.admin.sortNewest') },
  { value: 'oldest' as const, label: t('blog.admin.sortOldest') },
])

const allSelected = computed(
  () => comments.value.length > 0 && comments.value.every((c) => selectedIds.value.includes(c.id))
)
const someSelected = computed(
  () => !allSelected.value && comments.value.some((c) => selectedIds.value.includes(c.id))
)

const rejectMessage = computed(() => {
  const target = rejectTarget.value
  if (!target) return ''
  return t('blog.admin.confirmRejectText', { name: target.authorName })
})

const deleteMessage = computed(() => {
  const target = deleteTarget.value
  if (!target) return ''
  return t('blog.admin.confirmDeleteCommentText', { name: target.authorName })
})

/* ── Helpers ─────────────────────────────────────────── */
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

function formatDate(value: string): string {
  const date = moment(value)
  return locale.value === 'fa' ? pn(date.format('jYYYY/jMM/jDD')) : date.format('YYYY/MM/DD')
}

function formatTime(value: string): string {
  return pn(moment(value).format('HH:mm'))
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function statusPill(value: BlogCommentStatus): string {
  if (value === 'approved') return 'asa-pill--green'
  if (value === 'rejected') return 'asa-pill--rose'
  return 'asa-pill--amber'
}

function isSelected(id: string): boolean {
  return selectedIds.value.includes(id)
}

function toggleSelect(id: string) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((value) => value !== id)
    : [...selectedIds.value, id]
}

function toggleSelectAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = comments.value.map((c) => c.id)
}

/* ── Data fetching ───────────────────────────────────── */
async function fetchComments() {
  loading.value = true
  loadFailed.value = false
  try {
    const res = await listAllComments(page.value, limit, {
      q: query.value.trim(),
      status: status.value === 'all' ? undefined : status.value,
      sort: sort.value,
    })
    comments.value = res.data
    totalPages.value = res.pagination?.totalPages || 1
    totalCount.value = res.pagination?.total || 0
    // Rows can leave the filter (or the table) between renders.
    const visible = new Set(res.data.map((c) => c.id))
    selectedIds.value = selectedIds.value.filter((id) => visible.has(id))
  } catch (err) {
    comments.value = []
    totalPages.value = 1
    totalCount.value = 0
    loadFailed.value = true
    $toast.error(errorMessage(err, t('blog.admin.commentsFetchError')))
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  // Stats are decoration: keep the last known numbers if the call fails.
  const next = await getAdminStats().catch(() => null)
  if (next) stats.value = next
}

async function refreshAll() {
  await Promise.all([fetchComments(), fetchStats()])
}

/**
 * After a moderation change the row may no longer belong to the active filter.
 * Stepping back one page avoids landing on an empty last page.
 */
async function reloadAfterChange(removed: number) {
  await fetchStats()
  if (removed > 0 && removed >= comments.value.length && page.value > 1) {
    page.value-- // the page watcher refetches
    return
  }
  await fetchComments()
}

/* ── Single moderation ───────────────────────────────── */
async function setStatus(comment: BlogComment, next: BlogCommentStatus): Promise<boolean> {
  if (togglingId.value) return false
  togglingId.value = comment.id
  const previous = comment.status
  comment.status = next
  const leavesFilter = status.value !== 'all' && status.value !== next
  try {
    await updateCommentStatus(comment.id, next)
    $toast.success(t(`blog.admin.${next}Success`))
    await reloadAfterChange(leavesFilter ? 1 : 0)
    return true
  } catch (err) {
    comment.status = previous
    $toast.error(errorMessage(err, t('blog.admin.error')))
    return false
  } finally {
    togglingId.value = null
  }
}

function openView(comment: BlogComment) {
  viewTarget.value = comment
  viewOpen.value = true
}

function approveOne(comment: BlogComment) {
  setStatus(comment, 'approved')
}

async function approveFromView() {
  const target = viewTarget.value
  if (!target) return
  if (await setStatus(target, 'approved')) viewOpen.value = false
}

async function rejectFromView() {
  const target = viewTarget.value
  if (!target) return
  if (await setStatus(target, 'rejected')) viewOpen.value = false
}

async function confirmReject() {
  const target = rejectTarget.value
  if (!target) return
  const id = target.id
  rejectTarget.value = null
  if (await setStatus(target, 'rejected') && viewTarget.value?.id === id) viewOpen.value = false
}

async function confirmDelete() {
  const target = deleteTarget.value
  if (!target || deletingId.value) return
  deletingId.value = target.id
  const wasViewing = viewTarget.value?.id === target.id
  try {
    await deleteComment(target.id)
    $toast.success(t('blog.admin.deletedSuccess'))
    deleteTarget.value = null
    selectedIds.value = selectedIds.value.filter((id) => id !== target.id)
    if (wasViewing) viewOpen.value = false
    await reloadAfterChange(1)
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    deletingId.value = null
  }
}

/* ── Bulk moderation ─────────────────────────────────── */
interface BulkResult {
  done: number
  failed: number
}

async function applyBulk(
  ids: string[],
  next: BlogCommentStatus,
  doneKey: string,
  silent = false
): Promise<BulkResult> {
  const results = await Promise.allSettled(ids.map((id) => updateCommentStatus(id, next)))
  const failed = results.filter((result) => result.status === 'rejected').length
  const done = results.length - failed

  if (!silent) {
    if (failed === 0) {
      $toast.success(t(doneKey, { count: pn(done) }))
    } else if (done === 0) {
      $toast.error(t('blog.admin.bulkFailed'))
    } else {
      $toast.warning(t('blog.admin.bulkPartial', { done: pn(done), failed: pn(failed) }))
    }
  }
  return { done, failed }
}

async function bulkApprove() {
  if (bulkBusy.value || !selectedIds.value.length) return
  const ids = [...selectedIds.value]
  bulkBusy.value = true
  try {
    const { done } = await applyBulk(ids, 'approved', 'blog.admin.bulkApprovedDone')
    selectedIds.value = []
    await reloadAfterChange(status.value === 'pending' ? done : 0)
  } finally {
    bulkBusy.value = false
  }
}

async function bulkReject() {
  if (bulkBusy.value || !selectedIds.value.length) return
  const ids = [...selectedIds.value]
  bulkRejectOpen.value = false
  bulkBusy.value = true
  try {
    const { done } = await applyBulk(ids, 'rejected', 'blog.admin.bulkRejectedDone')
    selectedIds.value = []
    await reloadAfterChange(status.value === 'pending' ? done : 0)
  } finally {
    bulkBusy.value = false
  }
}

async function bulkDelete() {
  if (bulkBusy.value || !selectedIds.value.length) return
  const ids = [...selectedIds.value]
  bulkDeleteOpen.value = false
  bulkBusy.value = true
  try {
    const results = await Promise.allSettled(ids.map((id) => deleteComment(id)))
    const failed = results.filter((result) => result.status === 'rejected').length
    const done = results.length - failed
    if (failed === 0) {
      $toast.success(t('blog.admin.bulkDeletedDone', { count: pn(done) }))
    } else if (done === 0) {
      $toast.error(t('blog.admin.bulkFailed'))
    } else {
      $toast.warning(t('blog.admin.bulkPartial', { done: pn(done), failed: pn(failed) }))
    }
    selectedIds.value = []
    await reloadAfterChange(done)
  } finally {
    bulkBusy.value = false
  }
}

async function confirmApproveAll() {
  if (bulkBusy.value || !pendingCount.value) return
  approveAllOpen.value = false
  bulkBusy.value = true
  try {
    // Walk the pending queue oldest-first, capped so one click cannot hammer
    // the API with an unbounded number of requests.
    const total = pendingCount.value
    const maxComments = 500
    const pages = Math.min(Math.ceil(total / 100), Math.ceil(maxComments / 100))
    const ids: string[] = []
    for (let index = 1; index <= pages; index++) {
      const res = await listAllComments(index, 100, { status: 'pending', sort: 'oldest' })
      ids.push(...res.data.map((comment) => comment.id))
    }

    if (!ids.length) {
      $toast.error(t('blog.admin.error'))
      return
    }

    const { done } = await applyBulk(ids, 'approved', 'blog.admin.bulkApprovedDone')
    if (done < total) {
      $toast.warning(t('blog.admin.approveAllCapped', { done: pn(done), total: pn(total) }))
    }
    await reloadAfterChange(done)
  } catch (err) {
    $toast.error(errorMessage(err, t('blog.admin.error')))
  } finally {
    bulkBusy.value = false
  }
}

function clearFilters() {
  query.value = ''
  status.value = 'all'
  sort.value = 'newest'
}

/* ── Reactivity ──────────────────────────────────────── */
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    selectedIds.value = []
    fetchComments()
  }, 350)
})

watch([status, sort], () => {
  page.value = 1
  selectedIds.value = []
  fetchComments()
})

watch(page, () => {
  selectedIds.value = []
  fetchComments()
})

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
  title: () => t('blog.admin.commentsTitle'),
  description: () => t('blog.admin.commentsSubtitle'),
  robots: 'noindex, nofollow',
})
</script>

<style scoped>
/* ── Metric cards double as the status filter ─────────── */
.cm-metric {
  font: inherit;
  color: inherit;
  text-align: start;
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), transform 150ms var(--ease-default);
}

.cm-metric:hover {
  border-color: color-mix(in srgb, var(--asa-teal) 40%, var(--asa-card-ring));
  transform: translateY(-1px);
}

.cm-metric--on {
  border-color: color-mix(in srgb, var(--asa-teal) 55%, var(--asa-card-ring));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--asa-teal) 35%, transparent);
}

.cm-filter {
  flex: 1 1 190px;
  max-width: 240px;
}

/* Four status segments do not fit a narrow phone, so they scroll sideways. */
@media (max-width: 640px) {
  .cm-seg {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .cm-seg::-webkit-scrollbar {
    display: none;
  }
}

/* ── Bulk action strip ───────────────────────────────── */
.cm-bulk {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.625rem 1rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-teal) 6%, transparent);
}

.cm-bulk__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.cm-bulk__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.cm-bulk__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ── Table ───────────────────────────────────────────── */
.cm-table-wrap {
  display: block;
}

.cm-th-check {
  width: 2.5rem;
}

.cm-check {
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--asa-teal);
  cursor: pointer;
}

.cm-check:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cm-row--busy {
  opacity: 0.6;
}

.cm-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
}

.cm-row-busy {
  display: inline-flex;
  padding: 0.4rem;
  color: var(--asa-teal);
}

.cm-body {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  max-width: 26rem;
  padding: 0;
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}

.cm-body__text {
  font-size: 0.8125rem;
  color: var(--asa-label);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cm-body:hover .cm-body__text {
  color: var(--asa-teal);
}

.cm-body__more {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.cm-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cm-cell__name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.cm-cell__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  overflow-wrap: anywhere;
}

.cm-post {
  display: inline-block;
  max-width: 13rem;
  font-size: 0.8125rem;
}

.cm-link {
  color: var(--asa-teal);
  text-decoration: none;
  overflow-wrap: anywhere;
  transition: color 150ms var(--ease-default);
}

.cm-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ── Mobile roster ───────────────────────────────────── */
.cm-roster {
  display: none;
}

.cm-avatar {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-teal) 14%, transparent);
  color: var(--asa-teal);
  font-size: 0.75rem;
  font-weight: 700;
}

.cm-excerpt {
  display: -webkit-box;
  width: 100%;
  margin-top: 0.375rem;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.8125rem;
  line-height: 1.6;
  text-align: start;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
}

.cm-excerpt:hover {
  color: var(--asa-teal);
}

/* ── Dialog meta grid ────────────────────────────────── */
.cm-meta {
  display: grid;
  gap: 0.875rem;
}

.cm-meta__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.cm-meta__label {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.cm-meta__value {
  font-size: 0.8125rem;
  color: var(--asa-label);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem 0.5rem;
}

.cm-meta__sub {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

@media (max-width: 899px) {
  .cm-table-wrap {
    display: none;
  }

  .cm-roster {
    display: flex;
  }
}

@media (max-width: 640px) {
  .cm-filter {
    flex: 1 1 100%;
    max-width: none;
  }
}
</style>
