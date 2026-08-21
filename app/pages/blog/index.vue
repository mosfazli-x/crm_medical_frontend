<template>
  <div class="blog-page">
    <header class="blog-header">
      <div class="blog-header-inner">
        <NuxtLink to="/" class="blog-back-btn dir-ltr">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          <span>{{ t('blog.backToHome') }}</span>
        </NuxtLink>
        <h1 class="blog-title">{{ t('blog.title') }}</h1>
        <p class="blog-subtitle">{{ t('blog.subtitle') }}</p>
      </div>
    </header>

    <div class="blog-container">
      <div v-if="categories.length > 0" class="blog-categories">
        <button
          v-for="cat in allCategories"
          :key="cat.id"
          class="blog-category-chip"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = selectedCategory === cat.id ? '' : cat.id"
        >
          {{ cat.nameFa }}
        </button>
      </div>

      <div v-if="loading" class="blog-loading">
        <div class="blog-spinner" />
      </div>

      <div v-else-if="posts.length === 0" class="blog-empty">
        <p>{{ t('blog.noPosts') }}</p>
      </div>

      <div v-else class="blog-grid">
        <NuxtLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="blog-card"
        >
          <div v-if="post.coverImage" class="blog-card-image">
            <img :src="post.coverImage" :alt="post.titleFa" loading="lazy" />
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
              <span v-if="post.viewCount"> · {{ post.viewCount }} {{ t('blog.views') }}</span>
            </div>
            <h2 class="blog-card-title">{{ post.titleFa }}</h2>
            <p class="blog-card-excerpt">{{ post.excerptFa }}</p>
            <span class="blog-card-read">{{ t('blog.readMore') }} →</span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="pagination.totalPages > 1" class="blog-pagination">
        <button
          :disabled="currentPage <= 1"
          class="blog-page-btn"
          @click="changePage(currentPage - 1)"
        >
          {{ t('blog.prev') }}
        </button>
        <span class="blog-page-info">{{ currentPage }} / {{ pagination.totalPages }}</span>
        <button
          :disabled="currentPage >= pagination.totalPages"
          class="blog-page-btn"
          @click="changePage(currentPage + 1)"
        >
          {{ t('blog.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { t } = useI18n()
const { listPublishedPosts, listCategories } = useBlog()

const posts = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref('')
const currentPage = ref(1)
const loading = ref(true)
const pagination = ref({ page: 1, limit: 12, total: 0, totalPages: 0 })

const allCategories = computed(() => [
  { id: '', nameFa: t('blog.allCategories') },
  ...categories.value,
])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const loadData = async () => {
  loading.value = true
  try {
    const [postsResult, cats] = await Promise.all([
      listPublishedPosts(currentPage.value, 12, selectedCategory.value || undefined),
      listCategories(),
    ])
    posts.value = postsResult.data
    pagination.value = postsResult.pagination
    categories.value = cats
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  currentPage.value = page
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(selectedCategory, () => {
  currentPage.value = 1
  loadData()
})

onMounted(() => loadData())

useHead({
  title: t('blog.title'),
})
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: var(--ink);
  color: var(--periwinkle);
  font-family: var(--font-sans);
}

.blog-header {
  padding: 4rem 1.5rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.blog-header-inner {
  max-width: 800px;
  margin: 0 auto;
}

.blog-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  color: var(--champagne);
  text-decoration: none;
  font-size: 0.875rem;
  font-family: var(--font-sans);
  letter-spacing: 0.03em;
  border: 1px solid oklch(100% 0 0 / 0.08);
  border-radius: 9999px;
  background: oklch(100% 0 0 / 0.04);
  backdrop-filter: blur(8px);
  transition: all 0.3s var(--ease-luxe);
}

.blog-back-btn:hover {
  background: oklch(100% 0 0 / 0.08);
  border-color: oklch(100% 0 0 / 0.15);
  color: white;
  transform: translateX(-3px);
}

.blog-back-btn svg {
  flex-shrink: 0;
  transition: transform 0.3s var(--ease-luxe);
}

.blog-back-btn:hover svg {
  transform: translateX(-2px);
}

.blog-title {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 300;
  color: white;
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.blog-subtitle {
  color: var(--iceblue);
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0;
  opacity: 0.7;
}

.blog-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.blog-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  justify-content: center;
}

.blog-category-chip {
  padding: 0.4rem 1rem;
  border: 1px solid var(--border);
  border-radius: 2rem;
  background: transparent;
  color: var(--periwinkle);
  font-size: 0.85rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.3s var(--ease-luxe);
}

.blog-category-chip:hover,
.blog-category-chip.active {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: white;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.blog-card {
  background: oklch(20% 0.012 268);
  border: 1px solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s var(--ease-luxe);
}

.blog-card:hover {
  border-color: var(--sapphire);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px oklch(0% 0 0 / 0.3);
}

.blog-card-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.blog-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-luxe);
}

.blog-card:hover .blog-card-image img {
  transform: scale(1.05);
}

.blog-card-body {
  padding: 1.25rem;
}

.blog-card-meta {
  font-size: 0.75rem;
  color: var(--iceblue);
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.blog-card-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 400;
  color: white;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.blog-card-excerpt {
  font-size: 0.9rem;
  color: var(--periwinkle);
  opacity: 0.6;
  line-height: 1.6;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-read {
  font-size: 0.8rem;
  color: var(--champagne);
  font-weight: 500;
  transition: opacity 0.3s;
}

.blog-card:hover .blog-card-read {
  opacity: 0.8;
}

.blog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.blog-page-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--periwinkle);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.3s;
}

.blog-page-btn:hover:not(:disabled) {
  background: var(--sapphire);
  border-color: var(--sapphire);
  color: white;
}

.blog-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.blog-page-info {
  font-size: 0.85rem;
  color: var(--iceblue);
  opacity: 0.5;
}

.blog-loading {
  display: flex;
  justify-content: center;
  padding: 4rem;
}

.blog-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--champagne);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.blog-empty {
  text-align: center;
  padding: 4rem;
  color: var(--iceblue);
  opacity: 0.5;
}

@media (max-width: 640px) {
  .blog-title {
    font-size: 2rem;
  }
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
