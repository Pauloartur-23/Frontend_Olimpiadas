import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: 'jogos', name: 'matches', component: () => import('@/views/MatchesView.vue') },
        { path: 'jogos/:id', name: 'match-detail', component: () => import('@/views/MatchDetailView.vue'), props: true },
        { path: 'hoje', name: 'today', component: () => import('@/views/TodayView.vue') },
        { path: 'equipes', name: 'teams', component: () => import('@/views/TeamsView.vue') },
        { path: 'equipes/:slug', name: 'team-detail', component: () => import('@/views/TeamDetailView.vue'), props: true },
        {
          path: 'classificacao',
          name: 'standings',
          component: () => import('@/views/StandingsView.vue'),
        },
        { path: 'modalidades', name: 'sports', component: () => import('@/views/SportsView.vue') },
        { path: 'modalidades/:slug', name: 'sport-detail', component: () => import('@/views/SportDetailView.vue'), props: true },
        { path: 'login', name: 'login', component: () => import('@/views/LoginView.vue') },
        {
          path: 'admin/resultados',
          name: 'admin-results',
          component: () => import('@/views/admin/AdminResultsView.vue'),
          meta: { requiresAuth: true, requiresStaff: true },
        },
        { path: ':pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresStaff && !auth.isStaff) {
    return auth.isAuthenticated ? { name: 'home', query: { aviso: 'acesso-restrito' } } : { name: 'login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
