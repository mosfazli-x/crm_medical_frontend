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
        <NuxtLink to="/" class="auth-back-link">
          <svg class="auth-back-link__icon" :class="{ 'auth-back-link__icon--rtl': isRtl }" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 10H5M9 6l-4 4 4 4" />
          </svg>
          <span>{{ t('auth.backToHome') }}</span>
        </NuxtLink>
      </div>
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
  --auth-primary: #00ADB5;
  --auth-primary-hover: #39C6D6;
  --auth-card: #393E46;
  --auth-card-raised: #2B3138;
  --auth-muted: #B8BDC5;
  --auth-border: #4A505A;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
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
  font-family: var(--font-display, ui-serif, Georgia, serif);
  font-weight: 700;
  font-size: 1rem;
  color: var(--auth-foreground);
  letter-spacing: -0.02em;
}

/* Form wrapper */
.auth-form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 2rem 1.5rem;
}

@media (min-width: 640px) {
  .auth-form-wrap {
    padding: 3rem 2rem;
  }
}

/* Back-to-home link */
.auth-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--auth-muted);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.25s ease;
}

.auth-back-link:hover {
  color: var(--auth-primary-hover);
  background: color-mix(in oklab, var(--auth-primary) 12%, transparent);
}

.auth-back-link__icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.auth-back-link:hover .auth-back-link__icon {
  transform: translateX(-2px);
}

.auth-back-link__icon--rtl {
  transform: scaleX(-1);
}

.auth-back-link:hover .auth-back-link__icon--rtl {
  transform: scaleX(-1) translateX(2px);
}

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
</style>