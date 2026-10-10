<template>
  <div class="blog-editor">
    <div v-if="editor" class="blog-editor-toolbar">
      <div class="blog-editor-toolbar__row">
        <v-btn
          v-for="item in toolbarItems"
          :key="item.action"
          icon
          size="x-small"
          variant="text"
          class="blog-editor-btn"
          :class="{ 'blog-editor-btn--on': item.isActive?.() }"
          :disabled="item.disabled?.()"
          :title="item.title"
          :aria-label="item.title"
          @click="item.command"
        >
          <v-icon size="18">{{ item.icon }}</v-icon>
        </v-btn>

        <v-divider vertical class="mx-1" />

        <v-btn
          icon
          size="x-small"
          variant="text"
          class="blog-editor-btn"
          :title="t('blog.editor.image')"
          :aria-label="t('blog.editor.image')"
          @click="triggerImageUpload"
        >
          <v-icon size="18">mdi-image</v-icon>
        </v-btn>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        >
      </div>

      <v-progress-linear
        v-if="uploading"
        class="mt-1"
        indeterminate
        :color="accent"
        height="2"
      />
    </div>

    <editor-content :editor="editor" class="blog-editor-content" />

    <div v-if="editor" class="blog-editor-footer">
      <span>{{ pn(characterCount) }} {{ t('blog.editor.characters') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { t } = useI18n()
const { pn } = useLang()
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

/** Keeps the progress bar on the same teal as the rest of the admin theme. */
const accent = '#5f8feb'

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder || t('blog.editor.startWriting') }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'blog-editor-prose',
    },
  },
  onUpdate: ({ editor: e }) => {
    emit('update:modelValue', e.getHTML())
  },
})

const characterCount = computed(() => editor.value?.getText().length ?? 0)

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('blog_image', file)

    const result = await apiFetch<{ success: boolean; data: { url: string } }>('/api/blog/upload', {
      method: 'POST',
      body: formData,
    })

    if (result.success && result.data.url) {
      editor.value?.chain().focus().setImage({ src: result.data.url }).run()
    } else {
      $toast.error(t('blog.editor.uploadFailed'))
    }
  } catch (err) {
    console.error('Image upload failed:', err)
    $toast.error(t('blog.editor.uploadFailed'))
  } finally {
    uploading.value = false
    input.value = ''
  }
}

const toolbarItems = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    { action: 'bold', icon: 'mdi-format-bold', title: t('blog.editor.bold'), command: () => e.chain().focus().toggleBold().run(), isActive: () => e.isActive('bold') },
    { action: 'italic', icon: 'mdi-format-italic', title: t('blog.editor.italic'), command: () => e.chain().focus().toggleItalic().run(), isActive: () => e.isActive('italic') },
    { action: 'underline', icon: 'mdi-format-underline', title: t('blog.editor.underline'), command: () => e.chain().focus().toggleUnderline().run(), isActive: () => e.isActive('underline') },
    { action: 'strike', icon: 'mdi-format-strikethrough', title: t('blog.editor.strikethrough'), command: () => e.chain().focus().toggleStrike().run(), isActive: () => e.isActive('strike') },
    { action: 'h1', icon: 'mdi-format-header-1', title: t('blog.editor.h1'), command: () => e.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => e.isActive('heading', { level: 1 }) },
    { action: 'h2', icon: 'mdi-format-header-2', title: t('blog.editor.h2'), command: () => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => e.isActive('heading', { level: 2 }) },
    { action: 'h3', icon: 'mdi-format-header-3', title: t('blog.editor.h3'), command: () => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => e.isActive('heading', { level: 3 }) },
    { action: 'bulletList', icon: 'mdi-format-list-bulleted', title: t('blog.editor.bulletList'), command: () => e.chain().focus().toggleBulletList().run(), isActive: () => e.isActive('bulletList') },
    { action: 'orderedList', icon: 'mdi-format-list-numbered', title: t('blog.editor.orderedList'), command: () => e.chain().focus().toggleOrderedList().run(), isActive: () => e.isActive('orderedList') },
    { action: 'blockquote', icon: 'mdi-format-quote-close', title: t('blog.editor.blockquote'), command: () => e.chain().focus().toggleBlockquote().run(), isActive: () => e.isActive('blockquote') },
    { action: 'codeBlock', icon: 'mdi-code-tags', title: t('blog.editor.codeBlock'), command: () => e.chain().focus().toggleCodeBlock().run(), isActive: () => e.isActive('codeBlock') },
    { action: 'horizontalRule', icon: 'mdi-minus', title: t('blog.editor.horizontalRule'), command: () => e.chain().focus().setHorizontalRule().run() },
    { action: 'undo', icon: 'mdi-undo', title: t('blog.editor.undo'), command: () => e.chain().focus().undo().run(), disabled: () => !e.can().undo() },
    { action: 'redo', icon: 'mdi-redo', title: t('blog.editor.redo'), command: () => e.chain().focus().redo().run(), disabled: () => !e.can().redo() },
  ]
})
</script>

<style>
/*
 * The editor is intentionally global (not scoped) because TipTap renders the
 * editable surface inside a nested ProseMirror element. Every colour comes from
 * the shared --asa-* tokens, so light and dark are handled in one place.
 */
.blog-editor {
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  overflow: hidden;
  background: var(--asa-bg-card);
}

.blog-editor-toolbar {
  padding: 0.5rem;
  border-bottom: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.blog-editor-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.125rem;
}

.blog-editor .blog-editor-btn {
  border-radius: 0.5rem;
  color: var(--asa-label-2);
}

.blog-editor .blog-editor-btn--on {
  color: var(--asa-accent);
  background: var(--asa-accent-soft);
}

.blog-editor .blog-editor-btn:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.blog-editor-content .tiptap {
  min-height: 300px;
  padding: 1rem;
  color: var(--asa-label);
  outline: none;
}

.blog-editor-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--asa-label-3);
  pointer-events: none;
  height: 0;
}

.blog-editor-prose {
  min-height: 300px;
  padding: 1rem;
  color: var(--asa-label);
  font-size: 0.9375rem;
  line-height: 1.9;
  outline: none;
}

.blog-editor-prose > * + * {
  margin-top: 0.75rem;
}

.blog-editor-prose h1 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.4;
  margin-top: 1.5rem;
}

.blog-editor-prose h2 {
  font-size: 1.4375rem;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 1.25rem;
}

.blog-editor-prose h3 {
  font-size: 1.1875rem;
  font-weight: 600;
  line-height: 1.5;
  margin-top: 1rem;
}

.blog-editor-prose ul,
.blog-editor-prose ol {
  padding-right: 1.5rem;
}

.blog-editor-prose ul {
  list-style: disc;
}

.blog-editor-prose ol {
  list-style: decimal;
}

.blog-editor-prose li + li {
  margin-top: 0.25rem;
}

.blog-editor-prose a {
  color: var(--asa-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.blog-editor-prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--asa-card-ring);
}

.blog-editor-prose blockquote {
  border-right: 3px solid var(--asa-accent);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label-2);
  font-style: italic;
}

.blog-editor-prose pre {
  background: var(--asa-track);
  color: var(--asa-label);
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--asa-card-ring);
  overflow-x: auto;
  direction: ltr;
  text-align: left;
}

.blog-editor-prose code {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  direction: ltr;
}

.blog-editor-prose pre code {
  background: none;
  padding: 0;
}

.blog-editor-prose hr {
  border: none;
  border-top: 1px solid var(--asa-sep);
  margin: 1.5rem 0;
}

.blog-editor-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}
</style>
