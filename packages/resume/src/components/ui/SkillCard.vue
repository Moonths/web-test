<script setup lang="ts">
import type { SkillCategory } from '@/data/resume'
defineProps<{ skill: SkillCategory }>()
</script>

<template>
  <article class="skill-card">
    <h3>{{ skill.title }}</h3>
    <ul>
      <li v-for="item in skill.items" :key="item">{{ item }}</li>
    </ul>
  </article>
</template>
