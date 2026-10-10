<script setup lang="ts">
/**
 * AuthShell — Premium split-screen auth layout (navy/teal palette).
 *
 * Left: animated hero with teal glow mesh, floating orbs, brand messaging.
 * Right: clean glass card with form slot.
 * Mobile: hero condensed to strip, form full-width.
 */
const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'fa')

defineProps<{
  title: string
  subtitle?: string
}>()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))
</script>

<template>
  <!-- Locale dir is driven by the page routing; keep a neutral layout that responds to [dir] -->
  <div class="auth-shell" :dir="dir">
    <!-- ═══ Hero Panel (left on desktop, hidden on mobile) ═══ -->
    <div class="auth-hero" aria-hidden="true">
      <!-- Teal glow mesh -->
      <div class="auth-hero__mesh" />
      <!-- Scientific grid overlay -->
      <div class="auth-hero__grid" />
      <!-- Floating orbs -->
      <div class="auth-hero__orb auth-hero__orb--1" />
      <div class="auth-hero__orb auth-hero__orb--2" />
      <div class="auth-hero__orb auth-hero__orb--3" />
      <!-- Vignette -->
      <div class="auth-hero__vignette" />

      <!-- Hero content -->
      <div class="auth-hero__content">
        <div class="auth-hero__logo-wrap">
          <div class="auth-hero__logo-icon">
            <img src="../../assets/images/hastihoseinilogo.png" class="auth-hero__logo-svg" alt="">
          </div>
        </div>
        <h1 class="auth-hero__title">{{ t('auth.hero.title') }}</h1>
        <p class="auth-hero__tagline">{{ t('auth.hero.tagline') }}</p>
        <div class="auth-hero__features">
          <div class="auth-hero__feature">
            <span class="auth-hero__feature-dot" />
            <span>{{ t('auth.hero.feature1') }}</span>
          </div>
          <div class="auth-hero__feature">
            <span class="auth-hero__feature-dot" />
            <span>{{ t('auth.hero.feature2') }}</span>
          </div>
          <div class="auth-hero__feature">
            <span class="auth-hero__feature-dot" />
            <span>{{ t('auth.hero.feature3') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Form Panel ═══ -->
    <div class="auth-form-panel">
      <!-- Mobile-only compact header -->
      <div class="auth-mobile-header">
        <div class="auth-mobile-logo">
          <img src="../../assets/images/hastihoseinilogo.png" class="auth-mobile-logo-svg" alt="">
        </div>
        <span class="auth-mobile-brand">{{ t('auth.hero.title') }}</span>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-card">
          <div class="auth-card__header">
            <h2 class="auth-card__title">{{ title }}</h2>
            <p v-if="subtitle" class="auth-card__subtitle">{{ subtitle }}</p>
          </div>
          <slot />
        </div>
      </div>

      <!-- Native back-to-home control: pinned to the app bar on mobile,
           top corner of the form panel on desktop. -->
      <NuxtLink to="/" class="auth-return" :aria-label="t('auth.backToHome')">
        <svg class="auth-return__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2.5 9.5 10 3l7.5 6.5" />
          <path d="M4 8.6V17h4.5v-4h3v4H16V8.6" />
        </svg>
        <span class="auth-return__label">{{ t('auth.backToHome') }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Auth Shell — Premium Split Layout (navy/teal)
   ═══════════════════════════════════════════ */

.auth-shell {
  --auth-background: #222831;
  --auth-foreground: #EEEEEE;
  --auth-primary: #5f8feb;
  --auth-primary-hover: #39C6D6;
  --auth-card: #393E46;
  --auth-card-raised: #2B3138;
  --auth-muted: #B8BDC5;
  --auth-border: #4A505A;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--auth-background);
  color: var(--auth-foreground);
  font-family: var(--font-body, ui-sans-serif, system-ui, sans-serif);
}

/* ── Hero Panel ── */
.auth-hero {
  display: none;
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  overflow: hidden;
  background:
    radial-gradient(60rem 40rem at 80% 0%, color-mix(in oklab, var(--auth-primary) 12%, transparent), transparent 60%),
    linear-gradient(160deg, #161c24 0%, #1b232e 45%, #222831 100%);
}

@media (min-width: 1024px) {
  .auth-hero {
    display: flex;
  }
}

/* Teal glow mesh */
.auth-hero__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 30% 35%, color-mix(in oklab, var(--auth-primary) 22%, transparent) 0%, transparent 65%),
    radial-gradient(ellipse 55% 45% at 70% 65%, color-mix(in oklab, var(--auth-primary-hover) 14%, transparent) 0%, transparent 60%),
    radial-gradient(ellipse 45% 40% at 50% 15%, color-mix(in oklab, var(--auth-primary) 8%, transparent) 0%, transparent 55%);
  animation: authMeshDrift 20s ease-in-out infinite;
}

@keyframes authMeshDrift {
  0%,
  100% {
    transform: scale(1) translate(0, 0);
  }
  33% {
    transform: scale(1.03) translate(1%, -0.5%);
  }
  66% {
    transform: scale(0.98) translate(-0.5%, 1%);
  }
}

/* Scientific grid overlay */
.auth-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in oklab, var(--auth-primary) 8%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklab, var(--auth-primary) 8%, transparent) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%);
  opacity: 0.5;
}

