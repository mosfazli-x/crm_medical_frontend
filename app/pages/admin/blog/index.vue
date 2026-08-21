<template>
  <UiPageContainer>
    <UiPageHeader :title="t('blog.admin.title')" :subtitle="t('blog.admin.subtitle')">
      <template #actions>
        <v-btn variant="outlined" @click="categoryDialogOpen = true">
          <v-icon start>mdi-tag</v-icon>
          {{ t('blog.admin.manageCategories') }}
        </v-btn>
        <v-btn color="primary" @click="openCreateDialog">
          <v-icon start>mdi-plus</v-icon>
          {{ t('blog.admin.newPost') }}
        </v-btn>
      </template>
    </UiPageHeader>

    <UiContentCard>
      <v-data-table
        :headers="headers"
        :items="posts"
        :loading="loading"
        :items-per-page="20"
        hover
      >
        <template #item.titleFa="{ item }">
          <div class="max-w-xs truncate font-medium">{{ item.titleFa }}</div>
        </template>
        <template #item.isPublished="{ item }">
          <v-chip size="x-small" :color="item.isPublished ? 'success' : 'warning'" variant="flat">
            {{ item.isPublished ? t('blog.admin.published') : t('blog.admin.draft') }}
          </v-chip>
        </template>
        <template #item.viewCount="{ item }">
          <span class="text-gray-500">{{ item.viewCount || 0 }}</span>
        </template>
        <template #item.publishedAt="{ item }">
          <span class="text-xs text-gray-400">{{ item.publishedAt ? formatDate(item.publishedAt) : '-' }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="flex gap-1">
            <v-btn icon size="x-small" variant="text" :href="`/blog/${item.slug}`" target="_blank">
              <v-icon size="18">mdi-open-in-new</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" @click="openEditDialog(item)">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" color="error" @click="confirmDelete(item)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </UiContentCard>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="900" persistent scrollable>
      <v-card>
        <v-card-title class="text-lg font-bold">
          {{ editingPost ? t('blog.admin.editPost') : t('blog.admin.newPost') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.title_fa"
            :label="t('blog.admin.titleFa')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="form.title_en"
            :label="t('blog.admin.titleEn')"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="form.slug"
            :label="t('blog.admin.slug')"
            variant="outlined"
            density="compact"
            class="mb-3"
            :hint="t('blog.admin.slugHint')"
            persistent-hint
          />
          <v-textarea
            v-model="form.excerpt_fa"
            :label="t('blog.admin.excerptFa')"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            class="mb-3"
          />
          <v-textarea
            v-model="form.excerpt_en"
            :label="t('blog.admin.excerptEn')"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            class="mb-3"
          />
          <v-text-field
            v-model="form.cover_image"
            :label="t('blog.admin.coverImage')"
            variant="outlined"
            density="compact"
            class="mb-3"
            :hint="t('blog.admin.coverImageHint')"
            persistent-hint
          />
          <v-select
            v-model="form.category_id"
            :items="categories"
            item-title="nameFa"
            item-value="id"
            :label="t('blog.admin.category')"
            variant="outlined"
            density="compact"
            clearable
            class="mb-3"
          />
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('blog.admin.contentFa') }}
          </label>
          <BlogEditor v-model="form.content_fa" :placeholder="t('blog.admin.contentPlaceholder')" />
          <v-textarea
            v-model="form.content_en"
            :label="t('blog.admin.contentEn')"
            variant="outlined"
            density="compact"
            rows="4"
            auto-grow
            class="mt-4"
          />
          <v-switch
            v-model="form.is_published"
            :label="t('blog.admin.publish')"
            color="primary"
            class="mt-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">{{ t('blog.admin.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="savePost">
            {{ t('blog.admin.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-lg">{{ t('blog.admin.confirmDelete') }}</v-card-title>
        <v-card-text>{{ t('blog.admin.confirmDeleteText') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">{{ t('blog.admin.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deletePostEntry">
            {{ t('blog.admin.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Category Management Dialog -->
    <v-dialog v-model="categoryDialogOpen" max-width="550" scrollable>
      <v-card>
        <v-card-title class="text-lg font-bold">{{ t('blog.admin.manageCategories') }}</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <v-text-field
              v-model="newCategoryName"
              :label="t('blog.admin.categoryNameFa')"
              variant="outlined"
              density="compact"
              class="mb-2"
              @keyup.enter="addCategory"
            />
            <v-text-field
              v-model="newCategorySlug"
              :label="t('blog.admin.categorySlug')"
              variant="outlined"
              density="compact"
              class="mb-2"
              :hint="t('blog.admin.categorySlugHint')"
              persistent-hint
              @keyup.enter="addCategory"
            />
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              :loading="savingCategory"
              :disabled="!newCategoryName || !newCategorySlug"
              @click="addCategory"
            >
              <v-icon start size="16">mdi-plus</v-icon>
              {{ t('blog.admin.addCategory') }}
            </v-btn>
          </div>

          <v-divider class="mb-4" />

          <div v-if="categories.length === 0" class="py-6 text-center text-gray-400">
            {{ t('blog.admin.noCategories') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700"
            >
              <div>
                <span class="font-medium">{{ cat.nameFa }}</span>
                <span v-if="cat.nameEn" class="ms-2 text-sm text-gray-400">{{ cat.nameEn }}</span>
                <span class="ms-2 text-xs text-gray-400">/{{ cat.slug }}</span>
              </div>
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="error"
                :loading="deletingCategoryId === cat.id"
                @click="removeCategory(cat.id)"
              >
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="categoryDialogOpen = false">{{ t('blog.admin.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', roles: ['admin_doctor'] })

const { t } = useI18n()
const { listAllPosts, createPost, updatePost, deletePost, listCategories, getPostBySlug, createCategory, deleteCategory } = useBlog()
const nuxtApp = useNuxtApp()

const posts = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingPost = ref<any>(null)
const deletingId = ref<string | null>(null)

const categoryDialogOpen = ref(false)
const newCategoryName = ref('')
const newCategorySlug = ref('')
const savingCategory = ref(false)
const deletingCategoryId = ref<string | null>(null)

const defaultForm = () => ({
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

const form = ref(defaultForm())

const headers = computed(() => [
  { title: t('blog.admin.titleFa'), key: 'titleFa', sortable: true },
  { title: t('blog.admin.status'), key: 'isPublished', sortable: true },
  { title: t('blog.admin.views'), key: 'viewCount', sortable: true },
  { title: t('blog.admin.publishedAt'), key: 'publishedAt', sortable: true },
  { title: t('blog.admin.actions'), key: 'actions', sortable: false, align: 'end' as const },
])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

const loadData = async () => {
  loading.value = true
  try {
    const [postsResult, cats] = await Promise.all([
      listAllPosts(),
      listCategories(),
    ])
    posts.value = postsResult.data
    categories.value = cats
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingPost.value = null
  form.value = defaultForm()
  dialogOpen.value = true
}

const openEditDialog = async (item: any) => {
  editingPost.value = item
  // Fetch full post content since list endpoint doesn't include it
  const fullPost = await getPostBySlug(item.slug)
  form.value = {
    title_fa: item.titleFa,
    title_en: item.titleEn || '',
    slug: item.slug,
    excerpt_fa: item.excerptFa || '',
    excerpt_en: fullPost?.excerptEn || '',
    content_fa: fullPost?.contentFa || '',
    content_en: fullPost?.contentEn || '',
    cover_image: item.coverImage || '',
    category_id: item.categoryId || null,
    is_published: item.isPublished || false,
  }
  dialogOpen.value = true
}

const savePost = async () => {
  saving.value = true
  try {
    const dto = { ...form.value }
    if (editingPost.value) {
      await updatePost(editingPost.value.id, dto)
    } else {
      await createPost(dto)
    }
    nuxtApp.$toast.success(t('blog.admin.savedSuccess'))
    dialogOpen.value = false
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  } finally {
    saving.value = false
  }
}

const confirmDelete = (item: any) => {
  deletingId.value = item.id
  deleteDialogOpen.value = true
}

const deletePostEntry = async () => {
  if (!deletingId.value) return
  deleting.value = true
  try {
    await deletePost(deletingId.value)
    nuxtApp.$toast.success(t('blog.admin.deletedSuccess'))
    deleteDialogOpen.value = false
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  } finally {
    deleting.value = false
  }
}

const addCategory = async () => {
  if (!newCategoryName.value || !newCategorySlug.value) return
  savingCategory.value = true
  try {
    await createCategory({
      name_fa: newCategoryName.value,
      slug: newCategorySlug.value,
      sort_order: categories.value.length,
    })
    nuxtApp.$toast.success(t('blog.admin.categoryCreated'))
    newCategoryName.value = ''
    newCategorySlug.value = ''
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  } finally {
    savingCategory.value = false
  }
}

const removeCategory = async (id: string) => {
  deletingCategoryId.value = id
  try {
    await deleteCategory(id)
    nuxtApp.$toast.success(t('blog.admin.categoryDeleted'))
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  } finally {
    deletingCategoryId.value = null
  }
}

onMounted(() => loadData())

useSeoMeta({
  title: () => t('blog.admin.title'),
  description: () => t('blog.admin.subtitle'),
  robots: 'noindex, nofollow',
})
</script>
