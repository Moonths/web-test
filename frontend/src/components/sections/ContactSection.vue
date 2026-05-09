<template>
  <section id="contact" class="section">
    <div class="container contact">
      <header class="section__head">
        <span class="section__num">05</span>
        <h2 class="section__title">联系我</h2>
      </header>
      <p class="contact__lead">如果你有合作机会或想进一步了解我的经历，欢迎随时联系。</p>
      <ul class="contact__list">
        <li><a href="mailto:moonths@yeah.net">moonths@yeah.net</a></li>
        <li><span class="contact__location">📍 北京</span></li>
      </ul>
      <a class="btn btn--primary" href="mailto:moonths@yeah.net">发送邮件</a>
    </div>
  </section>
</template>

<style scoped>
.contact__location {
  font-size: var(--fs-sm);
  color: var(--color-text-soft);
  font-weight: 500;
}
</style>
