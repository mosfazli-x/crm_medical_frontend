<template>
  <v-card class="flex items-center p-5" :class="bgClass">
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
const props = defineProps({
  title: String,
  value: String,
  icon: String,
  color: String
});

const bgClass = `bg-${props.color}-600`;
</script>
