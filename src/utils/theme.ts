export function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') ?? 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

export function initTheme() {
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
  setTheme(saved || 'light');
}
