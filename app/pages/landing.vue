<template>
  <div class="lp" :dir="dir" :class="{ 'is-locked': menuOpen }">
    <a class="lp-skip" href="#lp-main">{{ t('landingPage.nav.home') }}</a>

    <!-- ==================== HEADER ==================== -->
    <header class="lp-head" :class="{ 'is-stuck': headerStuck, 'is-open': menuOpen }">
      <div class="lp-head__inner">
        <NuxtLink to="/landing" class="lp-brand">
          <span class="lp-brand__mark">
            <img
              src="../assets/images/hastihoseinilogoBlack.png"
              alt=""
              width="46"
              height="46"
            />
          </span>
          <span class="lp-brand__text">
            <strong>{{ t('landing.clinicName') }}</strong>
            <small>{{ t('aboutPage.team.members.1.role') }}</small>
          </span>
        </NuxtLink>

        <nav class="lp-nav" :aria-label="t('landingPage.nav.home')">
          <NuxtLink to="/landing" class="lp-nav__link is-current">
            {{ t('landingPage.nav.home') }}
          </NuxtLink>
          <a href="#lp-services" class="lp-nav__link">{{ t('landingPage.nav.services') }}</a>
          <a href="#lp-about" class="lp-nav__link">{{ t('landingPage.nav.about') }}</a>
          <NuxtLink to="/blog" class="lp-nav__link">{{ t('landingPage.nav.blog') }}</NuxtLink>
          <a href="#lp-contact" class="lp-nav__link">{{ t('landingPage.nav.contact') }}</a>
        </nav>

        <div class="lp-head__tools">
          <button
            type="button"
            class="lp-lang"
            :aria-label="t('landingPage.nav.langToggle')"
            @click="toggleLang"
          >
            <Icon name="lucide:globe" size="16" />
            <span>{{ isRtl ? 'EN' : 'FA' }}</span>
          </button>

          <NuxtLink to="/" class="lp-tool lp-tool--soft">
            <Icon name="lucide:house" size="16" />
            <span>{{ t('landingPage.nav.mainSite') }}</span>
          </NuxtLink>

          <NuxtLink to="/auth/login" class="lp-tool">
            <Icon name="lucide:user" size="16" />
            <span>{{ t('landingPage.nav.login') }}</span>
          </NuxtLink>

          <NuxtLink to="/booking" class="lp-btn lp-btn--primary lp-btn--sm lp-head__book">
            {{ t('landingPage.nav.book') }}
          </NuxtLink>

          <button
            type="button"
            class="lp-burger"
            :aria-label="menuOpen ? t('landingPage.nav.closeMenu') : t('landingPage.nav.openMenu')"
            :aria-expanded="menuOpen"
            aria-controls="lp-mobilemenu"
            @click="menuOpen = !menuOpen"
          >
            <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" size="21" />
          </button>
        </div>
      </div>

      <div v-if="menuOpen" id="lp-mobilemenu" class="lp-mobile">
        <nav class="lp-mobile__list" :aria-label="t('landingPage.nav.home')">
          <NuxtLink to="/landing" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.home') }}
          </NuxtLink>
          <a href="#lp-services" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.services') }}
          </a>
          <a href="#lp-about" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.about') }}
          </a>
          <NuxtLink to="/blog" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.blog') }}
          </NuxtLink>
          <a href="#lp-contact" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.contact') }}
          </a>
          <NuxtLink to="/" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.mainSite') }}
          </NuxtLink>
          <NuxtLink to="/auth/login" class="lp-mobile__link" @click="menuOpen = false">
            {{ t('landingPage.nav.login') }}
          </NuxtLink>
        </nav>

        <NuxtLink to="/booking" class="lp-btn lp-btn--primary lp-mobile__cta" @click="menuOpen = false">
          {{ t('landingPage.nav.book') }}
          <Icon name="lucide:arrow-left" size="17" class="lp-forward" />
        </NuxtLink>
      </div>
    </header>

    <main id="lp-main">
      <!-- ==================== HERO ==================== -->
      <section class="lp-hero">
        <span class="lp-hero__dots" aria-hidden="true" />
        <div class="lp-hero__inner">
          <div class="lp-hero__copy">
            <p class="lp-eyebrow lp-hero__eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.hero.eyebrow') }}
            </p>

            <h1 class="lp-hero__title">{{ t('landingPage.hero.title') }}</h1>
            <p class="lp-hero__subtitle">{{ t('landingPage.hero.subtitle') }}</p>
            <p class="lp-hero__desc">{{ t('landingPage.hero.desc') }}</p>

            <div class="lp-hero__actions">
              <NuxtLink to="/booking" class="lp-btn lp-btn--primary">
                {{ t('landingPage.hero.ctaBook') }}
                <Icon name="lucide:arrow-left" size="17" class="lp-forward" />
              </NuxtLink>
              <NuxtLink to="/auth/login" class="lp-btn lp-btn--ghost">
                {{ t('auth.login.login') }}
              </NuxtLink>
              <NuxtLink to="/auth/register" class="lp-btn lp-btn--ghost">
                {{ t('auth.login.register') }}
              </NuxtLink>
            </div>

            <dl class="lp-stats">
              <div class="lp-stat">
                <dt>{{ t('landingPage.hero.stats.patientsValue') }}</dt>
                <dd>{{ t('landingPage.hero.stats.patientsLabel') }}</dd>
              </div>
              <span class="lp-stats__rule" aria-hidden="true" />
              <div class="lp-stat">
                <dt>{{ t('landingPage.hero.stats.yearsValue') }}</dt>
                <dd>{{ t('landingPage.hero.stats.yearsLabel') }}</dd>
              </div>
            </dl>
          </div>

          <div class="lp-hero__visual">
            <span class="lp-hero__halo" aria-hidden="true" />
            <span class="lp-hero__orbit" aria-hidden="true" />

            <figure class="lp-portrait">
              <div class="lp-portrait__frame">
                <img
                  src="/images/about/dr-hosseini-cutout.png"
                  :alt="t('landingPage.hero.portraitAlt')"
                  width="519"
                  height="920"
                  fetchpriority="high"
                />
              </div>

              <NuxtLink to="/booking" class="lp-portrait__badge">
                <span class="lp-portrait__badge-icon" aria-hidden="true">
                  <Icon name="lucide:calendar-check" size="19" />
                </span>
                <span class="lp-portrait__badge-text">
                  <strong>{{ t('landingPage.nav.book') }}</strong>
                  <small>{{ t('landingPage.booking.sub') }}</small>
                </span>
                <Icon name="lucide:arrow-left" size="16" class="lp-forward" />
              </NuxtLink>
            </figure>
          </div>
        </div>
      </section>

      <!-- ==================== QUICK BOOK ==================== -->
      <section class="lp-section lp-quick">
        <div class="lp-wrap">
          <header class="lp-sechead">
            <p class="lp-eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.booking.sub') }}
            </p>
            <h2 class="lp-h2">{{ t('landingPage.quickBook.title') }}</h2>
            <p class="lp-sechead__desc">{{ t('landingPage.quickBook.desc') }}</p>
          </header>

          <div class="lp-quick__grid">
            <NuxtLink
              v-for="(item, i) in bookingServices"
              :key="item.title"
              to="/booking"
              class="lp-qcard"
              :class="{ 'lp-qcard--feature': i === 0 }"
            >
              <div class="lp-qcard__top">
                <span class="lp-qcard__icon" aria-hidden="true">
                  <Icon :name="iconAt(quickIcons, i)" size="22" />
                </span>
                <span class="lp-qcard__num" aria-hidden="true">{{ pn(String(i + 1).padStart(2, '0')) }}</span>
              </div>

              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>

              <span class="lp-qcard__cta">
                {{ t('landingPage.nav.book') }}
                <Icon name="lucide:arrow-left" size="15" class="lp-forward" />
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== ABOUT ==================== -->
      <section id="lp-about" class="lp-section lp-about">
        <div class="lp-wrap lp-about__grid">
          <div class="lp-about__media">
            <figure class="lp-about__frame">
              <img
                src="/images/dr_hosseini_2.webp"
                :alt="t('landingPage.about.figureAlt')"
                width="800"
                height="800"
                loading="lazy"
              />
            </figure>

            <div class="lp-about__plaque">
              <img
                src="../assets/images/hastihoseinilogoBlack.png"
                alt=""
                width="38"
                height="38"
                aria-hidden="true"
              />
              <span>
                <strong>{{ t('landing.clinicName') }}</strong>
                <small>{{ t('aboutPage.team.members.1.role') }}</small>
              </span>
            </div>
          </div>

          <div class="lp-about__copy">
            <p class="lp-eyebrow lp-eyebrow--light">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.about.eyebrow') }}
            </p>
            <h2 class="lp-h2 lp-h2--light">{{ t('landingPage.about.title') }}</h2>
            <p class="lp-about__p">{{ t('landingPage.about.p1') }}</p>
            <p class="lp-about__p">{{ t('landingPage.about.p2') }}</p>

            <ul class="lp-checks">
              <li v-for="point in aboutPoints" :key="point">
                <span class="lp-checks__mark" aria-hidden="true">
                  <Icon name="lucide:check" size="13" />
                </span>
                {{ point }}
              </li>
            </ul>

            <NuxtLink to="/about" class="lp-btn lp-btn--light">
              {{ t('landingPage.about.cta') }}
              <Icon name="lucide:arrow-left" size="16" class="lp-forward" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== SERVICES ==================== -->
      <section id="lp-services" class="lp-section lp-services">
        <div class="lp-wrap">
          <header class="lp-splithead">
            <div class="lp-splithead__main">
              <p class="lp-eyebrow">
                <span class="lp-eyebrow__dot" aria-hidden="true" />
                {{ t('landingPage.nav.services') }}
              </p>
              <h2 class="lp-h2">{{ t('landingPage.services.title') }}</h2>
            </div>
            <div class="lp-splithead__aside">
              <p class="lp-sechead__desc">{{ t('landingPage.services.desc') }}</p>
              <NuxtLink to="/booking" class="lp-link-arrow">
                {{ t('landingPage.services.viewAll') }}
                <Icon name="lucide:arrow-left" size="15" class="lp-forward" />
              </NuxtLink>
            </div>
          </header>

          <div class="lp-services__grid">
            <article v-for="(item, i) in services" :key="item.title" class="lp-service">
              <span class="lp-service__num" aria-hidden="true">{{ pn(String(i + 1).padStart(2, '0')) }}</span>
              <span class="lp-service__icon" :class="`lp-service__icon--${i % 3}`" aria-hidden="true">
                <Icon :name="iconAt(serviceIcons, i)" size="24" />
              </span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- ==================== BOOKING ==================== -->
      <section id="lp-booking" class="lp-section lp-booking">
        <div class="lp-wrap">
          <header class="lp-sechead">
            <p class="lp-eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.booking.sub') }}
            </p>
            <h2 class="lp-h2">{{ t('landingPage.booking.title') }}</h2>
          </header>

          <div class="lp-widget">
            <div class="lp-widget__top">
              <p class="lp-widget__label">{{ t('landingPage.booking.selectedService') }}</p>

              <div class="lp-chips">
                <button
                  v-for="option in flatServices"
                  :key="serviceKey(option)"
                  type="button"
                  class="lp-chip"
                  :class="{ 'is-active': isServiceActive(option) }"
                  :aria-pressed="isServiceActive(option)"
                  @click="selectService(option)"
                >
                  {{ chipLabel(option) }}
                </button>

                <p v-if="flatServices.length === 0 && !servicesLoading" class="lp-note">
                  {{ t('booking.fetchServicesError') }}
                </p>
                <p v-else-if="servicesLoading && flatServices.length === 0" class="lp-note">
                  {{ t('landingPage.booking.loading') }}
                </p>
              </div>
            </div>

            <div v-if="activeDoctorId" class="lp-widget__body">
              <div class="lp-stage">
                <h3 class="lp-step">{{ t('landingPage.booking.stepDay') }}</h3>

                <p v-if="availabilityLoading" class="lp-note">
                  {{ t('landingPage.booking.checkingAvailability') }}
                </p>

                <div v-else-if="bookableDays.length" class="lp-days">
                  <button
                    v-for="day in bookableDays"
                    :key="day.gregorian"
                    type="button"
                    class="lp-day"
                    :class="{ 'is-active': selectedDay === day.gregorian }"
                    :aria-pressed="selectedDay === day.gregorian"
                    @click="selectedDay = day.gregorian"
                  >
                    <span class="lp-day__week">{{ day.weekday }}</span>
                    <span class="lp-day__date">{{ day.date }}</span>
                  </button>
                </div>

                <p v-else class="lp-note">
                  {{ t('landingPage.booking.noAvailableDays') }}
                </p>
              </div>

              <div v-if="!availabilityLoading && bookableDays.length" class="lp-stage">
                <h3 class="lp-step">{{ t('landingPage.booking.stepTime') }}</h3>
                <p v-if="slotsLoading" class="lp-note">{{ t('landingPage.booking.loading') }}</p>
                <p v-else-if="slots.length === 0" class="lp-note">{{ t('landingPage.booking.noSlots') }}</p>
                <div v-else class="lp-slots">
                  <button
                    v-for="slot in slots"
                    :key="slot.startTime"
                    type="button"
                    class="lp-slot"
                    :class="{ 'is-active': selectedSlot === slot.startTime }"
                    :aria-pressed="selectedSlot === slot.startTime"
                    @click="selectedSlot = slot.startTime"
                  >
                    {{ slot.startTime }}
                  </button>
                </div>
              </div>

              <div class="lp-widget__foot">
                <span class="lp-widget__summary">
                  <Icon name="lucide:calendar-clock" size="16" aria-hidden="true" />
                  <template v-if="selectedSlot">
                    {{ t('landingPage.booking.selected') }}: {{ selectedSlot }}
                  </template>
                  <template v-else>{{ t('landingPage.booking.summaryHint') }}</template>
                </span>
                <NuxtLink :to="bookingLink" class="lp-btn lp-btn--primary">
                  {{ t('landingPage.booking.continue') }}
                  <Icon name="lucide:arrow-left" size="16" class="lp-forward" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== GALLERY ==================== -->
      <section class="lp-section lp-gallery-section">
        <div class="lp-wrap">
          <header class="lp-sechead">
            <p class="lp-eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landing.clinicName') }}
            </p>
            <h2 class="lp-h2">{{ t('landingPage.gallery.title') }}</h2>
            <p class="lp-sechead__desc">{{ t('landingPage.gallery.desc') }}</p>
          </header>

          <div class="lp-gallery">
            <article
              v-for="(item, i) in gallery"
              :key="item.title"
              class="lp-shot"
              :class="`lp-shot--${i % 4}`"
            >
              <span class="lp-shot__icon" aria-hidden="true">
                <Icon :name="iconAt(galleryIcons, i)" size="24" />
              </span>
              <div class="lp-shot__caption">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ==================== TESTIMONIALS ==================== -->
      <section id="lp-testimonials" class="lp-section lp-testimonials">
        <div class="lp-wrap">
          <header class="lp-sechead">
            <p class="lp-eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.testimonials.sub') }}
            </p>
            <h2 class="lp-h2">{{ t('landingPage.testimonials.title') }}</h2>
          </header>

          <div class="lp-quotes">
            <blockquote
              v-for="(item, i) in testimonials"
              :key="item.name"
              class="lp-quote"
              :class="{ 'lp-quote--feature': i === 0 }"
            >
              <div class="lp-quote__top">
                <span class="lp-stars" aria-hidden="true">★★★★★</span>
                <Icon name="lucide:quote" size="26" class="lp-quote__mark" aria-hidden="true" />
              </div>

              <p>{{ item.text }}</p>

              <footer>
                <span class="lp-quote__avatar" aria-hidden="true">{{ String(item.name ?? '').charAt(0) }}</span>
                <span class="lp-quote__who">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.date }}</small>
                </span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <!-- ==================== CONTACT ==================== -->
      <section id="lp-contact" class="lp-section lp-contact">
        <div class="lp-wrap lp-contact__grid">
          <div class="lp-contact__copy">
            <p class="lp-eyebrow">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              {{ t('landingPage.nav.contact') }}
            </p>
            <h2 class="lp-h2">{{ t('landingPage.contact.title') }}</h2>
            <p class="lp-sechead__desc">{{ t('landingPage.contact.desc') }}</p>

            <dl class="lp-details">
              <div class="lp-detail">
                <span class="lp-detail__icon" aria-hidden="true">
                  <Icon name="lucide:map-pin" size="19" />
                </span>
                <div>
                  <dt>{{ t('landingPage.contact.addressLabel') }}</dt>
                  <dd>
                    {{ t('landingPage.contact.address') }}
                    <a
                      class="lp-detail__link"
                      :href="googleDirectionsUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ t('landingPage.contact.directions') }}
                    </a>
                  </dd>
                </div>
              </div>

              <div class="lp-detail">
                <span class="lp-detail__icon" aria-hidden="true">
                  <Icon name="lucide:phone" size="19" />
                </span>
                <div>
                  <dt>{{ t('landingPage.contact.phoneLabel') }}</dt>
                  <dd>
                    <a class="lp-detail__link" href="tel:+989379412491" dir="ltr">
                      {{ t('landingPage.contact.phone') }}
                    </a>
                  </dd>
                </div>
              </div>

              <div class="lp-detail">
                <span class="lp-detail__icon" aria-hidden="true">
                  <Icon name="lucide:clock" size="19" />
                </span>
                <div>
                  <dt>{{ t('landingPage.contact.hoursLabel') }}</dt>
                  <dd>{{ t('landingPage.contact.hours') }}</dd>
                </div>
              </div>
            </dl>

            <a href="tel:+989379412491" class="lp-btn lp-btn--primary">
              <Icon name="lucide:phone-call" size="17" />
              {{ t('landingPage.contact.cta') }}
            </a>
          </div>

          <div class="lp-contact__map">
            <div
              :id="NESHAN_MAP_ID"
              class="lp-contact__map-canvas"
              role="application"
              :aria-label="t('landingPage.contact.mapTitle')"
            />

            <a
              v-if="!neshanMapReady"
              class="lp-contact__map-fallback"
              :href="neshanDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="lp-contact__map-fallback-icon" aria-hidden="true">
                <Icon name="lucide:map" size="26" />
              </span>
              {{ t('landingPage.contact.directions') }}
            </a>

            <a
              v-else
              class="lp-contact__map-pin"
              :href="googleDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="lucide:navigation" size="15" />
              {{ t('landingPage.contact.directions') }}
            </a>
          </div>
        </div>
      </section>

      <!-- ==================== BLOG ==================== -->
      <section class="lp-section lp-blog">
        <div class="lp-wrap">
          <header class="lp-splithead">
            <div class="lp-splithead__main">
              <p class="lp-eyebrow">
                <span class="lp-eyebrow__dot" aria-hidden="true" />
                {{ t('landingPage.nav.blog') }}
              </p>
              <h2 class="lp-h2">{{ t('landingPage.blog.title') }}</h2>
            </div>
            <div class="lp-splithead__aside">
              <p class="lp-sechead__desc">{{ t('landingPage.blog.desc') }}</p>
              <NuxtLink to="/blog" class="lp-link-arrow">
                {{ t('landingPage.blog.viewAll') }}
                <Icon name="lucide:arrow-left" size="15" class="lp-forward" />
              </NuxtLink>
            </div>
          </header>

          <p v-if="posts.length === 0" class="lp-note lp-note--center">{{ t('landingPage.blog.empty') }}</p>

          <div v-else class="lp-posts" :class="`lp-posts--${Math.min(posts.length, 3)}`">
            <NuxtLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`" class="lp-post">
              <span class="lp-post__media" aria-hidden="true">
                <img v-if="post.coverImage" :src="post.coverImage" alt="" loading="lazy" />
                <Icon v-else name="lucide:newspaper" size="28" />
              </span>

              <div class="lp-post__body">
                <span class="lp-post__meta">{{ formatDate(post.publishedAt) }}</span>
                <h3>{{ postTitle(post) }}</h3>
                <p>{{ postExcerpt(post) }}</p>
                <span class="lp-post__more">
                  {{ t('landingPage.blog.readMore') }}
                  <Icon name="lucide:arrow-left" size="14" class="lp-forward" />
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- ==================== FOOTER ==================== -->
    <footer class="lp-footer">
      <img
        class="lp-footer__mark"
        src="../assets/images/hastihoseinilogo.png"
        alt=""
        aria-hidden="true"
      />

      <div class="lp-wrap lp-footer__inner">
        <div class="lp-footer__grid">
          <div class="lp-footer__brand">
            <NuxtLink to="/landing" class="lp-brand lp-brand--light">
              <span class="lp-brand__mark">
                <img
                  src="../assets/images/hastihoseinilogo.png"
                  alt=""
                  width="46"
                  height="46"
                />
              </span>
              <span class="lp-brand__text">
                <strong>{{ t('landing.clinicName') }}</strong>
                <small>{{ t('aboutPage.team.members.1.role') }}</small>
              </span>
            </NuxtLink>

            <p>{{ t('landingPage.footer.description') }}</p>
            <p class="lp-footer__note">{{ t('landingPage.footer.disclaimer') }}</p>
          </div>

          <div class="lp-footer__col">
            <h3>{{ t('landingPage.footer.servicesTitle') }}</h3>
            <ul>
              <li v-for="link in footerServices" :key="link">
                <NuxtLink to="/booking">{{ link }}</NuxtLink>
              </li>
            </ul>
          </div>

          <div class="lp-footer__col">
            <h3>{{ t('landingPage.footer.topicsTitle') }}</h3>
            <ul>
              <li v-for="link in footerTopics" :key="link">
                <NuxtLink to="/blog">{{ link }}</NuxtLink>
              </li>
            </ul>
          </div>

          <div class="lp-footer__col">
            <h3>{{ t('landingPage.footer.contactTitle') }}</h3>
            <p class="lp-footer__lead">{{ t('landingPage.footer.contactDesc') }}</p>

            <ul class="lp-footer__contact">
              <li>
                <Icon name="lucide:map-pin" size="16" aria-hidden="true" />
                {{ t('landingPage.contact.address') }}
              </li>
              <li>
                <Icon name="lucide:phone" size="16" aria-hidden="true" />
                <a href="tel:+989379412491" dir="ltr">{{ t('landingPage.contact.phone') }}</a>
              </li>
              <li>
                <Icon name="lucide:clock" size="16" aria-hidden="true" />
                {{ t('landingPage.contact.hours') }}
              </li>
            </ul>

            <NuxtLink to="/auth/login" class="lp-btn lp-btn--light lp-btn--sm">
              {{ t('landingPage.footer.loginCta') }}
            </NuxtLink>
          </div>
        </div>

        <div class="lp-footer__bar">
          <p>© {{ year }} — {{ t('landingPage.footer.copyright') }}</p>
          <div class="lp-footer__bar-links">
            <NuxtLink to="/landing">{{ t('landingPage.nav.home') }}</NuxtLink>
            <a href="#lp-services">{{ t('landingPage.nav.services') }}</a>
            <a href="#lp-contact">{{ t('landingPage.nav.contact') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'

definePageMeta({ layout: false })

const { t, list, isRtl, toggleLang, pn } = useLang()
const { apiFetch } = useApi()
const { listPublishedPosts } = useBlog()

const dir = computed(() => (isRtl.value ? 'rtl' : 'ltr'))
const year = computed(() => (isRtl.value ? pn(new Date().getFullYear()) : new Date().getFullYear()))

/* ─── Header ───────────────────────────────────────── */

const menuOpen = ref(false)
const headerStuck = ref(false)

function onScroll() {
  headerStuck.value = window.scrollY > 16
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') menuOpen.value = false
}

function onResize() {
  if (window.innerWidth >= 1080) menuOpen.value = false
}

watch(menuOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})

/* ─── Services ──────────────────────────────────────── */

const quickIcons = ['lucide:clipboard-list', 'lucide:scan-line', 'lucide:users', 'lucide:video']
const serviceIcons = ['lucide:scissors', 'lucide:sparkles', 'lucide:search']
const galleryIcons = ['lucide:stethoscope', 'lucide:door-open', 'lucide:zap', 'lucide:message-square']

/** Cycles through the icon set so short and long lists both stay covered. */
function iconAt(icons: string[], index: number): string {
  return icons[index % icons.length] ?? 'lucide:sparkles'
}

/** Localised lists live as arrays, so they are read via useLang().list. */
const services = computed(() => list<{ title: string; desc: string }>('landingPage.services.items'))
const bookingServices = computed(() => list<{ title: string; desc: string }>('landingPage.quickBook.items'))
const aboutPoints = computed(() => list<string>('landingPage.about.points'))
const gallery = computed(() => list<{ title: string; desc: string }>('landingPage.gallery.items'))
const testimonials = computed(() => list<{ text: string; name: string; date: string }>('landingPage.testimonials.items'))
const footerServices = computed(() => list<string>('landingPage.footer.servicesLinks'))
const footerTopics = computed(() => list<string>('landingPage.footer.topicsLinks'))

/* ─── Booking widget ────────────────────────────────── */

interface ServiceOption {
  doctorId: string
  doctorName: string
  visitTypeId: string
  name: string
  price: string | number | null
}

interface Slot {
  startTime: string
  endTime: string
}

interface Envelope<T> {
  success: boolean
  data: T
}

const servicesLoading = ref(false)
const servicesList = ref<ServiceOption[]>([])
const selectedServiceKey = ref('')

const flatServices = computed(() => servicesList.value)

const activeDoctorId = computed(
  () => flatServices.value.find((s) => serviceKey(s) === selectedServiceKey.value)?.doctorId ?? ''
)

function serviceKey(option: ServiceOption) {
  return `${option.visitTypeId}:${option.doctorId}`
}

function isServiceActive(option: ServiceOption) {
  return serviceKey(option) === selectedServiceKey.value
}

/**
 * A visit type offered by several doctors produces one chip per doctor, so the
 * labels would be indistinguishable. Qualify those with the doctor's name.
 */
function chipLabel(option: ServiceOption): string {
  const shared = servicesList.value.filter((o) => o.name === option.name)
  return shared.length > 1 ? `${option.name} — ${option.doctorName}` : option.name
}

async function fetchServices() {
  servicesLoading.value = true
  try {
    const res = await apiFetch<Envelope<{ name: string; doctors?: ServiceOption[] }[]>>('/api/booking/services')
    const options = (res?.data ?? []).flatMap((group) => group.doctors ?? [])
    servicesList.value = options
    if (options.length && !options.some((o) => serviceKey(o) === selectedServiceKey.value)) {
      selectedServiceKey.value = serviceKey(options[0]!)
    }
  } catch {
    servicesList.value = []
  } finally {
    servicesLoading.value = false
  }
}

function selectService(option: ServiceOption) {
  selectedServiceKey.value = serviceKey(option)
}

onMounted(fetchServices)

interface CandidateDay {
  gregorian: string
  weekday: string
  date: string
}

/**
 * The next 14 days as candidate chips.
 *
 * No weekday is excluded here: this moment-jalaali build's `isoWeekday()` is
 * Saturday-based, so a hardcoded "closed day" filter silently dropped the
 * Saturdays. Each doctor's real working days come from `doctorAvailability`,
 * which the availability probe below already resolves.
 */
const candidateDays = computed<CandidateDay[]>(() => {
  const days: CandidateDay[] = []
  const today = moment()

  for (let offset = 0; offset < 14; offset++) {
    const day = today.clone().add(offset, 'day')

    days.push({
      gregorian: day.format('YYYY-MM-DD'),
      weekday: isRtl.value
        ? day.format('dddd')
        : day.locale('en').format('ddd'),
      date: isRtl.value ? day.format('jD') : day.format('D'),
    })
  }

  return days
})

/**
 * Days that actually have an open slot for the selected doctor.
 *
 * The API only exposes slots one date at a time, so each candidate day is
 * probed and the fully-booked ones are dropped — this mirrors the marked-dates
 * logic in BookingFlow.vue (pooled requests, per-doctor cache, stale-response
 * token) rather than showing a day and then failing to offer times on it.
 */
const availableDates = ref<string[]>([])
const availabilityLoading = ref(false)

/** Cached per doctor, so switching back and forth never re-probes. */
const availabilityCache = new Map<string, string[]>()
let availabilityToken = 0

/** Mirrors runPooled in BookingFlow.vue: caps concurrency over a work list. */
async function runPooled<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0
  const size = Math.max(1, Math.min(limit, items.length))
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (cursor < items.length) {
        const item = items[cursor++]!
        await worker(item)
      }
    })
  )
}

async function loadDayAvailability() {
  const doctorId = activeDoctorId.value
  const token = ++availabilityToken

  if (!doctorId) {
    availableDates.value = []
    availabilityLoading.value = false
    return
  }

  const cached = availabilityCache.get(doctorId)
  if (cached) {
    availableDates.value = cached
    availabilityLoading.value = false
    return
  }

  availabilityLoading.value = true
  availableDates.value = []

  const days = candidateDays.value
  const found: string[] = []

  await runPooled(days, 6, async (day) => {
    try {
      const res = await apiFetch<Envelope<Slot[]>>(
        `/api/booking/slots/${doctorId}?date=${day.gregorian}`
      )
      if (res?.success && (res.data ?? []).length > 0) found.push(day.gregorian)
    } catch {
      /* a day we cannot reach is treated as having no availability */
    }
  })

  // A newer request for another doctor superseded this one.
  if (token !== availabilityToken) return

  found.sort()
  availabilityCache.set(doctorId, found)
  availableDates.value = found
  availabilityLoading.value = false
}

const bookableDays = computed(() =>
  candidateDays.value.filter((d) => availableDates.value.includes(d.gregorian))
)

const selectedDay = ref('')

watch(
  bookableDays,
  (days) => {
    if (!days.some((d) => d.gregorian === selectedDay.value)) {
      selectedDay.value = days[0]?.gregorian ?? ''
    }
  },
  { immediate: true },
)

const slots = ref<Slot[]>([])
const slotsLoading = ref(false)
const selectedSlot = ref('')

let slotsToken = 0

async function fetchSlots() {
  const doctorId = activeDoctorId.value
  const date = selectedDay.value
  selectedSlot.value = ''

  if (!doctorId || !date) {
    slots.value = []
    return
  }

  const token = ++slotsToken
  slotsLoading.value = true

  try {
    const res = await apiFetch<Envelope<Slot[]>>(`/api/booking/slots/${doctorId}?date=${date}`)
    if (token !== slotsToken) return
    slots.value = res?.success ? (res.data ?? []) : []
  } catch {
    if (token !== slotsToken) return
    slots.value = []
  } finally {
    if (token === slotsToken) slotsLoading.value = false
  }
}

watch([activeDoctorId, selectedDay], fetchSlots)

watch(activeDoctorId, loadDayAvailability, { immediate: true })

const bookingLink = computed(() => '/booking')

/* ─── Blog ──────────────────────────────────────────── */

interface BlogPost {
  id: string
  slug: string
  titleFa: string
  titleEn?: string | null
  excerptFa: string
  excerptEn?: string | null
  coverImage?: string | null
  publishedAt?: string | null
}

const posts = ref<BlogPost[]>([])

/** English titles/excerpts are optional in the schema, so fall back to Persian. */
function postTitle(post: BlogPost): string {
  return (isRtl.value ? post.titleFa : post.titleEn) || post.titleFa
}

function postExcerpt(post: BlogPost): string {
  return (isRtl.value ? post.excerptFa : post.excerptEn) || post.excerptFa
}

onMounted(async () => {
  const result = await listPublishedPosts(1, 3)
  posts.value = (result.data as BlogPost[]) ?? []
})

function formatDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(isRtl.value ? 'fa-IR' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* ─── Neshan map ────────────────────────────────────── */

// Clinic coordinates: 35°46'04.0"N 51°27'29.9"E
const CLINIC_LAT = 35.767778
const CLINIC_LNG = 51.458306
const CLINIC_ZOOM = 16

const NESHAN_MAP_ID = 'lp-contact-map'
const NESHAN_SDK = 'https://static.neshan.org/sdk/mapboxgl/v1.13.2/neshan-sdk/v1.1.5/index.js'
const NESHAN_SDK_CSS =
  'https://static.neshan.org/sdk/mapboxgl/v1.13.2/neshan-sdk/v1.1.5/index.css'

const { public: publicConfig } = useRuntimeConfig()
const neshanMapKey = (publicConfig.neshanMapKey as string) || ''

const neshanDirectionsUrl = `https://neshan.org/maps#c${CLINIC_LAT}-${CLINIC_LNG}-${CLINIC_ZOOM}z-0p`
const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CLINIC_LAT},${CLINIC_LNG}`

/** Minimal shape of the bits of nmp_mapboxgl that the contact map touches. */
interface NeshanSdk {
  Map: new (options: Record<string, unknown>) => NeshanMap
  Marker: new (options?: Record<string, unknown>) => {
    setLngLat(lngLat: [number, number]): { addTo(map: NeshanMap): unknown }
  }
  MapConstructor: { mapTypes?: Record<string, unknown> }
}

interface NeshanMap {
  remove(): void
}

declare global {
  interface Window {
    nmp_mapboxgl?: NeshanSdk
  }
}

let neshanMap: NeshanMap | null = null
const neshanMapReady = ref(false)

/** Loads the Neshan SDK once, resolving even if another caller got there first. */
function loadNeshanSdk(): Promise<NeshanSdk> {
  if (window.nmp_mapboxgl) return Promise.resolve(window.nmp_mapboxgl)

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${NESHAN_SDK}"]`,
    )

    if (existing) {
      existing.addEventListener('load', () =>
        window.nmp_mapboxgl ? resolve(window.nmp_mapboxgl) : reject(new Error('neshan sdk unavailable')),
      )
      existing.addEventListener('error', () => reject(new Error('neshan sdk failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = NESHAN_SDK
    script.async = true
    script.addEventListener('load', () =>
      window.nmp_mapboxgl ? resolve(window.nmp_mapboxgl) : reject(new Error('neshan sdk unavailable')),
    )
    script.addEventListener('error', () => reject(new Error('neshan sdk failed to load')))
    document.head.appendChild(script)
  })
}

/** The SDK ships its own control/attribution CSS, which the rest of the page does not. */
function ensureNeshanStyles() {
  if (document.querySelector(`link[href="${NESHAN_SDK_CSS}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = NESHAN_SDK_CSS
  document.head.appendChild(link)
}

onMounted(async () => {
  if (!neshanMapKey) return

  const container = document.getElementById(NESHAN_MAP_ID)
  if (!container) return

  try {
    ensureNeshanStyles()
    const sdk = await loadNeshanSdk()

    neshanMap = new sdk.Map({
      container,
      mapKey: neshanMapKey,
      mapType: sdk.MapConstructor?.mapTypes?.neshanVector,
      center: [CLINIC_LNG, CLINIC_LAT],
      zoom: CLINIC_ZOOM,
      pitch: 0,
      minZoom: 2,
      maxZoom: 21,
      trackResize: true,
      poi: false,
      traffic: false,
    })

    new sdk.Marker({ color: '#12544a' }).setLngLat([CLINIC_LNG, CLINIC_LAT]).addTo(neshanMap)
    neshanMapReady.value = true
  } catch {
    // Without a key or network access the block falls back to a Neshan link.
    neshanMap = null
  }
})

onBeforeUnmount(() => {
  neshanMap?.remove()
  neshanMap = null
  neshanMapReady.value = false
})

/* ─── SEO ───────────────────────────────────────────── */

const metaTitle = computed(() => t('landingPage.seo.title'))
const metaDescription = computed(() => t('landingPage.seo.desc'))

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogType: 'website',
  ogImage: '/images/hero-poster.png',
})

// This page opts out of the default layout, so Useclinicseo never runs and
// <html> would otherwise stay without lang/dir.
useHead({
  htmlAttrs: {
    lang: computed(() => (isRtl.value ? 'fa' : 'en')),
    dir: computed(() => (isRtl.value ? 'rtl' : 'ltr')),
  },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Manrope:wght@400..800&display=swap',
    },
  ],
})
</script>

<style scoped>
/*
  Public marketing page — quiet-luxury clinical design.
  Warm ivory paper, deep forest ink, a single antique-gold accent and
  generous editorial spacing. Everything is built on logical properties so
  the same layout mirrors cleanly between Persian (RTL) and English (LTR).
*/

.lp {
  --paper: #f7f4ee;
  --paper-2: #f1ece2;
  --paper-3: #ece6da;
  --surface: #ffffff;
  --ink: #18231f;
  --ink-soft: #2a3731;
  --muted: #61706a;
  --line: rgba(24, 35, 31, 0.1);
  --line-strong: rgba(24, 35, 31, 0.18);
  --forest: #0d3f37;
  --forest-2: #12544a;
  --forest-deep: #082a24;
  --gold: #b78953;
  --gold-soft: #ecddc5;
  --blush: #f4e7e0;
  --sage: #e7efe8;
  --shadow-sm: 0 1px 2px rgba(24, 35, 31, 0.05), 0 12px 30px -18px rgba(24, 35, 31, 0.2);
  --shadow-md: 0 40px 90px -55px rgba(13, 63, 55, 0.45);

  --font-display: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-body: 'Manrope', ui-sans-serif, system-ui, -apple-system, sans-serif;

  --wrap: 1240px;
  --radius: 24px;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);

  min-height: 100vh;
  overflow-x: clip;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.lp[dir='rtl'] {
  --font-display: 'fa-num', 'Bon', 'AriaWeb', sans-serif;
  --font-body: 'fa-num', 'yekan-bakh', 'IRANSansX', sans-serif;
  line-height: 1.9;
}

.lp ::selection {
  background: var(--gold-soft);
  color: var(--forest);
}

:global(html) {
  background: #f7f4ee !important;
  scroll-behavior: smooth;
  scroll-padding-top: 96px;
}

:global(body) {
  background: #f7f4ee !important;
}

.lp-skip {
  position: absolute;
  inset-inline-start: -9999px;
  z-index: 200;
}

.lp-skip:focus {
  inset-inline-start: 1rem;
  top: 1rem;
  padding: 0.6rem 1.1rem;
  border-radius: 999px;
  background: var(--forest);
  color: #fff;
}

/* Arrow glyphs: the base icon points left (forward in RTL). */
:dir(ltr) .lp-forward {
  transform: scaleX(-1);
}

.lp-wrap {
  width: 100%;
  max-width: var(--wrap);
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 32px);
}

.lp-section {
  position: relative;
  padding-block: clamp(72px, 8vw, 112px);
}

/* ==================== Shared type ==================== */

.lp-h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.85rem, 3.1vw, 2.75rem);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.015em;
  color: var(--ink);
}

.lp[dir='rtl'] .lp-h2 {
  line-height: 1.42;
  letter-spacing: 0;
  font-weight: 700;
}

.lp-h2--light {
  color: #f8f3e9;
}

.lp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--forest);
}

.lp[dir='ltr'] .lp-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.71rem;
}

.lp-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 4px rgba(183, 137, 83, 0.16);
}

.lp-eyebrow--light {
  color: var(--gold-soft);
}

.lp-eyebrow--light .lp-eyebrow__dot {
  background: var(--gold);
  box-shadow: 0 0 0 4px rgba(183, 137, 83, 0.22);
}

.lp-sechead {
  max-width: 680px;
  margin: 0 auto clamp(2.4rem, 4vw, 3.4rem);
  text-align: center;
}

.lp-sechead__desc {
  margin: 1rem 0 0;
  font-size: 1rem;
  color: var(--muted);
}

.lp-splithead {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: end;
  gap: clamp(1.5rem, 4vw, 4rem);
  margin-bottom: clamp(2.2rem, 4vw, 3.2rem);
}

.lp-splithead__aside {
  padding-bottom: 0.35rem;
}

.lp-splithead__aside .lp-sechead__desc {
  margin-top: 0;
  max-width: 34rem;
}

.lp-link-arrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 1.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--forest);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: gap 0.25s var(--ease), color 0.25s ease, border-color 0.25s ease;
}

.lp-link-arrow:hover {
  gap: 0.8rem;
  color: var(--gold);
  border-color: var(--gold);
}

.lp-note {
  margin: 0;
  font-size: 0.92rem;
  color: var(--muted);
}

.lp-note--center {
  text-align: center;
}

/* ==================== Buttons ==================== */

.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.92rem 1.65rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.3s var(--ease), background 0.3s ease, color 0.3s ease,
    border-color 0.3s ease, box-shadow 0.3s ease;
}

.lp-btn:hover {
  transform: translateY(-2px);
}

.lp-btn--sm {
  padding: 0.66rem 1.25rem;
  font-size: 0.85rem;
}

.lp-btn--primary {
  background: var(--forest);
  color: #fdfbf6;
  box-shadow: 0 16px 32px -20px rgba(8, 42, 36, 0.85);
}

.lp-btn--primary:hover {
  background: var(--forest-2);
  box-shadow: 0 22px 40px -20px rgba(8, 42, 36, 0.75);
}

.lp-btn--ghost {
  background: transparent;
  border-color: var(--line-strong);
  color: var(--ink);
}

.lp-btn--ghost:hover {
  background: var(--surface);
  border-color: var(--forest);
  color: var(--forest);
}

.lp-btn--light {
  background: #f6efe3;
  color: var(--forest);
}

.lp-btn--light:hover {
  background: #fffdf8;
}

/* ==================== Header ==================== */

.lp-head {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 80;
  transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
  border-bottom: 1px solid transparent;
}

.lp-head.is-stuck,
.lp-head.is-open {
  background: rgba(247, 244, 238, 0.86);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  border-bottom-color: var(--line);
}

.lp-head__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 1380px;
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 32px);
  height: 86px;
}

.lp-brand {
  justify-self: start;
}

.lp-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: inherit;
  flex: none;
}

.lp-brand__mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--line);
  overflow: hidden;
}

.lp-brand__mark img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.lp-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.lp-brand__text strong {
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 700;
  color: var(--ink);
}

.lp-brand__text small {
  font-size: 0.68rem;
  color: var(--muted);
}

.lp-nav {
  display: flex;
  align-items: center;
  gap: clamp(1.1rem, 2.2vw, 2rem);
  justify-self: center;
}

.lp-nav__link {
  position: relative;
  padding-block: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.25s ease;
}

.lp-nav__link::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1.5px;
  border-radius: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s var(--ease);
}

.lp-nav__link:hover,
.lp-nav__link.is-current {
  color: var(--forest);
}

.lp-nav__link:hover::after,
.lp-nav__link.is-current::after {
  transform: scaleX(1);
}

.lp-head__tools {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex: none;
  justify-self: end;
}

.lp-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 34px;
  padding-inline: 0.7rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: transparent;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.lp-lang:hover {
  background: var(--surface);
  border-color: var(--forest);
  color: var(--forest);
}

.lp-tool {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.55rem;
  font-size: 0.83rem;
  color: var(--ink-soft);
  text-decoration: none;
  border-radius: 999px;
  white-space: nowrap;
  transition: color 0.25s ease, background 0.25s ease;
}

.lp-tool:hover {
  color: var(--forest);
  background: rgba(255, 255, 255, 0.7);
}

.lp-head__book {
  margin-inline-start: 0.35rem;
}

.lp-burger {
  display: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}

.lp-burger:hover {
  background: var(--surface);
  color: var(--forest);
}

.lp-mobile {
  display: none;
}

/* ==================== Hero ==================== */

.lp-hero {
  position: relative;
  padding-block: 140px 76px;
  overflow: hidden;
  background:
    radial-gradient(1100px 620px at 82% 4%, rgba(183, 137, 83, 0.13), transparent 62%),
    radial-gradient(900px 620px at 6% 24%, rgba(18, 84, 74, 0.08), transparent 66%),
    var(--paper);
}

.lp-hero__dots {
  position: absolute;
  inset-block: 86px 0;
  inset-inline-end: 0;
  width: min(46vw, 620px);
  background-image: radial-gradient(rgba(24, 35, 31, 0.16) 1px, transparent 1px);
  background-size: 24px 24px;
  -webkit-mask-image: radial-gradient(circle at 78% 38%, #000 0%, transparent 68%);
  mask-image: radial-gradient(circle at 78% 38%, #000 0%, transparent 68%);
  opacity: 0.55;
  pointer-events: none;
}

.lp-hero__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.03fr) minmax(0, 0.97fr);
  align-items: center;
  gap: clamp(2.4rem, 5vw, 5rem);
  width: 100%;
  max-width: var(--wrap);
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 32px);
  min-height: min(78vh, 760px);
}

.lp-hero__copy {
  max-width: 40rem;
  animation: lp-rise 0.9s var(--ease) both;
}

.lp-hero__eyebrow {
  margin-bottom: 1.35rem;
  color: var(--forest);
  font-size: 0.82rem;
  line-height: 1.9;
}

.lp-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.9rem, 6vw, 4.9rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: var(--ink);
}

.lp[dir='rtl'] .lp-hero__title {
  line-height: 1.28;
  letter-spacing: 0;
  font-weight: 700;
  font-size: clamp(2.6rem, 5.4vw, 4.3rem);
}

.lp-hero__subtitle {
  margin: 1.15rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--forest);
  max-width: 32rem;
}

.lp[dir='rtl'] .lp-hero__subtitle {
  font-weight: 600;
  line-height: 1.75;
}

.lp-hero__desc {
  margin: 1.15rem 0 0;
  max-width: 33rem;
  font-size: 1rem;
  line-height: 1.9;
  color: var(--muted);
}

.lp-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.lp-stats {
  display: flex;
  align-items: center;
  gap: clamp(1.5rem, 3vw, 2.75rem);
  margin: 2.6rem 0 0;
  padding-top: 1.75rem;
  border-top: 1px solid var(--line);
}

.lp-stat dt {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  font-weight: 600;
  line-height: 1.1;
  color: var(--forest);
  font-variant-numeric: tabular-nums;
}

.lp-stat dd {
  margin: 0.3rem 0 0;
  font-size: 0.82rem;
  color: var(--muted);
}

.lp-stats__rule {
  width: 1px;
  height: 46px;
  background: var(--line-strong);
}

/* Portrait */

.lp-hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lp-rise 1.1s var(--ease) 0.08s both;
}

.lp-hero__halo {
  position: absolute;
  width: min(41rem, 108%);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 64%);
  pointer-events: none;
}

.lp-hero__orbit {
  position: absolute;
  width: min(34rem, 92%);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(183, 137, 83, 0.28);
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.lp-hero__orbit::after {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  border: 1px dashed rgba(24, 35, 31, 0.12);
}

.lp-portrait {
  position: relative;
  width: min(27rem, 100%);
  margin: 0;
}

.lp-portrait__frame {
  position: relative;
  height: clamp(26rem, 42vw, 34rem);
  overflow: hidden;
  border-radius: 260px 260px 26px 26px;
  background:
    radial-gradient(120% 80% at 50% 100%, rgba(18, 84, 74, 0.14), transparent 62%),
    linear-gradient(178deg, #e9eee7 0%, #f4ece0 74%, #efe4d3 100%);
  border: 1px solid rgba(24, 35, 31, 0.1);
  box-shadow: 0 48px 90px -52px rgba(13, 63, 55, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.lp-portrait__frame::after {
  content: '';
  position: absolute;
  inset: 14px;
  border-radius: 250px 250px 18px 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

.lp-portrait__frame img {
  width: 100%;
  height: 94%;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 26px 34px rgba(24, 35, 31, 0.18));
}

.lp-portrait__badge {
  position: absolute;
  inset-block-end: 22px;
  inset-inline-start: -20px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1rem 0.7rem 0.7rem;
  border-radius: 18px;
  background: rgba(255, 253, 248, 0.9);
  border: 1px solid rgba(24, 35, 31, 0.08);
  box-shadow: 0 22px 48px -26px rgba(24, 35, 31, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-decoration: none;
  color: var(--ink);
  transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
}

.lp-portrait__badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 28px 54px -26px rgba(24, 35, 31, 0.5);
}

.lp-portrait__badge-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: var(--forest);
  color: #f3eddf;
  flex: none;
}

.lp-portrait__badge-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.lp-portrait__badge-text strong {
  font-size: 0.9rem;
}

.lp-portrait__badge-text small {
  font-size: 0.72rem;
  color: var(--muted);
}

.lp-portrait__badge > svg {
  color: var(--gold);
  margin-inline-start: 0.2rem;
}

/* ==================== Quick book ==================== */

.lp-quick {
  padding-top: clamp(48px, 6vw, 76px);
}

.lp-quick__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.lp-qcard {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 250px;
  padding: 1.6rem;
  border-radius: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  text-decoration: none;
  color: var(--ink);
  overflow: hidden;
  transition: transform 0.35s var(--ease), box-shadow 0.35s ease, border-color 0.35s ease;
}

.lp-qcard::after {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  inset-block-end: 0;
  width: 100%;
  height: 3px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: inline-start;
  transition: transform 0.4s var(--ease);
}

.lp-qcard:hover {
  transform: translateY(-6px);
  border-color: rgba(13, 63, 55, 0.22);
  box-shadow: var(--shadow-sm);
}

.lp-qcard:hover::after {
  transform: scaleX(1);
}

.lp-qcard__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.lp-qcard__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: var(--sage);
  color: var(--forest);
}

.lp-qcard__num {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 500;
  color: rgba(183, 137, 83, 0.85);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.lp-qcard h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.16rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--ink);
}

.lp-qcard p {
  margin: 0.55rem 0 0;
  font-size: 0.86rem;
  line-height: 1.85;
  color: var(--muted);
}

.lp-qcard__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 1.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--forest);
}

.lp-qcard--feature {
  background: var(--forest);
  border-color: transparent;
  color: #f5efe3;
}

.lp-qcard--feature .lp-qcard__icon {
  background: rgba(255, 255, 255, 0.12);
  color: var(--gold-soft);
}

.lp-qcard--feature .lp-qcard__num {
  color: rgba(236, 221, 197, 0.75);
}

.lp-qcard--feature h3 {
  color: #fbf7ee;
}

.lp-qcard--feature p {
  color: #c3d1c9;
}

.lp-qcard--feature .lp-qcard__cta {
  color: var(--gold-soft);
}

.lp-qcard--feature::after {
  background: var(--gold);
}

/* ==================== About ==================== */

.lp-about {
  background: var(--forest);
  color: #efe9dd;
  overflow: hidden;
}

.lp-about::before {
  content: '';
  position: absolute;
  inset-block-start: -30%;
  inset-inline-end: -18%;
  width: min(62rem, 90vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(183, 137, 83, 0.22), transparent 62%);
  pointer-events: none;
}

.lp-about::after {
  content: '';
  position: absolute;
  inset-block-end: -40%;
  inset-inline-start: -20%;
  width: min(46rem, 80vw);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 64%);
  pointer-events: none;
}

.lp-about__grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(2.6rem, 5vw, 5rem);
}

.lp-about__media {
  position: relative;
  z-index: 0;
}

.lp-about__frame {
  position: relative;
  z-index: 1;
  margin: 0;
  aspect-ratio: 4 / 4.5;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 50px 90px -50px rgba(0, 0, 0, 0.65);
}

.lp-about__frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 24%;
}

.lp-about__media::before {
  content: '';
  position: absolute;
  z-index: 0;
  inset-block-start: 20px;
  inset-block-end: -20px;
  inset-inline-start: 20px;
  inset-inline-end: -20px;
  border: 1px solid rgba(183, 137, 83, 0.6);
  border-radius: 32px;
  pointer-events: none;
}

.lp-about__plaque {
  position: absolute;
  z-index: 2;
  inset-block-end: -24px;
  inset-inline-start: -18px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.8rem 1.05rem;
  border-radius: 18px;
  background: #f7f1e6;
  box-shadow: 0 26px 50px -28px rgba(0, 0, 0, 0.6);
}

.lp-about__plaque img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.lp-about__plaque span {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.lp-about__plaque strong {
  font-family: var(--font-display);
  font-size: 0.92rem;
  color: var(--forest);
}

.lp-about__plaque small {
  font-size: 0.68rem;
  color: #6b7a73;
}

.lp-about__copy .lp-h2 {
  margin-bottom: 1.35rem;
}

.lp-about__p {
  margin: 0 0 1rem;
  font-size: 0.96rem;
  line-height: 1.95;
  color: #c2d0c8;
}

.lp-checks {
  display: grid;
  gap: 0.8rem;
  margin: 1.6rem 0 2rem;
  padding: 1.35rem 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  list-style: none;
}

.lp-checks li {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.92rem;
  color: #e6eee8;
}

.lp-checks__mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 24px;
  height: 24px;
  margin-top: 3px;
  border-radius: 50%;
  border: 1px solid rgba(183, 137, 83, 0.7);
  background: rgba(183, 137, 83, 0.14);
  color: var(--gold-soft);
}

/* ==================== Services ==================== */

.lp-services {
  background: var(--paper);
}

.lp-services__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.lp-service {
  position: relative;
  padding: 2rem;
  border-radius: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: transform 0.35s var(--ease), box-shadow 0.35s ease, border-color 0.35s ease;
}

.lp-service:hover {
  transform: translateY(-6px);
  border-color: rgba(13, 63, 55, 0.22);
  box-shadow: var(--shadow-sm);
}

.lp-service__num {
  position: absolute;
  inset-block-start: 1.4rem;
  inset-inline-end: 1.6rem;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1;
  color: rgba(24, 35, 31, 0.09);
  font-variant-numeric: tabular-nums;
}

.lp-service__icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 1.4rem;
  border-radius: 16px;
  background: var(--sage);
  color: var(--forest);
}

.lp-service__icon--1 {
  background: var(--blush);
  color: #9c5f45;
}

.lp-service__icon--2 {
  background: var(--gold-soft);
  color: #8a622f;
}

.lp-service h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.28rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--ink);
}

.lp-service p {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  line-height: 1.95;
  color: var(--muted);
}

/* ==================== Booking ==================== */

.lp-booking {
  background:
    radial-gradient(900px 500px at 12% 0%, rgba(183, 137, 83, 0.12), transparent 62%),
    linear-gradient(180deg, var(--paper-2), var(--paper));
  border-block: 1px solid var(--line);
}

.lp-widget {
  max-width: 1060px;
  margin-inline: auto;
  padding: clamp(22px, 3.2vw, 42px);
  border-radius: 28px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
}

.lp-widget__top {
  display: grid;
  gap: 0.9rem;
}

.lp-widget__label {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.lp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.lp-chip {
  padding: 0.58rem 1.1rem;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.87rem;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease,
    transform 0.25s ease;
}

.lp-chip:hover {
  border-color: var(--forest);
  color: var(--forest);
  transform: translateY(-1px);
}

.lp-chip.is-active {
  background: var(--forest);
  border-color: var(--forest);
  color: #fdfbf6;
}

.lp-widget__body {
  margin-top: 1.8rem;
  padding-top: 1.8rem;
  border-top: 1px dashed var(--line-strong);
}

.lp-stage + .lp-stage {
  margin-top: 1.8rem;
}

.lp-stage + .lp-widget__foot {
  margin-top: 1.9rem;
}

.lp-step {
  margin: 0 0 0.9rem;
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 600;
  color: var(--ink);
}

.lp[dir='rtl'] .lp-step {
  font-weight: 700;
}

.lp-days {
  display: flex;
  gap: 0.6rem;
  padding-bottom: 0.45rem;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.lp-day {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;
  min-width: 82px;
  padding: 0.72rem 0.9rem;
  border: 1px solid var(--line-strong);
  border-radius: 16px;
  background: #fff;
  font-family: var(--font-body);
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease,
    transform 0.25s ease;
}

.lp-day:hover {
  border-color: var(--forest);
  transform: translateY(-2px);
}

.lp-day.is-active {
  background: var(--forest);
  border-color: var(--forest);
  color: #fdfbf6;
}

.lp-day__week {
  font-size: 0.7rem;
  color: var(--muted);
}

.lp-day.is-active .lp-day__week {
  color: rgba(253, 251, 246, 0.72);
}

.lp-day__date {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.lp-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 0.55rem;
}

.lp-slot {
  padding: 0.68rem 0.5rem;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: #fbfaf6;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--ink-soft);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.lp-slot:hover {
  border-color: var(--forest);
  color: var(--forest);
}

.lp-slot.is-active {
  background: var(--forest);
  border-color: var(--forest);
  color: #fdfbf6;
}

.lp-widget__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.7rem;
  border-top: 1px dashed var(--line-strong);
}

.lp-widget__summary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.05rem;
  border-radius: 999px;
  background: var(--sage);
  font-size: 0.86rem;
  color: var(--forest);
}

/* ==================== Gallery ==================== */

.lp-gallery-section {
  background: var(--paper);
}

.lp-gallery {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.lp-shot {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 270px;
  padding: 1.5rem;
  border-radius: 22px;
  overflow: hidden;
  isolation: isolate;
  color: #f4efe4;
  transition: transform 0.35s var(--ease), box-shadow 0.35s ease;
}

.lp-shot::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset-block-start: -38%;
  inset-inline-end: -22%;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.lp-shot::after {
  content: '';
  position: absolute;
  z-index: -1;
  inset-block-end: -34%;
  inset-inline-start: -18%;
  width: 64%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
}

.lp-shot:hover {
  transform: translateY(-5px);
  box-shadow: 0 34px 64px -40px rgba(13, 63, 55, 0.55);
}

.lp-shot__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.lp-shot__caption h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.12rem;
  font-weight: 600;
  line-height: 1.5;
}

.lp-shot__caption p {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  line-height: 1.8;
  opacity: 0.82;
}

.lp-shot--0 {
  background: linear-gradient(155deg, #0d3f37 0%, #1b6a5b 100%);
}

.lp-shot--1 {
  background: linear-gradient(155deg, #b78953 0%, #dcc099 100%);
  color: #2c2118;
}

.lp-shot--1 .lp-shot__icon {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.3);
}

.lp-shot--2 {
  background: linear-gradient(155deg, #2c3a35 0%, #556a61 100%);
}

.lp-shot--3 {
  background: linear-gradient(155deg, #f1e3d6 0%, #e5cdbd 100%);
  color: var(--forest);
}

.lp-shot--3 .lp-shot__icon {
  background: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 255, 255, 0.5);
}

.lp-shot--3::before {
  border-color: rgba(13, 63, 55, 0.16);
}

.lp-shot--3::after {
  background: rgba(13, 63, 55, 0.05);
}

/* ==================== Testimonials ==================== */

.lp-testimonials {
  background:
    radial-gradient(800px 480px at 88% 100%, rgba(183, 137, 83, 0.14), transparent 60%),
    var(--blush);
}

.lp-quotes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.lp-quote {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 1.8rem;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid rgba(24, 35, 31, 0.06);
  box-shadow: 0 24px 50px -44px rgba(24, 35, 31, 0.4);
}

.lp-quote__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.lp-stars {
  font-size: 0.85rem;
  letter-spacing: 0.22em;
  color: var(--gold);
  line-height: 1;
}

.lp-quote__mark {
  color: rgba(183, 137, 83, 0.45);
}

.lp-quote > p {
  margin: 1.1rem 0 1.6rem;
  font-size: 0.92rem;
  line-height: 2;
  color: var(--ink-soft);
}

.lp-quote footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1.1rem;
  border-top: 1px solid var(--line);
}

.lp-quote__avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--sage);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--forest);
  flex: none;
}

.lp-quote__who {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.lp-quote__who strong {
  font-size: 0.9rem;
  color: var(--ink);
}

.lp-quote__who small {
  font-size: 0.72rem;
  color: var(--muted);
}

.lp-quote--feature {
  background: var(--forest);
  border-color: transparent;
  box-shadow: 0 34px 60px -44px rgba(8, 42, 36, 0.9);
}

.lp-quote--feature .lp-quote__mark {
  color: rgba(236, 221, 197, 0.5);
}

.lp-quote--feature > p {
  color: #dde7e0;
}

.lp-quote--feature footer {
  border-top-color: rgba(255, 255, 255, 0.14);
}

.lp-quote--feature .lp-quote__avatar {
  background: rgba(255, 255, 255, 0.12);
  color: var(--gold-soft);
}

.lp-quote--feature .lp-quote__who strong {
  color: #f7f2e8;
}

.lp-quote--feature .lp-quote__who small {
  color: rgba(247, 242, 232, 0.6);
}

/* ==================== Contact ==================== */

.lp-contact {
  background: var(--paper);
}

.lp-contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
  align-items: center;
  gap: clamp(2.6rem, 5vw, 4.5rem);
}

.lp-contact__copy .lp-sechead__desc {
  max-width: 30rem;
}

.lp-details {
  display: grid;
  gap: 1.15rem;
  margin: 2rem 0 2.2rem;
}

.lp-detail {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.lp-detail__icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--sage);
  color: var(--forest);
}

.lp-detail dt {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--gold);
  text-transform: uppercase;
}

.lp[dir='rtl'] .lp-detail dt {
  letter-spacing: 0;
  font-size: 0.78rem;
}

.lp-detail dd {
  margin: 0.3rem 0 0;
  font-size: 0.93rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

.lp-detail__link {
  display: inline-block;
  margin-inline-start: 0.45rem;
  color: var(--forest);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
}

.lp-detail__link:hover {
  color: var(--gold);
}

.lp-contact__map {
  position: relative;
  height: clamp(20rem, 34vw, 28rem);
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  box-shadow: var(--shadow-md);
}

.lp-contact__map-canvas {
  width: 100%;
  height: 100%;
}

.lp-contact__map-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  background:
    radial-gradient(60% 60% at 50% 40%, rgba(183, 137, 83, 0.14), transparent 70%),
    var(--paper-2);
  color: var(--forest);
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.3s ease;
}

.lp-contact__map-fallback:hover {
  background:
    radial-gradient(60% 60% at 50% 40%, rgba(183, 137, 83, 0.22), transparent 70%),
    var(--paper-3);
}

.lp-contact__map-fallback-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--line);
  color: var(--forest);
}

.lp-contact__map-pin {
  position: absolute;
  inset-block-end: 16px;
  inset-inline-start: 16px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.94);
  border: 1px solid rgba(24, 35, 31, 0.08);
  box-shadow: 0 12px 28px -16px rgba(24, 35, 31, 0.5);
  color: var(--forest);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ==================== Blog ==================== */

.lp-blog {
  padding-top: 0;
}

.lp-posts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

/* With one published article, a three-column grid would leave two blank
   tracks — promote it to a full-width editorial feature instead. */
.lp-posts.lp-posts--1 {
  grid-template-columns: minmax(0, 1fr);
}

.lp-posts.lp-posts--1 .lp-post {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
}

.lp-posts.lp-posts--1 .lp-post__media {
  height: 100%;
  min-height: 360px;
}

.lp-posts.lp-posts--1 .lp-post__body {
  justify-content: center;
  padding: clamp(1.7rem, 3vw, 2.6rem);
}

.lp-posts.lp-posts--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lp-post {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  text-decoration: none;
  color: inherit;
  transition: transform 0.35s var(--ease), box-shadow 0.35s ease, border-color 0.35s ease;
}

.lp-post:hover {
  transform: translateY(-6px);
  border-color: rgba(13, 63, 55, 0.22);
  box-shadow: var(--shadow-sm);
}

.lp-post__media {
  display: grid;
  place-items: center;
  height: 190px;
  overflow: hidden;
  background: linear-gradient(150deg, var(--sage), var(--gold-soft));
  color: var(--forest);
}

.lp-post__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.lp-post:hover .lp-post__media img {
  transform: scale(1.05);
}

.lp-post__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.4rem;
}

.lp-post__meta {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--gold);
}

.lp-post h3 {
  margin: 0.5rem 0 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.55;
  color: var(--ink);
}

.lp-post p {
  margin: 0.55rem 0 0;
  font-size: 0.86rem;
  line-height: 1.9;
  color: var(--muted);
}

.lp-post__more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 1.3rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--forest);
}

/* ==================== Footer ==================== */

.lp-footer {
  position: relative;
  overflow: hidden;
  background: var(--forest-deep);
  color: #c5d2cb;
}

.lp-footer__mark {
  position: absolute;
  inset-block-end: -3rem;
  inset-inline-end: -2rem;
  width: min(26rem, 60vw);
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
}

.lp-footer__inner {
  position: relative;
  z-index: 1;
  padding-block: clamp(56px, 7vw, 84px) 0;
}

.lp-footer__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr);
  gap: clamp(1.8rem, 4vw, 3rem);
}

.lp-brand--light .lp-brand__mark {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.lp-brand--light .lp-brand__mark img {
  opacity: 0.92;
}

.lp-brand--light .lp-brand__text strong {
  color: #f6f1e6;
}

.lp-brand--light .lp-brand__text small {
  color: #8ea198;
}

.lp-footer__brand p {
  margin: 1.2rem 0 0;
  max-width: 22rem;
  font-size: 0.87rem;
  line-height: 1.9;
  color: #a5b6ad;
}

.lp-footer__note {
  font-size: 0.76rem !important;
  color: #7f928a !important;
}

.lp-footer__col h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: #f3ede1;
}

.lp-footer__col ul {
  display: grid;
  gap: 0.55rem;
  margin: 1.1rem 0 0;
  padding: 0;
  list-style: none;
}

.lp-footer__col a {
  font-size: 0.85rem;
  color: #a9bab1;
  text-decoration: none;
  transition: color 0.25s ease;
}

.lp-footer__col a:hover {
  color: var(--gold-soft);
}

.lp-footer__lead {
  margin: 1.1rem 0 0;
  font-size: 0.82rem;
  line-height: 1.9;
  color: #93a69d;
}

.lp-footer__contact {
  display: grid;
  gap: 0.7rem;
  margin: 1.1rem 0 1.4rem;
  padding: 0;
  list-style: none;
}

.lp-footer__contact li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.75;
  color: #a9bab1;
}

.lp-footer__contact svg {
  flex: none;
  margin-top: 4px;
  color: var(--gold);
}

.lp-footer__contact a {
  color: inherit;
  text-decoration: none;
}

.lp-footer__contact a:hover {
  color: var(--gold-soft);
}

.lp-footer__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: clamp(2.5rem, 5vw, 4rem);
  padding-block: 1.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.lp-footer__bar p {
  margin: 0;
  font-size: 0.76rem;
  color: #7f928a;
}

.lp-footer__bar-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.lp-footer__bar-links a {
  font-size: 0.76rem;
  color: #8fa198;
  text-decoration: none;
  transition: color 0.25s ease;
}

.lp-footer__bar-links a:hover {
  color: var(--gold-soft);
}

/* ==================== Motion ==================== */

@keyframes lp-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ==================== Responsive ==================== */

@media (max-width: 1500px) {
  .lp-tool--soft {
    display: none;
  }

  .lp-nav {
    gap: 1.4rem;
  }
}

@media (max-width: 1180px) {
  .lp-nav {
    gap: 1.25rem;
  }
}

@media (max-width: 1080px) {
  .lp-head__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lp-nav {
    display: none;
  }

  .lp-tool span {
    display: none;
  }

  .lp-tool {
    width: 38px;
    height: 38px;
    justify-content: center;
    padding: 0;
    border: 1px solid transparent;
  }

  .lp-tool:hover {
    border-color: var(--line-strong);
  }

  .lp-burger {
    display: grid;
  }

  .lp-mobile {
    display: block;
    position: fixed;
    inset-block-start: 86px;
    inset-inline: 0;
    max-height: calc(100dvh - 86px);
    min-height: calc(100dvh - 86px);
    overflow-y: auto;
    padding: 1rem clamp(20px, 4vw, 32px) 2rem;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
    box-shadow: 0 30px 60px -40px rgba(13, 63, 55, 0.5);
    animation: lp-menu-in 0.28s var(--ease);
  }

  .lp-mobile__list {
    display: grid;
  }

  .lp-mobile__link {
    padding-block: 0.85rem;
    border-bottom: 1px solid var(--line);
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
  }

  .lp-mobile__link:hover {
    color: var(--forest);
  }

  .lp-mobile__cta {
    width: 100%;
    margin-top: 1.25rem;
  }

  .lp-hero__inner {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-top: 24px;
    min-height: 0;
    text-align: center;
  }

  .lp-hero__copy {
    max-width: 40rem;
    margin-inline: auto;
  }

  .lp-hero__eyebrow,
  .lp-hero__actions,
  .lp-stats {
    justify-content: center;
  }

  .lp-hero__desc,
  .lp-hero__subtitle {
    margin-inline: auto;
  }

  .lp-hero__visual {
    margin-top: 0.5rem;
  }

  .lp-portrait {
    width: min(24rem, 82%);
  }

  .lp-portrait__frame {
    height: clamp(24rem, 64vw, 32rem);
  }

  .lp-portrait__badge {
    inset-inline-start: 0;
  }

  .lp-quick__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lp-about__grid,
  .lp-contact__grid {
    grid-template-columns: 1fr;
  }

  .lp-about__media {
    max-width: 34rem;
    margin-inline: auto;
    width: 100%;
  }

  .lp-about__copy {
    max-width: 42rem;
  }

  .lp-services__grid,
  .lp-quotes,
  .lp-posts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lp-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lp-shot {
    min-height: 240px;
  }

  .lp-contact__map {
    height: 24rem;
  }

  .lp-footer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .lp-head__inner {
    height: 74px;
    gap: 0.75rem;
  }

  .lp-brand__mark {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .lp-brand__mark img {
    width: 32px;
    height: 32px;
  }

  .lp-brand__text strong {
    font-size: 0.98rem;
  }

  .lp-brand__text small {
    display: none;
  }

  .lp-head__book {
    display: none;
  }

  .lp-head__tools .lp-tool {
    display: none;
  }

  .lp-head__tools {
    gap: 0.4rem;
  }

  .lp-lang {
    padding-inline: 0.6rem;
  }

  .lp-brand__text strong {
    font-size: 0.92rem;
  }

  .lp-mobile {
    inset-block-start: 74px;
    max-height: calc(100dvh - 74px);
    min-height: calc(100dvh - 74px);
  }

  .lp-hero {
    padding-block: 118px 60px;
  }

  .lp-hero__dots {
    inset-block-start: 74px;
    width: 80vw;
    opacity: 0.4;
  }

  .lp-hero__title {
    font-size: clamp(2.4rem, 9vw, 3.4rem);
  }

  .lp-hero__eyebrow {
    display: block;
    max-width: 24rem;
    margin-inline: auto;
  }

  .lp-hero__eyebrow .lp-eyebrow__dot {
    display: none;
  }

  .lp-hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .lp-hero__actions .lp-btn {
    width: 100%;
  }

  .lp-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.1rem;
    justify-items: center;
  }

  .lp-stat {
    text-align: center;
  }

  .lp-stat dd {
    font-size: 0.78rem;
  }

  .lp-stats__rule {
    display: none;
  }

  .lp-portrait {
    width: min(21rem, 88%);
  }

  .lp-portrait__frame {
    height: clamp(22rem, 74vw, 27rem);
    border-radius: 200px 200px 22px 22px;
  }

  .lp-portrait__frame::after {
    border-radius: 190px 190px 16px 16px;
  }

  .lp-splithead {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .lp-splithead__aside {
    padding-bottom: 0;
  }

  .lp-quick__grid,
  .lp-services__grid,
  .lp-quotes,
  .lp-posts {
    grid-template-columns: 1fr;
  }

  .lp-posts.lp-posts--1 .lp-post {
    grid-template-columns: 1fr;
  }

  .lp-posts.lp-posts--1 .lp-post__media {
    height: 210px;
    min-height: 0;
  }

  .lp-qcard {
    min-height: 0;
  }

  .lp-gallery {
    grid-template-columns: 1fr;
  }

  .lp-shot {
    min-height: 210px;
  }

  .lp-about__plaque {
    inset-inline-start: 0;
  }

  .lp-widget__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .lp-widget__foot .lp-btn {
    width: 100%;
  }

  .lp-widget__summary {
    justify-content: center;
  }

  .lp-contact__map {
    height: 20rem;
    border-radius: 22px;
  }

  .lp-footer__grid {
    grid-template-columns: 1fr;
  }

  .lp-footer__bar {
    justify-content: flex-start;
  }
}

@keyframes lp-menu-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lp *,
  .lp *::before,
  .lp *::after {
    animation: none !important;
    transition: none !important;
  }

  .lp {
    scroll-behavior: auto;
  }
}
</style>
