<script setup lang="ts">
import type { Project } from '@/data/resume'
defineProps<{ project: Project }>()
</script>

<template>
  <article class="project-card">
    <h3>{{ project.title }}</h3>
    <p class="project-card__desc">{{ project.desc }}</p>
    <ul class="project-card__tags">
      <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
    </ul>
  </article>
</template>
