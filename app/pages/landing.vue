<template>
  <div class="lh" :dir="dir">
    <a class="lh-skip" href="#lh-main">{{ t('landingPage.nav.home') }}</a>

    <!-- ==================== HEADER ==================== -->
    <header class="lh-header" :class="{ 'is-stuck': headerStuck, 'is-open': menuOpen }">
      <div class="lh-header__inner">
        <NuxtLink to="/landing" class="lh-brand">
          <img src="../assets/images/hastihoseinilogo.png" alt="" width="40" height="40" />
          <span class="lh-brand__text">
            <strong>{{ t('landing.clinicName') }}</strong>
            <small>{{ t('aboutPage.team.members.1.role') }}</small>
          </span>
        </NuxtLink>

        <nav class="lh-nav" :aria-label="t('landingPage.nav.home')">
          <NuxtLink to="/landing" class="lh-nav__link is-current">{{ t('landingPage.nav.home') }}</NuxtLink>
          <a href="#lh-services" class="lh-nav__link">{{ t('landingPage.nav.services') }}</a>
          <NuxtLink to="/blog" class="lh-nav__link">{{ t('landingPage.nav.blog') }}</NuxtLink>
          <a href="#lh-about" class="lh-nav__link">{{ t('landingPage.nav.about') }}</a>
          <a href="#lh-contact" class="lh-nav__link">{{ t('landingPage.nav.contact') }}</a>
        </nav>

        <div class="lh-header__tools">
          <button
            type="button"
            class="lh-iconbtn"
            :aria-label="t('landingPage.nav.langToggle')"
            @click="toggleLang"
          >
            <Icon name="lucide:globe" size="18" />
          </button>

          <NuxtLink to="/auth/login" class="lh-login">
            <Icon name="lucide:user" size="16" />
            <span>{{ t('landingPage.nav.login') }}</span>
          </NuxtLink>

          <NuxtLink to="/booking" class="lh-btn lh-btn--solid lh-btn--sm">{{ t('landingPage.nav.book') }}</NuxtLink>

          <button
            type="button"
            class="lh-iconbtn lh-burger"
            :aria-label="menuOpen ? t('landingPage.nav.closeMenu') : t('landingPage.nav.openMenu')"
            :aria-expanded="menuOpen"
            @click="menuOpen = !menuOpen"
          >
            <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" size="20" />
          </button>
        </div>
      </div>

      <nav v-if="menuOpen" class="lh-mobilemenu">
        <a href="#lh-about" @click="menuOpen = false">{{ t('landingPage.nav.about') }}</a>
        <a href="#lh-services" @click="menuOpen = false">{{ t('landingPage.nav.services') }}</a>
        <a href="#lh-booking" @click="menuOpen = false">{{ t('landingPage.nav.book') }}</a>
        <NuxtLink to="/blog" @click="menuOpen = false">{{ t('landingPage.nav.blog') }}</NuxtLink>
        <a href="#lh-contact" @click="menuOpen = false">{{ t('landingPage.nav.contact') }}</a>
        <NuxtLink to="/auth/login" @click="menuOpen = false">{{ t('landingPage.nav.login') }}</NuxtLink>
      </nav>
    </header>

    <main id="lh-main">
      <!-- ==================== HERO ==================== -->
      <section class="lh-hero">
        <div class="lh-hero__bg" aria-hidden="true" />
        <div class="lh-hero__inner">
          <div class="lh-hero__copy">
            <p class="lh-pill">{{ t('landingPage.hero.eyebrow') }}</p>
            <h1 class="lh-hero__title">{{ t('landingPage.hero.title') }}</h1>
            <h2 class="lh-hero__subtitle">{{ t('landingPage.hero.subtitle') }}</h2>
            <p class="lh-hero__desc">{{ t('landingPage.hero.desc') }}</p>

            <dl class="lh-hero__stats">
              <div>
                <dt>{{ t('landingPage.hero.stats.patientsValue') }}</dt>
                <dd>{{ t('landingPage.hero.stats.patientsLabel') }}</dd>
              </div>
              <div>
                <dt>{{ t('landingPage.hero.stats.yearsValue') }}</dt>
                <dd>{{ t('landingPage.hero.stats.yearsLabel') }}</dd>
              </div>
            </dl>

            <div class="lh-hero__actions">
              <a href="#lh-testimonials" class="lh-btn lh-btn--ghost">{{ t('landingPage.hero.ctaReviews') }}</a>
              <NuxtLink to="/booking" class="lh-btn lh-btn--solid">{{ t('landingPage.hero.ctaBook') }}</NuxtLink>
            </div>
          </div>

          <figure class="lh-hero__portrait">
            <img src="../assets/images/dr-hosseini-cutout.png" :alt="t('landingPage.hero.portraitAlt')" />
          </figure>
        </div>
      </section>

      <!-- ==================== QUICK BOOK ==================== -->
      <section class="lh-section lh-section--lead">
        <div class="lh-shell">
          <header class="lh-sechead">
            <h2 class="lh-sechead__title">{{ t('landingPage.quickBook.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.quickBook.desc') }}</p>
          </header>

          <div class="lh-quickbook">
            <NuxtLink
              v-for="(item, i) in bookingServices"
              :key="item.title"
              to="/booking"
              class="lh-quickcard"
              :class="`lh-quickcard--${i % 3 === 0 ? 'sage' : i % 3 === 1 ? 'cream' : 'plain'}`"
            >
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
              <span class="lh-quickcard__cta">
                {{ t('landingPage.nav.book') }}
                <Icon name="lucide:arrow-left" size="15" class="lh-flip-rtl" />
              </span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== ABOUT ==================== -->
      <section id="lh-about" class="lh-section lh-section--sage">
        <div class="lh-shell lh-about">
          <figure class="lh-about__figure">
            <img src="../assets/images/dr_hasti_hosseini.jpg" :alt="t('landingPage.about.figureAlt')" loading="lazy" />
          </figure>

          <div class="lh-about__copy">
            <p class="lh-eyebrow">{{ t('landingPage.about.eyebrow') }}</p>
            <h2 class="lh-h2">{{ t('landingPage.about.title') }}</h2>
            <p class="lh-p">{{ t('landingPage.about.p1') }}</p>
            <p class="lh-p">{{ t('landingPage.about.p2') }}</p>

            <ul class="lh-checklist">
              <li v-for="point in aboutPoints" :key="point">
                <span class="lh-checklist__mark" aria-hidden="true">
                  <Icon name="lucide:check" size="13" />
                </span>
                {{ point }}
              </li>
            </ul>

            <NuxtLink to="/about" class="lh-btn lh-btn--gold">{{ t('landingPage.about.cta') }}</NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== SERVICES ==================== -->
      <section id="lh-services" class="lh-section">
        <div class="lh-shell">
          <header class="lh-sechead">
            <h2 class="lh-sechead__title">{{ t('landingPage.services.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.services.desc') }}</p>
          </header>

          <div class="lh-cards">
            <article
              v-for="(item, i) in services"
              :key="item.title"
              class="lh-card"
              :class="i === 1 ? 'lh-card--cream' : ''"
            >
              <span class="lh-card__icon" aria-hidden="true">
                <Icon :name="iconAt(serviceIcons, i)" size="24" />
              </span>
              <h3 class="lh-card__title">{{ item.title }}</h3>
              <p class="lh-card__desc">{{ item.desc }}</p>
            </article>
          </div>

          <div class="lh-section__foot">
            <NuxtLink to="/booking" class="lh-btn lh-btn--ghost">
              {{ t('landingPage.services.viewAll') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- ==================== BOOKING ==================== -->
      <section id="lh-booking" class="lh-section lh-section--sage">
        <div class="lh-shell">
          <header class="lh-sechead">
            <h2 class="lh-sechead__title">{{ t('landingPage.booking.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.booking.sub') }}</p>
          </header>

          <div class="lh-widget">
            <p class="lh-widget__label">{{ t('landingPage.booking.selectedService') }}</p>

            <div class="lh-widget__services">
              <button
                v-for="option in flatServices"
                :key="option.visitTypeId + option.doctorId"
                type="button"
                class="lh-chip"
                :class="{ 'is-active': isServiceActive(option) }"
                :aria-pressed="isServiceActive(option)"
                @click="selectService(option)"
              >
                {{ chipLabel(option) }}
              </button>
              <p v-if="flatServices.length === 0 && !servicesLoading" class="lh-widget__empty">
                {{ t('booking.fetchServicesError') }}
              </p>
            </div>

            <div v-if="activeDoctorId" class="lh-widget__body">
              <h3 class="lh-widget__step">{{ t('landingPage.booking.stepDay') }}</h3>

              <p v-if="availabilityLoading" class="lh-widget__empty">
                {{ t('landingPage.booking.checkingAvailability') }}
              </p>

              <div v-else-if="bookableDays.length" class="lh-days">
                <button
                  v-for="day in bookableDays"
                  :key="day.gregorian"
                  type="button"
                  class="lh-day"
                  :class="{ 'is-active': selectedDay === day.gregorian }"
                  :aria-pressed="selectedDay === day.gregorian"
                  @click="selectedDay = day.gregorian"
                >
                  <span class="lh-day__week">{{ day.weekday }}</span>
                  <span class="lh-day__date">{{ day.date }}</span>
                </button>
              </div>

              <p v-else class="lh-widget__empty">{{ t('landingPage.booking.noAvailableDays') }}</p>

              <template v-if="!availabilityLoading && bookableDays.length">
                <h3 class="lh-widget__step">{{ t('landingPage.booking.stepTime') }}</h3>
                <p v-if="slotsLoading" class="lh-widget__empty">{{ t('landingPage.booking.loading') }}</p>
                <p v-else-if="slots.length === 0" class="lh-widget__empty">{{ t('landingPage.booking.noSlots') }}</p>
                <div v-else class="lh-slots">
                  <button
                    v-for="slot in slots"
                    :key="slot.startTime"
                    type="button"
                    class="lh-slot"
                    :class="{ 'is-active': selectedSlot === slot.startTime }"
                    :aria-pressed="selectedSlot === slot.startTime"
                    @click="selectedSlot = slot.startTime"
                  >
                    {{ slot.startTime }}
                  </button>
                </div>

                <div class="lh-widget__foot">
                  <span class="lh-widget__summary">
                    <template v-if="selectedSlot">
                      {{ t('landingPage.booking.selected') }}: {{ selectedSlot }}
                    </template>
                    <template v-else>{{ t('landingPage.booking.summaryHint') }}</template>
                  </span>
                  <NuxtLink :to="bookingLink" class="lh-btn lh-btn--solid">
                    {{ t('landingPage.booking.continue') }}
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== GALLERY ==================== -->
      <section class="lh-section lh-section--tight">
        <div class="lh-shell">
          <header class="lh-sechead">
            <h2 class="lh-sechead__title">{{ t('landingPage.gallery.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.gallery.desc') }}</p>
          </header>

          <div class="lh-gallery">
            <article v-for="(item, i) in gallery" :key="item.title" class="lh-shot">
              <span class="lh-shot__media" :class="`lh-shot__media--${i % 4}`" aria-hidden="true">
                <Icon :name="iconAt(galleryIcons, i)" size="30" />
              </span>
              <div class="lh-shot__caption">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ==================== TESTIMONIALS ==================== -->
      <section id="lh-testimonials" class="lh-section lh-section--cream">
        <div class="lh-shell">
          <header class="lh-sechead">
            <h2 class="lh-sechead__title">{{ t('landingPage.testimonials.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.testimonials.sub') }}</p>
          </header>

          <div class="lh-quotes">
            <blockquote v-for="item in testimonials" :key="item.name" class="lh-quote">
              <Icon name="lucide:quote" size="26" class="lh-quote__mark" aria-hidden="true" />
              <p>{{ item.text }}</p>
              <footer>
                <span class="lh-quote__avatar" aria-hidden="true">{{ String(item.name ?? '').charAt(0) }}</span>
                <span>
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.date }}</small>
                </span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      <!-- ==================== CONTACT ==================== -->
      <section id="lh-contact" class="lh-section">
        <div class="lh-shell lh-contact">
          <div class="lh-contact__map">
            <div
              :id="NESHAN_MAP_ID"
              class="lh-contact__map-canvas"
              role="application"
              :aria-label="t('landingPage.contact.mapTitle')"
            />
            <a
              v-if="!neshanMapReady"
              class="lh-contact__map-fallback"
              :href="neshanDirectionsUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t('landingPage.contact.directions') }}
            </a>
          </div>

          <div class="lh-contact__copy">
            <h2 class="lh-h2">{{ t('landingPage.contact.title') }}</h2>
            <p class="lh-p">{{ t('landingPage.contact.desc') }}</p>

            <dl class="lh-details">
              <div>
                <dt>
                  <Icon name="lucide:map-pin" size="18" aria-hidden="true" />
                  {{ t('landingPage.contact.addressLabel') }}
                </dt>
                <dd>
                  {{ t('landingPage.contact.address') }}
                  <a
                    class="lh-details__link"
                    :href="googleDirectionsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ t('landingPage.contact.directions') }}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="lucide:phone" size="18" aria-hidden="true" />
                  {{ t('landingPage.contact.phoneLabel') }}
                </dt>
                <dd>
                  <a class="lh-details__link" href="tel:+989379412491" dir="ltr">
                    {{ t('landingPage.contact.phone') }}
                  </a>
                </dd>
              </div>
              <div>
                <dt>
                  <Icon name="lucide:clock" size="18" aria-hidden="true" />
                  {{ t('landingPage.contact.hoursLabel') }}
                </dt>
                <dd>{{ t('landingPage.contact.hours') }}</dd>
              </div>
            </dl>

            <a href="tel:+989379412491" class="lh-btn lh-btn--gold">{{ t('landingPage.contact.cta') }}</a>
          </div>
        </div>
      </section>

      <!-- ==================== BLOG ==================== -->
      <section class="lh-section lh-section--tight">
        <div class="lh-shell">
          <header class="lh-sechead lh-sechead--indigo">
            <h2 class="lh-sechead__title">{{ t('landingPage.blog.title') }}</h2>
            <p class="lh-sechead__desc">{{ t('landingPage.blog.desc') }}</p>
          </header>

          <p v-if="posts.length === 0" class="lh-widget__empty">{{ t('landingPage.blog.empty') }}</p>

          <div v-else class="lh-posts">
            <NuxtLink v-for="post in posts" :key="post.id" :to="`/blog/${post.slug}`" class="lh-post">
              <span class="lh-post__media" aria-hidden="true">
                <img v-if="post.coverImage" :src="post.coverImage" :alt="postTitle(post)" loading="lazy" />
                <Icon v-else name="lucide:newspaper" size="26" />
              </span>
              <div class="lh-post__body">
                <span class="lh-post__meta">{{ formatDate(post.publishedAt) }}</span>
                <h3>{{ postTitle(post) }}</h3>
                <p>{{ postExcerpt(post) }}</p>
                <span class="lh-post__more">
                  {{ t('landingPage.blog.readMore') }}
                  <Icon name="lucide:arrow-left" size="14" class="lh-flip-rtl" />
                </span>
              </div>
            </NuxtLink>
          </div>

          <div class="lh-section__foot">
            <NuxtLink to="/blog" class="lh-btn lh-btn--ghost">{{ t('landingPage.blog.viewAll') }}</NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- ==================== FOOTER ==================== -->
    <footer class="lh-footer">
      <div class="lh-shell">
        <div class="lh-footer__grid">
          <div class="lh-footer__brand">
            <NuxtLink to="/landing" class="lh-brand lh-brand--light">
              <img src="../assets/images/hastihoseinilogoBlack.png" alt="" width="40" height="40" />
              <span class="lh-brand__text">
                <strong>{{ t('landing.clinicName') }}</strong>
              </span>
            </NuxtLink>
            <p>{{ t('landingPage.footer.description') }}</p>
            <p class="lh-footer__note">{{ t('landingPage.footer.disclaimer') }}</p>
          </div>

          <div>
            <h3 class="lh-footer__title">{{ t('landingPage.footer.servicesTitle') }}</h3>
            <ul class="lh-footer__list">
              <li v-for="link in footerServices" :key="link">
                <NuxtLink to="/booking">{{ link }}</NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="lh-footer__title">{{ t('landingPage.footer.topicsTitle') }}</h3>
            <ul class="lh-footer__list">
              <li v-for="link in footerTopics" :key="link">
                <NuxtLink to="/blog">{{ link }}</NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="lh-footer__title">{{ t('landingPage.footer.contactTitle') }}</h3>
            <p class="lh-footer__lead">{{ t('landingPage.footer.contactDesc') }}</p>
            <ul class="lh-footer__contact">
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
            <NuxtLink to="/auth/login" class="lh-btn lh-btn--solid lh-btn--sm">
              {{ t('landingPage.footer.loginCta') }}
            </NuxtLink>
          </div>
        </div>

        <p class="lh-footer__bar">© {{ year }} — {{ t('landingPage.footer.copyright') }}</p>
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
  headerStuck.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

