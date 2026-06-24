<template>
  <v-locale-provider rtl>
    <div dir="rtl" class="min-h-screen bg-white">
      <!-- ============ NAVBAR ============ -->
      <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        :class="scrolled ? 'bg-white/95! backdrop-blur-xl! shadow-lg! shadow-slate-900/10!' : 'bg-transparent!'">
        <div class="max-w-7xl mx-auto px-6! sm:px-8! lg:px-12!">
          <div class="flex items-center justify-between h-24!">
            <NuxtLink to="/" class="flex items-center gap-3! group">
              <div
                class="w-12! h-12! rounded-2xl! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! flex items-center justify-center shadow-lg! shadow-electric-sapphire/20! group-hover:shadow-electric-sapphire/40! transition-shadow duration-300">
                <span class="mdi mdi-heart-pulse text-white text-2xl!"></span>
              </div>
              <span class="font-black! text-xl! tracking-tight transition-colors duration-500"
                :class="scrolled ? 'text-slate-800!' : 'text-white!'">کلینیک سلامت دکتر حسینی</span>
            </NuxtLink>

            <div class="hidden lg:flex items-center gap-12!">
              <a v-for="link in navLinks" :key="link.href" :href="link.href"
                class="text-base! font-bold! transition-all duration-300 relative after:absolute after:bottom-0 after:right-0 after:h-0.5! after:w-0 after:bg-electric-sapphire! after:transition-all hover:after:w-full! tracking-wide"
                :class="scrolled ? 'text-slate-700! hover:text-electric-sapphire!' : 'text-white/90! hover:text-white!'">{{
                  link.label }}</a>
            </div>

            <div class="flex items-center gap-4!">
              <NuxtLink to="/auth/login"
                class="hidden sm:inline-flex text-sm font-bold! px-5! py-3! rounded-2xl! transition-all duration-300"
                :class="scrolled ? 'text-electric-sapphire! hover:bg-electric-sapphire/5!' : 'text-white! hover:bg-white/10!'">
                ورود</NuxtLink>
              <NuxtLink to="/auth/register"
                class="text-sm font-extrabold! px-6! py-3! rounded-2xl! transition-all duration-300 shadow-lg!"
                :class="scrolled
                  ? 'bg-electric-sapphire! text-white! shadow-electric-sapphire/30! hover:shadow-electric-sapphire/50! hover:-translate-y-0.5!'
                  : 'bg-white! text-electric-sapphire! shadow-white/30! hover:shadow-white/50! hover:-translate-y-0.5!'">
                ثبت‌نام</NuxtLink>
              <button class="lg:hidden p-2.5! rounded-xl! transition-colors"
                :class="scrolled ? 'text-slate-700! hover:bg-slate-100!' : 'text-white! hover:bg-white/10!'"
                @click="mobileMenu = !mobileMenu">
                <span class="mdi text-2xl!" :class="mobileMenu ? 'mdi-close' : 'mdi-menu'"></span>
              </button>
            </div>
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="mobileMenu" class="lg:hidden bg-white! border-t border-slate-100! shadow-2xl!">
            <div class="px-6! py-8! space-y-2!">
              <a v-for="link in navLinks" :key="link.href" :href="link.href"
                class="block px-5! py-3.5! rounded-2xl! text-slate-700! font-bold! hover:bg-electric-sapphire/5! hover:text-electric-sapphire! transition-colors text-base!"
                @click="mobileMenu = false">{{ link.label }}</a>
              <hr class="my-4! border-slate-100!">
              <NuxtLink to="/auth/login"
                class="block px-5! py-3.5! rounded-2xl! text-slate-700! font-bold! hover:bg-electric-sapphire/5! hover:text-electric-sapphire! transition-colors text-base!"
                @click="mobileMenu = false">ورود</NuxtLink>
              <NuxtLink to="/auth/register"
                class="block px-5! py-3.5! rounded-2xl! text-white! font-extrabold! bg-electric-sapphire! hover:bg-electric-sapphire/90! transition-colors text-center text-base!"
                @click="mobileMenu = false">ثبت‌نام</NuxtLink>
            </div>
          </div>
        </transition>
      </nav>

      <!-- ============ HERO ============ -->
      <section
        class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br! from-electric-sapphire! via-cornflower-blue! to-electric-sapphire!">
        <div class="absolute inset-0">
          <div class="absolute top-20! left-10! w-80! h-80! bg-white/10! rounded-full blur-3xl"></div>
          <div class="absolute bottom-20! right-10! w-96! h-96! bg-white/5! rounded-full blur-3xl"></div>
          <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px]! h-[900px]! bg-white/5! rounded-full blur-3xl">
          </div>
          <div class="absolute top-40! right-[20%] w-24! h-24! border-2! border-white/20! rounded-full animate-float">
          </div>
          <div
            class="absolute bottom-40! left-[15%] w-16! h-16! border-2! border-white/20! rounded-full animate-float-delayed">
          </div>
          <div class="absolute top-1/3 left-[10%] w-8! h-8! bg-white/20! rounded-full"></div>
          <div class="absolute bottom-1/3 right-[10%] w-12! h-12! bg-white/10! rounded-full blur-sm"></div>
        </div>

        <div class="relative z-10 max-w-7xl mx-auto px-6! sm:px-8! lg:px-12! py-14! md:py-44!">
          <div class="grid lg:grid-cols-2 gap-16! items-center">
            <div class="text-center lg:text-right">
              <div
                class="inline-flex items-center gap-2.5! px-5! py-2.5! rounded-full bg-white/15! backdrop-blur-sm! text-white/90! text-sm font-bold! mb-10! border border-white/10!">
                <span class="w-2.5! h-2.5! rounded-full bg-green-400! animate-pulse"></span>
                سامانه نوبت‌دهی آنلاین پزشکی
              </div>
              <h1
                class="text-5xl! sm:text-6xl! lg:text-7xl! xl:text-8xl! font-black! text-white! leading-tight! tracking-tight">
                سلامتی شما
                <br>
                <span class="text-transparent! bg-clip-text! bg-gradient-to-r! from-yellow-300! to-orange-300!">اولویت
                  ما</span>
              </h1>
              <p class="text-xl! sm:text-2xl! text-white/80! mt-8! max-w-2xl! mx-auto lg:mx-0! leading-relaxed!">
                با کلینیک ما به راحتی نوبت خود را رزرو کنید، با پزشکان متخصص مشورت کنید و سوابق پزشکی خود را به صورت
                آنلاین مدیریت نمایید.
              </p>
              <div class="flex flex-wrap gap-6! mt-12! justify-center lg:justify-start">
                <a href="#doctors"
                  class="group px-10! py-5! rounded-2xl! bg-white! text-electric-sapphire! font-extrabold! text-base! shadow-2xl! shadow-black/20! hover:shadow-white/40! hover:-translate-y-1! transition-all duration-300 flex items-center gap-3!">
                  <span>رزرو نوبت آنلاین</span>
                  <span class="mdi mdi-arrow-left text-xl! group-hover:translate-x-1! transition-transform"></span>
                </a>
                <a href="#services"
                  class="group px-10! py-5! rounded-2xl! border-2! border-white/30! text-white! font-extrabold! text-base! hover:bg-white/15! hover:border-white/60! transition-all duration-300 flex items-center gap-3!">
                  <span>مشاهده خدمات ما</span>
                  <span class="mdi mdi-chevron-left text-xl! group-hover:translate-x-1! transition-transform"></span>
                </a>
              </div>
            </div>

            <div class="hidden lg:flex justify-center">
              <div class="relative">
                <div
                  class="w-[380px]! h-[420px]! rounded-[32px]! bg-white/10! backdrop-blur-md! border border-white/20! p-10! flex flex-col items-center justify-center shadow-2xl!">
                  <div
                    class="w-28! h-28! rounded-2xl! bg-gradient-to-br! from-yellow-300! to-orange-400! flex items-center justify-center mb-8! shadow-xl!">
                    <span class="mdi mdi-hospital text-5xl! text-white!"></span>
                  </div>
                  <div class="text-white text-center">
                    <div class="text-4xl! font-black!">+۵,۰۰۰</div>
                    <div class="text-white/70! text-sm mt-2! font-bold">نوبت‌دهی موفق</div>
                  </div>
                  <div class="mt-8! w-full space-y-4!">
                    <div class="flex items-center gap-3! text-white/80! text-base! font-medium">
                      <span class="mdi mdi-check-circle text-green-300! text-xl!"></span>
                      <span>نوبت‌دهی ۲۴ ساعته</span>
                    </div>
                    <div class="flex items-center gap-3! text-white/80! text-base! font-medium">
                      <span class="mdi mdi-check-circle text-green-300! text-xl!"></span>
                      <span>مشاوره تخصصی آنلاین</span>
                    </div>
                    <div class="flex items-center gap-3! text-white/80! text-base! font-medium">
                      <span class="mdi mdi-check-circle text-green-300! text-xl!"></span>
                      <span>پیگیری سوابق پزشکی</span>
                    </div>
                  </div>
                </div>
                <div
                  class="absolute -bottom-6! -right-6! w-32! h-32! rounded-2xl! bg-gradient-to-br! from-pink-400! to-rose-400! flex items-center justify-center shadow-2xl! -z-10!">
                  <span class="mdi mdi-heart text-4xl! text-white!"></span>
                </div>
                <div
                  class="absolute -top-6! -left-6! w-28! h-28! rounded-2xl! bg-gradient-to-br! from-sky-300! to-cyan-400! flex items-center justify-center shadow-2xl! -z-10!">
                  <span class="mdi mdi-stethoscope text-4xl! text-white!"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 h-40! bg-gradient-to-t! from-white! to-transparent!"></div>
      </section>

      <!-- ============ SERVICES ============ -->
      <section id="services" class="py-14! md:py-14! px-6! sm:px-8! lg:px-12! bg-white! relative overflow-hidden">
        <div
          class="absolute top-0 left-0 w-96! h-96! bg-periwinkle/20! rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2">
        </div>
        <div
          class="absolute bottom-0 right-0 w-80! h-80! bg-light-cyan/50! rounded-full blur-3xl translate-x-1/3 translate-y-1/3">
        </div>

        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center mb-20!">
            <span
              class="inline-flex items-center gap-2! px-5! py-2! rounded-full bg-electric-sapphire/10! text-electric-sapphire! text-sm font-extrabold! mb-6!">
              <span class="mdi mdi-medical-bag text-base!"></span>
              خدمات ما
            </span>
            <h2 class="text-4xl! md:text-5xl! lg:text-6xl! font-black! text-slate-900! leading-tight!">خدمات جامع و
              حرفه‌ای</h2>
            <p class="text-slate-500! mt-6! max-w-3xl! mx-auto text-xl! leading-relaxed!">ارائه بهترین خدمات پزشکی با
              به‌روزترین تجهیزات و کادر مجرب</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8! md:gap-10!">
            <div v-for="(service, i) in services" :key="service.title"
              class="group relative bg-white! rounded-[32px]! p-10! border border-slate-100! shadow-sm hover:shadow-2xl! hover:-translate-y-3! transition-all duration-500"
              :style="{ transitionDelay: `${i * 100}ms` }">
              <div
                class="absolute inset-0 rounded-[32px]! bg-gradient-to-br! from-electric-sapphire/0! via-electric-sapphire/0! to-electric-sapphire/0! group-hover:from-electric-sapphire/5! group-hover:via-cornflower-blue/5! group-hover:to-baby-blue-ice/10! transition-all duration-500">
              </div>
              <div class="relative z-10">
                <div
                  class="w-20! h-20! rounded-2xl! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! flex items-center justify-center mb-8! shadow-lg! shadow-electric-sapphire/20! group-hover:shadow-electric-sapphire/40! group-hover:scale-110! transition-all duration-500">
                  <span :class="['mdi', service.icon, 'text-3xl! text-white!']"></span>
                </div>
                <h3
                  class="text-2xl! font-bold! text-slate-800! mb-4! group-hover:text-electric-sapphire! transition-colors">
                  {{ service.title }}</h3>
                <p class="text-slate-500! leading-relaxed! text-base!">{{ service.description }}</p>
                <div
                  class="mt-8! flex items-center gap-2! text-electric-sapphire! text-base! font-bold! opacity-0! group-hover:opacity-100! transition-all duration-500 translate-y-3! group-hover:translate-y-0!">
                  <span>بیشتر بدانید</span>
                  <span class="mdi mdi-arrow-left text-lg!"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ DOCTORS & BOOKING ============ -->
      <section id="doctors"
        class="py-14! md:py-14! px-6! sm:px-8! lg:px-12! bg-gradient-to-b! from-slate-50/80! to-white! relative overflow-hidden">
        <div class="absolute top-1/2 right-0 w-72! h-72! bg-baby-blue-ice/30! rounded-full blur-3xl"></div>

        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center mb-20!">
            <span
              class="inline-flex items-center gap-2! px-5! py-2! rounded-full bg-electric-sapphire/10! text-electric-sapphire! text-sm font-extrabold! mb-6!">
              <span class="mdi mdi-doctor text-base!"></span>
              پزشکان متخصص
            </span>
            <h2 class="text-4xl! md:text-5xl! lg:text-6xl! font-black! text-slate-900! leading-tight!">با بهترین پزشکان
              آشنا شوید</h2>
            <p class="text-slate-500! mt-6! max-w-3xl! mx-auto text-xl! leading-relaxed!">رزرو نوبت از بهترین متخصصین در
              سریع‌ترین زمان ممکن</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10!">
            <div v-for="doctor in doctors" :key="doctor.name"
              class="group bg-white! rounded-[32px]! border border-slate-100! shadow-sm hover:shadow-2xl! transition-all duration-500 hover:-translate-y-3! overflow-hidden">
              <div
                class="h-52! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! relative overflow-hidden">
                <div class="absolute inset-0 bg-white/10!"></div>
                <div class="absolute -bottom-12! -left-12! w-36! h-36! bg-white/10! rounded-full"></div>
                <div class="absolute -top-8! -right-8! w-28! h-28! bg-white/10! rounded-full"></div>
                <div
                  class="absolute bottom-6! right-6! flex items-center gap-2! bg-white/20! backdrop-blur-sm! rounded-xl! px-4! py-2! border border-white/20!">
                  <span class="mdi mdi-star text-yellow-300! text-base!"></span>
                  <span class="text-white! font-extrabold! text-base!">{{ doctor.rating }}</span>
                </div>
              </div>
              <div class="p-8! -mt-16! relative z-10">
                <div
                  class="w-24! h-24! rounded-2xl! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! flex items-center justify-center mx-auto shadow-2xl! shadow-electric-sapphire/30! border-[5px]! border-white! mb-6!">
                  <span class="text-white! font-black! text-3xl!">{{ doctor.name.charAt(0) }}</span>
                </div>
                <div class="text-center">
                  <h3 class="text-2xl! font-bold! text-slate-800! mb-1!">{{ doctor.name }}</h3>
                  <span
                    class="inline-block px-4! py-1.5! rounded-full bg-electric-sapphire/10! text-electric-sapphire! text-xs! font-bold! mt-2!">{{
                      doctor.specialty }}</span>
                  <p class="text-slate-500! text-sm mt-4! leading-relaxed!">{{ doctor.bio }}</p>
                  <div class="flex items-center justify-center gap-4! mt-5! text-slate-400! text-sm font-bold">
                    <span class="flex items-center gap-1.5!">
                      <span class="mdi mdi-clock-outline text-electric-sapphire!"></span>
                      {{ doctor.experience }} سال تجربه
                    </span>
                  </div>
                  <NuxtLink :to="`/booking/${doctor.id}`"
                    class="mt-8! w-full px-8! py-4! rounded-2xl! bg-gradient-to-r! from-electric-sapphire! to-cornflower-blue! text-white! font-extrabold! text-sm hover:shadow-2xl! hover:shadow-electric-sapphire/40! hover:-translate-y-1! transition-all duration-300 inline-flex items-center justify-center">
                    رزرو نوبت
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!--
                    <div class="text-center mt-16!">
            <a href="#contact"
              class="inline-flex items-center gap-3! px-10! py-5! rounded-2xl! border-2! border-electric-sapphire/20! text-electric-sapphire! font-extrabold! hover:bg-electric-sapphire/5! hover:border-electric-sapphire/50! transition-all duration-300 text-base!">
              <span>مشاهده همه پزشکان</span>
              <span class="mdi mdi-arrow-left text-lg!"></span>
            </a>
          </div>-->
        </div>
      </section>

      <!-- ============ ABOUT US ============ -->
      <section id="about" class="py-14! md:py-14! px-6! sm:px-8! lg:px-12! bg-white! relative overflow-hidden">
        <div class="absolute top-1/2 left-0 w-96! h-96! bg-light-cyan/60! rounded-full blur-3xl -translate-x-1/2"></div>

        <div class="max-w-7xl mx-auto relative z-10">
          <div class="grid lg:grid-cols-2 gap-20! items-center">
            <div class="order-2 lg:order-1">
              <span
                class="inline-flex items-center gap-2! px-5! py-2! rounded-full bg-electric-sapphire/10! text-electric-sapphire! text-sm font-extrabold! mb-6!">
                <span class="mdi mdi-information-outline text-base!"></span>
                درباره ما
              </span>
              <h2 class="text-4xl! md:text-5xl! lg:text-6xl! font-black! text-slate-900! leading-tight!">
                ما به سلامتی شما
                <br>
                <span class="text-electric-sapphire!">متعهد هستیم</span>
              </h2>
              <p class="text-slate-600! mt-8! leading-relaxed! text-xl!">
                کلینیک سلامت با بیش از ۱۵ سال سابقه درخشان در ارائه خدمات درمانی، همواره در تلاش است تا بهترین و
                مدرن‌ترین خدمات پزشکی را به بیماران عزیز ارائه دهد. ما با بهره‌گیری از کادر مجرب و تجهیزات پیشرفته،
                سلامت شما را در اولویت قرار می‌دهیم.
              </p>
              <p class="text-slate-500! mt-6! leading-relaxed! text-lg!">
                سامانه نوبت‌دهی آنلاین ما این امکان را فراهم کرده است تا در هر ساعت از شبانه‌روز، به راحتی نوبت خود را
                رزرو کنید و از خدمات متنوع ما بهره‌مند شوید.
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-8! mt-16!">
                <div v-for="stat in stats" :key="stat.label"
                  class="text-center p-6! rounded-2xl! bg-slate-50! border border-slate-100! hover:border-electric-sapphire/20! hover:shadow-md! transition-all duration-300">
                  <div class="text-3xl! md:text-4xl! font-black! text-electric-sapphire!">{{ stat.value }}</div>
                  <div class="text-xs! text-slate-500! mt-2! font-bold! tracking-wide">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <div class="order-1 lg:order-2 flex justify-center">
              <div class="relative">
                <div
                  class="w-[400px]! h-[420px]! rounded-[32px]! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! p-10! flex flex-col items-center justify-center shadow-2xl! shadow-electric-sapphire/20!">
                  <span class="mdi mdi-shield-check text-7xl! text-white/20! mb-6!"></span>
                  <div class="text-white text-center">
                    <div class="text-3xl! font-black! mb-3!">۱۵+ سال</div>
                    <div class="text-white/70! text-base! font-bold">تجربه درخشان در خدمات درمانی</div>
                  </div>
                  <div class="mt-10! grid grid-cols-2 gap-6! w-full">
                    <div class="text-center p-4! rounded-2xl! bg-white/10! backdrop-blur-sm! border border-white/10!">
                      <div class="text-white! font-black! text-2xl!">۲۰۰+</div>
                      <div class="text-white/60! text-xs! font-bold mt-1!">پرسنل مجرب</div>
                    </div>
                    <div class="text-center p-4! rounded-2xl! bg-white/10! backdrop-blur-sm! border border-white/10!">
                      <div class="text-white! font-black! text-2xl!">۵۰,۰۰۰+</div>
                      <div class="text-white/60! text-xs! font-bold mt-1!">بیماران عزیز</div>
                    </div>
                  </div>
                </div>
                <div
                  class="absolute -bottom-8! -left-8! w-32! h-32! rounded-2xl! bg-gradient-to-br! from-yellow-300! to-orange-400! flex items-center justify-center shadow-2xl! -z-10!">
                  <span class="mdi mdi-star text-5xl! text-white!"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ CONTACT US ============ -->
      <section id="contact"
        class="py-14! md:py-14! px-6! sm:px-8! lg:px-12! bg-gradient-to-b! from-slate-50! to-white! relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96! h-96! bg-periwinkle/20! rounded-full blur-3xl"></div>

        <div class="max-w-7xl mx-auto relative z-10">
          <div class="text-center mb-20!">
            <span
              class="inline-flex items-center gap-2! px-5! py-2! rounded-full bg-electric-sapphire/10! text-electric-sapphire! text-sm font-extrabold! mb-6!">
              <span class="mdi mdi-phone text-base!"></span>
              تماس با ما
            </span>
            <h2 class="text-4xl! md:text-5xl! lg:text-6xl! font-black! text-slate-900! leading-tight!">با ما در ارتباط
              باشید</h2>
            <p class="text-slate-500! mt-6! max-w-3xl! mx-auto text-xl! leading-relaxed!">پاسخگوی سوالات شما در تمام
              روزهای هفته هستیم</p>
          </div>

          <div class="grid lg:grid-cols-2 gap-16!">
            <div class="space-y-10!">
              <div v-for="item in contactInfo" :key="item.label" class="flex items-start gap-6! group">
                <div
                  class="w-16! h-16! rounded-2xl! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! flex items-center justify-center shrink-0 shadow-xl! shadow-electric-sapphire/20! group-hover:scale-110! transition-transform duration-300">
                  <span :class="['mdi', item.icon, 'text-2xl! text-white!']"></span>
                </div>
                <div>
                  <h4 class="font-extrabold! text-lg! text-slate-800! mb-2!">{{ item.label }}</h4>
                  <p class="text-slate-500! text-base! leading-relaxed!" v-html="item.value"></p>
                </div>
              </div>

              <div class="flex gap-5! pt-6!">
                <a v-for="social in socialLinks" :key="social.name" :href="social.href"
                  class="w-14! h-14! rounded-2xl! bg-slate-100! hover:bg-electric-sapphire! hover:text-white! flex items-center justify-center transition-all duration-300 text-slate-500! hover:shadow-xl! hover:shadow-electric-sapphire/30!">
                  <span :class="['mdi', social.icon, 'text-2xl!']"></span>
                </a>
              </div>
            </div>

            <div class="bg-white! rounded-[32px]! p-10! shadow-2xl! shadow-slate-200/50! border border-slate-100!">
              <h3 class="text-3xl! font-extrabold! text-slate-800! mb-3!">ارسال پیام</h3>
              <p class="text-slate-500! text-base! mb-10!">پیام خود را برای ما ارسال کنید، در اسرع وقت پاسخگوی شما
                خواهیم بود.</p>
              <form @submit.prevent="handleSubmit" class="space-y-7!">
                <div class="grid sm:grid-cols-2 gap-6!">
                  <div>
                    <label class="block text-sm font-extrabold! text-slate-700! mb-3!">نام و نام خانوادگی</label>
                    <input v-model="form.name" type="text"
                      class="w-full px-6! py-4! rounded-2xl! border border-slate-200! bg-slate-50/50! text-slate-800! text-sm outline-none! focus:border-electric-sapphire! focus:ring-4! focus:ring-electric-sapphire/20! transition-all"
                      placeholder="نام خود را وارد کنید">
                  </div>
                  <div>
                    <label class="block text-sm font-extrabold! text-slate-700! mb-3!">شماره تماس</label>
                    <input v-model="form.phone" type="tel"
                      class="w-full px-6! py-4! rounded-2xl! border border-slate-200! bg-slate-50/50! text-slate-800! text-sm outline-none! focus:border-electric-sapphire! focus:ring-4! focus:ring-electric-sapphire/20! transition-all ltr-field!"
                      placeholder="شماره تماس">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-extrabold! text-slate-700! mb-3!">موضوع</label>
                  <input v-model="form.subject" type="text"
                    class="w-full px-6! py-4! rounded-2xl! border border-slate-200! bg-slate-50/50! text-slate-800! text-sm outline-none! focus:border-electric-sapphire! focus:ring-4! focus:ring-electric-sapphire/20! transition-all"
                    placeholder="موضوع پیام">
                </div>
                <div>
                  <label class="block text-sm font-extrabold! text-slate-700! mb-3!">متن پیام</label>
                  <textarea v-model="form.message" rows="5"
                    class="w-full px-6! py-4! rounded-2xl! border border-slate-200! bg-slate-50/50! text-slate-800! text-sm outline-none! focus:border-electric-sapphire! focus:ring-4! focus:ring-electric-sapphire/20! transition-all resize-none!"
                    placeholder="پیام خود را بنویسید..."></textarea>
                </div>
                <button type="submit"
                  class="w-full px-10! py-5! rounded-2xl! bg-gradient-to-r! from-electric-sapphire! to-cornflower-blue! text-white! font-extrabold! text-base! hover:shadow-2xl! hover:shadow-electric-sapphire/40! hover:-translate-y-1! transition-all duration-300 flex items-center justify-center gap-3!">
                  <span>ارسال پیام</span>
                  <span class="mdi mdi-send text-lg!"></span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ FOOTER ============ -->
      <footer class="bg-slate-900! text-white!">
        <div class="max-w-7xl mx-auto px-6! sm:px-8! lg:px-12! py-14!">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16!">
            <div class="lg:col-span-1">
              <div class="flex items-center gap-3! mb-8!">
                <div
                  class="w-12! h-12! rounded-2xl! bg-gradient-to-br! from-electric-sapphire! to-cornflower-blue! flex items-center justify-center shadow-lg!">
                  <span class="mdi mdi-heart-pulse text-white text-2xl!"></span>
                </div>
                <span class="font-black! text-2xl!">کلینیک سلامت</span>
              </div>
              <p class="text-slate-400! text-base! leading-relaxed!">ارائه بهترین خدمات درمانی با کادر مجرب و تجهیزات
                مدرن. سلامتی شما اولویت ماست.</p>
              <div class="flex gap-4! mt-8!">
                <a v-for="social in socialLinks" :key="social.name" :href="social.href"
                  class="w-12! h-12! rounded-2xl! bg-slate-800! hover:bg-electric-sapphire! flex items-center justify-center transition-all duration-300 text-slate-400! hover:text-white! hover:shadow-lg! hover:shadow-electric-sapphire/30!">
                  <span :class="['mdi', social.icon, 'text-xl!']"></span>
                </a>
              </div>
            </div>

            <div>
              <h4 class="font-black! text-xl! mb-8! text-white!">دسترسی سریع</h4>
              <ul class="space-y-5!">
                <li v-for="link in footerLinks" :key="link.label">
                  <a :href="link.href"
                    class="text-slate-400! hover:text-electric-sapphire! transition-colors text-base! flex items-center gap-2! font-medium">
                    <span class="mdi mdi-chevron-left text-electric-sapphire! text-lg!"></span>
                    {{ link.label }}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-black! text-xl! mb-8! text-white!">ساعات کاری</h4>
              <ul class="space-y-5! text-base!">
                <li class="flex justify-between text-slate-400!">
                  <span>شنبه - چهارشنبه</span>
                  <span class="text-white! font-extrabold!">۸ - ۲۰</span>
                </li>
                <li class="flex justify-between text-slate-400!">
                  <span>پنجشنبه</span>
                  <span class="text-white! font-extrabold!">۸ - ۱۶</span>
                </li>
                <li class="flex justify-between text-slate-400!">
                  <span>جمعه</span>
                  <span class="text-red-400! font-extrabold!">تعطیل</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="font-black! text-xl! mb-8! text-white!">اطلاعات تماس</h4>
              <ul class="space-y-5! text-base!">
                <li class="flex items-center gap-3! text-slate-400!">
                  <span class="mdi mdi-map-marker text-electric-sapphire! text-xl! shrink-0!"></span>
                  تهران، خیابان ولیعصر، نبش خیابان مطهری
                </li>
                <li class="flex items-center gap-3! text-slate-400!">
                  <span class="mdi mdi-phone text-electric-sapphire! text-xl! shrink-0!"></span>
                  09907789182
                </li>
                <li class="flex items-center gap-3! text-slate-400!">
                  <span class="mdi mdi-email text-electric-sapphire! text-xl! shrink-0!"></span>
                  info@clinic-salamat.ir
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t! border-slate-800! mt-16! pt-10! text-center">
            <p class="text-slate-500! text-sm font-medium">تمامی حقوق مادی و معنوی این وبسایت متعلق به کلینیک سلامت
              می‌باشد.</p>
          </div>
        </div>
      </footer>
    </div>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

