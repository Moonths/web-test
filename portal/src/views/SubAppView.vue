<template>
  <div class="portal-subapp">
    <div id="subapp-viewport"></div>
  </div>
</template>

<style scoped>
.portal-subapp {
  width: 100%;
  min-height: calc(100vh - var(--portal-header-h, 64px));
}

#subapp-viewport {
  width: 100%;
  min-height: inherit;
}
</style>
