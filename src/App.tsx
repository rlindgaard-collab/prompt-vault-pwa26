
import React, { useEffect, useMemo, useState } from 'react'
import { useVault } from './store'
import type { PromptsJson } from './types'
import { flatten } from './lib/search'
import { PromptCard } from './components/PromptCard'
import { Toast } from './components/Toast'
import { Header } from './components/Header'

const DATA_URL = '/prompts.json'

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function App() {
  const { dark, setDark, data, setData } = useVault()
  const [activeTab, setActiveTab] = useState<string>('')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  // mobile jump state
  const [mSection, setMSection] = useState<string>('')
  const [mCategory, setMCategory] = useState<string>('')

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(DATA_URL)
        if (!res.ok) return
        const json: PromptsJson = await res.json()
        setData(json)
        if (!activeTab) setActiveTab(json[0]?.tab ?? '')
      } catch {}
    })()
  }, [])

  const allPrompts = useMemo(() => data ? flatten(data) : [], [data])
  const tabs = useMemo(() => data?.map(t => t.tab) ?? [], [data])
  const current = useMemo(() => data?.find(t => t.tab === activeTab), [data, activeTab])

  // reset mobile selectors when tab changes
  useEffect(() => {
    setMSection(current?.sections[0]?.section ?? '')
    setMCategory(current?.sections[0]?.categories[0]?.category ?? '')
  }, [activeTab, current?.sections?.length])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allPrompts
    return allPrompts.filter(p =>
      p.text.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tab.toLowerCase().includes(q) ||
      p.section.toLowerCase().includes(q))
  }, [query, allPrompts])

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200) }
    catch { alert('Kunne ikke kopiere') }
  }

  const scrollToAnchor = (section: string, category?: string) => {
    const id = category
      ? `cat-${slugify(activeTab)}-${slugify(section)}-${slugify(category)}`
      : `sec-${slugify(activeTab)}-${slugify(section)}`
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const mobileScrollSection = (sec: string) => {
    setMSection(sec)
    // reset category to first in that section
    const s = current?.sections.find(s => s.section === sec)
    const firstCat = s?.categories[0]?.category ?? ''
    setMCategory(firstCat)
    scrollToAnchor(sec) // jump to section
  }

  const mobileScrollCategory = (cat: string) => {
    setMCategory(cat)
    if (mSection) scrollToAnchor(mSection, cat)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header dark={dark} setDark={setDark} />
      <div className="flex">
        {/* Sidebar (desktop) */}
        <div className="md:fixed md:inset-y-16 md:left-0 hidden md:block">
          <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 overflow-y-auto h-[calc(100dvh-4rem)]">
            <div className="mb-3">
              <label className="block text-sm font-medium text-ink dark:text-white mb-1">Faner</label>
              <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 shadow-soft bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {tabs.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <nav className="space-y-4">
              <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sektioner & kategorier</h3>
              <div className="space-y-3">
                {current?.sections.map(sec => (
                  <div key={sec.section}>
                    <button
                      onClick={() => scrollToAnchor(sec.section)}
                      className="text-sm font-semibold text-ink dark:text-white hover:underline">
                      {sec.section}
                    </button>
                    {sec.categories.map(cat => (
                      <button
                        key={cat.category}
                        onClick={() => scrollToAnchor(sec.section, cat.category)}
                        className="block text-left text-sm text-slate-600 dark:text-slate-300 hover:underline pl-2">
                        • {cat.category}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </nav>
          </aside>
        </div>

        <main className="flex-1 md:ml-72 p-4 space-y-6">
          {/* Topbar (search + mobile selectors) */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input placeholder="Søg på tværs af alt…" value={query} onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-ink dark:text-white" />
            {/* Tab selector (mobile) */}
            <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}
              className="md:hidden rounded-2xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              {tabs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {/* Section selector (mobile) */}
            {current && (
              <select value={mSection} onChange={(e) => mobileScrollSection(e.target.value)}
                className="md:hidden rounded-2xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {current.sections.map(s => <option key={s.section} value={s.section}>{s.section}</option>)}
              </select>
            )}
            {/* Category selector (mobile) */}
            {current && (
              <select value={mCategory} onChange={(e) => mobileScrollCategory(e.target.value)}
                className="md:hidden rounded-2xl border px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {(current.sections.find(s => s.section == mSection)?.categories ?? []).map(c =>
                  <option key={c.category} value={c.category}>{c.category}</option>
                )}
              </select>
            )}
          </div>

          {/* Content */}
          {current?.sections.map((s) => (
            <section key={s.section} id={`sec-${slugify(activeTab)}-${slugify(s.section)}`} className="space-y-4 scroll-mt-20">
              <h2 className="text-xl font-semibold text-ink dark:text-white">{s.section}</h2>
              {s.categories.map((c) => (
                <div key={c.category} id={`cat-${slugify(activeTab)}-${slugify(s.section)}-${slugify(c.category)}`} className="space-y-3 scroll-mt-20">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400">{c.category}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {c.prompts.map((p, i) => (
                      <PromptCard key={i + p.slice(0,8)} text={p} onCopy={() => handleCopy(p)} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {/* Search results */}
          {query && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-ink dark:text-white">Søgeresultater</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allPrompts.filter(p => {
                  const q = query.trim().toLowerCase()
                  return p.text.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.tab.toLowerCase().includes(q) ||
                    p.section.toLowerCase().includes(q)
                }).map((p) => (
                  <PromptCard key={p.id} text={p.text} onCopy={() => handleCopy(p.text)} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Toast message="Kopieret!" show={copied} />
    </div>
  )
}
