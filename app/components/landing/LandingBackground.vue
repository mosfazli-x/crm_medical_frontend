<template>
  <div ref="holderRef" class="absolute inset-0 pointer-events-none">
    <canvas ref="canvasRef" class="fixed block w-full h-full opacity-15" />
    <slot lass="block w-full h-full z-99 h-screen w-screen flex justify-center align-middle items-center" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const holderRef = ref(null);
const canvasRef = ref(null);

let animationInstance = null;

const fpsMeter = useFpsMeter();

onMounted(() => {
  if (!holderRef.value || !canvasRef.value) return;

  animationInstance = new WavesAnimation(holderRef.value, canvasRef.value, {
    fpsMeter,
  });
  animationInstance.start();
});

onBeforeUnmount(() => {
  if (animationInstance) {
    animationInstance.destroy();
    animationInstance = null;
  }
});

const TAU = Math.PI * 2;

const defaults = {
  resize: true,
  rotation: 45,
  waves: 3,
  width: 160,
  hue: [11, 24],
  amplitude: 0.5,
  background: true,
  preload: true,
  speed: [0.0035, 0.0075],
  debug: false,
  // Perf knobs (new). Set either to Infinity to fully match the old
  // uncapped/unscaled behavior if you want to verify parity.
  maxScale: 2, // caps devicePixelRatio; this layer renders at 15% opacity so extra density is wasted
  targetFps: 60, // caps the render rate so 90/120/144Hz screens don't do 1.5-2.4x the work for no visible gain
};

class WavesAnimation {
  constructor(holder, canvas, options = {}) {
    this.holder = holder;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    const { fpsMeter, ...rest } = options;
    this.options = { ...defaults, ...rest };
    this.rotationRad = degToRad(this.options.rotation);

    this.waves = [];
    this.frameId = null;
    this.scale = 1;

    this.fpsMeter = fpsMeter ?? null;

    this.hue = this.options.hue[0];
    this.hueForward = true;

    this.backgroundTop = "#080015";

    this.resizeScheduled = false;
    this.lastFrameTime = 0;

    this.resize = this.resize.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);

    // Size the canvas (radius/center) BEFORE creating/preloading waves, so
    // preloaded lines cache correct geometry instead of stale zeroes.
    this.resize();
    this.init(this.options.preload);

    if (this.options.resize) {
      window.addEventListener("resize", this.handleResize, { passive: true });
    }
  }

  init(preload) {
    this.waves = [];

    for (let i = 0; i < this.options.waves; i += 1) {
      this.waves.push(new Wave(this));
    }

    if (preload) {
      this.preload();
    }
  }

  preload() {
    for (let i = 0; i < this.options.waves; i += 1) {
      this.updateColor();
      for (let j = 0; j < this.options.width; j += 1) {
        this.waves[i].update();
      }
    }
  }

  start() {
    if (this.frameId) return;
    this.fpsMeter?.start();
    this.lastFrameTime = 0;
    this.frameId = window.requestAnimationFrame(this.loop);
  }

  loop(timestamp) {
    this.frameId = window.requestAnimationFrame(this.loop);

    const { targetFps } = this.options;
    if (Number.isFinite(targetFps) && targetFps > 0) {
      const interval = 1000 / targetFps;
      const elapsed = timestamp - this.lastFrameTime;
      if (elapsed < interval) return;
      this.lastFrameTime = timestamp - (elapsed % interval);
    }

    this.render();
    this.fpsMeter?.tick();
  }

  render() {
    this.updateColor();
    this.clear();

    if (this.options.background) {
      this.background();
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    this.waves.forEach((wave) => {
      wave.update();
      wave.draw();
    });

    this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  background() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.backgroundTop);
    gradient.addColorStop(1, this.color);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  handleResize() {
    // Coalesce rapid resize events (e.g. dragging a window edge) to at most
    // one recalculation per animation frame instead of one per event.
    if (this.resizeScheduled) return;
    this.resizeScheduled = true;
    window.requestAnimationFrame(() => {
      this.resizeScheduled = false;
      this.resize();
    });
  }

  resize() {
    const width = this.holder.offsetWidth || window.innerWidth;
    const height = this.holder.offsetHeight || window.innerHeight;
    this.scale = Math.min(window.devicePixelRatio || 1, this.options.maxScale);

    this.width = width * this.scale;
    this.height = height * this.scale;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.radius = Math.sqrt(this.width ** 2 + this.height ** 2) / 2;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 1.6;

    this.recomputeLines();
  }

  // Repositions already-buffered lines after a resize. Only runs on
  // resize (rare), not every frame, so it's essentially free overall.
  recomputeLines() {
    if (!this.waves.length) return;

    this.waves.forEach((wave) => {
      wave.lines.forEach((line) => {
        Object.assign(line, computeLineGeometry(this, line.angle, line.color));
      });
    });
  }

  updateColor() {
    this.hue += this.hueForward ? 0.01 : -0.01;

    if (this.hue > this.options.hue[1] && this.hueForward) {
      this.hue = this.options.hue[1];
      this.hueForward = false;
    } else if (this.hue < this.options.hue[0] && !this.hueForward) {
      this.hue = this.options.hue[0];
      this.hueForward = true;
    }

    const r = Math.floor(127 * Math.sin(0.3 * this.hue + 0) + 128);
    const g = Math.floor(127 * Math.sin(0.3 * this.hue + 2) + 128);
    const b = Math.floor(127 * Math.sin(0.3 * this.hue + 4) + 128);

    this.color = `rgba(${r}, ${g}, ${b}, 0.32)`;
  }

  destroy() {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.fpsMeter?.stop();

    if (this.options.resize) {
      window.removeEventListener("resize", this.handleResize);
    }

    this.clear();
    this.waves = [];
  }
}