/* Floating orbs */
.auth-hero__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  will-change: transform;
}

.auth-hero__orb--1 {
  width: 320px;
  height: 320px;
  top: 15%;
  left: 20%;
  background: color-mix(in oklab, var(--auth-primary) 20%, transparent);
  animation: authOrbFloat1 18s ease-in-out infinite;
}

.auth-hero__orb--2 {
  width: 240px;
  height: 240px;
  bottom: 20%;
  right: 15%;
  background: color-mix(in oklab, var(--auth-primary-hover) 16%, transparent);
  animation: authOrbFloat2 22s ease-in-out infinite;
}

.auth-hero__orb--3 {
  width: 180px;
  height: 180px;
  top: 60%;
  left: 60%;
  background: color-mix(in oklab, var(--auth-primary) 12%, transparent);
  animation: authOrbFloat3 16s ease-in-out infinite;
}

@keyframes authOrbFloat1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-15px, 20px) scale(0.95);
  }
  75% {
    transform: translate(10px, 10px) scale(1.02);
  }
}

@keyframes authOrbFloat2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-25px, 15px) scale(1.08);
  }
  66% {
    transform: translate(15px, -20px) scale(0.96);
  }
}

@keyframes authOrbFloat3 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, -25px) scale(1.1);
  }
}

/* Vignette */
.auth-hero__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, transparent 20%, rgba(6, 10, 19, 0.45) 100%);
}

/* Hero content */
.auth-hero__content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
  animation: authHeroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

@keyframes authHeroFadeIn {
  from {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.auth-hero__logo-wrap {
  margin-bottom: 2rem;
}

.auth-hero__logo-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 22px;
  background: linear-gradient(135deg, color-mix(in oklab, var(--auth-primary) 26%, transparent), color-mix(in oklab, var(--auth-primary-hover) 16%, transparent));
  border: 1px solid color-mix(in oklab, var(--auth-primary) 35%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 40px -8px color-mix(in oklab, var(--auth-primary) 45%, transparent);
}

.auth-hero__logo-svg {
  width: 76px;
}

.auth-hero__title {
  font-family: var(--font-display, ui-serif, Georgia, serif);
  font-size: 2rem;
  font-weight: 700;
  color: var(--auth-foreground);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.auth-hero__tagline {
  font-size: 1rem;
  color: var(--auth-muted);
  font-weight: 500;
  margin-bottom: 3rem;
}

.auth-hero__features {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  align-items: center;
}

.auth-hero__feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #d7dbe1;
  font-size: 0.875rem;
  font-weight: 500;
}

.auth-hero__feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--auth-primary), var(--auth-primary-hover));
  flex-shrink: 0;
  box-shadow: 0 0 12px color-mix(in oklab, var(--auth-primary) 60%, transparent);
}

/* ── Form Panel ── */
.auth-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background:
    radial-gradient(40rem 30rem at 100% -10%, color-mix(in oklab, var(--auth-primary) 8%, transparent), transparent 60%),
    var(--auth-background);
}

@media (min-width: 1024px) {
  .auth-form-panel {
    width: 50%;
    min-height: auto;
  }
}

/* Mobile header */
.auth-mobile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--auth-border);
}

@media (min-width: 1024px) {
  .auth-mobile-header {
    display: none;
  }
}

.auth-mobile-logo {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--auth-primary), var(--auth-primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.auth-mobile-logo-svg {
  width: 38px;
}

.auth-mobile-brand {
  font-family: "bon", ui-serif, Georgia, serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--auth-foreground);
  letter-spacing: -0.02em;
}

/* Form wrapper */
.auth-form-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

/* @media (min-width: 640px) {
  .auth-form-wrap {
    padding: 3rem 2rem;
  }
} */

/* Back-to-home control — native, professional
   A compact icon button pinned to the app bar on mobile and to the top
   corner of the form panel on desktop. No floating detached pill below
   the card. */
.auth-form-panel {
  position: relative;
}

