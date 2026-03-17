export const THEME_COLORS = [
  { name: 'Indigo',  value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose',    value: '#f43f5e' },
  { name: 'Amber',   value: '#f59e0b' },
  { name: 'Sky',     value: '#0ea5e9' },
  { name: 'Violet',  value: '#8b5cf6' },
];

export function applyTheme(color) {
  document.documentElement.style.setProperty('--accent', color);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  localStorage.setItem('theme-color', color);
}

export function loadTheme() {
  const color = localStorage.getItem('theme-color') ?? '#6366f1';
  applyTheme(color);
  return color;
}
