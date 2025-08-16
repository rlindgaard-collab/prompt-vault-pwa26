
import React from 'react'
export function Header({ dark, setDark }: { dark: boolean, setDark: (v: boolean) => void }) {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-6 rounded bg-accent"></div>
        <h1 className="font-semibold text-ink dark:text-white">Prompt Vault</h1>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setDark(!dark)}
          className="px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-soft"
          title="Toggle theme">{dark ? '🌙' : '☀️'}</button>
        <button onClick={() => {
          if ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches) {
            alert('Allerede installeret som app ✅')
          } else {
            alert('Tip: Brug browserens menu for at installere på hjemskærmen.')
          }
        }} className="px-3 py-1.5 rounded-2xl bg-accent text-white">Installer</button>
      </div>
    </header>
  )
}