useSeoMeta({
  title: 'کلینیک سلامت | سامانه نوبت‌دهی آنلاین پزشکی',
  ogTitle: 'کلینیک سلامت - سامانه نوبت‌دهی آنلاین',
  description: 'با کلینیک سلامت، به راحتی نوبت پزشک خود را رزرو کنید و سوابق پزشکی خود را مدیریت کنید.',
})

definePageMeta({
  layout: false,
})

const scrolled = ref(false)
const mobileMenu = ref(false)
const visibleSections = ref<Record<string, boolean>>({})
const observers: IntersectionObserver[] = []

const form = ref({
  name: '',
  phone: '',
  subject: '',
  message: '',
})

const navLinks = [
  { href: '#services', label: 'خدمات ما' },
  { href: '#doctors', label: 'پزشکان' },
  { href: '#about', label: 'درباره ما' },
  { href: '#contact', label: 'تماس با ما' },
]

const services = [
  {
    icon: 'mdi-calendar-check',
    title: 'نوبت‌دهی آنلاین',
    description: 'رزرو نوبت پزشک مورد نظر خود در هر ساعت از شبانه‌روز به صورت آنلاین و بدون نیاز به تماس تلفنی.',
  },
  {
    icon: 'mdi-doctor',
    title: 'مشاوره تخصصی',
    description: 'مشاوره با بهترین پزشکان متخصص در زمینه‌های مختلف پزشکی به صورت حضوری و آنلاین.',
  },
  {
    icon: 'mdi-file-document',
    title: 'پرونده الکترونیک',
    description: 'مدیریت سوابق پزشکی، نسخه‌ها و نتایج آزمایش‌ها به صورت دیجیتال و دسترسی آسان به آن‌ها.',
  },
  {
    icon: 'mdi-flask',
    title: 'آزمایشگاه',
    description: 'انجام انواع آزمایش‌های بالینی و تخصصی با مدرن‌ترین تجهیزات آزمایشگاهی و نتایج سریع.',
  },
]

