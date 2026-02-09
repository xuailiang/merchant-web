import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'merchant_admin_theme'

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light') {
    return stored
  }
  return 'light'
}

export const themeMode = ref<ThemeMode>(getStoredTheme())

export const applyTheme = (mode: ThemeMode = themeMode.value) => {
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(THEME_KEY, mode)
}

export const setThemeMode = (mode: ThemeMode) => {
  themeMode.value = mode
  applyTheme(mode)
}
