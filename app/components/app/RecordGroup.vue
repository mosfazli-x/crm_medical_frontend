<template>
  <template v-if="items.length">
    <div class="app-section">
      <h2>
        <Icon :name="icon" size="16" class="rg-icon" />
        {{ title }}
      </h2>
      <span class="app-muted" style="font-size: 12px; font-weight: 600;">{{ pn(items.length) }}</span>
    </div>
    <section class="app-card rg">
      <div v-for="item in items" :key="item.id" class="rg__row">
        <span class="rg__dot" :class="`rg__dot--${tint}`" aria-hidden="true" />
        <div class="rg__body">
          <span class="rg__title">{{ item.title }}</span>
          <span v-if="item.sub" class="rg__sub">{{ item.sub }}</span>
        </div>
        <span v-if="item.tag" class="app-pill" :class="`app-pill--${item.tone || tint}`">{{ item.tag }}</span>
      </div>
    </section>
  </template>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  tint?: 'green' | 'indigo' | 'amber' | 'rose' | 'teal' | 'neutral'
  items: Array<{ id: string; title: string; sub?: string; tag?: string; tone?: string }>
}>()

const { pn } = useLang()
</script>

<style scoped>
.rg {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rg__row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--app-border);
}

.rg__row:last-child {
  border-bottom: none;
}

.rg__dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.rg__dot--green { background: var(--app-income); }
.rg__dot--indigo { background: var(--app-indigo); }
.rg__dot--amber { background: var(--app-amber); }
.rg__dot--rose { background: var(--app-expense); }
.rg__dot--teal { background: var(--app-brand); }
.rg__dot--neutral { background: var(--app-muted); }

.rg__body {
  flex: 1 1 auto;
  min-width: 0;
}

.rg__title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  overflow-wrap: anywhere;
}

.rg__sub {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--app-muted);
}

.rg-icon {
  vertical-align: -3px;
  margin-inline-end: 6px;
  color: var(--app-muted);
}
</style>
