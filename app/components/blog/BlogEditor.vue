<template>
  <div class="blog-editor">
    <div v-if="editor" class="blog-editor-toolbar">
      <div class="flex flex-wrap items-center gap-1">
        <v-btn
          v-for="item in toolbarItems"
          :key="item.action"
          icon
          size="x-small"
          variant="text"
          :color="item.isActive?.() ? 'primary' : undefined"
          :disabled="item.disabled?.()"
          @click="item.command"
          :title="item.title"
        >
          <v-icon size="18">{{ item.icon }}</v-icon>
        </v-btn>

        <v-divider vertical class="mx-1" />

        <v-btn icon size="x-small" variant="text" @click="triggerImageUpload" title="Insert image">
          <v-icon size="18">mdi-image</v-icon>
        </v-btn>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleImageUpload"
        />
      </div>

      <div v-if="uploading" class="mt-1">
        <v-progress-linear indeterminate color="primary" height="2" />
      </div>
    </div>

    <editor-content :editor="editor" class="blog-editor-content" />

    <div v-if="editor" class="blog-editor-footer">
      <span class="text-xs text-gray-400">
        {{ editor.storage.characterCount?.characters?.() ?? editor.getText().length }} characters
      </span>
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
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder || 'Start writing...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[300px] p-4',
    },
  },
  onUpdate: ({ editor: e }) => {
    emit('update:modelValue', e.getHTML())
  },
})

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
    }
  } catch (err) {
    console.error('Image upload failed:', err)
  } finally {
    uploading.value = false
    input.value = ''
  }
}

const toolbarItems = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    { action: 'bold', icon: 'mdi-format-bold', title: 'Bold', command: () => e.chain().focus().toggleBold().run(), isActive: () => e.isActive('bold') },
    { action: 'italic', icon: 'mdi-format-italic', title: 'Italic', command: () => e.chain().focus().toggleItalic().run(), isActive: () => e.isActive('italic') },
    { action: 'underline', icon: 'mdi-format-underline', title: 'Underline', command: () => e.chain().focus().toggleUnderline().run(), isActive: () => e.isActive('underline') },
    { action: 'strike', icon: 'mdi-format-strikethrough', title: 'Strikethrough', command: () => e.chain().focus().toggleStrike().run(), isActive: () => e.isActive('strike') },
    { action: 'h1', icon: 'mdi-format-header-1', title: 'Heading 1', command: () => e.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => e.isActive('heading', { level: 1 }) },
    { action: 'h2', icon: 'mdi-format-header-2', title: 'Heading 2', command: () => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => e.isActive('heading', { level: 2 }) },
    { action: 'h3', icon: 'mdi-format-header-3', title: 'Heading 3', command: () => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => e.isActive('heading', { level: 3 }) },
    { action: 'bulletList', icon: 'mdi-format-list-bulleted', title: 'Bullet List', command: () => e.chain().focus().toggleBulletList().run(), isActive: () => e.isActive('bulletList') },
    { action: 'orderedList', icon: 'mdi-format-list-numbered', title: 'Ordered List', command: () => e.chain().focus().toggleOrderedList().run(), isActive: () => e.isActive('orderedList') },
    { action: 'blockquote', icon: 'mdi-format-quote-close', title: 'Blockquote', command: () => e.chain().focus().toggleBlockquote().run(), isActive: () => e.isActive('blockquote') },
    { action: 'codeBlock', icon: 'mdi-code-tags', title: 'Code Block', command: () => e.chain().focus().toggleCodeBlock().run(), isActive: () => e.isActive('codeBlock') },
    { action: 'horizontalRule', icon: 'mdi-minus', title: 'Horizontal Rule', command: () => e.chain().focus().setHorizontalRule().run() },
    { action: 'undo', icon: 'mdi-undo', title: 'Undo', command: () => e.chain().focus().undo().run(), disabled: () => !e.can().undo() },
    { action: 'redo', icon: 'mdi-redo', title: 'Redo', command: () => e.chain().focus().redo().run(), disabled: () => !e.can().redo() },
  ]
})
</script>

<style>
.blog-editor {
  border: 1px solid rgb(209 213 219);
  border-radius: 0.75rem;
  overflow: hidden;
  background: white;
}

.dark .blog-editor {
  border-color: rgb(55 65 81);
  background: rgb(15 17 21);
}

.blog-editor-toolbar {
  padding: 0.5rem;
  border-bottom: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
}

.dark .blog-editor-toolbar {
  border-bottom-color: rgb(55 65 81);
  background: rgb(31 33 40);
}

.blog-editor-content .tiptap {
  min-height: 300px;
  padding: 1rem;
}

.blog-editor-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: rgb(156 163 175);
  pointer-events: none;
  height: 0;
}

.blog-editor-content .tiptap h1 { font-size: 1.875rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.blog-editor-content .tiptap h2 { font-size: 1.5rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
.blog-editor-content .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.25rem; }

.blog-editor-content .tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.blog-editor-content .tiptap blockquote {
  border-right: 3px solid rgb(99 102 241);
  padding-right: 1rem;
  margin: 1rem 0;
  color: rgb(107 114 128);
  font-style: italic;
}

.blog-editor-content .tiptap pre {
  background: rgb(31 41 55);
  color: rgb(209 213 219);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.blog-editor-content .tiptap code {
  background: rgb(243 244 246);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.dark .blog-editor-content .tiptap code {
  background: rgb(55 65 81);
}

.blog-editor-content .tiptap ul,
.blog-editor-content .tiptap ol {
  padding-right: 1.5rem;
  margin: 0.5rem 0;
}

.blog-editor-content .tiptap hr {
  border: none;
  border-top: 1px solid rgb(209 213 219);
  margin: 1.5rem 0;
}

.dark .blog-editor-content .tiptap hr {
  border-top-color: rgb(55 65 81);
}

.blog-editor-footer {
  padding: 0.5rem 1rem;
  border-top: 1px solid rgb(209 213 219);
  background: rgb(249 250 251);
}

.dark .blog-editor-footer {
  border-top-color: rgb(55 65 81);
  background: rgb(31 33 40);
}
</style>
