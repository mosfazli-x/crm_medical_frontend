<template>
  <div class="tod-bg" :class="bgClass" aria-hidden="true">
    <video
      v-for="layer in layers"
      :key="layer.key"
      :ref="(el) => bindVideo(layer.key, el)"
      class="tod-bg__video"
      :class="{ 'tod-bg__video--active': layer.active }"
      :src="layer.src"
      muted
      loop
      playsinline
      preload="auto"
      tabindex="-1"
      @playing="onVideoPlaying"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import type { DayPhase } from "../composables/useTimeOfDayBackground";

/**
 * Full-screen, time-of-day aware background player.
 *
 * Two stacked <video> elements ping-pong roles: the active one is visible and
 * playing, the dormant one silently buffers the next phase so the swap at a
 * day boundary is a seamless opacity crossfade instead of a reload. A single
 * shared drift transform is applied to the container, so both videos stay
 * perfectly aligned while crossfading.
 */

const { phase } = useTimeOfDayBackground();

interface VideoLayer {
  key: number;
  phase: DayPhase;
  src?: string;
  active: boolean;
}

const PHASE_ORDER: DayPhase[] = ["morning", "midday", "night"];
const FADE_MS = 1200;
const READY_TIMEOUT_MS = 8000;

let layerKey = 0;
let dormantPreparedForPhase: DayPhase | null = null;
let gestureFallbackReady = false;

const layers = ref<VideoLayer[]>([]);
const videoEls = new Map<number, HTMLVideoElement>();

const bgClass = computed(() =>
  phase.value ? `tod-bg--${phase.value}` : ""
);

function bindVideo(key: number, el: unknown) {
  if (el instanceof HTMLVideoElement) {
    videoEls.set(key, el);
  } else if (el === null) {
    videoEls.delete(key);
  }
}

function successorOf(dayPhase: DayPhase): DayPhase {
  const index = PHASE_ORDER.indexOf(dayPhase);
  return PHASE_ORDER[(index + 1) % PHASE_ORDER.length];
}

function createLayer(dayPhase: DayPhase): VideoLayer {
  return { key: layerKey++, phase: dayPhase, src: undefined, active: false };
}

function retarget(layer: VideoLayer, dayPhase: DayPhase) {
  layer.phase = dayPhase;
  layer.src = getPhaseConfig(dayPhase).src;
}

function playVideo(layer: VideoLayer) {
  const el = videoEls.get(layer.key);
  if (!el) return;
  const playPromise = el.play();
  if (playPromise) playPromise.catch(() => installGestureFallback());
}

function installGestureFallback() {
  if (gestureFallbackReady) return;
  gestureFallbackReady = true;
  window.addEventListener("pointerdown", tryPlay, { once: true });
}

function tryPlay() {
  const active = layers.value.find((layer) => layer.active);
  const el = active ? videoEls.get(active.key) : undefined;
  if (el && el.paused) el.play().catch(() => {});
}

/**
 * Resolves once the video for `layer` can paint a frame, with a timeout so a
 * slow connection can never stall the background swap.
 */
async function waitForReady(layer: VideoLayer): Promise<void> {
  await nextTick();
  const el = videoEls.get(layer.key);
  if (!el) return;
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      el.removeEventListener("loadeddata", finish);
      el.removeEventListener("error", finish);
      resolve();
    };
    const timeout = setTimeout(finish, READY_TIMEOUT_MS);
    el.addEventListener("loadeddata", finish, { once: true });
    el.addEventListener("error", finish, { once: true });
  });
}

function swapTo(target: VideoLayer) {
  const previous = layers.value.find((layer) => layer.active);
  if (!previous || previous === target) return;

  layers.value.forEach((layer) => {
    layer.active = layer === target;
  });

  playVideo(target);

  const previousEl = videoEls.get(previous.key);
  if (previousEl) {
    setTimeout(() => {
      if (!previousEl.paused) previousEl.pause();
    }, FADE_MS + 150);
  }

  prepDormant(successorOf(target.phase));
}

function prepDormant(nextPhase: DayPhase) {
  const dormant = layers.value.find((layer) => !layer.active);
  if (!dormant || dormant.phase === nextPhase) return;
  retarget(dormant, nextPhase);
}

/** Start preloading the next phase once the current one is actually playing. */
function onVideoPlaying() {
  const current = phase.value;
  if (!current || dormantPreparedForPhase === current) return;
  dormantPreparedForPhase = current;

  if (layers.value.length >= 2) return;
  const next = successorOf(current);
  const dormant = createLayer(next);
  dormant.src = getPhaseConfig(next).src;
  layers.value.push(dormant);
}

watch(
  phase,
  (newPhase) => {
    if (!newPhase) return;

    // First activation — nothing mounted yet.
    if (!layers.value.length) {
      const active = createLayer(newPhase);
      active.active = true;
      active.src = getPhaseConfig(newPhase).src;
      layers.value = [active];
      nextTick(() => playVideo(active));
      return;
    }

    const active = layers.value.find((layer) => layer.active);
    if (active && active.phase === newPhase) return;

    // The dormant layer already buffered this phase — swap instantly.
    const ready = layers.value.find(
      (layer) => layer.phase === newPhase && !layer.active
    );
    if (ready) {
      swapTo(ready);
      return;
    }

    const dormant = layers.value.find((layer) => !layer.active);
    if (dormant) {
      retarget(dormant, newPhase);
      waitForReady(dormant).then(() => {
        if (phase.value === newPhase && layers.value.includes(dormant)) {
          swapTo(dormant);
        }
      });
      return;
    }

    const layer = createLayer(newPhase);
    layers.value.push(layer);
    waitForReady(layer).then(() => {
      if (phase.value === newPhase && layers.value.includes(layer)) {
        swapTo(layer);
      }
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (gestureFallbackReady) {
    window.removeEventListener("pointerdown", tryPlay);
  }
});
</script>

<style scoped>
.tod-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  animation: tod-drift 46s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform;
}

.tod-bg__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s var(--ease-luxe, ease);
  will-change: opacity;
}

.tod-bg__video--active {
  opacity: 1;
}

@keyframes tod-drift {
  0% {
    transform: scale(1.08) translate(0);
  }
  50% {
    transform: scale(1.14) translate(-1.2%, -1%);
  }
  100% {
    transform: scale(1.08) translate(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tod-bg {
    animation: none;
    will-change: auto;
  }

  .tod-bg__video {
    transition: opacity 0.3s ease;
  }
}
</style>