const doctors = [
  {
    id: '514280f3-789b-4388-9654-ad134fe2085e',
    name: 'دکتر هستی سادات حسینی',
    specialty: 'متخصص زنان',
    rating: '5',
    experience: '7',
    bio: 'فوق تخصص بیماری‌های زنان و زایمان با رویکردی مدرن و علمی.',
  },

]

const stats = [
  { value: '۱۵+', label: 'سال تجربه' },
  { value: '۵۰K+', label: 'بیماران' },
  { value: '۲۰۰+', label: 'پرسنل' },
  { value: '۹۸٪', label: 'رضایت' },
]

const contactInfo = [
  {
    icon: 'mdi-map-marker',
    label: 'آدرس',
    value: 'تهران، خیابان ولیعصر، نبش خیابان مطهری، ساختمان پزشکان سلامت، طبقه ۳',
  },
  {
    icon: 'mdi-phone',
    label: 'شماره تماس',
    value: '09907789182',
  },
  {
    icon: 'mdi-email',
    label: 'ایمیل',
    value: 'info@clinic-salamat.ir',
  },
  {
    icon: 'mdi-clock-outline',
    label: 'ساعات کاری',
    value: 'شنبه تا چهارشنبه ۸ الی ۲۰<br>پنجشنبه ۸ الی ۱۶',
  },
]

