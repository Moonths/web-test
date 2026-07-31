<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="rw-footer">
    <div class="rw-footer__content">
      <div class="rw-footer__top">
        <div class="rw-footer__brand">
          <span class="rw-footer__logo">毛际可</span>
          <span class="rw-footer__tag">前端工程师</span>
        </div>
        <nav class="rw-footer__nav">
          <a href="#about">关于</a>
          <a href="#skills">技能</a>
          <a href="#experience">经历</a>
          <a href="#projects">项目</a>
          <a href="#contact">联系</a>
        </nav>
      </div>
      <div class="rw-footer__divider"></div>
      <div class="rw-footer__bottom">
        <span class="rw-footer__copyright">&copy; {{ year }} 毛际可</span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="rw-footer__beian"
        >京ICP备2026026929号</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.rw-footer {
  padding: 64px 0 40px;
  background: #06060C;
  border-top: 1px solid rgba(129, 140, 248, 0.04);
}

.rw-footer__content {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 48px;
}

.rw-footer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.rw-footer__brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.rw-footer__logo {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #F1F5F9;
  letter-spacing: -0.02em;
}

.rw-footer__tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #64748B;
  letter-spacing: 0.04em;
}

.rw-footer__nav {
  display: flex;
  gap: 24px;
}

.rw-footer__nav a {
  font-size: 13px;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
}

.rw-footer__nav a:hover {
  color: #818CF8;
}

.rw-footer__divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(129, 140, 248, 0.08), transparent);
  margin-bottom: 24px;
}

.rw-footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rw-footer__copyright {
  font-size: 13px;
  color: #475569;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
}

.rw-footer__beian {
  font-size: 12px;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s ease;
}

.rw-footer__beian:hover {
  color: #818CF8;
}

@media (max-width: 768px) {
  .rw-footer { padding: 48px 0 32px; }
  .rw-footer__content { padding: 0 24px; }
  .rw-footer__top { flex-direction: column; align-items: flex-start; gap: 24px; }
  .rw-footer__nav { gap: 16px; flex-wrap: wrap; }
  .rw-footer__bottom { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
