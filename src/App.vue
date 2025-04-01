<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="content">
    root
    <RouterLink :to="{ path: '/page1' }"> page1 </RouterLink>
    <RouterLink :to="{ path: '/page2' }"> page2 </RouterLink>
    <RouterView></RouterView>
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  min-height: 100vh;
  line-height: 1.1;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}

.content h1 {
  font-size: 3.6rem;
  font-weight: 700;
}

.content p {
  font-size: 1.2rem;
  font-weight: 400;
  opacity: 0.5;
}
</style>