const socialLinks = [
  { name: 'اینستاگرام', icon: 'mdi-instagram', href: '#' },
  { name: 'تلگرام', icon: 'mdi-telegram', href: '#' },
  { name: 'واتساپ', icon: 'mdi-whatsapp', href: '#' },
  { name: 'لینکدین', icon: 'mdi-linkedin', href: '#' },
]

const footerLinks = [
  { href: '#services', label: 'خدمات ما' },
  { href: '#doctors', label: 'پزشکان' },
  { href: '#about', label: 'درباره ما' },
  { href: '#contact', label: 'تماس با ما' },
]

function visible(key: string): string {
  return visibleSections.value[key] ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
}

function handleScroll() {
  scrolled.value = window.scrollY > 80
}

function handleSubmit() {
  const toast = useNuxtApp().$toast
  if (!form.value.name || !form.value.phone || !form.value.message) {
    toast?.error('لطفاً تمام فیلدهای ضروری را پر کنید.')
    return
  }
  toast?.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.')
  form.value = { name: '', phone: '', subject: '', message: '' }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.documentElement.style.setProperty('scroll-behavior', 'smooth')
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  observers.forEach(o => o.disconnect())
})
</script>

<style scoped>
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-25px);
  }
}

@keyframes float-delayed {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-18px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.ltr-field {
  direction: ltr !important;
  text-align: left !important;
}

input,
textarea {
  font-family: 'yekan-bakh', sans-serif !important;
}

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
