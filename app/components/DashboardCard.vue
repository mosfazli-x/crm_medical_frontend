<template>
  <v-card class="flex items-center p-5" :class="[bgClass, darkBgClass]">
    <v-icon size="36" class="mr-4">{{ icon }}</v-icon>
    <div>
      <div class="text-xl font-semibold text-white">
        {{ value }}
      </div>
      <div class="text-sm text-white/80">
        {{ title }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: String,
  icon: String,
  color: String
});

const bgClass = `bg-${props.color}-600`;

const darkBgMap = {
  blue: 'dark:bg-blue-800',
  green: 'dark:bg-green-800',
  red: 'dark:bg-red-800',
  orange: 'dark:bg-orange-800',
  purple: 'dark:bg-purple-800',
  teal: 'dark:bg-teal-800',
  indigo: 'dark:bg-indigo-800',
  pink: 'dark:bg-pink-800',
  yellow: 'dark:bg-yellow-800',
};

const darkBgClass = computed(() => darkBgMap[props.color] || '');
</script>