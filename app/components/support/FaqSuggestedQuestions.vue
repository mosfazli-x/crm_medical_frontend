<template>
  <div class="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
    <p class="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {{ t('support.widget.suggestedQuestions') }}
    </p>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="q in questions"
        :key="q.key"
        @click="$emit('select', t(q.key))"
        class="rounded-lg bg-white px-3 py-1.5! text-xs text-gray-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
      >
        {{ t(q.key) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ select: [question: string] }>()

const { t } = useI18n()

const questions = [
  { key: 'support.suggested.howToCreatePatient' },
  { key: 'support.suggested.howToBookAppointment' },
  { key: 'support.suggested.howToAddPrescription' },
  { key: 'support.suggested.howToViewLabResults' },
  { key: 'support.suggested.howToManageBilling' },
  { key: 'support.suggested.howToPrintReport' },
]
</script>