/* ─── Services ──────────────────────────────────────── */

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

const NESHAN_MAP_ID = 'lh-contact-map'
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

    new sdk.Marker({ color: '#FF8330' }).setLngLat([CLINIC_LNG, CLINIC_LAT]).addTo(neshanMap)
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
  ogImage: '/images/hero-poster.jpg',
})

// This page opts out of the default layout, so Useclinicseo never runs and
// <html> would otherwise stay without lang/dir.
useHead({
  htmlAttrs: {
    lang: computed(() => (isRtl.value ? 'fa' : 'en')),
    dir: computed(() => (isRtl.value ? 'rtl' : 'ltr')),
  },
})
</script>

<style scoped>
/*
  Public marketing page — a faithful rebuild of the reference layout.
  Palette, type scale and radii are lifted from the source design:
  olive-green ink, a gold foil accent, sage and cream section washes and
  fully pill-shaped controls.
*/

.lh {
  --ink: #384539;
  --ink-head: #566455;
  --green: #768775;
  --gold: #bc8a5f;
  --magenta: #cc3366;
  --cream: #f8f1e8;
  --sage: #eef2eb;
  --blush: #fef2f1;
  --indigo: #676fa3;
  --muted: #8a8a8a;
  --body: #666;
  --card-ink: #2a2a2a;

  --font-display: 'Bon', 'AriaWeb', sans-serif;
  --font-body: 'yekan-bakh', 'IRANSansX', sans-serif;

  --maxw: 1300px;
  --shadow-card: 0 2px 12px rgba(93, 93, 93, 0.14);

  min-height: 100dvh;
  background: #fff;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.8;
}

