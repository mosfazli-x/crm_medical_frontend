<template>
  <div class="blog-page">
    <header class="blog-detail-header">
      <div class="blog-detail-header-inner">
        <NuxtLink to="/blog" class="blog-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          <span>{{ t('blog.backToList') }}</span>
        </NuxtLink>
      </div>
    </header>

    <div v-if="loading" class="blog-loading">
      <div class="blog-spinner" />
    </div>

    <div v-else-if="!post" class="blog-container">
      <div class="blog-empty">
        <p>{{ t('blog.notFound') }}</p>
        <NuxtLink to="/blog" class="blog-back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          <span>{{ t('blog.backToList') }}</span>
        </NuxtLink>
      </div>
    </div>

    <article v-else class="blog-article">
      <div class="blog-article-header">
        <div class="blog-article-meta">
          <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
          <span> · {{ post.viewCount }} {{ t('blog.views') }}</span>
          <span v-if="post.authorName"> · {{ post.authorName }}</span>
        </div>
        <h1 class="blog-article-title">{{ post.titleFa }}</h1>
        <p v-if="post.excerptFa" class="blog-article-excerpt">{{ post.excerptFa }}</p>
      </div>

      <div v-if="post.coverImage" class="blog-article-cover">
        <img :src="post.coverImage" :alt="post.titleFa" />
      </div>

      <div class="blog-article-content" v-html="post.contentFa" />

      <div class="blog-comments-section">
        <h2 class="blog-comments-title">{{ t('blog.comments') }} ({{ comments.length }})</h2>

        <div v-if="comments.length > 0" class="blog-comments-list">
          <div v-for="comment in comments" :key="comment.id" class="blog-comment">
            <div class="blog-comment-header">
              <span class="blog-comment-author">{{ comment.authorName }}</span>
              <span class="blog-comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="blog-comment-content">{{ comment.content }}</p>
          </div>
        </div>

        <div v-else class="blog-no-comments">
          <p>{{ t('blog.noComments') }}</p>
        </div>

        <div class="blog-comment-form">
          <h3 class="blog-comment-form-title">{{ t('blog.leaveComment') }}</h3>
          <div class="blog-comment-fields">
            <input
              v-model="commentForm.author_name"
              :placeholder="t('blog.name')"
              class="blog-input"
              type="text"
            />
            <input
              v-model="commentForm.author_email"
              :placeholder="t('blog.email')"
              class="blog-input"
              type="email"
            />
          </div>
          <textarea
            v-model="commentForm.content"
            :placeholder="t('blog.commentPlaceholder')"
            class="blog-textarea"
            rows="4"
          />
          <button
            class="blog-submit-btn"
            :disabled="submitting || !commentForm.author_name || !commentForm.author_email || !commentForm.content"
            @click="submitCommentForm"
          >
            {{ submitting ? t('blog.submitting') : t('blog.submitComment') }}
          </button>
          <p v-if="commentSuccess" class="blog-comment-success">{{ t('blog.commentSubmitted') }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { t } = useI18n()
const route = useRoute()
const { getPostBySlug, getApprovedComments, submitComment } = useBlog()

const post = ref<any>(null)
const comments = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const commentSuccess = ref(false)
let successTimer: ReturnType<typeof setTimeout> | null = null

const commentForm = ref({
  author_name: '',
  author_email: '',
  content: '',
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const submitCommentForm = async () => {
  if (!post.value || submitting.value) return
  submitting.value = true
  commentSuccess.value = false
  try {
    await submitComment(post.value.id, commentForm.value)
    commentForm.value = { author_name: '', author_email: '', content: '' }
    commentSuccess.value = true
    if (successTimer) clearTimeout(successTimer)
    successTimer = setTimeout(() => { commentSuccess.value = false }, 5000)
  } catch (err) {
    console.error('Comment submission failed:', err)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    post.value = await getPostBySlug(slug)
    if (post.value) {
      comments.value = await getApprovedComments(post.value.id)
    }
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (successTimer) clearTimeout(successTimer)
})

useHead(() => ({
  title: post.value?.titleFa || t('blog.title'),
}))
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: var(--ink);
  color: var(--periwinkle);
  font-family: var(--font-sans);
}

.blog-detail-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.blog-detail-header-inner {
  max-width: 800px;
  margin: 0 auto;
}

.blog-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.blog-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.blog-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.blog-article-header {
  margin-bottom: 2rem;
}

.blog-article-meta {
  font-size: 0.8rem;
  color: var(--iceblue);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.blog-article-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 300;
  color: white;
  margin: 0 0 1rem;
  line-height: 1.3;
}

.blog-article-excerpt {
  font-size: 1.15rem;
  color: var(--iceblue);
  opacity: 0.7;
  line-height: 1.7;
  margin: 0;
  font-weight: 300;
}

.blog-article-cover {
  margin: 2rem -2rem;
  border-radius: 1rem;
  overflow: hidden;
}

.blog-article-cover img {
  width: 100%;
  height: auto;
  display: block;
}

.blog-article-content {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--periwinkle);
}

.blog-article-content :deep(h1),
.blog-article-content :deep(h2),
.blog-article-content :deep(h3) {
  color: white;
  font-family: var(--font-display);
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

.blog-article-content :deep(h1) { font-size: 1.8rem; }
.blog-article-content :deep(h2) { font-size: 1.5rem; }
.blog-article-content :deep(h3) { font-size: 1.25rem; }

.blog-article-content :deep(img) {
  max-width: 100%;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.blog-article-content :deep(blockquote) {
  border-right: 3px solid var(--champagne);
  padding-right: 1.25rem;
  margin: 1.5rem 0;
  color: var(--iceblue);
  font-style: italic;
  opacity: 0.8;
}

.blog-article-content :deep(pre) {
  background: oklch(15% 0.01 268);
  padding: 1.25rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--border);
}

.blog-article-content :deep(code) {
  background: oklch(22% 0.01 268);
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.blog-article-content :deep(ul),
.blog-article-content :deep(ol) {
  padding-right: 1.5rem;
  margin: 0.75rem 0;
}

.blog-article-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* ─── Comments ────────────────────────────────────── */

.blog-comments-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.blog-comments-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 400;
  color: white;
  margin: 0 0 1.5rem;
}

.blog-comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.blog-comment {
  background: oklch(18% 0.01 268);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
}

.blog-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.blog-comment-author {
  font-weight: 500;
  color: var(--champagne);
  font-size: 0.9rem;
}

.blog-comment-date {
  font-size: 0.75rem;
  color: var(--iceblue);
  opacity: 0.4;
}

.blog-comment-content {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--periwinkle);
  opacity: 0.8;
}

.blog-no-comments {
  color: var(--iceblue);
  opacity: 0.4;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.blog-comment-form {
  background: oklch(18% 0.01 268);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.blog-comment-form-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 400;
  color: white;
  margin: 0 0 1rem;
}

.blog-comment-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.blog-input,
.blog-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: oklch(15% 0.01 268);
  color: var(--periwinkle);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.blog-input:focus,
.blog-textarea:focus {
  outline: none;
  border-color: var(--sapphire);
}

.blog-textarea {
  margin-bottom: 0.75rem;
  resize: vertical;
}

.blog-submit-btn {
  padding: 0.65rem 1.75rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--sapphire);
  color: white;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.blog-submit-btn:hover:not(:disabled) {
  background: var(--cornflower);
}

.blog-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.blog-comment-success {
  margin-top: 0.75rem;
  color: #6ee7b7;
  font-size: 0.85rem;
}

.blog-loading {
  display: flex;
  justify-content: center;
  padding: 6rem;
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
  .blog-article-title {
    font-size: 1.75rem;
  }
  .blog-article-cover {
    margin: 1.5rem -0.5rem;
  }
  .blog-comment-fields {
    grid-template-columns: 1fr;
  }
}
</style>
