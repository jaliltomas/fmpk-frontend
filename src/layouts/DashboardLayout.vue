<template>
  <div class="min-h-screen bg-slate-100">
    <AppHeader />
    <AppSidebar />
    <main class="pt-28 pl-64">
      <div class="max-w-6xl mx-auto px-8 pb-16">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue';
import AppSidebar from '../components/AppSidebar.vue';

export default {
  name: 'DashboardLayout',
  components: {
    AppHeader,
    AppSidebar
  }
};
</script>