.lh ::selection {
  background: var(--sage);
  color: var(--ink);
}

/* Mirrors the "next" arrow direction when the document flips to LTR. */
.lh-flip-rtl {
  transform: scaleX(-1);
}

.lh-skip {
  position: absolute;
  inset-inline-start: -9999px;
  z-index: 100;
}

.lh-skip:focus {
  inset-inline-start: 1rem;
  top: 1rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border-radius: 30px;
}

.lh-shell {
  width: 100%;
  max-width: var(--maxw);
  margin-inline: auto;
  padding-inline: 20px;
}

/* ==================== Header ==================== */

.lh-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease;
}

.lh-header.is-stuck {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 20px rgba(93, 93, 93, 0.1);
}

.lh-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  max-width: var(--maxw);
  margin-inline: auto;
  padding: 1rem 20px;
}

.lh-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.lh-brand img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.lh-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.lh-brand__text strong {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ink-head);
}

.lh-brand__text small {
  font-size: 0.68rem;
  color: var(--muted);
}

.lh-nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.lh-nav__link {
  position: relative;
  padding-block: 0.35rem;
  font-size: 0.9rem;
  color: var(--ink);
  text-decoration: none;
  transition: color 0.3s ease;
}

.lh-nav__link::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--gold);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.lh-nav__link:hover,
.lh-nav__link.is-current {
  color: var(--gold);
}

