
import type { PromptsJson } from '../types'

export function flatten(data: PromptsJson) {
  const out: { id: string, text: string, tab: string, section: string, category: string }[] = []
  const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
  for (const tab of data) {
    for (const sec of tab.sections) {
      for (const cat of sec.categories) {
        for (const p of cat.prompts) {
          out.push({ id: uuid(), text: p, tab: tab.tab, section: sec.section, category: cat.category })
        }
      }
    }
  }
  return out
}
