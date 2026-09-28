<template>
  <div class="guide">
    <!-- Guided tour -->
    <section class="guide-card guide-card--tour">
      <div class="guide-card__head">
        <span class="asa-tint asa-tint--teal guide-card__icon">
          <Welcome class="guide-card__icon-svg" />
        </span>
        <div class="guide-card__copy">
          <h3 class="guide-card__title">{{ t('support.guidance.tour.title') }}</h3>
          <p class="guide-card__desc">{{ t('support.guidance.tour.desc') }}</p>
        </div>
      </div>
      <button type="button" class="asa-btn asa-btn--primary guide-card__cta" @click="$emit('start-tour')">
        <svg class="guide-card__cta-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.14v13.72c0 .93 1.02 1.5 1.81 1.01l10.9-6.86a1.2 1.2 0 0 0 0-2.02L9.81 4.13A1.2 1.2 0 0 0 8 5.14Z" />
        </svg>
        {{ tutorial.completed ? t('support.guidance.tour.again') : t('support.guidance.tour.start') }}
      </button>
    </section>

    <!-- Tips -->
    <p class="guide-sec">{{ t('support.guidance.tipsTitle') }}</p>

    <div class="guide-tips">
      <article v-for="tip in tips" :key="tip.key" class="guide-tip">
        <span class="asa-tint asa-tint--sm" :class="tip.tint">
          <component :is="tip.icon" class="guide-tip__icon" :class="tip.fill ? 'fill-current' : ''" />
        </span>
        <p class="guide-tip__text">{{ t(tip.key) }}</p>
      </article>
    </div>

    <!-- Ask CTA -->
    <section class="guide-card guide-card--ask">
      <div class="guide-card__head">
        <span class="asa-tint asa-tint--amber guide-card__icon">
          <ChatDots class="guide-card__icon-svg" />
        </span>
        <div class="guide-card__copy">
          <h3 class="guide-card__title">{{ t('support.guidance.askTitle') }}</h3>
          <p class="guide-card__desc">{{ t('support.guidance.askDesc') }}</p>
        </div>
      </div>
      <button type="button" class="asa-btn asa-btn--ghost guide-card__cta" @click="$emit('ask')">
        <ChatDots class="guide-card__cta-svg fill-current" />
        {{ t('support.guidance.askAction') }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import Welcome from '~/components/icons/Welcome.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import Settings from '~/components/icons/Settings.vue'
import Search from '~/components/icons/Search.vue'
import Keyboard from '~/components/icons/Keyboard.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'

defineEmits<{ 'start-tour': []; ask: [] }>()

const { t } = useI18n()
const tutorial = useTutorial()

const tips = [
  { key: 'support.guidance.tips.customize', icon: Settings, tint: 'asa-tint--indigo', fill: true },
  { key: 'support.guidance.tips.search', icon: Search, tint: 'asa-tint--teal', fill: false },
  { key: 'support.guidance.tips.nav', icon: Keyboard, tint: 'asa-tint--orange', fill: false },
  { key: 'support.guidance.tips.sessions', icon: ShieldCheck, tint: 'asa-tint--green', fill: true },
]
</script>

<style scoped>
.guide {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.875rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.guide-card {
  display: flex;
  flex-direction: column;
  gap: 0.9375rem;
  padding: 1rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-bg-card) 90%, transparent);
  box-shadow: 0 6px 18px -10px rgba(17, 24, 39, 0.12);
}

.guide-card--tour {
  background: linear-gradient(160deg, var(--asa-accent-soft), color-mix(in srgb, var(--asa-accent-soft) 35%, transparent) 70%);
}

.guide-card__head {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.guide-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.8125rem;
}

.guide-card__icon-svg {
  width: 1.375rem !important;
  height: 1.375rem !important;
  fill: currentColor;
}

.guide-card__copy {
  min-width: 0;
}

.guide-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.guide-card__desc {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--asa-label-2);
}

.guide-card__cta {
  justify-content: center;
  gap: 0.5rem;
}

.guide-card__cta-svg {
  width: 1rem !important;
  height: 1rem !important;
  fill: currentColor;
}

.guide-sec {
  margin: 0.25rem 0 -0.25rem;
  padding-inline-start: 0.125rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--asa-label-3);
}

.guide-tips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.guide-tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6875rem 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.9375rem;
  background: color-mix(in srgb, var(--asa-bg-card) 85%, transparent);
  transition: border-color 0.2s var(--ease-default), transform 0.2s var(--ease-default);
}

.guide-tip:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 30%, var(--asa-card-ring));
  transform: translateY(-1px);
}

.guide-tip__icon {
  width: 1rem !important;
  height: 1rem !important;
}

.guide-tip__text {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--asa-label-2);
}
</style>