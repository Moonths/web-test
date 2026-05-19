<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <p>&copy; {{ year }} 毛际可. 前端工程师.</p>
      <p class="icp-beian">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          京ICP备2026026929号
        </a>
      </p>
    </div>
  </footer>
</template>
