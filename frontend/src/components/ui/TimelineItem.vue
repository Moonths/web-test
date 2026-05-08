<script setup lang="ts">
import type { TimelineItem } from '@/data/resume'
defineProps<{ item: TimelineItem }>()
</script>

<template>
  <li class="timeline__item">
    <div class="timeline__meta">
      <time>{{ item.period }}</time>
      <span class="timeline__company">{{ item.company }}</span>
    </div>
    <div class="timeline__body">
      <h3>{{ item.role }}</h3>
      <ul>
        <li v-for="(bullet, i) in item.bullets" :key="i">{{ bullet }}</li>
      </ul>
    </div>
  </li>
</template>
