<template>
  <div class="suggest">
    <p class="suggest__label">{{ t('support.widget.suggestedQuestions') }}</p>
    <div class="suggest__list">
      <button
        v-for="q in questions"
        :key="q.key"
        type="button"
        class="suggest__chip"
        @click="$emit('select', t(q.key))"
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

<style scoped>
.suggest {
  padding: 0.375rem 1.25rem 0.875rem;
}

.suggest__label {
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--asa-label-3);
}

.suggest__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.suggest__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-bg-card) 70%, transparent);
  color: var(--asa-label-2);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-default), color 0.2s var(--ease-default),
    background 0.2s var(--ease-default), transform 0.15s var(--ease-default);
}

.suggest__chip:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, var(--asa-card-ring));
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

:global(.dark) .suggest__chip:hover {
  color: var(--asa-accent);
}

.suggest__chip:active {
  transform: scale(0.97);
}

.suggest__chip:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}
</style>