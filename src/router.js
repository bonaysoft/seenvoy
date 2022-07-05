import { createRouter, createWebHashHistory, createWebHistory } from "vue-router"
import Overview from "./views/Overview.vue";
import Listeners from "./views/Listeners.vue";
import Routes from "./views/Routes.vue";
import Clusters from "./views/Clusters.vue";

const routes = [
  { path: '/', name: 'Home', redirect: '/overview' },
  { path: '/overview', name: 'Overview', component: Overview },
  { path: '/listeners', name: 'Listeners', component: Listeners },
  { path: '/routes', name: 'Routes', component: Routes },
  { path: '/clusters', name: 'Clusters', component: Clusters },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router;