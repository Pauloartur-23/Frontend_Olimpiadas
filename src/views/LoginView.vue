<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { mdiAlertCircleOutline, mdiEmailOutline, mdiLockOutline, mdiLoginVariant } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/services/api'
import MdiIcon from '@/components/MdiIcon.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const redirectTo = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/bolao'))

function validate(): string | null {
  if (!email.value.trim()) return 'Informe seu e-mail.'
  if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) return 'Informe um e-mail válido.'
  if (!password.value) return 'Informe sua senha.'
  return null
}

async function onSubmit() {
  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }
  submitting.value = true
  errorMessage.value = ''
  try {
    await auth.login(email.value.trim(), password.value)
    router.push(redirectTo.value)
  } catch (err) {
    errorMessage.value = err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center py-6 sm:py-12">
    <span class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-600 text-white">
      <MdiIcon :path="mdiLoginVariant" :size="26" />
    </span>
    <h1 class="text-2xl font-bold tracking-tight">Entrar na conta</h1>
    <p class="mt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
      Entre para apostar no Bolão dos Jogos e acompanhar sua classificação.
    </p>

    <form class="card mt-6 w-full space-y-4 p-6" @submit.prevent="onSubmit">
      <p
        v-if="errorMessage"
        class="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400"
      >
        <MdiIcon :path="mdiAlertCircleOutline" :size="18" class="shrink-0" />
        {{ errorMessage }}
      </p>

      <label class="block">
        <span class="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">E-mail</span>
        <span class="relative flex items-center">
          <MdiIcon :path="mdiEmailOutline" :size="18" class="pointer-events-none absolute left-3 text-neutral-400" />
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="voce@exemplo.com"
          />
        </span>
      </label>

      <label class="block">
        <span class="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">Senha</span>
        <span class="relative flex items-center">
          <MdiIcon :path="mdiLockOutline" :size="18" class="pointer-events-none absolute left-3 text-neutral-400" />
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="min-h-11 w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="••••••••"
          />
        </span>
      </label>

      <button type="submit" class="btn-primary w-full" :disabled="submitting">
        {{ submitting ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
      Ainda não tem conta?
      <RouterLink :to="{ name: 'register', query: route.query }" class="font-semibold text-accent-600 hover:underline dark:text-accent-400">
        Criar conta
      </RouterLink>
    </p>
  </div>
</template>
