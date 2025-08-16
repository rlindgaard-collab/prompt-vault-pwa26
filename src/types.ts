
export type PromptsJson = {
  tab: string
  sections: {
    section: string
    categories: { category: string, prompts: string[] }[]
  }[]
}[]