.lh-nav__link:hover::after,
.lh-nav__link.is-current::after {
  transform: scaleX(1);
}

.lh-header__tools {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.lh-iconbtn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}

.lh-iconbtn:hover {
  background: var(--sage);
  color: var(--gold);
}

.lh-login {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--gold);
  border-radius: 30px;
  font-size: 0.85rem;
  color: var(--gold);
  text-decoration: none;
  transition: background 0.25s ease, color 0.25s ease;
}

.lh-login:hover {
  background: var(--gold);
  color: #fff;
}

.lh-burger,
.lh-mobilemenu {
  display: none;
}

/* ==================== Buttons ==================== */

.lh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 12px 16px 10px;
  border: 0;
  border-radius: 30px;
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease,
    border-color 0.25s ease;
}

.lh-btn:hover {
  transform: translateY(-2px);
}

.lh-btn--sm {
  padding: 9px 18px;
  font-size: 0.85rem;
}

.lh-btn--solid {
  background: var(--green);
  color: #fff;
}

.lh-btn--solid:hover {
  background: var(--ink-head);
}

.lh-btn--gold {
  background: var(--gold);
  color: #fff;
}

.lh-btn--gold:hover {
  background: #a8794f;
}

.lh-btn--ghost {
  border: 1px solid var(--gold);
  background: #fff;
  color: var(--gold);
}

