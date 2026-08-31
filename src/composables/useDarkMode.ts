import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'

export function useDarkMode() {
  const ui = useUiStore()
  const { darkMode } = storeToRefs(ui)

  return {
    darkMode,
    toggleDarkMode: ui.toggleDarkMode,
    setDarkMode: ui.setDarkMode,
  }
}
