<script setup lang="ts">
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  mdiAccountCircle,
  mdiCalendarMonth,
  mdiChevronDown,
  mdiClipboardTextOutline,
  mdiClockOutline,
  mdiClose,
  mdiFormatListBulleted,
  mdiHome,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiMedal,
  mdiMenu,
  mdiShieldAccount,
  mdiTrophy,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js'
import { useUiStore } from '@/stores/ui'
import { useMatchesStore } from '@/stores/matches'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import MdiIcon from '@/components/MdiIcon.vue'

const ui = useUiStore()
const matchesStore = useMatchesStore()
const auth = useAuthStore()
const { darkMode, toggleDarkMode } = useDarkMode()
const route = useRoute()
const router = useRouter()

const navLinks = computed(() => [
  { to: '/', label: 'Início', icon: mdiHome },
  { to: '/jogos', label: 'Jogos', icon: mdiFormatListBulleted },
  { to: '/hoje', label: 'Hoje', icon: mdiClockOutline },
  { to: '/equipes', label: 'Equipes', icon: mdiShieldAccount },
  { to: '/classificacao', label: 'Classificação', icon: mdiTrophy },
  { to: '/modalidades', label: 'Modalidades', icon: mdiMedal },
])

const userMenuOpen = ref(false)
function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}
function closeUserMenu() {
  userMenuOpen.value = false
}
function onLogout() {
  closeUserMenu()
  auth.logout()
  router.push('/')
}

const bottomNavLinks = computed(() => [
  { to: '/', label: 'Início', icon: mdiHome },
  { to: '/jogos', label: 'Jogos', icon: mdiFormatListBulleted },
  { to: '/classificacao', label: 'Ranking', icon: mdiTrophy },
  { to: '/equipes', label: 'Equipes', icon: mdiShieldAccount },
])

const isActive = (path: string) => (path === '/' ? route.path === '/' : route.path.startsWith(path))
const currentYear = computed(() => new Date().getFullYear())

