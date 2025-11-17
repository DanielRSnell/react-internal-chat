import { marked } from 'marked'

// Configure marked for better rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
})

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string
}