.lh-btn--ghost:hover {
  background: var(--gold);
  color: #fff;
}

/* ==================== Hero ==================== */

.lh-hero {
  position: relative;
  margin-top: -89px;
  padding-top: 89px;
  overflow: hidden;
}

.lh-hero__bg {
  position: absolute;
  inset: 0;
  background-color: var(--sage);
  background-image: linear-gradient(180deg, rgba(238, 242, 235, 0.86) 0%, rgba(255, 255, 255, 0.96) 100%),
    url('/images/hero-poster.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.55;
}

.lh-hero__inner {
  position: relative;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 3rem;
  max-width: var(--maxw);
  margin-inline: auto;
  padding: 60px 20px 90px;
}

.lh-pill {
  display: inline-block;
  margin: 0 0 1.25rem;
  padding: 8px 16px;
  border: 1px solid var(--gold);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  color: var(--gold);
}

.lh-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 5.5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--ink-head);
}

.lh-hero__subtitle {
  margin: 0.5rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  font-weight: 600;
  line-height: 1.5;
  color: var(--green);
}

.lh-hero__desc {
  max-width: 34rem;
  margin: 1rem 0 0;
  color: var(--muted);
}

.lh-hero__stats {
  display: flex;
  gap: 2.75rem;
  margin: 2rem 0 0;
}