.auth-return {
  position: absolute;
  top: max(env(safe-area-inset-top, 0px), 1.5rem);
  inset-inline-end: 1.5rem;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding-inline: 0.625rem;
  border: 1px solid var(--auth-border);
  border-radius: 9999px;
  background: color-mix(in oklab, var(--auth-card-raised) 78%, transparent);
  color: var(--auth-muted);
  text-decoration: none;
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.4);
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease,
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-return:hover {
  border-color: color-mix(in oklab, var(--auth-primary) 55%, var(--auth-border));
  color: var(--auth-primary-hover);
  background: color-mix(in oklab, var(--auth-primary) 12%, transparent);
  transform: translateY(-1px);
}

.auth-return:active {
  transform: translateY(0);
}

.auth-return:focus-visible {
  outline: 2px solid var(--auth-primary);
  outline-offset: 2px;
}

.auth-return__icon {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}

.auth-return__label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
}

/* On desktop keep it compact (icon-only feel with a soft label);
   the label stays visible for clarity. */

/* ── Glass Card ── */
.auth-card {
  width: 100%;
  max-width: 26rem;
  background: color-mix(in oklab, var(--auth-card-raised) 88%, transparent);
  border: 1px solid var(--auth-border);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.28),
    0 24px 64px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(20px);
  animation: authCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

@keyframes authCardIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@media (min-width: 640px) {
  .auth-card {
    padding: 3rem 2.5rem;
  }
}

/* Card header */
.auth-card__header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-card__title {
  font-family: var(--font-display, ui-serif, Georgia, serif);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--auth-foreground);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.auth-card__subtitle {
  font-size: 0.875rem;
  color: var(--auth-muted);
  font-weight: 500;
}

/* ═══════════════════════════════════════════
   Native Mobile — full-height app-style layout
   ═══════════════════════════════════════════ */
@media (max-width: 1023px) {

  .auth-shell {
    min-height: 0;
    height: 100dvh;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Native app bar ── */
  .auth-form-panel {
    flex: 1;
    min-height: 0;
    height: 100dvh;
    padding-top: env(safe-area-inset-top, 0px);
    background: var(--auth-background);
    overflow: hidden;
  }

  /* Branded compact header anchored to the top */
  .auth-mobile-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.625rem;
    min-height: calc(3.25rem + env(safe-area-inset-top, 0px));
    padding:
      calc(0.4375rem + env(safe-area-inset-top, 0px))
      1.25rem
      0.4375rem;
    background: color-mix(in oklab, #1b2129 92%, transparent);
    border-bottom: 1px solid var(--auth-border);
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
  }

  .auth-mobile-logo {
    width: 2.125rem;
    height: 2.125rem;
    border-radius: 11px;
  }

  .auth-mobile-logo-svg {
    width: 2.25rem;
  }

  .auth-mobile-brand {
    font-size: 1rem;
  }

  /* ── Full-height (non-floating) form surface ── */
  .auth-form-wrap {
    flex: 1;
    min-height: 0;
    justify-content: flex-start;
    align-items: stretch;
    gap: 0;
  }

  /* Card becomes a bottom-anchored full-width sheet that fits the
     available height. min-height:0 lets flexbox shrink it (no overflow);
     spacing is viewport-height-ish so the form compresses to fit. */
  .auth-card {
    flex: 1;
    min-height: 0;
    max-width: none;
    display: flex;
    flex-direction: column;
    border-radius: 0;
    border-inline: none;
    border-top: 1px solid var(--auth-border);
    background: var(--auth-background);
    box-shadow: none;
    backdrop-filter: none;
    padding: clamp(1rem, 4vh, 2rem) 1.5rem
      calc(clamp(0.75rem, 3vh, 1.5rem) + env(safe-area-inset-bottom, 0px));
    overflow: hidden;
  }

  .auth-card :deep(.auth-card__header) {
    flex-shrink: 0;
    text-align: start;
    margin-bottom: clamp(0.75rem, 3vh, 1.75rem);
  }

  .auth-card :deep(.auth-card__title) {
    font-size: clamp(1.35rem, 4.4vh, 1.75rem);
    line-height: 1.15;
  }

  .auth-card :deep(.auth-card__subtitle) {
    margin-top: 0.25rem;
    line-height: 1.5;
  }

  /* Form fills the card; CTA anchored toward the bottom (thumb zone).
     Vertical rhythm is viewport-height-relative so the whole form
     compresses to fit without ever needing a scroll. */
  .auth-card :deep(.auth-form) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(0.5rem, 2.4vh, 1rem);
  }

  .auth-card :deep(.auth-btn) {
    flex-shrink: 0;
    margin-top: auto;
    height: clamp(2.5rem, 7.7vh, 3.25rem);
    font-size: 0.9375rem;
    border-radius: 0.875rem;
  }

  .auth-card :deep(.auth-input) {
    height: clamp(2.25rem, 7vh, 3.125rem);
    font-size: 0.9375rem;
    border-radius: 0.875rem;
  }

  .auth-card :deep(.auth-field) {
    gap: clamp(0.375rem, 1.5vh, 0.5rem);
  }

  .auth-card :deep(.auth-label) {
    font-size: clamp(0.75rem, 2vh, 0.875rem);
  }

  .auth-card :deep(.auth-input-icon) svg,
  .auth-card :deep(.auth-input-toggle) svg {
    width: 20px;
    height: 20px;
  }

  /* Compact the role grid (used on register) so it fits short screens */
  .auth-card :deep(.auth-role-grid) {
    gap: clamp(0.375rem, 1.4vh, 0.5rem);
  }

  .auth-card :deep(.auth-role-card) {
    padding: clamp(0.625rem, 2.6vh, 1rem) clamp(0.75rem, 2.2vh, 1rem);
    min-height: 0;
  }

  .auth-card :deep(.auth-role-label) {
    font-size: clamp(0.8125rem, 2.4vh, 0.9375rem);
  }

  /* Footer sits just above the submit action, toward the bottom */
  .auth-card :deep(.auth-footer) {
    flex-shrink: 0;
    margin-top: clamp(0.5rem, 2vh, 1.25rem);
  }

  /* Native back-to-home: pinned to the trailing edge of the app bar,
     icon-only like a native app-bar action. No detached bottom pill. */
  .auth-return {
    top: calc(env(safe-area-inset-top, 0px) + 0.5rem);
    inset-inline-end: 1.25rem;
    padding-inline: 0.625rem;
    height: 2.75rem;
    width: 2.75rem;
    justify-content: center;
    border-color: color-mix(in oklab, var(--auth-border) 70%, transparent);
    background: color-mix(in oklab, var(--auth-card) 55%, transparent);
    box-shadow: none;
  }

  .auth-return__label {
    display: none;
  }
}

