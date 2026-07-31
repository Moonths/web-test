<template>
  <section id="contact" class="rw-contact">
    <div class="rw-contact__content">
      <div class="rw-contact__header" ref="headerTarget" :class="{ 'is-in': headerInView }">
        <span class="rw-contact__label rw-fade">05 · 联系</span>
        <h2 class="rw-contact__title">
          <span class="rw-line"><span class="rw-line__inner">保持<span class="rw-contact__title-accent">联系</span></span></span>
        </h2>
        <p class="rw-contact__lead rw-fade">
          如果你有合作机会或想进一步了解我的经历，欢迎随时联系。
        </p>
      </div>

      <div class="rw-contact__methods">
        <a href="mailto:moonths@yeah.net" class="contact-card">
          <div class="contact-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M22 4L12 13L2 4"/>
            </svg>
          </div>
          <div class="contact-card__info">
            <span class="contact-card__label">电子邮箱</span>
            <span class="contact-card__value">moonths@yeah.net</span>
          </div>
          <div class="contact-card__arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>

        <div class="contact-card contact-card--static">
          <div class="contact-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="contact-card__info">
            <span class="contact-card__label">所在城市</span>
            <span class="contact-card__value">北京</span>
          </div>
        </div>
      </div>

      <div class="rw-contact__cta">
        <a href="mailto:moonths@yeah.net" class="cta-btn">
          发送邮件
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
        <a
          href="https://maojike.oss-cn-beijing.aliyuncs.com/%E6%AF%9B%E9%99%85%E5%8F%AF_%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%88%E7%AE%80%E5%8E%86.docx"
          download="毛际可_前端工程师简历.docx"
          target="_blank"
          rel="noopener noreferrer"
          class="cta-btn cta-btn--outline"
        >
          下载简历
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useInView } from '@/composables/useScrollMotion'

const { target: headerTarget, inView: headerInView } = useInView(0.3)
</script>

<style scoped>
.rw-contact {
  padding: 140px 0 100px;
  background: #08080E;
  position: relative;
  overflow: hidden;
}

.rw-contact::before {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(79,70,229,0.03), transparent 70%);
  pointer-events: none;
}

.rw-contact__content {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 48px;
  text-align: center;
}

.rw-contact__header {
  margin-bottom: 48px;
}

.rw-contact__label {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #818CF8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 20px;
  position: relative;
  padding-left: 32px;
}

.rw-contact__label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 20px;
  height: 1.5px;
  background: #818CF8;
  transform: translateY(-50%);
}

.rw-contact__title {
  font-family: 'Syne', 'PingFang SC', sans-serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;
  color: #F1F5F9;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}

.rw-contact__title-accent {
  background: linear-gradient(135deg, #818CF8, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rw-contact__lead {
  font-size: 15px;
  line-height: 1.7;
  color: #64748B;
}

/* ── Contact methods ── */
.rw-contact__methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
  text-align: left;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(15, 15, 25, 0.5);
  border: 1px solid rgba(129, 140, 248, 0.06);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;
}

.contact-card:hover {
  background: rgba(15, 15, 25, 0.8);
  border-color: rgba(129, 140, 248, 0.15);
}

.contact-card--static {
  cursor: default;
}

.contact-card--static:hover {
  background: rgba(15, 15, 25, 0.5);
  border-color: rgba(129, 140, 248, 0.06);
}

.contact-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(129, 140, 248, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818CF8;
  flex-shrink: 0;
}

.contact-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-card__label {
  font-size: 12px;
  color: #64748B;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
}

.contact-card__value {
  font-size: 15px;
  color: #E2E8F0;
  font-weight: 500;
}

.contact-card__arrow {
  color: rgba(129, 140, 248, 0.2);
  transition: color 0.25s ease, transform 0.25s ease;
}

.contact-card:hover .contact-card__arrow {
  color: #818CF8;
  transform: translateX(4px);
}

/* ── CTA ── */
.rw-contact__cta {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Syne', 'PingFang SC', sans-serif;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1.5px solid #818CF8;
  background: #818CF8;
  color: #08080E;
}

.cta-btn:hover {
  background: #6366F1;
  border-color: #6366F1;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(129,140,248,0.25);
}

.cta-btn--outline {
  background: transparent;
  color: #818CF8;
  border-color: rgba(129, 140, 248, 0.2);
}

.cta-btn--outline:hover {
  background: rgba(129, 140, 248, 0.06);
  border-color: #818CF8;
  box-shadow: none;
}

@media (max-width: 768px) {
  .rw-contact { padding: 100px 0 80px; }
  .rw-contact__content { padding: 0 24px; }
  .rw-contact__title { font-size: 32px; }
  .rw-contact__cta { flex-direction: column; }
}

@media (max-width: 480px) {
  .rw-contact { padding: 80px 0 60px; }
  .rw-contact__title { font-size: 28px; }
  .contact-card { padding: 16px 20px; }
}
</style>
