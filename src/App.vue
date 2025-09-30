<template>
  <DashboardLayout>
    <router-view />
  </DashboardLayout>
</template>

<script>
import DashboardLayout from './layouts/DashboardLayout.vue';

export default {
  name: 'App',
  components: {
    DashboardLayout
  }
};
</script>