/* ═══════════════════════════════════════════
   Short desktop windows — keep the centered card fully in view
   by gently compacting vertical rhythm instead of scrolling.
   ═══════════════════════════════════════════ */
@media (min-width: 1024px) and (max-height: 760px) {

  .auth-card {
    padding: 1.5rem 2rem;
  }

  .auth-card__header {
    margin-bottom: 1.25rem;
  }

  .auth-card__title {
    font-size: 1.25rem;
  }

  .auth-card__subtitle {
    font-size: 0.8125rem;
  }

  .auth-card :deep(.auth-form) {
    gap: 0.75rem;
  }

  .auth-card :deep(.auth-input) {
    height: 2.75rem;
  }

  .auth-card :deep(.auth-btn) {
    height: 2.875rem;
  }

  .auth-card :deep(.auth-footer) {
    margin-top: 0.875rem;
  }
}

/* ═══════════════════════════════════════════
   Short mobile windows (landscape-ish / small phones) — guarantee
   the full form fits the viewport with zero scrolling.
   ═══════════════════════════════════════════ */
@media (max-width: 1023px) and (max-height: 740px) {

  .auth-shell {
    height: 100vh;
    height: 100dvh;
  }

  .auth-mobile-header {
    min-height: 3.75rem;
    padding-top: calc(0.25rem + env(safe-area-inset-top, 0px));
    padding-bottom: 0.25rem;
  }

  .auth-mobile-logo {
    width: 1.75rem;
    height: 1.75rem;
  }

  .auth-mobile-brand {
    font-size: 0.875rem;
  }

  .auth-card {
    padding: 1rem 1.25rem
      calc(0.625rem + env(safe-area-inset-bottom, 0px));
  }

  .auth-card :deep(.auth-card__header) {
    margin-bottom: 0.625rem;
  }

  .auth-card :deep(.auth-card__title) {
    font-size: 1.4rem;
    line-height: 1.2;
  }

  .auth-card :deep(.auth-card__subtitle) {
    margin-top: 0.125rem;
    font-size: 0.8125rem;
  }

  .auth-card :deep(.auth-form) {
    gap: 0.5rem;
  }

  .auth-card :deep(.auth-field) {
    gap: 0.375rem;
  }

  .auth-card :deep(.auth-input) {
    height: 2.625rem;
    font-size: 0.9375rem;
  }

  .auth-card :deep(.auth-label) {
    font-size: 0.8125rem;
  }

  .auth-card :deep(.auth-input-icon) svg,
  .auth-card :deep(.auth-input-toggle) svg {
    width: 18px;
    height: 18px;
  }

  .auth-card :deep(.auth-btn) {
    height: 2.875rem;
  }

  .auth-card :deep(.auth-footer) {
    margin-top: 0.625rem;
  }

  .auth-card :deep(.auth-role-grid) {
    gap: 0.375rem;
  }

  .auth-card :deep(.auth-role-card) {
    padding: 0.375rem 0.5rem;
    gap: 0.25rem;
  }
}
</style>