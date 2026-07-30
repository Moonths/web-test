<script setup lang="ts">
import DashboardApp from '@resume/dashboard/src/App.vue'
</script>

<template>
  <DashboardApp />
</template>

<style>
/* 大屏覆盖层——全屏无宽度限制 */
.db-root {
  max-width: none !important;
  width: 100vw !important;
}
</style>
