<script setup lang="ts">
/**
 * AuthShell — Premium split-screen auth layout.
 *
 * Left: animated hero with gradient mesh, floating orbs, brand messaging.
 * Right: clean glass card with form slot.
 * Mobile: hero condensed to strip, form full-width.
 */
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <v-locale-provider rtl>
    <div class="auth-shell" dir="rtl">
      <!-- ═══ Hero Panel (left on desktop, hidden on mobile) ═══ -->
      <div class="auth-hero" aria-hidden="true">
        <!-- Gradient mesh background -->
        <div class="auth-hero__mesh" />
        <!-- Grid overlay -->
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
              <ClinicLogo class="auth-hero__logo-svg" />
            </div>
          </div>
          <h1 class="auth-hero__title">کلینیک دکتر حسینی</h1>
          <p class="auth-hero__tagline">مراقبت پزشکی پیشرفته</p>
          <div class="auth-hero__features">
            <div class="auth-hero__feature">
              <span class="auth-hero__feature-dot" />
              <span>مدیریت هوشمند بیماران</span>
            </div>
            <div class="auth-hero__feature">
              <span class="auth-hero__feature-dot" />
              <span>پرونده الکترونیک سلامت</span>
            </div>
            <div class="auth-hero__feature">
              <span class="auth-hero__feature-dot" />
              <span>امنیت پیشرفته داده‌ها</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Form Panel ═══ -->
      <div class="auth-form-panel">
        <!-- Mobile-only compact header -->
        <div class="auth-mobile-header">
          <div class="auth-mobile-logo">
            <ClinicLogo class="auth-mobile-logo-svg" />
          </div>
          <span class="auth-mobile-brand">کلینیک دکتر حسینی</span>
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
      </div>
    </div>
  </v-locale-provider>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Auth Shell — Premium Split Layout
   ═══════════════════════════════════════════ */

.auth-shell {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #060a13;
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
  background: linear-gradient(160deg, #060a13 0%, #0c1424 40%, #0f1a36 100%);
}

@media (min-width: 1024px) {
  .auth-hero {
    display: flex;
  }
}

/* Gradient mesh */
.auth-hero__mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 30% 40%, rgba(59,130,246,0.12) 0%, transparent 70%),
    radial-gradient(ellipse 60% 50% at 70% 60%, rgba(34,211,238,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 50% 80%, rgba(129,140,248,0.06) 0%, transparent 50%);
  animation: authMeshDrift 20s ease-in-out infinite;
}

@keyframes authMeshDrift {
  0%, 100% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.03) translate(1%, -0.5%); }
  66% { transform: scale(0.98) translate(-0.5%, 1%); }
}

/* Grid overlay */
.auth-hero__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 75%);
  opacity: 0.6;
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
  background: rgba(59,130,246,0.15);
  animation: authOrbFloat1 18s ease-in-out infinite;
}

.auth-hero__orb--2 {
  width: 240px;
  height: 240px;
  bottom: 20%;
  right: 15%;
  background: rgba(34,211,238,0.12);
  animation: authOrbFloat2 22s ease-in-out infinite;
}

.auth-hero__orb--3 {
  width: 180px;
  height: 180px;
  top: 60%;
  left: 60%;
  background: rgba(129,140,248,0.1);
  animation: authOrbFloat3 16s ease-in-out infinite;
}

@keyframes authOrbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -30px) scale(1.05); }
  50% { transform: translate(-15px, 20px) scale(0.95); }
  75% { transform: translate(10px, 10px) scale(1.02); }
}

@keyframes authOrbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-25px, 15px) scale(1.08); }
  66% { transform: translate(15px, -20px) scale(0.96); }
}

@keyframes authOrbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -25px) scale(1.1); }
}

/* Vignette */
.auth-hero__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 50%, transparent 20%, rgba(6,10,19,0.5) 100%);
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
  width: 72px;
  height: 72px;
  margin: 0 auto;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,211,238,0.15));
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
}

.auth-hero__logo-svg {
  width: 40px;
  height: 40px;
}

.auth-hero__title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.auth-hero__tagline {
  font-size: 1rem;
  color: #94a3b8;
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
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 500;
}

.auth-hero__feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #22d3ee);
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(59,130,246,0.4);
}

/* ── Form Panel ── */
.auth-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f8fafc;
}

@media (min-width: 1024px) {
  .auth-form-panel {
    width: 50%;
    min-height: auto;
  }
}

:global(.dark) .auth-form-panel,
.auth-form-panel:where(.dark *) {
  background: #0a0e1a;
}

/* Dark mode detection via class on shell */
.auth-shell :deep(.auth-form-panel) {
  background: #f8fafc;
}

/* We'll handle dark mode via data-theme on html */
@media (prefers-color-scheme: dark) {
  .auth-form-panel {
    background: #0a0e1a;
  }
}

/* Mobile header */
.auth-mobile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

@media (min-width: 1024px) {
  .auth-mobile-header {
    display: none;
  }
}

.auth-mobile-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.auth-mobile-logo-svg {
  width: 20px;
  height: 20px;
}

.auth-mobile-brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* Form wrapper */
.auth-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

@media (min-width: 640px) {
  .auth-form-wrap {
    padding: 3rem 2rem;
  }
}

/* ── Glass Card ── */
.auth-card {
  width: 100%;
  max-width: 26rem;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  box-shadow:
    0 1px 2px rgba(0,0,0,0.04),
    0 4px 16px rgba(0,0,0,0.04),
    0 16px 48px rgba(0,0,0,0.06);
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

/* Dark mode card */
:global([data-theme="light"]) .auth-card,
.auth-card {
  background: rgba(255,255,255,0.92);
  border-color: rgba(0,0,0,0.06);
  color: #0f172a;
}

:global([data-theme="dark"]) .auth-form-panel {
  background: #0a0e1a;
}

:global([data-theme="dark"]) .auth-card {
  background: rgba(18, 24, 38, 0.85);
  border-color: rgba(255,255,255,0.06);
  color: #f1f5f9;
  box-shadow:
    0 1px 2px rgba(0,0,0,0.2),
    0 4px 16px rgba(0,0,0,0.2),
    0 16px 48px rgba(0,0,0,0.3);
}

:global([data-theme="dark"]) .auth-mobile-header {
  border-bottom-color: rgba(255,255,255,0.06);
}

:global([data-theme="dark"]) .auth-mobile-brand {
  color: #f1f5f9;
}

/* Card header */
.auth-card__header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-card__title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
}

:global([data-theme="dark"]) .auth-card__title {
  color: #f1f5f9;
}

.auth-card__subtitle {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

:global([data-theme="dark"]) .auth-card__subtitle {
  color: #94a3b8;
}
</style>
