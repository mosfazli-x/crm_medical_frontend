<template>
  <UiPageContainer>
    <UiPageHeader :title="t('blog.admin.commentsTitle')" :subtitle="t('blog.admin.commentsSubtitle')" />

    <UiContentCard>
      <div class="mb-4 flex flex-wrap gap-2">
        <v-chip
          v-for="status in statusFilters"
          :key="status.value"
          :variant="selectedStatus === status.value ? 'flat' : 'outlined'"
          :color="selectedStatus === status.value ? 'primary' : undefined"
          size="small"
          @click="selectedStatus = selectedStatus === status.value ? '' : status.value"
        >
          {{ status.label }}
          <v-badge
            v-if="status.count > 0"
            :model-value="true"
            :content="status.count"
            color="warning"
            inline
            class="ms-2"
          />
        </v-chip>
      </div>

      <v-data-table
        :headers="headers"
        :items="comments"
        :loading="loading"
        :items-per-page="20"
        hover
      >
        <template #item.authorName="{ item }">
          <div>
            <div class="font-medium">{{ item.authorName }}</div>
            <div class="text-xs text-gray-400">{{ item.authorEmail }}</div>
          </div>
        </template>
        <template #item.content="{ item }">
          <div class="max-w-sm truncate text-sm">{{ item.content }}</div>
        </template>
        <template #item.postTitle="{ item }">
          <NuxtLink
            v-if="item.postSlug"
            :to="`/blog/${item.postSlug}`"
            target="_blank"
            class="text-primary text-xs hover:underline"
          >
            {{ item.postTitle || t('blog.admin.untitled') }}
          </NuxtLink>
        </template>
        <template #item.status="{ item }">
          <v-chip
            size="x-small"
            :color="statusColor(item.status)"
            variant="flat"
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.createdAt="{ item }">
          <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="flex gap-1">
            <v-btn
              v-if="item.status !== 'approved'"
              icon
              size="x-small"
              variant="text"
              color="success"
              @click="approveComment(item.id)"
              :title="t('blog.admin.approve')"
            >
              <v-icon size="18">mdi-check</v-icon>
            </v-btn>
            <v-btn
              v-if="item.status !== 'rejected'"
              icon
              size="x-small"
              variant="text"
              color="warning"
              @click="rejectComment(item.id)"
              :title="t('blog.admin.reject')"
            >
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
              :title="t('blog.admin.delete')"
            >
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </UiContentCard>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card>
        <v-card-title class="text-lg">{{ t('blog.admin.confirmDeleteComment') }}</v-card-title>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">{{ t('blog.admin.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteCommentEntry">
            {{ t('blog.admin.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', roles: ['admin_doctor'] })

const { t } = useI18n()
const { listAllComments, updateCommentStatus, deleteComment } = useBlog()
const nuxtApp = useNuxtApp()

const comments = ref<any[]>([])
const loading = ref(true)
const deleting = ref(false)
const selectedStatus = ref('')
const deleteDialogOpen = ref(false)
const deletingId = ref<string | null>(null)

const allComments = ref<any[]>([])

const statusFilters = computed(() => [
  { value: '', label: t('blog.admin.all'), count: allComments.value.length },
  { value: 'pending', label: t('blog.admin.pending'), count: allComments.value.filter(c => c.status === 'pending').length },
  { value: 'approved', label: t('blog.admin.approved'), count: allComments.value.filter(c => c.status === 'approved').length },
  { value: 'rejected', label: t('blog.admin.rejected'), count: allComments.value.filter(c => c.status === 'rejected').length },
])

const headers = computed(() => [
  { title: t('blog.admin.author'), key: 'authorName', sortable: true },
  { title: t('blog.admin.comment'), key: 'content', sortable: false },
  { title: t('blog.admin.post'), key: 'postTitle', sortable: false },
  { title: t('blog.admin.status'), key: 'status', sortable: true },
  { title: t('blog.admin.date'), key: 'createdAt', sortable: true },
  { title: t('blog.admin.actions'), key: 'actions', sortable: false, align: 'end' as const },
])

const statusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

const loadData = async () => {
  loading.value = true
  try {
    // Always load all comments for accurate counts, then filter client-side
    const result = await listAllComments(1, 500)
    allComments.value = result.data
    // Apply status filter
    if (selectedStatus.value) {
      comments.value = result.data.filter((c: any) => c.status === selectedStatus.value)
    } else {
      comments.value = result.data
    }
  } finally {
    loading.value = false
  }
}

const approveComment = async (id: string) => {
  try {
    await updateCommentStatus(id, 'approved')
    nuxtApp.$toast.success(t('blog.admin.approvedSuccess'))
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  }
}

const rejectComment = async (id: string) => {
  try {
    await updateCommentStatus(id, 'rejected')
    nuxtApp.$toast.success(t('blog.admin.rejectedSuccess'))
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  }
}

const confirmDelete = (item: any) => {
  deletingId.value = item.id
  deleteDialogOpen.value = true
}

const deleteCommentEntry = async () => {
  if (!deletingId.value) return
  deleting.value = true
  try {
    await deleteComment(deletingId.value)
    nuxtApp.$toast.success(t('blog.admin.deletedSuccess'))
    deleteDialogOpen.value = false
    await loadData()
  } catch {
    nuxtApp.$toast.error(t('blog.admin.error'))
  } finally {
    deleting.value = false
  }
}

watch(selectedStatus, () => loadData())
onMounted(() => loadData())


useSeoMeta({
  title: () => t('blog.admin.commentsTitle'),
  description: () => t('blog.admin.commentsSubtitle'),
  robots: 'noindex, nofollow',
})
</script>
