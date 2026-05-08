<script setup lang="ts">
import { projects } from '@/data/resume'
import ProjectCard from '@/components/ui/ProjectCard.vue'
</script>

<template>
  <section id="projects" class="section section--alt">
    <div class="container">
      <header class="section__head">
        <span class="section__num">04</span>
        <h2 class="section__title">精选项目</h2>
      </header>
      <div class="projects">
        <ProjectCard v-for="project in projects" :key="project.title" :project="project" />
      </div>
    </div>
  </section>
</template>
