import { defineStore } from 'pinia'

const STORAGE_KEY = 'olimpiadas-dark-mode'

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    darkMode: getInitialDarkMode(),
    mobileDrawerOpen: false,
  }),
  actions: {
    applyDarkModeClass() {
      document.documentElement.classList.toggle('dark', this.darkMode)
    },
    initDarkMode() {
      this.applyDarkModeClass()
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem(STORAGE_KEY, String(this.darkMode))
      this.applyDarkModeClass()
    },
    setDarkMode(value: boolean) {
      this.darkMode = value
      localStorage.setItem(STORAGE_KEY, String(this.darkMode))
      this.applyDarkModeClass()
    },
    openDrawer() {
      this.mobileDrawerOpen = true
    },
    closeDrawer() {
      this.mobileDrawerOpen = false
    },
    toggleDrawer() {
      this.mobileDrawerOpen = !this.mobileDrawerOpen
    },
  },
})
