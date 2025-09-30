import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SessionView from '../views/SessionView.vue';
import SessionDetail from '../views/SessionDetail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/sesiones',
      name: 'session',
      component: SessionView
    },
    {
      path: '/sesiones/:id',
      name: 'session-detail',
      component: SessionDetail
    }
  ]
});

export default router;
