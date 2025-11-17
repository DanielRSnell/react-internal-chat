import { marked } from 'marked'

// Configure marked for better rendering
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
})

// Custom renderer to add target="_blank" to all links
const renderer = new marked.Renderer()

renderer.link = function(href, title, text) {
  const link = marked.Renderer.prototype.link.call(this, href, title, text)
  return link.replace('<a', '<a target="_blank" rel="noopener noreferrer"')
}

marked.use({ renderer })

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string
}
