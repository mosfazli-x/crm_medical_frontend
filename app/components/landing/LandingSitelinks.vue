<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  {
    href: '/',
    icon: 'home',
    title: t('sitelinks.home.title'),
    desc: t('sitelinks.home.desc'),
  },
  {
    href: '/about',
    icon: 'info',
    title: t('sitelinks.about.title'),
    desc: t('sitelinks.about.desc'),
  },
  {
    href: '/booking',
    icon: 'calendar',
    title: t('sitelinks.booking.title'),
    desc: t('sitelinks.booking.desc'),
  },
  {
    href: '/blog',
    icon: 'article',
    title: t('sitelinks.blog.title'),
    desc: t('sitelinks.blog.desc'),
  },
  {
    href: '/screening',
    icon: 'search',
    title: t('sitelinks.screening.title'),
    desc: t('sitelinks.screening.desc'),
  },
  {
    href: '/auth/login',
    icon: 'user',
    title: t('sitelinks.login.title'),
    desc: t('sitelinks.login.desc'),
  },
])
</script>

<template>
  <section class="sitelinks">
    <div class="sitelinks__inner">
      <header class="sitelinks__header">
        <span class="sitelinks__eyebrow">
          <span class="sitelinks__eyebrow-rule" />
          {{ t('sitelinks.eyebrow') }}
          <span class="sitelinks__eyebrow-rule" />
        </span>
        <h2 class="sitelinks__heading">{{ t('sitelinks.heading') }}</h2>
        <p class="sitelinks__sub">{{ t('sitelinks.sub') }}</p>
      </header>

      <nav :aria-label="t('sitelinks.ariaLabel')" class="sitelinks__grid">
        <NuxtLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          class="sitelinks__card"
        >
          <span class="sitelinks__icon">
            <!-- home -->
            <svg v-if="link.icon === 'home'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <!-- info -->
            <svg v-else-if="link.icon === 'info'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <!-- calendar -->
            <svg v-else-if="link.icon === 'calendar'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <!-- article -->
            <svg v-else-if="link.icon === 'article'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <!-- search -->
            <svg v-else-if="link.icon === 'search'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <!-- user -->
            <svg v-else-if="link.icon === 'user'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <span class="sitelinks__body">
            <span class="sitelinks__title">{{ link.title }}</span>
            <span class="sitelinks__desc">{{ link.desc }}</span>
          </span>
          <span class="sitelinks__arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5"/>
              <path d="m12 19-7-7 7-7"/>
            </svg>
          </span>
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.sitelinks {
  position: relative;
  z-index: 10;
  padding: 5rem 1.5rem;
}

.sitelinks__inner {
  max-width: 1100px;
  margin: 0 auto;
}

/* ─── Header ─────────────────────────────────────── */

.sitelinks__header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.sitelinks__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.6rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--iceblue) 60%, transparent);
  margin-bottom: 1.25rem;
}

.sitelinks__eyebrow-rule {
  height: 1px;
  width: 2.5rem;
  background: color-mix(in oklab, var(--iceblue) 35%, transparent);
}

.sitelinks__heading {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 300;
  color: var(--lightcyan);
  margin: 0 0 0.75rem;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.sitelinks__sub {
  font-size: 0.9rem;
  color: color-mix(in oklab, var(--periwinkle) 65%, transparent);
  max-width: 28rem;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── Grid ───────────────────────────────────────── */

.sitelinks__grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .sitelinks__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .sitelinks__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ─── Card ───────────────────────────────────────── */

.sitelinks__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  text-decoration: none;
  color: inherit;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--lightcyan) 5%, transparent),
    transparent 60%
  );
  border: 1px solid color-mix(in oklab, var(--border) 40%, transparent);
  border-radius: 14px;
  backdrop-filter: blur(12px) saturate(1.3);
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.sitelinks__card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--emerald) 6%, transparent),
    transparent 50%
  );
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.sitelinks__card:hover {
  border-color: color-mix(in oklab, var(--emerald) 25%, transparent);
  transform: translateY(-3px);
  box-shadow:
    0 16px 40px -16px color-mix(in oklab, var(--ink) 85%, transparent),
    0 0 0 1px color-mix(in oklab, var(--emerald) 10%, transparent);
}

.sitelinks__card:hover::before {
  opacity: 1;
}

.sitelinks__card:focus-visible {
  outline: 2px dashed color-mix(in oklab, var(--champagne) 60%, transparent);
  outline-offset: 4px;
}

/* ─── Icon ───────────────────────────────────────── */

.sitelinks__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: color-mix(in oklab, var(--lightcyan) 7%, transparent);
  border: 1px solid color-mix(in oklab, var(--lightcyan) 8%, transparent);
  color: color-mix(in oklab, var(--champagne) 80%, transparent);
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.sitelinks__card:hover .sitelinks__icon {
  background: color-mix(in oklab, var(--emerald) 12%, transparent);
  border-color: color-mix(in oklab, var(--emerald) 20%, transparent);
  color: var(--emerald-bright);
  box-shadow: 0 0 20px color-mix(in oklab, var(--emerald) 15%, transparent);
}

/* ─── Body ───────────────────────────────────────── */

.sitelinks__body {
  flex: 1;
  min-width: 0;
}

.sitelinks__title {
  display: block;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 500;
  color: var(--lightcyan);
  transition: color 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 1.3;
}

.sitelinks__card:hover .sitelinks__title {
  color: color-mix(in oklab, var(--emerald-bright) 90%, white);
}

.sitelinks__desc {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: color-mix(in oklab, var(--periwinkle) 55%, transparent);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Arrow ──────────────────────────────────────── */

.sitelinks__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  color: color-mix(in oklab, var(--periwinkle) 35%, transparent);
  transform: translateX(0);
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.sitelinks__card:hover .sitelinks__arrow {
  color: var(--emerald-bright);
  transform: translateX(-3px);
}

:dir(rtl) .sitelinks__card:hover .sitelinks__arrow {
  transform: translateX(3px);
}

/* ─── Responsive tweaks ──────────────────────────── */

@media (max-width: 639px) {
  .sitelinks {
    padding: 3rem 1rem;
  }

  .sitelinks__card {
    padding: 1rem 1.25rem;
  }

  .sitelinks__desc {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

/* ─── Reduced motion ─────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .sitelinks__card,
  .sitelinks__icon,
  .sitelinks__arrow,
  .sitelinks__card::before {
    transition: none;
  }

  .sitelinks__card:hover {
    transform: none;
  }

  .sitelinks__card:hover .sitelinks__arrow {
    transform: none;
  }
}
</style>
