<template>
  <div ref="rootEl" class="curtain-loader" :class="{
    'is-opening': isOpening,
    'is-done': isDone,
  }" aria-hidden="true">
    <!-- Decorative top rail bar -->
    <span class="curtain-rail" />

    <!-- Curtain halves — DOM fabric panes opened with GSAP -->
    <div ref="halfLeftEl" class="curtain-half curtain-half--left">
      <img class="curtain-half__img" :src="FABRIC_URI" alt="" draggable="false">
      <span class="curtain-half__veil" aria-hidden="true"></span>
    </div>
    <div ref="halfRightEl" class="curtain-half curtain-half--right">
      <img class="curtain-half__img" :src="FABRIC_URI" alt="" draggable="false">
      <span class="curtain-half__veil" aria-hidden="true"></span>
    </div>

    <!-- Centre stage — logo only; wrapper pins it dead-centre -->
    <div class="curtain-stage-wrap">
      <div ref="stageEl" class="curtain-stage">
        <div ref="glowEl" class="curtain-glow" aria-hidden="true"></div>
        <svg class="curtain-logo" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <defs>
            <clipPath id="curtain-logo-fill-clip" clipPathUnits="objectBoundingBox">
              <rect ref="fillMaskRectEl" width="1" height="0" x="0" y="0" />
            </clipPath>
          </defs>
          <path :d="LOGO_PATH" class="curtain-logo__fill" clip-path="url(#curtain-logo-fill-clip)" pathLength="1" />
          <path ref="strokePathEl" :d="LOGO_PATH" class="curtain-logo__stroke" pathLength="1" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Landing page curtain reveal loader.
 *
 * The brand mark renders inline from `LOGO_PATH` (source asset:
 * `app/assets/images/logo_extracted.svg`). Its contour is drawn via
 * stroke-dashoffset, then the navy fill is swept in with a clip mask
 * before the curtain parts to reveal the page.
 *
 * ➤ TO SWAP THE LOGO: replace `LOGO_PATH` with your own
 *   SVG `<path d="..."/>` data, keep `viewBox` in sync, and update
 *   the source asset above.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

/* ── Timing constants (ms / s) ───────────────────────────────────────── */

const STAGE_IN_SECONDS = 1.6          // fade / focus-in of the stage
const LOGO_DRAW_SECONDS = 1.5         // stroke-contour draw duration
const DRAW_START_AT = 0.35            // when the draw starts on the timeline
const FILL_SWEEP_SECONDS = 0.7        // navy fill reveal
const FILL_START_AT = 1.5             // fill overlaps the draw's tail
const PAUSE_AFTER_DRAW_MS = 320       // brief hold after the mark settles
const CURTAIN_OPEN_SECONDS = 1.15     // curtain slide-out duration
const REDUCED_MOTION_FADE_MS = 400    // quick exit for reduced-motion users

/* ── Brand logo path — swap `LOGO_PATH` to change the mark ──────────── */

