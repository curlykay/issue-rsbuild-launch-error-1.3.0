import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routes: any[] = [
  {
    path: '/page1',
    name: 'page1',
    component: () =>
      import(/* webpackChunkName: "page1" */ '@/views/page1.vue'),
  },
  {
    path: '/page2',
    name: 'page2',

    component: () =>
      import(/* webpackChunkName: "page1" */ '@/views/page2.vue'),
    // 使用不同的webpackChunkName就不会触发构建错误
    // component: () =>
    //   import(/* webpackChunkName: "page2" */ '@/views/page2.vue'),
  },
];

export const router = new Router({
  routes,
});
