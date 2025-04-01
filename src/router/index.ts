import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes: any[] = [
  {
    path: '/page1',
    name: 'page1',
    component: () =>
      import(/* webpackChunkName: "devTools" */ '@/views/page1.vue'),
  },
  {
    path: '/page2',
    name: 'page2',
    component: () =>
      import(/* webpackChunkName: "devTools" */ '@/views/page2.vue'),
  },
];

export const router = new Router({
  routes,
});
