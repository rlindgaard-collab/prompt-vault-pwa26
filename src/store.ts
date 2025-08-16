
import { create } from 'zustand'
import type { PromptsJson } from './types'

type State = {
  dark: boolean
  setDark: (v: boolean) => void
  data: PromptsJson | null
  setData: (d: PromptsJson) => void
}

export const useVault = create<State>((set) => ({
  dark: (localStorage.getItem('pv_dark') ?? 'false') === 'true',
  setDark: (v) => { localStorage.setItem('pv_dark', String(v)); set({ dark: v }) },
  data: (() => {
    try { const raw = localStorage.getItem('pv_json'); return raw ? JSON.parse(raw) : null } catch { return null }
  })(),
  setData: (d) => { try { localStorage.setItem('pv_json', JSON.stringify(d)) } catch {}; set({ data: d }) },
}))
