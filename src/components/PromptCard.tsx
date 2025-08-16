
import React from 'react'
export function PromptCard({ text, onCopy }: { text: string, onCopy: () => void }) {
  return (
    <button onClick={onCopy}
      className="text-left w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-soft transition focus:outline-none focus:ring-2 focus:ring-accent">
      <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{text}</div>
    </button>
  )
}
