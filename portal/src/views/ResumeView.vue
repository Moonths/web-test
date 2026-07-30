<script setup lang="ts">
// 导入简历包的 CSS 与主组件
import '@resume/resume/src/assets/css/variables.css'
import '@resume/resume/src/assets/css/main.css'
import '@resume/resume/src/assets/css/ai-chat.css'
import '@resume/resume/src/assets/css/responsive.css'
import ResumeApp from '@resume/resume/src/App.vue'
</script>

<template>
  <ResumeApp />
</template>

<style>
/* 简历覆盖层保持居中窄版布局 */
.rw-root {
  max-width: 900px;
  margin: 0 auto;
}
</style>
