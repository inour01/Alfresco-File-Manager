import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/LoginPage.vue';
import AppPage from '@/App.vue';
import FileUpload from '@/components/FileUpload.vue';
import NodeChildrenTable from '@/components/NodeChildrenTable.vue';

const routes = [
  { path: '/', redirect: '/app' }, // Redirect to /app if authenticated
  { path: '/login', component: LoginPage },
  { path: '/app', component: AppPage, meta: { requiresAuth: true } },
  { path: '/app', component: NodeChildrenTable },
  { path: '/app', component: FileUpload }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