.lh-hero__stats dt {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green);
}

.lh-hero__stats dd {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
}

.lh-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.lh-hero__portrait {
  margin: 0;
  display: flex;
  justify-content: center;
}

.lh-hero__portrait img {
  width: 100%;
  max-width: 30rem;
  height: 34rem;
  object-fit: contain;
  object-position: bottom;
  filter: drop-shadow(0 30px 60px rgba(93, 93, 93, 0.28));
}

/* ==================== Sections ==================== */

.lh-section {
  padding-block: 90px;
}

.lh-section--lead {
  padding-block: 90px 150px;
}

.lh-section--tight {
  padding-block: 60px;
}

.lh-section--sage {
  background: var(--sage);
}

.lh-section--cream {
  background: var(--cream);
}

.lh-section__foot {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

.lh-sechead {
  max-width: 44rem;
  margin: 0 auto 3rem;
  text-align: center;
}

.lh-sechead--indigo .lh-sechead__title {
  color: var(--indigo);
}

.lh-sechead__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--green);
}

.lh-sechead__desc {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
  color: var(--muted);
}

.lh-eyebrow {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  color: var(--gold);
}

.lh-h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--green);
}

.lh-p {
  margin: 1rem 0 0;
  color: var(--body);
}

/* ==================== Quick book ==================== */

.lh-quickbook {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.lh-quickcard {
  display: flex;
  flex-direction: column;
  min-height: 12rem;
  padding: 1.5rem;
  border: 4px solid transparent;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--shadow-card);
  text-decoration: none;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.lh-quickcard:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(93, 93, 93, 0.2);
}

.lh-quickcard--sage {
  background: var(--sage);
  border-color: #eef2ff;
}

.lh-quickcard--cream {
  background: var(--cream);
  border-color: var(--blush);
}

.lh-quickcard h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.5;
  color: var(--ink);
}

.lh-quickcard p {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.lh-quickcard__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gold);
}

/* ==================== About ==================== */

.lh-about {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  align-items: center;
  gap: 3.5rem;
}

