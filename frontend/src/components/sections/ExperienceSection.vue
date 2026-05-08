<script setup lang="ts">
import { experience } from '@/data/resume'
import TimelineItem from '@/components/ui/TimelineItem.vue'
</script>

<template>
  <section id="experience" class="section">
    <div class="container">
      <header class="section__head">
        <span class="section__num">03</span>
        <h2 class="section__title">工作经历</h2>
      </header>
      <ol class="timeline">
        <TimelineItem v-for="item in experience" :key="item.period" :item="item" />
      </ol>
    </div>
  </section>
</template>
