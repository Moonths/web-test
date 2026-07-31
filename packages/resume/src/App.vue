<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import BannerHero from '@/components/sections/BannerHero.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import ExperienceSection from '@/components/sections/ExperienceSection.vue'
import ProjectsSection from '@/components/sections/ProjectsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import AiChatWidget from '@/components/AiChatWidget.vue'
</script>

<template>
  <div class="rw-root">
    <main>
      <BannerHero />
      <AboutSection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </main>
    <AppFooter />
    <AiChatWidget />
  </div>
</template>