.lh-about__figure {
  margin: 0;
  padding: 16px;
  border: 16px solid #fff;
  border-radius: 16px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.lh-about__figure img {
  display: block;
  width: 100%;
  height: 30rem;
  object-fit: cover;
  border-radius: 8px;
}

.lh-checklist {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0;
  list-style: none;
}

.lh-checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.9rem;
  color: var(--ink);
}

.lh-checklist__mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--sage);
  color: var(--green);
}

/* ==================== Service cards ==================== */

.lh-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.lh-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  border-radius: 20px;
  background: var(--sage);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.lh-card--cream {
  background: var(--cream);
}

.lh-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card);
}

.lh-card__icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 1.25rem;
  border-radius: 50%;
  background: #fff;
  color: var(--green);
}

.lh-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--card-ink);
}

.lh-card__desc {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  line-height: 2.1;
  color: var(--body);
}

/* ==================== Booking widget ==================== */

.lh-widget {
  padding: 2rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.lh-widget__label {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--ink);
}

.lh-widget__services {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.lh-chip {
  padding: 0.55rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.lh-chip:hover {
  border-color: var(--green);
}

.lh-chip.is-active {
  border-color: var(--green);
  background: var(--green);
  color: #fff;
}

.lh-widget__body {
  margin-top: 1.75rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--sage);
}

.lh-widget__step {
  margin: 0 0 0.85rem;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ink);
}

.lh-widget__step:not(:first-child) {
  margin-top: 1.75rem;
}

.lh-widget__empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.lh-days {
  display: flex;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
  overflow-x: auto;
  scrollbar-width: thin;
}

.lh-day {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 76px;
  padding: 0.7rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  font-family: var(--font-body);
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.lh-day:hover {
  border-color: var(--green);
}

.lh-day.is-active {
  border-color: var(--green);
  background: var(--sage);
  color: var(--ink);
}

.lh-day__week {
  font-size: 0.72rem;
  color: var(--muted);
}

.lh-day__date {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
}

.lh-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.lh-slot {
  min-width: 88px;
  padding: 0.6rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.lh-slot:hover {
  border-color: var(--green);
}

.lh-slot.is-active {
  border-color: var(--green);
  background: var(--green);
  color: #fff;
}

.lh-widget__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.lh-widget__summary {
  font-size: 0.9rem;
  color: var(--green);
}

/* ==================== Gallery ==================== */

.lh-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.lh-shot {
  overflow: hidden;
  border-radius: 20px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.lh-shot__media {
  display: grid;
  place-items: center;
  height: 11rem;
  color: rgba(255, 255, 255, 0.9);
}

.lh-shot__media--0 {
  background: linear-gradient(140deg, var(--green), var(--ink-head));
}

.lh-shot__media--1 {
  background: linear-gradient(140deg, var(--gold), #d9a97f);
}

.lh-shot__media--2 {
  background: linear-gradient(140deg, var(--ink-head), #7b8a79);
}

.lh-shot__media--3 {
  background: linear-gradient(140deg, #a99b8a, var(--sage));
  color: var(--ink);
}

.lh-shot__caption {
  padding: 1.25rem;
}

.lh-shot__caption h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ink);
}

.lh-shot__caption p {
  margin: 0.4rem 0 0;
  font-size: 0.82rem;
  color: var(--muted);
}

/* ==================== Testimonials ==================== */

.lh-quotes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.lh-quote {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  padding: 2rem;
  border: 1px solid rgba(240, 225, 228, 0.9);
  border-radius: 80px;
  background: #fff;
}

.lh-quote__mark {
  color: var(--gold);
}

.lh-quote p {
  margin: 1rem 0 1.5rem;
  font-size: 0.85rem;
  line-height: 2;
  color: var(--ink);
}

.lh-quote footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.lh-quote__avatar {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--sage);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--green);
}

.lh-quote footer strong {
  display: block;
  font-size: 0.95rem;
  color: var(--ink);
}

.lh-quote footer small {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
}

/* ==================== Contact ==================== */

.lh-contact {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3.5rem;
  align-items: center;
}

.lh-contact__map {
  position: relative;
  overflow: hidden;
  height: 24rem;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
}

.lh-contact__map-canvas {
  width: 100%;
  height: 100%;
}

.lh-contact__map-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  color: var(--green);
  text-decoration: underline;
}

.lh-details {
  display: grid;
  gap: 1.25rem;
  margin: 2rem 0;
}

.lh-details dt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--gold);
}

