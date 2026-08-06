import { computed, onBeforeUnmount, onMounted, shallowRef } from "vue";

/**
 * Time-of-day background scheduler.
 *
 * Resolves the current "day phase" (morning / midday / night) from the
 * visitor's own clock and keeps it in sync while the page is open, so the
 * landing background video always matches the time of day.
 *
 * All consumers share one module-level instance, which means exactly one
 * boundary timer exists no matter how many components call the composable.
 * The phase is deliberately null during SSR: the server clock/timezone does
 * not match the visitor's, so the value is only ever computed in the browser.
 */

export type DayPhase = "morning" | "midday" | "night";

export interface TimeOfDaySlot {
  phase: DayPhase;
  label: string;
  /** Absolute URL of the video, served from the public directory. */
  src: string;
  /** Local hour (0-23) at which this phase begins, inclusive. */
  startHour: number;
  /** Local hour (0-23) at which this phase ends, exclusive. May wrap past 24. */
  endHour: number;
}

export const TIME_OF_DAY_SLOTS: TimeOfDaySlot[] = [
  {
    phase: "morning",
    label: "Morning",
    src: "/background-videos/clinic-morning-60fps.mp4",
    startHour: 6,
    endHour: 12,
  },
  {
    phase: "midday",
    label: "Midday",
    src: "/background-videos/clinic-midday-60fps.mp4",
    startHour: 12,
    endHour: 18,
  },
  {
    phase: "night",
    label: "Night",
    src: "/background-videos/clinic-night-60fps.mp4",
    startHour: 18,
    endHour: 6,
  },
];

export const DEFAULT_PHASE: DayPhase = TIME_OF_DAY_SLOTS[0].phase;

export function getPhaseConfig(phase: DayPhase): TimeOfDaySlot {
  return (
    TIME_OF_DAY_SLOTS.find((slot) => slot.phase === phase) ??
    TIME_OF_DAY_SLOTS[0]
  );
}

/**
 * Resolves which phase a date belongs to. Uses the machine's local time, so it
 * must only be evaluated in the browser where the visitor's clock and
 * timezone apply — never during SSR.
 */
export function resolveDayPhase(date: Date = new Date()): DayPhase {
  const hour = date.getHours();
  const match = TIME_OF_DAY_SLOTS.find((slot) => {
    if (slot.startHour < slot.endHour) {
      return hour >= slot.startHour && hour < slot.endHour;
    }
    return hour >= slot.startHour || hour < slot.endHour;
  });
  return match?.phase ?? DEFAULT_PHASE;
}

/* ------------------------------------------------------------------ */
/* Shared, client-only state                                           */
/* ------------------------------------------------------------------ */

const phase = shallowRef<DayPhase | null>(null);

let mountedCount = 0;
let initialized = false;
let boundaryTimer: ReturnType<typeof setTimeout> | null = null;

function msUntilNextBoundary(now: Date): number {
  const slot = getPhaseConfig(phase.value ?? DEFAULT_PHASE);
  const next = new Date(now);
  next.setHours(slot.endHour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function armBoundaryTimer() {
  if (boundaryTimer) clearTimeout(boundaryTimer);
  boundaryTimer = setTimeout(() => {
    const resolved = resolveDayPhase();
    if (resolved !== phase.value) phase.value = resolved;
    armBoundaryTimer();
  }, Math.min(msUntilNextBoundary(new Date()), 0x7fffffff));
}

function clearBoundaryTimer() {
  if (boundaryTimer) {
    clearTimeout(boundaryTimer);
    boundaryTimer = null;
  }
}

function init() {
  if (initialized) return;
  initialized = true;
  phase.value = resolveDayPhase();
  armBoundaryTimer();
}

function handleVisibilityChange() {
  if (document.visibilityState !== "visible") return;
  const resolved = resolveDayPhase();
  if (resolved !== phase.value) phase.value = resolved;
  armBoundaryTimer();
}

export function useTimeOfDayBackground() {
  const slot = computed(() =>
    phase.value ? getPhaseConfig(phase.value) : null
  );
  const src = computed(() => slot.value?.src ?? "");

  onMounted(() => {
    mountedCount += 1;
    if (mountedCount === 1) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      init();
    }
  });

  onBeforeUnmount(() => {
    mountedCount -= 1;
    if (mountedCount === 0) {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearBoundaryTimer();
      initialized = false;
    }
  });

  return { phase, slot, src };
}
