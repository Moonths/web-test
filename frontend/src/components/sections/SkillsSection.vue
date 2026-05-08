<script setup lang="ts">
import { skills } from '@/data/resume'
import SkillCard from '@/components/ui/SkillCard.vue'
</script>

<template>
  <section id="skills" class="section section--alt">
    <div class="container">
      <header class="section__head">
        <span class="section__num">02</span>
        <h2 class="section__title">技能栈</h2>
      </header>
      <div class="skills">
        <SkillCard v-for="skill in skills" :key="skill.title" :skill="skill" />
      </div>
    </div>
  </section>
</template>