// Sombra/borda do header só aparece depois que a página rola um pouco —
// evita uma borda "flutuando" sobre o hero no topo da Home.
const isScrolled = ref(false)
function onScroll() {
  isScrolled.value = window.scrollY > 4
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  // Carrega contadores leves (jogos ao vivo / hoje) para a faixa superior do
  // header — só se ainda não tiverem sido carregados por outra tela.
  if (!matchesStore.liveLoading && matchesStore.live.length === 0) matchesStore.fetchLive()
  if (!matchesStore.todayLoading && matchesStore.today.length === 0) matchesStore.fetchToday()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const liveCount = computed(() => matchesStore.live.length)
const todayCount = computed(() => matchesStore.today.length)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-40 bg-white/95 backdrop-blur transition-shadow duration-200 dark:bg-neutral-950/95"
      :class="isScrolled ? 'shadow-md shadow-black/5 dark:shadow-black/30' : ''"
    >
      <!-- Faixa superior fina (desktop) -->
      <div class="hidden bg-accent-900 text-white lg:block">
        <div class="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-6 text-xs font-medium">
          <span class="flex items-center gap-1.5 text-accent-100">
            <MdiIcon :path="mdiCalendarMonth" :size="14" />
            01–03 de setembro de 2026 · IFC Araquari
          </span>
          <RouterLink
            v-if="liveCount > 0"
            to="/jogos?quick=live"
            class="flex items-center gap-1.5 font-bold text-red-300 transition-colors hover:text-red-200"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400"></span>
            </span>
            {{ liveCount }} {{ liveCount === 1 ? 'jogo ao vivo agora' : 'jogos ao vivo agora' }}
          </RouterLink>
          <span v-else-if="todayCount > 0" class="text-accent-200">{{ todayCount }} jogo(s) hoje</span>
        </div>
      </div>

      <!-- Navegação principal -->
      <div class="border-b border-neutral-200/80 dark:border-neutral-800">
        <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-17">
          <RouterLink to="/" class="flex shrink-0 items-center gap-2 font-extrabold tracking-tight">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white lg:h-10 lg:w-10">
              <MdiIcon :path="mdiTrophy" :size="20" />
            </span>
            <span class="hidden text-sm leading-tight sm:block">
              Olimpíadas<br class="leading-none" />
              <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">IFC Araquari 2026</span>
            </span>
          </RouterLink>

          <nav class="hidden items-center gap-1 lg:flex">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              :class="
                isActive(link.to)
                  ? 'text-accent-700 dark:text-accent-400'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              "
            >
              <MdiIcon :path="link.icon" :size="17" />
              {{ link.label }}
              <span
                v-if="isActive(link.to)"
                class="absolute inset-x-2 -bottom-4.25 h-0.5 rounded-full bg-accent-600 dark:bg-accent-400"
              ></span>
            </RouterLink>
            <RouterLink
              v-if="auth.isStaff"
              to="/admin/resultados"
              class="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              :class="
                isActive('/admin')
                  ? 'text-accent-700 dark:text-accent-400'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              "
            >
              <MdiIcon :path="mdiClipboardTextOutline" :size="17" />
              Lançar resultados
            </RouterLink>
          </nav>

          <div class="flex items-center gap-2">
            <RouterLink
              v-if="liveCount > 0"
              to="/jogos?quick=live"
              class="hidden items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 lg:flex dark:bg-red-500/10 dark:text-red-400"
            >
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
              </span>
              AO VIVO
            </RouterLink>

            <!-- Autenticação (desktop) -->
            <div v-if="auth.isAuthenticated" class="relative hidden lg:block">
              <button
                type="button"
                class="flex min-h-11 items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                @click="toggleUserMenu"
              >
                <MdiIcon :path="mdiAccountCircle" :size="19" />
                <span class="max-w-32 truncate">{{ auth.user?.name }}</span>
                <MdiIcon :path="mdiChevronDown" :size="15" />
              </button>
              <Transition name="fade">
                <div
                  v-if="userMenuOpen"
                  class="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    @click="onLogout"
                  >
                    <MdiIcon :path="mdiLogoutVariant" :size="17" />
                    Sair
                  </button>
                </div>
              </Transition>
              <div v-if="userMenuOpen" class="fixed inset-0 z-20" @click="closeUserMenu"></div>
            </div>
            <div v-else class="hidden items-center gap-2 lg:flex">
              <RouterLink to="/login" class="btn-primary min-h-11 px-4 py-2 text-sm">Entrar</RouterLink>
            </div>

            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              :aria-label="darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'"
              @click="toggleDarkMode"
            >
              <MdiIcon :path="darkMode ? mdiWhiteBalanceSunny : mdiWeatherNight" :size="20" />
            </button>
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 lg:hidden dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              aria-label="Abrir menu"
              @click="ui.toggleDrawer"
            >
              <MdiIcon :path="mdiMenu" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile drawer -->
    <Transition name="fade">
      <div v-if="ui.mobileDrawerOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="ui.closeDrawer" />
        <div class="pb-safe absolute right-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl dark:bg-neutral-900">
          <div class="mb-4 flex items-center justify-between">
            <span class="font-bold">Menu</span>
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800" aria-label="Fechar menu" @click="ui.closeDrawer">
              <MdiIcon :path="mdiClose" :size="20" />
            </button>
          </div>
          <nav class="flex flex-col gap-1">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors"
              :class="
                isActive(link.to)
                  ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              "
              @click="ui.closeDrawer"
            >
              <MdiIcon :path="link.icon" :size="18" />
              {{ link.label }}
            </RouterLink>
            <RouterLink
              v-if="auth.isStaff"
              to="/admin/resultados"
              class="flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors"
              :class="
                isActive('/admin')
                  ? 'bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              "
              @click="ui.closeDrawer"
            >
              <MdiIcon :path="mdiClipboardTextOutline" :size="18" />
              Lançar resultados
            </RouterLink>

            <div class="my-2 border-t border-neutral-200 dark:border-neutral-800"></div>

            <template v-if="auth.isAuthenticated">
              <div class="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                <MdiIcon :path="mdiAccountCircle" :size="18" />
                {{ auth.user?.name }}
              </div>
              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                @click="
                  () => {
                    ui.closeDrawer()
                    onLogout()
                  }
                "
              >
                <MdiIcon :path="mdiLogoutVariant" :size="18" />
                Sair
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="flex min-h-11 items-center gap-3 rounded-xl bg-accent-50 px-3 py-3 text-sm font-semibold text-accent-700 dark:bg-accent-500/10 dark:text-accent-400"
                @click="ui.closeDrawer"
              >
                <MdiIcon :path="mdiLoginVariant" :size="18" />
                Entrar
              </RouterLink>
            </template>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- Content -->
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="hidden border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 lg:block dark:border-neutral-800 dark:text-neutral-400">
      <p>Olimpíadas Internas dos Cursos Técnicos — IFC Araquari {{ currentYear }}</p>
    </footer>

    <!-- Bottom nav (mobile/tablet) -->
    <nav class="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
      <div class="grid" :style="{ gridTemplateColumns: `repeat(${bottomNavLinks.length + 1}, minmax(0, 1fr))` }">
        <RouterLink
          v-for="link in bottomNavLinks"
          :key="link.to"
          :to="link.to"
          class="relative flex min-h-12 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors duration-150 active:bg-neutral-100 dark:active:bg-neutral-900"
          :class="isActive(link.to) ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-500 dark:text-neutral-400'"
        >
          <span
            v-if="isActive(link.to)"
            class="absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent-600 dark:bg-accent-400"
          ></span>
          <MdiIcon :path="link.icon" :size="20" />
          {{ link.label }}
        </RouterLink>
        <button
          type="button"
          class="flex min-h-12 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-neutral-500 transition-colors duration-150 active:bg-neutral-100 dark:text-neutral-400 dark:active:bg-neutral-900"
          @click="ui.toggleDrawer"
        >
          <MdiIcon :path="mdiMenu" :size="20" />
          Menu
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