const LOGO_PATH = `M460.5,761c-2.1,0.3-4.3,0.4-4.6-0.4c-0.6-1.4,4.3-4.9,5.9-6c51.9-36.6,77.8-54.9,85.4-63.6
	c0,0,27.9-32.1,48.5-52.1c2.3-2.2,2.9-1.9,3-1.9c0.5,0.3,0.2,1.8,0,2.9c-4.3,10.3-11.1,24.1-21.5,38.9c-7.6,10.9-25.4,34-55.7,54.2
	C498.6,748.2,476.7,756.4,460.5,761z M500.6,744.8h-2 M535.6,724.8h-1 M575.6,592.3c-2.2,2.3-5.2,4.9-9,7.5c-4.5,3-8.7,4.8-12,6
	c-2.3,1-4.7,2-7,3c-2.7,1-5.3,2-8,3c-17.5,5-31.9,8.4-41.6,10.4c-42.1,9-62.5,8.8-84.6,24.9c-7.5,5.5-12.8,11.1-15.9,14.7
	c-2,2.1-3.9,3-4.5,2.5s-0.2-2.5,1.1-4.7c3.3-6.1,7.7-12.9,13.4-19.8c11-13.4,22.9-22.3,32-28c9.8-6.6,18.7-10.1,24.9-12
	c4.4-1.3,11.4-3.2,28.6-4.5c16.8-1.3,25.8-0.7,40.2-0.8C543.3,594.4,557.8,594,575.6,592.3z M580.6,548.8c-0.6-0.9-1.5-2.1-3-3
	c-2-1.3-4.1-1.3-6.1-1.3c-1.2,0-3,0-5.2,0.7c-1.2,0.4-2.4,1.2-4.6,2.6c-3.1,2-3.8,3-4,4c0,0.2-0.2,1,0.3,1.3c0.4,0.3,0.9,0,1.7-0.3
	c2-0.9,3.3-1.7,4-2c0.8-0.4,1.9-0.8,3.5-1c1-0.1,2.7,0,4.5,1c0.8,0.5,2.4,1.3,3,3c0.3,1.1,0.2,2,0,3c-0.7,2.9-2.4,5.1-4,7
	c-2.3,2.6-4.4,5-8,7c-3.8,2.1-6.1,3.4-9,3c-2-0.3-3.8-1.4-6-0.5c-1,0.4-1.6,1-2,1.5c3.7,2.1,7.1,2.8,9.2,3.1
	c1,0.1,12.3,1.5,18.8-5.1c0.8-0.9,2-2.2,4-5c2.5-3.5,3.8-5.3,4.1-6c0.6-1.3,2-4.9,0.9-9C582,550.8,581,549.3,580.6,548.8z
	 M502.6,518.8c-0.7,3.6,0.5,7.2,3.2,9.6c3,2.6,7.2,3.1,10.8,1.4c-1.5-0.2-5.5-0.8-9.2-4C504.4,523.2,503.1,520.3,502.6,518.8z
	 M601.6,500.8c1.9,3,3.9,6.1,5,10c0.2,0.7,0.6,2.3,1,4c0.5,2.3,0.9,4.3,1,5c0.7,4.2,0.3,8.4,0,12c-0.3,3.1-0.8,7.2-2,12
	c-1.1,4-3.1,9.8-7,16c-1.8,2.9-4.8,7.5-10,12c-7.4,6.4-15,8.8-19,10c-3.9,1.2-7.1,1.7-9,2c-19.8,2.9-42,6.2-64.3-3.7
	c-7.9-3.5-16.4-7.4-19.7-16.3c-2.7-7.2-0.9-14.3,0.4-17.9c1.6-4.4,2.4-6.1,2.2-10.1c-0.1-3-1-5.6,0.4-8.6c0.7-1.4,1.5-2.2,2.4-3
	c2.7-2.7,4.4-2.5,8.3-5.2c2.4-1.7,3.6-2.5,4.5-4c1.5-2.5,0.5-3.9,1.7-7.6c0.4-1.1,1.4-2.8,3.4-6.1c1.6-2.7,2.9-4.8,4.8-7.4
	c1-1.4,2.2-3,4-5c4.1-4.6,7.9-7.2,9-8c2.2-1.5,4.1-2.5,5-3c1.3-0.7,5.3-2.7,11-4c7.7-1.8,14-1.4,19-1c1.9,0.1,4.5,0.3,8,1
	c5.9,1.1,10.5,2.9,13,4c11.1,4.8,17.9,11.7,20,14C598.2,495.6,600.4,498.9,601.6,500.8z M290.4,685.1c1.6,3.5,3.1,6.9,4.7,10.3
	c-8.1,0.7-16.5,1.2-25.4,1.4c-7.4,0.2-14.5,0.2-21.3,0.1c0-1.1-0.2-6.3-0.5-12.7c0,0-10-225.1,0.3-305.7c0.1-0.9,0.4-3.4,2.3-4.8
	c1.5-1.2,3.4-1,6.7-0.8c0.1,0,7,0.5,10.1,0.8c7.7,1,15.3,2,23,3c0.2,0,1.7,0.5,2.2,2c0.3,0.9,0.1,1.7,0,2c-1.5,5.3-7,25.1-10,43
	c-1.2,6.9-1.7,10.4-2,14c-0.5,7.2-0.1,11-1.6,17.4c-0.9,3.8-2,6.8-2.9,8.8c-5.8,12.9-17.1,47.6-20.6,64.2
	c-2.8,13.1-4.1,32.3,3.4,57.9C265.4,617.9,275.4,651.3,290.4,685.1z M487.6,363.8c-0.5,0.1-0.9,0.6-1,1c-0.2,1.1,1.9,2.2,3,3
	c4.4,3,3.6,6.2,9.7,13.4c1.1,1.3,2.1,2.3,2.8,3.1c2,1.4,3.4,2.7,4.4,3.7c2.3,2.2,3.2,3.6,4.6,3.5c1.1-0.1,1.9-0.9,2.4-1.7
	c1.1-2-0.9-3.3-0.3-5.8c0.7-3.3,5.4-6.6,6.3-7.2c0.2-0.1,0.9-0.6,1.2-1.4c0-0.1,0.3-1-0.2-1.6c-0.4-0.4-1.3-0.5-2,0
	c-0.5,0.6-6.8,8.3-11,7c-0.8-0.2-2.5-1.1-4-2c0,0-1.6-0.9-3-2C495.1,372.7,490.4,363,487.6,363.8z M823.8,374.3
	c0.5-2.2,1.8-6.3,5.2-10.3c3.9-4.7,8.4-6.7,10.6-7.5c-26,0.1-51.9,0.3-77.9,0.4c2.9,1.5,6.9,4.1,10.9,8.4c3.1,3.3,5.1,6.6,6.4,9.1
	c0.3,44.8,0.5,89.7,0.8,134.5c-0.7,0.7-1.3,1.3-2,2h-93l-2-2c0.1-43.9,0.2-87.8,0.2-131.6c0.3-2.4,1.5-8,6-13.3
	c4.4-5.2,9.5-7.3,11.8-8.1c-26.7,0-53.3,0-80,0c2.6,1,8.2,3.5,12.8,9.4c3.5,4.5,4.8,9,5.4,11.6c0.3,104.3,0.6,208.7,0.9,313
	c-0.4,3.2-1.4,8.6-4.6,14.3c-3.3,6-7.5,9.7-10,11.7c23.9-0.4,47.9-0.7,71.8-1.1c-2.1-1-7.3-3.8-10.9-10c-2.6-4.5-3.2-8.7-3.3-11
	v-160c0.6-0.6,1.2-1.2,1.9-1.8c31-0.1,62.1-0.1,93.1-0.2l2,2c0,52.3,0,104.7,0,157c-0.4,2.7-1.6,8.2-5.7,13.7
	c-5.1,6.8-11.7,9.4-14.3,10.3c27-0.1,54-0.2,81-0.3c-2.3-0.9-7.5-3.4-11.7-9.2c-4.6-6.4-5-12.9-5-15.3c0.3-105,0.3-210-0.1-210c-0.3-105.2-0.3-105.2-0.3-106.2z M495.6,349.8c-0.2,0.3-0.1,0.7,0,1c0.5,1,2.5,0.9,4.3,0.8c1.7,0,4.1,0,7.1,0.4c2.6,0.7,5.2,1.4,7.7,2.1
	c4.9,2.4,7.5,4.3,8.9,5.6c1,0.9,2.1,1.7,3.1,2.7c1.3,1.4,1.9,2.2,2.9,2.3c0.8,0,1.6-0.4,2-1c0.1-0.2,0.7-1.1,0-3
	c-1.9-5.6-9.9-8.6-11-9c-1.4-0.5-3-1-3-1c-0.7-0.2-2-0.6-4-1c-2.8-0.6-4.2-0.9-6-1c-3-0.2-2.6,0.4-6.6,0.4
	C498.1,349.1,496.1,348.8,495.6,349.8z M566.1,305.7c0.7,0.4-0.5,2.4-1.5,8.1c-0.6,3.3-0.3,3.7-1,9c-0.4,2.6-0.7,4.6-1,6
	c-1.1,5.7-2,10.4-4,16c-1.3,3.5-3.1,8.5-7,14c-2.3,3.3-2.8,3.1-7.1,8.8c-3.7,4.8-5.5,7.2-6.9,10.2c-2,4.4-2.5,8.2-3,12
	c-0.4,2.9-1,7.8,0,14c0.4,2.4,0.6,2.6,1.2,6.3c1.1,7.1,0.7,9.1-0.2,10.7c-0.9,1.6-2.2,2.4-3,3c-3.7,2.5-7.7,2-10.7,1.6
	c0,0-4.8-0.6-6.3-2.6c-0.5-0.7-0.8-1.2-0.8-1.2c-0.3-0.6-0.3-0.8-0.7-1.6c-0.4-0.8-0.5-1.1-0.7-1.1c-0.4,0-1,1.2-1,2.5
	c0,1,0.4,1.7,0.8,2.6c1.1,2.1,2,2.4,2.4,3.9c0.2,0.9,0.1,1.7,0,2c-0.1,0.6-0.6,2.1-5,5c-2.7,1.7-4,2.6-6,3c-1,0.2-2.9,0.6-5,0
	c-2.6-0.7-2.8-2-6-3c-1.4-0.4-3.7-0.7-4,0c-0.3,0.7,1.2,2.3,3,3c1.6,0.7,2,0,4.1,0.5c0.5,0.1,4.4,1.1,4.9,3.5c0.1,0.4,0,0.7,0,1
	c-0.3,2.1-2.3,3.5-3,4c-2,1.4-2.7,0.9-5,2c0,0-2.9,1.4-5,4c-1.7,2.1-1.4,3.1-3,7c-1.7,4-3.3,7.9-7,10c-2.2,1.3-4.4,1.4-5.2,1.4
	c-0.8,0-2.8,0.1-8.8-2.4c-2.3-1-4.8-2-8-4c-2.3-1.4-4.5-3-8-6c-2.8-2.4-7.6-6.8-14-14c-4.5-5.1-6.8-7.7-9-11
	c-2.5-3.7-10.9-17.1-12-20c-0.1-0.2-0.4-1.1-0.7-1c-0.2,0-0.3,0.7-0.3,1c-0.3,3.1,0,5,0,5c0.5,2.8,1.3,5.2,2,7c0.8,2.2,1.5,3.9,2,5
	c2.9,6.4,4.7,10.3,7.7,13.3c1.2,1.2,2.3,2.2,2.3,3.7c0,1.4-1,2.4-3.1,4.6c-1.2,1.2-2.9,3.1-4.9,5.4c-1.6,2.4-3.5,5.7-5,10
	c-0.4,1.2-1.4,4.2-2,8c-1.2,7.6-0.1,14.3,1.1,19c3.3,6.6,11.2,21.9,14.6,24.3c0.5,0.3,1.7,1.2,2.3,0.8c0.6-0.4,0.5-1.8,0-2.9
	c-0.8-1.6-2.4-1.6-3-3.1c-0.3-0.8-0.1-1.5,0-2l2-1c2.6,1.9,5.4,4.6,8,8c2.5,3.4,3.7,6.2,4,7c0.4,0.9,0.7,1.8,1,3c0.5,2,1.2,4.9,0,8
	c-0.3,0.8-1.3,3.4-4,5c-2.4,1.4-4.9,1.2-7.7,1c-3-0.2-5.3-1-5.9-1.2c-12.5-4.3-20.1-10-20.1-10c-18.9-14.3-47.8-38.1-47.8-38.1
	s-11.9-9.8-27.4-17.7c-3.5-1.8-7-3-7-3c-1.8-0.8-3.8-1.6-6.1-2.2c-3.7-1.1-7.1-1.6-9.9-1.8c-0.9,0-1.6-0.6-1.7-1.3
	c-0.1-0.8,0.6-1.8,1.7-1.7c6.2-0.4,8.3-1.7,9-3c0.2-0.4,0.8-1.5,2-2c1-0.4,1.9,0,2,0c11.9,3.4,36-32.8,36-32.8
	c8.1-12.2,21.7-22.5,49-43.2c0,0,51.9-38.9,94.7-46.5c3.9-0.7,18.1-3,35.3-10.5c6.1-2.6,10.9-5.2,14-7c1.1-0.6,2.4-1.4,3.9-2.5
	C560.8,311.7,564.9,304.9,566.1,305.7z M399.4,250.3c0.2-0.4,0.9-1.7,0.6-2c-0.3-0.2-1.2,0.4-2.4,1.5c-4.2,3.7-8.3,7.3-12.5,11
	c-3.4,3.8-8.2,9.3-13.5,16c-1.1,1.4-15.3,19.1-25,36c-17.4,30.5-14.6,44.2-35.9,94.7c-3.1,7.4-5.8,13.3-7.4,16.9
	c-2.2,4.2-4.4,8.3-6.7,12.5c-1.2,1.8-2.5,2.8-3,2.6c-0.5-0.3-0.4-1.8,0.3-3.7c1.1-5.9,2.4-11.9,3.7-17.9c6.4-29.3,14.3-56.6,22.9-82
	c1.7-3.3,3.4-6.7,5.1-10c2.9-6.5,7.1-15.1,13-25c0.9-1.5,2.7-4.5,5-8c0,0,14.6-22.1,38-43c2.3-2.1,4.7-3.7,7-6
	c3.2-3.2,7.5-6.8,13-10c2.8-1.7,5.5-3,8-4c0.9-0.5,2.3-1.2,4-2c18.7-8.6,36.4-6.8,48.2-5.4c25.7,3,44.5,13.1,52.4,17.8
	c19.6,11.7,47.3,35.1,42.4,48.6c-0.7,2-3,4.1-7.6,8.1c-5.8,5.1-13.2,11.5-25.4,17.3c-22.6,10.9-50.1,14.4-78,25.6
	c-5.5,2.2-40,16.4-69.3,45.3c-13.5,13.3-20.2,20-27.7,30.5c-6.5,9.1-14.1,17.4-21,26.2c-3.8,4.8-10.1,12.9-17,12
	c-1.3-0.2-2.3-0.6-3-1c2.5-2.4,6.3-6.1,10.5-11c10-11.5,14.2-19.7,22.3-31.8c6-9,10.9-14.9,18.4-24.3c13.5-16.8,20.2-25.2,28.3-31.6
	c10-7.9,19.3-11.8,37.5-19.1c8.2-3.3,20.8-8.1,44-15.1c0,0,58.7-17.8,71.1-33.8c0.3-0.4,1.2-1.6,0.9-2.2c-0.3-0.5-1.5-0.4-3,0
	c-4.2,1.1-10.9,4.4-15.3,6.6c-37.4,14.9-59.5,23.2-73.2,28.1c-24.8,8.9-23.8,7.5-31.1,11.3c-10.1,5.2-20.9,12.3-24.5,9
	c-0.7-0.6-0.9-1.4-1-2c-1.3-5.6,6.4-11.1,22.9-25.6c6.5-5.6,4.5-4.1,9.1-8c6.4-5.5,15.5-13.9,28.1-22.4c10.4-7,21.1-13.9,32.1-20.8
	c1.4-0.9,3.2-1.9,6.6-4.1c3-1.9,3.8-2.5,3.7-2.7c-0.2-0.5-5.3,1.2-6.4,1.6c-19,6.6-37,18.4-37,18.4c-12.4,7.5-22.8,15.2-31.3,22.3
	c-12.6,10.5-29,23.2-45.8,43.3c-12.3,14.7-25.5,30.4-34.7,51.5c0,0-6.5,14.9-18.8,31.7c-2.8,3.8-8.6,11.8-10.2,10.9
	c-1.7-0.9,2.2-11,3.5-14.5C329.7,378.1,398.5,251.9,399.4,250.3z M332.6,374.8l2-3 M264.6,538c-0.1-15,3.3-25.9,4-28.2
	c3.7-11.3,9.1-19.8,13-25c0.8-0.8,2-2,3.7-3.2c0.9-0.7,3.2-2.2,6.3-3.3c4.6-1.7,8.5-1.6,11-1.5c1.1,0,3.9,0.2,7.8,1.1
	c8,1.9,13.9,5.6,22.2,10.9c2.6,1.7,4.7,3.1,6,4c11,7.9,19.6,14.7,25,19c9.7,7.8,42.9,35,60,39c2,0.5,7.1,1.7,13,0
	c1.6-0.4,4.8-1.4,8-4c5.2-4.3,5.5-9.1,8-9c2.1,0.1,3.7,3.3,5,6c0.8,1.7,1.4,3.4,2.4,6.8c1.2,3.9,1.7,6.2,2.6,6.2c0.1,0,0.5,0,1-1
	c1.6-3.1-0.1-7.6-0.5-8.6c-4.8-12-7.5-16.4-7.5-16.4c-4.8-7.8-7.2-11.6-11-16c-5.8-6.6-9.1-8.3-16-17c-2.9-3.7-4.1-5.6-5-8
	c-2.6-6.9-1.2-13.2-0.8-15.1c0.5-2.2,2.5-10.6,9.8-14.9c0.8-0.5,1.5-0.8,2-1h2c3.8,4,7.3,7,10,9c3.5,2.7,8.1,6.1,14.9,8.7
	c3.9,1.5,6.9,2.1,9.1,2.3c2.3,0.3,5.1,0.6,8.4-0.3c2.1-0.5,3.7-1.3,4.9-2c2.8-2,4.5-4.1,5.5-5.5c1.6-2.3,2.4-4.4,3.2-6.5
	c1-2.7,1.6-5,2-6.8c0.5-0.9,1.4-2.3,2.9-3.9c3.3-3.6,5.3-3.3,9.1-7.1c2.2-2.2,2.2-2.9,4-4c2.1-1.3,3.3-1.1,4.9-2.6
	c1.2-1.1,1.8-2.5,2.1-3.4c0.5-0.4,1.3-1,2-2c1.2-1.9,0.8-3.2,2-4c0.9-0.6,2.2-0.5,3,0c0.6,0.3,0.8,0.7,1,1c1.9,2.2,8.4-0.4,9.1-0.7
	c1.6-0.6,3.8-1.7,6.2-3.6c0.6-1.2,1.5-3.2,2-5.7c0.4-2.4,0.4-4.5-0.3-10.6c-0.5-4-0.7-5.7-1-7.5c-0.7-5.5-1.4-11.2-0.3-16.9
	c0.6-3,2.1-7.8,6.3-13.1c3-3.5,5.6-6.5,7.4-8.6c4.5-5.2,5.6-6.5,7.1-8.7c2.3-3.7,3.6-7.2,4.4-10.1c0.9-2.1,2.2-5.3,4-9.3
	c1.9-4.4,2.4-5.3,3.1-7.1c1.2-3.6,1.6-6.4,2.1-11.8c0.8-7.4,1.3-12.6,1.6-15.6c0-2.7-0.4-6.4-2.7-9.7c-1.4-2-2.7-2.9-4-4
	c-4.9-4.3-6.2-9.9-7.3-13c-5.6-15.6-28.5-34.4-31.7-37c-3.6-3-9.8-8-19-13c-11.7-6.4-22.4-9.5-29.9-11.2c-11.3-3.1-20.9-4.3-28-4.8
	c-5-0.4-10.6-0.7-18.1,0c-2,0.2-11.2,1.1-23,5c-3.7,1.2-12,4.2-22,10c-19.2,11.1-31.3,24.9-39.3,34.2c-7.5,8.7-17,21.3-25.8,38
	c-6.8,13.6-12,24.8-15.4,32.3c-7.4,16.4-10,23.4-17.5,27.4c-6.6,3.5-13.1,2.6-22.3,1.2c-47.2-7.2-75.2-13.9-87.7-2.2
	c-0.2,0.2-0.6,0.5-1,1c-0.1,0.1-0.5,1.1,0,2c0.3,0.6,0.8,0.9,1,1c2.2,1,3.9,1.1,5,1c0.7-0.1,1.2-0.2,2,0c1.5,0.3,2.4,1.3,3,2
	c3.5,3.7,3.3,2.7,5,5c0.9,1.2,2.8,4,4,8c0.8,2.9,1,5.2,1,6c0.6,11.9,4.3,137.8,5,155.9c0,0,4.9,130.8-4,154.8
	c-2.2,6-6.1,10.7-6.1,10.7c-5.5,6.6-12.3,9.9-16.9,11.6c24.5-0.4,49.1-0.9,73.6-1.4c16.8-0.3,33.7-0.7,50.5-1.1
	c11.7,14.1,23.3,27.5,34.9,40.8c5.8,6.6,12.9,14.6,25,20.7c5.6,2.8,10.5,4.4,14,5.3c22.9,2.2,77.5,4.3,132.7-27.3
	c33.8-19.4,55.5-44.3,67.1-60c8.4-11.4,19.5-38,41.8-91.2c2.9-7,7.9-19.8,9.2-37.2c0.2-2.6,0.4-9.8-0.6-19.1
	c-1.2-10.7-4.7-28.2-16.2-46.2c-5.5-8.7-11.6-15.3-16.9-20.3c-6.4-4.8-16.9-11.2-31-14.1c-4.1-0.8-11.9-2.3-22-1
	c-3.9,0.5-13.6,2.1-24.2,8.3c-4.7,2.8-8.3,5.7-10.8,7.9c-4.8,4.9-8.2,9.5-10.5,13c-3.3,5.1-4.9,8.7-5.9,11.5
	c-0.2,0.6-0.4,1.2-0.5,1.5c0.2,1.4,0.3,4.2-1.3,6.9c-1.2,2-2.8,3.1-4,4c-0.7,0.5-1.3,0.8-1.8,1.1c-2.2,1.1-3.4,1.5-4.2,1.9
	c-3.1,1.5-4.2,5.4-4.5,6.5c-0.1,0.3-1.3,4.8-0.2,8.8c0.2,0.5,0.5,1.7,0.2,3.1c-0.3,1.2-0.9,1.6-1.5,2.5c-0.9,1.4-0.6,2.4-1.3,6.8
	c-0.4,2.4-0.7,4.5-0.7,5.2c-0.9,9.5,1.4,15.4,3.9,19c4.2,6.1,11.1,9.3,10.2,11.7c-0.5,1.2-2.7,1.6-4.6,1.6
	c-11.3,1.6-20.2,4.3-26.5,6.6c-8.1,3-14.5,6.2-20,9c-5.1,2.6-7.7,4.2-9,5c-6.8,4.2-11.4,8.3-12.9,9.6c-5,4.5-8.5,8.7-10.4,11.1
	c-9.1,11.6-12.8,22.5-14.1,26.5c-0.7,2.3-1.2,4.2-1.5,5.5c-0.1,6.5-2.9,10.7-5.2,10.7c-1.9,0-3.9-2.8-5-6.5
	c-4.8-25.9-11.8-46.7-17.7-61.5c-12.4-31.3-22.5-42.2-31.6-49.1c-5.4-4.1-10.3-6.7-13.8-8.3c1.8,2.1,4.6,5.4,7.8,9.6
	c16,21.4,21.5,40.1,34.6,79.5c3,9,8,24,14.5,42.9c3.9,7.8,7.8,15.6,11.8,23.3c-1.4,1-2.9,2.1-4.3,3.1c-4,5.5-8,11.8-6.4,13.5
	c1.9,2,9.7-4.6,21.2-9.6c19.8-8.7,40.4-8.6,67.3-7.9c4,0.1,8.6,0,13.5-0.5c11.2-1.3,20.3-4.4,27-7.4c4-1.9,8-3.7,12-5.6
	c3.3-2,6.6-4.1,9.9-6.1c4.4-2.7,8.8-5.3,13.1-7.9c2-1.7,4-3.3,6-5c2.5-2.3,5.2-4.9,8-8c2.7-3.1,5.1-6,7-8.8c-3.1,2.5-6.3,5-9.5,7.4
	c-5.9,4.5-11.8,8.8-17.6,12.9c-3.1,2.3-7.7,5.4-13.7,8.1c-1.7,0.8-4.9,2.2-11.9,4.2c-5.8,1.7-15.5,4.6-28.8,6.3
	c-5.9,0.8-10.3,1-19.1,1.5c-9.5,0.5-9.8,0.2-18.3,0.7c-11,0.6-13.1,1.3-22.1,1.6c-17.3,0.5-19.4-1.7-20.2-2.9c-2.1-3.4,0.3-8.5,2-12
	c0.9-1.8,2.9-5.4,12.2-13.3c3.7-3.2,7.1-6,11.7-9c9.6-6.2,19.4-9.6,31.7-12.6c14.4-3.5,21.3-3.9,35.3-6.1c16-2.5,37.8-6.1,62.4-15.9
	c16-6.4,25.2-12.2,32.6-18.1c8.2-6.7,13.4-13,15-15c2.2-2.8,11.1-14.3,17-32c1.5-4.5,2.4-8.4,3-11c0.8,1.4,1.9,3.5,2.9,6.3
	c7.2,21.1-6.7,44.2-18.5,61c-43.9,62.6-102.2,105.9-102.2,105.9c-8.3,10-44.8,52-97.5,50.7c-14.5-0.4-25.3-3.9-29-5.2
	c-43-15.2-61.5-59-87.1-119.8C287.6,641.4,264.9,587.7,264.6,538z`