class Wave {
  constructor(owner) {
    this.owner = owner;
    this.lines = [];

    const [minSpeed, maxSpeed] = owner.options.speed;

    this.angle = [random(TAU), random(TAU), random(TAU), random(TAU)];

    this.speed = [
      random(minSpeed, maxSpeed) * randomSign(),
      random(minSpeed, maxSpeed) * randomSign(),
      random(minSpeed, maxSpeed) * randomSign(),
      random(minSpeed, maxSpeed) * randomSign(),
    ];
  }

  update() {
    this.lines.push(createLine(this));
    if (this.lines.length > this.owner.options.width) {
      this.lines.shift();
    }
  }

  draw() {
    const ctx = this.owner.ctx;
    const lines = this.lines;
    if (!lines.length) return;

    if (this.owner.options.debug) {
      this.drawDebugLine(ctx, lines[0]);
      return;
    }

    // Consecutive lines very often share an identical cached color string
    // (the shared hue only shifts every few frames), so group runs of equal
    // color into one path + one stroke() call instead of one call per line.
    let i = 0;
    while (i < lines.length) {
      const color = lines[i].color;
      ctx.beginPath();

      let j = i;
      while (j < lines.length && lines[j].color === color) {
        addLinePath(ctx, lines[j]);
        j += 1;
      }

      ctx.strokeStyle = color;
      ctx.stroke();
      i = j;
    }
  }

  drawDebugLine(ctx, line) {
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    addLinePath(ctx, line);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.cpx1, line.cpy1);
    ctx.moveTo(line.x2, line.y2);
    ctx.lineTo(line.cpx2, line.cpy2);
    ctx.stroke();
    ctx.restore();
  }
}

function addLinePath(ctx, line) {
  ctx.moveTo(line.x1, line.y1);
  ctx.bezierCurveTo(line.cpx1, line.cpy1, line.cpx2, line.cpy2, line.x2, line.y2);
}

// Computes and caches a line's final canvas-space geometry ONCE, instead of
// redoing the same 8 trig calls every frame for every buffered line
// (previously up to waves * width = 480 times per frame, forever).
function computeLineGeometry(owner, angle, color) {
  const amplitude = owner.options.amplitude;
  const rotation = owner.rotationRad;
  const radius = owner.radius;
  const radiusThird = radius / 3;
  const x = owner.centerX;
  const y = owner.centerY;

  return {
    color,
    angle,
    x1: x - radius * Math.cos(angle[0] * amplitude + rotation),
    y1: y - radius * Math.sin(angle[0] * amplitude + rotation),
    x2: x + radius * Math.cos(angle[3] * amplitude + rotation),
    y2: y + radius * Math.sin(angle[3] * amplitude + rotation),
    cpx1: x - radiusThird * Math.cos(angle[1] * amplitude * 2),
    cpy1: y - radiusThird * Math.sin(angle[1] * amplitude * 2),
    cpx2: x + radiusThird * Math.cos(angle[2] * amplitude * 2),
    cpy2: y + radiusThird * Math.sin(angle[2] * amplitude * 2),
  };
}

function createLine(wave) {
  const { angle, speed } = wave;

  angle[0] += speed[0];
  angle[1] += speed[1];
  angle[2] += speed[2];
  angle[3] += speed[3];

  const sinAngle = [
    Math.sin(angle[0]),
    Math.sin(angle[1]),
    Math.sin(angle[2]),
    Math.sin(angle[3]),
  ];

  return computeLineGeometry(wave.owner, sinAngle, wave.owner.color);
}

const random = (min, max) => {
  if (typeof max === "undefined") {
    return Math.random() * min;
  }
  return min + Math.random() * (max - min);
};

const randomSign = () => (Math.random() > 0.5 ? 1 : -1);

const degToRad = (deg) => (deg * Math.PI) / 180;
</script>

<style scoped>
canvas {
  pointer-events: none;
  width: 100%;
  height: 100%;
  display: block;
}
</style>