.lh-details dd {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  color: var(--ink);
}

.lh-details__link {
  color: var(--green);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.lh-details__link:hover {
  color: var(--gold);
}

/* ==================== Blog ==================== */

.lh-posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.lh-post {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  text-decoration: none;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.lh-post:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-card);
}

.lh-post__media {
  display: grid;
  place-items: center;
  height: 11rem;
  background: var(--sage);
  color: var(--green);
  overflow: hidden;
}

.lh-post__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lh-post__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem;
}

.lh-post__meta {
  font-size: 0.75rem;
  color: var(--muted);
}

.lh-post h3 {
  margin: 0.5rem 0 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.6;
  color: var(--ink);
}

.lh-post p {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.lh-post__more {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--green);
}

/* ==================== Footer ==================== */

.lh-footer {
  padding-block: 60px 30px;
  border-top: 1px solid var(--sage);
  background: #fafbf9;
}

.lh-footer__grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
  gap: 2.5rem;
}

.lh-brand--light .lh-brand__text strong {
  color: var(--ink);
}

.lh-footer p {
  margin: 1rem 0 0;
  font-size: 0.85rem;
  color: var(--body);
}

.lh-footer__note {
  font-size: 0.78rem !important;
  color: var(--muted) !important;
}

.lh-footer__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--green);
}

.lh-footer__list {
  display: grid;
  gap: 0.55rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.lh-footer__list a {
  font-size: 0.85rem;
  color: var(--body);
  text-decoration: none;
  transition: color 0.25s ease;
}

.lh-footer__list a:hover {
  color: var(--gold);
}

.lh-footer__contact {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
  padding: 0;
  list-style: none;
}

.lh-footer__contact li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--body);
}

.lh-footer__contact a {
  color: inherit;
  text-decoration: none;
}

.lh-footer__contact svg {
  flex: none;
  margin-top: 5px;
  color: var(--gold);
}

.lh-footer__bar {
  margin: 3rem 0 0 !important;
  padding-top: 1.5rem;
  border-top: 1px solid var(--sage);
  font-size: 0.78rem !important;
  color: var(--muted) !important;
  text-align: center;
}

/* ==================== Responsive ==================== */

@media (max-width: 1024px) {
  .lh-nav {
    display: none;
  }

  .lh-login {
    display: none;
  }

  .lh-burger {
    display: grid;
  }

  .lh-mobilemenu {
    display: grid;
    gap: 0.25rem;
    padding: 0.5rem 20px 1.25rem;
    background: #fff;
    box-shadow: 0 18px 30px rgba(93, 93, 93, 0.12);
  }

  .lh-mobilemenu a {
    padding: 0.6rem 0;
    font-size: 0.95rem;
    color: var(--ink);
    text-decoration: none;
  }

  .lh-hero__inner,
  .lh-about,
  .lh-contact {
    grid-template-columns: 1fr;
  }

  .lh-hero__portrait {
    order: -1;
  }

  .lh-hero__portrait img {
    height: 26rem;
  }

  .lh-quickbook,
  .lh-gallery {
    grid-template-columns: repeat(2, 1fr);
  }

  .lh-cards,
  .lh-quotes,
  .lh-posts {
    grid-template-columns: repeat(2, 1fr);
  }

  .lh-footer__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .lh-contact__map {
    height: 18rem;
  }
}

@media (max-width: 640px) {
  .lh-section,
  .lh-section--lead,
  .lh-section--tight {
    padding-block: 56px;
  }

  .lh-quickbook,
  .lh-cards,
  .lh-quotes,
  .lh-posts,
  .lh-gallery,
  .lh-footer__grid {
    grid-template-columns: 1fr;
  }

  .lh-hero__stats {
    gap: 1.75rem;
  }

  .lh-about__figure img {
    height: 22rem;
  }

  .lh-widget {
    padding: 1.25rem;
  }

  .lh-quote {
    border-radius: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lh * {
    transition: none !important;
    animation: none !important;
  }
}

</style>