/* ── Fabric texture (inline SVG data-URI stretched across the halves) ── */

const FABRIC_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg viewBox="0 0 200 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"   stop-color="#0f151c"/>
          <stop offset=".35" stop-color="#181f2b"/>
          <stop offset=".65" stop-color="#1b222e"/>
<stop offset="1"   stop-color="#0f151c"/>
        </linearGradient>
        <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity=".38"/>
          <stop offset=".5" stop-color="#000" stop-opacity=".12"/>
          <stop offset="1" stop-color="#000" stop-opacity=".38"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#b)"/>
      <rect width="100%" height="100%" fill="url(#h)" opacity=".75"/>
    </svg>`,
  )

/* ── Template refs ────────────────────────────────────────────────────── */

const emit = defineEmits<{ (e: 'finished'): void }>()

const rootEl = ref<HTMLElement>()
const halfLeftEl = ref<HTMLElement>()
const halfRightEl = ref<HTMLElement>()
const stageEl = ref<HTMLElement>()
const strokePathEl = ref<SVGPathElement>()
const fillMaskRectEl = ref<SVGRectElement>()
const glowEl = ref<HTMLElement>()

/* ── Reactive state ───────────────────────────────────────────────────── */

const isOpening = ref(false)
const isDone = ref(false)
const prefersReducedMotion = ref(false)

/* ── Curtain open progress (proxy swept by GSAP, not reactive) ───────── */

const curtain = { progress: 0 }

/* ── Helpers ──────────────────────────────────────────────────────────── */

function applyCurtainPose(p: number) {
  const sx = 1 - p * 0.45
  const sy = 1 - p * 0.12
  const dist = window.innerWidth * 0.6
  if (halfLeftEl.value) {
    halfLeftEl.value.style.transform = `translate3d(${-p * dist}px, 0, 0) scale(${sx}, ${sy})`
  }
  if (halfRightEl.value) {
    halfRightEl.value.style.transform = `translate3d(${p * dist}px, 0, 0) scale(${sx}, ${sy})`
  }
}

/* ── Lifecycle ────────────────────────────────────────────────────────── */

onMounted(() => {
  prefersReducedMotion.value =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  const stage = stageEl.value
  const stroke = strokePathEl.value
  const fillRect = fillMaskRectEl.value
  const glow = glowEl.value
  if (!stage || !stroke || !fillRect || !glow) return

  /* -- 1. Logo appearance --------------------------------------------- */

  if (!prefersReducedMotion.value) {
    const drawLength = stroke.getTotalLength()
    gsap.set(stroke, { strokeDasharray: drawLength, strokeDashoffset: drawLength })
    const tl = gsap.timeline()

    // Whole stage fades from dim/blurry to sharp
    tl.fromTo(
      stage,
      { opacity: 0.12, filter: 'blur(18px)', scale: 0.96 },
      { opacity: 1, filter: 'blur(0px)', scale: 1, duration: STAGE_IN_SECONDS, ease: 'power3.out' },
      0,
    )

    // Contour draws along the mark's edge (stroke-dash)
    tl.to(
      stroke,
      { strokeDashoffset: 0, duration: LOGO_DRAW_SECONDS, ease: 'power2.inOut' },
      DRAW_START_AT,
    )

    // Brand-navy ink sweeps in bottom-up as the contour closes
    tl.fromTo(
      fillRect,
      { attr: { y: 1, height: 0 } },
      { attr: { y: 0, height: 1 }, duration: FILL_SWEEP_SECONDS, ease: 'power2.inOut' },
      FILL_START_AT,
    )

    // Stage light breathes in behind the completed mark
    tl.fromTo(
      glow,
      { opacity: 0 },
      { opacity: 1, duration: 0.9, ease: 'sine.out' },
      FILL_START_AT + 0.1,
    )

    // Soften the contour into a fine rim now the fill carries the mark
    tl.to(
      stroke,
      { strokeWidth: 2.4, strokeOpacity: 0.45, duration: 0.5, ease: 'power2.inOut' },
      FILL_START_AT + 0.15,
    )

    tl.eventCallback('onComplete', () => setTimeout(openCurtain, PAUSE_AFTER_DRAW_MS))
  } else {
    // Reduced motion — show the finished emblem instantly, then skip ahead
    gsap.set(stage, { opacity: 1, filter: 'none', scale: 1 })
    gsap.set(fillRect, { attr: { y: 0, height: 1 } })
    gsap.set(stroke, { strokeDashoffset: 0, strokeWidth: 2.4, strokeOpacity: 0.45 })
    setTimeout(openCurtain, REDUCED_MOTION_FADE_MS)
  }
})

onBeforeUnmount(() => {
  gsap.killTweensOf(curtain)
})

/* ── Curtain open ─────────────────────────────────────────────────────── */

function openCurtain() {
  if (isOpening.value || isDone.value) return
  isOpening.value = true

  if (prefersReducedMotion.value) {
    finishOverlay()
    return
  }

  const stage = stageEl.value
  const stroke = strokePathEl.value
  const glow = glowEl.value
  if (!stage || !stroke || !glow) {
    finishOverlay()
    return
  }

  const exitTl = gsap.timeline({ ease: 'power2.in' })

  // Rim dissolves first, the stage light dims…
  exitTl.to(stroke, { strokeOpacity: 0, duration: 0.45 }, 0)
  exitTl.to(glow, { opacity: 0, duration: 0.4 }, 0)

  // …then the mark blooms, lifts and dissolves while the curtain parts
  exitTl.to(
    stage,
    {
      y: -110,
      scale: 1.07,
      opacity: 0,
      filter: 'blur(14px)',
      duration: CURTAIN_OPEN_SECONDS,
    },
    0.05,
  )

  applyCurtainPose(0)
  gsap.to(curtain, {
    progress: 1,
    duration: CURTAIN_OPEN_SECONDS,
    ease: 'power4.inOut',
    onUpdate: () => applyCurtainPose(curtain.progress),
    onComplete: finishOverlay,
  })
}

function finishOverlay() {
  isDone.value = true
  emit('finished')
}
</script>

<style scoped>
/* ── Root overlay ─────────────────────────────────────────────────────── */

.curtain-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: auto;
  background: #0f151c;
  transition: opacity 0.55s ease 0.25s, visibility 0 0.85s;
}

.curtain-loader.is-done {
  opacity: 0.2;
  visibility: hidden;
  pointer-events: none;
}

/* ── Top rail ─────────────────────────────────────────────────────────── */

.curtain-rail {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 14;
  background: linear-gradient(90deg,
      #246ac0,
      #1f4d9c 30%,
      #153a7a 70%,
      #103768);
  opacity: 0.45;
  transition: opacity 0.5s ease 0.1s;
}

.is-opening .curtain-rail,
.is-done .curtain-rail {
  opacity: 0;
}

/* ── Curtain halves ───────────────────────────────────────────────────── */

.curtain-half {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 50vw;
  overflow: hidden;
  will-change: transform;
  z-index: 8;
}

.curtain-half--left {
  left: 0;
}

.curtain-half--right {
  right: 0;
}

.curtain-half__img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  object-fit: cover;
}

/* Vertical folds + shading that give the fabric its drape (fades on open) */
.curtain-half__veil {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.5s ease 0.15s;
}

.curtain-loader.is-opening .curtain-half__veil {
  opacity: 0;
}

/* ── Centre stage ─────────────────────────────────────────────────────── */

/* Pinned wrapper — always centres the logo, independent of any transform */
.curtain-stage-wrap {
  position: absolute;
  inset: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.curtain-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, opacity, filter;
}

.curtain-logo {
  width: clamp(14rem, 44vw, 22rem);
  height: auto;
  filter: drop-shadow(0 0 18px rgba(205, 180, 219, 0.18));
}

.curtain-logo__fill {
  fill: #21C0C7;
  fill-rule: evenodd;
  clip-rule: evenodd;
}

.curtain-logo__stroke {
  fill: none;
  stroke: #21C0C7;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  /* Hidden by default; GSAP draws it in using the real path length (px) */
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

/* ── Reduced motion ───────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {

  .curtain-half,
  .curtain-stage,
  .curtain-rail,
  .curtain-loader {
    transition-duration: 0.15s !important;
    transition-delay: 0s !important;
  }

  .curtain-logo {
    filter: none !important;
  }
}
</style>
