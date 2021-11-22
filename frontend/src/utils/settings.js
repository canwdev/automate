const LS_KEY_SETTINGS = 'LS_KEY_AUTOMATE_SETTINGS'

const isSystemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

const defaultSettings = {
  isDarkTheme: isSystemDarkMode,
}

export function loadSettings() {
  const settings = JSON.parse(localStorage.getItem(LS_KEY_SETTINGS) || '{}')
  return {...defaultSettings, ...settings}
}

export function saveSettings(obj = {}) {
  localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(obj))
}
